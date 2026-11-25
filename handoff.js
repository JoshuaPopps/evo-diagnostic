/* Pocket Garage handoff — sending side (HANDOFF-FORMAT.md v1).
   Pure module: builds the envelope + URL for diagnosis-to-carb and
   diagnosis-to-task. No DOM, no navigation — the app opens the URL.
   Never sends a jet size, a part number, or a price: the wizard and
   the journal supply those from cited sources only. */
(function (root) {
  "use strict";
  function base64url(str) {
    let b64;
    if (typeof Buffer !== "undefined") b64 = Buffer.from(str, "utf8").toString("base64");
    else b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  // Map a ranked cause to the carb journal wizard step (spec section 3a).
  // The sender knows the carb from the roster (b1 S&S, b2 CV40, b3 Linkert
  // has no wizard path) and the symptom direction from the cause text.
  // When in doubt the step is null — the receiver opens the wizard and
  // the user picks. The outcome is lean/rich only when the cause says so.
  function wizardTarget(bikeId, tree, top) {
    const carb = bikeId === "b1" ? "ss" : bikeId === "b2" ? "cv" : null;
    if (!carb) return { step: null, outcome: null };
    // Direction may use the title ("Lean idle"); the step uses cause + test
    // only, so a tree title never drags an unrelated cause onto a step.
    const dirText = ((tree.title || "") + " " + (top.cause || "") + " " + (top.test || "")).toLowerCase();
    const text = ((top.cause || "") + " " + (top.test || "")).toLowerCase();
    const saysLean = /lean|too small|starving|picks up speed/.test(dirText);
    const saysRich = /rich|too large|too big|flood|soot/.test(dirText);
    const outcome = saysLean && !saysRich ? "lean" : saysRich && !saysLean ? "rich" : null;
    const idleTree = /idle/.test((tree.title || "").toLowerCase());
    let step = null;
    if (/altitude|elevation/.test(text)) step = carb === "ss" ? "ss-altitude" : "cv-altitude";
    else if (/main|top end|wide open|high rpm|roll-off|roll-on/.test(text)) step = carb === "ss" ? "ss-main" : "cv-main";
    else if (/midrange|mid-range|needle|cruise|mph/.test(text) || (!idleTree && /intermediate|slow jet/.test(text))) step = carb === "ss" ? "ss-intermediate" : "cv-needle";
    else if (/idle|mixture|pilot|enrichener|intermediate|slow jet/.test(text)) step = carb === "ss" ? "ss-idle" : "cv-mixture";
    return { step, outcome };
  }
  function buildEnvelope(kind, bike, tree, top, ranked, verdict) {
    const total = (ranked || []).reduce((s, c) => s + (c.score || 0), 0) || 0;
    const env = {
      format: "pocket-garage-handoff", version: 1, kind,
      sentAt: new Date().toISOString(), from: "evo-diagnostic",
      bike: { rosterKey: bike.rosterKey, name: bike.name },
      payload: {
        treeId: tree.id, treeTitle: tree.title, topCause: top.cause,
        cause: top.cause, test: top.test, fix: top.fix,
        urgency: top.urgency, safeToRide: verdict,
        confidencePct: total ? Math.round(((top.score || 0) / total) * 100) : null
      }
    };
    if (kind === "diagnosis-to-carb") {
      const w = wizardTarget(bike.rosterKey, tree, top);
      env.payload.wizardStepId = w.step;
      env.payload.wizardOutcome = w.outcome;
      env.payload.carbModelHint = bike.rosterKey === "b1" ? "S&S Super E"
        : bike.rosterKey === "b2" ? "Keihin CV40"
        : bike.rosterKey === "b3" ? "Linkert M74B" : null;
    } else if (kind === "diagnosis-to-task") {
      env.payload.suggestedTaskName = (tree.system + " — " + top.cause).slice(0, 80);
    }
    return env;
  }
  const APPS = {
    "diagnosis-to-carb": "https://joshuapopps.github.io/carb-tune-journal-pwa/",
    "diagnosis-to-task": "https://joshuapopps.github.io/bike-maintenance-log-pwa/"
  };
  function buildUrl(kind, bike, tree, top, ranked, verdict) {
    const env = buildEnvelope(kind, bike, tree, top, ranked, verdict);
    const json = JSON.stringify(env);
    if (json.length > 8000) throw new Error("handoff payload over 8,000 characters");
    return APPS[kind] + "?handoff=" + base64url(json);
  }
  const api = { base64url, wizardTarget, buildEnvelope, buildUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ED_Handoff = api;
})(typeof window !== "undefined" ? window : globalThis);
