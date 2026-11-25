/* The Evo Diagnostic — wizard front step (batch 2, Nov 25, 2026).
   Pure functions, testable in Node. The wizard narrows tree choice by
   WHERE on the bike; WHEN it happens and HOW URGENT it is are recorded
   and shown back to the rider, but they do not filter trees — no data in
   the library supports filtering by when, and inventing a mapping would
   be a guess. Urgency "roadside" reorders the suggestions so trees with
   a critical-urgency cause come first (data-driven: cause urgency is in
   the tree data). Trees stay directly accessible — the wizard only
   suggests; it never hides a tree. */
const ED_Wizard = (() => {
  const AREAS = {
    engine: ["engine-noise", "oil-leak", "smoking-oil-consumption"],
    electrical: ["charging", "ignition-misfire", "lights", "no-start"],
    chassis: ["wheels-tires", "primary-drive"],
    fuel: ["carb-lean-idle", "carb-rich-flood"],
    transmission: ["transmission-shifting", "clutch"],
    brakes: ["brakes"],
    other: null /* all trees, no narrowing */
  };
  const AREA_LABELS = {
    engine: "Engine", electrical: "Electrical", chassis: "Chassis",
    fuel: "Fuel", transmission: "Transmission", brakes: "Brakes",
    other: "Somewhere else"
  };
  const WHEN_LABELS = {
    idle: "at idle", speed: "at speed", cold: "on a cold start",
    hot: "on a hot engine", always: "always"
  };
  const URGENCY_LABELS = {
    routine: "Routine", soon: "Soon", roadside: "Roadside — right now"
  };
  /* Returns the suggested trees, in order. Unknown area -> all trees. */
  function suggest(area, urgency, trees) {
    const ids = Object.prototype.hasOwnProperty.call(AREAS, area) ? AREAS[area] : null;
    let list = ids ? trees.filter((t) => ids.indexOf(t.id) !== -1) : trees.slice();
    if (urgency === "roadside") {
      const rank = (t) => t.causes.some((c) => c.urgency === "critical") ? 0 : 1;
      list = list.slice().sort((a, b) => rank(a) - rank(b));
    }
    return list;
  }
  function describe(area, when, urgency) {
    return (AREA_LABELS[area] || AREA_LABELS.other) + " · " +
      (WHEN_LABELS[when] || WHEN_LABELS.always) + " · " +
      (URGENCY_LABELS[urgency] || URGENCY_LABELS.routine);
  }
  const api = { AREAS, AREA_LABELS, WHEN_LABELS, URGENCY_LABELS, suggest, describe };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Wizard = ED_Wizard;
