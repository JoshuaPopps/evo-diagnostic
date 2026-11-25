/* The Evo Diagnostic — shareable plain-text report (batch 2, Nov 25, 2026).
   Pure function, testable in Node. Text share is the honest offline
   version: no PDF library, no account, no network. The report carries the
   bike, the date, the symptom (tree title), the severity (top cause
   urgency), the safe-to-ride verdict, the ranked causes WITH their
   sources, and the next step (the top cause's confirming test). */
const ED_Report = (() => {
  /* ranked: [{ cause, score, test, fix, source, urgency }] — score is the
     raw weight; pct is computed here from the total. */
  function build(o) {
    const total = o.ranked.reduce((s, c) => s + (c.score || 0), 0) || 1;
    const top = o.ranked[0] || {};
    const lines = [];
    lines.push("The Evo Diagnostic — " + o.tree.title + " (" + o.bike + ")");
    lines.push("Date: " + o.date);
    lines.push("Symptom: " + o.tree.title + " — " + o.tree.system);
    lines.push("Severity: " + (top.urgency || "—"));
    lines.push("Safe to ride? " + o.verdict);
    lines.push("");
    lines.push("Ranked likely causes:");
    o.ranked.forEach((c, i) => {
      const pct = Math.round(((c.score || 0) / total) * 100);
      lines.push((i + 1) + ". " + c.cause + " — " + pct + "%");
      lines.push("   Confirming test: " + c.test);
      lines.push("   Fix: " + c.fix);
      if (c.source) lines.push("   Source: " + c.source);
    });
    lines.push("");
    lines.push("Next step: " + (top.test || "run the confirming test above") + ".");
    lines.push("Diagnosis only — run the confirming test before buying parts.");
    return lines.join("\n");
  }
  const api = { build };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Report = ED_Report;
