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
  /* Live meter. Calls onRpm(rpm|null) roughly twice a second. */
  let ctx = null, analyser = null, stream = null, timer = null, buf = null;
  function start(onRpm, onError) {
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
        timer = setInterval(() => {
          analyser.getFloatTimeDomainData(buf);
          const hz = autocorrelate(buf, ctx.sampleRate);
          onRpm(hz == null ? null : pulseHzToRpm(hz));
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
    return { rpmDelta, sdDelta, verdict, text };
  }
  const api = { pulseHzToRpm, rpmToPulseHz, inIdleSpec, autocorrelate, foldToIdle, compareBaseline, start, stop };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();
if (typeof window !== "undefined") window.ED_Audio = ED_Audio;
