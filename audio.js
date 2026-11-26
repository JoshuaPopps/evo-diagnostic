/* The Evo Diagnostic — audio layer.
   Idle RPM from exhaust pulse frequency. Deterministic signal processing,
   no AI. A 4-stroke V-twin fires one power pulse per revolution across its
   two cylinders, so pulse frequency in Hz = RPM / 60, i.e. RPM = Hz * 60.
   Idle 1000-1050 rpm = ~16.7-17.5 Hz. Autocorrelation finds the period.
   Pure functions are exported for the Node test suite. */
const ED_Audio = (() => {
  function pulseHzToRpm(hz) { return Math.round(hz * 60); }
  function rpmToPulseHz(rpm) { return rpm / 60; }
  function inIdleSpec(rpm, spec) {
    if (rpm == null) return null;
    if (rpm < spec.min) return "low";
    if (rpm > spec.max) return "high";
    return "in-spec";
  }
  /* Autocorrelation pitch estimate on a time-domain buffer.
     Returns the dominant low frequency in Hz, or null. */
  /* Idle-RPM guard — real phone recordings kill the low fundamental.
     On Joshua's 1990 Softail clip (Nov 24, 2026) the ~17.5 Hz idle pulse is
     nearly absent (phone mic + AAC roll off below ~50 Hz) and the strongest
     low periodicity is the 3rd harmonic (~52-55 Hz), so raw autocorrelation
     reads ~3,300 rpm for a bike idling at ~1,050. This meter measures IDLE
     only: if the found frequency is above the idle band (25 Hz = 1,500 rpm),
     try f/2 then f/3 and take the first that lands in 13-25 Hz (780-1,500
     rpm). A revving engine will fold down too — the meter is for idle, and
     the UI says so. */
  function foldToIdle(hz) {
    if (hz == null) return null;
    if (hz <= 25) return hz;
    const half = hz / 2, third = hz / 3;
    if (half >= 13 && half <= 25) return half;
    if (third >= 13 && third <= 25) return third;
    return hz;
  }
  function autocorrelate(buf, sampleRate) {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return null;
    let bestOffset = -1, bestCorr = 0;
    const minOffset = Math.floor(sampleRate / 60);   // 60 Hz max
    const maxOffset = Math.floor(sampleRate / 8);    // 8 Hz min
    for (let offset = minOffset; offset < maxOffset; offset++) {
      let corr = 0;
      for (let i = 0; i < SIZE - offset; i++) corr += buf[i] * buf[i + offset];
      if (corr > bestCorr) { bestCorr = corr; bestOffset = offset; }
    }
    if (bestOffset < 0) return null;
    return foldToIdle(sampleRate / bestOffset);
  }
  /* Live meter. Calls onRpm(rpm|null) roughly twice a second.
     onSpectrum, when given, is called on the same tick with a fresh copy
     of the frequency-domain frame (dB, getFloatFrequencyData), the sample
     rate and the fftSize, so a 10-second capture can average the spectrum
     for a baseline or a comparison. */
  let ctx = null, analyser = null, stream = null, timer = null, buf = null, freqBuf = null;
  function start(onRpm, onError, onSpectrum) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError && onError("This browser does not support microphone capture.");
      return false;
    }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } })
      .then((s) => {
        stream = s;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaStreamSource(stream);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 4096;
        src.connect(analyser);
        buf = new Float32Array(analyser.fftSize);
        freqBuf = onSpectrum ? new Float32Array(analyser.frequencyBinCount) : null;
        timer = setInterval(() => {
          analyser.getFloatTimeDomainData(buf);
          const hz = autocorrelate(buf, ctx.sampleRate);
          onRpm(hz == null ? null : pulseHzToRpm(hz));
          if (onSpectrum) {
            analyser.getFloatFrequencyData(freqBuf);
            onSpectrum(new Float32Array(freqBuf), ctx.sampleRate, analyser.fftSize);
          }
        }, 500);
      })
      .catch((e) => onError && onError("Microphone unavailable: " + (e && e.message ? e.message : e)));
    return true;
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    if (ctx) ctx.close().catch(() => {});
    ctx = null;
  }
  /* --- full-spectrum comparison (v22 staging) ---
     Compares the sound itself, not just RPM, against the stored healthy
     baseline spectrum. getFloatFrequencyData returns dB per bin; frames
     are averaged in the linear (amplitude) domain, then reduced to 8
     bands, so a baseline stores 8 numbers, not 2,048 bins.
     Bands run 50 Hz–12 kHz: phone mics roll off below ~50 Hz and above
     ~8-12 kHz, so nothing below 50 Hz is compared. Edges are roughly
     log-spaced (about an octave each) so a tone lands in exactly one
     band. What lives where, Evo at idle (~1000-1050 rpm, pulse ~17 Hz):
       rumble 50-125 Hz   idle-pulse harmonics; rod-knock thud body
       low 125-250 Hz     exhaust pulse harmonics
       low-mid 250-500 Hz rod knock / piston slap body
       mid 500-1000 Hz    primary chain rattle
       upper-mid 1-2 kHz  valvetrain clatter, primary whine
       tick 2-4 kHz       lifter tick, exhaust-leak tick
       hiss 4-8 kHz       exhaust-leak hiss
       air 8-12 kHz       wind + mic noise — a CONTROL band. If only this
                          band moves, suspect wind, not the engine.
     A band counts as changed at >= 6 dB — about a doubling of amplitude,
     well above the wobble you get from holding the phone a little
     differently between two 10-second listens.
     UNVALIDATED: proven in the Node suite on synthetic tones only. Not
     yet checked against Joshua's real recordings — the UI says so. */
  const SPECTRUM_BANDS = [
    { id: "rumble", label: "Rumble", lo: 50, hi: 125, lives: "Idle-pulse harmonics; rod-knock thud" },
    { id: "low", label: "Low", lo: 125, hi: 250, lives: "Exhaust pulse harmonics" },
    { id: "lowmid", label: "Low-mid", lo: 250, hi: 500, lives: "Rod knock / piston slap body" },
    { id: "mid", label: "Mid", lo: 500, hi: 1000, lives: "Primary chain rattle" },
    { id: "uppermid", label: "Upper-mid", lo: 1000, hi: 2000, lives: "Valvetrain clatter, primary whine" },
    { id: "tick", label: "Tick", lo: 2000, hi: 4000, lives: "Lifter tick, exhaust-leak tick" },
    { id: "hiss", label: "Hiss", lo: 4000, hi: 8000, lives: "Exhaust-leak hiss" },
    { id: "air", label: "Air", lo: 8000, hi: 12000, lives: "Wind + mic noise (control band)" }
  ];
  const SPECTRUM_VERSION = 1;
  const SPECTRUM_CHANGE_DB = 6;
  const DB_FLOOR = -100; // getFloatFrequencyData floor (minDecibels default)
  function dbToLinear(db) { return Math.pow(10, (db <= -120 || !isFinite(db) ? -120 : db) / 20); }
  function linearToDb(lin) { return lin <= 0 ? DB_FLOOR : Math.max(DB_FLOOR, 20 * Math.log10(lin)); }
  /* Average frequency-domain frames (dB arrays from
     getFloatFrequencyData) in the linear domain. Empty input -> null.
     Frames of a different length than the first are skipped. */
  function averageSpectrum(frames) {
    if (!frames || !frames.length) return null;
    const len = frames[0] ? frames[0].length : 0;
    if (!len) return null;
    const avg = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      let sum = 0, n = 0;
      for (let j = 0; j < frames.length; j++) {
        const f = frames[j];
        if (!f || f.length !== len) continue;
        sum += dbToLinear(f[i]); n++;
      }
      avg[i] = n ? linearToDb(sum / n) : DB_FLOOR;
    }
    return avg;
  }
  /* Reduce an averaged dB spectrum to one dB value per band (linear
     average of the bins inside the band). Returns null on bad input. */
  function spectrumToBands(dbSpectrum, sampleRate, fftSize) {
    if (!dbSpectrum || !dbSpectrum.length || !sampleRate || !fftSize) return null;
    const binHz = sampleRate / fftSize;
    return SPECTRUM_BANDS.map((b) => {
      /* Nearest-bin edges: each bin belongs to exactly one band, so a
         tone on a boundary cannot light up two bands at once. */
      const loBin = Math.max(0, Math.round(b.lo / binHz));
      const hiBin = Math.min(dbSpectrum.length - 1, Math.round(b.hi / binHz) - 1);
      let sum = 0, n = 0;
      for (let i = loBin; i <= hiBin; i++) { sum += dbToLinear(dbSpectrum[i]); n++; }
      return n ? Math.round(linearToDb(sum / n) * 10) / 10 : DB_FLOOR;
    });
  }
  /* Per-band deltas between "now" and a stored baseline, in dB.
     Returns null unless both are full 8-band arrays. */
  function compareSpectra(nowBands, baseBands) {
    if (!nowBands || !baseBands ||
        nowBands.length !== SPECTRUM_BANDS.length || baseBands.length !== SPECTRUM_BANDS.length) return null;
    const bands = SPECTRUM_BANDS.map((b, i) => {
      const delta = Math.round((nowBands[i] - baseBands[i]) * 10) / 10;
      return { id: b.id, label: b.label, lo: b.lo, hi: b.hi, lives: b.lives,
        base: baseBands[i], now: nowBands[i], delta, changed: Math.abs(delta) >= SPECTRUM_CHANGE_DB };
    });
    return { bands, changed: bands.filter((b) => b.changed).map((b) => b.id),
      maxDelta: Math.max.apply(null, bands.map((b) => Math.abs(b.delta))) };
  }
  /* Test helper: build a fake getFloatFrequencyData-style dB spectrum —
     flat floor with a tone at each listed frequency (3 bins wide, so it
     survives the per-band average). Pure, so the Node suite can prove
     band isolation without a microphone. */
  function toneSpectrum(freqs, levelDb, sampleRate, fftSize) {
    const len = fftSize / 2;
    const out = new Float32Array(len).fill(DB_FLOOR);
    const binHz = sampleRate / fftSize;
    (freqs || []).forEach((f) => {
      const c = Math.round(f / binHz);
      for (let i = Math.max(0, c - 1); i <= Math.min(len - 1, c + 1); i++) out[i] = levelDb;
    });
    return out;
  }
  /* Compare a fresh 10-second listen against the bike's stored healthy
     baseline. current/baseline are {rpm, sd?}. sd is optional — older
     baselines stored rpm only. */
  function compareBaseline(current, baseline) {
    if (!baseline || baseline.rpm == null) return null;
    const rpmDelta = current.rpm - baseline.rpm;
    const sdDelta = (current.sd != null && baseline.sd != null) ? current.sd - baseline.sd : null;
    let verdict, text;
    if (Math.abs(rpmDelta) <= 50 && (sdDelta == null || sdDelta <= 20)) {
      verdict = "close";
      text = "Close to your baseline — running like it should.";
    } else if (rpmDelta < -100) {
      verdict = "low";
      text = "Idling well below your baseline. Check the lean-idle tree — intake seals first, then the intermediate jet.";
    } else if (rpmDelta > 100) {
      verdict = "high";
      text = "Idling well above your baseline. Check for an intake leak or a stuck enrichener.";
    } else if (sdDelta != null && sdDelta > 40) {
      verdict = "unsteady";
      text = "Same RPM, but much less steady than your baseline — uneven firing. Run the ignition tree.";
    } else {
      verdict = "drift";
      text = "Drifting from your baseline. Worth a look, not an alarm — re-check after the next ride.";
    }
    /* Spectrum, when both sides have it. Old baselines stored rpm/sd
       only — they keep working on RPM/stability, spectrum comes back
       null, and the UI says to re-save the baseline to add one. A
       spectrum stored under a different band layout (version mismatch)
       is ignored rather than miscompared. */
    let spectrum = null;
    if (current.spectrum && baseline.spectrum &&
        (!baseline.spectrumVersion || baseline.spectrumVersion === SPECTRUM_VERSION)) {
      spectrum = compareSpectra(current.spectrum, baseline.spectrum);
    }
    return { rpmDelta, sdDelta, verdict, text, spectrum };
  }
  const api = { pulseHzToRpm, rpmToPulseHz, inIdleSpec, autocorrelate, foldToIdle, compareBaseline, start, stop,
    SPECTRUM_BANDS, SPECTRUM_VERSION, SPECTRUM_CHANGE_DB, averageSpectrum, spectrumToBands, compareSpectra, toneSpectrum };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Audio = ED_Audio;
