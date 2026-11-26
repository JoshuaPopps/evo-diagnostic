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

  /* --- unit converter: standard unit definitions, not manual specs.
     Each category table maps unit codes to their factor in the base
     unit (mm, N·m, kPa, mL). convert() is pure factor arithmetic. --- */
  function unitConvert(value, fromCode, toCode, units) {
    if (value === undefined || value === null || isNaN(value)) return null;
    const from = (units || []).find((u) => u.code === fromCode);
    const to = (units || []).find((u) => u.code === toCode);
    if (!from || !to) return null;
    return value * from.to_base / to.to_base;
  }

  /* --- tire sidewall decode: metric (130/90-16), alpha (MT90-16) and
     inch (5.00-16) systems, plus load index and speed rating from the
     service description (67H). Tables live in ED_DATA.shop.tire_reader;
     DOT date decode stays in ED_Tire (tire.js). --- */
  function tireSizeDecode(input, alphaTable) {
    const s = String(input || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!s) return { error: "Type in the size off the sidewall — e.g. 130/90-16, MT90-16 or 5.00-16." };
    /* Metric: 130/90-16, 130/90B16, 130/90R16, 180/55ZR17. */
    let m = s.match(/^(\d{2,3})\/(\d{2})(Z?)([BR-])(\d{2})/);
    if (m) {
      const construction = m[4] === "R" ? "radial" : m[4] === "B" ? "bias-belted" : "bias";
      return {
        system: "metric", width_mm: parseInt(m[1], 10), aspect: parseInt(m[2], 10),
        construction, rim_in: parseInt(m[5], 10), size_text: m[1] + "/" + m[2] + m[4] + m[5],
        speed_prefix: m[3] === "Z" ? "Z" : null
      };
    }
    /* Alpha: MT90-16, MT90B16, MT90R16. */
    m = s.match(/^M([A-Z])(\d{2})([BR-])(\d{2})/);
    if (m) {
      const row = (alphaTable || []).find((r) => r.alpha === "M" + m[1] + m[2]);
      const construction = m[3] === "R" ? "radial" : m[3] === "B" ? "bias-belted" : "bias";
      return {
        system: "alpha", alpha: "M" + m[1] + m[2], aspect: parseInt(m[2], 10),
        construction, rim_in: parseInt(m[4], 10),
        size_text: "M" + m[1] + m[2] + m[3] + m[4],
        metric_equiv: row ? row.metric : null, metric_note: row ? row.note : null
      };
    }
    /* Inch: 5.00-16, 4.00-19. */
    m = s.match(/^(\d\.\d{2})-(\d{2})/);
    if (m) {
      return {
        system: "inch", width_in: parseFloat(m[1]), width_mm: Math.round(parseFloat(m[1]) * 25.4),
        aspect: null, construction: "bias", rim_in: parseInt(m[2], 10), size_text: m[1] + "-" + m[2]
      };
    }
    return { error: "Could not read '" + input + "' as a tire size. Metric (130/90-16), alpha (MT90-16) or inch (5.00-16)." };
  }
  /* Service description after the size: two digits load index + one
     letter speed rating, e.g. 67H. M/C (motorcycle) is skipped. */
  function tireServiceDecode(input, loadTable, speedTable) {
    const s = String(input || "").trim().toUpperCase().replace(/\s+/g, "");
    const m = s.match(/M\/C?(\d{2})([A-Z])|(\d{2})([A-Z])\s*$/);
    if (!m) return { load_index: null, speed: null };
    const li = parseInt(m[1] || m[3], 10);
    const sym = m[2] || m[4];
    const loadRow = (loadTable || []).find((r) => r.li === li);
    const speedRow = (speedTable || []).find((r) => r.symbol === sym);
    return {
      load_index: li,
      load: loadRow ? { kg: loadRow.kg, lb: Math.round(loadRow.kg * 2.2046) } : null,
      speed: speedRow ? { symbol: sym, kmh: speedRow.kmh, mph: speedRow.mph } : null
    };
  }
  function loadIndexKg(li, loadTable) {
    const row = (loadTable || []).find((r) => r.li === li);
    return row ? { kg: row.kg, lb: Math.round(row.kg * 2.2046) } : null;
  }
  function speedRating(sym, speedTable) {
    const row = (speedTable || []).find((r) => r.symbol === sym);
    return row ? { symbol: row.symbol, kmh: row.kmh, mph: row.mph } : null;
  }

  const api = {
    primaryRatio, finalRatio, overallRatio, rpmAtSpeed, speedAtRpm,
    tireDiameterIn, sweptCcPerCyl, compressionRatio, chamberCcFromRatio,
    carbCfm, tapDrillInch, tapDrillMetric, boltIdSae, boltIdMetric, sagDrop,
    unitConvert, tireSizeDecode, tireServiceDecode, loadIndexKg, speedRating
  };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Shop = ED_Shop;
