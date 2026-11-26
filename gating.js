/* The Evo Diagnostic — tree year-gating (pure functions, testable in Node).
   Round 3 (Nov 25, 2026). The speedometer and turn-signal trees print year
   splits in their text (1995-96 / 1997-98 speedo voltage ranges; 1991-96 /
   1997-98 / 1999 turn-signal splits). When the user has a bike picked, this
   module narrows the displayed text to that bike's year; with no bike
   picked, or a year outside every split, the text is returned unchanged —
   old behavior (show everything) is the fallback. Tree data wording is
   never changed: gating only hides segments at display time, and a
   pattern that no longer matches the data leaves the text alone.
   Two mechanisms, both exact and safe to fail open:
   - VARIANTS: combined "X on YYYY-YY, Y on YYYY-YY" strings, replaced
     with the single variant for the bike's year (speedo step 3 question,
     speedo-power cause test).
   - Block segments: a year range (or a single year, "1999 models:") that
     introduces a block — followed by ":" or " — " within 40 chars — starts
     a segment running to the next segment's start. Segments whose range
     does not contain the bike's year are dropped; if no segment's range
     contains the year, the whole text is returned unchanged. */
const ED_Gating = (() => {
  const GATED_TREES = ["speedometer-inoperative", "turn-signals"];
  const VARIANTS = [
    { combined: "8-12 V on 1995-96, 6-12 V on 1997-98",
      ranges: [
        { lo: 1995, hi: 1996, text: "8-12 V on 1995-96" },
        { lo: 1997, hi: 1998, text: "6-12 V on 1997-98" }
      ] },
    { combined: "8-12 V (1995-96) / 6-12 V (1997-98)",
      ranges: [
        { lo: 1995, hi: 1996, text: "8-12 V (1995-96)" },
        { lo: 1997, hi: 1998, text: "6-12 V (1997-98)" }
      ] }
  ];
  /* Roster bikes carry the year in the name ("1995 Fat Boy Bobber") or
     the base ("1990 Harley-Davidson Heritage Softail Classic FLSTC").
     A bike with no 4-digit year (a user-added bike with a free name)
     parses to null, which means "show everything". */
  function bikeYear(bike) {
    if (!bike) return null;
    const m = String(bike.name || "").match(/(\d{4})/) ||
      String(bike.base || "").match(/(\d{4})/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    return y >= 1900 && y <= 2100 ? y : null;
  }
  function rangeHi(lo, hiText) {
    return hiText.length === 2 ? Math.floor(lo / 100) * 100 + parseInt(hiText, 10) : parseInt(hiText, 10);
  }
  /* A marker introduces a block when ":" or " — " follows within 40
     chars — "1997-98 (except late-98 883):", "1991-96 text:",
     "1995-96 — voltmeter", "1999-2003 (Fig. 101):". A bare value like
     "8-12 V on 1995-96, 6-12 V on 1997-98" has neither, so it is not a
     block marker (the VARIANTS table handles it). A parenthetical like
     "(1991-96 text)" has neither either, so it is left alone. */
  function isBlockIntroducer(text, end) {
    const win = text.slice(end, end + 40);
    return win.indexOf(":") !== -1 || win.indexOf(" — ") !== -1;
  }
  function findMarkers(text) {
    const out = [];
    let m;
    const reRange = /(\d{4})\s*[–-]\s*(\d{4}|\d{2})/g;
    while ((m = reRange.exec(text)) !== null) {
      const lo = parseInt(m[1], 10);
      if (isBlockIntroducer(text, m.index + m[0].length)) {
        out.push({ index: m.index, end: m.index + m[0].length, lo, hi: rangeHi(lo, m[2]) });
      }
    }
    /* Single year: "1999 models:" / "1994 models —". The pattern itself
       requires the ":" or "—", so every match is a block introducer. */
    const reYear = /(\d{4})\s+models\s*(?::|—)/g;
    while ((m = reYear.exec(text)) !== null) {
      const y = parseInt(m[1], 10);
      out.push({ index: m.index, end: m.index + m[0].length, lo: y, hi: y });
    }
    out.sort((a, b) => a.index - b.index);
    return out;
  }
  /* Start of the sentence/clause containing the marker: after the last
     ". " or "; " before it. If that start is at or before the previous
     marker's end (the marker sits inside the previous marker's label,
     e.g. "1991-96 text: 1994 models — ..."), the segment starts at the
     marker itself, so the previous segment keeps its label text. */
  function segmentStart(text, idx, prevEnd) {
    const dot = text.lastIndexOf(". ", idx);
    const semi = text.lastIndexOf("; ", idx);
    const cut = Math.max(dot, semi);
    const sent = cut === -1 ? 0 : cut + 2;
    return sent > prevEnd ? sent : Math.max(idx, prevEnd);
  }
  function gateText(text, year, strict) {
    if (!text || year === null || year === undefined) return { text, hidden: false };
    let out = text;
    let hidden = false;
    VARIANTS.forEach((v) => {
      if (out.indexOf(v.combined) === -1) return;
      const hit = v.ranges.find((r) => year >= r.lo && year <= r.hi);
      if (hit) { out = out.replace(v.combined, hit.text); hidden = true; }
    });
    const markers = findMarkers(out);
    if (markers.length > 0) {
      const starts = [];
      let prevEnd = 0;
      markers.forEach((mk) => {
        starts.push(segmentStart(out, mk.index, prevEnd));
        prevEnd = mk.end;
      });
      const anyInRange = markers.some((mk) => year >= mk.lo && year <= mk.hi);
      if (anyInRange) {
        const parts = [];
        if (starts[0] > 0) parts.push(out.slice(0, starts[0]));
        markers.forEach((mk, i) => {
          if (year >= mk.lo && year <= mk.hi) {
            parts.push(out.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : out.length));
          } else {
            hidden = true;
          }
        });
        out = cleanJoin(parts, out);
      } else if (strict) {
        /* The bike's year is covered by the tree but by no segment in
           this text — drop the year-specific blocks, keep the general
           lead (e.g. the 1999-only note in the speed-sensor cause, seen
           by a 1995 bike). Without strict, the text is left alone. */
        hidden = true;
        out = cleanJoin(starts[0] > 0 ? [out.slice(0, starts[0])] : [], out);
      }
    }
    return { text: out, hidden };
  }
  function cleanJoin(parts, original) {
    let cleaned = parts.join("").replace(/\s+/g, " ").trim().replace(/[\s;,\/]+$/, "");
    if (cleaned && /[.!?]$/.test(original) && !/[.!?]$/.test(cleaned)) cleaned += ".";
    return cleaned;
  }
  /* Every year range the tree prints anywhere (steps q/note, cause
     tests) — parentheticals included. If the bike's year falls in none
     of them, the tree does not cover that bike and everything shows. */
  function treeCoverage(tree) {
    const ranges = [];
    const scan = (s) => {
      if (!s) return;
      let m;
      const reRange = /(\d{4})\s*[–-]\s*(\d{4}|\d{2})/g;
      while ((m = reRange.exec(s)) !== null) {
        const lo = parseInt(m[1], 10);
        ranges.push({ lo, hi: rangeHi(lo, m[2]) });
      }
      const reYear = /(\d{4})\s+models\s*(?::|—)/g;
      while ((m = reYear.exec(s)) !== null) {
        const y = parseInt(m[1], 10);
        ranges.push({ lo: y, hi: y });
      }
    };
    (tree.steps || []).forEach((s) => { scan(s.q); scan(s.note); });
    (tree.causes || []).forEach((c) => { scan(c.test); });
    return ranges;
  }
  function treeCoversYear(tree, year) {
    return treeCoverage(tree).some((r) => year >= r.lo && year <= r.hi);
  }
  /* Only the two trees with year splits are gated; every other tree's
     text passes through untouched whatever the bike. A bike whose year
     the tree does not cover at all (1990, 1947) sees everything, as
     today; a covered bike sees only its year's segments, strictly. */
  function gateTreeText(treeId, tree, text, year) {
    if (GATED_TREES.indexOf(treeId) === -1) return { text, hidden: false };
    if (year === null || year === undefined) return { text, hidden: false };
    if (!treeCoversYear(tree, year)) return { text, hidden: false };
    return gateText(text, year, true);
  }
  const api = { GATED_TREES, VARIANTS, bikeYear, gateText, gateTreeText, treeCoverage, treeCoversYear };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Gating = ED_Gating;
