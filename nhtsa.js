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
  /* Complaint-frequency counts on causes (BlueDriver "Repair Reports"
     steal). The bundle counts complaints by NHTSA component family,
     NOT per cause — so a cause shows its family's count, labeled as
     such. Mapping is explicit: a system default per tree, plus
     per-cause overrides where the cause belongs to a different family
     than its tree (or to none at all). A cause with no honest family
     returns null and shows nothing — never an invented frequency.
     The multi-family key ("FUEL SYSTEM, GASOLINE,ELECTRICAL SYSTEM,
     EQUIPMENT": 1) is one complaint filed under three families; it is
     never attributed to a single family, so it never appears here. */
  const SYSTEM_FAMILY = {
    "Carb / fuel": "FUEL SYSTEM, GASOLINE",
    "Charging": "ELECTRICAL SYSTEM",
    "Ignition / electrical": "ELECTRICAL SYSTEM",
    "Brakes": "SERVICE BRAKES, HYDRAULIC",
    "Primary / drive": "POWER TRAIN",
    "Engine": "ENGINE AND ENGINE COOLING",
    "Oil / lubrication": "ENGINE AND ENGINE COOLING",
    "Primary / clutch": "POWER TRAIN",
    "Transmission": "POWER TRAIN"
    /* "Starting", "Suspension / wheels / tires" and "Electrical / lights"
       have no single family — every cause there is mapped per-cause. */
  };
  /* Exact cause text -> family, or null = no honest family (shows
     nothing). Only causes that differ from their tree's system
     default, or live in a tree with no default, are listed here. */
  const CAUSE_FAMILY = {
    /* no-start (no system default) */
    "Battery discharged or failed": "ELECTRICAL SYSTEM",
    "Ignition fault (coil, cables, VOES, timing)": "ELECTRICAL SYSTEM",
    "Fuel delivery (petcock, filter, carb)": "FUEL SYSTEM, GASOLINE",
    "Starter or cables": "ELECTRICAL SYSTEM",
    "Jackshaft worn or mismatched — starter spins but won't engage": "POWER TRAIN",
    "Vacuum petcock valve not opening (1995–2003 Sportster)": "FUEL SYSTEM, GASOLINE",
    "Advance weights stuck at full advance — slow, sluggish cranking / kickback": "ENGINE AND ENGINE COOLING",
    /* batch 2 (Nov 25, 2026): petcock screens are fuel delivery, like the
       generic fuel cause above */
    "Petcock filter screens blocked by rust after storage — fuel starvation": "FUEL SYSTEM, GASOLINE",
    /* carb-lean-idle: the advance mechanism is engine, not fuel */
    "Worn advance mechanism — idle hangs ~1,600 rpm then drops": "ENGINE AND ENGINE COOLING",
    /* wheels-tires (no system default) */
    "Wrong tire pressure": null, /* rider maintenance, not a WHEELS-family defect */
    "Tire age (10+ years)": "WHEELS",
    "Wheel bearings / balance": "WHEELS",
    "Suspension (fork seals, shocks)": "SUSPENSION",
    "Steering-head loose / worn — wobble": "STEERING",
    "Fork oil level/weight wrong, or leak at the top-clamp bolt": "SUSPENSION",
    "Loose spokes — crooked wheel, instability": "WHEELS",
    "Wheels not on the same track — asymmetric handling": null, /* frame, fork or axle — no single family */
    /* batch 2 (Nov 25, 2026): tire choice is rider selection, like pressure */
    "Wrong tire for the bike — high-speed wobble / weave": null,
    /* engine-noise: the hiss bundles belt rub (power train) with venting (engine/fuel) */
    "Hiss from belt rub, pinched vent, or cap venting": null,
    /* lights (no system default) */
    "Blown fuse / tripped breaker": "ELECTRICAL SYSTEM",
    "Bulb / socket at the lamp": "EXTERIOR LIGHTING",
    "Bad ground / loose connector": "ELECTRICAL SYSTEM",
    "Switch faulty": "ELECTRICAL SYSTEM",
    "Lights flicker with engine running — charging/regulator fault": "ELECTRICAL SYSTEM"
  };
  function complaintForCause(counts, system, cause) {
    if (!counts || typeof cause !== "string") return null;
    let family = null;
    if (Object.prototype.hasOwnProperty.call(CAUSE_FAMILY, cause)) family = CAUSE_FAMILY[cause];
    else family = SYSTEM_FAMILY[system] || null;
    if (!family) return null;
    const count = counts[family];
    if (typeof count !== "number") return null;
    return { family, count };
  }
  function complaintLabel(hit) {
    return hit.count + " owner complaints filed for this system (NHTSA — " + hit.family + ")";
  }
  const api = { parseTsb, matchTsbs, unyearnedCount, complaintBars, complaintForCause, complaintLabel, SYSTEM_FAMILY, CAUSE_FAMILY };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_NHTSA = ED_NHTSA;
