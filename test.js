/* The Evo Diagnostic — test suite. Plain check(), run: node test.js */
const fs = require("fs");
const path = require("path");
const D = require("./data.js");
const A = require("./audio.js");
const H = require("./handoff.js");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log("FAIL: " + name); }
}
function eq(name, a, b) { check(name + " (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")", a === b); }

/* --- data integrity --- */
eq("roster has 3 bikes", D.roster.length, 3);
eq("roster keys match carb seed", D.roster.map((b) => b.id).join(","), "b1,b2,b3");
eq("CV40 main jet", D.carbs.b2.main, "185");
eq("CV40 pilot jet", D.carbs.b2.pilot, "45");
eq("Super E main", D.carbs.b1.main, "0.072");
eq("Super E intermediate", D.carbs.b1.intermediate, "0.0295");
check("Linkert jetting left blank, never guessed", D.carbs.b3.jetting === null);
eq("idle spec min", D.specs.idle_rpm.min, 1000);
eq("idle spec max", D.specs.idle_rpm.max, 1050);
eq("brake fluid is DOT 5 only", D.specs.brake_fluid, "DOT 5 silicone ONLY");
eq("Fat Boy solo pressures", D.tire_pressure_psi_cold_dunlop_only["FLSTC, FLSTF, FLSTS"].solo.front + "/" + D.tire_pressure_psi_cold_dunlop_only["FLSTC, FLSTF, FLSTS"].solo.rear, "36/36");
eq("Fat Boy two-up pressures", D.tire_pressure_psi_cold_dunlop_only["FLSTC, FLSTF, FLSTS"].two_up.front + "/" + D.tire_pressure_psi_cold_dunlop_only["FLSTC, FLSTF, FLSTS"].two_up.rear, "36/40");
eq("FXSTC solo pressures", D.tire_pressure_psi_cold_dunlop_only["FXSTC, FXSTS, FXSTSB"].solo.front + "/" + D.tire_pressure_psi_cold_dunlop_only["FXSTC, FXSTS, FXSTSB"].solo.rear, "30/36");
eq("VIN model BJ", D.vin.model_codes.BJ, "FLSTC Heritage Softail Classic");
eq("VIN model BM", D.vin.model_codes.BM, "FLSTF Fat Boy");
eq("VIN year V", D.vin.year_codes.V, 1997);
eq("VIN year W", D.vin.year_codes.W, 1998);

/* --- trees: structure + citations, no invented specs --- */
check("trees exist", D.trees.length >= 8);
D.trees.forEach((t) => {
  check("tree " + t.id + " has steps", t.steps.length > 0);
  check("tree " + t.id + " has causes", t.causes.length > 0);
  t.steps.forEach((s, i) => {
    check("tree " + t.id + " step " + i + " has question", !!s.q);
    check("tree " + t.id + " step " + i + " has note", !!s.note);
    check("tree " + t.id + " step " + i + " cites a source", !!s.cite);
  });
  t.causes.forEach((c) => {
    check("cause " + c.cause.slice(0, 30) + " names a confirming test", !!c.test);
    check("cause " + c.cause.slice(0, 30) + " names a fix", !!c.fix);
    check("cause " + c.cause.slice(0, 30) + " has urgency", ["low", "medium", "high", "critical"].includes(c.urgency));
    check("cause " + c.cause.slice(0, 30) + " has a ride verdict", !!c.ride);
  });
});
const leanIdle = D.trees.find((t) => t.id === "carb-lean-idle");
check("lean-idle tree is the Fat Boy test case", leanIdle.test_case.includes("Fat Boy"));

/* --- audio math (pure functions) --- */
eq("17.5 Hz -> 1050 rpm", A.pulseHzToRpm(17.5), 1050);
eq("1000 rpm -> 16.67 Hz", Math.round(A.rpmToPulseHz(1000) * 100) / 100, 16.67);
eq("1025 rpm in spec", A.inIdleSpec(1025, D.specs.idle_rpm), "in-spec");
eq("900 rpm low", A.inIdleSpec(900, D.specs.idle_rpm), "low");
eq("1200 rpm high", A.inIdleSpec(1200, D.specs.idle_rpm), "high");
eq("null rpm -> null", A.inIdleSpec(null, D.specs.idle_rpm), null);
// synthetic 17 Hz sine at 8kHz sample rate -> autocorrelate should find ~17 Hz
const sr = 8000, N = 4096, sine = new Float32Array(N);
for (let i = 0; i < N; i++) sine[i] = Math.sin(2 * Math.PI * 17 * i / sr);
const found = A.autocorrelate(sine, sr);
check("autocorrelation finds 17 Hz sine (got " + (found && found.toFixed(1)) + ")", found !== null && Math.abs(found - 17) < 1.5);
check("autocorrelation returns null on silence", A.autocorrelate(new Float32Array(N), sr) === null);

/* --- VIN decode (real module, not a copy) --- */
const V = require("./vin.js");
eq("1997 FSM sample VIN check digit validates", V.checkDigit("1HD1BJL41VY010000"), "1");
check("1998 FSM sample VIN check digit is WRONG in the manual (computed 7, printed 1) - app must flag it, not trust it",
  V.checkDigit("1HD1BJW41VY010000") === "7" && "1HD1BJW41VY010000"[8] === "1");
const v97 = V.decode("1HD1BJL41VY010000");
eq("1997 sample decodes to 1997", v97.year, 1997);
eq("1997 sample decodes to FLSTC", v97.model, "FLSTC Heritage Softail Classic");
eq("1997 sample model code is BJ (positions 5-6)", v97.modelCode, "BJ");
eq("1997 sample engine type is L", v97.engineType, "L");
eq("1997 sample plant is Y (York)", v97.plant, "Y");
eq("1997 sample serial is 010000", v97.serial, "010000");
check("1997 sample check digit valid", v97.checkDigitOk === true);
const v98 = V.decode("1HD1BJW41VY010000");
check("1998 FSM sample decodes as 1997, not 1998 — the manual put W at position 7 (wrong slot) and left V at the year position 10",
  v98.year === 1997 && v98.yearCode === "V");
check("1998 sample check digit flagged invalid", v98.checkDigitOk === false);
eq("1998 sample expected check digit is 7", v98.checkDigit, "7");
const v98good = V.decode("1HD1BJL4XWY010000");
eq("synthetic correct 1998 VIN decodes to 1998", v98good.year, 1998);
eq("synthetic correct 1998 VIN decodes to FLSTC", v98good.model, "FLSTC Heritage Softail Classic");
check("synthetic correct 1998 VIN check digit valid", v98good.checkDigitOk === true);
check("short VIN errors", V.decode("1HD1BJ").error.includes("17 characters"));
check("VIN with I/O/Q errors", V.decode("1HD1BJL41VY01000I").error.includes("never contains"));

/* --- NHTSA bundle --- */
const bundle = JSON.parse(fs.readFileSync(path.join(__dirname, "data/nhtsa-evo-bundle.json"), "utf8"));
eq("bundle has 12 recall campaigns", bundle.recalls.length, 12);
check("bundle has 83 Harley TSB rows", bundle.tsbs_harley_1995_1999.length === 83);
eq("bundle has 61 complaints", bundle.complaint_total, 61);
check("bundle counts complaints by component", bundle.complaint_counts_by_component["ENGINE AND ENGINE COOLING"] === 10);
check("bundle has the 96V204000 fuel-valve campaign", bundle.recalls.some((r) => r.campaign === "96V204000"));

/* --- tree scoring (single bump path, no double-count) --- */
const S = require("./scoring.js");
const noStart = D.trees.find((t) => t.id === "no-start");
const base = {};
noStart.causes.forEach((c) => { base[c.cause] = c.weight; });
const bumped = S.applyAnswer(base, noStart.causes, "battery", true);
eq("battery yes bumps the battery cause by exactly 15",
  bumped["Battery discharged or failed"] - base["Battery discharged or failed"], 15);
check("battery yes touches nothing else",
  noStart.causes.filter((c) => c.cause !== "Battery discharged or failed")
    .every((c) => bumped[c.cause] === base[c.cause]));
check("a no changes nothing", JSON.stringify(S.applyAnswer(base, noStart.causes, "battery", false)) === JSON.stringify(base));
check("next changes nothing", JSON.stringify(S.applyAnswer(base, noStart.causes, "next", true)) === JSON.stringify(base));
check("unmapped value changes nothing", JSON.stringify(S.applyAnswer(base, noStart.causes, "nonsense", true)) === JSON.stringify(base));
check("every step yes-value is mapped or next (no silent dead step)",
  D.trees.every((t) => t.steps.every((s) => !s.yes || s.yes === "next" || Object.prototype.hasOwnProperty.call(S.YES_MAP, s.yes))));

/* --- VIN expansion: Sportster codes (factory-verified) --- */
eq("Sportster 1998 sample VIN check digit validates", V.checkDigit("1HD4CHP13WY200062"), "3");
check("Sportster 1986-2003 manual sample VIN check digit is WRONG in the manual (computed 2, printed 3) - app must flag it, not trust it",
  V.checkDigit("1HD4CEM13VY200037") === "2" && "1HD4CEM13VY200037"[8] === "3");
const vS98 = V.decode("1HD4CHP13WY200062");
eq("1998 Sportster sample decodes to 1998", vS98.year, 1998);
eq("1998 Sportster sample decodes to XL1200S Sport", vS98.model, "XL1200S Sport");
eq("1998 Sportster sample engine is 1200cc", vS98.engineName, "1200cc (Sportster)");
eq("1998 Sportster sample plant is York", vS98.plantName, "York, PA");
check("1998 Sportster sample check digit valid", vS98.checkDigitOk === true);
const vS97 = V.decode("1HD4CEM13VY200037");
eq("1997 Sportster sample decodes to 1997", vS97.year, 1997);
eq("1997 Sportster sample decodes to XLH883 Hugger", vS97.model, "XLH883 Hugger");
check("1997 Sportster sample check digit flagged invalid", vS97.checkDigitOk === false);
const cdM = V.checkDigit("1HD4CEM10MY200037");
const vinM = "1HD4CEM1" + cdM + "MY200037";
const vM = V.decode(vinM);
eq("year code M reads 1991 in this Evo-era decoder", vM.year, 1991);
eq("year code M flags the 30-year repeat (2021)", vM.yearAmbiguous, 2021);
eq("data.js year M is 1991, not 2021 (no duplicate-key override)", D.vin.year_codes.M, 1991);
eq("data.js Sportster model CH", D.vin.model_codes.CH, "XL1200S Sport");
eq("data.js engine code P", D.vin.engine_codes.P, "1200cc (Sportster)");
eq("data.js plant code Y", D.vin.plant_codes.Y, "York, PA");

/* --- trees: 13 now (11 + rich/flood + transmission) --- */
eq("trees count is 13", D.trees.length, 13);
check("oil-leak tree present", D.trees.some((t) => t.id === "oil-leak"));
check("clutch tree present", D.trees.some((t) => t.id === "clutch"));
check("lights tree present", D.trees.some((t) => t.id === "lights"));
check("clutch free play cites FSM p. 272", D.trees.find((t) => t.id === "clutch").steps.some((s) => s.cite.includes("p. 272")));
check("oil pressure spec is 12-35 psi at 2000 rpm", D.trees.find((t) => t.id === "oil-leak").steps.some((s) => s.q.includes("12-35 psi")));

/* --- tire date decode --- */
const T = require("./tire.js");
const NOW = new Date("2026-11-24T12:00:00-07:00");
const t19 = T.decode("2319", NOW);
eq("2319 is week 23 of 2019", t19.week + "/" + t19.year, "23/2019");
eq("2019 tire is amber in Nov 2026", t19.verdict, "amber");
eq("0524 tire is green", T.decode("0524", NOW).verdict, "green");
eq("2315 tire is red (10+ years)", T.decode("2315", NOW).verdict, "red");
const t98 = T.decode("238", NOW);
eq("3-digit 238 is week 23 of 1998", t98.week + "/" + t98.year, "23/1998");
check("2-digit code errors", !!T.decode("99", NOW).error);
check("week 54 errors", !!T.decode("5419", NOW).error);
check("future year errors", !!T.decode("2327", NOW).error);

/* --- TSB parse + complaints --- */
const NH = require("./nhtsa.js");
const tsb0 = NH.parseTsb(bundle.tsbs_harley_1995_1999[0].raw);
eq("first TSB bulletin is CAMP/M1044", tsb0.bulletin, "CAMP/M1044");
eq("first TSB year is 1994", tsb0.year, "1994");
eq("first TSB component", tsb0.component, "ENGINE AND ENGINE COOLING:ENGINE");
check("first TSB summary is the primary-chain bulletin", tsb0.summary.startsWith("HARLEY DAVIDSON HAS LEARNED THAT HTE PRIMARY CHAINS"));
eq("1997 matches 5 TSB rows", NH.matchTsbs(bundle.tsbs_harley_1995_1999, 1997).length, 5);
eq("1998 matches 25 TSB rows", NH.matchTsbs(bundle.tsbs_harley_1995_1999, 1998).length, 25);
eq("31 TSB rows carry no model year", NH.unyearnedCount(bundle.tsbs_harley_1995_1999), 31);
const bars = NH.complaintBars(bundle.complaint_counts_by_component);
eq("complaint bars: 14 components", bars.length, 14);
eq("top complaint component is engine, 10", bars[0].component + "|" + bars[0].count, "ENGINE AND ENGINE COOLING|10");
check("complaint bar percentages sum to ~100", Math.abs(bars.reduce((a, b) => a + b.pct, 0) - 100) <= 2);

/* --- flash codes (1998 XL1200S, factory table) --- */
eq("flash codes count is 10", D.flash_codes.length, 10);
eq("code 12 is MAP Sensor", D.flash_codes.find((f) => f.code === 12).desc, "MAP Sensor");
eq("code 41 is Cam Sync Failure", D.flash_codes.find((f) => f.code === 41).desc, "Cam Sync Failure");
check("codes 52/54/55 are module failures", [52, 54, 55].every((c) => D.flash_codes.find((f) => f.code === c).desc.includes("module")));
check("every flash code has a ref page", D.flash_codes.every((f) => f.ref.startsWith("7-")));
check("flash scope says XL1200S only", D.flash_codes_how.includes("Scanalyzer") && D.flash_codes_how.includes("91A"));

/* --- tap-to-identify parts --- */
check("parts count is 41", Object.keys(D.parts).length === 41);
check("every part has name, function, spec, failures, source",
  Object.values(D.parts).every((p) => p.name && p.fn && p.spec && p.failures && p.source));
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const partIds = [...new Set([...html.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]))];
check("every data-part id in the diagrams has a record (" + partIds.length + " ids)",
  partIds.every((id) => Object.prototype.hasOwnProperty.call(D.parts, id)));

/* --- parts & prices (live-checked Nov 24, 2026; no invented labor) --- */
const priceRecs = Object.values(D.prices);
eq("prices: 42 keys (40 priced records + the rubber-plug and jackshaft pointers)", priceRecs.length, 42);
eq("prices: 40 priced records", priceRecs.filter((r) => typeof r.price === "number").length, 40);
check("every priced record has a name, a positive price, a source, a link, and the check date",
  priceRecs.filter((r) => typeof r.price === "number").every((r) =>
    r.name && r.price > 0 && r.source && r.url.startsWith("https://") && r.date === "2026-11-24"));
check("cheapest verified price is the pilot jet at $4.99", D.prices["pilot-jet"].price === 4.99);
check("most expensive verified price is the transmission kit at $429.00", D.prices["transmission"].price === 429.00);
check("every cause part key exists in prices",
  D.trees.every((t) => t.causes.every((c) => !c.part ||
    (Array.isArray(c.part) ? c.part : [c.part]).every((k) => Object.prototype.hasOwnProperty.call(D.prices, k)))));
eq("62 of 91 causes name a part", D.trees.reduce((n, t) => n + t.causes.filter((c) => c.part).length, 0), 62);
check("every atlas part except the rubber plug and jackshaft has a live price",
  Object.keys(D.parts).every((k) => k === "rubber-plug" || k === "jackshaft" || typeof D.prices[k] === "object" && typeof D.prices[k].price === "number"));
check("rubber plug points at the rebuild kit instead of a fake price",
  D.prices["rubber-plug"].see === "carb-body" && typeof D.prices["rubber-plug"].price === "undefined");
check("jackshaft points at the starter instead of a fake price (no standalone price verified)",
  D.prices["jackshaft"].see === "starter" && typeof D.prices["jackshaft"].price === "undefined");
check("battery price carries the year-split note (1990 only, 1995 takes YTX20)",
  D.prices["battery"].note.includes("1990") && D.prices["battery"].note.includes("YTX20"));
check("belt price carries the year-split note (1995-1999 only)",
  D.prices["belt"].note.includes("1995-1999"));
check("shocks price flags the per-pair-or-each unknown",
  D.prices["shocks"].note.includes("per pair or per shock"));
check("main-jet price flags the family-page read",
  D.prices["main-jet"].note.includes("family page"));
check("app.js renders prices into results and the part detail",
  fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("priceHtml(c.part)") &&
  fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("priceHtml(el.dataset.part)"));

/* --- any-bike picker --- */
eq("common bikes: 6 brands", D.common_bikes.length, 6);
eq("common bikes: 106 models", D.common_bikes.reduce((a, b) => a + b.families.reduce((x, f) => x + f.models.length, 0), 0), 106);
check("Harley-Davidson is in the common list", D.common_bikes.some((b) => b.brand === "Harley-Davidson"));

/* --- baseline comparison --- */
eq("close to baseline", A.compareBaseline({ rpm: 1020, sd: 25 }, { rpm: 1025, sd: 20 }).verdict, "close");
eq("125 rpm low vs baseline", A.compareBaseline({ rpm: 900, sd: 25 }, { rpm: 1025, sd: 20 }).verdict, "low");
eq("125 rpm high vs baseline", A.compareBaseline({ rpm: 1150, sd: 25 }, { rpm: 1025, sd: 20 }).verdict, "high");
eq("same rpm but unsteady", A.compareBaseline({ rpm: 1025, sd: 80 }, { rpm: 1025, sd: 20 }).verdict, "unsteady");
eq("rpm-only baseline still compares", A.compareBaseline({ rpm: 1025 }, { rpm: 1025 }).verdict, "close");
check("no baseline returns null", A.compareBaseline({ rpm: 1025, sd: 20 }, null) === null);
eq("rpm delta is signed", A.compareBaseline({ rpm: 900, sd: 25 }, { rpm: 1025, sd: 20 }).rpmDelta, -125);

/* --- listen and compare (YouTube links only) --- */
eq("listen_compare has 10 entries", D.listen_compare.length, 10);
check("every compare entry has sound, bike, claim, caveat, url",
  D.listen_compare.every((c) => c.sound && c.bike && c.claim && c.caveat && c.url));
check("every compare url is a YouTube watch/shorts link",
  D.listen_compare.every((c) => /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(c.url) || /^https:\/\/youtu\.be\//.test(c.url)));
check("every compare entry carries its caveat", D.listen_compare.every((c) => c.caveat.length > 20));
check("index.html has the compare list", html.includes('id="compare-list"'));

/* --- RPM meter harmonic guard (caught by Joshua's Softail video) --- */
eq("foldToIdle leaves 17.5 Hz alone", A.foldToIdle(17.5), 17.5);
eq("foldToIdle folds 55 Hz (3rd harmonic) to ~18.3", Math.round(A.foldToIdle(55) * 10) / 10, 18.3);
eq("foldToIdle folds 35 Hz (2nd harmonic) to 17.5", A.foldToIdle(35), 17.5);
eq("foldToIdle folds 60 Hz to 20", A.foldToIdle(60), 20);
eq("foldToIdle folds 45 Hz to 22.5 (idle-only meter: anything above 25 Hz folds into the idle band)", A.foldToIdle(45), 22.5);
// synthetic phone-style clip: weak 17.5 Hz fundamental + strong 52.5 Hz 3rd harmonic
const phoneBuf = new Float32Array(4096);
for (let i = 0; i < 4096; i++) phoneBuf[i] = 0.15 * Math.sin(2 * Math.PI * 17.5 * i / 8000) + 1.0 * Math.sin(2 * Math.PI * 52.5 * i / 8000);
const phoneHz = A.autocorrelate(phoneBuf, 8000);
check("autocorrelation on a phone-style clip (weak fundamental, strong 3rd harmonic) reads ~17.5 Hz, not ~52 (got " + (phoneHz && phoneHz.toFixed(1)) + ")",
  phoneHz !== null && phoneHz >= 15 && phoneHz <= 20);

/* --- local spots (Glendale, AZ — verified Nov 24, 2026) --- */
eq("local_shops has 11 entries", D.local_shops.length, 11);
check("every local shop has name, kind, address, phone, note",
  D.local_shops.every((s) => s.name && s.kind && s.address && s.phone && s.note));
check("every local phone is a US number", D.local_shops.every((s) => /^\(\d{3}\) \d{3}-\d{4}$/.test(s.phone)));
check("every local url is empty or an http(s) link", D.local_shops.every((s) => s.url === "" || /^https?:\/\//.test(s.url)));
check("no California Glendale dealer slipped in", D.local_shops.every((s) => !s.phone.includes("818") && !s.name.includes("Glendale, CA")));
check("index.html has the local list", html.includes('id="local-list"'));

/* --- torque & specs (FSM #99482-98 §2) --- */
eq("torque table has 18 rows", D.torque.rows.length, 18);
check("every torque row has a fastener and a ft-lb or in-lb value",
  D.torque.rows.every((r) => r.fastener && /ft-lbs|in-lbs/.test(r.value)));
/* --- chapter torque tables (FSM #99482-98 §3/§4/§5/§6/§8, read visually) --- */
eq("torque chapters: 6 systems", D.torque.chapters.length, 6);
eq("torque chapter rows total 53", D.torque.chapters.reduce((n, c) => n + c.rows.length, 0), 53);
check("every chapter has a title, a page ref and rows",
  D.torque.chapters.every((c) => c.title && c.ref && c.rows.length > 0));
check("every chapter row has a fastener and a value",
  D.torque.chapters.every((c) => c.rows.every((r) => r.fastener && r.value)));
const ch = (t) => D.torque.chapters.find((c) => c.title === t);
check("crank pin nut is 180-210 ft-lbs",
  ch("Engine").rows.some((r) => r.fastener === "Crank pin nut" && r.value.startsWith("180-210 ft-lbs")));
check("compensating sprocket nut is 150-165 ft-lbs",
  ch("Clutch & primary").rows.some((r) => r.fastener === "Compensating sprocket nut" && r.value.startsWith("150-165 ft-lbs")));
check("transmission sprocket nut is 50 ft-lbs + a 30-45 degree turn",
  ch("Clutch & primary").rows.some((r) => r.fastener === "Transmission sprocket nut" && r.value.includes("50 ft-lbs") && r.value.includes("30")));
check("neutral switch differs by year (1997 3-5, 1998 10-15)",
  ch("Electrical & charging").rows.some((r) => r.fastener === "Neutral switch (1997 models)" && r.value.startsWith("3-5 ft-lbs")) &&
  ch("Electrical & charging").rows.some((r) => r.fastener === "Neutral switch (1998 models)" && r.value.startsWith("10-15 ft-lbs")));
check("cylinder head + crankcase bolts point to the §3 sequences, not a value",
  ch("Engine").rows.some((r) => r.fastener === "Cylinder head bolts" && r.value.includes("Cylinder Head Torque Sequence")) &&
  ch("Engine").rows.some((r) => r.fastener === "Crankcase stud nut" && r.value.includes("Crankcase Torque Sequence")));
check("torque source cites the chapter pages", D.torque.source.includes("§3 p. 3-2") && D.torque.source.includes("§8 p. 8-1") && D.torque.source.includes("3-21") && D.torque.source.includes("3-66"));
/* --- torque sequences (FSM #99482-98 §3, verified from rendered pages Nov 24-25) --- */
eq("torque sequences: 2", D.torque.sequences.length, 2);
const sq = (id) => D.torque.sequences.find((s) => s.id === id);
eq("head sequence has 3 passes", sq("head-bolts").passes.length, 3);
check("head pass 1 is 7-9 ft-lbs", sq("head-bolts").passes[0].value.includes("7–9 ft-lbs"));
check("head pass 2 is 12-14 ft-lbs", sq("head-bolts").passes[1].value.includes("12–14 ft-lbs"));
check("head pass 3 is a 90-degree clockwise turn", sq("head-bolts").passes[2].value.includes("90°") && sq("head-bolts").passes[2].value.includes("clockwise"));
check("head figure is mirrored between heads", sq("head-bolts").figure.includes("mirrored"));
check("head sequence repeats on the other head", (sq("head-bolts").repeat || "").includes("other head"));
eq("crankcase sequence has 2 passes", sq("crankcase").passes.length, 2);
check("crankcase pass 1 is 10 ft-lbs", sq("crankcase").passes[0].value.includes("10 ft-lbs"));
check("crankcase pass 2 is 15-17 ft-lbs (20-23 Nm)", sq("crankcase").passes[1].value.includes("15–17 ft-lbs (20–23 Nm)"));
check("crankcase figure has 8 positions", sq("crankcase").figure.includes("8 positions"));
check("crankcase note flags the FSM 20-35 Nm misprint", (sq("crankcase").note || "").includes("20–35 Nm") && (sq("crankcase").note || "").includes("misprint"));
check("no sequence value uses the misprinted 20-35 Nm as a real figure", D.torque.sequences.every((s) => s.passes.every((p) => !p.value.includes("20–35"))));
check("index.html has the sequences card", html.includes('id="torque-sequences"'));
check("app.js renders the sequences", fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("torque-sequences") && fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("SEQ_SVG_HEAD"));
check("oil capacity is 3.0 qt with filter", D.torque.capacities.all.includes("3.0 qt"));
check("FLSTC solo pressure is 36/36", D.torque.tire_pressures.flstc.includes("36 front / 36 rear"));
check("FXSTC solo pressure is 30/36", D.torque.tire_pressures.fxstc.includes("30 front / 36 rear"));
eq("dimensions cover 6 models", D.torque.dimensions.length, 6);
check("every model has length, wheelbase, saddle, height, dry weight, GVWR",
  D.torque.dimensions.every((d) => d.model && d.length && d.wheelbase && d.saddle && d.height && d.dry && d.gvwr));
check("torque source cites FSM 99482-98 §2", D.torque.source.includes("99482-98"));
check("index.html has the Torque tab and search", html.includes('data-tab="torque"') && html.includes('id="torque-search"') && html.includes('id="torque-table"') && html.includes('id="torque-chapters"'));

/* --- Joshua's own atlas photos --- */
eq("own_photos has the Softail still", D.own_photos.length, 1);
check("own photo file exists", fs.existsSync(path.join(__dirname, D.own_photos[0].file)));
check("own photo is labeled as his", D.own_photos[0].credit.includes("Joshua's own photo"));

/* --- manifest + icons + files + new modules --- */
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));
eq("manifest name", manifest.name, "The Evo Diagnostic");
check("manifest wires icon-192", (manifest.icons || []).some((i) => i.sizes === "192x192"));
check("manifest wires icon-512", (manifest.icons || []).some((i) => i.sizes === "512x512"));
check("icon-512.png is real PNG bytes", fs.readFileSync(path.join(__dirname, "icon-512.png")).slice(0, 8).toString("hex") === "89504e470d0a1a0a");
check("icon-192.png is real PNG bytes", fs.readFileSync(path.join(__dirname, "icon-192.png")).slice(0, 8).toString("hex") === "89504e470d0a1a0a");
check("sw.js caches v11", fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("evo-diagnostic-v11"));
check("sw.js precaches tire.js + nhtsa.js + handoff.js + sw-update.js + shop.js", fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("tire.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("nhtsa.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("handoff.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("sw-update.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("shop.js"));
check("index.html loads tire.js + nhtsa.js + handoff.js + shop.js", html.includes('src="tire.js"') && html.includes('src="nhtsa.js"') && html.includes('src="handoff.js"') && html.includes('src="shop.js"'));
check("index.html has the new sections", ["part-detail", "flash-input", "tire-input", "clip-record", "history-list", "add-bike-model"].every((id) => html.includes('id="' + id + '"')));
D.cc_photos.forEach((p) => check("CC photo present: " + p.file, fs.existsSync(path.join(__dirname, p.file))));
check("all CC photos have credits", D.cc_photos.every((p) => p.credit.includes("CC BY")));
check("suppliers are link-only", D.parts_suppliers.every((s) => s.url.startsWith("https://")));

/* --- new atlas parts (priced extras, Nov 24) --- */
["main-jet", "pilot-jet", "float", "plug-wires", "starter", "wheel-bearing", "intake-seals", "dot5-fluid", "exhaust-gaskets", "primary-shoe"].forEach((k) => {
  check("atlas part exists: " + k, !!D.parts[k] && !!D.parts[k].fn && !!D.parts[k].spec && !!D.parts[k].failures && !!D.parts[k].source);
  check("atlas part has a live price: " + k, !!D.prices[k]);
});
eq("atlas part count is 41", Object.keys(D.parts).length, 41);
check("starter draw spec is 160-180, over 200 = fault", D.parts["starter"].spec.includes("160–180") && D.parts["starter"].spec.includes("over 200 amps = fault"));
check("starter bench values: 3,000 rpm min @ 11.5V, 90A max @ 11.5V", D.parts["starter"].spec.includes("3,000 rpm min @ 11.5V") && D.parts["starter"].spec.includes("90A max @ 11.5V"));
check("starter record cites §5 pp. 5-1, 5-10", D.parts["starter"].source.includes("5-1") && D.parts["starter"].source.includes("5-10"));
["main-jet", "pilot-jet", "float", "plug-wires", "wheel-bearing", "starter", "intake-seals", "dot5-fluid", "primary-shoe"].forEach((k) =>
  check("diagram tap target: " + k, html.includes('data-part="' + k + '"')));
check("exhaust-gaskets has a record but NO diagram tap target (no traced exhaust diagram)",
  !!D.parts["exhaust-gaskets"] && !html.includes('data-part="exhaust-gaskets"'));

/* --- battery & charging guided tests (FSM section 8) --- */
eq("charging tests: 8 steps", D.charging_tests.steps.length, 8);
check("charging tests all have how/pass/fail", D.charging_tests.steps.every((s) => s.title && s.how && s.pass && s.fail));
check("charging ref cites FSM section 8", D.charging_tests.ref.includes("99482-98"));
check("battery state of charge 13.0/12.8/12.5/12.2", D.charging_tests.steps[0].pass.includes("13.0V") && D.charging_tests.steps[0].pass.includes("12.2V"));
check("load test 54A / 9.6V", D.charging_tests.steps[1].how.includes("54 amps") && D.charging_tests.steps[1].pass.includes("9.6V"));
check("charging voltage 14.3-14.7", D.charging_tests.steps[2].pass.includes("14.3-14.7V"));
check("stator AC 32-40", D.charging_tests.steps[3].pass.includes("32-40"));
check("stator resistance 0.1-0.2", D.charging_tests.steps[4].pass.includes("0.1-0.2"));
check("milliamp draw 3 mA", D.charging_tests.steps[6].pass.includes("3 milliamps"));
check("output beats draw by 3.5A", D.charging_tests.steps[7].pass.includes("3.5 amps"));
check("index.html has the charging-tests card", html.includes('id="charging-tests"'));
const appjs = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
check("app.js renders charging-tests", appjs.includes("$(\"charging-tests\")"));
check("no riding spots anywhere (skipped Nov 24)", !html.includes("riding-list") && !appjs.includes("riding-list") && !("riding_spots" in D));

/* --- two new trees: rich/flood + transmission shifting (FSM §4/§7) --- */
const richTree = D.trees.find((t) => t.id === "carb-rich-flood");
const transTree = D.trees.find((t) => t.id === "transmission-shifting");
check("rich/flood tree present", !!richTree);
check("transmission tree present", !!transTree);
eq("rich/flood tree has 8 causes", richTree.causes.length, 8);
eq("transmission tree has 7 causes", transTree.causes.length, 7);
eq("rich/flood weights sum to 100", richTree.causes.reduce((n, c) => n + c.weight, 0), 100);
eq("transmission weights sum to 100", transTree.causes.reduce((n, c) => n + c.weight, 0), 100);
[richTree, transTree].forEach((t) => {
  t.causes.forEach((c) => {
    check("new tree cause has test/fix/urgency/ride: " + c.cause.slice(0, 30), !!c.test && !!c.fix && ["low", "medium", "high", "critical"].includes(c.urgency) && !!c.ride);
    check("new tree cause carries its source: " + c.cause.slice(0, 30), !!c.source);
  });
  t.steps.forEach((s, i) => check("new tree " + t.id + " step " + i + " cites a source", !!s.cite));
});
check("rich/flood float cause is the 20-weight joint-top cause", richTree.causes[0].cause.includes("Float level") && richTree.causes[0].weight === 20);
check("rich/flood float height is 0.413-0.453 in", richTree.causes[0].test.includes("0.413–0.453 in"));
check("rich/flood main-jet cause is flagged NOT an FSM cause (ER_153 only)", richTree.causes.find((c) => c.cause === "Main jet too large").source.includes("NOT an FSM cause") && richTree.causes.find((c) => c.cause === "Main jet too large").source.includes("ER_153"));
check("rich/flood needle, air-cleaner, vent, and reversion causes carry NO part field (no price key to invent)", richTree.causes.filter((c) => !c.part).length === 4);
check("transmission adjustments are FSM §7, not §6 (clutch & primary)", transTree.causes[1].source.includes("§7 p. 7-4") && transTree.causes[2].source.includes("§7 p. 7-5") && transTree.steps[1].cite.includes("§7"));
check("transmission linkage fix is 20-24 ft-lbs", transTree.causes[1].fix.includes("20–24 ft-lbs"));
check("transmission pawl tolerance is 0.010 in", transTree.causes[2].fix.includes("0.010 in"));
check("transmission pawl note: most shifting problems are the pawl screw", transTree.causes[2].source.includes("Most shifting problems"));
check("transmission internal-parts cause flags the Baker year split (1987-1993, 1990 only)", transTree.causes[3].source.includes("1987–1993") && transTree.causes[3].source.includes("1994–1998"));
check("transmission chain cause is 5/8-7/8 in", transTree.causes[4].test.includes("5/8–7/8 in"));
check("transmission step 4 names the FSM categories, not 'false neutral' as an FSM term", transTree.steps[3].note.includes("Jumps Out Of Gear") && transTree.steps[3].note.includes("never uses the phrase"));
check("every new-tree step yes-value is mapped in scoring",
  [richTree, transTree].every((t) => t.steps.every((s) => !s.yes || s.yes === "next" || Object.prototype.hasOwnProperty.call(S.YES_MAP, s.yes))));

/* --- library sweep (Nov 24-25, 2026): Easyriders tips + Sportster/Clymer layer --- */
eq("91 causes total after the sweep", D.trees.reduce((n, t) => n + t.causes.length, 0), 91);
check("every tree's weights sum to 100",
  D.trees.every((t) => t.causes.reduce((n, c) => n + c.weight, 0) === 100));
check("every tree step yes-value is mapped in scoring",
  D.trees.every((t) => t.steps.every((s) => !s.yes || s.yes === "next" || Object.prototype.hasOwnProperty.call(S.YES_MAP, s.yes))));
check("every cause has test/fix/urgency/ride",
  D.trees.every((t) => t.causes.every((c) => !!c.test && !!c.fix && ["low", "medium", "high", "critical"].includes(c.urgency) && !!c.ride)));
check("magazine causes are flagged NOT an FSM cause or tied to an FSM corroboration",
  D.trees.every((t) => t.causes.every((c) => !c.source || !c.source.includes("Easyriders") || c.source.includes("NOT an FSM cause") || c.source.includes("FSM"))));
const sportsterChapter = D.torque.chapters.find((c) => c.title.startsWith("Sportster"));
check("Sportster torque chapter present", !!sportsterChapter);
eq("Sportster torque chapter has 2 rows", sportsterChapter.rows.length, 2);
check("Sportster clutch cover screws 84-108 in-lbs (conflicts with Softail 50-70)",
  sportsterChapter.rows[0].value.includes("84–108 in-lbs") && sportsterChapter.rows[0].value.includes("50–70"));
check("Sportster spark plug 11-18 ft-lbs (Softail is 18-22)",
  sportsterChapter.rows[1].value.includes("11–18 ft-lbs") && sportsterChapter.rows[1].value.includes("18–22"));
check("capacities carry the Sportster transmission/primary split",
  D.torque.capacities.sportster.includes("24 oz") && D.torque.capacities.sportster.includes("32 oz"));
check("app.js renders the Sportster capacities line", appjs.includes("capacities.sportster"));
check("charging card notes the Sportster stator/regulator year splits",
  D.charging_tests.notes.some((n) => n.includes("Sportster charging") && n.includes("38–52") && n.includes("19 Ah")));
check("compression card notes the Sportster 120 psi normal",
  D.compression_tests.notes.some((n) => n.includes("Sportster") && n.includes("120 psi")));
check("jackshaft atlas part exists", !!D.parts["jackshaft"] && !!D.parts["jackshaft"].fn && !!D.parts["jackshaft"].spec && !!D.parts["jackshaft"].failures && !!D.parts["jackshaft"].source);
check("jackshaft has a record but NO diagram tap target (no traced starter diagram)",
  !!D.parts["jackshaft"] && !html.includes('data-part="jackshaft"'));
check("belt part notes the rejected 1-in magazine deflection",
  D.parts["belt"].spec.includes("1 in cold") && D.parts["belt"].spec.includes("NOT used here"));
check("stator part notes the Sportster year splits",
  D.parts["stator"].spec.includes("1986–90") && D.parts["stator"].spec.includes("38–52"));

/* --- Tech Tips Vol. 3 (Nov 25, 2026) --- */
const oilTree = D.trees.find((t) => t.id === "oil-leak");
const wheelsTree = D.trees.find((t) => t.id === "wheels-tires");
const brakesTree = D.trees.find((t) => t.id === "brakes");
const noStartTree = D.trees.find((t) => t.id === "no-start");
const noiseTree = D.trees.find((t) => t.id === "engine-noise");
eq("oil-leak tree has 10 causes", oilTree.causes.length, 10);
eq("wheels tree has 8 causes", wheelsTree.causes.length, 8);
eq("brakes tree has 7 causes", brakesTree.causes.length, 7);
eq("no-start tree has 7 causes", noStartTree.causes.length, 7);
eq("engine-noise tree has 7 causes", noiseTree.causes.length, 7);
check("Vol. 3 reversion cause is flagged NOT an FSM cause",
  richTree.causes.some((c) => c.cause.includes("Reversion spitback") && c.source.includes("NOT an FSM cause") && c.source.includes("Tips Vol. 3")));
check("Vol. 3 stuck-weights cause is distinct from the worn advance mechanism",
  noStartTree.causes.some((c) => c.cause.includes("stuck at full advance") && c.source.includes("Distinct from the worn advance")));
check("Vol. 3 oil causes all flagged, none ship a part number",
  ["Breather timing wrong", "drain passage blocked", "spotface not flat", "base nuts loose"].every((frag) =>
    oilTree.causes.some((c) => c.cause.includes(frag) && c.source.includes("NOT an FSM cause"))));
check("Vol. 3 knock-back cause flags the .004 in figure as magazine-quoted, not an Evo spec",
  brakesTree.causes.some((c) => c.cause.includes("knock-back") && c.source.includes("magazine-quoted")));
check("Vol. 3 spoke + track causes flagged",
  wheelsTree.causes.some((c) => c.cause.includes("Loose spokes") && c.source.includes("NOT an FSM cause")) &&
  wheelsTree.causes.some((c) => c.cause.includes("same track") && c.source.includes("NOT an FSM cause")));
check("Vol. 3 crimped feed-line cause flagged",
  noiseTree.causes.some((c) => c.cause.includes("crimped after service") && c.source.includes("NOT an FSM cause")));
const richBase = {};
richTree.causes.forEach((c) => { richBase[c.cause] = c.weight; });
check("rich/flood float yes bumps only the float cause by 15",
  S.applyAnswer(richBase, richTree.causes, "float", true)["Float level too high / inlet (needle) valve sticking, worn, or dirty — fuel overflows the bowl"] - 20 === 15 &&
  richTree.causes.filter((c) => !c.cause.includes("Float level")).every((c) => S.applyAnswer(richBase, richTree.causes, "float", true)[c.cause] === c.weight));
const transBase = {};
transTree.causes.forEach((c) => { transBase[c.cause] = c.weight; });
check("transmission clutch-drag yes bumps only the clutch cause by 15",
  S.applyAnswer(transBase, transTree.causes, "clutch-drag", true)["Clutch dragging (slight drag makes shifts hard and neutral hard to find)"] - 25 === 15 &&
  transTree.causes.filter((c) => !c.cause.includes("Clutch dragging")).every((c) => S.applyAnswer(transBase, transTree.causes, "clutch-drag", true)[c.cause] === c.weight));
check("app.js renders cause sources in results", appjs.includes("c.source"));

/* --- compression test card (FSM #99482-98 §3, pp. 3-11–3-12) --- */
eq("compression tests: 6 steps", D.compression_tests.steps.length, 6);
check("compression tests all have how/pass/fail", D.compression_tests.steps.every((s) => s.title && s.how && s.pass && s.fail));
check("compression ref cites FSM §3 pp. 3-11-3-12", D.compression_tests.ref.includes("§3") && D.compression_tests.ref.includes("3-11"));
check("compression tool is gauge HD-33223-1", D.compression_tests.tool.includes("HD-33223-1"));
check("compression verdict is 90 psi and 10% variance", D.compression_tests.steps[3].pass.includes("90 psi") && D.compression_tests.steps[3].pass.includes("10%"));
check("compression verdict gives the metric value 620 kN/m²", D.compression_tests.steps[3].pass.includes("620 kN/m²"));
check("compression cranks 5 to 7 full strokes, throttle wide open", D.compression_tests.steps[1].how.includes("5 to 7 full compression strokes") && D.compression_tests.steps[1].how.includes("wide open"));
check("wet test is 1/2 oz (15 ml) oil", D.compression_tests.steps[4].how.includes("1/2 oz (15 ml)"));
check("wet test fail names worn piston rings", D.compression_tests.steps[4].fail.includes("worn piston rings"));
check("after step closes the throttle before starting", D.compression_tests.steps[5].how.includes("CLOSED position"));
check("compression chart has ring, valve, head gasket", D.compression_tests.chart.length === 3 && D.compression_tests.chart.some((c) => c.label === "Ring trouble") && D.compression_tests.chart.some((c) => c.label === "Valve trouble") && D.compression_tests.chart.some((c) => c.label === "Head gasket leak"));
check("compression chart: ring trouble improves with oil", D.compression_tests.chart.find((c) => c.label === "Ring trouble").text.includes("improves considerably with oil"));
check("compression chart: valve trouble checks pushrod length", D.compression_tests.chart.find((c) => c.label === "Valve trouble").text.includes("pushrod length"));
check("leakdown tester is HD-35667, 10% leakage = internal problems", D.compression_tests.leakdown.includes("HD-35667") && D.compression_tests.leakdown.includes("greater than 10%"));
check("leakdown listens at intake, exhaust, timing hole", D.compression_tests.leakdown.includes("carb intake") && D.compression_tests.leakdown.includes("exhaust pipe") && D.compression_tests.leakdown.includes("timing inspection hole"));
check("compression flag: no standard/maximum published, 90 psi is the minimum only", D.compression_tests.notes.some((n) => n.includes("NO 'standard' or maximum") && n.includes("90 psi is the minimum only")));
check("compression note: low compression alone means valves, not rings", D.compression_tests.notes.some((n) => n.includes("improperly seated valves, not worn rings")));
check("index.html has the compression-tests card", html.includes('id="compression-tests"'));
check("app.js renders compression-tests", appjs.includes("$(\"compression-tests\")"));

/* --- starting-system diagram (FSM §5 Fig. 5-1) --- */
check("index.html has the starting-system diagram", html.includes("Starting system — simplified schematic") && html.includes("Softail Starting Circuit"));
check("starting diagram shows the full power path", html.includes("30A Circuit") && html.includes("Ignition") && html.includes("Start Relay") && html.includes("Starter Solenoid") && html.includes("Jackshaft") && html.includes("ring gear"));
check("starting diagram shows the control side and GRD2", html.includes("Right-Hand Control") && html.includes("Start Switch + Stop/Run") && html.includes("GRD2"));
check("solenoid is its own box with the three terminals labeled", html.includes("Battery · Motor · Relay"));
check("relay terminals 30/87/85/86 are shown", html.includes("30 · 87 · 85 · 86"));
check("wire colors are flagged as table-derived (App. A p. A-20), not diagram-traced", html.includes("App. A p. A-20") && html.includes("not from the wiring diagram"));
check("starting diagram tap target opens the starter record", html.includes('data-part="starter"'));
check("starter tap target is on the Starter Motor box", html.indexOf('data-part="starter"') > html.indexOf("Starting system"));
const startSvg = html.slice(html.indexOf('aria-label="Simplified starting system schematic"'));
const startSvgOnly = startSvg.slice(0, startSvg.indexOf("</svg>"));
check("no turn-signal/stop-light or circuit-protection block drawn in the starting diagram", !startSvgOnly.includes("turn-signal") && !startSvgOnly.includes("circuit-protection"));

/* --- four new atlas parts: specs + wording flags --- */
check("intake-seals spec is 15-17 ft-lbs and quotes the align-then-tighten warning", D.parts["intake-seals"].spec.includes("15–17 ft-lbs") && D.parts["intake-seals"].spec.includes("Do not tighten capscrews and then try to align"));
check("intake-seals price is $4.95", D.prices["intake-seals"].price === 4.95);
check("dot5-fluid spec is DOT 5 only, part no. 99902-77", D.parts["dot5-fluid"].spec.includes("99902-77") && D.parts["dot5-fluid"].spec.includes("Use only D.O.T. 5"));
check("dot5-fluid record does NOT present 'never DOT 3/4' as an FSM quote", !D.parts["dot5-fluid"].spec.includes("never DOT 3/4") && !D.parts["dot5-fluid"].failures.includes("never DOT 3/4"));
check("dot5-fluid price is $39.99", D.prices["dot5-fluid"].price === 39.99);
check("exhaust-gaskets spec has the flange-nut sequence and TORCA 45-60 ft-lbs", D.parts["exhaust-gaskets"].spec.includes("120 in-lbs") && D.parts["exhaust-gaskets"].spec.includes("45–60 ft-lbs") && D.parts["exhaust-gaskets"].spec.includes("one-time use"));
check("exhaust-gaskets price is $8.95", D.prices["exhaust-gaskets"].price === 8.95);
check("primary-shoe spec is 5/8-7/8 in and 21-29 ft-lbs, alignment within 0.030 in", D.parts["primary-shoe"].spec.includes("5/8–7/8 in") && D.parts["primary-shoe"].spec.includes("21–29 ft-lbs") && D.parts["primary-shoe"].spec.includes("0.030 in"));
check("primary-shoe replace rule quotes the FSM", D.parts["primary-shoe"].spec.includes("If the chain tensioner shoe is worn"));
check("primary-shoe price is $8.79", D.prices["primary-shoe"].price === 8.79);
check("no factory part number attached to intake-seals, exhaust-gaskets or primary-shoe", !D.parts["intake-seals"].spec.match(/Part No\. \d/) && !D.parts["exhaust-gaskets"].spec.match(/Part No\. \d/) && D.parts["primary-shoe"].spec.includes("No factory part number"));

/* --- handoff sending side (HANDOFF-FORMAT.md v1) --- */
const idleTree = D.trees.find((t) => t.id === "carb-lean-idle");
const intCause = idleTree.causes.find((c) => c.cause.includes("Intermediate"));
const mainCause = idleTree.causes.find((c) => c.cause.includes("Main jet too small"));
const leakCause = idleTree.causes.find((c) => c.cause.includes("Intake leak"));
eq("wizard target CV40 idle intermediate", H.wizardTarget("b2", idleTree, intCause).step, "cv-mixture");
eq("wizard outcome lean for intermediate", H.wizardTarget("b2", idleTree, intCause).outcome, "lean");
eq("wizard target S&S idle intermediate", H.wizardTarget("b1", idleTree, intCause).step, "ss-idle");
eq("wizard target CV40 main jet", H.wizardTarget("b2", idleTree, mainCause).step, "cv-main");
eq("wizard target null for intake leak", H.wizardTarget("b2", idleTree, leakCause).step, null);
eq("wizard target null for Linkert (b3)", H.wizardTarget("b3", idleTree, intCause).step, null);
const ranked = [Object.assign({}, intCause, { score: 60 }), Object.assign({}, mainCause, { score: 30 }), Object.assign({}, leakCause, { score: 10 })];
const env = H.buildEnvelope("diagnosis-to-carb", { rosterKey: "b2", name: "1990 Softail" }, idleTree, ranked[0], ranked, "Likely rideable");
eq("envelope format", env.format, "pocket-garage-handoff");
eq("envelope version", env.version, 1);
eq("envelope from", env.from, "evo-diagnostic");
eq("envelope bike key", env.bike.rosterKey, "b2");
eq("envelope wizard step", env.payload.wizardStepId, "cv-mixture");
eq("envelope carb hint", env.payload.carbModelHint, "Keihin CV40");
eq("envelope confidence 60 of 100", env.payload.confidencePct, 60);
const envTask = H.buildEnvelope("diagnosis-to-task", { rosterKey: "b2", name: "1990 Softail" }, idleTree, ranked[0], ranked, "Likely rideable");
check("task name starts with the system", envTask.payload.suggestedTaskName.startsWith("Carb / fuel"));
check("task name within 80 chars", envTask.payload.suggestedTaskName.length <= 80);
const url = H.buildUrl("diagnosis-to-carb", { rosterKey: "b2", name: "1990 Softail" }, idleTree, ranked[0], ranked, "Likely rideable");
check("handoff url targets the carb journal", url.startsWith("https://joshuapopps.github.io/carb-tune-journal-pwa/?handoff="));
const decoded = JSON.parse(Buffer.from(url.split("handoff=")[1], "base64url").toString("utf8"));
eq("handoff url round-trips the envelope", decoded.payload.wizardStepId, "cv-mixture");
check("handoff payload under 8000 chars", JSON.stringify(decoded).length < 8000);
check("results screen has both send buttons", appjs.includes("id='send-carb'") && appjs.includes("Send to Carb Journal") && appjs.includes("id='send-log'") && appjs.includes("Send to Bike Log"));
check("app.js sends via ED_Handoff", appjs.includes("ED_Handoff.buildUrl"));

/* --- stale answer buttons (found by coordinator smoke, Nov 25): after a tree
   finishes, the last step's Yes/No buttons used to stay visible and clickable,
   and a click threw "Cannot read properties of undefined (reading 'q')". --- */
check("answer() ignores clicks after the tree is done", appjs.includes("if (current.step >= t.steps.length) return;"));
check("finishTree clears the question buttons", appjs.includes("$(\"tree-step\").innerHTML = \"\";"));

/* --- shop tab (Nov 25, 2026 batch 1): 11 pull-ins, library-first --- */
const SH = require("./shop.js");
check("index.html has the Shop tab", html.includes('data-tab="shop"') && html.includes('id="panel-shop"'));
["plug-reader", "wire-fuse", "gear-ratio", "tap-drill", "bolt-id", "oil-viscosity", "compression-ratio", "carb-cfm", "sag-setter", "parts-interchange", "pre-ride"].forEach((id) =>
  check("index.html has the " + id + " card", html.includes('id="' + id + '"')));
check("app.js renders all 11 shop cards", ["plug-reader", "wire-fuse", "gear-ratio", "tap-drill", "bolt-id", "oil-viscosity", "compression-ratio", "carb-cfm", "sag-setter", "parts-interchange", "pre-ride"].every((id) => appjs.includes("$(\"" + id + "\")")));
check("index.html loads shop.js before app.js", html.indexOf('src="shop.js"') > 0 && html.indexOf('src="shop.js"') < html.indexOf('src="app.js"'));

/* plug reader: 9 conditions from Repair Manual Ch. 3 p. 112 */
eq("plug reader has 9 conditions", D.shop.plug_reader.conditions.length, 9);
check("plug reader names the stock plug + gap", D.shop.plug_reader.plug === "5R6A" && D.shop.plug_reader.gap === "0.038-0.043");
check("every plug condition has look, cause, action",
  D.shop.plug_reader.conditions.every((c) => c.name && c.look && c.cause && c.action));
check("plug reader has Normal, Carbon fouled, Oil fouled, Overheating, Preignition",
  ["Normal", "Carbon fouled", "Oil fouled", "Overheating", "Preignition"].every((n) => D.shop.plug_reader.conditions.some((c) => c.name === n)));
check("carbon fouled points at the rich tree, overheating at the lean tree, preignition at the misfire tree",
  D.shop.plug_reader.conditions.find((c) => c.name === "Carbon fouled").see.includes("Rich running") &&
  D.shop.plug_reader.conditions.find((c) => c.name === "Overheating").see.includes("Lean idle") &&
  D.shop.plug_reader.conditions.find((c) => c.name === "Preignition").see.includes("Misfire"));
check("plug reader cites Repair Manual Ch. 3 p. 112", D.shop.plug_reader.ref.includes("p. 112"));
check("plug reader warns against sand-blast cleaning", D.shop.plug_reader.notes.some((n) => n.includes("sand-blast")));
check("plug reader cites the plug-gap source, not a new plug spec", D.shop.plug_reader.plug === D.specs.plug && D.shop.plug_reader.gap === D.specs.plug_gap_in);

/* wire & breaker: FSM §8 p. 8-1 + App. A Table 2 */
eq("5 circuit breakers", D.shop.wire_fuse.breakers.length, 5);
eq("main breaker is 30A", D.shop.wire_fuse.breakers.find((b) => b.circuit === "Main").amps, 30);
check("ignition, lights, accessory, instruments are all 15A",
  ["Ignition", "Lights", "Accessory", "Instruments"].every((c) => D.shop.wire_fuse.breakers.find((b) => b.circuit === c).amps === 15));
eq("14 wire-gauge rows", D.shop.wire_fuse.wires.length, 14);
eq("main breaker feed is 12 GA", D.shop.wire_fuse.wires.find((w) => w.circuit === "Main circuit breaker feed").gauge, "12");
eq("starter cable is 10 GA", D.shop.wire_fuse.wires.find((w) => w.circuit.startsWith("Starter terminal")).gauge, "10");
eq("ignition module is 16 GA", D.shop.wire_fuse.wires.find((w) => w.circuit === "Ignition module").gauge, "16");
check("no generic ampacity table is claimed (library has none)",
  D.shop.wire_fuse.notes.some((n) => n.includes("No generic AWG ampacity table")));

/* gear ratio math (pure functions) */
eq("primary 36/25 = 1.44", SH.primaryRatio(25, 36), 1.44);
eq("final 65/32 = 2.03125", SH.finalRatio(32, 65), 2.03125);
eq("overall 5th with stock 65T rear = 2.925 (NOT the book's 3.15)", SH.overallRatio(1.44, 1.00, 2.03125), 2.925);
eq("overall 5th with a 70T rear = 3.15 (matches the book)", SH.overallRatio(1.44, 1.00, 70 / 32), 3.15);
eq("overall 1st 1995-99 with 70T rear = 10.11 (matches the FSM)", Math.round(SH.overallRatio(1.44, 3.21, 70 / 32) * 100) / 100, 10.11);
eq("60 mph in 5th (FSM overall 3.15, 25.21 in tire) = 2519 rpm", SH.rpmAtSpeed(60, 3.15, 25.21), 2519);
eq("3000 rpm in 5th = 71.5 mph", SH.speedAtRpm(3000, 3.15, 25.21), 71.5);
eq("130/90-16 tire diameter = 25.21 in", SH.tireDiameterIn(130, 90, 16), 25.21);
eq("100/90-19 tire diameter = 26.09 in", SH.tireDiameterIn(100, 90, 19), 26.09);
check("rpmAtSpeed returns null on bad input", SH.rpmAtSpeed(60, 3.15, 0) === null && SH.rpmAtSpeed(0, 3.15, 25.21) === null);
check("tire presets match the computed diameters",
  D.shop.gear_ratio.tire_presets.every((t) => SH.tireDiameterIn(t.section_mm, t.aspect, t.rim_in) === t.dia_in));
eq("stock sprockets are 25/36/32/65", [D.shop.gear_ratio.stock.comp, D.shop.gear_ratio.stock.clutch, D.shop.gear_ratio.stock.trans, D.shop.gear_ratio.stock.rear].join("/"), "25/36/32/65");
eq("internal ratios: 3 year sets", D.shop.gear_ratio.internal.length, 3);
eq("1995-1999 internal 1st is 3.21, 3rd 1.57, 5th 1.00", D.shop.gear_ratio.internal[2].gears.join(","), "3.21,2.21,1.57,1.23,1");
check("gear flag names the 65T/70T contradiction and the Clymer 1st disagreement",
  D.shop.gear_ratio.flag.includes("2.93") && D.shop.gear_ratio.flag.includes("70-tooth") && D.shop.gear_ratio.flag.includes("10.41"));
check("FSM overall table is the first reference", D.shop.gear_ratio.overall[0].years.includes("FSM") && D.shop.gear_ratio.overall[0].gears[0] === 10.11);
check("gear ref cites FSM §6 p. 6-1 and Clymer Table 1", D.shop.gear_ratio.ref.includes("§6 p. 6-1") && D.shop.gear_ratio.ref.includes("Clymer"));

/* tap & drill: 39 inch rows (Repair Manual Table 7) + 17 metric (Clymer Table 11) */
eq("inch tap drill table has 39 rows", D.shop.tap_drill.inch.length, 39);
eq("metric tap drill table has 17 rows", D.shop.tap_drill.metric.length, 17);
eq("1/4-20 tap drill is No. 8 (the manual's value, not the generic No. 7)", SH.tapDrillInch("1/4-20", D.shop.tap_drill.inch), "No. 8");
eq("1/4-28 tap drill is No. 3", SH.tapDrillInch("1/4-28", D.shop.tap_drill.inch), "No. 3");
eq("3/8-16 tap drill is 5/16", SH.tapDrillInch("3/8-16", D.shop.tap_drill.inch), "5/16");
eq("1-14 tap drill is 15/16", SH.tapDrillInch("1-14", D.shop.tap_drill.inch), "15/16");
eq("M12x1.75 tap drill is 13/32", SH.tapDrillMetric("12x1.75", D.shop.tap_drill.metric), "13/32");
eq("M6x1.00 tap drill is No. 9", SH.tapDrillMetric("6x1.00", D.shop.tap_drill.metric), "No. 9");
eq("M3x0.50 tap drill is No. 39", SH.tapDrillMetric("3x0.50", D.shop.tap_drill.metric), "No. 39");
check("7x1.00 uses 15/64 and the Clymer 16/64 misprint is flagged, never used as a value",
  SH.tapDrillMetric("7x1.00", D.shop.tap_drill.metric) === "15/64" &&
  D.shop.tap_drill.notes.some((n) => n.includes("16/64") && n.includes("misprint")) &&
  !D.shop.tap_drill.metric.some((r) => r.drill === "16/64"));
check("unknown thread returns null", SH.tapDrillInch("9/16-24", D.shop.tap_drill.inch) === null);
check("every inch row has a thread and a drill", D.shop.tap_drill.inch.every((r) => r.thread && r.drill));
check("every metric row has thread, drill, decimal and fraction", D.shop.tap_drill.metric.every((r) => r.thread && r.drill && r.decimal && r.fraction));

/* bolt ID: same series as the tap tables */
eq("SAE bolt series has 39 threads", D.shop.bolt_id.sae.length, 39);
eq("metric bolt series has 17 threads", D.shop.bolt_id.metric.length, 17);
eq("0.375 in / 16 TPI is 3/8-16", SH.boltIdSae(0.375, 16, D.shop.bolt_id.sae), "3/8-16");
eq("0.25 in / 20 TPI is 1/4-20", SH.boltIdSae(0.25, 20, D.shop.bolt_id.sae), "1/4-20");
eq("0.25 in / 28 TPI is 1/4-28 (same diameter, different thread)", SH.boltIdSae(0.25, 28, D.shop.bolt_id.sae), "1/4-28");
eq("M8 / 1.25 pitch is M8x1.25", SH.boltIdMetric(8, 1.25, D.shop.bolt_id.metric), "M8x1.25");
eq("M12 / 1.75 pitch is M12x1.75", SH.boltIdMetric(12, 1.75, D.shop.bolt_id.metric), "M12x1.75");
check("diameter alone never matches (0.375 in with no TPI returns null)", SH.boltIdSae(0.375, null, D.shop.bolt_id.sae) === null);
check("a non-table combination returns null", SH.boltIdSae(0.375, 20, D.shop.bolt_id.sae) === null && SH.boltIdMetric(8, 1.5, D.shop.bolt_id.metric) === null);
check("every SAE series row exists in the inch tap table", D.shop.bolt_id.sae.every((s) => D.shop.tap_drill.inch.some((r) => r.thread === s.thread)));
check("every metric series row exists in the metric tap table", D.shop.bolt_id.metric.every((s) => D.shop.tap_drill.metric.some((r) => "M" + r.thread === s.thread)));

/* oil viscosity: FSM §1 p. 1-9 */
eq("oil table has 4 grades", D.shop.oil.grades.length, 4);
eq("10W40 is for below 40F, Excellent cold starts", D.shop.oil.grades[0].viscosity + "|" + D.shop.oil.grades[0].lowest_temp + "|" + D.shop.oil.grades[0].cold_start, "SAE 10W40|Below 40°F (4°C)|Excellent");
eq("20W50 is for above 40F, Good cold starts", D.shop.oil.grades[1].viscosity + "|" + D.shop.oil.grades[1].lowest_temp + "|" + D.shop.oil.grades[1].cold_start, "SAE 20W50|Above 40°F (4°C)|Good");
eq("SAE 50 is above 60F, Poor cold starts", D.shop.oil.grades[2].viscosity + "|" + D.shop.oil.grades[2].lowest_temp, "SAE 50|Above 60°F (16°C)");
eq("SAE 60 is above 80F, Poor cold starts", D.shop.oil.grades[3].viscosity + "|" + D.shop.oil.grades[3].lowest_temp, "SAE 60|Above 80°F (27°C)");
check("oil rule is the lowest-temperature-before-next-change rule", D.shop.oil.rule.includes("lowest temperature expected before next scheduled oil change"));
check("diesel substitute is CE/CF/CF-4/CG-4, 20W-50 first", D.shop.oil.diesel.includes("CE, CF, CF-4, and CG-4") && D.shop.oil.diesel.includes("20W-50, 15W-40, 10W-40"));
check("oil ref cites FSM §1 p. 1-9", D.shop.oil.ref.includes("§1, p. 1-9"));

/* compression ratio: published bore/stroke/ratio, derived chamber */
eq("compression stock table has 5 motors", D.shop.compression_ratio.stock.length, 5);
eq("Evo is 3.498 x 4.25, 81.6 CID, 9.5:1", D.shop.compression_ratio.stock[0].bore_in + "x" + D.shop.compression_ratio.stock[0].stroke_in + "/" + D.shop.compression_ratio.stock[0].disp_cid + "/" + D.shop.compression_ratio.stock[0].cr, "3.498x4.25/81.6/9.5");
eq("1200S is 10.0:1, the rest of the Sportsters 9.0:1", D.shop.compression_ratio.stock.filter((s) => s.cr === 10.0).length, 1);
eq("swept volume per Evo cylinder is 669.3 cc", Math.round(SH.sweptCcPerCyl(3.498, 4.25) * 10) / 10, 669.3);
eq("3.498x4.25 with a 78.7 cc chamber is 9.5:1", SH.compressionRatio(3.498, 4.25, 78.7), 9.5);
check("every derived chamber volume matches the formula (swept / (ratio - 1))",
  D.shop.compression_ratio.stock.every((s) => Math.abs(SH.chamberCcFromRatio(s.bore_in, s.stroke_in, s.cr) - s.chamber_cc_derived) < 0.05));
check("derived chambers are labeled derived, never published", D.shop.compression_ratio.note.includes("DERIVED") && D.shop.compression_ratio.note.includes("not published"));
eq("81.6 CID at 5500 rpm and 85% VE needs 110.4 CFM", SH.carbCfm(81.6, 5500, 85), 110.4);
eq("81.6 CID at 6000 rpm and 85% VE needs 120.4 CFM", SH.carbCfm(81.6, 6000, 85), 120.4);
check("carb CFM rejects VE over 100% and zero rpm", SH.carbCfm(81.6, 5500, 101) === null && SH.carbCfm(81.6, 0, 85) === null);
check("carb CFM note says no CV40 flow rating is published in the library", D.shop.carb_cfm.note.includes("No published CFM flow rating for the CV40"));
check("carb CFM stock displacement matches the manual (81.6)", D.shop.carb_cfm.stock_disp_cid === 81.6);

/* sag: FSM procedure, no target anywhere */
eq("sag procedure has 5 steps", D.shop.sag.procedure.length, 5);
check("sag procedure names the spanner wrench 94455-89", D.shop.sag.procedure.some((s) => s.includes("94455-89")));
check("sag procedure: OUT increases preload, IN decreases it", D.shop.sag.procedure.some((s) => s.includes("OUT") && s.includes("increases the spring preload")) && D.shop.sag.procedure.some((s) => s.includes("IN") && s.includes("decreases the spring preload")));
check("sag procedure: shock bolts 115-130 ft-lbs, shocks not repairable", D.shop.sag.procedure.some((s) => s.includes("115-130 ft-lbs") && s.includes("not repairable")));
eq("sag drop is unloaded minus loaded", SH.sagDrop(12, 10.5), 1.5);
check("sag has no target — the gap is named, not filled", D.shop.sag.no_target.includes("No factory sag target is published"));
check("sag magazine line is flagged magazine", D.shop.sag.magazine.includes("magazine"));

/* parts interchange: 7 rows, magazine rows flagged */
eq("interchange has 7 rows", D.shop.interchange.rows.length, 7);
check("wheel bearing 9052 fits 1973-99 Big Twin + Sportster", D.shop.interchange.rows.some((r) => r.part.includes("9052") && r.fits.includes("1973-99")));
check("brake pads 44063-83C/D fit all XL/FX/FL 1984-99", D.shop.interchange.rows.some((r) => r.part.includes("44063-83C/D") && r.fits.includes("1984-99")));
check("stator and regulator rows are explicit NON-interchange warnings", D.shop.interchange.rows.filter((r) => r.fits.startsWith("DOES NOT interchange")).length === 2);
check("magazine interchange rows are flagged NOT an FSM cause",
  D.shop.interchange.rows.filter((r) => r.source.includes("Easyriders")).every((r) => r.source.includes("NOT an FSM cause")));
check("head bolts / rocker boxes row warns they do not interchange between years",
  D.shop.interchange.rows.some((r) => r.part.includes("Cylinder head bolts") && r.fits.includes("NOT interchangeable")));

/* pre-ride: Clymer 12 + Sportster lights detail, T-CLOCS structure labeled */
eq("pre-ride has 6 T-CLOCS groups", D.shop.preride.groups.length, 6);
check("pre-ride groups are T, C, L, O, C, S in order", D.shop.preride.groups.map((g) => g.letter).join("") === "TCLOCS");
eq("pre-ride checklist items total 13 (12 Clymer + the Sportster fastener item) + 8 lights sub-checks", D.shop.preride.groups.reduce((n, g) => n + g.items.length, 0) + D.shop.preride.groups.reduce((n, g) => n + (g.sub_items ? g.sub_items.length : 0), 0), 21);
check("pre-ride T group checks tires + pressure", D.shop.preride.groups[0].items[0].includes("tire pressure"));
check("pre-ride L group has the 8-item lights-and-horn detail", D.shop.preride.groups[2].sub_items.length === 8 && D.shop.preride.groups[2].sub_items[0].includes("front brake lever"));
check("pre-ride O group names DOT 5 only", D.shop.preride.groups[3].items.some((i) => i.includes("DOT 5 silicone ONLY")));
check("pre-ride C group has the belt tension 3/8-1/2 in and the head-bolt caution", D.shop.preride.groups[4].items.some((i) => i.includes("3/8-1/2 in")) && D.shop.preride.groups[4].items.some((i) => i.includes("do not check the cylinder head bolts")));
check("pre-ride S group is empty and names the gap instead of inventing a stand check",
  D.shop.preride.groups[5].items.length === 0 && D.shop.preride.groups[5].note.includes("No stand check"));
check("pre-ride structure note says the T-CLOCS headings are MSF's and the checks are Clymer/Sportster",
  D.shop.preride.structure_note.includes("MSF") && D.shop.preride.structure_note.includes("Clymer"));
check("every pre-ride group cites its source", D.shop.preride.groups.every((g) => g.source));

/* --- service-worker update button wiring (sw-update.js) --- */
const swjs = fs.readFileSync(path.join(__dirname, "sw.js"), "utf8");
check("sw.js has the SKIP_WAITING message handler",
  swjs.includes('addEventListener("message"') && swjs.includes("SKIP_WAITING"));
check("sw.js does not call skipWaiting on install",
  (swjs.split("self.skipWaiting()").length - 1) === 1);
check("index.html loads sw-update.js before app.js",
  html.includes('src="sw-update.js"') && html.indexOf('src="sw-update.js"') < html.indexOf('src="app.js"'));
check("app.js calls PG_SWUpdate.init", appjs.includes("PG_SWUpdate.init"));
check("sw-update.js vendored byte-identical to canonical",
  fs.readFileSync(path.join(__dirname, "sw-update.js"), "utf8") ===
  fs.readFileSync(path.join(__dirname, "..", "..", "sw-update.js"), "utf8"));

console.log(pass + "/" + (pass + fail) + " tests passed");
if (fail) process.exit(1);
