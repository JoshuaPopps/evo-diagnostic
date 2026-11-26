/* The Evo Diagnostic — VIN decode (pure functions, testable in Node).
   FSM #99482-98 p. 2-3 layout (1-indexed positions):
   1-3: 1HD (WMI) | 4: 1 | 5-6: model designation | 7: engine type |
   8: varies (1-8) | 9: check digit | 10: year code | 11: plant |
   12-17: sequential number.
   Model codes are FSM-verified for 1997-98 Softails. Year codes V/W are
   FSM-verified; later codes follow the standard 30-year cycle.
   A Harley VIN does NOT encode color or options. */
const ED_VIN = (() => {
  const VALUES = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const MODEL_CODES = {
    BJ: "FLSTC Heritage Softail Classic", BM: "FLSTF Fat Boy", BR: "FLSTS Heritage Springer", BK: "FXSTC Softail Custom", BL: "FXSTS Springer Softail", BP: "FXSTSB Bad Boy (1997 only)",
    CA: "XLH883 / XLH1200 Sportster", CE: "XLH883 Hugger", CF: "XLH883 Deluxe", CG: "XL1200C Custom", CH: "XL1200S Sport", CJ: "XLH883 Custom", CK: "XLH883 Custom"
  };
  const ENGINE_CODES = { L: "1340cc Evolution V-twin (Big Twin)", M: "883cc (Sportster)", N: "1100cc (Sportster)", P: "1200cc (Sportster)" };
  const PLANT_CODES = { Y: "York, PA", K: "Kansas City, MO" };
  /* Year codes repeat every 30 years (M = 1991 or 2021). This app reads the
     Evo-era value; the decode result flags the ambiguity. */
  const YEAR_CODES = { M: 1991, N: 1992, P: 1993, R: 1994, S: 1995, T: 1996, V: 1997, W: 1998, X: 1999, Y: 2000, "1": 2001, "2": 2002, "3": 2003, "4": 2004, "5": 2005, "6": 2006, "7": 2007, "8": 2008, "9": 2009, A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019, L: 2020 };
  const YEAR_CYCLE_AMBIGUOUS = { M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026 };
  /* Knucklehead 1940-47 engine (serial) number — a DIFFERENT system from
     the 17-digit VIN above. Knucklehead 1940-1947 Service Manual p. 3:
     "Always identify by Engine (Serial) Number. Example: 46 EL 2222 /
     Year Model Serial Number." Model codes and engine descriptions are
     from the General Specifications table on the same page (read visually
     Nov 25, 2026). Evo-era year codes (position-10 letters) NEVER apply
     here — the year is the leading two digits, 40-47. Unknown model
     codes are flagged unknown, never guessed. No Knucklehead torque
     values exist in this manual ("foot pounds" returns nothing; the
     manual's language is "tighten securely") — none are wired anywhere. */
  const KNUCKLEHEAD_SOURCE = "Knucklehead 1940–1947 Service Manual, p. 3";
  const KNUCKLEHEAD_MODELS = {
    E: "61 Cu. In. O.H.V. Twin — low compression, 6.5 to 1",
    EL: "61 Cu. In. O.H.V. Twin — high compression, 7.0 to 1",
    F: "74 Cu. In. O.H.V. Twin — low compression, 6.6 to 1",
    FL: "74 Cu. In. O.H.V. Twin — high compression, 7.0 to 1",
    U: "74 Cu. In. Side Valve Twin — low compression, 5.0 to 1",
    UL: "74 Cu. In. Side Valve Twin — high compression, 5.5 to 1",
    UH: "80 Cu. In. Side Valve Twin — low compression, 5.2 to 1",
    ULH: "80 Cu. In. Side Valve Twin — high compression, 5.7 to 1"
  };
  function decodeKnucklehead(raw) {
    const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.length === 17) return { error: "That is 17 characters — a 17-digit VIN, not a Knucklehead engine serial. Use the VIN decoder above; Evo-era year codes do not apply to a Knucklehead serial." };
    const m = s.match(/^(\d{2})([A-Z]+)(\d+)$/);
    if (!m) return { error: "A Knucklehead engine (serial) number is year + model + serial — e.g. 47FL6216 (1947, FL, serial 6216). The manual's example is 46 EL 2222." };
    const year = 1900 + parseInt(m[1], 10);
    if (year < 1940 || year > 1947) return { error: "Year " + m[1] + " reads as " + year + " — the Knucklehead serial system on manual p. 3 covers 1940–1947 only." };
    const modelCode = m[2];
    const model = KNUCKLEHEAD_MODELS[modelCode] || null;
    return {
      serial: s,
      year,
      yearDigits: m[1],
      modelCode,
      model,
      unknownModel: model === null,
      serialNumber: m[3],
      source: KNUCKLEHEAD_SOURCE,
      note: "Knucklehead 1940–1947 Service Manual, p. 3: \"Always identify by Engine (Serial) Number.\" The year is the leading two digits — Evo-era year codes (position-10 letters) do not apply to this system." +
        (model === null ? " Model code " + modelCode + " is NOT in the manual's p. 3 table — unknown, never guessed." : "")
    };
  }
  function checkDigit(vin) {
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const ch = vin[i];
      const val = /[0-9]/.test(ch) ? parseInt(ch, 10) : VALUES[ch];
      if (val === undefined) return null;
      sum += val * WEIGHTS[i];
    }
    const r = sum % 11;
    return r === 10 ? "X" : String(r);
  }
  function decode(raw) {
    const vin = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (vin.length !== 17) return { error: "A VIN is 17 characters — this one is " + vin.length + "." };
    if (/[IOQ]/.test(vin)) return { error: "A real VIN never contains I, O, or Q." };
    const cd = checkDigit(vin);
    const modelCode = vin.substring(4, 6);
    const yearCode = vin[9];
    return {
      vin,
      checkDigit: cd,
      checkDigitOk: cd !== null && cd === vin[8],
      year: YEAR_CODES[yearCode] || null,
      yearCode,
      yearAmbiguous: YEAR_CYCLE_AMBIGUOUS[yearCode] || null,
      model: MODEL_CODES[modelCode] || null,
      modelCode,
      engineType: vin[6],
      engineName: ENGINE_CODES[vin[6]] || null,
      plant: vin[10],
      plantName: PLANT_CODES[vin[10]] || null,
      serial: vin.substring(11),
      note: "Model codes are FSM-verified for 1997-98 Softails and 1986-2003 Sportsters; other years/models decode by structure. Year codes repeat every 30 years (M = 1991 or 2021). A Harley VIN does not encode color or options. Pre-1981 bikes have short serials, not 17-digit VINs."
    };
  }
  const api = { checkDigit, decode, decodeKnucklehead, MODEL_CODES, YEAR_CODES, KNUCKLEHEAD_MODELS, KNUCKLEHEAD_SOURCE };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_VIN = ED_VIN;
