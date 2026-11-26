/* The Evo Diagnostic — tree scoring (pure functions, testable in Node).
   One bump path: a "yes" on a step adds exactly 15 to the single cause
   whose name contains the mapped keyword. A "no", a "next", or an
   unmapped value changes nothing. No double-counting. */
const ED_Scoring = (() => {
  const YES_MAP = {
    lean: "jet", "intake-leak": "intake leak", "main-lean": "main jet",
    battery: "battery", starter: "starter", ignition: "ignition", fuel: "fuel",
    charging: "regulator", draw: "parasitic", stator: "stator", regulator: "regulator",
    hot: "coil", plugs: "plugs", timing: "timing", voes: "voes",
    leak: "leak", air: "air", pads: "pads", chain: "chain", clutch: "clutch",
    belt: "belt", lifter: "lifter", knock: "rod knock", oil: "rod knock",
    pressure: "pressure", age: "age", wear: "bearings", mixture: "intermediate",
    "oil-level": "low oil level", drag: "drag", cable: "cable",
    fuse: "fuse", bulb: "bulb", ground: "ground",
    float: "float", enrichener: "enrichener", needle: "needle jet",
    "air-cleaner": "air cleaner", "main-rich": "main jet",
    "clutch-drag": "clutch drag", linkage: "linkage", pawl: "pawl",
    internal: "internal",
    /* Library sweep (Nov 24-25, 2026): magazine + Sportster/Clymer causes.
       Each keyword must occur in exactly one cause name within its tree. */
    turncount: "turn-count", advance: "advance mechanism",
    pumpjet: "pump jet", vent: "vent",
    jackshaft: "jackshaft", vacuum: "vacuum petcock",
    grounded: "grounded", masquerade: "masquerading",
    spare: "spare spark", trigger: "trigger plate",
    hose: "hose", aerate: "aerating",
    anchor: "anchor-plate", solenoid: "solenoid seal",
    screen: "screen", hiss: "hiss",
    steering: "steering-head", forkoil: "fork oil",
    wetsump: "wet-sumping", vanish: "vanishing",
    dished: "dished", gummed: "gummed",
    flicker: "flicker",
    lever: "lever set too low", offcenter: "off-center",
    /* Tech Tips Vol. 3 (Nov 25, 2026). Same rule: each word must occur in
       exactly one cause name within its tree. */
    reversion: "reversion", stuck: "stuck",
    breather: "breather timing", drain: "drain passage", spotface: "spotface",
    knockback: "knock-back", spoke: "spoke", track: "track",
    crimped: "crimped", basenuts: "base nuts",
    /* Smoking / oil-consumption tree (batch 2, Nov 25, 2026). Same rule.
       "rings-gasket" maps to the head gasket only: the wet test (step 5)
       already separates rings, so after a no-rise wet test, air through the
       timing hole points at the gasket. Step 1 ("smoke-color") is left
       unmapped on purpose and the draft's key was changed to "next" —
       scoring only bumps on a YES, and a blue-gray YES must never bump
       the white-steam cause. */
    overfill: "overfill", seals: "guide seals", rings: "rings",
    "exhaust-valve": "exhaust valve", "intake-valve": "intake valve",
    "rings-gasket": "head gasket", "over-rev": "over-rev",
    /* Fix-them-all batch, Nov 25, 2026 (A3): ER_153 §27 ladder + ER_267 §43
       warm-restart O-rings. Each word must occur in exactly one cause name
       within its tree. "ladder" and "o-rings" are unique to the two new
       lean-idle causes. ("lean" -> "jet" now hits 5 causes in lean-idle —
       the pre-existing coarse screen, all of them jet-size causes.) */
    orings: "o-rings", ladder: "ladder",
    /* Tech Tips Vols 1, 2, 4 + The Biker (batch 2 "overlooked", Nov 25, 2026).
       Same rule: each word must occur in exactly one cause name within
       its tree. "bowl breather" is distinct from "breather timing"
       (oil-leak tree) — the word, not the yes key, is what gets matched. */
    carryover: "carryover",
    "bowl-breather": "bowl breather", screens: "screens",
    weave: "weave", pushrod: "pushrod",
    /* Go-crazy build (Nov 25, 2026): Sportster 1986-2003 Troubleshooting
       Manual trees. Same rule: each word must occur in exactly one cause
       name within its tree. "solenoid-stick" (not "solenoid") — the old
       "solenoid" key maps to "solenoid seal" for the oil-leak tree, which
       does not occur in the starter tree. */
    backlight: "backlighting", odometer: "odometer",
    "speedo-power": "open wiring", speedometer: "head failed",
    "speed-sensor": "steady voltage", wiring: "intermittent",
    "plug-wires": "wire damage",
    "cancel-module": "won't cancel", bulbs: "bulb failed",
    "module-power": "bad ground",
    "switch-right": "right turn signal switch",
    "switch-left": "left turn signal switch",
    "wiring-right": "right-side lamps", "wiring-left": "left-side lamps",
    module: "won't flash",
    "air-filter": "air filter", "brake-drag": "dragging",
    overheating: "overheating", "fuel-supply": "fuel supply",
    "vacuum-piston": "vacuum piston", "high-speed": "high speeds",
    "low-speed": "low speeds", "engine-condition": "poor engine condition",
    muffler: "muffler", "oil-circulation": "not circulating",
    "carb-lean": "running lean", "valves-carbon": "carbon deposits",
    "switch-relay": "starter relay", "ring-gear": "ring gear",
    grinding: "grinding", "solenoid-stick": "sticking solenoid",
    /* Round 3 (Nov 25, 2026): trouble-manual gap-fills. Same rule: each
       word must occur in exactly one cause name within its tree. */
    seized: "seized", "poor-condition": "engine condition",
    /* Round 4 (Nov 25, 2026): check-engine-light tree (Figs. 62-64).
       Same rule. "no-start-branch" is bumped by the step-3 yes (the
       simultaneity question) as well as documented on the step-2 no,
       like "solenoid-stick" in the starter tree; "lamp-led" the same
       way (step-6 yes, step-5 no). A no never bumps — the no-routing
       is flowchart documentation only, as in the speedometer tree. */
    "stuck-on": "stuck on", "no-start-branch": "won't start",
    "module-dead": "module failed", "wire-upstream": "shorted to voltage",
    "wire-lamp-feed": "feeding the lamp", "lamp-led": "led itself"
  };
  function applyAnswer(weights, causes, yesValue, answeredYes) {
    if (!answeredYes || !yesValue || yesValue === "next") return weights;
    const word = YES_MAP[yesValue];
    if (!word) return weights;
    const out = Object.assign({}, weights);
    causes.forEach((c) => {
      if (c.cause.toLowerCase().includes(word)) out[c.cause] = (out[c.cause] || 0) + 15;
    });
    return out;
  }
  const api = { YES_MAP, applyAnswer };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Scoring = ED_Scoring;
