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

/* --- trees: 14 now (13 + smoking / oil consumption, batch 2) --- */
eq("trees count is 19", D.trees.length, 19);
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

/* --- NHTSA complaint counts on causes (BlueDriver steal) --- */
const counts = bundle.complaint_counts_by_component;
check("complaint family counts sum to the 61 total",
  Object.values(counts).reduce((a, b) => a + b, 0) === bundle.complaint_total);
eq("brakes leak cause maps to SERVICE BRAKES, HYDRAULIC 9",
  NH.complaintForCause(counts, "Brakes", "Leak (reservoir, line, caliper seal)").count, 9);
eq("lifter tick maps to ENGINE AND ENGINE COOLING 10",
  NH.complaintForCause(counts, "Engine", "Lifter tick").count, 10);
eq("carb cause maps to FUEL SYSTEM, GASOLINE 7",
  NH.complaintForCause(counts, "Carb / fuel", "Main jet too small").count, 7);
eq("advance-mechanism override beats the carb system default",
  NH.complaintForCause(counts, "Carb / fuel", "Worn advance mechanism — idle hangs ~1,600 rpm then drops").family, "ENGINE AND ENGINE COOLING");
eq("bulb cause maps to EXTERIOR LIGHTING 4",
  NH.complaintForCause(counts, "Electrical / lights", "Bulb / socket at the lamp").count, 4);
eq("jackshaft cause maps to POWER TRAIN 7",
  NH.complaintForCause(counts, "Starting", "Jackshaft worn or mismatched — starter spins but won't engage").count, 7);
check("wrong tire pressure shows no count (maintenance, not a defect family)",
  NH.complaintForCause(counts, "Suspension / wheels / tires", "Wrong tire pressure") === null);
check("wheels-not-on-same-track shows no count (no single family)",
  NH.complaintForCause(counts, "Suspension / wheels / tires", "Wheels not on the same track — asymmetric handling") === null);
check("belt-rub hiss shows no count (mixed sources span families)",
  NH.complaintForCause(counts, "Engine", "Hiss from belt rub, pinched vent, or cap venting") === null);
check("every cause maps to a real bundle family or to nothing, and every count matches the bundle exactly",
  D.trees.every((t) => t.causes.every((c) => {
    const hit = NH.complaintForCause(counts, t.system, c.cause);
    return hit === null || (Object.prototype.hasOwnProperty.call(counts, hit.family) && counts[hit.family] === hit.count);
  })));
check("the multi-family complaint key is never used as a cause family",
  D.trees.every((t) => t.causes.every((c) => {
    const hit = NH.complaintForCause(counts, t.system, c.cause);
    return hit === null || hit.family !== "FUEL SYSTEM, GASOLINE,ELECTRICAL SYSTEM,EQUIPMENT";
  })));
check("every per-cause override key is a real cause in the trees",
  Object.keys(NH.CAUSE_FAMILY).every((k) => D.trees.some((t) => t.causes.some((c) => c.cause === k))));
check("complaint label names the family and the count",
  NH.complaintLabel({ family: "ENGINE AND ENGINE COOLING", count: 10 }) === "10 owner complaints filed for this system (NHTSA — ENGINE AND ENGINE COOLING)");
check("app.js wires the complaint count into the ranked-cause display",
  fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("complaintForCause") &&
  fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("complaintLabel"));

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

/* --- parts & prices (live-checked Nov 24, 2026; no invented labor) ---
   Prices live in the shared parts core (pg-parts-core.js), vendored
   verbatim — data.js holds no prices any more. The app reads them via
   PG_PartsCore.getPrice; every check below does the same. */
const Core = require("./pg-parts-core.js");
const coreSrc = fs.readFileSync(path.join(__dirname, "pg-parts-core.js"), "utf8");
const priceRecs = Core.listParts();
eq("prices: 42 keys (40 priced records + the rubber-plug and jackshaft pointers)", priceRecs.length, 42);
eq("prices: 40 priced records", priceRecs.filter((r) => typeof r.price === "number").length, 40);
check("every priced record has a name, a positive price, a source, a link, and the check date",
  priceRecs.filter((r) => typeof r.price === "number").every((r) =>
    r.name && r.price > 0 && r.source && r.url.startsWith("https://") && r.date === "2026-11-24"));
check("cheapest verified price is the pilot jet at $4.99", Core.getPrice("pilot-jet").price === 4.99);
check("most expensive verified price is the transmission kit at $429.00", Core.getPrice("transmission").price === 429.00);
check("every cause part key exists in the parts core",
  D.trees.every((t) => t.causes.every((c) => !c.part ||
    (Array.isArray(c.part) ? c.part : [c.part]).every((k) => Core.getPrice(k) !== null))));
eq("75 of 142 causes name a part", D.trees.reduce((n, t) => n + t.causes.filter((c) => c.part).length, 0), 75);
check("every atlas part except the rubber plug and jackshaft has a live price",
  Object.keys(D.parts).every((k) => k === "rubber-plug" || k === "jackshaft" || (Core.getPrice(k) !== null && typeof Core.getPrice(k).price === "number")));
check("rubber plug points at the rebuild kit instead of a fake price",
  Core.getPrice("rubber-plug").see === "carb-body" && typeof Core.getPrice("rubber-plug").price === "undefined");
check("jackshaft points at the starter instead of a fake price (no standalone price verified)",
  Core.getPrice("jackshaft").see === "starter" && typeof Core.getPrice("jackshaft").price === "undefined");
check("battery price carries the year-split note (1990 only, 1995 takes YTX20)",
  Core.getPrice("battery").note.includes("1990") && Core.getPrice("battery").note.includes("YTX20"));
check("belt price carries the year-split note (1995-1999 only)",
  Core.getPrice("belt").note.includes("1995-1999"));
check("shocks price flags the per-pair-or-each unknown",
  Core.getPrice("shocks").note.includes("per pair or per shock"));
check("main-jet price flags the family-page read",
  Core.getPrice("main-jet").note.includes("family page"));
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

/* --- full-spectrum comparison (v22 staging, UNVALIDATED vs real recordings) ---
   Proven here on synthetic tones only: a tone at frequency X in "now",
   absent in "baseline", must move exactly its band and none other.
   Joshua's real recordings have not arrived; the UI says so. */
const SPEC_SR = 48000, SPEC_FFT = 4096;
check("spectrum has 8 bands", A.SPECTRUM_BANDS.length === 8);
check("spectrum bands are contiguous and ascending, 50 Hz to 12 kHz",
  A.SPECTRUM_BANDS[0].lo === 50 && A.SPECTRUM_BANDS[7].hi === 12000 &&
  A.SPECTRUM_BANDS.every((b, i) => i === 0 || b.lo === A.SPECTRUM_BANDS[i - 1].hi) &&
  A.SPECTRUM_BANDS.every((b) => b.lo < b.hi));
check("every band names what lives there", A.SPECTRUM_BANDS.every((b) => b.id && b.label && b.lives));
eq("spectrum change threshold is 6 dB", A.SPECTRUM_CHANGE_DB, 6);
const flatSpec = A.toneSpectrum([], -40, SPEC_SR, SPEC_FFT); // floor everywhere
const flatBands = A.spectrumToBands(flatSpec, SPEC_SR, SPEC_FFT);
check("flat floor spectrum reduces to -100 dB in every band", flatBands.every((v) => v === -100));
check("identical spectra -> no delta, no changed bands",
  (() => { const c = A.compareSpectra(flatBands, flatBands); return c && c.changed.length === 0 && c.maxDelta === 0; })());
check("averageSpectrum of nothing is null", A.averageSpectrum([]) === null && A.averageSpectrum(null) === null);
check("spectrumToBands of nothing is null", A.spectrumToBands(null, SPEC_SR, SPEC_FFT) === null);
check("compareSpectra of nothing is null", A.compareSpectra(null, flatBands) === null && A.compareSpectra(flatBands, [1, 2]) === null);
check("averageSpectrum of silence frames stays at the floor",
  A.averageSpectrum([new Float32Array(SPEC_FFT / 2).fill(-100), new Float32Array(SPEC_FFT / 2).fill(-100)]).every((v) => v === -100));
// tone at 3000 Hz (lifter-tick band) in "now", absent in baseline
const tickNow = A.spectrumToBands(A.toneSpectrum([3000], -40, SPEC_SR, SPEC_FFT), SPEC_SR, SPEC_FFT);
const tickCmp = A.compareSpectra(tickNow, flatBands);
check("3 kHz tone moves only the Tick band (changed: " + tickCmp.changed.join(",") + ")",
  tickCmp.changed.length === 1 && tickCmp.changed[0] === "tick");
check("3 kHz tone delta in Tick band is large and positive",
  tickCmp.bands.find((b) => b.id === "tick").delta > 20);
check("3 kHz tone leaves every other band at the floor",
  tickCmp.bands.filter((b) => b.id !== "tick").every((b) => Math.abs(b.delta) < 1));
// one tone per remaining band, each in isolation
[["rumble", 100], ["low", 175], ["lowmid", 350], ["mid", 750], ["uppermid", 1500], ["hiss", 6000], ["air", 10000]].forEach(([id, hz]) => {
  const now = A.spectrumToBands(A.toneSpectrum([hz], -40, SPEC_SR, SPEC_FFT), SPEC_SR, SPEC_FFT);
  const c = A.compareSpectra(now, flatBands);
  check(hz + " Hz tone moves only the " + id + " band (changed: " + c.changed.join(",") + ")",
    c.changed.length === 1 && c.changed[0] === id);
});
// averaging happens per bin, in the linear domain: a -40 dB tone bin
// averaged with a -100 dB floor bin lands at ~-46 dB (0.005 amplitude).
// (The per-band average then dilutes a narrow tone across the whole
// band — a 3-bin tone at -40 dB reads ~-75 dB in-band — which is why
// the change threshold is 6 dB, not 20: real ticks and leaks are
// broadband, not single tones.)
const avgMix = A.averageSpectrum([A.toneSpectrum([3000], -40, SPEC_SR, SPEC_FFT), flatSpec]);
const toneBin = Math.round(3000 / (SPEC_SR / SPEC_FFT));
const toneBinDb = Math.round(avgMix[toneBin] * 10) / 10;
check("averaging a -40 dB tone bin with a floor bin lands near -46 dB (got " + toneBinDb + ")",
  toneBinDb > -48 && toneBinDb < -44);
// compareBaseline carries the spectrum through; old rpm-only baselines keep working
const specBase = { rpm: 1025, sd: 20, spectrum: flatBands, spectrumVersion: A.SPECTRUM_VERSION };
const specCmp = A.compareBaseline({ rpm: 1025, sd: 20, spectrum: tickNow }, specBase);
check("compareBaseline with spectra returns the spectrum comparison",
  specCmp && specCmp.spectrum && specCmp.spectrum.changed.join(",") === "tick" && specCmp.verdict === "close");
check("old baseline without a spectrum still compares on RPM, spectrum null",
  (() => { const c = A.compareBaseline({ rpm: 1025, sd: 20, spectrum: tickNow }, { rpm: 1025, sd: 20 }); return c && c.verdict === "close" && c.spectrum === null; })());
check("spectrum stored under a different version is ignored, not miscompared",
  (() => { const c = A.compareBaseline({ rpm: 1025, sd: 20, spectrum: tickNow }, { rpm: 1025, sd: 20, spectrum: flatBands, spectrumVersion: 99 }); return c && c.spectrum === null; })());
// wiring + UNVALIDATED copy
const appjsSpec = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
check("app.js captures spectrum frames in quick-listen and baseline save",
  appjsSpec.includes("averageSpectrum(specFrames)") && appjsSpec.includes("spectrumToBands") && appjsSpec.includes("spectrumVersion"));
check("app.js renders the spectrum chart and wires tree buttons by id",
  appjsSpec.includes("spectrumChartSvg") && appjsSpec.includes("data-spectrum-tree") && appjsSpec.includes("SPECTRUM_TREE_LINKS"));
check("app.js maps the mid band to the primary-drive tree and tick/hiss to engine-noise",
  appjsSpec.includes('mid: "primary-drive"') && appjsSpec.includes('tick: "engine-noise"') && appjsSpec.includes('hiss: "engine-noise"'));
check("app.js says plainly when no tree fits a band",
  appjsSpec.includes("No tree in this app maps to this band alone"));
check("index.html marks spectrum comparison as not yet validated",
  html.toLowerCase().includes("spectrum comparison is not yet validated against real recordings"));
check("app.js marks spectrum comparison as not yet validated in the results copy",
  appjsSpec.includes("Spectrum comparison is not yet validated against real recordings"));

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

/* --- torque & specs (FSM #99482-98 §2) ---
   Torque values live in the shared parts core; data.js holds only the
   index (table id + ordered slug list). Every check below resolves
   through the core, the way the app does. */
const torqueTable = (id) => Core.listTorqueTables().find((t) => t.id === id);
const torqueRow = (id, slug) => Core.getTorque(id, slug);
eq("torque §2 table has 18 rows", D.torque.sec2.slugs.length, 18);
check("every §2 row resolves in the core with a fastener and a ft-lb or in-lb value",
  D.torque.sec2.slugs.every((s) => { const r = torqueRow("fsm-99482-98-sec2", s); return r && r.fastener && /ft-lbs|in-lbs/.test(r.value); }));
/* --- chapter torque tables (FSM #99482-98 §3/§4/§5/§6/§8, read visually) --- */
eq("torque chapters: 6 module systems (+ the local Clymer chapter)", D.torque.chapters.length, 6);
eq("torque chapter rows total 82 (53 module + 29 local Clymer rows)",
  D.torque.chapters.reduce((n, c) => n + c.slugs.length, 0) + D.torque.clymer.rows.length, 82);
check("every chapter index has a table id, a title, a page ref and slugs",
  D.torque.chapters.every((c) => c.id && c.title && c.ref && c.slugs.length > 0));
check("every chapter slug resolves in the core with a fastener and a value",
  D.torque.chapters.every((c) => c.slugs.every((s) => { const r = torqueRow(c.id, s); return r && r.fastener && r.value; })));
/* The index must cover every module row exactly — no missing row, no
   stale slug: parse the vendored module source for its slug inventory
   per table and compare against the index (order included). */
check("torque index covers every module row exactly (ids, slugs, order)",
  (() => {
    const perTable = {};
    const re = /id: "([^"]+)"[\s\S]*?rows: \[([\s\S]*?)\n      \]/g;
    let mm;
    while ((mm = re.exec(coreSrc))) {
      const slugs = [...mm[2].matchAll(/"slug":"([^"]+)"/g)].map((x) => x[1]);
      if (slugs.length) perTable[mm[1]] = slugs;
    }
    if (JSON.stringify(perTable["fsm-99482-98-sec2"]) !== JSON.stringify(D.torque.sec2.slugs)) return false;
    return D.torque.chapters.every((c) => JSON.stringify(perTable[c.id]) === JSON.stringify(c.slugs));
  })());
check("chapter titles match the module's table titles (no drift)",
  D.torque.chapters.every((c) => torqueTable(c.id) && torqueTable(c.id).title === c.title));
const ch = (t) => { const c = D.torque.chapters.find((x) => x.title === t); return c ? c.slugs.map((s) => torqueRow(c.id, s)) : []; };
check("crank pin nut is 180-210 ft-lbs",
  ch("Engine").some((r) => r.fastener === "Crank pin nut" && r.value.startsWith("180-210 ft-lbs")));
check("compensating sprocket nut is 150-165 ft-lbs",
  ch("Clutch & primary").some((r) => r.fastener === "Compensating sprocket nut" && r.value.startsWith("150-165 ft-lbs")));
check("transmission sprocket nut is 50 ft-lbs + a 30-45 degree turn",
  ch("Clutch & primary").some((r) => r.fastener === "Transmission sprocket nut" && r.value.includes("50 ft-lbs") && r.value.includes("30")));
check("neutral switch differs by year (1997 3-5, 1998 10-15)",
  ch("Electrical & charging").some((r) => r.fastener === "Neutral switch (1997 models)" && r.value.startsWith("3-5 ft-lbs")) &&
  ch("Electrical & charging").some((r) => r.fastener === "Neutral switch (1998 models)" && r.value.startsWith("10-15 ft-lbs")));
check("cylinder head + crankcase bolts point to the §3 sequences, not a value",
  ch("Engine").some((r) => r.fastener === "Cylinder head bolts" && r.value.includes("Cylinder Head Torque Sequence")) &&
  ch("Engine").some((r) => r.fastener === "Crankcase stud nut" && r.value.includes("Crankcase Torque Sequence")));
check("torque source cites the chapter pages", D.torque.source.includes("§3 p. 3-2") && D.torque.source.includes("§8 p. 8-1") && D.torque.source.includes("3-21") && D.torque.source.includes("3-66"));
/* --- torque sequences (FSM #99482-98 §3, verified from rendered pages Nov 24-25) --- */
eq("torque sequences: 2", D.torque.sequences.length, 2);
const sq = (id) => Core.getTorqueSequence(id);
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
check("no sequence value uses the misprinted 20-35 Nm as a real figure", D.torque.sequences.map((id) => Core.getTorqueSequence(id)).every((s) => s.passes.every((p) => !p.value.includes("20–35"))));
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

/* --- shared parts core wiring (pg-parts-core.js v1, batch 2) ---
   The app reads prices + torque from the module; data.js holds only
   keys. These checks pin the wiring, not just the values. */
check("data.js carries no inline prices", !("prices" in D));
check("data.js carries no inline torque rows or sequence objects",
  !("rows" in D.torque) && D.torque.chapters.every((c) => !("rows" in c)) &&
  D.torque.sequences.every((id) => typeof id === "string"));
check("pg-parts-core.js vendored byte-identical to canonical",
  fs.readFileSync(path.join(__dirname, "pg-parts-core.js"), "utf8") ===
  fs.readFileSync(path.join(__dirname, "..", "..", "pg-parts-core.js"), "utf8"));
check("index.html loads pg-parts-core.js before app.js",
  html.includes('src="pg-parts-core.js"') && html.indexOf('src="pg-parts-core.js"') < html.indexOf('src="app.js"'));
check("sw.js precaches pg-parts-core.js",
  fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("pg-parts-core.js"));
check("app.js reads prices and torque from the parts core, never from data.js",
  (() => {
    const a = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
    return a.includes("PartsCore.getPrice") && a.includes("PartsCore.getTorque") &&
      a.includes("PartsCore.getTorqueSequence") && !a.includes("D.prices") &&
      !a.includes("D.torque.rows") && !a.includes("D.torque.sequences.map((s)");
  })());
check("parts core validates clean", Core.validate() === true);
check("parts core is v1, data current to Nov 24, 2026", Core.version === 1 && Core.dataAsOf === "2026-11-24");
check("no shop labor rate exists in the parts core", typeof Core.shopCost === "undefined");
check("unknown part key returns null, never another part's price", Core.getPrice("no-such-part") === null);
check("unknown torque table/slug returns null, never another manual's value",
  Core.getTorque("no-such-table", "spark-plug") === null && Core.getTorque("fsm-99482-98-ch3", "no-such-fastener") === null);
check("torque source line in data.js matches the module's source line",
  (() => {
    const mm = coreSrc.match(/source: "(Harley-Davidson[^"]*)"/);
    return !!mm && mm[1] === D.torque.source;
  })());

/* --- Joshua's own atlas photos --- */
eq("own_photos has the Softail still", D.own_photos.length, 1);
check("own photo file exists", fs.existsSync(path.join(__dirname, D.own_photos[0].file)));
check("own photo is labeled as his", D.own_photos[0].credit.includes("Joshua's own photo"));
/* --- round 3 (Nov 25, 2026): Atlas photo duplication fix ---
   The Softail still appeared twice: a thumbnail in #cc-grid and the
   large tappable photo map. Decision: keep the map (the interactive
   surface), drop the thumbnail. The own_photos entry is flagged
   in_photo_map and app.js skips flagged entries in the grid loop. */
check("own photo flagged as the photo-map image (appears once, in the map)",
  D.own_photos[0].in_photo_map === true);
check("photo-map card in index.html uses the flagged file",
  html.includes('<img class="ed-photo" src="' + D.own_photos[0].file + '"'));
check("app.js skips in_photo_map entries when rendering the own-photos grid",
  fs.readFileSync(path.join(__dirname, "app.js"), "utf8").includes("filter((p) => !p.in_photo_map)"));
check("Atlas generic-layer note says the Softail still lives in the map card, not the grid",
  html.includes("tappable photo map in the next card, not here"));

/* --- tap-the-photo atlas: hand-placed regions on the Softail still ---
   Regions are percent-based buttons in index.html, class ed-photo-spot,
   wired by the same .ed-part click handler as the diagrams. Only parts
   clearly visible in the shot are mapped — no auto-detection, no guesses.
   Fat Boy / Knucklehead photos slot in later as their own per-photo maps. */
const photoSpots = [...html.matchAll(/class="ed-part ed-photo-spot" data-part="([^"]+)" style="([^"]+)"/g)];
eq("photo atlas maps exactly 4 regions", photoSpots.length, 4);
eq("photo atlas maps heads, crankcase, fork, rear-axle — the clearly visible parts",
  photoSpots.map((m) => m[1]).sort().join(","), "crankcase,fork,heads,rear-axle");
check("every photo region resolves to a real part record",
  photoSpots.every((m) => !!D.parts[m[1]] && !!D.parts[m[1]].fn && !!D.parts[m[1]].spec && !!D.parts[m[1]].failures && !!D.parts[m[1]].source));
check("every photo region is percent-positioned (left/top/width/height in %)",
  photoSpots.every((m) => /left:[\d.]+%;top:[\d.]+%;width:[\d.]+%;height:[\d.]+%/.test(m[2])));
check("every photo region stays inside the photo bounds",
  photoSpots.every((m) => {
    const v = Object.fromEntries([...m[2].matchAll(/(left|top|width|height):([\d.]+)%/g)].map((x) => [x[1], parseFloat(x[2])]));
    return v.left + v.width <= 100 && v.top + v.height <= 100;
  }));
check("tappable photo is Joshua's Softail still, in the Atlas panel before the detail box",
  html.includes('<div class="ed-photo-map">') &&
  html.includes('<img class="ed-photo" src="' + D.own_photos[0].file + '"') &&
  html.indexOf('<div class="ed-photo-map">') > html.indexOf('id="panel-atlas"') &&
  html.indexOf('<div class="ed-photo-map">') < html.indexOf('id="part-detail"'));
check("photo atlas uses only the one own photo — no other image is mapped",
  (html.match(/<div class="ed-photo-map">/g) || []).length === 1 &&
  !html.includes('data-part="carb-body" style=') && !html.includes('data-part="exhaust-gaskets" style=') &&
  !html.includes('data-part="belt" style=') && !html.includes('data-part="battery" style='));
check("photo spots are buttons with labels (tap targets, not bare divs)",
  photoSpots.every((m) => html.includes('<button type="button" class="ed-part ed-photo-spot" data-part="' + m[1] + '"')));

/* --- manifest + icons + files + new modules --- */
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));
eq("manifest name", manifest.name, "The Evo Diagnostic");
check("manifest wires icon-192", (manifest.icons || []).some((i) => i.sizes === "192x192"));
check("manifest wires icon-512", (manifest.icons || []).some((i) => i.sizes === "512x512"));
check("icon-512.png is real PNG bytes", fs.readFileSync(path.join(__dirname, "icon-512.png")).slice(0, 8).toString("hex") === "89504e470d0a1a0a");
check("icon-192.png is real PNG bytes", fs.readFileSync(path.join(__dirname, "icon-192.png")).slice(0, 8).toString("hex") === "89504e470d0a1a0a");
check("sw.js caches v22", fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("evo-diagnostic-v22"));
check("sw.js no longer names the v19 cache", !fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("evo-diagnostic-v19"));
check("sw.js precaches tire.js + nhtsa.js + handoff.js + sw-update.js + shop.js + wizard.js + report.js + gating.js", fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("tire.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("nhtsa.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("handoff.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("sw-update.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("shop.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("wizard.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("report.js") && fs.readFileSync(path.join(__dirname, "sw.js"), "utf8").includes("gating.js"));
check("index.html loads tire.js + nhtsa.js + handoff.js + shop.js + wizard.js + report.js", html.includes('src="tire.js"') && html.includes('src="nhtsa.js"') && html.includes('src="handoff.js"') && html.includes('src="shop.js"') && html.includes('src="wizard.js"') && html.includes('src="report.js"'));
check("index.html loads wizard.js + report.js before app.js", html.indexOf('src="wizard.js"') < html.indexOf('src="app.js"') && html.indexOf('src="report.js"') < html.indexOf('src="app.js"'));
check("index.html has the new sections", ["part-detail", "flash-input", "tire-input", "clip-record", "history-list", "add-bike-model"].every((id) => html.includes('id="' + id + '"')));
D.cc_photos.forEach((p) => check("CC photo present: " + p.file, fs.existsSync(path.join(__dirname, p.file))));
check("all CC photos have credits", D.cc_photos.every((p) => p.credit.includes("CC BY")));
check("suppliers are link-only", D.parts_suppliers.every((s) => s.url.startsWith("https://")));

/* --- new atlas parts (priced extras, Nov 24) --- */
["main-jet", "pilot-jet", "float", "plug-wires", "starter", "wheel-bearing", "intake-seals", "dot5-fluid", "exhaust-gaskets", "primary-shoe"].forEach((k) => {
  check("atlas part exists: " + k, !!D.parts[k] && !!D.parts[k].fn && !!D.parts[k].spec && !!D.parts[k].failures && !!D.parts[k].source);
  check("atlas part has a live price: " + k, !!Core.getPrice(k));
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
eq("144 causes total after round 3 (142 + 2 gap-fills)", D.trees.reduce((n, t) => n + t.causes.length, 0), 144);
check("every tree's weights sum to 100",
  D.trees.every((t) => t.causes.reduce((n, c) => n + c.weight, 0) === 100));
check("every tree step yes-value is mapped in scoring",
  D.trees.every((t) => t.steps.every((s) => !s.yes || s.yes === "next" || Object.prototype.hasOwnProperty.call(S.YES_MAP, s.yes))));
check("every cause has test/fix/urgency/ride",
  D.trees.every((t) => t.causes.every((c) => !!c.test && !!c.fix && ["low", "medium", "high", "critical"].includes(c.urgency) && !!c.ride)));
check("magazine causes are flagged NOT an FSM cause or tied to an FSM corroboration",
  D.trees.every((t) => t.causes.every((c) => !c.source || !c.source.includes("Easyriders") || c.source.includes("NOT an FSM cause") || c.source.includes("FSM"))));

/* --- go-crazy build (Nov 25, 2026): 5 trees from the Sportster 1986-2003 Troubleshooting Manual --- */
const speedoTree = D.trees.find((t) => t.id === "speedometer-inoperative");
const signalsTree = D.trees.find((t) => t.id === "turn-signals");
const powerTree = D.trees.find((t) => t.id === "poor-power-acceleration");
const overheatTree = D.trees.find((t) => t.id === "engine-overheating");
const starterTree = D.trees.find((t) => t.id === "starter-wont-disengage");
check("all five trouble-manual trees present", !!speedoTree && !!signalsTree && !!powerTree && !!overheatTree && !!starterTree);
eq("speedometer tree has 7 causes", speedoTree.causes.length, 7);
eq("turn-signals tree has 8 causes", signalsTree.causes.length, 8);
eq("poor-power tree has 11 causes", powerTree.causes.length, 11);
eq("overheating tree has 6 causes", overheatTree.causes.length, 6);
eq("starter-wont-disengage tree has 4 causes", starterTree.causes.length, 4);
[speedoTree, signalsTree, powerTree, overheatTree, starterTree].forEach((t) => {
  eq(t.id + " weights sum to 100", t.causes.reduce((n, c) => n + c.weight, 0), 100);
  t.steps.forEach((s, i) => check(t.id + " step " + i + " cites the troubleshooting manual", !!s.cite && s.cite.includes("Sportster 1986-2003 Troubleshooting Manual")));
  t.causes.forEach((c) => check(t.id + " cause has test/fix/urgency/ride: " + c.cause.slice(0, 30), !!c.test && !!c.fix && ["low", "medium", "high", "critical"].includes(c.urgency) && !!c.ride));
});
/* Every new-tree yes-key bumps exactly one cause by 15 and nothing else —
   this is what proves each YES_MAP word is unique within its tree. */
[speedoTree, signalsTree, powerTree, overheatTree, starterTree].forEach((t) => {
  const base = {};
  t.causes.forEach((c) => { base[c.cause] = c.weight; });
  const keys = [...new Set(t.steps.map((s) => s.yes).filter((k) => k && k !== "next"))];
  keys.forEach((k) => {
    const bumped = S.applyAnswer(base, t.causes, k, true);
    const moved = t.causes.filter((c) => bumped[c.cause] !== c.weight);
    check(t.id + " yes-key '" + k + "' bumps exactly one cause by 15",
      moved.length === 1 && bumped[moved[0].cause] - moved[0].weight === 15);
  });
});
check("speedometer tree: sensor power 8-12V (95-96) / 6-12V (97-98), white wire fluctuates 0-1V to 6-12V",
  speedoTree.steps[2].q.includes("8-12 V") && speedoTree.steps[2].q.includes("6-12 V") &&
  speedoTree.steps[5].q.includes("0-1 V") && speedoTree.steps[5].q.includes("6-12 V"));
check("speedometer head cause says confirm at a dealership — Scanalyzer",
  speedoTree.causes.find((c) => c.cause.includes("Speedometer head failed")).fix.includes("Scanalyzer"));
check("speedometer tree has no pre-1995 application — electronic head only (year split is in the steps)",
  speedoTree.steps[2].q.includes("1995-96") && speedoTree.steps[2].q.includes("1997-98"));
check("turn-signals tree: module power 12V at terminals 1-2, switch inputs 1-7 right / 1-8 left",
  signalsTree.steps[2].q.includes("terminals 1 and 2") && signalsTree.steps[3].q.includes("terminals 1 and 7") &&
  signalsTree.steps[4].q.includes("terminals 1 and 8"));
check("turn-signals tree: jumper 2-3 lights the right lamps, 2-4 the left",
  signalsTree.steps[5].q.includes("terminals 2 and 3") && signalsTree.steps[6].q.includes("terminals 2 and 4"));
check("turn-signals cancel cause uses the white/green speedometer signal (Fig. 100)",
  signalsTree.causes[0].test.includes("white/green") && signalsTree.causes[0].test.includes("6-12 V"));
check("poor-power tree: leakdown over 12% between cylinders, listen for the leak",
  powerTree.steps[9].q.includes("12%") && powerTree.causes.find((c) => c.cause.includes("Poor engine condition")).test.includes("Over 12% loss difference"));
check("poor-power tree: float level 0.413-0.453 in on the high-speed cause",
  powerTree.causes.find((c) => c.cause.includes("high speeds")).fix.includes("0.413-0.453 in"));
check("poor-power tree: timing 20 deg BTDC, plugs 5R6A 0.038-0.043 in",
  powerTree.steps[4].q.includes("20 deg BTDC") && powerTree.steps[3].q.includes("0.038-0.043 in"));
check("overheating tree: oil light above idle means oil not circulating — DO NOT RIDE",
  overheatTree.causes.find((c) => c.cause.includes("Oil not circulating")).ride.includes("DO NOT RIDE") &&
  overheatTree.causes.find((c) => c.cause.includes("Oil not circulating")).test.includes("above idle"));
check("overheating tree: lean carb is the first-listed cause, timing the second",
  overheatTree.causes.find((c) => c.cause.includes("running lean")).test.includes("carb-lean-idle") &&
  overheatTree.causes.find((c) => c.cause.includes("Ignition timing")).test.includes("20 deg BTDC"));
check("starter tree: solenoid compression spring, pinion jammed on worn ring gear, disconnect the battery",
  starterTree.causes.find((c) => c.cause.includes("Sticking solenoid")).test.includes("compression spring") &&
  starterTree.causes.find((c) => c.cause.includes("pinion gear jammed")).test.includes("ring gear") &&
  starterTree.causes[0].ride.includes("disconnect the battery"));
check("starter tree: grinding is the broken overrunning clutch or wrong engagement",
  starterTree.causes.find((c) => c.cause.includes("Grinding")).test.includes("overrunning clutch"));
const sportsterChapter = D.torque.chapters.find((c) => c.title.startsWith("Sportster"));
check("Sportster torque chapter present", !!sportsterChapter);
eq("Sportster torque chapter has 2 rows", sportsterChapter.slugs.length, 2);
check("Sportster clutch cover screws 84-108 in-lbs (conflicts with Softail 50-70)",
  torqueRow("sportster-86-03", "clutch-inspection-cover-screws").value.includes("84–108 in-lbs") && torqueRow("sportster-86-03", "clutch-inspection-cover-screws").value.includes("50–70"));
check("Sportster spark plug 11-18 ft-lbs (Softail is 18-22)",
  torqueRow("sportster-86-03", "spark-plug").value.includes("11–18 ft-lbs") && torqueRow("sportster-86-03", "spark-plug").value.includes("18–22"));
check("same slug, different table: Softail clutch cover is 50-70 in-lbs, never the Sportster value",
  torqueRow("fsm-99482-98-ch6", "clutch-inspection-cover-screws").value.includes("50-70 in-lbs") &&
  !torqueRow("fsm-99482-98-ch6", "clutch-inspection-cover-screws").value.includes("84–108"));
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
eq("wheels tree has 9 causes", wheelsTree.causes.length, 9);
eq("brakes tree has 7 causes", brakesTree.causes.length, 7);
eq("no-start tree has 9 causes", noStartTree.causes.length, 9);
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

/* --- Tech Tips Vols 1, 2, 4 + The Biker (batch 2 "overlooked", Nov 25, 2026) ---
   Four genuinely new causes, one per tree, each neighbor-checked and
   flagged NOT an FSM cause. The Biker (July 1980) yielded nothing
   Evo-applicable — 95 chunks of road tests on other marques — so it
   contributes no cause here. Rebalances keep every touched tree at 100:
   lean-idle enrichener 10→5, no-start fuel delivery 20→15, wheels
   suspension 10→5, clutch primary oil 10→5. */
const leanTree = D.trees.find((t) => t.id === "carb-lean-idle");
const clutchTree = D.trees.find((t) => t.id === "clutch");
eq("lean-idle tree has 10 causes", leanTree.causes.length, 10);
eq("clutch tree has 7 causes", clutchTree.causes.length, 7);
check("batch 2 breather cause flagged Vol. 2 §36",
  leanTree.causes.some((c) => c.cause.includes("Float-bowl breather") && c.source.includes("NOT an FSM cause") && c.source.includes("Vol. 2, §36")));
check("batch 2 petcock-screens cause flagged Vol. 2 §16",
  noStartTree.causes.some((c) => c.cause.includes("Petcock filter screens") && c.source.includes("NOT an FSM cause") && c.source.includes("Vol. 2, §16")));
check("batch 2 tire-weave cause flagged Vol. 2 §97",
  wheelsTree.causes.some((c) => c.cause.includes("Wrong tire for the bike") && c.source.includes("NOT an FSM cause") && c.source.includes("Vol. 2, §97")));
check("batch 2 pushrod cause flagged Vol. 4 §79",
  clutchTree.causes.some((c) => c.cause.includes("Pressure plate lifts uneven") && c.source.includes("NOT an FSM cause") && c.source.includes("Vol. 4, §79")));
check("batch 2 rebalances keep the four touched trees at 100",
  [leanTree, noStartTree, wheelsTree, clutchTree].every((t) => t.causes.reduce((n, c) => n + c.weight, 0) === 100));
check("batch 2 rebalance values are the ones drafted",
  leanTree.causes.find((c) => c.cause.includes("Enrichener circuit")).weight === 5 &&
  noStartTree.causes.find((c) => c.cause.includes("Fuel delivery")).weight === 15 &&
  wheelsTree.causes.find((c) => c.cause.includes("Suspension")).weight === 5 &&
  clutchTree.causes.find((c) => c.cause.includes("Primary oil")).weight === 5);
check("batch 2 new causes carry no part field (no price key to invent)",
  [leanTree, noStartTree, wheelsTree, clutchTree].every((t) =>
    t.causes.filter((c) => c.cause.includes("Float-bowl breather") || c.cause.includes("Petcock filter screens") || c.cause.includes("Wrong tire for the bike") || c.cause.includes("Pressure plate lifts uneven")).every((c) => !c.part)));
const leanBase = {};
leanTree.causes.forEach((c) => { leanBase[c.cause] = c.weight; });
check("bowl-breather yes bumps only the breather cause by 15",
  S.applyAnswer(leanBase, leanTree.causes, "bowl-breather", true)["Float-bowl breather pinched or pointed into the wind — erratic carb tune"] - 5 === 15 &&
  leanTree.causes.filter((c) => !c.cause.includes("Float-bowl breather")).every((c) => S.applyAnswer(leanBase, leanTree.causes, "bowl-breather", true)[c.cause] === c.weight));
const nsBase2 = {};
noStartTree.causes.forEach((c) => { nsBase2[c.cause] = c.weight; });
check("screens yes bumps only the petcock-screens cause by 15",
  S.applyAnswer(nsBase2, noStartTree.causes, "screens", true)["Petcock filter screens blocked by rust after storage — fuel starvation"] - 5 === 15 &&
  noStartTree.causes.filter((c) => !c.cause.includes("Petcock filter screens")).every((c) => S.applyAnswer(nsBase2, noStartTree.causes, "screens", true)[c.cause] === c.weight));
const wheelsBase = {};
wheelsTree.causes.forEach((c) => { wheelsBase[c.cause] = c.weight; });
check("weave yes bumps only the tire-weave cause by 15",
  S.applyAnswer(wheelsBase, wheelsTree.causes, "weave", true)["Wrong tire for the bike — high-speed wobble / weave"] - 5 === 15 &&
  wheelsTree.causes.filter((c) => !c.cause.includes("Wrong tire for the bike")).every((c) => S.applyAnswer(wheelsBase, wheelsTree.causes, "weave", true)[c.cause] === c.weight));
const clutchBase = {};
clutchTree.causes.forEach((c) => { clutchBase[c.cause] = c.weight; });
check("pushrod yes bumps only the pushrod cause by 15",
  S.applyAnswer(clutchBase, clutchTree.causes, "pushrod", true)["Pressure plate lifts uneven — release pushrod grooved or unsupported, mainshaft bent"] - 5 === 15 &&
  clutchTree.causes.filter((c) => !c.cause.includes("Pressure plate lifts uneven")).every((c) => S.applyAnswer(clutchBase, clutchTree.causes, "pushrod", true)[c.cause] === c.weight));
check("batch 2 steps cite their sources",
  [leanTree, noStartTree, wheelsTree, clutchTree].every((t) => t.steps.every((s) => !!s.cite)));

/* --- fix-them-all batch (Nov 25, 2026): A3 ladder + O-rings, B5 annual legs, B7 Ronnie's 1995 FLSTF link ---
   A3 reverses the Nov 24 sweep's two rejected citations — both were RIGHT.
   The sweep's neighbor-check read only magsearch's 800-char truncation:
   ER_153 §27 opens with the transition-circuit holes and the ladder sits in
   the chunk's second half; ER_267 §43 opens with "SAVE THE SEALS" (pushrod
   Quad seals, '82 FLH) and the O-ring warm-restart letter ("NO PICK UP")
   sits in the same chunk's second half. Both verified verbatim in the DB. */
check("A3 ladder cause is wired with the ER_153 §27 citation and the full ladder",
  leanTree.causes.some((c) => c.cause.includes("symptom ladder") && c.source.includes("NOT an FSM cause") && c.source.includes("ER_153 §27") &&
    c.test.includes("loads up") && c.test.includes("black smoke") && c.test.includes("bucks and jumps") && c.test.includes("surges at a steady cruise")));
check("A3 O-ring cause is wired with ER_267 §43 + ER_390 Evo corroboration, Shovelhead letter flagged",
  leanTree.causes.some((c) => c.cause.includes("Manifold O-rings leaking") && c.source.includes("NOT an FSM cause") && c.source.includes("ER_267 §43") && c.source.includes("ER_390 §45") && c.source.includes("Shovelhead")));
check("A3 rebalance keeps lean-idle at 100 (intake-leak 25→20, turn-count 10→5, ladder 5, O-rings 5)",
  leanTree.causes.find((c) => c.cause.includes("Intake leak")).weight === 20 &&
  leanTree.causes.find((c) => c.cause.includes("turn-count")).weight === 5 &&
  leanTree.causes.find((c) => c.cause.includes("symptom ladder")).weight === 5 &&
  leanTree.causes.find((c) => c.cause.includes("Manifold O-rings")).weight === 5 &&
  leanTree.causes.reduce((n, c) => n + c.weight, 0) === 100);
check("A3 ladder + O-ring causes carry part keys that resolve in the parts core",
  ["symptom ladder", "Manifold O-rings"].every((frag) => { const c = leanTree.causes.find((x) => x.cause.includes(frag)); return c && c.part && Core.getPrice(c.part) !== null; }));
const leanBaseA3 = {};
leanTree.causes.forEach((c) => { leanBaseA3[c.cause] = c.weight; });
check("ladder yes bumps only the ladder cause by 15",
  S.applyAnswer(leanBaseA3, leanTree.causes, "ladder", true)["Idle jet wrong size — symptom ladder (one/two sizes rich or lean)"] - 5 === 15 &&
  leanTree.causes.filter((c) => !c.cause.includes("symptom ladder")).every((c) => S.applyAnswer(leanBaseA3, leanTree.causes, "ladder", true)[c.cause] === c.weight));
check("orings yes bumps only the O-ring cause by 15",
  S.applyAnswer(leanBaseA3, leanTree.causes, "orings", true)["Manifold O-rings leaking — won't idle after a warm restart"] - 5 === 15 &&
  leanTree.causes.filter((c) => !c.cause.includes("Manifold O-rings")).every((c) => S.applyAnswer(leanBaseA3, leanTree.causes, "orings", true)[c.cause] === c.weight));
check("B5 oil service carries the FSM (*) annual leg (specs + shop card)",
  D.specs.oil_service.includes("annually") && D.specs.oil_service.includes("prior to storage") && D.specs.oil_service.includes("(*)") &&
  D.shop.oil.service.includes("annually") && D.shop.oil.service.includes("1-34"));
check("B5 wheel-bearing atlas record + wheels cause carry the FSM (*) annual leg (p. 1-35)",
  D.parts["wheel-bearing"].failures.includes("annually") && D.parts["wheel-bearing"].failures.includes("1-35") &&
  wheelsTree.causes.find((c) => c.cause.includes("Wheel bearings")).test.includes("annually"));
check("B5 brake-fluid atlas record carries the FSM (*) annual leg (p. 1-36)",
  D.parts["dot5-fluid"].failures.includes("annually") && D.parts["dot5-fluid"].failures.includes("1-36"));
check("B5 front-fork-oil cause carries the FSM (*) annual leg (p. 1-36, fifth asterisked item)",
  wheelsTree.causes.find((c) => c.cause.includes("Fork oil level")).fix.includes("annually") && wheelsTree.causes.find((c) => c.cause.includes("Fork oil level")).fix.includes("1-36"));
check("B5 no annual leg is claimed for rear-fork/swingarm bearings (no FSM row for them)",
  !D.trees.some((t) => t.causes.some((c) => ((c.test + " " + c.fix).toLowerCase().includes("swingarm") || (c.test + " " + c.fix).toLowerCase().includes("rear fork")) && (c.test + " " + c.fix).toLowerCase().includes("annually"))));
check("B7 Ronnie's 1995 FLSTF model-203 fiche link is wired (link only)",
  D.parts_suppliers.some((s) => s.url === "https://partsfinder.onlinemicrofiche.com/ronnies/showmodel/13/harleydavidsonmc/203/%20/1995%20Harley%20Davidson%20Street%20Bike%20FLSTF%20FAT%20BOY%20(BM)" && s.name.includes("1995 FLSTF")));
check("B7 no Ronnie's FLSTC link (1990 has no page; 1991 is the wrong year)",
  D.parts_suppliers.every((s) => !s.url.includes("FLSTC")));
eq("petcock-screens cause maps to FUEL SYSTEM, GASOLINE 7",
  NH.complaintForCause(counts, "Starting", "Petcock filter screens blocked by rust after storage — fuel starvation").count, 7);
check("wrong-tire cause shows no count (rider selection, like pressure)",
  NH.complaintForCause(counts, "Suspension / wheels / tires", "Wrong tire for the bike — high-speed wobble / weave") === null);

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
check("intake-seals price is $4.95", Core.getPrice("intake-seals").price === 4.95);
check("dot5-fluid spec is DOT 5 only, part no. 99902-77", D.parts["dot5-fluid"].spec.includes("99902-77") && D.parts["dot5-fluid"].spec.includes("Use only D.O.T. 5"));
check("dot5-fluid record does NOT present 'never DOT 3/4' as an FSM quote", !D.parts["dot5-fluid"].spec.includes("never DOT 3/4") && !D.parts["dot5-fluid"].failures.includes("never DOT 3/4"));
check("dot5-fluid price is $39.99", Core.getPrice("dot5-fluid").price === 39.99);
check("exhaust-gaskets spec has the flange-nut sequence and TORCA 45-60 ft-lbs", D.parts["exhaust-gaskets"].spec.includes("120 in-lbs") && D.parts["exhaust-gaskets"].spec.includes("45–60 ft-lbs") && D.parts["exhaust-gaskets"].spec.includes("one-time use"));
check("exhaust-gaskets price is $8.95", Core.getPrice("exhaust-gaskets").price === 8.95);
check("primary-shoe spec is 5/8-7/8 in and 21-29 ft-lbs, alignment within 0.030 in", D.parts["primary-shoe"].spec.includes("5/8–7/8 in") && D.parts["primary-shoe"].spec.includes("21–29 ft-lbs") && D.parts["primary-shoe"].spec.includes("0.030 in"));
check("primary-shoe replace rule quotes the FSM", D.parts["primary-shoe"].spec.includes("If the chain tensioner shoe is worn"));
check("primary-shoe price is $8.79", Core.getPrice("primary-shoe").price === 8.79);
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
/* --- wave 2 (Nov 25, 2026): + tire reader + unit converter = 13 cards --- */
/* --- wave 3 (Nov 25, 2026): + belt, clutch, primary chain, storage = 17 cards --- */
/* --- wave 4 (Nov 25, 2026): + brake pads, fork oil, first 500-mile service = 20 cards --- */
/* --- wave 5 (Nov 25, 2026): + engine oil, transmission oil, primary oil, brake fluid flush = 24 cards --- */
const SH = require("./shop.js");
check("index.html has the Shop tab", html.includes('data-tab="shop"') && html.includes('id="panel-shop"'));
["plug-reader", "wire-fuse", "gear-ratio", "tap-drill", "bolt-id", "oil-viscosity", "compression-ratio", "carb-cfm", "sag-setter", "parts-interchange", "pre-ride", "tire-reader", "unit-converter", "belt-adjust", "clutch-adjust", "primary-chain", "storage", "brake-pads", "fork-oil", "first-500", "engine-oil", "transmission-oil", "primary-oil", "brake-fluid-flush"].forEach((id) =>
  check("index.html has the " + id + " card", html.includes('id="' + id + '"')));
check("app.js renders all 24 shop cards", ["plug-reader", "wire-fuse", "gear-ratio", "tap-drill", "bolt-id", "oil-viscosity", "compression-ratio", "carb-cfm", "sag-setter", "parts-interchange", "pre-ride", "tire-reader", "unit-converter", "belt-adjust", "clutch-adjust", "primary-chain", "storage", "brake-pads", "fork-oil", "first-500", "engine-oil", "transmission-oil", "primary-oil", "brake-fluid-flush"].every((id) => appjs.includes("$(\"" + id + "\")")));
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
check("sag re-search (Nov 25, 2026) names every source searched and what each one actually says",
  D.shop.sag.no_target.includes("Re-searched Nov 25, 2026") &&
  D.shop.sag.no_target.includes("FSM #99482-98") &&
  D.shop.sag.no_target.includes("Clymer") &&
  D.shop.sag.no_target.includes("Easyriders") &&
  D.shop.sag.no_target.includes("Tech Tips") &&
  D.shop.sag.no_target.includes("still needs Joshua's number"));

/* parts interchange: 14 rows, magazine rows flagged */
eq("interchange has 14 rows", D.shop.interchange.rows.length, 14);
check("wheel bearing 9052 fits 1973-99 Big Twin + Sportster", D.shop.interchange.rows.some((r) => r.part.includes("9052") && r.fits.includes("1973-99")));
check("brake pads 44063-83C/D fit all XL/FX/FL 1984-99", D.shop.interchange.rows.some((r) => r.part.includes("44063-83C/D") && r.fits.includes("1984-99")));
check("stator, regulator, pads-vs-92-rotors and VOES rows are explicit NON-interchange warnings", D.shop.interchange.rows.filter((r) => r.fits.startsWith("DOES NOT interchange")).length === 4);
check("Big Twin stator 29970-88C fits Softail 1989-99, Dyna, FXR, carbureted Touring; excludes EFI and Sportsters",
  D.shop.interchange.rows.some((r) => r.part.includes("29970-88C") && r.fits.includes("Softail 1989-99") && r.note.includes("Excludes EFI Touring")));
check("Sportster stator 29967-89C fits all XL 1991-2006 + Buell M2 1997-2002",
  D.shop.interchange.rows.some((r) => r.part.includes("29967-89C") && r.fits.includes("1991-2006") && r.fits.includes("Buell M2")));
check("Sportster regulator 74523-94A fits all XL 1994-2003, battery models only",
  D.shop.interchange.rows.some((r) => r.part.includes("74523-94A") && r.fits.includes("1994-2003") && r.note.includes("Battery models only")));
check("Big Twin regulator 74519-88A shares the stator year window",
  D.shop.interchange.rows.some((r) => r.part.includes("74519-88A") && r.fits.includes("Softail 1989-99") && r.note.includes("changed as a set in 1989")));
check("1991-and-earlier pads must not be used with 1992 stainless rotors (P-20)",
  D.shop.interchange.rows.some((r) => r.part.includes("1992 stainless rotors") && r.fits.includes("DOES NOT interchange") && r.source.includes("P-20")));
check("wheel bearing 9052 has a second application: Big Twin swingarms 1958-84",
  D.shop.interchange.rows.some((r) => r.part.includes("9052") && r.fits.includes("swingarms 1958-84")));
check("VOES does not interchange across year bands — 26557-83, 26566-91, 26566-96",
  D.shop.interchange.rows.some((r) => r.part.includes("VOES") && r.fits.includes("26557-83") && r.fits.includes("26566-91") && r.fits.includes("26566-96")));
check("interchange ref names the aftermarket corroboration sources",
  D.shop.interchange.ref.includes("Drag Specialties") && D.shop.interchange.ref.includes("Cycle Electric") && D.shop.interchange.ref.includes("FXR Archive"));
check("magazine interchange rows are flagged NOT an FSM cause",
  D.shop.interchange.rows.filter((r) => r.source.includes("Easyriders")).every((r) => r.source.includes("NOT an FSM cause")));
check("head bolts / rocker boxes row warns they do not interchange between years",
  D.shop.interchange.rows.some((r) => r.part.includes("Cylinder head bolts") && r.fits.includes("NOT interchangeable")));

/* tire reader: sidewall decode from the Nov 21, 2026 tire-standards research */
const TR = D.shop.tire_reader;
eq("alpha table has 10 rows", TR.alpha.length, 10);
eq("MT90 is 130/90 (stock Evo Softail rear)", TR.alpha.find((r) => r.alpha === "MT90").metric, "130/90");
eq("load index table covers LI 40-91 (52 rows)", TR.load_index.length, 52);
eq("LI 67 is 307 kg / 677 lb", SH.loadIndexKg(67, TR.load_index).kg + "/" + SH.loadIndexKg(67, TR.load_index).lb, "307/677");
eq("LI 74 is 375 kg / 827 lb", SH.loadIndexKg(74, TR.load_index).kg + "/" + SH.loadIndexKg(74, TR.load_index).lb, "375/827");
eq("LI 57 is 230 kg / 507 lb (typical Evo front)", SH.loadIndexKg(57, TR.load_index).kg + "/" + SH.loadIndexKg(57, TR.load_index).lb, "230/507");
check("load-index lb is kg x 2.2046 rounded on every row",
  TR.load_index.every((r) => SH.loadIndexKg(r.li, TR.load_index).lb === Math.round(r.kg * 2.2046)));
check("load index outside the table returns null", SH.loadIndexKg(99, TR.load_index) === null);
eq("speed H is 210 km/h / 130 mph", SH.speedRating("H", TR.speed_rating).kmh + "/" + SH.speedRating("H", TR.speed_rating).mph, "210/130");
eq("speed P is 150 km/h / 93 mph (not the 94 mph variant)", SH.speedRating("P", TR.speed_rating).kmh + "/" + SH.speedRating("P", TR.speed_rating).mph, "150/93");
eq("speed S is 180 km/h / 112 mph", SH.speedRating("S", TR.speed_rating).kmh + "/" + SH.speedRating("S", TR.speed_rating).mph, "180/112");
check("unknown speed symbol returns null", SH.speedRating("X", TR.speed_rating) === null);
check("metric size decodes: 130/90-16 is 130 mm, 90%, bias, 16 in rim",
  (() => { const d = SH.tireSizeDecode("130/90-16", TR.alpha); return d.system === "metric" && d.width_mm === 130 && d.aspect === 90 && d.construction === "bias" && d.rim_in === 16; })());
check("radial decodes: 180/55ZR17 is radial with a Z prefix",
  (() => { const d = SH.tireSizeDecode("180/55ZR17", TR.alpha); return d.system === "metric" && d.construction === "radial" && d.speed_prefix === "Z" && d.rim_in === 17; })());
check("alpha decodes: MT90-16 is alpha, about 130/90, bias",
  (() => { const d = SH.tireSizeDecode("MT90-16", TR.alpha); return d.system === "alpha" && d.alpha === "MT90" && d.metric_equiv === "130/90" && d.construction === "bias"; })());
check("alpha B is bias-belted: MT90B16",
  (() => { const d = SH.tireSizeDecode("MT90B16", TR.alpha); return d.construction === "bias-belted" && d.rim_in === 16; })());
check("inch decodes: 5.00-16 is 5.00 in (127 mm), bias, no aspect",
  (() => { const d = SH.tireSizeDecode("5.00-16", TR.alpha); return d.system === "inch" && d.width_in === 5 && d.width_mm === 127 && d.aspect === null && d.rim_in === 16; })());
check("garbage size returns an error, not a guess", SH.tireSizeDecode("banana", TR.alpha).error !== undefined);
check("service description decodes: 130/90-16 M/C 67H is LI 67 + speed H",
  (() => { const s = SH.tireServiceDecode("130/90-16 M/C 67H", TR.load_index, TR.speed_rating); return s.load_index === 67 && s.load.kg === 307 && s.speed.symbol === "H" && s.speed.mph === 130; })());
check("service description decodes without M/C: MT90-16 74H",
  (() => { const s = SH.tireServiceDecode("MT90-16 74H", TR.load_index, TR.speed_rating); return s.load_index === 74 && s.load.kg === 375 && s.speed.symbol === "H"; })());
check("size with no service description has null load and speed",
  (() => { const s = SH.tireServiceDecode("130/90-16", TR.load_index, TR.speed_rating); return s.load_index === null && s.speed === null; })());
check("tire reader cites the Nov 21 research report", TR.ref.includes("Nov 21, 2026") && TR.ref.includes("tire-helmet-standards-20261121"));
check("tire notes carry the 5-year-inspect / 10-year-replace rule and name Michelin + Dunlop",
  TR.notes.some((n) => n.includes("5 years") && n.includes("10 years") && n.includes("Michelin") && n.includes("Dunlop")));
check("tire notes say the 6-year figure is a car-tire number, not for motorcycles",
  TR.notes.some((n) => n.includes("6-year") && n.includes("car-tire")));
check("tire notes say the sidewall number is the maximum, never the recommended pressure",
  TR.notes.some((n) => n.includes("MAXIMUM") && n.includes("never the recommended")));
check("tire notes carry the tread limits (2/32 consider new, 1/32 worn out)",
  TR.notes.some((n) => n.includes("2/32") && n.includes("1/32")));
check("tire notes flag the alpha B load-range trap",
  TR.notes.some((n) => n.includes("Load Range B")));
check("tire notes say kg is authoritative and lb is rounded",
  TR.notes.some((n) => n.includes("kg is the authoritative") && n.includes("rounded")));
check("app.js tire reader reuses ED_Tire.decode for the DOT date (no second date decoder)",
  appjs.includes("ED_Tire.decode(dot, new Date())"));
check("app.js tire reader renders the alpha table and the notes", appjs.includes("SH.tire_reader.alpha") && appjs.includes("SH.tire_reader.notes"));

/* unit converter: standard definitions, exact factors */
const UC = D.shop.unit_converter;
eq("unit converter has 4 categories", UC.categories.length, 4);
check("unit converter labels its factors standard definitions, not manual specs",
  UC.ref.includes("Standard unit definitions") && UC.ref.includes("not manual specs"));
eq("1 inch = 25.4 mm exactly", SH.unitConvert(1, "in", "mm", UC.categories[0].units), 25.4);
eq("25.4 mm = 1 inch", SH.unitConvert(25.4, "mm", "in", UC.categories[0].units), 1);
eq("1 mile = 1609.344 m", SH.unitConvert(1, "mi", "m", UC.categories[0].units), 1609.344);
eq("1 foot = 12 inches", Math.round(SH.unitConvert(1, "ft", "in", UC.categories[0].units) * 10000) / 10000, 12);
eq("1 ft-lb = 12 in-lb exactly", SH.unitConvert(1, "ftlb", "inlb", UC.categories[1].units), 12);
eq("1 ft-lb = 1.3558 N·m (4 dp)", Math.round(SH.unitConvert(1, "ftlb", "Nm", UC.categories[1].units) * 10000) / 10000, 1.3558);
eq("115 ft-lb = 155.92 N·m (FSM shock-bolt low end)", Math.round(SH.unitConvert(115, "ftlb", "Nm", UC.categories[1].units) * 100) / 100, 155.92);
eq("1 N·m = 0.7376 ft-lb (4 dp)", Math.round(SH.unitConvert(1, "Nm", "ftlb", UC.categories[1].units) * 10000) / 10000, 0.7376);
eq("1 kg·m = 9.80665 N·m", SH.unitConvert(1, "kgm", "Nm", UC.categories[1].units), 9.80665);
eq("1 psi = 6.895 kPa (3 dp)", Math.round(SH.unitConvert(1, "psi", "kPa", UC.categories[2].units) * 1000) / 1000, 6.895);
eq("36 psi = 248.2 kPa (1 dp)", Math.round(SH.unitConvert(36, "psi", "kPa", UC.categories[2].units) * 10) / 10, 248.2);
eq("1 bar = 14.5038 psi (4 dp)", Math.round(SH.unitConvert(1, "bar", "psi", UC.categories[2].units) * 10000) / 10000, 14.5038);
eq("1 US fl oz = 29.5735 mL (4 dp)", Math.round(SH.unitConvert(1, "floz", "mL", UC.categories[3].units) * 10000) / 10000, 29.5735);
eq("1 US quart = 946.3529 mL (4 dp)", Math.round(SH.unitConvert(1, "qt", "mL", UC.categories[3].units) * 10000) / 10000, 946.3529);
eq("3.0 qt oil tank = 2.8391 L (4 dp)", Math.round(SH.unitConvert(3, "qt", "L", UC.categories[3].units) * 10000) / 10000, 2.8391);
eq("1 cubic inch = 16.387064 mL", SH.unitConvert(1, "cuin", "mL", UC.categories[3].units), 16.387064);
eq("81.6 cu in = 1337.2 mL (1 dp)", Math.round(SH.unitConvert(81.6, "cuin", "mL", UC.categories[3].units) * 10) / 10, 1337.2);
check("same unit converts to itself", SH.unitConvert(42, "psi", "psi", UC.categories[2].units) === 42);
check("unknown unit returns null", SH.unitConvert(1, "psi", "furlong", UC.categories[2].units) === null);
check("non-numeric value returns null", SH.unitConvert(NaN, "psi", "kPa", UC.categories[2].units) === null);
check("unit converter notes name the exact definitions (25.4 mm, 12 in-lb, 29.5735295625 mL)",
  UC.notes.some((n) => n.includes("25.4 mm") && n.includes("12 in-lb") && n.includes("29.5735295625")));
check("unit converter notes carry the 3.0 qt oil-tank conversion context",
  UC.notes.some((n) => n.includes("3.0 qt")));
check("app.js unit converter wires category/value/from/to and renders the result",
  appjs.includes("$(\"uc-cat\")") && appjs.includes("$(\"uc-from\")") && appjs.includes("$(\"uc-to\")") && appjs.includes("ED_Shop.unitConvert"));

/* belt adjustment: FSM §1 pp. 1-43–1-44 */
eq("belt procedure has 5 steps", D.shop.belt.steps.length, 5);
check("belt spec is 3/8-1/2 in at 10 lbs with gauge HD-35381",
  D.shop.belt.spec.includes("3/8–1/2 in") && D.shop.belt.spec.includes("9.5–13 mm") &&
  D.shop.belt.spec.includes("10 lbs") && D.shop.belt.spec.includes("HD-35381"));
check("belt conditions: tightest point, cold, owner's weight",
  D.shop.belt.conditions.some((c) => c.includes("tightest point")) &&
  D.shop.belt.conditions.some((c) => c.includes("cold")) &&
  D.shop.belt.conditions.some((c) => c.includes("weight of the owner")));
check("belt interval is 500 miles then every 5000", D.shop.belt.interval.includes("500 mile") && D.shop.belt.interval.includes("5000 mile"));
check("belt adjust: equal turns on each adjuster bolt to keep the wheel aligned",
  D.shop.belt.steps.some((s) => s.includes("equal number of turns") && s.includes("wheel aligned")));
check("belt axle nut 60 ft-lbs, never over 65 ft-lbs",
  D.shop.belt.steps.some((s) => s.includes("60 ft-lbs")) && D.shop.belt.caution.includes("65 ft-lbs") &&
  D.shop.belt.caution.includes("wheel bearings to seize"));
check("belt ref cites FSM §1 pp. 1-43–1-44", D.shop.belt.ref.includes("pp. 1-43–1-44"));
check("app.js belt card renders spec, steps and caution",
  appjs.includes("SH.belt.spec") && appjs.includes("SH.belt.steps") && appjs.includes("SH.belt.caution"));

/* clutch adjustment: FSM §1 p. 1-40 */
eq("clutch procedure has 7 steps", D.shop.clutch.steps.length, 7);
check("clutch interval is predelivery, 500 miles, every 5000",
  D.shop.clutch.interval.includes("predelivery") && D.shop.clutch.interval.includes("500 mile") && D.shop.clutch.interval.includes("5000 mile"));
check("clutch caution is room temperature — hot adjustment slips the clutch cold",
  D.shop.clutch.caution.includes("room temperature") && D.shop.clutch.caution.includes("clutch slippage"));
check("clutch step 4 takes up all pushrod free play clockwise",
  D.shop.clutch.steps[3].includes("take up all free play") && D.shop.clutch.steps[3].includes("clockwise"));
check("clutch step 5 backs out 1/2 to 1 turn, jamnut 6-10 ft-lbs",
  D.shop.clutch.steps[4].includes("1/2 to 1 full turn") && D.shop.clutch.steps[4].includes("6–10 ft-lbs"));
check("clutch step 6 squeezes the lever three times, cable free play 1/16-1/8 in",
  D.shop.clutch.steps[5].includes("three times") && D.shop.clutch.steps[5].includes("1/16–1/8 in"));
check("clutch cover screws 50-70 in-lbs with new O-ring and washers",
  D.shop.clutch.steps[6].includes("50–70 in-lbs") && D.shop.clutch.steps[6].includes("new O-ring"));
check("clutch note: re-adjust after 500 miles if components were replaced",
  D.shop.clutch.note.includes("500 miles") && D.shop.clutch.note.includes("replaced"));
check("clutch ref cites FSM §1 p. 1-40", D.shop.clutch.ref.includes("p. 1-40"));
check("app.js clutch card renders interval, caution, steps and note",
  appjs.includes("SH.clutch.interval") && appjs.includes("SH.clutch.caution") && appjs.includes("SH.clutch.steps") && appjs.includes("SH.clutch.note"));

/* primary chain: FSM §1 pp. 1-38–1-39 */
eq("primary chain procedure has 4 steps", D.shop.primary_chain.steps.length, 4);
check("primary chain spec is 5/8-7/8 in cold, 3/8-5/8 in hot",
  D.shop.primary_chain.spec.includes("5/8–7/8 in") && D.shop.primary_chain.spec.includes("15.9–22.3 mm") &&
  D.shop.primary_chain.spec.includes("3/8–5/8 in") && D.shop.primary_chain.spec.includes("9.5–15.9 mm"));
check("primary chain warning is battery negative first",
  D.shop.primary_chain.warning.includes("negative cable first") && D.shop.primary_chain.warning.includes("battery explosion"));
check("primary chain caution is tightest spot, never tighter than spec",
  D.shop.primary_chain.caution.includes("tightest spot") && D.shop.primary_chain.caution.includes("too tight"));
check("primary chain step 3: loosen center bolt nut (do not remove), shoe up/down, 21-29 ft-lbs",
  D.shop.primary_chain.steps[2].includes("do not remove") && D.shop.primary_chain.steps[2].includes("shoe assembly") &&
  D.shop.primary_chain.steps[2].includes("21–29 ft-lbs"));
check("primary chain step 3: replace the chain if it cannot be adjusted",
  D.shop.primary_chain.steps[2].includes("Replace the primary chain"));
check("primary chain cover screws cite Figure 1-2 with both printed values, no guessed assignment",
  D.shop.primary_chain.steps[3].includes("Figure 1-2") &&
  D.shop.primary_chain.figure_note.includes("50–70 in-lbs") && D.shop.primary_chain.figure_note.includes("108–120 in-lbs") &&
  D.shop.primary_chain.figure_note.includes("Match each screw to its callout"));
check("primary chain interval is 500 miles then every 5000", D.shop.primary_chain.interval.includes("500 mile") && D.shop.primary_chain.interval.includes("5000 mile"));
check("primary chain ref cites FSM §1 pp. 1-38–1-39", D.shop.primary_chain.ref.includes("pp. 1-38–1-39"));
check("app.js primary chain card renders warning, spec, steps and figure note",
  appjs.includes("SH.primary_chain.warning") && appjs.includes("SH.primary_chain.spec") &&
  appjs.includes("SH.primary_chain.steps") && appjs.includes("SH.primary_chain.figure_note"));

/* storage / winterize: FSM §1 p. 1-8, both directions */
eq("storage put-away has 10 steps", D.shop.storage.put_away.length, 10);
eq("storage removal has 8 steps", D.shop.storage.removal.length, 8);
check("storage step 2 offers stabilizer + drained carb OR drained tank + rust preventative",
  D.shop.storage.put_away[1].includes("gasoline stabilizer") && D.shop.storage.put_away[1].includes("rust preventatives"));
check("storage step 3 is plugs out, oil squirts, crank 5-6 revolutions",
  D.shop.storage.put_away[2].includes("few squirts of engine oil") && D.shop.storage.put_away[2].includes("5–6 revolutions"));
check("storage step 4 plugs the oil-tank line to the 90-degree pump fitting",
  D.shop.storage.put_away[3].includes("90° fitting") && D.shop.storage.put_away[3].includes("check ball"));
check("storage step 8 is battery out, charge every other month below 60F, monthly above",
  D.shop.storage.put_away[7].includes("every other month") && D.shop.storage.put_away[7].includes("below 60°F") &&
  D.shop.storage.put_away[7].includes("once a month") && D.shop.storage.put_away[7].includes("above 60°F"));
check("storage step 10 is a breathing cover, never plastic",
  D.shop.storage.put_away[9].includes("breathe") && D.shop.storage.put_away[9].includes("Plastic"));
check("storage warns gasoline is flammable and the charger/battery explosion warnings are kept",
  D.shop.storage.warnings.some((w) => w.includes("Gasoline is flammable")) &&
  D.shop.storage.warnings.some((w) => w.includes("battery charger")) &&
  D.shop.storage.warnings.some((w) => w.includes("explosive hydrogen gas")));
check("storage removal starts with clutch-disengagement warning (gear, lever in, push back and forth)",
  D.shop.storage.removal_warning.includes("place the transmission in gear") && D.shop.storage.removal_warning.includes("push the vehicle back and forth"));
check("storage removal ends with the Owner's Manual pre-riding checklist",
  D.shop.storage.removal[7].includes("PRE-RIDING CHECKLIST"));
check("storage names the dealer/qualified-technician line from the manual",
  D.shop.storage.dealer_note.includes("qualified technician"));
check("storage ref cites FSM §1 p. 1-8", D.shop.storage.ref.includes("p. 1-8"));
check("app.js storage card renders both directions and the warnings",
  appjs.includes("SH.storage.put_away") && appjs.includes("SH.storage.removal") && appjs.includes("SH.storage.warnings"));

/* brake pad replacement: FSM §2 pp. 2-40–2-43 (front), 2-47–2-48 (rear) */
eq("brake pad front procedure has 9 steps", D.shop.brake_pads.front.steps.length, 9);
eq("brake pad rear procedure has 7 steps", D.shop.brake_pads.rear.steps.length, 7);
check("brake pad wear limit is 1/16 in (1.6 mm), replace the entire set (4)",
  D.shop.brake_pads.wear_limit.includes("1/16 in. (1.6 mm)") && D.shop.brake_pads.wear_limit.includes("entire set (4)"));
check("brake pads replaced in sets, front and rear, mismatched pads warned",
  D.shop.brake_pads.sets_rule.includes("replaced in sets at the same time") && D.shop.brake_pads.sets_rule.includes("Rear brake pads must also be replaced in sets"));
check("brake pad pump caution: pump pressure up BEFORE moving the motorcycle",
  D.shop.brake_pads.pump_caution.includes("BEFORE moving motorcycle") && D.shop.brake_pads.pump_caution.includes("push the pads against the brake disc"));
check("front pad step 3 is the 1/16 in inspection + alcohol cleaning, never gasoline",
  D.shop.brake_pads.front.steps[2].includes("1/16 in. (1.6 mm)") && D.shop.brake_pads.front.steps[2].includes("Do not use gasoline"));
check("front pad: insulator-backed pad on the spring clip, insulated back down; clip loop faces away from piston",
  D.shop.brake_pads.front.steps[3].includes("insulator backing") && D.shop.brake_pads.front.steps[3].includes("insulated back facing downward") &&
  D.shop.brake_pads.front.steps[4].includes("face away from the piston"));
check("front retainer screw 40-50 in-lbs, inner pad without insulator backing",
  D.shop.brake_pads.front.steps[5].includes("40-50 in-lbs") && D.shop.brake_pads.front.steps[5].includes("without insulator backing"));
check("front mount: MOLY 44 pin, 25-30 ft-lbs pin and upper bolt",
  D.shop.brake_pads.front.steps[6].includes("MOLY 44") && D.shop.brake_pads.front.steps[6].includes("25-30 ft-lbs"));
check("front banjo bolt 17-22 ft-lbs with new washers, bleeder 80-100 in-lbs",
  D.shop.brake_pads.front.steps[7].includes("17-22 ft-lbs") && D.shop.brake_pads.front.steps[7].includes("new banjo washers") &&
  D.shop.brake_pads.front.steps[7].includes("80-100 in-lbs"));
check("front reservoir fill is DOT 5 to 1/8 in below top, then bleed",
  D.shop.brake_pads.front.steps[8].includes("D.O.T. 5") && D.shop.brake_pads.front.steps[8].includes("1/8 in. (3.2 mm) below top") &&
  D.shop.brake_pads.front.steps[8].includes("Bleed the brake system"));
check("front piston note: pressed all the way in for new pads; bushings must be in the lugs",
  D.shop.brake_pads.front.piston_note.includes("pressed all the way into the bore") && D.shop.brake_pads.front.piston_note.includes("bushings are in the mounting lugs"));
check("rear pad step 1 removes the muffler and rocks the caliper to compress the pistons",
  D.shop.brake_pads.rear.steps[0].includes("Remove rear muffler") && D.shop.brake_pads.rear.steps[0].includes("rock caliper"));
check("rear pad step 3: seal and dust boot replaced if removed, never hone or bore",
  D.shop.brake_pads.rear.steps[2].includes("Always replace seal (5) and dust boot (7)") && D.shop.brake_pads.rear.steps[2].includes("Do not hone or bore cylinder"));
check("rear pad: shims on the bracket, pad off the shim drags and damages the bracket",
  D.shop.brake_pads.rear.steps[3].includes("tabs seated in mounting holes") && D.shop.brake_pads.rear.steps[3].includes("pad off the shim"));
check("rear pin bolts 15-20 ft-lbs, banjo 17-22 ft-lbs, bleed, muffler back on",
  D.shop.brake_pads.rear.steps[4].includes("15-20 ft-lbs") && D.shop.brake_pads.rear.steps[5].includes("17-22 ft-lbs") &&
  D.shop.brake_pads.rear.steps[5].includes("Bleed the rear brake system") && D.shop.brake_pads.rear.steps[5].includes("Install rear muffler"));
check("rear piston note: do not remove pistons without leakage or a bad piston; lever pumps piston to full travel",
  D.shop.brake_pads.rear.piston_note.includes("Do not remove the pistons") && D.shop.brake_pads.rear.piston_note.includes("pump the brake lever until piston reaches its full travel"));
check("burnish note prints BOTH manual distances — front 300 miles, rear 100 miles — as written, not reconciled",
  D.shop.brake_pads.burnish_note.includes("300 miles") && D.shop.brake_pads.burnish_note.includes("100 miles (160 km)") &&
  D.shop.brake_pads.burnish_note.includes("Both are printed here as written"));
check("brake pad ref cites FSM §2 pp. 2-40–2-43 and 2-47–2-48",
  D.shop.brake_pads.ref.includes("pp. 2-40–2-43") && D.shop.brake_pads.ref.includes("pp. 2-47–2-48"));
check("app.js brake pad card renders wear limit, sets rule, pump caution, both calipers and the burnish note",
  appjs.includes("SH.brake_pads.wear_limit") && appjs.includes("SH.brake_pads.sets_rule") &&
  appjs.includes("SH.brake_pads.pump_caution") && appjs.includes("SH.brake_pads.front.steps") &&
  appjs.includes("SH.brake_pads.rear.steps") && appjs.includes("SH.brake_pads.burnish_note"));

/* fork oil change: FSM §1 p. 1-42; fluid §1 p. 1-9; capacities §1 p. 1-36 */
eq("fork oil procedure has 6 steps", D.shop.fork_oil.steps.length, 6);
check("fork oil is HYDRAULIC FORK OIL TYPE \"E\", Part No. 99884-80",
  D.shop.fork_oil.fluid.includes("HYDRAULIC FORK OIL TYPE") && D.shop.fork_oil.fluid.includes("99884-80"));
check("fork oil interval is every 10,000 miles or prior to storage",
  D.shop.fork_oil.interval.includes("10,000 mile") && D.shop.fork_oil.interval.includes("prior to storage"));
eq("fork oil has 2 capacity rows", D.shop.fork_oil.capacities.length, 2);
eq("FXSTC wet capacity is 10.2 oz (302 ml)",
  D.shop.fork_oil.capacities.find((c) => c.models.startsWith("FXSTC")).wet, "10.2 oz (302 ml)");
eq("FLSTC/F wet capacity is 11.5 oz (340 ml)",
  D.shop.fork_oil.capacities.find((c) => c.models.startsWith("FLSTC")).wet, "11.5 oz (340 ml)");
check("fork oil step 1 supports the bike with the front end off the floor, forks fully extended",
  D.shop.fork_oil.steps[0].includes("front end is off the floor") && D.shop.fork_oil.steps[0].includes("fully extended"));
check("fork oil step 3 drains from the bottom and keeps the drain screw washer",
  D.shop.fork_oil.steps[2].includes("drain screws from the bottom") && D.shop.fork_oil.steps[2].includes("Don't lose the drain screw washer"));
check("fork oil step 6 tightens caps to 40-60 ft-lbs",
  D.shop.fork_oil.steps[5].includes("40-60 ft-lbs"));
check("fork oil capacities are WET only — no dry capacity is invented",
  D.shop.fork_oil.note.includes("WET") && D.shop.fork_oil.note.includes("No DRY") && D.shop.fork_oil.note.includes("none is given here") &&
  !JSON.stringify(D.shop.fork_oil.capacities).toLowerCase().includes("dry"));
check("fork oil note: Springers have no hydraulic fork oil change in this procedure",
  D.shop.fork_oil.note.includes("Springer") && D.shop.fork_oil.note.includes("except Springers"));
check("fork oil ref cites §1 p. 1-42, p. 1-9 and p. 1-36",
  D.shop.fork_oil.ref.includes("p. 1-42") && D.shop.fork_oil.ref.includes("p. 1-9") && D.shop.fork_oil.ref.includes("p. 1-36"));
check("app.js fork oil card renders interval, fluid, steps, capacities and note",
  appjs.includes("SH.fork_oil.interval") && appjs.includes("SH.fork_oil.fluid") && appjs.includes("SH.fork_oil.steps") &&
  appjs.includes("SH.fork_oil.capacities") && appjs.includes("SH.fork_oil.note"));

/* first 500-mile service: FSM §1 p. 1-1 + Scheduled Service Table pp. 1-34–1-37 */
eq("first 500 check list (p. 1-1) has 8 items", D.shop.first_500.check_at_first_500.length, 8);
eq("first 500 replace list has 4 items", D.shop.first_500.replace.length, 4);
eq("first 500 perform list has 3 items", D.shop.first_500.perform.length, 3);
eq("first 500 inspect list has 17 items", D.shop.first_500.inspect.length, 17);
eq("first 500 lubricate list has 1 item", D.shop.first_500.lubricate.length, 1);
eq("first 500 inspect+lubricate list has 1 item", D.shop.first_500.inspect_lubricate.length, 1);
eq("first 500 tighten list has 1 item", D.shop.first_500.tighten.length, 1);
eq("first 500 table column totals 27 items",
  D.shop.first_500.replace.length + D.shop.first_500.perform.length + D.shop.first_500.inspect.length +
  D.shop.first_500.lubricate.length + D.shop.first_500.inspect_lubricate.length + D.shop.first_500.tighten.length, 27);
check("first 500 replaces engine oil, oil filter, primary lube and transmission lube",
  ["Engine oil", "Engine oil filter", "Primary chaincase lubricant", "Transmission lubricant"].every((n) =>
    D.shop.first_500.replace.some((r) => r.startsWith(n))));
check("first 500 performs clutch adjustment, rocker bearing adjustment (Springers) and road test",
  D.shop.first_500.perform.includes("Clutch adjustment") &&
  D.shop.first_500.perform.some((p) => p.includes("Rocker bearing adjustment")) &&
  D.shop.first_500.perform.includes("Road test"));
check("first 500 inspects battery, primary chain, spokes, tires, fall-away, brake fluid, pads/discs, pedal height, belt, pivot bolts, shocks, air cleaner, fuel lines, enrichener, mounts, electrics, idle speed",
  ["Battery", "Primary chain", "Spoke tightness", "Tire condition and pressure", "Steering head bearing fall-away",
   "Brake fluid", "Brake pad linings and discs", "Rear brake pedal height", "Drive belt", "Rear fork pivot bolts",
   "Rear shock absorbers", "Air cleaner", "Fuel system lines and fittings", "Enrichener control", "Engine mounts",
   "Electrical components", "Engine idle speed"].every((n) => D.shop.first_500.inspect.some((i) => i.startsWith(n))));
check("first 500 lubricates Springer steering head bearings and inspect+lubricates throttle cables, tightens fasteners except head bolts",
  D.shop.first_500.lubricate[0].includes("Springer steering head bearings") &&
  D.shop.first_500.inspect_lubricate[0] === "Throttle cables" &&
  D.shop.first_500.tighten[0] === "Fasteners (except head bolts)");
check("first 500 names what is NOT in the 500-mile column — fork oil, wheel bearings, lifter screen, plugs, timing",
  D.shop.first_500.not_at_500.includes("front fork oil") && D.shop.first_500.not_at_500.includes("wheel bearings") &&
  D.shop.first_500.not_at_500.includes("spark plugs") && D.shop.first_500.not_at_500.includes("10,000 mi"));
check("first 500 dealer note: authorized dealer, warranty in force, emissions",
  D.shop.first_500.dealer_note.includes("authorized Harley-Davidson dealer") &&
  D.shop.first_500.dealer_note.includes("warranty in force") && D.shop.first_500.dealer_note.includes("emissions"));
check("first 500 deferral note says the FSM points at the Owner's Manual list, which IS the table — nothing invented",
  D.shop.first_500.deferral_note.includes("Owner's Manual") && D.shop.first_500.deferral_note.includes("IS the Scheduled Service Table") &&
  D.shop.first_500.deferral_note.includes("does not print a separate 500-mile checklist"));
check("first 500 p. 1-1 check list covers tires, belt, brakes/steering/throttle, fluid + pads, cables, fluid levels, spokes, lights",
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Tires for correct pressure")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Belt for proper tension")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Brakes, steering, and throttle")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Brake fluid level")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Cables for fraying")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Do not overfill oil tank")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Wheel spoke tightness")) &&
  D.shop.first_500.check_at_first_500.some((i) => i.includes("Headlight, taillight")));
check("first 500 ref cites §1 p. 1-1 and the table pp. 1-34–1-37",
  D.shop.first_500.ref.includes("p. 1-1") && D.shop.first_500.ref.includes("pp. 1-34–1-37"));
check("app.js first 500 card renders dealer note, deferral note, check list and all six groups",
  appjs.includes("SH.first_500.dealer_note") && appjs.includes("SH.first_500.deferral_note") &&
  appjs.includes("SH.first_500.check_at_first_500") && appjs.includes("SH.first_500.replace") &&
  appjs.includes("SH.first_500.perform") && appjs.includes("SH.first_500.inspect") &&
  appjs.includes("SH.first_500.lubricate") && appjs.includes("SH.first_500.inspect_lubricate") &&
  appjs.includes("SH.first_500.tighten"));

/* engine oil change: FSM §1 p. 1-38 */
eq("engine oil procedure has 8 steps", D.shop.engine_oil.steps.length, 8);
check("engine oil spec is 3 quarts (2.8 liters) in the tank",
  D.shop.engine_oil.spec.includes("three (3) quarts") && D.shop.engine_oil.spec.includes("2.8 liters"));
check("engine oil filter hand-tightens 1/2-3/4 turn after gasket contact",
  D.shop.engine_oil.steps[3].includes("1/2-3/4 turn") && D.shop.engine_oil.steps[3].includes("gasket contacts"));
check("engine oil level checked upright and level at operating temperature, never overfilled",
  D.shop.engine_oil.steps[7].includes("upright and level") && D.shop.engine_oil.steps[7].includes("Do not overfill tank") && D.shop.engine_oil.steps[7].includes("air space"));
eq("engine oil grade table has 4 rows", D.shop.engine_oil.oil_grades.length, 4);
check("engine oil grades are 10W40 below 40F, 20W50 above 40F, SAE 50 above 60F, SAE 60 above 80F, all HD 240",
  D.shop.engine_oil.oil_grades[0].viscosity === "SAE 10W40" && D.shop.engine_oil.oil_grades[0].lowest_ambient.includes("Below 40°F") &&
  D.shop.engine_oil.oil_grades[1].viscosity === "SAE 20W50" && D.shop.engine_oil.oil_grades[1].lowest_ambient.includes("Above 40°F") &&
  D.shop.engine_oil.oil_grades[2].viscosity === "SAE 50" && D.shop.engine_oil.oil_grades[2].lowest_ambient.includes("Above 60°F") &&
  D.shop.engine_oil.oil_grades[3].viscosity === "SAE 60" && D.shop.engine_oil.oil_grades[3].lowest_ambient.includes("Above 80°F") &&
  D.shop.engine_oil.oil_grades.every((g) => g.rating === "HD 240"));
check("engine oil interval is 500 miles then every 5000, plus annually / prior to storage",
  D.shop.engine_oil.interval.includes("500 mile") && D.shop.engine_oil.interval.includes("5000 mile") && D.shop.engine_oil.interval.includes("prior to storage or annually"));
check("engine oil ref cites FSM §1 p. 1-38", D.shop.engine_oil.ref.includes("p. 1-38"));
check("app.js engine oil card renders interval, spec, steps, grades and note",
  appjs.includes("SH.engine_oil.interval") && appjs.includes("SH.engine_oil.spec") && appjs.includes("SH.engine_oil.steps") &&
  appjs.includes("SH.engine_oil.oil_grades") && appjs.includes("SH.engine_oil.note"));

/* transmission oil change: FSM §1 p. 1-41 */
eq("transmission oil procedure has 4 steps", D.shop.transmission_oil.steps.length, 4);
check("transmission oil spec is 24 oz (709.8 ml), dipstick dipped not screwed",
  D.shop.transmission_oil.spec.includes("24 oz. (709.8 ml)") && D.shop.transmission_oil.spec.includes("dipped, not screwed"));
check("transmission drain plug projects 0.16-0.18 in, never over-tightened",
  D.shop.transmission_oil.steps[1].includes("0.16-0.18 in.") && D.shop.transmission_oil.steps[1].includes("Do not over-tighten"));
check("transmission filler plug is finger tight",
  D.shop.transmission_oil.steps[3].includes("finger tight"));
check("transmission part-number conflict is flagged, not silently resolved — 98853-96 wired, 99892-84 named",
  D.shop.transmission_oil.part_number_flag.includes("99892-84") && D.shop.transmission_oil.part_number_flag.includes("98853-96") &&
  D.shop.transmission_oil.part_number_flag.includes("three FSM locations against one"));
check("transmission oil interval is 500 miles then every 5000, plus annually / prior to storage",
  D.shop.transmission_oil.interval.includes("500 mile") && D.shop.transmission_oil.interval.includes("5000 mile") && D.shop.transmission_oil.interval.includes("prior to storage or annually"));
check("transmission oil ref cites FSM §1 p. 1-41", D.shop.transmission_oil.ref.includes("p. 1-41"));
check("app.js transmission oil card renders interval, spec, steps and the part-number flag",
  appjs.includes("SH.transmission_oil.interval") && appjs.includes("SH.transmission_oil.spec") &&
  appjs.includes("SH.transmission_oil.steps") && appjs.includes("SH.transmission_oil.part_number_flag"));

/* primary chaincase oil change: FSM §1 pp. 1-39–1-40 */
eq("primary oil procedure has 5 steps", D.shop.primary_oil.steps.length, 5);
check("primary oil is Primary Chaincase Lubricant 99887-84 (qt) / 99886-84 (gal)",
  D.shop.primary_oil.spec.includes("99887-84") && D.shop.primary_oil.spec.includes("99886-84"));
check("primary oil level is the bottom edge of the diaphragm spring — 1997 ~32 oz, 1998 ~26 oz",
  D.shop.primary_oil.spec.includes("bottom edge of the diaphragm spring") && D.shop.primary_oil.spec.includes("1997 Models: approximately 32 oz") &&
  D.shop.primary_oil.spec.includes("1998 Models: approximately 26 oz"));
check("primary oil caution is over-fill drags the clutch and hides neutral",
  D.shop.primary_oil.caution.includes("Do not over-fill") && D.shop.primary_oil.caution.includes("difficulty in finding neutral"));
check("primary oil note soaks new discs five minutes",
  D.shop.primary_oil.note.includes("minimum of five minutes"));
check("primary oil interval is 500 miles then every 5000, with NO annual/storage leg (the table row carries no *)",
  D.shop.primary_oil.interval.includes("500 mile") && D.shop.primary_oil.interval.includes("5000 mile") && !D.shop.primary_oil.interval.includes("prior to storage"));
check("primary oil ref cites FSM §1 pp. 1-39–1-40", D.shop.primary_oil.ref.includes("pp. 1-39–1-40"));
check("app.js primary oil card renders interval, spec, steps, caution and note",
  appjs.includes("SH.primary_oil.interval") && appjs.includes("SH.primary_oil.spec") && appjs.includes("SH.primary_oil.steps") &&
  appjs.includes("SH.primary_oil.caution") && appjs.includes("SH.primary_oil.note"));

/* brake fluid bleed & flush: FSM §2 p. 2-49; §1 p. 1-42 */
eq("brake fluid flush procedure has 4 steps", D.shop.brake_fluid_flush.steps.length, 4);
check("brake fluid is DOT 5 silicone ONLY, Part No. 99902-77 — never DOT 3 or 4",
  D.shop.brake_fluid_flush.spec.includes("D.O.T. 5 SILICONE") && D.shop.brake_fluid_flush.spec.includes("99902-77") &&
  D.shop.brake_fluid_flush.spec.includes("NEVER DOT 3 or DOT 4"));
check("brake fluid reservoir level is 1/8 in below the gasket surface",
  D.shop.brake_fluid_flush.spec.includes("1/8 in. (3.2 mm) below the gasket surface"));
check("brake fluid interval is inspect-only — the FSM prints NO replacement interval",
  D.shop.brake_fluid_flush.interval.includes("inspect the brake fluid level and condition") &&
  D.shop.brake_fluid_flush.interval.includes("NO scheduled brake-fluid replacement interval"));
check("brake bleed step 4: never reuse fluid, bleeder 80-100 in-lbs",
  D.shop.brake_fluid_flush.steps[3].includes("Do not reuse fluid") && D.shop.brake_fluid_flush.steps[3].includes("80-100 in-lbs"));
check("brake fluid warning: open a line and the system must be bled — spongy pedal, possible personal injury",
  D.shop.brake_fluid_flush.warning.includes("must be bled") && D.shop.brake_fluid_flush.warning.includes("spongy feel"));
check("brake fluid after-service test is slow speed on dry, clean pavement",
  D.shop.brake_fluid_flush.after_service.includes("dry, clean pavement") && D.shop.brake_fluid_flush.after_service.includes("slow speeds"));
check("brake fluid reservoir cover screws are 6-8 in-lbs",
  D.shop.brake_fluid_flush.reservoir.includes("6-8 in-lbs"));
check("brake fluid ref cites FSM §2 p. 2-49 and §1 p. 1-42",
  D.shop.brake_fluid_flush.ref.includes("p. 2-49") && D.shop.brake_fluid_flush.ref.includes("p. 1-42"));
check("app.js brake fluid card renders interval, spec, steps, warnings and reservoir",
  appjs.includes("SH.brake_fluid_flush.interval") && appjs.includes("SH.brake_fluid_flush.spec") &&
  appjs.includes("SH.brake_fluid_flush.steps") && appjs.includes("SH.brake_fluid_flush.warning") &&
  appjs.includes("SH.brake_fluid_flush.after_service") && appjs.includes("SH.brake_fluid_flush.reservoir"));

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

/* --- batch 2 (Nov 25, 2026): smoking tree + history + share + resume +
   wizard + safety block + Sportster numbers --- */
const smokeTree = D.trees.find((t) => t.id === "smoking-oil-consumption");
check("smoking tree present", !!smokeTree);
eq("smoking tree has 11 steps", smokeTree.steps.length, 11);
eq("smoking tree has 10 causes", smokeTree.causes.length, 10);
eq("smoking weights sum to 100", smokeTree.causes.reduce((n, c) => n + c.weight, 0), 100);
check("smoking causes all carry their source", smokeTree.causes.every((c) => !!c.source));
check("smoking over-rev cause is flagged NOT an FSM cause (Easyriders Vol. 3)",
  smokeTree.causes.some((c) => c.cause.includes("Over-rev damage") && c.source.includes("NOT an FSM cause") && c.source.includes("Easyriders Tech Tips Vol. 3")));
check("smoking white-steam cause cites Sportster p. 89 + trouble p. 58",
  smokeTree.causes.some((c) => c.cause.includes("White smoke") && c.source.includes("Sportster 86-03 p. 89") && c.source.includes("sportster-86-03-trouble p. 58")));
check("smoking rings cause carries NO part field (no piston-ring price verified)",
  smokeTree.causes.find((c) => c.cause.includes("piston rings")).part === undefined);
check("smoking step 1 is 'next' both ways — a blue-gray YES must never bump the white-steam cause",
  smokeTree.steps[0].yes === "next" && smokeTree.steps[0].no === "next");
check("smoking step 1 still cites FSM §3 p. 3-11 + Sportster p. 89",
  smokeTree.steps[0].cite.includes("§3 p. 3-11") && smokeTree.steps[0].cite.includes("sportster-86-03 p. 89"));
const smokeBase = {};
smokeTree.causes.forEach((c) => { smokeBase[c.cause] = c.weight; });
function smokeBump(key) { return S.applyAnswer(smokeBase, smokeTree.causes, key, true); }
check("smoking rings yes bumps only the rings cause by 15",
  smokeBump("rings")["Worn, broken, or stuck piston rings"] - 20 === 15 &&
  smokeTree.causes.filter((c) => !c.cause.includes("piston rings")).every((c) => smokeBump("rings")[c.cause] === c.weight));
check("smoking seals yes bumps only the guide-seals cause, NOT the over-rev cause",
  smokeBump("seals")["Valve guide seals damaged, or stem-to-guide clearance excessive"] - 10 === 15 &&
  smokeBump("seals")["Over-rev damage — valve collars smacked the seals after rev-limiter removal"] === 10);
check("smoking over-rev yes bumps only the over-rev cause by 15",
  smokeBump("over-rev")["Over-rev damage — valve collars smacked the seals after rev-limiter removal"] - 10 === 15 &&
  smokeTree.causes.filter((c) => !c.cause.includes("Over-rev")).every((c) => smokeBump("over-rev")[c.cause] === c.weight));
check("smoking rings-gasket yes bumps only the head-gasket cause by 15",
  smokeBump("rings-gasket")["Blown head gasket"] - 10 === 15 &&
  smokeTree.causes.filter((c) => !c.cause.includes("head gasket")).every((c) => smokeBump("rings-gasket")[c.cause] === c.weight));
check("smoking exhaust-valve / intake-valve yes bump only their own valve cause",
  smokeBump("exhaust-valve")["Leaking exhaust valve"] - 15 === 15 &&
  smokeBump("intake-valve")["Leaking intake valve"] - 15 === 15 &&
  smokeBump("exhaust-valve")["Leaking intake valve"] === 15);
check("smoking overfill / carryover yes bump only their own cause",
  smokeBump("overfill")["Oil overfill"] - 5 === 15 &&
  smokeBump("carryover")["Oil carryover, clogged oil return passages, or head casting porosity"] - 5 === 15);

/* --- round 3 (Nov 25, 2026): trouble-manual gap-fills ---
   Verified in sportster-86-03-trouble before wiring: seized-engine list
   (PDF p. 3, items 11-13), starter voltage drops <1V / <1V / <0.2V
   (PDF p. 7), vacuum-petcock bench test 25 in-Hg, flow on + reserve,
   stop on release, repeat 5x (PDF pp. 56-57), leakdown >12% rule
   (PDF pp. 58-59), float-bowl tap test (PDF p. 30).
   Rebalances (both trees stay at 100): no-start battery 25->20 funds
   the seized cause at 5 — battery stays second-highest behind ignition
   at 25, and 5 matches the other rare end-of-line causes (vacuum,
   stuck weights, screens). Smoking rings 25->20 funds the leakdown
   >12% cause at 5 — rings stays the top cause ahead of the two valve
   causes at 15, and the new factory verdict absorbs part of the
   top-end-fault space rings used to monopolize. The rich/flood tap
   test is a procedure tightening of the existing float cause — no new
   cause, no weight change. */
const nsTree3 = D.trees.find((t) => t.id === "no-start");
const nsBase3 = {};
nsTree3.causes.forEach((c) => { nsBase3[c.cause] = c.weight; });
check("round 3 no-start rebalance: battery 25->20, seized cause at 5, tree still 100",
  nsTree3.causes.find((c) => c.cause.includes("Battery discharged")).weight === 20 &&
  nsTree3.causes.find((c) => c.cause.includes("Seized engine")).weight === 5 &&
  nsTree3.causes.reduce((n, c) => n + c.weight, 0) === 100);
check("round 3 seized cause is critical, cites trouble p. 3 items 11-13",
  nsTree3.causes.some((c) => c.cause.includes("Seized engine") && c.urgency === "critical" &&
    c.source.includes("Sportster 1986-2003 Troubleshooting Manual") && c.source.includes("PDF p. 3") &&
    c.test.includes("seized piston") && c.test.includes("broken connecting rod")));
check("round 3 seized step is last and cites trouble p. 3",
  nsTree3.steps[nsTree3.steps.length - 1].yes === "seized" &&
  nsTree3.steps[nsTree3.steps.length - 1].cite.includes("PDF p. 3"));
check("round 3 seized yes bumps only the seized cause by 15",
  S.applyAnswer(nsBase3, nsTree3.causes, "seized", true)["Seized engine — piston, crankshaft bearings, or broken connecting rod"] - 5 === 15 &&
  nsTree3.causes.filter((c) => !c.cause.includes("Seized engine")).every((c) => S.applyAnswer(nsBase3, nsTree3.causes, "seized", true)[c.cause] === c.weight));
check("round 3 starter cause carries the <1V / <1V / <0.2V drops and the Clymer figure",
  nsTree3.causes.some((c) => c.cause.includes("Starter or cables") &&
    c.test.includes("under 1 V") && c.test.includes("under 0.2 V") && c.test.includes("Clymer p. 47") &&
    c.source.includes("PDF p. 7")));
check("round 3 vacuum cause is now the full bench test, 25 in-Hg, 5 repeats",
  nsTree3.causes.some((c) => c.cause.includes("Vacuum petcock") &&
    c.test.includes("25 in. (635 mm) Hg") && c.test.includes("repeat 5 times") &&
    c.test.includes("Never exceed the specified vacuum") &&
    c.source.includes("PDF pp. 56") && !c.source.includes("not yet added")));
check("round 3 smoking rebalance: rings 25->20, leakdown >12% cause at 5, tree still 100",
  smokeTree.causes.find((c) => c.cause.includes("piston rings")).weight === 20 &&
  smokeTree.causes.find((c) => c.cause.includes("Poor engine condition")).weight === 5 &&
  smokeTree.causes.reduce((n, c) => n + c.weight, 0) === 100);
check("round 3 leakdown >12% cause cites trouble pp. 58-59 and names the listen-for-the-leak sites",
  smokeTree.causes.some((c) => c.cause.includes("Poor engine condition") &&
    c.source.includes("PDF pp. 58") && c.test.includes("more than 12%") &&
    c.test.includes("exhaust = exhaust valve") && c.test.includes("timing inspection hole")));
check("round 3 leakdown step sits after the three localization steps and cites pp. 58-59",
  smokeTree.steps[8].yes === "poor-condition" && smokeTree.steps[8].cite.includes("PDF pp. 58"));
check("round 3 poor-condition yes bumps only the poor-condition cause by 15",
  smokeBump("poor-condition")["Poor engine condition — leakdown loss differs by more than 12% between cylinders"] - 5 === 15 &&
  smokeTree.causes.filter((c) => !c.cause.includes("Poor engine condition")).every((c) => smokeBump("poor-condition")[c.cause] === c.weight));
check("round 3 rich/flood float cause carries the tap test from trouble p. 30",
  richTree.causes.some((c) => c.cause.includes("Float level") &&
    c.test.includes("lightly tap the float bowl") && c.test.includes("overflow tube") &&
    c.source.includes("PDF p. 30")));
check("round 3 rich/flood step 1 note carries the tap test and cites trouble p. 30",
  richTree.steps[0].note.includes("tap test") && richTree.steps[0].cite.includes("PDF p. 30"));

/* --- round 3 (Nov 25, 2026): CV carb rebuild Shop card ---
   FSM #99482-98 §4 pp. 4-14–4-18, read from the FSM text (OCR clean;
   p. 4-15 is the exploded Figure 4-12, no text steps depend on it).
   Removal 7 steps, installation 8 steps, disassembly (vacuum piston 3,
   carb body 4, accel pump 1), cleaning (vacuum piston 5, carb body 10),
   float replacement, assembly (vacuum piston 6, carb body 6, accel pump 1).
   Assembly + cleaning are wired too, from the same pages — a rebuild card
   that only disassembles is a trap. Nothing left out: every step on
   pp. 4-14–4-18 is in the card. */
const carbRebuild = D.shop.carb_rebuild;
check("carb rebuild card exists", !!carbRebuild);
check("carb rebuild ref cites FSM §4 pp. 4-14–4-18",
  carbRebuild.ref.includes("§4") && carbRebuild.ref.includes("4-14") && carbRebuild.ref.includes("4-18"));
check("carb rebuild carries the gasoline warning",
  carbRebuild.warning.includes("extremely flammable"));
eq("carb rebuild removal has 7 steps", carbRebuild.removal.length, 7);
eq("carb rebuild installation has 8 steps", carbRebuild.installation.length, 8);
check("carb rebuild installation torques the manifold capscrews 15-17 ft-lbs",
  carbRebuild.installation.some((s) => s.includes("15-17 ft-lbs")));
check("carb rebuild installation warns against tightening before aligning",
  carbRebuild.installation_caution.includes("Do not tighten capscrews"));
check("carb rebuild disassembly covers vacuum piston, carb body, accel pump",
  carbRebuild.disassembly_vacuum_piston.length === 3 &&
  carbRebuild.disassembly_carb_body.length === 4 &&
  carbRebuild.disassembly_accel_pump.length === 1);
check("carb rebuild cleaning warns against acid-dipping the inlet valve",
  carbRebuild.cleaning_caution.includes("cold acid dip"));
check("carb rebuild float note names the ROUNDED interference-fit pedestal",
  carbRebuild.float_note.includes("ROUNDED pedestal") && carbRebuild.float_note.includes("INTERFERENCE SIDE"));
check("carb rebuild assembly warns fixed-venturi slow jets must not go in a CVH",
  carbRebuild.assembly_carb_body_caution.includes("must not be installed on CVH"));
check("carb rebuild assembly seats the diaphragm evenly and checks piston rise",
  carbRebuild.assembly_vacuum_piston.some((s) => s.includes("diaphragm is seated evenly")) &&
  carbRebuild.assembly_vacuum_piston.some((s) => s.includes("rise to top smoothly")));
check("app.js renders the carb rebuild card",
  appjs.includes("$(\"carb-rebuild\")") && appjs.includes("SH.carb_rebuild.removal") && appjs.includes("SH.carb_rebuild.assembly_carb_body"));
check("index.html has the carb rebuild card + Shop intro lists it",
  html.includes('id="carb-rebuild"') && html.includes("CV carburetor rebuild"));

/* --- round 3 (Nov 25, 2026): tree year-gating ---
   gating.js is pure: bikeYear parses the year out of the roster name,
   gateTreeText narrows the speedometer + turn-signal trees to the
   picked bike's year. A picked 1995 bike sees only the 1995-96 split;
   a picked 1990 (or 1947) bike — a year no split in either tree covers
   — sees everything, as today; no bike picked sees everything. Tree
   data wording is untouched — gating only hides segments at display
   time. The shared report and saved sessions keep the full text. */
const G = require("./gating.js");
const speedoTree3 = D.trees.find((t) => t.id === "speedometer-inoperative");
const signalsTree3 = D.trees.find((t) => t.id === "turn-signals");
check("gating: roster years parse — 1995, 1990, 1947",
  G.bikeYear(D.roster[0]) === 1995 && G.bikeYear(D.roster[1]) === 1990 && G.bikeYear(D.roster[2]) === 1947);
check("gating: a bike with no year in its name parses to null (show everything)",
  G.bikeYear({ name: "My Sportster" }) === null && G.bikeYear(null) === null);
check("gating: speedo tree covers 1995-2003, not 1990 or 1947",
  G.treeCoversYear(speedoTree3, 1995) && G.treeCoversYear(speedoTree3, 1999) &&
  !G.treeCoversYear(speedoTree3, 1990) && !G.treeCoversYear(speedoTree3, 1947));
check("gating: turn-signals tree covers 1991-2003, not 1990",
  G.treeCoversYear(signalsTree3, 1991) && G.treeCoversYear(signalsTree3, 1999) &&
  !G.treeCoversYear(signalsTree3, 1990));
check("gating: picked 1995 bike — speedo step 3 shows only the 1995-96 split",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1995).text.includes("8-12 V on 1995-96") &&
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1995).text.includes("1997-98"));
check("gating: picked 1997 bike — speedo step 3 shows only the 1997-98 split",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1997).text.includes("6-12 V on 1997-98") &&
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1997).text.includes("1995-96"));
check("gating: picked 1990 bike — speedo step 3 shows all splits (out of range)",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1990).text === speedoTree3.steps[2].q);
check("gating: no bike picked — speedo step 3 shows all splits",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, null).text === speedoTree3.steps[2].q);
check("gating: picked 1995 bike — turn-signal cancel cause shows only the 1991-96 + 1995-96 segments",
  G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1995).text.includes("1995-96 — voltmeter") &&
  !G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1995).text.includes("1997-98") &&
  !G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1995).text.includes("1999-2003"));
check("gating: picked 1997 bike — cancel cause shows only the 1997-98 segment",
  G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1997).text.includes("1997-98 (except late-98 883)") &&
  !G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1997).text.includes("1991-96"));
check("gating: picked 1999 bike — cancel cause shows only the 1999-2003 segment",
  G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1999).text.includes("1999-2003") &&
  !G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1999).text.includes("1991-96"));
check("gating: picked 1994 bike — cancel cause shows the 1994 ohmmeter check, not the 1995-96 voltmeter check",
  G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1994).text.includes("1994 models — ohmmeter") &&
  !G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1994).text.includes("1995-96"));
check("gating: picked 1990 bike — cancel cause shows all splits (out of range)",
  G.gateTreeText("turn-signals", signalsTree3, signalsTree3.causes[0].test, 1990).text === signalsTree3.causes[0].test);
check("gating: picked 1995 bike — odometer cause hides the 1997-98 and 1999-2003 jumper instructions",
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[1].test, 1995).text.includes("1997-98") &&
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[1].test, 1995).text.includes("1999-2003"));
check("gating: picked 1997 bike — odometer cause shows the 1997-98 jumper instruction, not 1999-2003",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[1].test, 1997).text.includes("1997-98: cut the leads") &&
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[1].test, 1997).text.includes("1999-2003"));
check("gating: picked 1995 bike — speed-sensor cause hides the 1999-only note; 1999 shows it",
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[4].test, 1995).text.includes("1999 models") &&
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[4].test, 1999).text.includes("1999 models"));
check("gating: picked 1995 bike — speedo-power cause shows only the 8-12 V (1995-96) feed",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[2].test, 1995).text.includes("8-12 V (1995-96)") &&
  !G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.causes[2].test, 1995).text.includes("6-12 V"));
check("gating: non-gated trees pass through untouched whatever the bike",
  G.gateTreeText("no-start", D.trees.find((t) => t.id === "no-start"), D.trees.find((t) => t.id === "no-start").steps[0].q, 1995).text ===
  D.trees.find((t) => t.id === "no-start").steps[0].q);
check("gating: tree data wording is untouched (gating hides at display time only)",
  speedoTree3.steps[2].q.includes("1995-96") && speedoTree3.steps[2].q.includes("1997-98") &&
  signalsTree3.causes[0].test.includes("1997-98") && signalsTree3.causes[0].test.includes("1999-2003"));
check("gating: hidden flag is true when a split is hidden, false when nothing is",
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1995).hidden === true &&
  G.gateTreeText("speedometer-inoperative", speedoTree3, speedoTree3.steps[2].q, 1990).hidden === false);
check("app.js wires gating into the step walk and the results",
  appjs.includes("ED_Gating") && appjs.includes("gateTreeText") && appjs.includes("currentBikeYear") &&
  appjs.includes("gateNoteHtml"));
check("index.html loads gating.js before app.js",
  html.indexOf('src="gating.js"') !== -1 && html.indexOf('src="gating.js"') < html.indexOf('src="app.js"'));

/* --- shareable report (ED_Report.build, pure) --- */
const R = require("./report.js");
const repRanked = [
  { cause: "Worn, broken, or stuck piston rings", score: 40, test: "Wet test — compression rises considerably with oil", fix: "Replace rings", source: "FSM #99482-98 §3 pp. 3-11–3-12 (diagnostic chart: Ring Trouble)", urgency: "high" },
  { cause: "Oil overfill", score: 5, test: "Oil level above the full mark", fix: "Drain oil to the correct level", source: "FSM #99482-98 §3 p. 3-12 (Diagnosing Smoking Engine inspect list: Overfill)", urgency: "low" }
];
const rep = R.build({ bike: "1990 Softail", date: "Nov 25, 2026", tree: smokeTree, ranked: repRanked, verdict: "Fix before a real ride — Worn, broken, or stuck piston rings. Do not ride until fixed — oil burning plus low compression." });
check("report names the bike and date", rep.includes("1990 Softail") && rep.includes("Nov 25, 2026"));
check("report names the symptom (tree title + system)", rep.includes("Smoking exhaust / high oil consumption") && rep.includes("Engine / oil"));
check("report carries the severity (top cause urgency)", rep.includes("Severity: high"));
check("report carries the safe-to-ride verdict", rep.includes("Safe to ride? Fix before a real ride"));
check("report ranks causes with percentages (40 of 45 = 89%)", rep.includes("1. Worn, broken, or stuck piston rings — 89%") && rep.includes("2. Oil overfill — 11%"));
check("report carries every cause source", rep.includes("FSM #99482-98 §3 pp. 3-11–3-12") && rep.includes("Diagnosing Smoking Engine inspect list: Overfill"));
check("report names the next step (top cause confirming test)", rep.includes("Next step: Wet test"));
check("report closes with the run-the-test warning", rep.includes("Diagnosis only — run the confirming test before buying parts."));
check("app.js shares via ED_Report + navigator.share with a clipboard fallback",
  appjs.includes("ED_Report.build") && appjs.includes("navigator.share") && appjs.includes("navigator.clipboard.writeText"));
check("app.js has both a Share and a Copy report button", appjs.includes("id='share-diag'") && appjs.includes("id='copy-diag'") && appjs.includes("Copy report"));

/* --- wizard front step (ED_Wizard.suggest, pure) --- */
const W = require("./wizard.js");
eq("wizard engine suggests 3 trees", W.suggest("engine", "routine", D.trees).length, 3);
check("wizard engine suggests the smoking tree", W.suggest("engine", "routine", D.trees).some((t) => t.id === "smoking-oil-consumption"));
eq("wizard electrical suggests 4 trees", W.suggest("electrical", "routine", D.trees).length, 4);
eq("wizard fuel suggests the two carb trees", W.suggest("fuel", "routine", D.trees).map((t) => t.id).join(","), "carb-lean-idle,carb-rich-flood");
eq("wizard brakes suggests 1 tree", W.suggest("brakes", "routine", D.trees).length, 1);
eq("wizard other suggests all 19 trees", W.suggest("other", "routine", D.trees).length, 19);
eq("wizard unknown area suggests all trees (never empty)", W.suggest("nonsense", "routine", D.trees).length, 19);
check("wizard roadside puts every critical-cause tree before every non-critical tree",
  (() => {
    const list = W.suggest("other", "roadside", D.trees);
    const rank = (t) => t.causes.some((c) => c.urgency === "critical") ? 0 : 1;
    return list.every((t, i) => i === 0 || rank(list[i - 1]) <= rank(t));
  })());
check("wizard roadside actually reorders (critical-cause trees move up; no-start now leads — the seized-engine cause is critical)",
  W.suggest("other", "roadside", D.trees)[0].id === "no-start" &&
  W.suggest("other", "roadside", D.trees).findIndex((t) => t.id === "brakes") <
  W.suggest("other", "routine", D.trees).findIndex((t) => t.id === "brakes"));
check("wizard routine order is the data order (no reorder)", W.suggest("other", "routine", D.trees)[0].id === D.trees[0].id);
eq("wizard describe reads back area/when/urgency", W.describe("engine", "idle", "roadside"), "Engine · at idle · Roadside — right now");
check("index.html has the wizard card (area/when/urgency + go + results)",
  ["wiz-area", "wiz-when", "wiz-urgency", "wiz-go", "wiz-results"].every((id) => html.includes('id="' + id + '"')));
check("wizard offers all seven areas", ["engine", "electrical", "chassis", "fuel", "transmission", "brakes", "other"].every((v) => html.includes('value="' + v + '"')));
check("wizard offers all five whens", ["idle", "speed", "cold", "hot", "always"].every((v) => html.includes('value="' + v + '"')));
check("wizard offers all three urgencies", ["routine", "soon", "roadside"].every((v) => html.includes('value="' + v + '"')));
check("app.js wires the wizard and starts the suggested tree with its context",
  appjs.includes("$(\"wiz-go\")") && appjs.includes("ED_Wizard.suggest") && appjs.includes("startTree(t, wizard)"));
check("app.js still builds the full tree list directly (wizard never hides a tree)",
  appjs.includes("D.trees.forEach((t) => {") && appjs.includes("startTree(t)"));

/* --- resumable trees --- */
check("index.html has the resume banner + abandon button",
  ["resume-banner", "resume-text", "resume-btn", "resume-discard", "abandon-tree"].every((id) => html.includes('id="' + id + '"')));
check("app.js saves progress on start and on every answer",
  appjs.includes("saveProgress();") && appjs.includes("current.step++;\n    saveProgress();"));
check("app.js clears saved progress when a tree finishes", appjs.includes("clearProgress(); // a finished tree"));
check("app.js offers Resume and Discard on the banner",
  appjs.includes("$(\"resume-btn\")") && appjs.includes("$(\"resume-discard\")"));
check("app.js abandon button clears progress and hides the session",
  appjs.includes("$(\"abandon-tree\")") && appjs.includes("current = null;\n    clearProgress();"));
check("import preserves in-progress state", appjs.includes("in_progress: j.in_progress || null"));

/* --- diagnosis history: verdict + delete + per-bike filter --- */
check("app.js saves the verdict, the top-cause result and the wizard context with the session",
  appjs.includes("verdict: verdict.text") && appjs.includes("result: top.cause") && appjs.includes("wizard: current.wizard || null"));
check("app.js deletes an individual history entry and re-renders",
  appjs.includes("id='hist-delete'") && appjs.includes("state.sessions.splice(viewedHist, 1)"));
check("app.js filters history by bike", appjs.includes("$(\"history-bike\")") && appjs.includes("r.s.bike === cur"));
check("index.html has the history bike filter", html.includes('id="history-bike"'));
check("history detail shows the saved verdict", appjs.includes("s.verdict ? \"<p><b>Safe to ride?</b> \""));

/* --- "Before you start" safety block --- */
eq("safety block has 5 items", D.safety_block.items.length, 5);
check("safety block says ignition off", D.safety_block.items.some((i) => i.includes("Ignition OFF")));
check("safety block says cool engine with the warm-engine exception named",
  D.safety_block.items.some((i) => i.includes("cool engine") && i.includes("warm")));
check("safety block says eye protection near the battery",
  D.safety_block.items.some((i) => i.includes("Eye protection") && i.includes("sulfuric acid")));
check("safety block says no sparks/flame near fuel or battery",
  D.safety_block.items.some((i) => i.includes("No sparks or open flame")));
check("safety block is labeled generic shop safety, not a manual procedure",
  D.safety_block.note.includes("Generic shop safety") && D.safety_block.note.includes("not a manual procedure"));
check("safety block names the FSM §8 battery warnings as its manual source",
  D.safety_block.note.includes("FSM #99482-98 §8"));
check("app.js renders the safety block into battery, compression and sag cards",
  (appjs.match(/safetyHtml\(\)/g) || []).length >= 4 && appjs.includes("safetyHtml() +\n    \"<p class='ed-note'>\" + D.charging_tests.intro") && appjs.includes("safetyHtml() +\n    \"<p class='ed-note'>\" + D.compression_tests.intro") && appjs.includes("safetyHtml() +\n    \"<h4>Preload adjustment"));
check("index.html styles the safety block", html.includes("ed-safety"));

/* --- Sportster numbers (Clymer, batch 2) --- */
check("every Sportster number source says Clymer",
  [D.sportster_cv_jetting.source, D.sportster_tire_pressures.source, D.sportster_fork_oil.source].every((s) => s.includes("Clymer")) &&
  D.torque.clymer.ref.includes("Clymer"));
eq("CV jetting covers all four markets", Object.keys(D.sportster_cv_jetting).filter((k) => ["usExceptCalifornia", "california", "hdi", "swiss"].includes(k)).length, 4);
eq("US 1988 main jets are 883: 170 / 1200: 200",
  D.sportster_cv_jetting.usExceptCalifornia.main[0].m883 + "/" + D.sportster_cv_jetting.usExceptCalifornia.main[0].m1200, "170/200");
eq("US 1998-2003 1200S main jet is 195", D.sportster_cv_jetting.usExceptCalifornia.main[5].m1200S, 195);
eq("California 1988 main jets are 883: 165 / 1200: 180",
  D.sportster_cv_jetting.california.main[0].m883 + "/" + D.sportster_cv_jetting.california.main[0].m1200, "165/180");
eq("HDI 1999-2003 main jets are 190 / 200",
  D.sportster_cv_jetting.hdi.main[3].m883 + "/" + D.sportster_cv_jetting.hdi.main[3].m1200, "190/200");
eq("US pilot jet 1996-2003 is 42", D.sportster_cv_jetting.usExceptCalifornia.pilot[3].m883, 42);
eq("float height 1988-1991 is 0.725-0.730 in", D.sportster_cv_jetting.floatHeight[0].value, "0.725–0.730 in (18.4–18.5 mm)");
eq("float height 1992-2003 is 0.413-0.453 in", D.sportster_cv_jetting.floatHeight[1].value, "0.413–0.453 in (10.5–11.5 mm)");
eq("Sportster 1200 tire pressure up to 300 lb is 30 front / 36 rear",
  D.sportster_tire_pressures.upTo300lb.front[0].psi + "/" + D.sportster_tire_pressures.upTo300lb.rear[0].psi, "30/36");
eq("Sportster 1200 rear at GVWR is 40 psi", D.sportster_tire_pressures.upToGVWR.rear[0].psi, 40);
eq("Sportster 883 1986-1990 front is 26 psi", D.sportster_tire_pressures.upTo300lb.front[1].psi, 26);
eq("Sportster fork oil has 5 year rows", D.sportster_fork_oil.rows.length, 5);
eq("1986-1987 fork oil is 5.4 wet / 6.4 dry oz",
  D.sportster_fork_oil.rows[0].wetOz + "/" + D.sportster_fork_oil.rows[0].dryOz, "5.4/6.4");
eq("1992-1998 883 Hugger fork oil is 10.7 wet / 12.1 dry oz",
  D.sportster_fork_oil.rows[2].wetOz + "/" + D.sportster_fork_oil.rows[2].dryOz, "10.7/12.1");
eq("1999-2003 fork oil is 9.0 wet / 10.2 dry oz",
  D.sportster_fork_oil.rows[4].wetOz + "/" + D.sportster_fork_oil.rows[4].dryOz, "9/10.2");
const clymerChapter = D.torque.clymer;
check("Clymer Sportster chapter present", !!clymerChapter);
eq("Clymer chapter has 29 rows (15 Table 7 + 7 Table 8 + 7 Table 9)", clymerChapter.rows.length, 29);
check("Clymer chapter ref says aftermarket, never factory",
  clymerChapter.ref.includes("AFTERMARKET") && clymerChapter.ref.includes("never factory"));
check("Table 9 spark plug row was NOT duplicated into the Clymer chapter (factory chapter already has it)",
  !clymerChapter.rows.some((r) => r.fastener === "Spark plug") &&
  clymerChapter.rows.filter((r) => r.fastener.startsWith("Spark plugs")).length === 1);
check("1986-1987 fast idle carries the print quirk verbatim with its flag",
  clymerChapter.rows.some((r) => r.fastener.includes("fast idle") && r.value.includes("1500–1500 rpm (as printed)") && r.value.includes("likely a misprint, unverified")));
check("Clymer chapter carries the Table 8 VOES timing rows",
  clymerChapter.rows.some((r) => r.fastener.includes("1986–1994, fast idle") && r.value.includes("40° BTDC")) &&
  clymerChapter.rows.some((r) => r.fastener.includes("2001–2003 1200S") && r.value.includes("15° BTDC")));
check("Clymer chapter carries the Table 9 rear axle nut + drain plug",
  clymerChapter.rows.some((r) => r.fastener.includes("Rear axle nut") && r.value.includes("60–65 ft-lbs")) &&
  clymerChapter.rows.some((r) => r.fastener.includes("drain plug") && r.value.includes("14–21 ft-lbs")));
check("factory Sportster chapter still has exactly its 2 rows",
  D.torque.chapters.find((c) => c.title === "Sportster (1986–2003)").slugs.length === 2);
check("index.html has the three Sportster cards",
  ["sportster-jetting", "sportster-tires", "sportster-fork-oil"].every((id) => html.includes('id="' + id + '"')));
check("app.js renders all three Sportster cards",
  ["sportster-jetting", "sportster-tires", "sportster-fork-oil"].every((id) => appjs.includes("$(\"" + id + "\")")));
check("app.js labels the Sportster cards Clymer, never a correction to Softail numbers",
  appjs.includes("never a correction to the Softail CV40 numbers") && appjs.includes("Clymer (aftermarket). Sportster only"));

/* --- Knucklehead engine (serial) decode, v17 — Knucklehead 1940-1947
     Service Manual p. 3, read visually Nov 25, 2026. Format: 2-digit
     year (40-47) + model code + serial. Evo year codes never apply. --- */
const kManual = V.decodeKnucklehead("46 EL 2222");
eq("manual example 46 EL 2222 decodes to 1946", kManual.year, 1946);
eq("manual example model is EL", kManual.modelCode, "EL");
eq("manual example serial is 2222", kManual.serialNumber, "2222");
eq("manual example EL is the 61 high-compression O.H.V.", kManual.model, "61 Cu. In. O.H.V. Twin — high compression, 7.0 to 1");
const kJosh = V.decodeKnucklehead("47FL6216");
eq("Joshua's bike 47FL6216 decodes to 1947", kJosh.year, 1947);
eq("47FL6216 model is FL", kJosh.modelCode, "FL");
eq("47FL6216 serial is 6216", kJosh.serialNumber, "6216");
eq("47FL6216 FL is the 74 high-compression O.H.V.", kJosh.model, "74 Cu. In. O.H.V. Twin — high compression, 7.0 to 1");
check("47FL6216 cites manual p. 3", kJosh.source.includes("p. 3"));
check("Knucklehead decode accepts spaces and lowercase", V.decodeKnucklehead("47 fl 6216").year === 1947 && V.decodeKnucklehead("47 fl 6216").modelCode === "FL");
eq("E is the 61 low-compression O.H.V.", V.decodeKnucklehead("40E1000").model, "61 Cu. In. O.H.V. Twin — low compression, 6.5 to 1");
eq("F is the 74 low-compression O.H.V.", V.decodeKnucklehead("41F1000").model, "74 Cu. In. O.H.V. Twin — low compression, 6.6 to 1");
eq("U is the 74 side valve", V.decodeKnucklehead("42U1000").model, "74 Cu. In. Side Valve Twin — low compression, 5.0 to 1");
eq("UL is the 74 side valve high compression", V.decodeKnucklehead("43UL1000").model, "74 Cu. In. Side Valve Twin — high compression, 5.5 to 1");
eq("UH is the 80 side valve", V.decodeKnucklehead("44UH1000").model, "80 Cu. In. Side Valve Twin — low compression, 5.2 to 1");
eq("ULH is the 80 side valve high compression", V.decodeKnucklehead("45ULH1000").model, "80 Cu. In. Side Valve Twin — high compression, 5.7 to 1");
check("all 8 p. 3 model codes decode", ["E", "EL", "F", "FL", "U", "UL", "UH", "ULH"].every((c) => V.KNUCKLEHEAD_MODELS[c]));
const kUnknown = V.decodeKnucklehead("47XX1234");
check("unknown model code XX is flagged unknown, never guessed", kUnknown.unknownModel === true && kUnknown.model === null);
eq("unknown model still parses the year", kUnknown.year, 1947);
eq("unknown model still parses the serial", kUnknown.serialNumber, "1234");
check("unknown model note says it is not guessed", kUnknown.note.includes("NOT in the manual's p. 3 table"));
check("malformed serial (no serial digits) errors", V.decodeKnucklehead("47FL").error.includes("year + model + serial"));
check("malformed serial (letters only) errors", V.decodeKnucklehead("FL").error.includes("year + model + serial"));
check("malformed serial (empty) errors", !!V.decodeKnucklehead("").error);
check("year outside 40-47 errors (1939)", V.decodeKnucklehead("39FL1234").error.includes("1940–1947 only"));
check("year outside 40-47 errors (1948)", V.decodeKnucklehead("48FL1234").error.includes("1940–1947 only"));
check("a 17-digit VIN passed to the Knucklehead decoder is refused, not misread", V.decodeKnucklehead("1HD1BJL41VY010000").error.includes("17-digit VIN"));
check("Evo year codes are NOT applied: 47FL6216 year comes from the leading digits, not a position-10 letter",
  kJosh.year === 1947 && !("yearCode" in kJosh));
check("Knucklehead data block cites manual p. 3", D.vin.knucklehead.source.includes("p. 3"));
eq("Knucklehead data block worked example is Joshua's bike", D.vin.knucklehead.worked_example.serial, "47FL6216");
eq("Knucklehead data block worked example year", D.vin.knucklehead.worked_example.year, 1947);
check("vin.js and data.js agree on all 8 Knucklehead model codes",
  Object.keys(V.KNUCKLEHEAD_MODELS).sort().join(",") === Object.keys(D.vin.knucklehead.model_codes).sort().join(",") &&
  Object.keys(V.KNUCKLEHEAD_MODELS).every((c) => V.KNUCKLEHEAD_MODELS[c] === D.vin.knucklehead.model_codes[c]));

/* --- Knucklehead tire pressures, v17 — manual p. 3 table, read visually.
     NOTE: the second size is 5.00" x 16", NOT 5.00 x 18. --- */
const kt = D.knucklehead_tire_pressures.rows;
eq("Knucklehead tire table has 8 rows (4 loads x 2 sizes)", kt.length, 8);
check("Knucklehead tire table cites manual p. 3", D.knucklehead_tire_pressures.source.includes("p. 3"));
const ktSolo400 = kt.find((r) => r.load === "Solo — Rider Only" && r.tire === "4.00\" x 18\" Tire");
eq("solo 4.00x18 front/rear", ktSolo400.front + "/" + ktSolo400.rear, "14/16");
const ktSolo500 = kt.find((r) => r.load === "Solo — Rider Only" && r.tire === "5.00\" x 16\" Tire");
eq("solo 5.00x16 front/rear", ktSolo500.front + "/" + ktSolo500.rear, "12/14");
check("no 5.00x18 row exists in the Knucklehead table — the page prints 5.00x16",
  !kt.some((r) => r.tire.includes("5.00") && r.tire.includes("18")));
const ktTwoUp400 = kt.find((r) => r.load === "Solo — Rider and One Passenger" && r.tire === "4.00\" x 18\" Tire");
eq("two-up 4.00x18 front/rear", ktTwoUp400.front + "/" + ktTwoUp400.rear, "18/26");
const ktTwoUp500 = kt.find((r) => r.load === "Solo — Rider and One Passenger" && r.tire === "5.00\" x 16\" Tire");
eq("two-up 5.00x16 front/rear", ktTwoUp500.front + "/" + ktTwoUp500.rear, "12/16");
const ktSide400 = kt.find((r) => r.load.startsWith("Sidecar") && r.tire === "4.00\" x 18\" Tire");
eq("sidecar 4.00x18 front/rear/sidecar", ktSide400.front + "/" + ktSide400.rear + "/" + ktSide400.sidecar, "20/24/14");
const ktSide500 = kt.find((r) => r.load.startsWith("Sidecar") && r.tire === "5.00\" x 16\" Tire");
eq("sidecar 5.00x16 front/rear/sidecar", ktSide500.front + "/" + ktSide500.rear + "/" + ktSide500.sidecar, "14/16/14");
const ktTruck400 = kt.find((r) => r.load.startsWith("Package Truck") && r.tire === "4.00\" x 18\" Tire");
eq("package truck 4.00x18 front/rear/truck", ktTruck400.front + "/" + ktTruck400.rear + "/" + ktTruck400.packageTruck, "22/30/16");
const ktTruck500 = kt.find((r) => r.load.startsWith("Package Truck") && r.tire === "5.00\" x 16\" Tire");
eq("package truck 5.00x16 front/rear/truck", ktTruck500.front + "/" + ktTruck500.rear + "/" + ktTruck500.packageTruck, "14/20/14");
check("Knucklehead tire note carries the overload rule from the page",
  D.knucklehead_tire_pressures.note.includes("rear tire 2 lbs") && D.knucklehead_tire_pressures.note.includes("front tire 1 lb"));
check("index.html has the Knucklehead serial card + tire card",
  html.includes('id="knuck-input"') && html.includes('id="knuck-decode"') && html.includes('id="knuck-result"') && html.includes('id="knucklehead-tires"'));
check("index.html cites the Knucklehead manual p. 3 on the serial card",
  html.includes("Knucklehead 1940"));
check("app.js wires the Knucklehead decode button and renders the tire card",
  appjs.includes("decodeKnucklehead") && appjs.includes("$(\"knucklehead-tires\")"));
check("no Knucklehead torque value anywhere — the manual has none",
  !JSON.stringify(D.knucklehead_tire_pressures).toLowerCase().includes("ft-lb") &&
  !fs.readFileSync(path.join(__dirname, "vin.js"), "utf8").toLowerCase().includes("ft-lb"));

console.log(pass + "/" + (pass + fail) + " tests passed");
if (fail) process.exit(1);
