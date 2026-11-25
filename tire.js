/* The Evo Diagnostic — DOT tire date decode (pure functions, testable in Node).
   The date code is the LAST FOUR digits of the Tire Identification Number
   (TIN): WWYY = week + year of manufacture. Full TIN is only required on
   one sidewall — check the inboard side if it is not outside.
   Pre-2000 tires use THREE digits (WWY) with a small triangle after the
   code meaning the 1990s. Verdict bands from Michelin + Dunlop (Harley-Davidson's
   OE suppliers): professional inspection after 5 years of use, replace at
   10 years from manufacture. */
const ED_Tire = (() => {
  function decode(code, now) {
    const ref = now instanceof Date ? now : new Date(now || Date.now());
    const c = String(code || "").replace(/[^0-9]/g, "");
    if (c.length !== 4 && c.length !== 3) {
      return { error: "A tire date code is 3 or 4 digits — the last digits of the DOT code on the sidewall." };
    }
    let week, year;
    if (c.length === 4) {
      week = parseInt(c.slice(0, 2), 10);
      year = 2000 + parseInt(c.slice(2), 10);
    } else {
      week = parseInt(c.slice(0, 2), 10);
      year = 1990 + parseInt(c.slice(2), 10);
    }
    if (week < 1 || week > 53) return { error: "Week " + week + " is not a real week — re-read the code (first two digits are the week)." };
    if (year > ref.getFullYear()) return { error: "That code reads as " + year + ", which is in the future — re-read the code." };
    const made = new Date(year, 0, 1 + (week - 1) * 7);
    const ageYears = (ref - made) / (365.25 * 24 * 60 * 60 * 1000);
    const age = Math.floor(ageYears * 10) / 10;
    const verdict = age < 5 ? "green" : age < 10 ? "amber" : "red";
    const text = verdict === "green"
      ? "Green — under 5 years. Good. Have it inspected by a pro once it passes 5 years of use."
      : verdict === "amber"
        ? "Amber — 5 to 10 years. Get a professional inspection every year; plan the replacement."
        : "Red — 10+ years from manufacture. Replace the tire, even if the tread looks fine.";
    return { week, year, age, verdict, text, note: "Date code " + c + " = week " + week + " of " + year + ". Full TIN is only on one sidewall — check the inboard side if it is not outside." };
  }
  const api = { decode };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Tire = ED_Tire;
