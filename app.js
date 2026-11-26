/* The Evo Diagnostic — app logic. Plain JavaScript, zero dependencies.
   Stores sessions + baselines on-device (localStorage). Nothing leaves the
   phone unless the user shares it. */
(function () {
  "use strict";
  const D = ED_DATA;
  const $ = (id) => document.getElementById(id);
  /* Shared parts + torque core (pg-parts-core.js): every price and every
     FSM torque value comes from here — data.js holds only the keys (atlas
     part keys, torque table ids + slugs). Guarded like PG_SWUpdate: if
     the module failed to load, price lines stay empty and the Torque tab
     says so, never a guessed value. */
  const PartsCore = (typeof PG_PartsCore !== "undefined") ? PG_PartsCore : null;
  const store = {
    load() { try { return JSON.parse(localStorage.getItem("evo-diagnostic") || "{}"); } catch (e) { return {}; } },
    save(s) { localStorage.setItem("evo-diagnostic", JSON.stringify(s)); }
  };
  let state = store.load();
  state.sessions = state.sessions || [];
  state.baselines = state.baselines || {};
  state.bikes = state.bikes || [];
  state.bike = state.bike || "b1";
  state.in_progress = state.in_progress || null;
  const allBikes = () => D.roster.concat(state.bikes);

  /* Service-worker update button (sw-update.js): hidden until a new
   * version is waiting. Lives in the header; the .pg-sw-update:hover
   * rule in styles.css holds it still (the house button rule shifts).
   * Guarded so the diagnostic keeps working if the module ever fails
   * to load. */
  const swUpdate = (typeof PG_SWUpdate !== "undefined")
    ? PG_SWUpdate.init({ container: document.querySelector("header") }) : null;

  /* ---------- tabs ---------- */
  document.querySelectorAll(".ed-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ed-tab").forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      document.querySelectorAll(".ed-panel").forEach((p) => p.classList.remove("active"));
      $("panel-" + btn.dataset.tab).classList.add("active");
    });
  });

  /* ---------- bike roster (built-ins + user-added) ---------- */
  const bikeSel = $("bike");
  function renderBikeSel() {
    bikeSel.innerHTML = "";
    allBikes().forEach((b) => {
      const o = document.createElement("option");
      o.value = b.id; o.textContent = b.name + " — " + b.base;
      bikeSel.appendChild(o);
    });
    bikeSel.value = state.bike;
  }
  renderBikeSel();
  bikeSel.addEventListener("change", () => { state.bike = bikeSel.value; store.save(state); renderCarbs(); });

  /* ---------- year-gating (round 3): the picked bike's year narrows the
     year splits in the speedometer and turn-signal trees (gating.js).
     No bike picked, a bike with no year in its name, or a year the tree
     does not cover (1990, 1947) shows everything, as before. Guarded
     like PartsCore: if the module failed to load, nothing is gated. */
  const Gating = (typeof ED_Gating !== "undefined") ? ED_Gating : null;
  function currentBike() { return allBikes().find((b) => b.id === state.bike) || null; }
  function currentBikeYear() { const b = currentBike(); return (Gating && b) ? Gating.bikeYear(b) : null; }
  function gateNoteHtml(hidden) {
    const b = currentBike(); const y = currentBikeYear();
    return (hidden && b && y)
      ? "<p class='ed-note'>Showing only the " + y + " checks for your " + b.name + " — other model years hidden.</p>"
      : "";
  }

  /* ---------- add a bike (any rider) ---------- */
  const addModelSel = $("add-bike-model");
  const blank = document.createElement("option");
  blank.value = ""; blank.textContent = "— pick a model —";
  addModelSel.appendChild(blank);
  D.common_bikes.forEach((b) => {
    const g = document.createElement("optgroup");
    g.label = b.brand;
    b.families.forEach((f) => f.models.forEach((m) => {
      const o = document.createElement("option");
      o.value = b.brand + " " + f.family + " " + m;
      o.textContent = f.family + " " + m;
      g.appendChild(o);
    }));
    addModelSel.appendChild(g);
  });
  $("add-bike-btn").addEventListener("click", () => {
    const custom = $("add-bike-name").value.trim();
    const picked = addModelSel.value;
    const name = custom || picked;
    if (!name) { $("add-bike-status").textContent = "Pick a model or type a name first."; return; }
    const bike = { id: "u" + Date.now(), name, base: picked || name, carb: null, timing: name };
    state.bikes.push(bike);
    state.bike = bike.id;
    store.save(state);
    renderBikeSel();
    renderBaselines();
    renderHistory();
    $("add-bike-status").textContent = name + " added. Specs stay labeled Evo 1340 — add your own bike's numbers in the Atlas carb list when you know them.";
    $("add-bike-name").value = "";
    addModelSel.value = "";
  });

  /* ---------- diagnose: tree list + walker ---------- */
  const treeList = $("tree-list");
  D.trees.forEach((t) => {
    const b = document.createElement("button");
    b.className = "ed-tree-btn";
    b.innerHTML = "<b>" + t.title + "</b><br><span class='ed-note'>" + t.system + "</span>";
    b.addEventListener("click", () => startTree(t));
    treeList.appendChild(b);
  });

  /* ---------- wizard front step (batch 2): three questions narrow the
     tree choice. The wizard only suggests — every tree stays directly
     accessible below, and the current flow is unchanged. When it happens
     and how urgent it is are shown back and saved with the diagnosis;
     they do not filter trees (no library data supports that). */
  $("wiz-go").addEventListener("click", () => {
    const wizard = { area: $("wiz-area").value, when: $("wiz-when").value, urgency: $("wiz-urgency").value };
    const suggested = ED_Wizard.suggest(wizard.area, wizard.urgency, D.trees);
    const desc = ED_Wizard.describe(wizard.area, wizard.when, wizard.urgency);
    const note = wizard.urgency === "roadside"
      ? "<p class='ed-note'>Roadside: if it is not safe to ride, do not ride — run the tree parked. Trees with a critical-urgency cause are listed first.</p>"
      : "";
    $("wiz-results").innerHTML = "<p><b>Suggested for " + desc + ":</b></p>" + note +
      suggested.map((t) => "<button class='ed-tree-btn' data-wiz='" + t.id + "'><b>" + t.title + "</b><br><span class='ed-note'>" + t.system + "</span></button>").join("") +
      "<p class='ed-note'>Every tree is still below — the wizard only suggests.</p>";
    $("wiz-results").querySelectorAll("[data-wiz]").forEach((btn) => btn.addEventListener("click", () => {
      const t = D.trees.find((x) => x.id === btn.dataset.wiz);
      if (t) startTree(t, wizard);
    }));
    $("wiz-results").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  let current = null; // {tree, step, weights, answers, wizard}
  function startTree(t, wizard) {
    current = { tree: t, step: 0, weights: {}, answers: [], wizard: wizard || null };
    t.causes.forEach((c) => { current.weights[c.cause] = c.weight; });
    saveProgress();
    $("session").style.display = "block";
    $("results").style.display = "none";
    $("session-title").textContent = t.title + " — " + t.system;
    $("session-testcase").textContent = t.test_case || "";
    $("photo-preview").innerHTML = "";
    renderStep();
    $("session").scrollIntoView();
  }
  /* ---------- resumable trees (batch 2): progress is saved to localStorage
     on every answer (and on start). Reopening the app offers Resume on an
     in-progress tree; finishing or abandoning it clears the saved progress.
     Starting a different tree abandons the old one — the new tree replaces
     the saved progress. */
  function saveProgress() {
    if (!current) { state.in_progress = null; }
    else {
      state.in_progress = {
        tree: current.tree.id, step: current.step, weights: current.weights,
        answers: current.answers, bike: state.bike, wizard: current.wizard || null,
        started: (state.in_progress && state.in_progress.tree === current.tree.id && state.in_progress.started)
          ? state.in_progress.started : new Date().toISOString()
      };
    }
    store.save(state);
  }
  function clearProgress() { state.in_progress = null; store.save(state); renderResume(); }
  function renderResume() {
    const banner = $("resume-banner");
    const p = state.in_progress;
    if (!p) { banner.style.display = "none"; return; }
    const t = D.trees.find((x) => x.id === p.tree);
    if (!t) { state.in_progress = null; store.save(state); banner.style.display = "none"; return; }
    $("resume-text").textContent = t.title + " — step " + (Math.min(p.step, t.steps.length - 1) + 1) + " of " + t.steps.length +
      (p.wizard ? " (" + ED_Wizard.describe(p.wizard.area, p.wizard.when, p.wizard.urgency) + ")" : "") +
      ", started " + new Date(p.started || Date.now()).toLocaleString() + ".";
    banner.style.display = "block";
  }
  $("resume-btn").addEventListener("click", () => {
    const p = state.in_progress;
    if (!p) return;
    const t = D.trees.find((x) => x.id === p.tree);
    if (!t) return;
    current = { tree: t, step: Math.min(p.step, t.steps.length), weights: p.weights || {}, answers: p.answers || [], wizard: p.wizard || null };
    t.causes.forEach((c) => { if (!(c.cause in current.weights)) current.weights[c.cause] = c.weight; });
    state.bike = p.bike || state.bike;
    store.save(state);
    renderBikeSel();
    $("session").style.display = "block";
    $("results").style.display = "none";
    $("session-title").textContent = t.title + " — " + t.system;
    $("session-testcase").textContent = t.test_case || "";
    $("photo-preview").innerHTML = "";
    $("resume-banner").style.display = "none";
    renderStep();
    $("session").scrollIntoView();
  });
  $("resume-discard").addEventListener("click", () => { clearProgress(); });
  $("abandon-tree").addEventListener("click", () => {
    current = null;
    clearProgress();
    $("session").style.display = "none";
    $("results").style.display = "none";
  });
  renderResume();
  function renderStep() {
    const t = current.tree, el = $("tree-step");
    if (current.step >= t.steps.length) return finishTree();
    const s = t.steps[current.step];
    const year = currentBikeYear();
    const gq = Gating ? Gating.gateTreeText(t.id, t, s.q, year) : { text: s.q, hidden: false };
    const gn = Gating ? Gating.gateTreeText(t.id, t, s.note, year) : { text: s.note, hidden: false };
    el.innerHTML = "<p><b>Step " + (current.step + 1) + " of " + t.steps.length + ":</b> " + gq.text + "</p>" +
      gateNoteHtml(gq.hidden || gn.hidden) +
      "<p class='ed-note'>" + gn.text + " <i>Source: " + s.cite + "</i></p>" +
      "<button class='ed-btn' id='ans-yes'>Yes</button>" +
      "<button class='ed-btn ghost' id='ans-no'>No</button>";
    $("ans-yes").addEventListener("click", () => answer(true));
    $("ans-no").addEventListener("click", () => answer(false));
  }
  function answer(yes) {
    const t = current.tree;
    if (current.step >= t.steps.length) return; // stale click after the tree finished
    const s = t.steps[current.step];
    current.answers.push({ q: s.q, a: yes ? "yes" : "no" });
    current.weights = ED_Scoring.applyAnswer(current.weights, t.causes, s.yes, yes);
    current.step++;
    saveProgress();
    renderStep();
  }
  /* ---------- parts & prices (checked Nov 24, 2026; link out to verify) ----------
     Prices come from the shared parts core, never from data.js. A `see`
     pointer is shown as-is (its note + the kit it ships in), never
     silently followed. No core, no price line — never a guessed value. */
  function formatCheckDate(iso) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = String(iso || "").split("-");
    if (parts.length !== 3) return String(iso || "");
    const m = parseInt(parts[1], 10);
    return months[m - 1] + " " + parseInt(parts[2], 10) + ", " + parts[0];
  }
  function priceHtml(keys) {
    if (!PartsCore) return "";
    const entries = (Array.isArray(keys) ? keys : [keys]).flatMap((k) => {
      const e = PartsCore.getPrice(k);
      return e ? [e] : [];
    });
    if (!entries.length) return "";
    const lines = [];
    const priced = [];
    entries.forEach((r) => {
      if (r.see) {
        const rec = PartsCore.getPrice(r.see);
        if (rec) {
          lines.push(r.note + " <a href='" + rec.url + "' target='_blank' rel='noopener'>" + rec.name + " — $" + rec.price.toFixed(2) + "</a> (" + rec.source + ", checked " + formatCheckDate(rec.date) + ")");
          priced.push(rec);
        }
        return;
      }
      lines.push("<a href='" + r.url + "' target='_blank' rel='noopener'>" + r.name + " — $" + r.price.toFixed(2) + "</a> (" + r.source + ", checked " + formatCheckDate(r.date) + ")" +
        (r.note ? "<br><span class='ed-note'>" + r.note + "</span>" : ""));
      priced.push(r);
    });
    const multi = Array.isArray(keys) && keys.length > 1;
    const label = multi ? "Parts that fix this (the test says which one):" : "Part:";
    const diy = priced.length === 1
      ? "DIY about $" + priced[0].price.toFixed(2) + " in parts"
      : "DIY $" + Math.min(...priced.map((r) => r.price)).toFixed(2) + "–$" + Math.max(...priced.map((r) => r.price)).toFixed(2) + " in parts, depending which one the test points to";
    return "<br>" + label + " " + lines.join("<br>") + "<br>" + diy + " · Shop: parts + ask your shop for labor — no shop publishes a labor rate for this.";
  }
  function finishTree() {
    $("tree-step").innerHTML = ""; // no stale Yes/No buttons left to click
    clearProgress(); // a finished tree has no progress left to resume
    const t = current.tree;
    const ranked = t.causes.map((c) => ({ ...c, score: current.weights[c.cause] || 0 }))
      .sort((a, b) => b.score - a.score);
    const top = ranked[0];
    const verdict = top.urgency === "critical"
      ? { cls: "no", text: "DO NOT RIDE — " + top.cause + ". " + top.ride }
      : top.urgency === "high"
        ? { cls: "soon", text: "Fix before a real ride — " + top.cause + ". " + top.ride }
        : { cls: "ok", text: "Likely rideable — " + top.cause + ". " + top.ride };
    const total = ranked.reduce((s, c) => s + c.score, 0) || 1;
    /* Year-gating (round 3): the picked bike's year narrows the year
       splits in the cause tests of the two gated trees. The shared
       report and the saved session keep the full ungated text — the
       report is the record; the screen is the walk. */
    const year = currentBikeYear();
    const gated = ranked.map((c) => Gating ? Gating.gateTreeText(t.id, t, c.test, year) : { text: c.test, hidden: false });
    const anyGated = gated.some((g) => g.hidden);
    let html = "<h3>Ranked likely causes</h3>" +
      "<p class='ed-note'>Ranked by the checks you just ran. Every cause names its confirming test — run it before buying parts. Confidence is a share of the weight from your answers, not a measurement. NHTSA counts, where shown, are owner complaints filed for the cause's whole component family — not for that exact fault.</p>" +
      "<div class='ed-verdict " + verdict.cls + "'>Safe to ride? " + verdict.text + "</div>" +
      gateNoteHtml(anyGated);
    ranked.forEach((c, i) => {
      const pct = Math.round((c.score / total) * 100);
      const nhtsa = bundle ? ED_NHTSA.complaintForCause(bundle.complaint_counts_by_component, t.system, c.cause) : null;
      html += "<div class='ed-cause " + c.urgency + "'><b>" + c.cause + "</b> — " + pct + "%" +
        "<br>Confirming test: " + gated[i].text +
        "<br>Fix: " + c.fix +
        (c.source ? "<br><span class='ed-note'>Source: " + c.source + "</span>" : "") +
        (nhtsa ? "<br><span class='ed-note'>NHTSA: " + ED_NHTSA.complaintLabel(nhtsa) + " — of " + bundle.complaint_total + " owner complaints in the bundle.</span>" : "") +
        (c.part ? priceHtml(c.part) : "") +
        "<br>Urgency: " + c.urgency + "</div>";
    });
    html += "<p class='ed-note'>DIY vs shop: the checks above are driveway work with basic tools. " +
      "A bottom-end knock or a brake leak is shop work. Prices were read from live product pages Nov 24, 2026, with a link out per part — verify before you buy, prices move.</p>" +
      "<button class='ed-btn' id='share-diag'>Share this diagnosis</button> " +
      "<button class='ed-btn ghost' id='copy-diag'>Copy report</button> " +
      "<button class='ed-btn ghost' id='save-diag'>Save session</button> " +
      "<button class='ed-btn' id='send-carb'>Send to Carb Journal</button> " +
      "<button class='ed-btn' id='send-log'>Send to Bike Log</button>";
    const res = $("results");
    res.innerHTML = html;
    res.style.display = "block";
    $("share-diag").addEventListener("click", () => shareDiagnosis(t, ranked, verdict.text));
    $("copy-diag").addEventListener("click", () => copyDiagnosis(t, ranked, verdict.text));
    $("send-carb").addEventListener("click", () => sendDiagnosis(t, ranked, verdict.text, "diagnosis-to-carb"));
    $("send-log").addEventListener("click", () => sendDiagnosis(t, ranked, verdict.text, "diagnosis-to-task"));
    $("save-diag").addEventListener("click", () => {
      state.sessions.push({ when: new Date().toISOString(), bike: state.bike, tree: t.id, answers: current.answers, ranked: ranked.map((c) => c.cause), verdict: verdict.text, result: top.cause, wizard: current.wizard || null });
      store.save(state);
      renderHistory();
      $("save-diag").textContent = "Saved";
    });
    res.scrollIntoView();
  }
  /* ---------- shareable report (batch 2): plain text, built by ED_Report —
     bike, date, symptom, severity, safe-to-ride verdict, ranked causes
     with their sources, next step. Web Share where available, clipboard
     fallback. No PDF, no network. */
  function buildReportText(t, ranked, verdict) {
    const bike = allBikes().find((b) => b.id === state.bike);
    return ED_Report.build({
      bike: bike ? bike.name : state.bike,
      date: new Date().toLocaleString(),
      tree: t, ranked, verdict
    });
  }
  function shareDiagnosis(t, ranked, verdict) {
    const text = buildReportText(t, ranked, verdict);
    if (navigator.share) navigator.share({ title: "Evo Diagnostic", text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert("Diagnosis copied — paste it to your mechanic or forum."));
    else alert("Sharing is not available in this browser — the report is on screen; copy it by hand.");
  }
  function copyDiagnosis(t, ranked, verdict) {
    const text = buildReportText(t, ranked, verdict);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert("Report copied — paste it to your mechanic or forum."));
    else alert("Clipboard is not available in this browser — the report is on screen; copy it by hand.");
  }
  /* ---------- handoff send (HANDOFF-FORMAT.md v1) ---------- */
  function sendDiagnosis(t, ranked, verdict, kind) {
    const top = ranked[0];
    const bike = allBikes().find((b) => b.id === state.bike);
    const url = ED_Handoff.buildUrl(kind, { rosterKey: state.bike, name: bike ? bike.name : state.bike }, t, top, ranked, verdict);
    window.location.href = url;
  }

  /* ---------- atlas: tap-to-identify ---------- */
  document.querySelectorAll(".ed-part").forEach((el) => {
    el.addEventListener("click", () => {
      const p = D.parts[el.dataset.part];
      const box = $("part-detail");
      if (!p) { box.innerHTML = "<p class='ed-note'>No record for that part yet.</p>"; return; }
      box.innerHTML = "<h3>" + p.name + "</h3>" +
        "<p>" + p.fn + "</p>" +
        "<p><b>Spec:</b> " + p.spec + "</p>" +
        "<p><b>How it usually fails:</b> " + p.failures + "</p>" +
        (PartsCore && PartsCore.getPrice(el.dataset.part) ? "<p>" + priceHtml(el.dataset.part).replace(/^<br>/, "") + "</p>" : "") +
        "<p class='ed-note'>Source: " + p.source + "</p>";
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
  $("photo").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const scale = Math.min(1, 800 / img.width);
      c.width = img.width * scale; c.height = img.height * scale;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 400) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
      const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
      const bright = (r + g + b) / 3;
      const plug = bright > 200 ? "White / very light — reads LEAN. Cross-check with the roll-off test, never judge from one photo."
        : bright > 140 ? "Light tan — about right for a plug reading."
        : bright > 80 ? "Dark tan to brown — slightly rich or normal depending on the bike."
        : "Black / sooty — reads RICH.";
      $("photo-preview").innerHTML =
        "<img class='ed-photo' src='" + c.toDataURL("image/jpeg", 0.8) + "' alt='Uploaded photo'>" +
        "<p class='ed-note'>Sampled average color: <span class='ed-mono'>" + hex + "</span>. " +
        "This is a rough average of the whole photo, not a lab reading — lighting changes everything. " +
        "As a plug read: " + plug + "</p>";
    };
    img.src = URL.createObjectURL(f);
  });

  /* ---------- atlas ---------- */
  /* Round 3 (Nov 25, 2026): the Softail still used to appear twice — a
     thumbnail in this grid and the large tappable map below. The map
     stays (it is the interactive surface); photos flagged in_photo_map
     are skipped here, so each own photo appears once. */
  const grid = $("cc-grid");
  (D.own_photos || []).filter((p) => !p.in_photo_map).forEach((p) => {
    const d = document.createElement("div");
    d.innerHTML = "<img class='ed-thumb' src='" + p.file + "' alt='" + p.subject + "' loading='lazy'>" +
      "<p><b>" + p.subject + "</b><br><span class='ed-credit'>" + p.credit + "</span></p>";
    grid.appendChild(d);
  });
  D.cc_photos.forEach((p) => {
    const d = document.createElement("div");
    d.innerHTML = "<a href='" + p.page + "'><img class='ed-thumb' src='" + p.file + "' alt='" + p.subject + "' loading='lazy'></a>" +
      "<p><b>" + p.subject + "</b><br><span class='ed-credit'>" + p.credit + "</span></p>";
    grid.appendChild(d);
  });
  function renderCarbs() {
    const el = $("carb-list");
    el.innerHTML = Object.values(D.carbs).map((c) => {
      const lines = [c.name + " — " + c.bike];
      if (c.main) lines.push("Main " + c.main + (c.pilot ? " / pilot " + c.pilot : "") + (c.intermediate ? " / intermediate " + c.intermediate : ""));
      if (c.mixture) lines.push("Mixture " + c.mixture);
      if (c.float) lines.push("Float " + c.float);
      if (c.jetting === null) lines.push("Jetting: not published — left blank, never guessed");
      lines.push("Source: " + c.source);
      return "<p>" + lines.join("<br>") + "</p>";
    }).join("");
  }
  renderCarbs();
  $("supplier-list").innerHTML = D.parts_suppliers.map((s) =>
    "<p><a href='" + s.url + "'>" + s.name + "</a> — " + s.note + "</p>").join("");
  $("local-list").innerHTML = D.local_shops.map((s) =>
    "<div class='ed-cause'><b>" + s.name + "</b> — " + s.kind +
    "<br>" + s.address +
    "<br><a href='tel:" + s.phone.replace(/[^0-9]/g, "") + "'>" + s.phone + "</a>" +
    (s.url ? " · <a href='" + s.url + "'>Website</a>" : "") +
    "<br><span class='ed-note'>" + s.note + "</span></div>").join("");

  /* ---------- "Before you start" safety block (batch 2): one consistent
     block at the top of every guided hands-on card. Generic shop safety
     (D.safety_block) — the battery items are FSM §8 warnings. */
  function safetyHtml() {
    const b = D.safety_block;
    return "<div class='ed-safety'><b>" + b.title + "</b><ul>" +
      b.items.map((i) => "<li>" + i + "</li>").join("") + "</ul>" +
      "<p class='ed-note'>" + b.note + "</p></div>";
  }

  /* ---------- battery & charging guided tests (FSM #99482-98 section 8) ---------- */
  $("charging-tests").innerHTML =
    safetyHtml() +
    "<p class='ed-note'>" + D.charging_tests.intro + " <i>Source: " + D.charging_tests.ref + "</i></p>" +
    D.charging_tests.steps.map((s, i) =>
      "<div class='ed-cause'><b>" + (i + 1) + ". " + s.title + "</b>" +
      "<br>How: " + s.how +
      "<br>Pass: " + s.pass +
      "<br>Fail: " + s.fail + "</div>").join("") +
    D.charging_tests.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("");

  /* ---------- compression test guided card (FSM #99482-98 §3, pp. 3-11–3-12) ---------- */
  $("compression-tests").innerHTML =
    safetyHtml() +
    "<p class='ed-note'>" + D.compression_tests.intro + " Tool: " + D.compression_tests.tool + " <i>Source: " + D.compression_tests.ref + "</i></p>" +
    D.compression_tests.steps.map((s, i) =>
      "<div class='ed-cause'><b>" + (i + 1) + ". " + s.title + "</b>" +
      "<br>How: " + s.how +
      "<br>Pass: " + s.pass +
      "<br>Fail: " + s.fail + "</div>").join("") +
    "<h4>Diagnostic chart — what the readings mean</h4>" +
    D.compression_tests.chart.map((c) =>
      "<div class='ed-cause'><b>" + c.label + "</b> — " + c.text + "</div>").join("") +
    "<p class='ed-note'>Leakdown test: " + D.compression_tests.leakdown + "</p>" +
    D.compression_tests.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("");

  /* ---------- listen: RPM meter + quick-listen + baselines ---------- */
  let listening = false;
  $("rpm-start").addEventListener("click", () => {
    if (listening) return;
    listening = true;
    const ok = ED_Audio.start((rpm) => {
      $("rpm").textContent = rpm == null ? "—" : rpm;
      if (rpm != null) {
        $("rpm-bar").style.width = Math.min(100, (rpm / 2000) * 100) + "%";
        const v = ED_Audio.inIdleSpec(rpm, D.specs.idle_rpm);
        $("rpm-verdict").textContent = v === "in-spec" ? "In spec: 1000-1050 rpm. That is a healthy Evo idle."
          : v === "low" ? "Below the 1000-1050 rpm factory idle. Check the idle speed screw and the lean-idle tree."
          : "Above the 1000-1050 rpm factory idle. Check for an intake leak or a stuck enrichener.";
      } else {
        $("rpm-verdict").textContent = "No clear pulse — hold the phone closer to the exhaust, away from wind.";
      }
    }, (err) => { $("rpm-verdict").textContent = err; listening = false; });
    if (!ok) listening = false;
  });
  $("rpm-stop").addEventListener("click", () => { ED_Audio.stop(); listening = false; $("rpm").textContent = "—"; });

  $("quick-start").addEventListener("click", () => {
    $("quick-status").textContent = "Listening for 10 seconds — hold still near the exhaust…";
    $("quick-results").innerHTML = "";
    const samples = [];
    const specFrames = [];
    let specSr = 0, specFft = 0;
    ED_Audio.start((rpm) => { if (rpm != null) samples.push(rpm); }, (err) => { $("quick-status").textContent = err; },
      (frame, sr, fft) => { specFrames.push(frame); specSr = sr; specFft = fft; });
    setTimeout(() => {
      ED_Audio.stop();
      if (!samples.length) { $("quick-status").textContent = "No clear pulse in 10 seconds. Try again closer to the exhaust."; return; }
      const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
      const sd = Math.round(Math.sqrt(samples.reduce((a, b) => a + (b - avg) * (b - avg), 0) / samples.length));
      const v = ED_Audio.inIdleSpec(avg, D.specs.idle_rpm);
      const stable = sd < 40;
      const hints = [];
      if (!stable) hints.push({ s: "Misfire pops / uneven firing", test: "Plug + coil checks (see Ignition tree)" });
      if (v === "low") hints.push({ s: "Lean idle", test: "Run the Lean idle tree — intake seals, then intermediate jet" });
      if (v === "high") hints.push({ s: "Intake leak or stuck enrichener", test: "Carb-cleaner spray test at the seals" });
      hints.push({ s: "Lifter tick (half engine speed)", test: "Check lifter bleed-down and oil" });
      $("quick-status").textContent = "RPM " + avg + " (stability ±" + sd + " rpm) — " + (stable ? "steady idle" : "uneven idle") + ".";
      const nowBands = ED_Audio.spectrumToBands(ED_Audio.averageSpectrum(specFrames), specSr, specFft);
      const base = state.baselines[state.bike];
      const cmp = base ? ED_Audio.compareBaseline({ rpm: avg, sd, spectrum: nowBands }, base) : null;
      $("quick-results").innerHTML = "<h3>Top likely sounds</h3><p class='ed-note'>Hints from 10 seconds of sound, never a verdict. Each names its confirming test.</p>" +
        (cmp ? "<div class='ed-verdict " + (cmp.verdict === "close" ? "ok" : "soon") + "'>vs your baseline: " + (cmp.rpmDelta >= 0 ? "+" : "") + cmp.rpmDelta + " rpm" + (cmp.sdDelta != null ? ", stability " + (cmp.sdDelta >= 0 ? "+" : "") + cmp.sdDelta : "") + " — " + cmp.text + "</div>" : "<p class='ed-note'>No baseline for this bike yet — save one in Healthy baselines and future listens compare against it.</p>") +
        spectrumHtml(cmp, base, nowBands) +
        hints.slice(0, 3).map((h, i) => "<div class='ed-cause'><b>" + (i + 1) + ". " + h.s + "</b><br>Confirming test: " + h.test + "</div>").join("");
      wireSpectrumTreeButtons($("quick-results"));
    }, 10000);
  });

  /* ---------- spectrum comparison display ----------
     Which diagnostic tree a changed band genuinely points at. A band
     with no entry has no tree in this app — the UI says so rather than
     stretching one. Sound never asserts a cause; the tree does the
     confirming, with its own tests. */
  const SPECTRUM_TREE_LINKS = {
    rumble: "engine-noise",
    lowmid: "engine-noise",
    mid: "primary-drive",
    uppermid: "engine-noise",
    tick: "engine-noise",
    hiss: "engine-noise"
  };
  function fmtFreq(hz) { return hz >= 1000 ? (hz / 1000) + "k" : String(hz); }
  function spectrumChartSvg(bands) {
    const BOT = 150, TOP = 8, MIN = -90, MAX = -30;
    const h = (db) => Math.max(0, Math.min(1, (db - MIN) / (MAX - MIN))) * (BOT - TOP);
    let s = "<svg viewBox='0 0 560 190' style='width:100%;height:auto;display:block;background:#0d0d10;border:1px solid #333;border-radius:8px' role='img' aria-label='Spectrum chart: baseline vs now, per frequency band'>";
    [-90, -60, -30].forEach((db) => {
      const y = BOT - h(db);
      s += "<line x1='0' y1='" + y + "' x2='560' y2='" + y + "' stroke='#333' stroke-width='1'/><text x='4' y='" + (y - 3) + "' fill='#999' font-size='10'>" + db + " dB</text>";
    });
    bands.forEach((b, i) => {
      const x = 8 + i * 69;
      const hb = h(b.base), hn = h(b.now);
      s += "<rect x='" + x + "' y='" + (BOT - hb) + "' width='26' height='" + hb + "' fill='#9d6bff'/>";
      s += "<rect x='" + (x + 30) + "' y='" + (BOT - hn) + "' width='26' height='" + hn + "' fill='#d9d9e0'/>";
      s += "<text x='" + (x + 28) + "' y='164' fill='#bbb' font-size='10' text-anchor='middle'>" + b.label + "</text>";
      s += "<text x='" + (x + 28) + "' y='177' fill='#888' font-size='9' text-anchor='middle'>" + fmtFreq(b.lo) + "–" + fmtFreq(b.hi) + " Hz</text>";
    });
    return s + "</svg>";
  }
  function spectrumHtml(cmp, base, nowBands) {
    if (!base) return "";
    if (!base.spectrum) return "<h3>Sound spectrum vs baseline</h3><p class='ed-note'>This baseline has no spectrum stored yet — it was saved before spectrum capture, or the capture had no frequency data. Re-save it in Healthy baselines and future listens compare the sound itself, not just RPM.</p>";
    if (!cmp || !cmp.spectrum) return "<h3>Sound spectrum vs baseline</h3><p class='ed-note'>The stored spectrum uses an older band layout — re-save the baseline in Healthy baselines to compare spectra again.</p>";
    if (!nowBands) return "<h3>Sound spectrum vs baseline</h3><p class='ed-note'>No spectrum captured this listen — the frequency data came back empty. The RPM comparison above still stands.</p>";
    const spec = cmp.spectrum;
    const unchanged = spec.bands.filter((b) => !b.changed).map((b) => b.label).join(", ");
    let html = "<h3>Sound spectrum vs baseline</h3>" +
      "<p class='ed-note'>Spectrum comparison is not yet validated against real recordings — it is proven on synthetic test tones only. It shows WHERE the sound changed, never what caused it.</p>" +
      spectrumChartSvg(spec.bands) +
      "<p class='ed-note'><span style='color:#9d6bff'>&#9632;</span> baseline &nbsp; <span style='color:#d9d9e0'>&#9632;</span> now &nbsp;·&nbsp; a band counts as changed at ±6 dB or more</p>";
    spec.bands.filter((b) => b.changed).forEach((b) => {
      const treeId = SPECTRUM_TREE_LINKS[b.id];
      const tree = treeId ? D.trees.find((t) => t.id === treeId) : null;
      let note;
      if (b.id === "air") note = "Air is the wind / mic-noise control band — if only this band moved, suspect wind, not the engine. No tree maps to it.";
      else if (!tree) note = "No tree in this app maps to this band alone — the RPM comparison above is the read that matters here.";
      else note = "A change " + (b.delta > 0 ? "up here" : "down here") + " is the kind of thing the " + tree.title + " covers — run it.";
      html += "<div class='ed-safety'><b>" + b.label + " (" + fmtFreq(b.lo) + "–" + fmtFreq(b.hi) + " Hz): " + (b.delta >= 0 ? "+" : "") + b.delta + " dB</b> — " + b.base + " dB baseline, " + b.now + " dB now. " + b.lives + ".<br>" + note +
        (tree ? "<br><button class='ed-btn ghost' data-spectrum-tree='" + tree.id + "'>Run the " + tree.title + "</button>" : "") + "</div>";
    });
    if (!spec.changed.length) html += "<p class='ed-note'>No band moved more than ±6 dB — the sound itself matches your baseline.</p>";
    else if (unchanged) html += "<p class='ed-note'>No change (±6 dB or less) in: " + unchanged + ".</p>";
    return html;
  }
  function wireSpectrumTreeButtons(el) {
    el.querySelectorAll("[data-spectrum-tree]").forEach((btn) => btn.addEventListener("click", () => {
      const t = D.trees.find((x) => x.id === btn.dataset.spectrumTree);
      if (t) startTree(t);
    }));
  }

  /* ---------- video: 10-second clips ---------- */
  $("clip-record").addEventListener("click", () => {
    const status = $("clip-status"), preview = $("clip-preview"), dl = $("clip-download");
    status.textContent = "Asking for the camera…";
    preview.style.display = "none"; dl.innerHTML = "";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      status.textContent = "This browser cannot record video. The photo upload and the RPM meter still work.";
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      const type = $("clip-type").value;
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        preview.src = url; preview.style.display = "block";
        const bike = allBikes().find((b) => b.id === state.bike);
        dl.innerHTML = "<a href='" + url + "' download='evo-clip-" + type + ".webm'>Download this clip</a> <span class='ed-note'>(" + type + ", " + (bike ? bike.name : "") + ", " + new Date().toLocaleString() + " — clips live in this visit only)</span>";
        status.textContent = "Recorded. Play it back, download it, and attach the file when you share a diagnosis.";
      };
      rec.start();
      let left = 10;
      status.textContent = "Recording… " + left + " s";
      const tick = setInterval(() => {
        left--;
        if (left <= 0) { clearInterval(tick); if (rec.state !== "inactive") rec.stop(); }
        else status.textContent = "Recording… " + left + " s";
      }, 1000);
    }).catch((e) => { status.textContent = "Camera unavailable: " + (e && e.message ? e.message : e) + ". Check the browser permission and try again."; });
  });

  $("baseline-save").addEventListener("click", () => {
    $("baseline-list").innerHTML = "<p class='ed-note'>Recording 10 seconds of idle…</p>";
    const samples = [];
    const specFrames = [];
    let specSr = 0, specFft = 0;
    ED_Audio.start((rpm) => { if (rpm != null) samples.push(rpm); }, (err) => { $("baseline-list").textContent = err; },
      (frame, sr, fft) => { specFrames.push(frame); specSr = sr; specFft = fft; });
    setTimeout(() => {
      ED_Audio.stop();
      if (!samples.length) { $("baseline-list").innerHTML = "<p class='ed-note'>No clear pulse. Try again closer to the exhaust.</p>"; return; }
      const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
      const sd = Math.round(Math.sqrt(samples.reduce((a, b) => a + (b - avg) * (b - avg), 0) / samples.length));
      const spectrum = ED_Audio.spectrumToBands(ED_Audio.averageSpectrum(specFrames), specSr, specFft);
      state.baselines[state.bike] = { rpm: avg, sd, when: new Date().toISOString() };
      if (spectrum) { state.baselines[state.bike].spectrum = spectrum; state.baselines[state.bike].spectrumVersion = ED_Audio.SPECTRUM_VERSION; }
      store.save(state);
      renderBaselines();
    }, 10000);
  });
  function renderBaselines() {
    const el = $("baseline-list");
    const rows = Object.entries(state.baselines).map(([bid, b]) => {
      const bike = allBikes().find((x) => x.id === bid);
      return "<p>" + (bike ? bike.name : bid) + ": " + b.rpm + " rpm" + (b.sd != null ? " (±" + b.sd + ")" : "") + ", recorded " + new Date(b.when).toLocaleDateString() +
        (b.spectrum ? " · spectrum stored" : " · no spectrum yet — re-save to add one") + "</p>";
    });
    el.innerHTML = rows.length ? rows.join("") : "<p class='ed-note'>No baselines yet.</p>";
  }
  renderBaselines();
  $("sound-list").innerHTML = D.sound_hints.map((s) =>
    "<p><b>" + s.sound + "</b> — " + s.rate + "<br><span class='ed-note'>Confirming test: " + s.test + " · Urgency: " + s.urgency + "</span></p>").join("");
  /* ---------- listen and compare (YouTube links only) ---------- */
  $("compare-list").innerHTML = D.listen_compare.map((c) =>
    "<div class='ed-cause'><b>" + c.sound + "</b> — " + c.bike +
    "<br>" + c.claim +
    "<br><a href='" + c.url + "' target='_blank' rel='noopener'>Watch on YouTube</a>" +
    "<br><span class='ed-note'>Caveat: " + c.caveat + "</span></div>").join("");
  /* ---------- torque & specs (FSM #99482-98 §2) ----------
     Rows come from the shared parts core via the data.js index (table id
     + ordered slug list) — never a bare fastener name, so the Sportster
     and Softail values for the same fastener stay separate. The Clymer
     chapter is local (not in the core v1) and renders after the module
     chapters, same heading + row shape. No core, no torque tables. */
  function torqueRowsFor(t) {
    if (!PartsCore) return [];
    return t.slugs.map((s) => PartsCore.getTorque(t.id, s)).filter(Boolean);
  }
  function renderTorqueRows(filter) {
    const q = (filter || "").toLowerCase();
    if (!PartsCore) {
      $("torque-table").innerHTML = "<p class='ed-note'>Torque tables are not available — the shared parts core did not load. Capacities, pressures and dimensions below are unaffected.</p>";
      $("torque-chapters").innerHTML = "";
      return;
    }
    const rows = torqueRowsFor(D.torque.sec2).filter((r) => !q || r.fastener.toLowerCase().includes(q));
    $("torque-table").innerHTML = rows.length
      ? rows.map((r) => "<div class='ed-cause'><b>" + r.fastener + "</b><br>" + r.value + "</div>").join("")
      : "<p class='ed-note'>No fastener matches that search.</p>";
    const chapters = D.torque.chapters.map((c) => {
      const cr = torqueRowsFor(c).filter((r) => !q || r.fastener.toLowerCase().includes(q));
      return cr.length
        ? "<h4>" + c.title + " <span class='ed-note'>(" + c.ref + ")</span></h4>" +
          cr.map((r) => "<div class='ed-cause'><b>" + r.fastener + "</b><br>" + r.value + "</div>").join("")
        : "";
    }).join("");
    const cy = D.torque.clymer;
    const cyr = cy.rows.filter((r) => !q || r.fastener.toLowerCase().includes(q));
    const clymerHtml = cyr.length
      ? "<h4>" + cy.title + " <span class='ed-note'>(" + cy.ref + ")</span></h4>" +
        cyr.map((r) => "<div class='ed-cause'><b>" + r.fastener + "</b><br>" + r.value + "</div>").join("")
      : "";
    $("torque-chapters").innerHTML = (chapters + clymerHtml) || (q ? "<p class='ed-note'>No chapter fastener matches that search.</p>" : "");
  }
  renderTorqueRows("");
  $("torque-search").addEventListener("input", (e) => renderTorqueRows(e.target.value));
  $("torque-capacities").innerHTML = "<p>" + D.torque.capacities.all + "</p><p>" + D.torque.capacities.flstc + "</p><p>" + D.torque.capacities.fxstc + "</p><p>" + D.torque.capacities.sportster + "</p>";
  /* ---------- torque sequences (FSM #99482-98 §3, verified from rendered pages) ---------- */
  const SEQ_SVG_HEAD = "<svg viewBox='0 0 300 230' width='100%' role='img' aria-label='Cylinder head bolt numbering, front and rear heads'><text x='150' y='12' text-anchor='middle' fill='#c8c8c8' font-size='12' letter-spacing='2'>FRONT CYLINDER</text><rect x='10' y='18' width='280' height='80' rx='6' fill='#111111' stroke='#c8c8c8' stroke-width='2'/><g font-size='15' font-weight='bold' text-anchor='middle'><circle cx='50' cy='45' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='50' fill='#ffffff'>1</text><circle cx='250' cy='45' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='50' fill='#ffffff'>3</text><circle cx='50' cy='80' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='85' fill='#ffffff'>2</text><circle cx='250' cy='80' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='85' fill='#ffffff'>4</text></g><text x='150' y='122' text-anchor='middle' fill='#c8c8c8' font-size='12' letter-spacing='2'>REAR CYLINDER — MIRRORED</text><rect x='10' y='128' width='280' height='80' rx='6' fill='#111111' stroke='#c8c8c8' stroke-width='2'/><g font-size='15' font-weight='bold' text-anchor='middle'><circle cx='50' cy='155' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='160' fill='#ffffff'>2</text><circle cx='250' cy='155' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='160' fill='#ffffff'>4</text><circle cx='50' cy='190' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='195' fill='#ffffff'>1</text><circle cx='250' cy='190' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='195' fill='#ffffff'>3</text></g><text x='150' y='226' text-anchor='middle' fill='#c8c8c8' font-size='11'>Simplified schematic — numbering per FSM Fig. 3-16</text></svg>";
  const SEQ_SVG_CASE = "<svg viewBox='0 0 300 260' width='100%' role='img' aria-label='Crankcase fastener numbering, eight positions'><rect x='105' y='8' width='34' height='55' rx='4' fill='#1a1a1a' stroke='#c8c8c8' stroke-width='2' transform='rotate(-20 122 35)'/><rect x='161' y='8' width='34' height='55' rx='4' fill='#1a1a1a' stroke='#c8c8c8' stroke-width='2' transform='rotate(20 178 35)'/><rect x='30' y='45' width='240' height='195' rx='45' fill='#111111' stroke='#c8c8c8' stroke-width='2'/><circle cx='150' cy='150' r='52' fill='#070709' stroke='#c8c8c8' stroke-width='2'/><g font-size='13' font-weight='bold' text-anchor='middle'><circle cx='188' cy='182' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='188' y='187' fill='#ffffff'>1</text><circle cx='150' cy='62' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='150' y='67' fill='#ffffff'>2</text><circle cx='112' cy='182' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='112' y='187' fill='#ffffff'>3</text><circle cx='228' cy='88' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='228' y='93' fill='#ffffff'>4</text><circle cx='52' cy='150' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='52' y='155' fill='#ffffff'>5</text><circle cx='248' cy='150' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='248' y='155' fill='#ffffff'>6</text><circle cx='78' cy='82' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='78' y='87' fill='#ffffff'>7</text><circle cx='212' cy='202' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='212' y='207' fill='#ffffff'>8</text></g><text x='150' y='256' text-anchor='middle' fill='#c8c8c8' font-size='11'>Simplified schematic — numbering per FSM Fig. 3-88</text></svg>";
  $("torque-sequences").innerHTML = PartsCore
    ? D.torque.sequences.map((id) => PartsCore.getTorqueSequence(id)).filter(Boolean).map((s) =>
    "<div class='ed-cause'><h4>" + s.title + " <span class='ed-note'>(" + s.ref + ")</span></h4>" +
    "<p class='ed-note'>Numbering: " + s.figure + "</p>" +
    (s.id === "head-bolts" ? SEQ_SVG_HEAD : SEQ_SVG_CASE) +
    "<p><b>Caution:</b> " + s.caution + "</p>" +
    (s.prep ? "<p>Before you start:</p><ul>" + s.prep.map((p) => "<li>" + p + "</li>").join("") + "</ul>" : "") +
    "<ol>" + s.passes.map((p) => "<li><b>" + p.value + "</b> — order " + p.order + (p.note ? " (" + p.note + ")" : "") + "</li>").join("") + "</ol>" +
    (s.repeat ? "<p>" + s.repeat + "</p>" : "") +
    (s.note ? "<p class='ed-note'>" + s.note + "</p>" : "") + "</div>").join("")
    : "<p class='ed-note'>Torque sequences are not available — the shared parts core did not load.</p>";
  $("torque-pressures").innerHTML = "<p>" + D.torque.tire_pressures.flstc + "</p><p>" + D.torque.tire_pressures.fxstc + "</p><p class='ed-note'>" + D.torque.tire_pressures.note + "</p>";
  $("torque-dims").innerHTML = D.torque.dimensions.map((d) =>
    "<div class='ed-cause'><b>" + d.model + "</b> — " + d.length + " long · " + d.wheelbase + " wheelbase · " + d.saddle + " saddle · " + d.height + " high · " + d.dry + " dry · " + d.gvwr + " GVWR</div>").join("") +
    "<p class='ed-note'>Source: " + D.torque.source + "</p>";

  /* ---------- Sportster numbers (batch 2): Clymer, aftermarket, Sportster
     only — never factory, never a correction to the Softail numbers. --- */
  $("sportster-jetting").innerHTML =
    "<p>" + D.sportster_cv_jetting.note + " <i>Source: " + D.sportster_cv_jetting.source + "</i></p>" +
    ["usExceptCalifornia", "california", "hdi", "swiss"].map((k) => {
      const m = D.sportster_cv_jetting[k];
      return "<h4>" + m.label + "</h4>" +
        "<p><b>Main jets</b><br>" + m.main.map((r) => "<b>" + r.years + ":</b> 883 main " + r.m883 + " · 1200 main " + r.m1200 + (r.m1200S ? " · 1200S main " + r.m1200S : "") + (r.note ? " (" + r.note + ")" : "")).join("<br>") + "</p>" +
        "<p><b>Pilot jets</b><br>" + m.pilot.map((r) => "<b>" + r.years + ":</b> 883 pilot " + r.m883 + " · 1200 pilot " + r.m1200).join("<br>") + "</p>";
    }).join("") +
    "<h4>Float height</h4><p>" + D.sportster_cv_jetting.floatHeight.map((f) => "<b>" + f.years + ":</b> " + f.value).join("<br>") + "</p>" +
    "<p class='ed-note'>Source: " + D.sportster_cv_jetting.source + " — Clymer (aftermarket). Sportster only; never a correction to the Softail CV40 numbers (main 185 / pilot 45).</p>";
  $("sportster-tires").innerHTML =
    "<p>" + D.sportster_tire_pressures.note + " <i>Source: " + D.sportster_tire_pressures.source + "</i></p>" +
    [["upTo300lb", "Up to 300 lb load"], ["upToGVWR", "Up to GVWR"]].map(([k, title]) => {
      const g = D.sportster_tire_pressures[k];
      const rows = (list) => list.map((r) => "<b>" + r.models + ":</b> " + r.psi + " psi (" + r.kpa + " kPa)").join("<br>");
      return "<h4>" + title + "</h4><p><b>Front</b><br>" + rows(g.front) + "</p><p><b>Rear</b><br>" + rows(g.rear) + "</p>";
    }).join("") +
    "<p class='ed-note'>Source: " + D.sportster_tire_pressures.source + " — Clymer (aftermarket). Sportster only.</p>";
  $("sportster-fork-oil").innerHTML =
    "<p>" + D.sportster_fork_oil.note + " <i>Source: " + D.sportster_fork_oil.source + "</i></p>" +
    D.sportster_fork_oil.rows.map((r) => "<div class='ed-cause'><b>" + r.years + "</b><br>Wet: " + r.wetOz + " oz (" + r.wetMl + " ml) · Dry: " + r.dryOz + " oz (" + r.dryMl + " ml)</div>").join("") +
    "<p class='ed-note'>Source: " + D.sportster_fork_oil.source + " — Clymer (aftermarket). Sportster only.</p>";
  $("knucklehead-tires").innerHTML =
    "<p>" + D.knucklehead_tire_pressures.note + " <i>Source: " + D.knucklehead_tire_pressures.source + "</i></p>" +
    D.knucklehead_tire_pressures.rows.map((r) =>
      "<div class='ed-cause'><b>" + r.load + "</b><br>" + r.tire + ": front <b>" + r.front + " lbs.</b> · rear <b>" + r.rear + " lbs.</b>" +
      (r.sidecar !== null ? " · sidecar <b>" + r.sidecar + " lbs.</b>" : "") +
      (r.packageTruck !== null ? " · package truck <b>" + r.packageTruck + " lbs.</b>" : "") + "</div>").join("") +
    "<p class='ed-note'>Source: " + D.knucklehead_tire_pressures.source + " — Knucklehead only; never a correction to the Softail or Sportster pressures.</p>";

  /* ---------- shop tab: plug reader, wire/fuse, gear ratio, tap & drill,
     bolt ID, oil, compression ratio, carb CFM, sag, interchange, pre-ride,
     tire reader, unit converter, belt, clutch, primary chain, storage,
     brake pads, fork oil, first 500-mile service.
     All reference numbers live in ED_DATA.shop; all math in ED_Shop. --- */
  const SH = D.shop;
  /* 1. Plug reader */
  $("plug-reader").innerHTML =
    "<p>Stock plug: <b>" + SH.plug_reader.plug + "</b>, gap <b>" + SH.plug_reader.gap + "</b> in. <span class='ed-note'>(" + SH.plug_reader.ref + ")</span></p>" +
    SH.plug_reader.conditions.map((c) =>
      "<div class='ed-cause'><b>" + c.name + "</b> — " + c.look +
      "<br>Cause: " + c.cause +
      "<br>Action: " + c.action +
      (c.see ? "<br><span class='ed-note'>Next: " + c.see + "</span>" : "") + "</div>").join("") +
    SH.plug_reader.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("");
  /* 2. Wire & breaker */
  $("wire-fuse").innerHTML =
    "<h4>Circuit breakers <span class='ed-note'>(FSM §8 p. 8-1)</span></h4>" +
    SH.wire_fuse.breakers.map((b) => "<div class='ed-cause'><b>" + b.circuit + "</b> — " + b.amps + " A</div>").join("") +
    "<h4>Wire gauge by circuit <span class='ed-note'>(1997 Main Harness, App. A Table 2)</span></h4>" +
    SH.wire_fuse.wires.map((w) => "<div class='ed-cause'><b>" + w.circuit + "</b> — " + w.gauge + " GA</div>").join("") +
    SH.wire_fuse.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("") +
    "<p class='ed-note'>Source: " + SH.wire_fuse.ref + "</p>";
  /* 3. Gear ratio calculator */
  $("gear-ratio").innerHTML =
    "<label for='gr-comp'>Engine (compensating) sprocket teeth</label><input type='text' id='gr-comp' inputmode='numeric' value='25'>" +
    "<label for='gr-clutch'>Clutch sprocket teeth</label><input type='text' id='gr-clutch' inputmode='numeric' value='36'>" +
    "<label for='gr-trans'>Transmission sprocket teeth</label><input type='text' id='gr-trans' inputmode='numeric' value='32'>" +
    "<label for='gr-rear'>Rear wheel sprocket teeth</label><input type='text' id='gr-rear' inputmode='numeric' value='65'>" +
    "<label for='gr-years'>Internal gear ratios (Clymer Table 1)</label><select id='gr-years'>" +
    SH.gear_ratio.internal.map((y, i) => "<option value='" + i + "'>" + y.years + "</option>").join("") + "</select>" +
    "<label for='gr-gear'>Gear</label><select id='gr-gear'><option>1</option><option>2</option><option>3</option><option>4</option><option selected>5</option></select>" +
    "<label for='gr-tire'>Rear tire diameter, inches</label><input type='text' id='gr-tire' inputmode='decimal' value='25.21'>" +
    "<p class='ed-note'>Presets (computed from the published sizes): " + SH.gear_ratio.tire_presets.map((t) => t.label + " = " + t.dia_in + " in").join("; ") + ". " + SH.gear_ratio.tire_note + "</p>" +
    "<label for='gr-speed'>Speed, mph</label><input type='text' id='gr-speed' inputmode='numeric' value='60'>" +
    "<label for='gr-rpm'>Engine rpm</label><input type='text' id='gr-rpm' inputmode='numeric' value='3000'>" +
    "<div id='gr-result'></div>" +
    "<h4>Stock overall gear ratios <span class='ed-note'>(engine revs per one rear-wheel rev)</span></h4>" +
    SH.gear_ratio.overall.map((o) => "<p><b>" + o.years + ":</b> " + o.gears.map((g, i) => (i + 1) + ": " + g.toFixed(2)).join(" · ") + "</p>").join("") +
    "<p class='ed-note'>Source: " + SH.gear_ratio.ref + "</p>" +
    "<p class='ed-note'><b>Book contradiction — read this:</b> " + SH.gear_ratio.flag + "</p>";
  function renderGear() {
    const comp = parseFloat($("gr-comp").value), clutch = parseFloat($("gr-clutch").value);
    const trans = parseFloat($("gr-trans").value), rear = parseFloat($("gr-rear").value);
    const gearIdx = parseInt($("gr-gear").value, 10) - 1;
    const yearSet = SH.gear_ratio.internal[parseInt($("gr-years").value, 10)];
    const tire = parseFloat($("gr-tire").value);
    const mph = parseFloat($("gr-speed").value), rpm = parseFloat($("gr-rpm").value);
    const primary = ED_Shop.primaryRatio(comp, clutch);
    const fin = ED_Shop.finalRatio(trans, rear);
    const internal = yearSet ? yearSet.gears[gearIdx] : null;
    const overall = ED_Shop.overallRatio(primary, internal, fin);
    const rpmAt = ED_Shop.rpmAtSpeed(mph, overall, tire);
    const mphAt = ED_Shop.speedAtRpm(rpm, overall, tire);
    $("gr-result").innerHTML = (primary === null || fin === null || internal === null || overall === null)
      ? "<p>Enter all four sprocket counts to see the ratios.</p>"
      : "<div class='ed-cause'><b>Primary</b> " + clutch + "/" + comp + " = " + primary.toFixed(2) + " : 1" +
        "<br><b>Final drive</b> " + rear + "/" + trans + " = " + fin.toFixed(3) + " : 1" +
        "<br><b>" + yearSet.years + " gear " + (gearIdx + 1) + "</b> = " + internal.toFixed(2) + " : 1" +
        "<br><b>Overall</b> = " + overall.toFixed(3) + " : 1 (engine revs per wheel rev)" +
        (rpmAt !== null ? "<br><b>" + mph + " mph in gear " + (gearIdx + 1) + " = " + rpmAt + " rpm</b>" : "") +
        (mphAt !== null ? "<br><b>" + rpm + " rpm in gear " + (gearIdx + 1) + " = " + mphAt + " mph</b>" : "") + "</div>";
  }
  ["gr-comp", "gr-clutch", "gr-trans", "gr-rear", "gr-years", "gr-gear", "gr-tire", "gr-speed", "gr-rpm"].forEach((id) =>
    $(id).addEventListener("input", renderGear));
  renderGear();
  /* 4. Tap & drill */
  $("tap-drill").innerHTML =
    "<label for='td-inch'>Inch thread</label><select id='td-inch'>" +
    SH.tap_drill.inch.map((r) => "<option>" + r.thread + "</option>").join("") + "</select>" +
    "<p id='td-inch-out'></p>" +
    "<label for='td-metric'>Metric thread</label><select id='td-metric'>" +
    SH.tap_drill.metric.map((r) => "<option>" + r.thread + "</option>").join("") + "</select>" +
    "<p id='td-metric-out'></p>" +
    "<h4>Inch — full table</h4>" +
    SH.tap_drill.inch.map((r) => "<div class='ed-cause'><b>" + r.thread + "</b> — drill " + r.drill + "</div>").join("") +
    "<h4>Metric — full table</h4>" +
    SH.tap_drill.metric.map((r) => "<div class='ed-cause'><b>M" + r.thread + "</b> — drill " + r.drill + " (" + r.decimal + " in, nearest " + r.fraction + ")</div>").join("") +
    SH.tap_drill.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("") +
    "<p class='ed-note'>Source: " + SH.tap_drill.ref + "</p>";
  function renderTap() {
    $("td-inch-out").innerHTML = "<b>" + $("td-inch").value + "</b> — tap drill <b>" + ED_Shop.tapDrillInch($("td-inch").value, SH.tap_drill.inch) + "</b>";
    const m = SH.tap_drill.metric.find((r) => r.thread === $("td-metric").value);
    $("td-metric-out").innerHTML = m ? "<b>M" + m.thread + "</b> — tap drill <b>" + m.drill + "</b> (" + m.decimal + " in)" : "";
  }
  $("td-inch").addEventListener("change", renderTap);
  $("td-metric").addEventListener("change", renderTap);
  renderTap();
  /* 5. Bolt ID */
  $("bolt-id").innerHTML =
    "<p class='ed-note'>" + SH.bolt_id.how + "</p>" +
    "<h4>SAE</h4>" +
    "<label for='bi-sae-dia'>Measured diameter, inches</label><input type='text' id='bi-sae-dia' inputmode='decimal' placeholder='e.g. 0.375'>" +
    "<label for='bi-sae-tpi'>Threads per inch</label><input type='text' id='bi-sae-tpi' inputmode='numeric' placeholder='e.g. 16'>" +
    "<p id='bi-sae-out'></p>" +
    "<h4>Metric</h4>" +
    "<label for='bi-m-dia'>Measured diameter, mm</label><input type='text' id='bi-m-dia' inputmode='decimal' placeholder='e.g. 8'>" +
    "<label for='bi-m-pitch'>Pitch, mm between threads</label><input type='text' id='bi-m-pitch' inputmode='decimal' placeholder='e.g. 1.25'>" +
    "<p id='bi-m-out'></p>" +
    "<p class='ed-note'>SAE series (" + SH.bolt_id.sae.length + " threads) and metric series (" + SH.bolt_id.metric.length + " threads) come from the tap-drill tables. Source: " + SH.bolt_id.ref + "</p>";
  function renderBolt() {
    const sd = parseFloat($("bi-sae-dia").value), st = parseFloat($("bi-sae-tpi").value);
    const hit = ED_Shop.boltIdSae(sd, st, SH.bolt_id.sae);
    $("bi-sae-out").innerHTML = !$("bi-sae-dia").value || !$("bi-sae-tpi").value ? "" :
      hit ? "That measures as <b>" + hit + "</b>." : "No match in the library tables for " + sd + " in / " + st + " TPI — re-measure, or it is a thread outside these tables.";
    const md = parseFloat($("bi-m-dia").value), mp = parseFloat($("bi-m-pitch").value);
    const mhit = ED_Shop.boltIdMetric(md, mp, SH.bolt_id.metric);
    $("bi-m-out").innerHTML = !$("bi-m-dia").value || !$("bi-m-pitch").value ? "" :
      mhit ? "That measures as <b>M" + mhit + "</b>." : "No match in the library tables for M" + md + " x " + mp + " — re-measure, or it is a thread outside these tables.";
  }
  ["bi-sae-dia", "bi-sae-tpi", "bi-m-dia", "bi-m-pitch"].forEach((id) =>
    $(id).addEventListener("input", renderBolt));
  /* 6. Oil viscosity */
  $("oil-viscosity").innerHTML =
    "<p><b>Rule:</b> " + SH.oil.rule + "</p>" +
    SH.oil.grades.map((g) => "<div class='ed-cause'><b>" + g.type + " " + g.viscosity + "</b> (" + g.hd_rating + ")" +
      "<br>Lowest ambient temperature: " + g.lowest_temp +
      "<br>Cold-weather starts below 50°F (10°C): " + g.cold_start + "</div>").join("") +
    "<p class='ed-note'>" + SH.oil.diesel + "</p>" +
    "<p class='ed-note'>" + SH.oil.service + "</p>" +
    "<p class='ed-note'>Source: " + SH.oil.ref + "</p>";
  /* 7. Compression ratio */
  $("compression-ratio").innerHTML =
    "<label for='cr-bore'>Bore, inches</label><input type='text' id='cr-bore' inputmode='decimal' value='3.498'>" +
    "<label for='cr-stroke'>Stroke, inches</label><input type='text' id='cr-stroke' inputmode='decimal' value='4.25'>" +
    "<label for='cr-chamber'>Chamber volume, cc (measured with a burette)</label><input type='text' id='cr-chamber' inputmode='decimal' value='78.7'>" +
    "<div id='cr-result'></div>" +
    "<h4>Stock numbers</h4>" +
    SH.compression_ratio.stock.map((s) => "<div class='ed-cause'><b>" + s.model + "</b> — bore " + s.bore_in + " in x stroke " + s.stroke_in + " in, " + s.disp_cid + " cu. in. (" + s.disp_cc + " cc), ratio <b>" + s.cr.toFixed(1) + ":1</b>" +
      "<br><span class='ed-note'>Chamber volume implied by the published ratio (derived, not published): " + s.chamber_cc_derived + " cc.</span></div>").join("") +
    "<p class='ed-note'>" + SH.compression_ratio.note + "</p>" +
    "<p class='ed-note'>Source: " + SH.compression_ratio.ref + "</p>";
  function renderCr() {
    const bore = parseFloat($("cr-bore").value), stroke = parseFloat($("cr-stroke").value), chamber = parseFloat($("cr-chamber").value);
    const swept = ED_Shop.sweptCcPerCyl(bore, stroke);
    const ratio = ED_Shop.compressionRatio(bore, stroke, chamber);
    $("cr-result").innerHTML = ratio === null ? "<p>Enter bore, stroke and a measured chamber volume.</p>"
      : "<div class='ed-cause'>Swept volume per cylinder: <b>" + swept.toFixed(1) + " cc</b> (" + (swept / 16.387).toFixed(2) + " cu. in.)" +
        "<br>Compression ratio: <b>" + ratio.toFixed(2) + " : 1</b></div>";
  }
  ["cr-bore", "cr-stroke", "cr-chamber"].forEach((id) => $(id).addEventListener("input", renderCr));
  renderCr();
  /* 8. Carb CFM */
  $("carb-cfm").innerHTML =
    "<p>Stock motor: <b>" + SH.carb_cfm.stock_disp_cid + " cu. in.</b> (" + SH.carb_cfm.carb + ").</p>" +
    "<label for='cfm-cid'>Displacement, cubic inches</label><input type='text' id='cfm-cid' inputmode='decimal' value='81.6'>" +
    "<label for='cfm-rpm'>RPM</label><input type='text' id='cfm-rpm' inputmode='numeric' value='5500'>" +
    "<label for='cfm-ve'>Volumetric efficiency, % (your assumption)</label><input type='text' id='cfm-ve' inputmode='numeric' value='85'>" +
    "<div id='cfm-result'></div>" +
    "<p class='ed-note'>" + SH.carb_cfm.note + "</p>" +
    "<p class='ed-note'>Source: " + SH.carb_cfm.ref + "</p>";
  function renderCfm() {
    const cfm = ED_Shop.carbCfm(parseFloat($("cfm-cid").value), parseFloat($("cfm-rpm").value), parseFloat($("cfm-ve").value));
    $("cfm-result").innerHTML = cfm === null ? "<p>Enter displacement, rpm and VE (0-100%).</p>"
      : "<div class='ed-cause'>Airflow the engine needs: <b>" + cfm + " CFM</b></div>";
  }
  ["cfm-cid", "cfm-rpm", "cfm-ve"].forEach((id) => $(id).addEventListener("input", renderCfm));
  renderCfm();
  /* 9. Sag setter */
  $("sag-setter").innerHTML =
    safetyHtml() +
    "<h4>Preload adjustment (FSM §2 p. 2-73)</h4>" +
    "<ol>" + SH.sag.procedure.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>" + SH.sag.magazine + "</p>" +
    "<h4>Measure the sag</h4>" +
    "<p class='ed-note'>" + SH.sag.measure + "</p>" +
    "<label for='sag-fu'>Front unloaded, inches</label><input type='text' id='sag-fu' inputmode='decimal' placeholder='axle to fender, wheel off ground'>" +
    "<label for='sag-fl'>Front loaded (you on it), inches</label><input type='text' id='sag-fl' inputmode='decimal' placeholder='same two points, you sitting on it'>" +
    "<label for='sag-ru'>Rear unloaded, inches</label><input type='text' id='sag-ru' inputmode='decimal' placeholder='axle to fender, wheel off ground'>" +
    "<label for='sag-rl'>Rear loaded (you on it), inches</label><input type='text' id='sag-rl' inputmode='decimal' placeholder='same two points, you sitting on it'>" +
    "<div id='sag-result'></div>" +
    "<p class='ed-note'><b>No target here on purpose:</b> " + SH.sag.no_target + "</p>" +
    "<p class='ed-note'>Source: " + SH.sag.ref + "</p>";
  function renderSag() {
    const f = ED_Shop.sagDrop(parseFloat($("sag-fu").value), parseFloat($("sag-fl").value));
    const r = ED_Shop.sagDrop(parseFloat($("sag-ru").value), parseFloat($("sag-rl").value));
    $("sag-result").innerHTML =
      (f === null && r === null) ? "" :
      "<div class='ed-cause'>" +
      (f !== null ? "Front sag: <b>" + f + " in</b><br>" : "") +
      (r !== null ? "Rear sag: <b>" + r + " in</b>" : "") + "</div>";
  }
  ["sag-fu", "sag-fl", "sag-ru", "sag-rl"].forEach((id) => $(id).addEventListener("input", renderSag));
  /* 10. Parts interchange */
  $("parts-interchange").innerHTML =
    SH.interchange.rows.map((r) => "<div class='ed-cause'><b>" + r.part + "</b> — " + r.fits +
      "<br>" + r.note +
      "<br><span class='ed-note'>Source: " + r.source + "</span></div>").join("") +
    "<p class='ed-note'>Source: " + SH.interchange.ref + "</p>";
  /* 11. Pre-ride check */
  $("pre-ride").innerHTML =
    "<p class='ed-note'>" + SH.preride.structure_note + "</p>" +
    SH.preride.groups.map((g) =>
      "<div class='ed-cause'><h4>" + g.letter + " — " + g.title + "</h4>" +
      (g.items.length ? g.items.map((it, i) => "<p><label style='font-weight:400'><input type='checkbox' style='width:auto;margin-right:8px'> " + it + "</label></p>").join("") : "<p class='ed-note'>" + g.note + "</p>") +
      (g.sub_items ? "<p><b>" + g.sub_title + "</b></p>" + g.sub_items.map((it) => "<p><label style='font-weight:400'><input type='checkbox' style='width:auto;margin-right:8px'> " + it + "</label></p>").join("") + "<p class='ed-note'>Source: " + g.sub_source + "</p>" : "") +
      "<p class='ed-note'>Source: " + g.source + "</p></div>").join("") +
    "<p class='ed-note'>Source: " + SH.preride.ref + "</p>";
  /* 12. Tire reader — decode the sidewall, then the DOT date */
  $("tire-reader").innerHTML =
    "<label for='tr-sidewall'>Sidewall marking (size + service description)</label><input type='text' id='tr-sidewall' inputmode='text' placeholder='e.g. 130/90-16 M/C 67H or MT90-16 74H' value='130/90-16 M/C 67H'>" +
    "<label for='tr-dot'>DOT date code (last 3 or 4 digits of the TIN)</label><input type='text' id='tr-dot' inputmode='numeric' placeholder='e.g. 5107'>" +
    "<div id='tr-result'></div>" +
    "<h4>Alpha to metric (approximate)</h4>" +
    SH.tire_reader.alpha.map((r) => "<div class='ed-cause'><b>" + r.alpha + "</b> — about " + r.metric + " (" + r.inch + " in)" + (r.note ? "<br><span class='ed-note'>" + r.note + "</span>" : "") + "</div>").join("") +
    SH.tire_reader.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("") +
    "<p class='ed-note'>Source: " + SH.tire_reader.ref + "</p>";
  function renderTireReader() {
    const size = ED_Shop.tireSizeDecode($("tr-sidewall").value, SH.tire_reader.alpha);
    const svc = ED_Shop.tireServiceDecode($("tr-sidewall").value, SH.tire_reader.load_index, SH.tire_reader.speed_rating);
    let html = "";
    if (size.error) {
      html = "<p>" + size.error + "</p>";
    } else {
      html = "<div class='ed-cause'>";
      if (size.system === "metric") {
        html += "<b>" + size.size_text + "</b> — metric: " + size.width_mm + " mm wide, sidewall " + size.aspect + "% of the width (" + Math.round(size.width_mm * size.aspect / 100) + " mm), " + size.construction + ", " + size.rim_in + " in rim.";
      } else if (size.system === "alpha") {
        html += "<b>" + size.size_text + "</b> — alpha-numeric: width code " + size.alpha + (size.metric_equiv ? ", about " + size.metric_equiv + " metric" : " (no conversion row in the table)") + ", aspect " + size.aspect + "%, " + size.construction + ", " + size.rim_in + " in rim.";
        if (size.metric_note) html += "<br><span class='ed-note'>" + size.metric_note + "</span>";
      } else {
        html += "<b>" + size.size_text + "</b> — inch size: " + size.width_in.toFixed(2) + " in (" + size.width_mm + " mm) wide, " + size.construction + ", " + size.rim_in + " in rim. No aspect ratio is printed on inch sizes.";
      }
      if (size.speed_prefix === "Z") html += "<br>Z in the size means rated over 149 mph — the service description after the size gives the actual limit.";
      if (svc.load) html += "<br>Load index <b>" + svc.load_index + "</b> = <b>" + svc.load.kg + " kg (" + svc.load.lb + " lb)</b> per tire, at the maker's specified pressure.";
      else if (svc.load_index !== null) html += "<br>Load index " + svc.load_index + " is outside the LI 40-91 table in the library — check the tire maker's chart.";
      if (svc.speed) html += "<br>Speed rating <b>" + svc.speed.symbol + "</b> = max sustained <b>" + svc.speed.kmh + " km/h (" + svc.speed.mph + " mph)</b> at rated load and correct inflation.";
      html += "</div>";
    }
    const dot = $("tr-dot").value.trim();
    if (dot) {
      const d = ED_Tire.decode(dot, new Date());
      if (d.error) html += "<p>" + d.error + "</p>";
      else {
        const cls = d.verdict === "green" ? "ok" : d.verdict === "amber" ? "soon" : "no";
        html += "<div class='ed-verdict " + cls + "'>" + d.text + "</div><p>" + d.note + " Age about " + d.age + " years.</p>";
      }
    }
    $("tr-result").innerHTML = html;
  }
  ["tr-sidewall", "tr-dot"].forEach((id) => $(id).addEventListener("input", renderTireReader));
  renderTireReader();
  /* 13. Unit converter — standard definitions, not manual specs */
  const UC = SH.unit_converter;
  $("unit-converter").innerHTML =
    "<label for='uc-cat'>What are you converting?</label><select id='uc-cat'>" +
    UC.categories.map((c) => "<option value='" + c.id + "'>" + c.label + "</option>").join("") + "</select>" +
    "<label for='uc-value'>Value</label><input type='text' id='uc-value' inputmode='decimal' value='1'>" +
    "<label for='uc-from'>From</label><select id='uc-from'></select>" +
    "<label for='uc-to'>To</label><select id='uc-to'></select>" +
    "<div id='uc-result'></div>" +
    UC.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("") +
    "<p class='ed-note'>Source: " + UC.ref + "</p>";
  function renderUcUnits() {
    const cat = UC.categories.find((c) => c.id === $("uc-cat").value) || UC.categories[0];
    $("uc-from").innerHTML = cat.units.map((u) => "<option value='" + u.code + "'>" + u.label + " (" + u.code + ")</option>").join("");
    $("uc-to").innerHTML = cat.units.map((u) => "<option value='" + u.code + "'>" + u.label + " (" + u.code + ")</option>").join("");
    /* Sensible defaults: torque starts ft-lb -> N·m, the shop's commonest ask. */
    if (cat.id === "torque") { $("uc-from").value = "ftlb"; $("uc-to").value = "Nm"; }
    if (cat.id === "length") { $("uc-from").value = "in"; $("uc-to").value = "mm"; }
    if (cat.id === "pressure") { $("uc-from").value = "psi"; $("uc-to").value = "kPa"; }
    if (cat.id === "volume") { $("uc-from").value = "qt"; $("uc-to").value = "mL"; }
    renderUc();
  }
  function renderUc() {
    const cat = UC.categories.find((c) => c.id === $("uc-cat").value) || UC.categories[0];
    const v = parseFloat($("uc-value").value);
    const out = ED_Shop.unitConvert(v, $("uc-from").value, $("uc-to").value, cat.units);
    $("uc-result").innerHTML = out === null ? "<p>Enter a value and pick two units.</p>"
      : "<div class='ed-cause'><b>" + v + " " + $("uc-from").value + " = " + (Math.round(out * 10000) / 10000) + " " + $("uc-to").value + "</b></div>";
  }
  ["uc-cat"].forEach((id) => $(id).addEventListener("change", renderUcUnits));
  ["uc-value"].forEach((id) => $(id).addEventListener("input", renderUc));
  ["uc-from", "uc-to"].forEach((id) => $(id).addEventListener("change", renderUc));
  renderUcUnits();
  /* 14. Drive belt — FSM §1 pp. 1-43–1-44, guided procedure */
  $("belt-adjust").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.belt.interval + "</p>" +
    "<p><b>Spec:</b> " + SH.belt.spec + "</p>" +
    SH.belt.conditions.map((c) => "<p class='ed-note'>• " + c + "</p>").join("") +
    "<ol>" + SH.belt.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.belt.caution + "</p>" +
    "<p class='ed-note'>Source: " + SH.belt.ref + "</p>";
  /* 15. Clutch adjustment — FSM §1 p. 1-40, guided procedure */
  $("clutch-adjust").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.clutch.interval + "</p>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.clutch.caution + "</p>" +
    "<ol>" + SH.clutch.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>" + SH.clutch.note + "</p>" +
    "<p class='ed-note'>Source: " + SH.clutch.ref + "</p>";
  /* 16. Primary chain — FSM §1 pp. 1-38–1-39, guided procedure */
  $("primary-chain").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.primary_chain.interval + "</p>" +
    "<p class='ed-note'><b>Warning:</b> " + SH.primary_chain.warning + "</p>" +
    "<p><b>Spec:</b> " + SH.primary_chain.spec + "</p>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.primary_chain.caution + "</p>" +
    "<ol>" + SH.primary_chain.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>" + SH.primary_chain.figure_note + "</p>" +
    "<p class='ed-note'>Source: " + SH.primary_chain.ref + "</p>";
  /* 17. Storage — FSM §1 p. 1-8, both directions */
  $("storage").innerHTML =
    safetyHtml() +
    "<p>" + SH.storage.intro + "</p>" +
    "<p class='ed-note'>" + SH.storage.dealer_note + "</p>" +
    SH.storage.warnings.map((w) => "<p class='ed-note'><b>Warning:</b> " + w + "</p>").join("") +
    "<h4>Putting it away</h4>" +
    "<ol>" + SH.storage.put_away.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Removal from storage</h4>" +
    "<p class='ed-note'><b>Warning:</b> " + SH.storage.removal_warning + "</p>" +
    "<ol>" + SH.storage.removal.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>Source: " + SH.storage.ref + "</p>";
  /* 18. Brake pad replacement — FSM §2 pp. 2-40–2-43 (front), 2-47–2-48 (rear) */
  $("brake-pads").innerHTML =
    safetyHtml() +
    "<p><b>Wear limit:</b> " + SH.brake_pads.wear_limit + "</p>" +
    "<p class='ed-note'><b>Warning:</b> " + SH.brake_pads.sets_rule + "</p>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.brake_pads.pump_caution + "</p>" +
    "<h4>Front caliper</h4>" +
    "<ol>" + SH.brake_pads.front.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>" + SH.brake_pads.front.piston_note + "</p>" +
    "<h4>Rear caliper</h4>" +
    "<ol>" + SH.brake_pads.rear.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>" + SH.brake_pads.rear.piston_note + "</p>" +
    "<p class='ed-note'><b>Burnish — the manual prints two distances:</b> " + SH.brake_pads.burnish_note + "</p>" +
    "<p class='ed-note'>Source: " + SH.brake_pads.ref + "</p>";
  /* 19. Fork oil change — FSM §1 p. 1-42 */
  $("fork-oil").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.fork_oil.interval + "</p>" +
    "<p><b>Fluid:</b> " + SH.fork_oil.fluid + "</p>" +
    "<ol>" + SH.fork_oil.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p><b>Capacities (wet):</b></p>" +
    SH.fork_oil.capacities.map((c) => "<p>" + c.models + " — " + c.wet + "</p>").join("") +
    "<p class='ed-note'>" + SH.fork_oil.note + "</p>" +
    "<p class='ed-note'>Source: " + SH.fork_oil.ref + "</p>";
  /* 20. First 500-mile service — FSM §1 p. 1-1 + Scheduled Service Table pp. 1-34–1-37 */
  $("first-500").innerHTML =
    safetyHtml() +
    "<p class='ed-note'>" + SH.first_500.dealer_note + "</p>" +
    "<p class='ed-note'>" + SH.first_500.deferral_note + "</p>" +
    "<h4>Check at first 500 miles — p. 1-1</h4>" +
    "<ol>" + SH.first_500.check_at_first_500.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Replace (R)</h4><ul>" + SH.first_500.replace.map((s) => "<li>" + s + "</li>").join("") + "</ul>" +
    "<h4>Perform (X)</h4><ul>" + SH.first_500.perform.map((s) => "<li>" + s + "</li>").join("") + "</ul>" +
    "<h4>Inspect (I)</h4><ul>" + SH.first_500.inspect.map((s) => "<li>" + s + "</li>").join("") + "</ul>" +
    "<h4>Lubricate (L)</h4><ul>" + SH.first_500.lubricate.map((s) => "<li>" + s + "</li>").join("") + "</ul>" +
    "<h4>Inspect + lubricate (IL)</h4><ul>" + SH.first_500.inspect_lubricate.map((s) => "<li>" + s + "</li>").join("") + "</ul>" +
    "<h4>Tighten (T)</h4><ul>" + SH.first_500.tighten.map((s) => "<li>" + s + "</li>").join("") + "</ul>" +
    "<p class='ed-note'><b>Not at 500 miles:</b> " + SH.first_500.not_at_500 + "</p>" +
    "<p class='ed-note'>Source: " + SH.first_500.ref + "</p>";
  /* 21. Engine oil change — FSM §1 p. 1-38 */
  $("engine-oil").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.engine_oil.interval + "</p>" +
    "<p><b>Spec:</b> " + SH.engine_oil.spec + "</p>" +
    "<ol>" + SH.engine_oil.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p><b>Oil grades (FSM §1 p. 1-38):</b></p>" +
    SH.engine_oil.oil_grades.map((g) => "<p>" + g.type + " " + g.viscosity + " (" + g.rating + ") — lowest ambient " + g.lowest_ambient + ", cold starts below 50°F: " + g.cold_starts_below_50F + "</p>").join("") +
    "<p class='ed-note'>" + SH.engine_oil.note + "</p>" +
    "<p class='ed-note'>Source: " + SH.engine_oil.ref + "</p>";
  /* 22. Transmission oil change — FSM §1 p. 1-41 */
  $("transmission-oil").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.transmission_oil.interval + "</p>" +
    "<p><b>Spec:</b> " + SH.transmission_oil.spec + "</p>" +
    "<ol>" + SH.transmission_oil.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'><b>Part-number conflict in the manual itself:</b> " + SH.transmission_oil.part_number_flag + "</p>" +
    "<p class='ed-note'>Source: " + SH.transmission_oil.ref + "</p>";
  /* 23. Primary chaincase oil change — FSM §1 pp. 1-39–1-40 */
  $("primary-oil").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.primary_oil.interval + "</p>" +
    "<p><b>Spec:</b> " + SH.primary_oil.spec + "</p>" +
    "<ol>" + SH.primary_oil.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.primary_oil.caution + "</p>" +
    "<p class='ed-note'>" + SH.primary_oil.note + "</p>" +
    "<p class='ed-note'>Source: " + SH.primary_oil.ref + "</p>";
  /* 24. Brake fluid bleed & flush — FSM §2 p. 2-49; §1 p. 1-42 */
  $("brake-fluid-flush").innerHTML =
    safetyHtml() +
    "<p><b>When:</b> " + SH.brake_fluid_flush.interval + "</p>" +
    "<p><b>Spec:</b> " + SH.brake_fluid_flush.spec + "</p>" +
    "<ol>" + SH.brake_fluid_flush.steps.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>" + SH.brake_fluid_flush.note + "</p>" +
    "<p class='ed-note'><b>Warning:</b> " + SH.brake_fluid_flush.warning + "</p>" +
    "<p class='ed-note'><b>Eye warning:</b> " + SH.brake_fluid_flush.eye_warning + "</p>" +
    "<p class='ed-note'><b>After service:</b> " + SH.brake_fluid_flush.after_service + "</p>" +
    "<p class='ed-note'><b>Reservoir:</b> " + SH.brake_fluid_flush.reservoir + "</p>" +
    "<p class='ed-note'>Source: " + SH.brake_fluid_flush.ref + "</p>";

  /* 25. CV carburetor rebuild — FSM §4 pp. 4-14–4-18 */
  $("carb-rebuild").innerHTML =
    safetyHtml() +
    "<p class='ed-note'><b>Warning:</b> " + SH.carb_rebuild.warning + "</p>" +
    "<p class='ed-note'>" + SH.carb_rebuild.figure_note + "</p>" +
    "<h4>Removal — p. 4-14</h4>" +
    "<ol>" + SH.carb_rebuild.removal.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Installation — p. 4-16</h4>" +
    "<p class='ed-note'><b>Note:</b> " + SH.carb_rebuild.installation_note + "</p>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.carb_rebuild.installation_caution + "</p>" +
    "<ol>" + SH.carb_rebuild.installation.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Disassembly — vacuum piston chamber, p. 4-16</h4>" +
    "<ol>" + SH.carb_rebuild.disassembly_vacuum_piston.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Disassembly — carburetor body, p. 4-16</h4>" +
    "<ol>" + SH.carb_rebuild.disassembly_carb_body.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Disassembly — accelerator pump, p. 4-16</h4>" +
    "<ol>" + SH.carb_rebuild.disassembly_accel_pump.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Cleaning and inspection — vacuum piston, p. 4-16</h4>" +
    "<ol>" + SH.carb_rebuild.cleaning_vacuum_piston.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Cleaning and inspection — carburetor body, p. 4-16</h4>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.carb_rebuild.cleaning_caution + "</p>" +
    "<ol>" + SH.carb_rebuild.cleaning_carb_body.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Float replacement — p. 4-17</h4>" +
    "<p class='ed-note'>" + SH.carb_rebuild.float_note + "</p>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.carb_rebuild.float_caution + "</p>" +
    "<h4>Accelerator pump — inspect, p. 4-17</h4>" +
    "<ol>" + SH.carb_rebuild.accel_pump_inspect.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Assembly — vacuum piston chamber, p. 4-17</h4>" +
    "<ol>" + SH.carb_rebuild.assembly_vacuum_piston.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Assembly — carburetor body, pp. 4-17–4-18</h4>" +
    "<p class='ed-note'><b>Caution:</b> " + SH.carb_rebuild.assembly_carb_body_caution + "</p>" +
    "<ol>" + SH.carb_rebuild.assembly_carb_body.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<h4>Assembly — accelerator pump, p. 4-18</h4>" +
    "<ol>" + SH.carb_rebuild.assembly_accel_pump.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
    "<p class='ed-note'>Source: " + SH.carb_rebuild.ref + "</p>";

  /* ---------- VIN (pure decode lives in vin.js, tested in test.js) ---------- */
  $("vin-decode").addEventListener("click", () => {
    const r = ED_VIN.decode($("vin-input").value);
    const el = $("vin-result");
    if (r.error) { el.innerHTML = "<p>" + r.error + "</p>"; return; }
    el.innerHTML = "<p>Check digit: " + (r.checkDigitOk ? "valid" : "INVALID — expected " + r.checkDigit + ", found " + r.vin[8] + ". Double-check the VIN.") + "</p>" +
      "<p>Year: " + (r.year ? r.year + " (code " + r.yearCode + ")" + (r.yearAmbiguous ? " — or " + r.yearAmbiguous + ", year codes repeat every 30 years" : "") : "unknown code " + r.yearCode) + "</p>" +
      "<p>Model: " + (r.model || "not in the 1997-98 Softail / 1986-2003 Sportster tables (code " + r.modelCode + ")") + "</p>" +
      "<p>Engine: " + (r.engineName || ("type code " + r.engineType)) + " &middot; Plant: " + (r.plantName || r.plant) + " &middot; Serial: <span class='ed-mono'>" + r.serial + "</span></p>" +
      "<p class='ed-note'>" + r.note + "</p>";
  });

  /* ---------- Knucklehead engine serial (1940-47) — a different system
     from the 17-digit VIN above. Pure decode lives in vin.js, tested in
     test.js. Evo-era year codes never apply here. ---------- */
  $("knuck-decode").addEventListener("click", () => {
    const r = ED_VIN.decodeKnucklehead($("knuck-input").value);
    const el = $("knuck-result");
    if (r.error) { el.innerHTML = "<p>" + r.error + "</p>"; return; }
    el.innerHTML = "<p>Year: <b>" + r.year + "</b> (leading two digits &ldquo;" + r.yearDigits + "&rdquo;)</p>" +
      "<p>Model: " + (r.model ? "<b>" + r.modelCode + "</b> — " + r.model : "<b>" + r.modelCode + " — UNKNOWN model code.</b> Not in the manual's p. 3 table, so it is not guessed.") + "</p>" +
      "<p>Serial number: <span class='ed-mono'>" + r.serialNumber + "</span> &middot; Full serial: <span class='ed-mono'>" + r.serial + "</span></p>" +
      "<p class='ed-note'>" + r.note + "</p>";
  });

  /* ---------- flash codes (1998 XL1200S only) + tire date ---------- */
  $("flash-lookup").addEventListener("click", () => {
    const el = $("flash-result");
    const code = parseInt($("flash-input").value.trim(), 10);
    const hit = D.flash_codes.find((f) => f.code === code);
    if (!hit) {
      el.innerHTML = "<p>Code " + ($("flash-input").value.trim() || "?") + " is not in the 1998 XL1200S table (codes 12, 16, 24, 25, 35, 41, 44, 52, 54, 55). Re-count the flashes — the first digit comes after the intermission and a 2-second pause.</p>";
      return;
    }
    el.innerHTML = "<div class='ed-cause'><b>Code " + hit.code + " — " + hit.desc + "</b><br>Flow chart: Sportster XLH 1998 Service Manual 99484-98, p. " + hit.ref + ".</div>" +
      "<p class='ed-note'>" + D.flash_codes_how + "</p>";
  });
  $("tire-lookup").addEventListener("click", () => {
    const el = $("tire-result");
    const r = ED_Tire.decode($("tire-input").value.trim());
    if (r.error) { el.innerHTML = "<p>" + r.error + "</p>"; return; }
    const cls = r.verdict === "green" ? "ok" : r.verdict === "amber" ? "soon" : "no";
    el.innerHTML = "<div class='ed-verdict " + cls + "'>" + r.text + "</div>" +
      "<p>" + r.note + " Age about " + r.age + " years.</p>";
  });

  /* ---------- recalls ---------- */
  let bundle = null;
  fetch("data/nhtsa-evo-bundle.json").then((r) => r.json()).then((j) => { bundle = j; }).catch(() => {});
  $("recall-lookup").addEventListener("click", () => {
    const el = $("recall-results");
    if (!bundle) { el.innerHTML = "<p class='ed-note'>Bundle still loading — tap again in a moment.</p>"; return; }
    const model = $("recall-model").value;
    const year = parseInt($("recall-year").value, 10);
    const hits = bundle.recalls.filter((r) => r.model === model && r.model_years.includes(year));
    const tsbs = ED_NHTSA.matchTsbs(bundle.tsbs_harley_1995_1999, year);
    const unyearned = ED_NHTSA.unyearnedCount(bundle.tsbs_harley_1995_1999);
    const bars = ED_NHTSA.complaintBars(bundle.complaint_counts_by_component);
    const maxBar = bars.length ? bars[0].count : 1;
    let html = "<h3>Recalls — " + model + " " + (year || "?") + "</h3>";
    html += hits.length ? hits.map((r) =>
      "<div class='ed-cause'><b>" + r.campaign + "</b> — " + (r.component || "") +
      "<br>" + (r.summary || "") +
      "<br>Remedy: " + (r.remedy || "see dealer") + "</div>").join("")
      : "<p>No open campaigns in the bundle for this model and year. That covers only still-open recalls — confirm per-VIN at nhtsa.gov/recalls.</p>";
    html += "<h3>Service bulletins — " + (year || "?") + "</h3>";
    html += tsbs.length ? tsbs.slice(0, 10).map((t) =>
      "<div class='ed-cause'><b>" + (t.bulletin || "No number") + "</b> — " + t.component +
      "<br>" + t.summary.slice(0, 280) + (t.summary.length > 280 ? "…" : "") + "</div>").join("") +
      (tsbs.length > 10 ? "<p class='ed-note'>Showing 10 of " + tsbs.length + " bulletins for " + year + ".</p>" : "")
      : "<p class='ed-note'>No bulletin rows carry " + year + " as their model year in the 1995-1999 chunk.</p>";
    html += "<p class='ed-note'>" + unyearned + " bulletin rows in the bundle carry no model year at all, so they are not filtered by year. Summaries only — full bulletin text is a linked NHTSA PDF per row.</p>";
    html += "<h3>Complaints by component — all Evo years (" + bundle.complaint_total + " total)</h3>";
    html += bars.map((b) =>
      "<div class='ed-bar-row'><span class='ed-bar-label'>" + b.component + "</span><span class='ed-bar-track'><div style='width:" + Math.round((b.count / maxBar) * 100) + "%'></div></span><span>" + b.count + "</span></div>").join("");
    el.innerHTML = html;
  });

  /* ---------- data: history, export / import ----------
     Diagnosis history (batch 2): one record per finished diagnosis — date,
     bike, tree, answers, ranked causes, safe-to-ride verdict, top-cause
     result, wizard context when the tree came from the wizard. Records are
     appended, never overwritten; the rider deletes individual entries from
     the detail view. The bike filter shows one bike's record. */
  let viewedHist = null;
  function renderHistory() {
    const el = $("history-list");
    const detail = $("history-detail");
    const filterSel = $("history-bike");
    const cur = filterSel.value || "";
    filterSel.innerHTML = "<option value=''>All bikes</option>" +
      allBikes().map((b) => "<option value='" + b.id + "'" + (b.id === cur ? " selected" : "") + ">" + b.name + "</option>").join("");
    if (!state.sessions.length) {
      el.innerHTML = "<p class='ed-note'>No saved sessions yet — run a tree and tap Save session.</p>";
      detail.innerHTML = "";
      return;
    }
    const rows = state.sessions.map((s, i) => ({ s, i })).filter((r) => !cur || r.s.bike === cur);
    if (!rows.length) {
      el.innerHTML = "<p class='ed-note'>No saved diagnoses for this bike yet.</p>";
      detail.innerHTML = "";
      return;
    }
    el.innerHTML = rows.map((r) => {
      const bike = allBikes().find((b) => b.id === r.s.bike);
      const tree = D.trees.find((t) => t.id === r.s.tree);
      return "<button class='ed-tree-btn' data-hist='" + r.i + "'><b>" + (tree ? tree.title : r.s.tree) + "</b><br><span class='ed-note'>" + (bike ? bike.name : r.s.bike) + " · " + new Date(r.s.when).toLocaleString() + " · top cause: " + (r.s.ranked && r.s.ranked[0] ? r.s.ranked[0] : "—") + "</span></button>";
    }).reverse().join("");
    el.querySelectorAll("[data-hist]").forEach((btn) => btn.addEventListener("click", () => {
      viewedHist = parseInt(btn.dataset.hist, 10);
      const s = state.sessions[viewedHist];
      const tree = D.trees.find((t) => t.id === s.tree);
      const bike = allBikes().find((b) => b.id === s.bike);
      detail.innerHTML = "<h3>" + (tree ? tree.title : s.tree) + " — " + (bike ? bike.name : s.bike) + "</h3>" +
        "<p class='ed-note'>" + new Date(s.when).toLocaleString() + "</p>" +
        (s.verdict ? "<p><b>Safe to ride?</b> " + s.verdict + "</p>" : "") +
        (s.wizard ? "<p class='ed-note'>Wizard: " + ED_Wizard.describe(s.wizard.area, s.wizard.when, s.wizard.urgency) + "</p>" : "") +
        (s.answers || []).map((a) => "<p>" + a.q + "<br><b>" + a.a + "</b></p>").join("") +
        "<p><b>Ranked causes:</b><br>" + (s.ranked || []).map((c, i) => (i + 1) + ". " + c).join("<br>") + "</p>" +
        "<button class='ed-btn ghost' id='hist-delete'>Delete this entry</button>";
      $("hist-delete").addEventListener("click", () => {
        state.sessions.splice(viewedHist, 1);
        store.save(state);
        viewedHist = null;
        detail.innerHTML = "";
        renderHistory();
      });
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
  }
  $("history-bike").addEventListener("change", renderHistory);
  renderHistory();
  $("export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "evo-diagnostic-export.json";
    a.click();
  });
  $("import-btn").addEventListener("click", () => $("import").click());
  $("import").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        state = { sessions: j.sessions || [], baselines: j.baselines || {}, bike: j.bike || "b1", bikes: j.bikes || [], in_progress: j.in_progress || null };
        store.save(state);
        renderBikeSel();
        renderBaselines(); renderCarbs(); renderHistory(); renderResume();
        alert("Imported.");
      } catch (err) { alert("That file is not a valid export."); }
    };
    rd.readAsText(f);
  });
})();
