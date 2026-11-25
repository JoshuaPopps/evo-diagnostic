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
    internal: "internal"
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
