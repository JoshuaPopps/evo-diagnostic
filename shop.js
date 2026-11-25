/* The Evo Diagnostic — shop calculators and lookups (pure functions,
   testable in Node). Every reference number comes from ED_DATA.shop;
   the functions below take the tables as arguments and do only math
   or lookup. No spec is invented here — a value the library does not
   publish is never produced by these functions. */
const ED_Shop = (() => {
  /* --- gear ratio: teeth in, ratios out --- */
  function primaryRatio(compTeeth, clutchTeeth) {
    if (!compTeeth || !clutchTeeth || compTeeth <= 0 || clutchTeeth <= 0) return null;
    return clutchTeeth / compTeeth;
  }
  function finalRatio(transTeeth, rearTeeth) {
    if (!transTeeth || !rearTeeth || transTeeth <= 0 || rearTeeth <= 0) return null;
    return rearTeeth / transTeeth;
  }
  function overallRatio(primary, gearRatio, final) {
    if (!primary || !gearRatio || !final) return null;
    return primary * gearRatio * final;
  }
  /* rpm = mph x 336 x overall / tire diameter (in). 336 is the constant
     for mph/inches (63360 in per mile / 60 min / pi, rounded). */
  function rpmAtSpeed(mph, overall, tireDiaIn) {
    if (!mph || !overall || !tireDiaIn || tireDiaIn <= 0) return null;
    return Math.round((mph * 336 * overall) / tireDiaIn);
  }
  function speedAtRpm(rpm, overall, tireDiaIn) {
    if (!rpm || !overall || !tireDiaIn || tireDiaIn <= 0) return null;
    return Math.round(((rpm * tireDiaIn) / (336 * overall)) * 10) / 10;
  }
  /* Tire overall diameter from a metric size: rim + 2 x section x aspect.
     Section in mm, aspect in percent, rim in inches. Returns inches. */
  function tireDiameterIn(sectionMm, aspectPct, rimIn) {
    if (!sectionMm || !aspectPct || !rimIn || sectionMm <= 0 || aspectPct <= 0 || rimIn <= 0) return null;
    return Math.round((((rimIn * 25.4) + 2 * sectionMm * (aspectPct / 100)) / 25.4) * 100) / 100;
  }

  /* --- compression ratio: bore/stroke/chamber in, ratio out ---
     Swept volume is per cylinder. Chamber volume is measured (burette),
     never assumed by these functions. */
  function sweptCcPerCyl(boreIn, strokeIn) {
    if (!boreIn || !strokeIn || boreIn <= 0 || strokeIn <= 0) return null;
    return (Math.PI / 4) * boreIn * boreIn * strokeIn * 16.387064;
  }
  function compressionRatio(boreIn, strokeIn, chamberCc) {
    const swept = sweptCcPerCyl(boreIn, strokeIn);
    if (swept === null || !chamberCc || chamberCc <= 0) return null;
    return Math.round(((swept + chamberCc) / chamberCc) * 100) / 100;
  }
  /* Chamber volume implied by a published ratio — derived arithmetic on
     published figures, labeled as derived wherever it is shown. */
  function chamberCcFromRatio(boreIn, strokeIn, ratio) {
    const swept = sweptCcPerCyl(boreIn, strokeIn);
    if (swept === null || !ratio || ratio <= 1) return null;
    return Math.round((swept / (ratio - 1)) * 10) / 10;
  }

  /* --- carb CFM requirement: CID x rpm x VE / 3456 ---
     VE is a user-entered assumption (percent), never a published fact. */
  function carbCfm(cid, rpm, vePct) {
    if (!cid || !rpm || vePct === undefined || vePct === null || cid <= 0 || rpm <= 0 || vePct <= 0 || vePct > 100) return null;
    return Math.round(((cid * rpm * (vePct / 100)) / 3456) * 10) / 10;
  }

  /* --- tap drill lookups (tables live in ED_DATA.shop.tap_drill) --- */
  function tapDrillInch(thread, table) {
    const row = (table || []).find((r) => r.thread === thread);
    return row ? row.drill : null;
  }
  function tapDrillMetric(thread, table) {
    const row = (table || []).find((r) => r.thread === thread);
    return row ? row.drill : null;
  }

  /* --- bolt ID: measured diameter + pitch/TPI in, thread callout out ---
     SAE diameters are the standard screw-gauge definition
     (dia = 0.060 + 0.013 x gauge number). The series themselves come
     from the tap-drill tables in ED_DATA.shop.bolt_id. */
  function boltIdSae(diaIn, tpi, series) {
    if (!diaIn || !tpi || diaIn <= 0 || tpi <= 0) return null;
    const hit = (series || []).find((s) => Math.abs(s.dia_in - diaIn) <= 0.005 && s.tpi === tpi);
    return hit ? hit.thread : null;
  }
  function boltIdMetric(diaMm, pitch, series) {
    if (!diaMm || !pitch || diaMm <= 0 || pitch <= 0) return null;
    const hit = (series || []).find((s) => Math.abs(s.dia_mm - diaMm) <= 0.05 && Math.abs(s.pitch - pitch) <= 0.01);
    return hit ? hit.thread : null;
  }

  /* --- sag: drop = unloaded height minus loaded height. No target is
     published anywhere in the library, so no target is produced here. --- */
  function sagDrop(unloadedIn, loadedIn) {
    if (unloadedIn === undefined || unloadedIn === null || loadedIn === undefined || loadedIn === null) return null;
    return Math.round((unloadedIn - loadedIn) * 100) / 100;
  }

  const api = {
    primaryRatio, finalRatio, overallRatio, rpmAtSpeed, speedAtRpm,
    tireDiameterIn, sweptCcPerCyl, compressionRatio, chamberCcFromRatio,
    carbCfm, tapDrillInch, tapDrillMetric, boltIdSae, boltIdMetric, sagDrop
  };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Shop = ED_Shop;
