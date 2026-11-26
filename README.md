# The Evo Diagnostic

Photo, video and sound diagnostics for Evo-era Harleys — as a phone app
you install from the browser. No app store, no account, no server.

Your bike won't start, runs rough, leaks, or makes a noise you don't
like. The app walks you through the checks the factory manual would
have you do, in order, cheapest test first — then ranks the likely
causes, tells you the confirming test for each one, and gives a straight
**safe to ride?** verdict. It never declares a verdict from a photo or a
sound alone: a photo or a recording is evidence, the Q&A tree and the
test are what decide.

> All bikes, names, and numbers below are examples only.

## What it does

- **Diagnose tab** — 19 guided trees across starting, charging,
  ignition, carb/fuel, engine noise, oil leaks, brakes, clutch,
  primary/drive, transmission, wheels/tires, lights, and smoking/oil
  consumption. Each tree asks yes/no questions from the factory
  manuals, then shows ranked causes (144 total) with a confidence
  score, urgency, a safe-to-ride verdict, the confirming test, and the
  fix. Every cause cites its source. Magazine tips are labeled
  "NOT an FSM cause" — never presented as factory spec.
- **Atlas tab** — tap-to-identify parts atlas: 41 parts on traced
  diagrams of the engine, primary, charging, and brake systems, with
  part numbers only where published. No invented part numbers.
- **Listen tab** — record the bike idling and the app measures idle
  RPM from sound against the factory 1000–1050 rpm spec, plus a
  10-second quick-listen mode. Save a healthy-baseline recording per
  bike and compare future recordings against its own sound, not a
  generic library. Waveform and spectrogram display included.
  Spectrum comparison (v22 staging): a quick-listen also averages the
  frequency spectrum over the 10 seconds and compares it band by band
  (8 bands, 50 Hz–12 kHz, ±6 dB change threshold) against the spectrum
  stored with the baseline, with an overlaid baseline-vs-now chart.
  Changed bands link to the diagnostic tree that genuinely covers
  them (engine-noise, primary-drive); bands with no tree say so.
  **UNVALIDATED — proven on synthetic test tones only, not yet
  checked against real recordings.**
- **VIN tab** — decode an Evo-era Softail or Sportster VIN offline
  from the factory tables, including the check digit, plus a separate
  Knucklehead 1940–47 engine (serial) number decoder (year + model +
  serial, from the Knucklehead Service Manual p. 3 — a different system,
  Evo year codes never apply).
- **Recalls tab** — NHTSA recalls (12 campaigns), technical service
  bulletins (83 rows, 1995–1999), and owner-complaint counts (61
  complaints across 14 component families), bundled in the app so it
  works offline. Complaint counts are shown honestly at the component
  family level, never as per-fault counts, and the app links out to
  nhtsa.gov/recalls for per-VIN repair status — no open API reports
  whether a specific VIN was fixed.
- **Torque tab** — torque and spec lookup from FSM §2 and the chapter
  tables. Real published numbers or "don't have it" — never invented.
  Also carries the Knucklehead tire pressures from the 1940–47 Service
  Manual p. 3 (no Knucklehead torque values exist in that manual, so
  none appear).
- **Shop tab** — 20 garage reference cards: spark-plug reader (9
  conditions with look/cause/action), wire gauge and breaker sizes,
  gear-ratio calculator, tap & drill chart, bolt identifier, oil
  viscosity guide, compression-ratio calculator, carb CFM calculator,
  suspension sag setup, parts interchange lookup, tire reader, unit
  converter, drive-belt adjustment (FSM §1 pp. 1-43–1-44), clutch
  adjustment (FSM §1 p. 1-40), primary-chain adjustment (FSM §1
  pp. 1-38–1-39), storage / winterize (FSM §1 p. 1-8), brake pad
  replacement (FSM §2 pp. 2-40–2-43, 2-47–2-48), fork oil change
  (FSM §1 p. 1-42), first 500-mile service (FSM §1 p. 1-1; Scheduled
  Service Table pp. 1-34–1-37), and a pre-ride
  (T-CLOCS) checklist.
- **Data tab** — export/import your bikes, sessions, and baselines as
  JSON. Hands off to the Carb Tune Journal and the Bike Maintenance
  Log from a finished diagnosis.
- **Installable & offline** — open it in Chrome (Android) or Safari
  (iPhone), "Add to Home Screen," and it works in the garage with no
  signal. Plain JavaScript, zero dependencies. A service worker caches
  the app shell after the first load, and an in-app Update button
  takes the new version only when you tap it.

## Install

No build step. Any static host works — GitHub Pages, a folder on your
home server, or just the files on disk:

```bash
# Local preview
python3 -m http.server 8000
# then open http://localhost:8000/ on your phone or desktop
```

On your phone, open the hosted URL and use **Add to Home Screen**
(Android Chrome: menu → Add to Home Screen; iPhone Safari: Share →
Add to Home Screen). It then launches full-screen like a native app
and works offline from the first visit.

To test after editing the data or engine:

```bash
node test.js            # 1629 tests, no dependencies
```

## Try it

A no-start on a 1990 Softail, walked through the tree:

```
Engine will not start / hard starting
  Q: Turn the key on. Do the lights come on bright?  → No
  Q: Hit the starter. Does it crank at normal speed? → No
  → Ranked causes:
    1. Battery discharged or failed — 25%
       Test: charge, then load-test; voltage at rest 12.6V+,
       check cranking voltage. (FSM #99482-98 §8)
       Fix: charge or replace; check charging system after.
       Urgency: high — Do not ride, it will strand you.
    2. Ignition fault (coil, cables, VOES, timing) — 25%
       Test: spark test, then coil 2.5–3.1 ohm (stock),
       VOES closes 3.5–4.5 inHg, timing 20° BTDC.
    3. Fuel delivery (petcock, filter, carb) — 15%
    4. Starter or cables — 10%
  NHTSA: 10 owner complaints filed for this system
  (ENGINE AND ENGINE COOLING) — of 61 in the bundle.
```

Or check the idle by ear — record 10 seconds on the Listen tab:

```
Idle RPM from sound: 1,180 rpm
Factory spec: 1000–1050 rpm (FSM #99482-98)
→ High idle. See the carb lean-idle tree.
```

Or decode a VIN and check the recalls for that year, then look up
the torque for the job on the Torque tab — one app, no manual
digging, no signal needed.

## How the diagnosis works

1. **Pick a symptom** — the tree asks the manual's questions in
   order, cheapest and easiest test first (lights before starter,
   spark before fuel).
2. **Each answer narrows the causes** — every cause carries a weight
   from how often the manuals and the magazine tech tips point at it,
   and the app shows the ranked list with a confidence score.
3. **The confirming test decides** — each cause names the exact test
   (a voltage, an ohm reading, a float level) with its published
   value and source. No cause is presented as certain until its test
   passes.
4. **A verdict you can act on** — urgency, a safe-to-ride call, the
   fix, and the part number where published. Shop cost is stated as
   "part + ask your shop" — there is no published shop labor rate
   anywhere, so none is invented.

## On specs: real numbers or nothing

This tool will never invent a torque, clearance, spec, part-number,
price, or labor value. The rules it follows:

- **Every number cites its source in the app.** Factory numbers come
  from FSM #99482-98 (1997–98 Softail Service Manual), FSM
  #99484-98 (1998 Sportster), and the 1984–1999 Softail Repair
  Manual. Clymer-sourced items are labeled "Clymer," never presented
  as factory. Magazine tips (Easyriders, Iron Horse, Tech Tips) are
  labeled "NOT an FSM cause" on every cause that uses one.
- **Where the books disagree, the app says so.** The factory's own
  gear-ratio tables don't reconcile: the §6 sprockets (25/36/32/65)
  give 2.925 in 5th, but the factory's overall-ratio table says
  3.15 — which matches a 70-tooth rear exactly. The gear card says so
  and tells the rider to count their own teeth; the calculator trusts
  the teeth you enter, not the book.
- **Where no number exists, the app says so and stops.** No rider-sag
  target is published anywhere in the library (factory manual,
  Clymer, 562 Easyriders issues, Tech Tips Vol. 3, Iron Horse) — the
  sag card gives the procedure and the measurement worksheet, and
  leaves the target blank. No per-degree or per-percent jetting
  correction factor is published anywhere either, so the carb
  correction stays direction-only. Chamber volumes for the
  compression-ratio calculator are derived arithmetic and labeled
  derived — the manuals never publish one.
- **No shop labor rate exists anywhere** — shop cost stays "part +
  ask your shop."
- **Photos are only what may be embedded.** The atlas diagrams are
  traced by hand in our own style (factory art can't be embedded);
  photos are Wikimedia Commons CC-licensed images with attribution
  recorded, or the builder's own photos. No stock Harley photos, no
  catalog images, no manual pages.
- **Links are only what was verified live.** Ronnie's microfiche
  deep links were checked and return 403 to a fetcher, with section
  IDs not displayed in the site UI — so no fiche links ship. The
  app links out to the free Harley Service Information Portal
  catalogs instead.

## What's not in the app (yet)

- **Hands-free garage mode (read-aloud)** — pinned at the builder's
  word, shelved as a later layer, not in this build.
- **AI vision / audio classification** — local vision models are too
  thin to trust for part ID (tested: hallucinations on real photos),
  and sound classification ships only after testing against the
  builder's own labeled recordings. What ships today is measurement
  (RPM from sound) and the Q&A trees — both verifiable.
- **Guided compression and charging tests** — charging is a guided
  card here; the full charging-system app is a later build.
- **Parts ordering** — identified parts hand off to the parts
  interchange card and to the builder's own vendors; no in-app
  buying, no payments.
- **Ronnie's fiche deep links** — see "On specs" above. The pattern
  is documented in the research notes for a future live-browser pass.

## Files

| File | What it is |
|---|---|
| `index.html` | App shell (Diagnose / Atlas / Listen / VIN / Recalls / Torque / Shop / Data) |
| `data.js` | All trees, causes, atlas parts, specs, and Shop reference data (source of truth) |
| `app.js` | UI — trees, results, tabs, sessions, handoffs |
| `shop.js` | Shop-tab calculators and reference cards |
| `audio.js` | Idle-RPM-from-sound + quick-listen + baselines |
| `vin.js` | Offline VIN decode from the factory tables, plus the Knucklehead 1940–47 engine (serial) decoder |
| `nhtsa.js` | Recalls / TSB / complaint matching against the bundle |
| `scoring.js` | Cause ranking and confidence |
| `wizard.js` | Guided session flow |
| `report.js` | Share-a-diagnosis report |
| `handoff.js` | Handoffs to the Carb Journal and Bike Maintenance Log |
| `tire.js` | Tire date-code and size reading |
| `pg-parts-core.js` | Shared parts-core (part numbers, fitment) |
| `data/nhtsa-evo-bundle.json` | Bundled NHTSA recalls / TSBs / complaints |
| `test.js` | 1629 tests — `node test.js` |
| `styles.css` | 1990 Treatment styling (gloss black, chrome, purple), big touch targets |
| `sw.js` / `sw-update.js` | Service worker + tap-to-update |
| `manifest.json` | Install metadata (name, icons, colors) |
| `icon-192.png` / `icon-512.png` | App icons |
| `assets/` | CC-licensed photos used in the app, attribution recorded |
