/* The Evo Diagnostic — app logic. Plain JavaScript, zero dependencies.
   Stores sessions + baselines on-device (localStorage). Nothing leaves the
   phone unless the user shares it. */
(function () {
  "use strict";
  const D = ED_DATA;
  const $ = (id) => document.getElementById(id);
  const store = {
    load() { try { return JSON.parse(localStorage.getItem("evo-diagnostic") || "{}"); } catch (e) { return {}; } },
    save(s) { localStorage.setItem("evo-diagnostic", JSON.stringify(s)); }
  };
  let state = store.load();
  state.sessions = state.sessions || [];
  state.baselines = state.baselines || {};
  state.bikes = state.bikes || [];
  state.bike = state.bike || "b1";
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

  let current = null; // {tree, step, weights, answers}
  function startTree(t) {
    current = { tree: t, step: 0, weights: {}, answers: [] };
    t.causes.forEach((c) => { current.weights[c.cause] = c.weight; });
    $("session").style.display = "block";
    $("results").style.display = "none";
    $("session-title").textContent = t.title + " — " + t.system;
    $("session-testcase").textContent = t.test_case || "";
    $("photo-preview").innerHTML = "";
    renderStep();
    $("session").scrollIntoView();
  }
  function renderStep() {
    const t = current.tree, el = $("tree-step");
    if (current.step >= t.steps.length) return finishTree();
    const s = t.steps[current.step];
    el.innerHTML = "<p><b>Step " + (current.step + 1) + " of " + t.steps.length + ":</b> " + s.q + "</p>" +
      "<p class='ed-note'>" + s.note + " <i>Source: " + s.cite + "</i></p>" +
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
    renderStep();
  }
  /* ---------- parts & prices (checked Nov 24, 2026; link out to verify) ---------- */
  function priceHtml(keys) {
    const entries = (Array.isArray(keys) ? keys : [keys]).flatMap((k) => {
      const e = D.prices[k];
      return e ? [e] : [];
    });
    if (!entries.length) return "";
    const lines = [];
    const priced = [];
    entries.forEach((r) => {
      if (r.see) {
        const rec = D.prices[r.see];
        if (rec) {
          lines.push(r.note + " <a href='" + rec.url + "' target='_blank' rel='noopener'>" + rec.name + " — $" + rec.price.toFixed(2) + "</a> (" + rec.source + ", checked Nov 24, 2026)");
          priced.push(rec);
        }
        return;
      }
      lines.push("<a href='" + r.url + "' target='_blank' rel='noopener'>" + r.name + " — $" + r.price.toFixed(2) + "</a> (" + r.source + ", checked Nov 24, 2026)" +
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
    let html = "<h3>Ranked likely causes</h3>" +
      "<p class='ed-note'>Ranked by the checks you just ran. Every cause names its confirming test — run it before buying parts. Confidence is a share of the weight from your answers, not a measurement.</p>" +
      "<div class='ed-verdict " + verdict.cls + "'>Safe to ride? " + verdict.text + "</div>";
    ranked.forEach((c) => {
      const pct = Math.round((c.score / total) * 100);
      html += "<div class='ed-cause " + c.urgency + "'><b>" + c.cause + "</b> — " + pct + "%" +
        "<br>Confirming test: " + c.test +
        "<br>Fix: " + c.fix +
        (c.source ? "<br><span class='ed-note'>Source: " + c.source + "</span>" : "") +
        (c.part ? priceHtml(c.part) : "") +
        "<br>Urgency: " + c.urgency + "</div>";
    });
    html += "<p class='ed-note'>DIY vs shop: the checks above are driveway work with basic tools. " +
      "A bottom-end knock or a brake leak is shop work. Prices were read from live product pages Nov 24, 2026, with a link out per part — verify before you buy, prices move.</p>" +
      "<button class='ed-btn' id='share-diag'>Share this diagnosis</button> " +
      "<button class='ed-btn ghost' id='save-diag'>Save session</button> " +
      "<button class='ed-btn' id='send-carb'>Send to Carb Journal</button> " +
      "<button class='ed-btn' id='send-log'>Send to Bike Log</button>";
    const res = $("results");
    res.innerHTML = html;
    res.style.display = "block";
    $("share-diag").addEventListener("click", () => shareDiagnosis(t, ranked, verdict.text));
    $("send-carb").addEventListener("click", () => sendDiagnosis(t, ranked, verdict.text, "diagnosis-to-carb"));
    $("send-log").addEventListener("click", () => sendDiagnosis(t, ranked, verdict.text, "diagnosis-to-task"));
    $("save-diag").addEventListener("click", () => {
      state.sessions.push({ when: new Date().toISOString(), bike: state.bike, tree: t.id, answers: current.answers, ranked: ranked.map((c) => c.cause) });
      store.save(state);
      renderHistory();
      $("save-diag").textContent = "Saved";
    });
    res.scrollIntoView();
  }
  function shareDiagnosis(t, ranked, verdict) {
    const bike = allBikes().find((b) => b.id === state.bike);
    const text = "The Evo Diagnostic — " + t.title + " (" + (bike ? bike.name : "") + ")\n" +
      "Safe to ride? " + verdict + "\n" +
      ranked.map((c, i) => (i + 1) + ". " + c.cause + " — test: " + c.test).join("\n") +
      "\nDiagnosis only — run the confirming test before buying parts.";
    if (navigator.share) navigator.share({ title: "Evo Diagnostic", text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert("Diagnosis copied — paste it to your mechanic or forum."));
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
        (D.prices[el.dataset.part] ? "<p>" + priceHtml(el.dataset.part).replace(/^<br>/, "") + "</p>" : "") +
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
  const grid = $("cc-grid");
  (D.own_photos || []).forEach((p) => {
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

  /* ---------- battery & charging guided tests (FSM #99482-98 section 8) ---------- */
  $("charging-tests").innerHTML =
    "<p class='ed-note'>" + D.charging_tests.intro + " <i>Source: " + D.charging_tests.ref + "</i></p>" +
    D.charging_tests.steps.map((s, i) =>
      "<div class='ed-cause'><b>" + (i + 1) + ". " + s.title + "</b>" +
      "<br>How: " + s.how +
      "<br>Pass: " + s.pass +
      "<br>Fail: " + s.fail + "</div>").join("") +
    D.charging_tests.notes.map((n) => "<p class='ed-note'>" + n + "</p>").join("");

  /* ---------- compression test guided card (FSM #99482-98 §3, pp. 3-11–3-12) ---------- */
  $("compression-tests").innerHTML =
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
    ED_Audio.start((rpm) => { if (rpm != null) samples.push(rpm); }, (err) => { $("quick-status").textContent = err; });
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
      const base = state.baselines[state.bike];
      const cmp = base ? ED_Audio.compareBaseline({ rpm: avg, sd }, base) : null;
      $("quick-results").innerHTML = "<h3>Top likely sounds</h3><p class='ed-note'>Hints from 10 seconds of sound, never a verdict. Each names its confirming test.</p>" +
        (cmp ? "<div class='ed-verdict " + (cmp.verdict === "close" ? "ok" : "soon") + "'>vs your baseline: " + (cmp.rpmDelta >= 0 ? "+" : "") + cmp.rpmDelta + " rpm" + (cmp.sdDelta != null ? ", stability " + (cmp.sdDelta >= 0 ? "+" : "") + cmp.sdDelta : "") + " — " + cmp.text + "</div>" : "<p class='ed-note'>No baseline for this bike yet — save one in Healthy baselines and future listens compare against it.</p>") +
        hints.slice(0, 3).map((h, i) => "<div class='ed-cause'><b>" + (i + 1) + ". " + h.s + "</b><br>Confirming test: " + h.test + "</div>").join("");
    }, 10000);
  });

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
    ED_Audio.start((rpm) => { if (rpm != null) samples.push(rpm); }, (err) => { $("baseline-list").textContent = err; });
    setTimeout(() => {
      ED_Audio.stop();
      if (!samples.length) { $("baseline-list").innerHTML = "<p class='ed-note'>No clear pulse. Try again closer to the exhaust.</p>"; return; }
      const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
      const sd = Math.round(Math.sqrt(samples.reduce((a, b) => a + (b - avg) * (b - avg), 0) / samples.length));
      state.baselines[state.bike] = { rpm: avg, sd, when: new Date().toISOString() };
      store.save(state);
      renderBaselines();
    }, 10000);
  });
  function renderBaselines() {
    const el = $("baseline-list");
    const rows = Object.entries(state.baselines).map(([bid, b]) => {
      const bike = allBikes().find((x) => x.id === bid);
      return "<p>" + (bike ? bike.name : bid) + ": " + b.rpm + " rpm" + (b.sd != null ? " (±" + b.sd + ")" : "") + ", recorded " + new Date(b.when).toLocaleDateString() + "</p>";
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
  /* ---------- torque & specs (FSM #99482-98 §2) ---------- */
  function renderTorqueRows(filter) {
    const q = (filter || "").toLowerCase();
    const rows = D.torque.rows.filter((r) => !q || r.fastener.toLowerCase().includes(q));
    $("torque-table").innerHTML = rows.length
      ? rows.map((r) => "<div class='ed-cause'><b>" + r.fastener + "</b><br>" + r.value + "</div>").join("")
      : "<p class='ed-note'>No fastener matches that search.</p>";
    const chapters = D.torque.chapters.map((c) => {
      const cr = c.rows.filter((r) => !q || r.fastener.toLowerCase().includes(q));
      return cr.length
        ? "<h4>" + c.title + " <span class='ed-note'>(" + c.ref + ")</span></h4>" +
          cr.map((r) => "<div class='ed-cause'><b>" + r.fastener + "</b><br>" + r.value + "</div>").join("")
        : "";
    }).join("");
    $("torque-chapters").innerHTML = chapters || (q ? "<p class='ed-note'>No chapter fastener matches that search.</p>" : "");
  }
  renderTorqueRows("");
  $("torque-search").addEventListener("input", (e) => renderTorqueRows(e.target.value));
  $("torque-capacities").innerHTML = "<p>" + D.torque.capacities.all + "</p><p>" + D.torque.capacities.flstc + "</p><p>" + D.torque.capacities.fxstc + "</p>";
  /* ---------- torque sequences (FSM #99482-98 §3, verified from rendered pages) ---------- */
  const SEQ_SVG_HEAD = "<svg viewBox='0 0 300 230' width='100%' role='img' aria-label='Cylinder head bolt numbering, front and rear heads'><text x='150' y='12' text-anchor='middle' fill='#c8c8c8' font-size='12' letter-spacing='2'>FRONT CYLINDER</text><rect x='10' y='18' width='280' height='80' rx='6' fill='#111111' stroke='#c8c8c8' stroke-width='2'/><g font-size='15' font-weight='bold' text-anchor='middle'><circle cx='50' cy='45' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='50' fill='#ffffff'>1</text><circle cx='250' cy='45' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='50' fill='#ffffff'>3</text><circle cx='50' cy='80' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='85' fill='#ffffff'>2</text><circle cx='250' cy='80' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='85' fill='#ffffff'>4</text></g><text x='150' y='122' text-anchor='middle' fill='#c8c8c8' font-size='12' letter-spacing='2'>REAR CYLINDER — MIRRORED</text><rect x='10' y='128' width='280' height='80' rx='6' fill='#111111' stroke='#c8c8c8' stroke-width='2'/><g font-size='15' font-weight='bold' text-anchor='middle'><circle cx='50' cy='155' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='160' fill='#ffffff'>2</text><circle cx='250' cy='155' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='160' fill='#ffffff'>4</text><circle cx='50' cy='190' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='50' y='195' fill='#ffffff'>1</text><circle cx='250' cy='190' r='14' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='250' y='195' fill='#ffffff'>3</text></g><text x='150' y='226' text-anchor='middle' fill='#c8c8c8' font-size='11'>Simplified schematic — numbering per FSM Fig. 3-16</text></svg>";
  const SEQ_SVG_CASE = "<svg viewBox='0 0 300 260' width='100%' role='img' aria-label='Crankcase fastener numbering, eight positions'><rect x='105' y='8' width='34' height='55' rx='4' fill='#1a1a1a' stroke='#c8c8c8' stroke-width='2' transform='rotate(-20 122 35)'/><rect x='161' y='8' width='34' height='55' rx='4' fill='#1a1a1a' stroke='#c8c8c8' stroke-width='2' transform='rotate(20 178 35)'/><rect x='30' y='45' width='240' height='195' rx='45' fill='#111111' stroke='#c8c8c8' stroke-width='2'/><circle cx='150' cy='150' r='52' fill='#070709' stroke='#c8c8c8' stroke-width='2'/><g font-size='13' font-weight='bold' text-anchor='middle'><circle cx='188' cy='182' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='188' y='187' fill='#ffffff'>1</text><circle cx='150' cy='62' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='150' y='67' fill='#ffffff'>2</text><circle cx='112' cy='182' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='112' y='187' fill='#ffffff'>3</text><circle cx='228' cy='88' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='228' y='93' fill='#ffffff'>4</text><circle cx='52' cy='150' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='52' y='155' fill='#ffffff'>5</text><circle cx='248' cy='150' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='248' y='155' fill='#ffffff'>6</text><circle cx='78' cy='82' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='78' y='87' fill='#ffffff'>7</text><circle cx='212' cy='202' r='12' fill='#1a1a1a' stroke='#9d6bff' stroke-width='2'/><text x='212' y='207' fill='#ffffff'>8</text></g><text x='150' y='256' text-anchor='middle' fill='#c8c8c8' font-size='11'>Simplified schematic — numbering per FSM Fig. 3-88</text></svg>";
  $("torque-sequences").innerHTML = D.torque.sequences.map((s) =>
    "<div class='ed-cause'><h4>" + s.title + " <span class='ed-note'>(" + s.ref + ")</span></h4>" +
    "<p class='ed-note'>Numbering: " + s.figure + "</p>" +
    (s.id === "head-bolts" ? SEQ_SVG_HEAD : SEQ_SVG_CASE) +
    "<p><b>Caution:</b> " + s.caution + "</p>" +
    (s.prep ? "<p>Before you start:</p><ul>" + s.prep.map((p) => "<li>" + p + "</li>").join("") + "</ul>" : "") +
    "<ol>" + s.passes.map((p) => "<li><b>" + p.value + "</b> — order " + p.order + (p.note ? " (" + p.note + ")" : "") + "</li>").join("") + "</ol>" +
    (s.repeat ? "<p>" + s.repeat + "</p>" : "") +
    (s.note ? "<p class='ed-note'>" + s.note + "</p>" : "") + "</div>").join("");
  $("torque-pressures").innerHTML = "<p>" + D.torque.tire_pressures.flstc + "</p><p>" + D.torque.tire_pressures.fxstc + "</p><p class='ed-note'>" + D.torque.tire_pressures.note + "</p>";
  $("torque-dims").innerHTML = D.torque.dimensions.map((d) =>
    "<div class='ed-cause'><b>" + d.model + "</b> — " + d.length + " long · " + d.wheelbase + " wheelbase · " + d.saddle + " saddle · " + d.height + " high · " + d.dry + " dry · " + d.gvwr + " GVWR</div>").join("") +
    "<p class='ed-note'>Source: " + D.torque.source + "</p>";

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

  /* ---------- data: history, export / import ---------- */
  function renderHistory() {
    const el = $("history-list");
    const detail = $("history-detail");
    if (!state.sessions.length) { el.innerHTML = "<p class='ed-note'>No saved sessions yet — run a tree and tap Save session.</p>"; return; }
    el.innerHTML = state.sessions.map((s, i) => {
      const bike = allBikes().find((b) => b.id === s.bike);
      const tree = D.trees.find((t) => t.id === s.tree);
      return "<button class='ed-tree-btn' data-hist='" + i + "'><b>" + (tree ? tree.title : s.tree) + "</b><br><span class='ed-note'>" + (bike ? bike.name : s.bike) + " · " + new Date(s.when).toLocaleString() + " · top cause: " + (s.ranked && s.ranked[0] ? s.ranked[0] : "—") + "</span></button>";
    }).reverse().join("");
    el.querySelectorAll("[data-hist]").forEach((btn) => btn.addEventListener("click", () => {
      const s = state.sessions[parseInt(btn.dataset.hist, 10)];
      const tree = D.trees.find((t) => t.id === s.tree);
      const bike = allBikes().find((b) => b.id === s.bike);
      detail.innerHTML = "<h3>" + (tree ? tree.title : s.tree) + " — " + (bike ? bike.name : s.bike) + "</h3>" +
        "<p class='ed-note'>" + new Date(s.when).toLocaleString() + "</p>" +
        (s.answers || []).map((a) => "<p>" + a.q + "<br><b>" + a.a + "</b></p>").join("") +
        "<p><b>Ranked causes:</b><br>" + (s.ranked || []).map((c, i) => (i + 1) + ". " + c).join("<br>") + "</p>";
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
  }
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
        state = { sessions: j.sessions || [], baselines: j.baselines || {}, bike: j.bike || "b1", bikes: j.bikes || [] };
        store.save(state);
        renderBikeSel();
        renderBaselines(); renderCarbs(); renderHistory();
        alert("Imported.");
      } catch (err) { alert("That file is not a valid export."); }
    };
    rd.readAsText(f);
  });
})();
