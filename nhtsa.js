/* The Evo Diagnostic — NHTSA bundle helpers (pure functions, testable in Node).
   The bundle's TSB rows carry a `raw` tab-separated string. Field map
   (verified against the 83-row 1995-1999 chunk):
   [0] NHTSA id | [2] received date | [3] bulletin number | [4] bulletin date |
   [6] document type | [7]/[8] make | [9] model year (or 9999 = not listed) |
   [10] component | [13] summary. 31 of 83 rows carry no model year. */
const ED_NHTSA = (() => {
  function parseTsb(raw) {
    const f = String(raw || "").split("\t");
    return {
      id: f[0] || "",
      bulletin: f[3] || "",
      year: f[9] || "",
      component: (f[10] || "").trim(),
      summary: (f[13] || "").trim()
    };
  }
  function matchTsbs(rows, year) {
    const y = String(year);
    return rows.map((r) => parseTsb(r.raw)).filter((t) => t.year === y);
  }
  function unyearnedCount(rows) {
    return rows.filter((r) => parseTsb(r.raw).year === "9999").length;
  }
  function complaintBars(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([component, count]) => ({ component, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }
  const api = { parseTsb, matchTsbs, unyearnedCount, complaintBars };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_NHTSA = ED_NHTSA;
