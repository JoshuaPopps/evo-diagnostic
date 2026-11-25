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
    crimped: "crimped", basenuts: "base nuts"
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
