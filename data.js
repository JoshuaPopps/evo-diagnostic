/* The Evo Diagnostic — data layer.
   Every number is a published fact with its source. Nothing is guessed.
   Sources: FSM #99482-98 (1997-98 Softail Service Manual), 1984-1999
   Softail Repair Manual, S&S instruction 51-1012, Easyriders ER_153/ER_166,
   NHTSA bundle (research_notes/diagnostics-nhtsa-bundle/nhtsa-evo-bundle.json).
   Clymer-sourced items are labeled "Clymer", never presented as factory.
*/
const ED_DATA = {
  version: "1.0.0",
  app: "The Evo Diagnostic",
  roster: [
    { id: "b1", name: "1995 Fat Boy Bobber", base: "1995 Harley-Davidson Fat Boy FLSTF", carb: "b1", timing: "1995 Fat Boy Bobber" },
    { id: "b2", name: "1990 Softail", base: "1990 Harley-Davidson Heritage Softail Classic FLSTC", carb: "b2", timing: "1990 Softail" },
    { id: "b3", name: "1947 Knucklehead", base: "1947 Harley-Davidson FL", carb: "b3", timing: "1947 Knucklehead" }
  ],
  carbs: {
    b1: { name: "S&S Super E", bike: "1995 Fat Boy Bobber", main: "0.072", intermediate: "0.0295", mixture: "1-1/4 turns out", idle: "950-1050 rpm", source: "S&S instruction 51-1012" },
    b2: { name: "Genuine Keihin CV40", bike: "1990 Softail", main: "185", pilot: "45", float: "0.413-0.453 in", source: "1984-1999 Softail Repair Manual, 1990 49-state" },
    b3: { name: "Linkert M74B", bike: "1947 Knucklehead", venturi: "1-5/16 in", body: "1-1/2 in", jetting: null, source: "V-Twin Classic catalog pp. 237, 240; no jetting published - left blank, never guessed" }
  },
  specs: {
    idle_rpm: { min: 1000, max: 1050, source: "FSM #99482-98" },
    timing_btdc: "20 deg BTDC",
    timing_source: "FSM #99482-98",
    voes_inhg: "3.5-4.5 inHg (closes)",
    voes_source: "FSM #99482-98 section 8",
    coil_stock_ohm: "2.5-3.1",
    coil_2000i_ohm: "2.5-3.5",
    plug: "5R6A",
    plug_gap_in: "0.038-0.043",
    charging_v: "14.3-14.7 V @ 3600 rpm",
    charging_a: "32 A",
    stator_vac_per_1000rpm: "16-20",
    stator_ohm: "0.1-0.2",
    battery: "12V 18Ah",
    brake_fluid: "DOT 5 silicone ONLY",
    oil_service: "500 mi then every 5,000 mi — and annually / prior to storage (FSM §1 Scheduled Service Table, (*) footnote)"
  },
  /* Tap-to-identify atlas: one record per labeled part on the traced diagrams.
     Every spec below is already verified in the app's specs or trees. */
  parts: {
    "slide": { name: "Slide + diaphragm (CV40)", fn: "Lifts with vacuum to meter fuel as the throttle opens.", spec: "CV40, 40 mm bore", failures: "Torn diaphragm = flat spot, will not rev cleanly.", source: "1984-1999 Softail Repair Manual" },
    "carb-body": { name: "Carb body (CV40)", fn: "Mixes fuel and air.", spec: "Main jet 185 / pilot 45 (1990 49-state)", failures: "Worn slide bore, clogged passages.", source: "1984-1999 Softail Repair Manual" },
    "float-bowl": { name: "Float bowl", fn: "Holds fuel at the right level for the jets.", spec: "Float 0.413-0.453 in (Big Twin; Sportster 1992–2003 same) · Sportster 1988–91: 0.725–0.730 in (sportster-86-03 p. 390)", failures: "Stuck float = flooding or fuel starvation.", source: "1984-1999 Softail Repair Manual" },
    "enrichener": { name: "Enrichener", fn: "Rich mixture for cold starts.", spec: "Plunger + cable", failures: "Stuck open = rich running; stuck closed = hard cold starts.", source: "1984-1999 Softail Repair Manual" },
    "mixture-screw": { name: "Mixture screw", fn: "Fine-tunes the idle mixture.", spec: "Super E baseline 1-1/4 turns out; CV40 per manual", failures: "Mis-set = hunting or dying idle.", source: "S&S instruction 51-1012" },
    "accel-pump": { name: "Accelerator pump", fn: "Extra fuel the moment the throttle opens.", spec: "Diaphragm pump", failures: "Torn diaphragm = hesitation off idle.", source: "1984-1999 Softail Repair Manual" },
    "rubber-plug": { name: "Rubber plug (CV40)", fn: "The idle jet is fed through it.", spec: "All gas passes through the main jet first", failures: "Plug left out = runs like the choke is on.", source: "Easyriders ER_153" },
    "battery": { name: "Battery", fn: "Powers the starter, ignition, and lights.", spec: "12V 18Ah (Softail) · Sportster: 12V 19 Ah (sportster-86-03)", failures: "Will not hold a charge; slow crank.", source: "FSM #99482-98 section 8" },
    "ignition-module": { name: "Ignition module", fn: "Fires the coil at the right time.", spec: "Timing 20 deg BTDC; Dyna 2000i curves 1-4 switch-selectable", failures: "Heat failure = no spark; codes 52/54/55 on the Sportster 1200S.", source: "FSM #99482-98 section 8" },
    "coil": { name: "Coil", fn: "Steps battery voltage up to fire the plugs.", spec: "Primary 2.5-3.1 ohm stock, 2.5-3.5 ohm with Dyna 2000i", failures: "Breaks down hot = misfire when hot.", source: "FSM #99482-98 section 8" },
    "plugs": { name: "Spark plugs", fn: "Fire the mixture.", spec: "5R6A, gap 0.038-0.043 in", failures: "Fouled, worn, or wrong gap.", source: "FSM #99482-98 section 8" },
    "voes": { name: "VOES", fn: "Retards timing under load.", spec: "Closes 3.5-4.5 inHg", failures: "Stuck open = retarded timing; stuck closed = ping under load.", source: "FSM #99482-98 section 8" },
    "stator": { name: "Stator 29970-88C", fn: "Makes AC power for the charging system.", spec: "16-20 VAC/1000 rpm, 0.1-0.2 ohm lead-to-lead (Big Twin) · Sportster: 1986–90: 12–18 VAC/1,000 rpm; 1991–94: 19–26; 1995–2003: 38–52 at 2,000 rpm; 0.2–0.4 Ω (sportster-86-03)", failures: "Burned windings = low output.", source: "FSM #99482-98 section 8" },
    "regulator": { name: "Regulator 74519-88A", fn: "Turns stator AC into regulated DC.", spec: "14.3-14.7V @ 3600 rpm, 32A (Big Twin) · Sportster: 1986–93: 13.8–15 VDC; 1994–2003: 14.3–14.7 VDC; 19 A @ 3,600 rpm (1986–90) / 22 A (1991–2003) (sportster-86-03)", failures: "Over- or under-charging; cooked battery.", source: "FSM #99482-98 section 8" },
    "master-cyl": { name: "Master cylinder", fn: "Pressurizes brake fluid.", spec: "DOT 5 silicone ONLY", failures: "Seal failure = lever slowly sinks.", source: "FSM #99482-98 section 8" },
    "brake-line": { name: "Brake line", fn: "Carries fluid to the caliper.", spec: "Banjo bolts 17-22 ft-lbs", failures: "Cracked line, weeping banjo.", source: "FSM #99482-98 section 2" },
    "caliper": { name: "Caliper", fn: "Squeezes the pads onto the disc.", spec: "Bleeder valve 80-100 in-lbs", failures: "Stuck piston, weeping seal.", source: "FSM #99482-98 section 2" },
    "disc": { name: "Disc + pads", fn: "Friction surface that stops the wheel.", spec: "Pads 44063-83C/D; done at 1/16 in; disc screws front 16-24 / rear 30-45 ft-lbs", failures: "Worn pads, warped disc.", source: "FSM #99482-98 section 2; factory bulletin P-20" },
    "dot5-fluid": { name: "DOT 5 silicone brake fluid", fn: "Silicone hydraulic fluid for the disc brakes.", spec: "Use only D.O.T. 5 SILICONE HYDRAULIC BRAKE FLUID, Harley-Davidson Part No. 99902-77 (12 oz). Use only DOT 5 fluid from a sealed container.", failures: "Moisture/dust contamination (keep reservoir cover closed); wrong fluid. Inspect at every service — and annually / prior to storage (FSM §1 Scheduled Service Table, p. 1-36, (*) footnote).", source: "FSM #99482-98 §1 pp. 1-9, 1-33, 1-36; §2" },
    "exhaust-gaskets": { name: "Exhaust gaskets", fn: "Seal the header pipes to the cylinder heads (tapered gasket + retaining ring).", spec: "Install new gaskets in both heads with the tapered side out; exhaust flange nuts: top nut to 9–18 in-lbs (1–2 Nm), lower nut to 120 in-lbs (14 Nm), then final-tighten the top nut to 120 in-lbs (14 Nm), front cylinder first then rear; TORCA clamps 45–60 ft-lbs (61–81 Nm); TORCA clamp assemblies are one-time use — discard and replace each time removed.", failures: "Blown/leaking gasket = tick that mimics a lifter, soot at the flange, pulsing air felt at the flange.", source: "FSM #99482-98 §4, pp. 4-31–4-32" },
    "primary-chain": { name: "Primary chain", fn: "Drives the clutch from the engine.", spec: "Big Twin: 5/8–7/8 in cold · Sportster: cold 3/8–1/2 in, hot 1/4–3/8 in (sportster-86-03)", failures: "Loose chain rattles and eats the case.", source: "1984-1999 Softail Repair Manual" },
    "primary-shoe": { name: "Primary chain tensioner shoe", fn: "The shoe the primary chain rides on; moving it up/down sets chain free play.", spec: "Chain free play 5/8–7/8 in, upper strand (FSM §1 pp. 1-38–1-39); shoe center-bolt nut 21–29 ft-lbs (28–39 Nm); chain alignment difference (straightedge-to-sideplate at compensating sprocket vs clutch sprocket) within 0.030 in (0.76 mm) (FSM §6 p. 6-7). Replace rule (FSM §6 p. 6-7): 'If the chain tensioner shoe is worn to the point where proper adjustment cannot be obtained, replace the shoe' — remove two bottom bolts, lockplate, washers; on install bend one lockplate tab over each screw head (lockplate outside the two washers). No factory part number for this part in the FSM.", failures: "Worn shoe → chain can't be adjusted → rattle, accelerated chain/case wear; over-filled primary (wrong level) causes rough engagement/clutch drag (FSM §1 p. 1-39).", source: "FSM #99482-98 §6 p. 6-7; §1 pp. 1-38–1-39" },
    "clutch": { name: "Clutch", fn: "Connects the engine to the transmission.", spec: "Wet multiple disc; lever free play 1/16-1/8 in; cover screws 108-120 in-lbs", failures: "Slip under load, drag at a stop, worn plates.", source: "FSM #99482-98 p. 272" },
    "transmission": { name: "Transmission", fn: "Five speeds, changes the ratios.", spec: "24 oz oil", failures: "Hard shifting, false neutrals.", source: "FSM #99482-98 section 2" },
    "belt": { name: "Drive belt", fn: "Drives the rear wheel.", spec: "Deflection 3/8-1/2 in (Big Twin) · Sportster belt 1991–99: 9/16–11/16 in; 2000–03: 5/16–3/8 in. A magazine tip claims 1 in cold / 1/2 in hot — that contradicts the FSM and is NOT used here (Easyriders ER_164 §36, ER_188 §68 — rejected).", failures: "Cracks, fraying, missing teeth.", source: "1984-1999 Softail Repair Manual" },
    "heads": { name: "Cylinder heads", fn: "Hold the valves and seal combustion.", spec: "1340cc Evo", failures: "Leaking gaskets, worn valve guides.", source: "1984-1999 Softail Repair Manual" },
    "valves": { name: "Valves + pushrods", fn: "Open and close on the cam's timing.", spec: "Hydraulic lifters, no adjustment", failures: "Burned valve, bent pushrod.", source: "1984-1999 Softail Repair Manual" },
    "lifters": { name: "Lifters", fn: "Follow the cam and open the valves.", spec: "Hydraulic", failures: "Tick at half engine speed; bleed-down.", source: "1984-1999 Softail Repair Manual" },
    "crankcase": { name: "Crankcase", fn: "Houses the crank and the oil.", spec: "Oil tank 3.0 qt with filter", failures: "Leaks at the cases.", source: "FSM #99482-98 section 2" },
    "fork": { name: "Front fork", fn: "Suspension and steering.", spec: "Fork oil 11.5 oz each; slider cap nuts 9-13 ft-lbs · Evo forks: 5–20 weight oil (Easyriders ER_205 §37–§38, magazine guidance, not a factory spec)", failures: "Leaking seals, bent tubes.", source: "FSM #99482-98 section 2" },
    "front-axle": { name: "Front axle", fn: "Holds the front wheel.", spec: "45-50 ft-lbs", failures: "Loose axle = wobble.", source: "FSM #99482-98 section 2" },
    "rear-axle": { name: "Rear axle", fn: "Holds the rear wheel.", spec: "60-65 ft-lbs", failures: "Loose axle, bad alignment.", source: "FSM #99482-98 section 2" },
    "shocks": { name: "Rear shocks", fn: "Damp the rear wheel.", spec: "115-130 ft-lbs", failures: "Blown damping, sagging.", source: "FSM #99482-98 section 2" },
    "main-jet": { name: "Main jet", fn: "Meters fuel at wide-open throttle.", spec: "CV40: 185 (1990 49-state). S&S Super E: 0.072 main.", failures: "Too small = lean on top, picks up speed on the roll-off test. Too large = hesitates on roll-off.", source: "1984-1999 Softail Repair Manual; S&S instruction 51-1012" },
    "pilot-jet": { name: "Pilot (slow) jet", fn: "Meters fuel at idle and just off idle, with the mixture screw.", spec: "CV40: 45 (1990 49-state). S&S Super E: 0.0295 intermediate.", failures: "Too large = mixture screw has no effect, rich idle. Too small = lean idle, enrichener-only starts.", source: "1984-1999 Softail Repair Manual; S&S instruction 51-1012" },
    "float": { name: "Float + needle", fn: "Holds the fuel level in the bowl steady.", spec: "CV40 float height 0.413-0.453 in.", failures: "Sunk or sticking float = flooding or starving; wrong height = rich or lean everywhere.", source: "1984-1999 Softail Repair Manual" },
    "intake-seals": { name: "Intake manifold seals", fn: "Seal the intake manifold to the cylinder heads so no unmetered air enters; a leak = lean idle.", spec: "Manifold mounting capscrews 15–17 ft-lbs (20–23 Nm) (FSM §4 p. 4-1 torque table). Install per FSM §4 p. 4-16: place seal, flanges, manifold, capscrews finger tight, carburetor in place for alignment, align manifold/flanges/carburetor, THEN tighten — 'Do not tighten capscrews and then try to align the manifold and flanges. The manifold seals will be damaged.' No factory part number for this part in the FSM.", failures: "Air leak at the seals (carb-cleaner spray test changes idle); damaged by misalignment during install.", source: "FSM #99482-98 §4, p. 4-16 + §4 p. 4-1" },
    "plug-wires": { name: "Plug wires", fn: "Carry the coil's spark to the plugs.", spec: "No standalone spec published — check the coil secondary through the wires: 10,000-12,500 ohms.", failures: "Cracked or burnt wires = weak yellow spark, misfire when hot.", source: "FSM #99482-98 section 8" },
    "starter": { name: "Starter motor", fn: "Cranks the engine through the jackshaft.", spec: "Typical draw 160–180 amps cranking; over 200 amps = fault. Bench test (FSM §5 p. 5-1): free speed 3,000 rpm min @ 11.5V, free current 90A max @ 11.5V. Sportster: normal draw 160–200 A, max 250 A (sportster-86-03) — do not apply the 200 A fault line to Sportsters.", failures: "Slow crank, click with no crank, grinding on engagement (jackshaft).", source: "FSM #99482-98 §5, pp. 5-1, 5-10" },
    "jackshaft": { name: "Jackshaft", fn: "Engages the starter motor to the engine.", spec: "H-D starter shaft 31482-70 is ~1/4 in longer than the one it replaces (Easyriders ER_305 §18, magazine).", failures: "Binding/sticking; shaft/cover mismatch = starter spins without engaging the engine.", source: "Easyriders ER_305 §18; ER_295 §139" },
    "wheel-bearing": { name: "Wheel bearing 9052", fn: "Lets the wheel spin on the axle.", spec: "Bearing 9052, front and rear, two per wheel; cup/race is 9033. Fits Big Twins and Sportsters 1973-99.", failures: "Growl or wobble at speed; check every 10,000 mi — and annually / prior to storage (FSM §1 Scheduled Service Table, p. 1-35, (*) footnote). Magazine schedule: inspect/repack every 5,000 mi (Easyriders ER_259 §85).", source: "Harley SIP factory parts catalogs; Ronnie's HLSM fiche; annual leg: FSM #99482-98 §1 Scheduled Service Table, p. 1-35 (*)" }
  },
  /* Flash codes — 1998 Sportster XL1200S (fuel-injected) ONLY. Figure 7-1,
     Sportster XLH 1998 Service Manual 99484-98. Carbed Evos have no
     check-engine lamp and store no codes. */
  flash_codes: [
    { code: 12, desc: "MAP Sensor", ref: "7-33" },
    { code: 16, desc: "Battery Voltage", ref: "7-35" },
    { code: 24, desc: "Front Coil", ref: "7-37" },
    { code: 25, desc: "Rear Coil", ref: "7-37" },
    { code: 35, desc: "Tachometer", ref: "7-40" },
    { code: 41, desc: "Cam Sync Failure", ref: "7-41" },
    { code: 44, desc: "Bank Angle Sensor", ref: "7-42" },
    { code: 52, desc: "RAM/ROM Failure — ignition module internal failure, replace the module", ref: "7-44" },
    { code: 54, desc: "EEPROM Failure — ignition module internal failure, replace the module", ref: "7-44" },
    { code: 55, desc: "Module Failure — ignition module microprocessor failure, replace the module", ref: "7-44" }
  ],
  flash_codes_how: "Jumper wire across pins 1 and 2 of Data Link connector [91A], key to IGNITION, wait about 8 seconds. Rapid flashes (about 3/sec) = intermission, then a 2-second pause; count the flashes for the first digit (about 1 second each), 2-second pause, count the second digit. Fast flashing with no code = intermission only, no codes present. Clear by 50 start-and-run cycles (run 30+ seconds, off 10+ seconds) or a Scanalyzer HD-41325. With the test wire in, the engine WILL start in Diagnostics Mode — remove the wire and turn the key OFF when done. Source: Sportster XLH 1998 Service Manual 99484-98, pp. 7-15 to 7-17.",
  common_bikes: [
    {
      "brand": "Harley-Davidson",
      "families": [
        {
          "family": "Sportster",
          "models": [
            "Iron 883",
            "Forty-Eight",
            "Roadster",
            "SuperLow",
            "Custom 1200",
            "Nightster",
            "Sportster S"
          ]
        },
        {
          "family": "Softail",
          "models": [
            "Standard",
            "Street Bob",
            "Fat Bob",
            "Fat Boy",
            "Heritage Classic",
            "Low Rider S",
            "Low Rider ST",
            "Breakout"
          ]
        },
        {
          "family": "Dyna",
          "models": [
            "Street Bob",
            "Low Rider",
            "Wide Glide",
            "Super Glide",
            "Fat Bob"
          ]
        },
        {
          "family": "Touring",
          "models": [
            "Street Glide",
            "Road Glide",
            "Road King",
            "Electra Glide Classic",
            "Ultra Limited"
          ]
        },
        {
          "family": "Adventure & electric",
          "models": [
            "Pan America 1250",
            "LiveWire"
          ]
        }
      ]
    },
    {
      "brand": "Triumph",
      "families": [
        {
          "family": "Bonneville",
          "models": [
            "T100",
            "T120",
            "Street Twin",
            "Speed Twin",
            "Bobber",
            "Speedmaster",
            "Thruxton"
          ]
        },
        {
          "family": "Tiger",
          "models": [
            "Tiger 900",
            "Tiger 1200",
            "Tiger Sport 660"
          ]
        },
        {
          "family": "Triple",
          "models": [
            "Street Triple",
            "Speed Triple 1200"
          ]
        },
        {
          "family": "Scrambler",
          "models": [
            "Scrambler 900",
            "Scrambler 1200"
          ]
        },
        {
          "family": "Other",
          "models": [
            "Trident 660",
            "Rocket 3",
            "Daytona 660"
          ]
        }
      ]
    },
    {
      "brand": "Honda",
      "families": [
        {
          "family": "CB",
          "models": [
            "CB500F",
            "CB650R",
            "CB1000R",
            "CB1100"
          ]
        },
        {
          "family": "CBR",
          "models": [
            "CBR500R",
            "CBR600RR",
            "CBR1000RR Fireblade"
          ]
        },
        {
          "family": "Gold Wing",
          "models": [
            "Gold Wing",
            "Gold Wing Tour"
          ]
        },
        {
          "family": "Africa Twin",
          "models": [
            "Africa Twin",
            "Africa Twin Adventure Sports"
          ]
        },
        {
          "family": "Rebel",
          "models": [
            "Rebel 300",
            "Rebel 500",
            "Rebel 1100"
          ]
        },
        {
          "family": "Other",
          "models": [
            "Grom",
            "Monkey",
            "NC750X"
          ]
        }
      ]
    },
    {
      "brand": "Suzuki",
      "families": [
        {
          "family": "GSX-R",
          "models": [
            "GSX-R600",
            "GSX-R750",
            "GSX-R1000"
          ]
        },
        {
          "family": "GSX-S",
          "models": [
            "GSX-S750",
            "GSX-S1000",
            "Katana"
          ]
        },
        {
          "family": "V-Strom",
          "models": [
            "V-Strom 650",
            "V-Strom 1050"
          ]
        },
        {
          "family": "Boulevard",
          "models": [
            "Boulevard M109R",
            "Boulevard C50"
          ]
        },
        {
          "family": "Other",
          "models": [
            "SV650",
            "DR650S",
            "DR-Z400S"
          ]
        }
      ]
    },
    {
      "brand": "Kawasaki",
      "families": [
        {
          "family": "Ninja",
          "models": [
            "Ninja 400",
            "Ninja 650",
            "Ninja ZX-6R",
            "Ninja ZX-10R"
          ]
        },
        {
          "family": "Z",
          "models": [
            "Z400",
            "Z650",
            "Z900",
            "Z H2"
          ]
        },
        {
          "family": "Vulcan",
          "models": [
            "Vulcan S",
            "Vulcan 900",
            "Vulcan 1700 Vaquero"
          ]
        },
        {
          "family": "Versys",
          "models": [
            "Versys 650",
            "Versys 1000"
          ]
        },
        {
          "family": "Other",
          "models": [
            "KLR650",
            "W800"
          ]
        }
      ]
    },
    {
      "brand": "Yamaha",
      "families": [
        {
          "family": "MT",
          "models": [
            "MT-03",
            "MT-07",
            "MT-09",
            "MT-10"
          ]
        },
        {
          "family": "YZF-R",
          "models": [
            "YZF-R3",
            "YZF-R6",
            "YZF-R7",
            "YZF-R1"
          ]
        },
        {
          "family": "Other",
          "models": [
            "FJR1300",
            "Bolt",
            "Bolt R-Spec",
            "Tracer 9 GT",
            "Ténéré 700",
            "XSR700",
            "XSR900",
            "V Star 650",
            "V Star 1300"
          ]
        }
      ]
    }
  ],
  tire_pressure_psi_cold_dunlop_only: {
    "FLSTC, FLSTF, FLSTS": { solo: { front: 36, rear: 36 }, two_up: { front: 36, rear: 40 } },
    "FXSTC, FXSTS, FXSTSB": { solo: { front: 30, rear: 36 }, two_up: { front: 30, rear: 40 } }
  },
  tire_pressure_source: "FSM #99482-98 section 2, p. 2-2 (verified visually Nov 24, 2026)",
  vin: {
    layout: "1-indexed: 1-3 = 1HD (WMI), 4 = 1, 5-6 = model designation, 7 = engine type, 8 = varies (1-8), 9 = check digit, 10 = year code, 11 = plant, 12-17 = serial",
    full_location: "stamped on right downtube socket of steering head + label on right front frame downtube",
    abbrev_location: "stamped on left side crankcase at base of rear cylinder",
    model_codes: { BJ: "FLSTC Heritage Softail Classic", BM: "FLSTF Fat Boy", BR: "FLSTS Heritage Springer", BK: "FXSTC Softail Custom", BL: "FXSTS Springer Softail", BP: "FXSTSB Bad Boy (1997 only)", CA: "XLH883 / XLH1200 Sportster", CE: "XLH883 Hugger", CF: "XLH883 Deluxe", CG: "XL1200C Custom", CH: "XL1200S Sport", CJ: "XLH883 Custom", CK: "XLH883 Custom" },
    engine_codes: { L: "1340cc Evolution V-twin (Big Twin)", M: "883cc (Sportster)", N: "1100cc (Sportster)", P: "1200cc (Sportster)" },
    plant_codes: { Y: "York, PA", K: "Kansas City, MO" },
    year_codes: { M: 1991, N: 1992, P: 1993, R: 1994, S: 1995, T: 1996, V: 1997, W: 1998, X: 1999, Y: 2000, "1": 2001, "2": 2002, "3": 2003, "4": 2004, "5": 2005, "6": 2006, "7": 2007, "8": 2008, "9": 2009, A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019, L: 2020 },
    year_note: "Year codes M/T are FSM-verified for Sportsters 1991-1996; V/W for Softails 1997/1998. Codes repeat every 30 years (M = 1991 or 2021). Model codes: Softail per FSM #99482-98 p. 2-3; Sportster per Sportster 1986-2003 Service Manual Ch. 1 and Sportster XLH 1998 Service Manual 99484-98 p. 2-4. A Harley VIN does NOT encode color or options, and no public Harley build-record lookup exists. Pre-1981 bikes have short serials, not 17-digit VINs.",
    samples: [
      { vin: "1HD1BJL41VY010000", year: 1997, model: "FLSTC Heritage Softail Classic", source: "FSM #99482-98 p. 2-3" },
      { vin: "1HD1BJW41VY010000", year: 1998, model: "FLSTC Heritage Softail Classic", source: "FSM #99482-98 p. 2-3" },
      { vin: "1HD4CHP13WY200062", year: 1998, model: "XL1200S Sport", source: "Sportster XLH 1998 Service Manual 99484-98 p. 2-4" },
      { vin: "1HD4CEM13VY200037", year: 1997, model: "XLH883 Hugger", source: "Sportster 1986-2003 Service Manual Ch. 1 (sample check digit is wrong in the manual: computed 2, printed 3)" }
    ],
    /* Knucklehead 1940-47 engine (serial) number — NOT a 17-digit VIN.
       Knucklehead 1940-1947 Service Manual p. 3, read visually Nov 25, 2026.
       Format: 2-digit year (40-47) + model code + serial number.
       Model codes and engine descriptions are the General Specifications
       table on the same page. Evo-era year codes NEVER apply here.
       Worked example from the manual: 46 EL 2222. Joshua's bike: 47FL6216. */
    knucklehead: {
      source: "Knucklehead 1940–1947 Service Manual, p. 3",
      format: "Year (2 digits, 40–47) + Model + Serial Number",
      example: { serial: "46EL2222", year: 1946, model: "EL", serialNumber: "2222", source: "Manual p. 3, worked example" },
      worked_example: { serial: "47FL6216", year: 1947, model: "FL", serialNumber: "6216", source: "Joshua's 1947 Knucklehead" },
      model_codes: {
        E: "61 Cu. In. O.H.V. Twin — low compression, 6.5 to 1",
        EL: "61 Cu. In. O.H.V. Twin — high compression, 7.0 to 1",
        F: "74 Cu. In. O.H.V. Twin — low compression, 6.6 to 1",
        FL: "74 Cu. In. O.H.V. Twin — high compression, 7.0 to 1",
        U: "74 Cu. In. Side Valve Twin — low compression, 5.0 to 1",
        UL: "74 Cu. In. Side Valve Twin — high compression, 5.5 to 1",
        UH: "80 Cu. In. Side Valve Twin — low compression, 5.2 to 1",
        ULH: "80 Cu. In. Side Valve Twin — high compression, 5.7 to 1"
      }
    }
  },
  /* Diagnostic trees. Cheap checks first. Every step cites its source.
     Each tree ends in ranked causes; every cause names its confirming test.
     The app never declares a verdict from a photo or sound alone. */
  trees: [
    {
      id: "carb-lean-idle",
      system: "Carb / fuel",
      title: "Lean idle / won't hold idle",
      test_case: "1995 Fat Boy, Nov 9 2026: enrichener-only start, lean idle suspected",
      steps: [
        { q: "Does it start and run only with the enrichener (choke) pulled?", yes: "lean", no: "next", note: "Enrichener-only running is the classic lean-idle tell.", cite: "1984-1999 Softail Repair Manual, Ch. 2" },
        { q: "With the engine warm, does the idle hunt, surge, or die at stops?", yes: "lean", no: "next", note: "Warm idle 1000-1050 rpm (FSM #99482-98). Hunting at warm idle points lean, not rich.", cite: "FSM #99482-98" },
        { q: "Spray carb cleaner around the intake seals while it idles. Does the idle change (rise or smooth out)?", yes: "intake-leak", no: "next", note: "A change means air is leaking in past the seals. Do this outside, no open flame.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Shut it off warm, then restart it. Does it refuse to idle, with no pick-up, until it's warm again?", yes: "orings", no: "next", note: "Manifold O-rings leaking — the idle mixture was set to cover the leak when warm, so a warm restart has no idle. The letter bike is a '73 FLH Shovelhead; the same O-ring-manifold failure hits Evos (ER_390 §45–§46).", cite: "Easyriders ER_267 §43; ER_390 §45–§46 (not an FSM cause)" },
        { q: "Is the idle mixture screw within its baseline? (Super E: 1-1/4 turns out. CV40: baseline per manual.)", yes: "next", no: "mixture", note: "S&S order: set the intermediate jet FIRST, then the mixture screw. Every intermediate change needs a mixture-screw re-adjustment.", cite: "S&S instruction 51-1012; Easyriders ER_166" },
        { q: "Roll-off test: near peak torque (3,500-4,500 rpm), full throttle, roll off to about 3/4. Does it pick up speed?", yes: "main-lean", no: "next", note: "Picks up = too lean. Hesitates = too large. Just slows = within one size.", cite: "Easyriders ER_153" },
        { q: "Look at a plug (see Plug Reader). Is the insulator white or very light tan?", yes: "main-lean", no: "next", note: "White = lean. Tan = about right. Black/sooty = rich.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Set the best idle with the mixture screw, then count the turns open. Is best idle under 1/2 turn out (Keihin)?", yes: "turncount", no: "next", note: "Best idle under 1/2 turn = idle jet too big; over 1-1/4 turns = too small. Keihin only — S&S Super E uses 1 to 1-1/2 turns.", cite: "Easyriders ER_153 §28 (not an FSM cause)" },
        { q: "Rolling off idle, does it load up, stagger and blow black smoke — or hesitate rolling on, buck when cold, and surge at a steady cruise?", yes: "ladder", no: "next", note: "Match the symptom to the ladder: 1 size rich = mileage down, rough transition; 2 rich = load up, stagger, black smoke; 1 lean = hesitation rolling on; 2 lean = buck/jump cold, surge at cruise.", cite: "Easyriders ER_153 §27 (not an FSM cause)" },
        { q: "Does the idle hang around 1,600 rpm, then drop off on its own?", yes: "advance", no: "next", note: "A worn advance mechanism with weak return springs hangs the idle high until the advancer finally returns. Check the advancer before touching the carb.", cite: "Easyriders ER_166 §69 (not an FSM cause)" },
        { q: "Is the float-bowl breather tube pinched, kinked, or pointed into the wind?", yes: "bowl-breather", no: "next", note: "Pinching the breather tube, or pointing it into the wind, changes the pressure in the float bowl and messes up the tune. The breather belongs in still air.", cite: "Easyriders Tech Tips Vol. 2, §36 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Intake leak at the manifold seals", weight: 20, test: "Carb-cleaner spray test at the seals (see step 3); Evolution Big Twin compliance fittings are particularly troublesome — many maladies unjustly blamed on the carb are caused by leaking intake seals (Easyriders Tips Vol. 3, PDF p. 27)", fix: "Replace intake seals; re-torque manifold", urgency: "medium", ride: "Rideable short distance, fix soon - a lean idle can overheat the rear cylinder." , part: "intake-seals" },
        { cause: "Intermediate (slow) jet too small / mixture screw mis-set", weight: 25, test: "Set intermediate first, then mixture screw per S&S order; re-check warm idle 1000-1050 rpm. Never force the mixture screw — an over-tightened screw can crack the carb body at the screw hole (S&S Super B, Easyriders Tips Vol. 3, PDF p. 28)", fix: "S&S order: intermediate jet first, main jet last; mixture screw 1-1/4 turns out baseline", urgency: "medium", ride: "Rideable if it holds idle warm; do not ride if it dies at stops." },
        { cause: "Main jet too small", weight: 15, test: "Roll-off test at 3,500-4,500 rpm (see step 5)", fix: "Go up one main size, re-test", urgency: "low", ride: "Rideable; fix when convenient." },
        { cause: "Enrichener circuit stuck or misadjusted", weight: 5, test: "Enrichener cable free play + plunger seating", fix: "Free the cable, seat the plunger", urgency: "low", ride: "Rideable." },
        { cause: "Keihin rubber plug missing (CV40 only): all gas passes through the main jet first and the idle jet is fed through it - plug left out runs like the choke is on", weight: 10, test: "Open the carb, check the rubber plug is in place", fix: "Refit the plug", urgency: "medium", ride: "Rideable but running rich; fix soon.", applies: "b2" , part: "carb-body" },
        { cause: "Idle jet wrong size — mixture-screw turn-count diagnosis (Keihin)", weight: 5, test: "Warm engine, set best idle with the mixture screw, count turns open: under 1/2 turn = jet too big; over 1-1/4 turns = jet too small", fix: "Change the idle (slow) jet one size in the indicated direction, re-set the mixture screw", urgency: "low", ride: "Rideable; fix when convenient.", part: "pilot-jet", source: "NOT an FSM cause — Easyriders ER_153 §28 (Keihin butterfly carb). S&S Super E uses 1–1 1/2 turns instead (ER_166 §72)." },
        { cause: "Idle jet wrong size — symptom ladder (one/two sizes rich or lean)", weight: 5, test: "Match the symptom to the ladder: one size rich = still runs, mileage down, rough idle-to-throttle transition; two sizes rich = loads up, staggers, blows black smoke; one size lean = hesitation rolling the throttle open, good mileage, heavy accelerator-pump use; two sizes lean = bucks and jumps when cold, surges at a steady cruise", fix: "Change the idle (slow) jet one size in the indicated direction, re-set the mixture screw", urgency: "low", ride: "Rideable; fix when convenient.", part: "pilot-jet", source: "NOT an FSM cause — Easyriders ER_153 §27 (Keihin butterfly carb). The ladder sits in the second half of the §27 chunk — the chunk opens with the transition-circuit holes, which is why the Nov 24 sweep misread it as transition-only." },
        { cause: "Manifold O-rings leaking — won't idle after a warm restart", weight: 5, test: "Shut off warm, then restart: won't idle and has no pick-up until warm again; the idle mixture was set to cover the leak when warm. Spray-test the manifold O-rings; look for cracked O-rings", fix: "Replace the manifold O-rings, chamfer facing in toward the cylinder beads; snug the clamps down evenly, front and rear clamps in their own places. On early Evos with cracked compliance fittings, fit an SES O-ring manifold kit (Part No. 16-1658)", urgency: "medium", ride: "Rideable short distance, fix soon - a lean idle can overheat the rear cylinder.", part: "intake-seals", source: "NOT an FSM cause — Easyriders ER_267 §43 ('NO PICK UP' letter: warm-restart no-idle, manifold O-rings leaking — 1973 FLH Shovelhead letter). Same O-ring-manifold failure on Evos: Easyriders ER_390 §45–§46 ('86 FXR compliance fittings cracked; cracked manifold O-ring, chamfer-in fix)." },
        { cause: "Worn advance mechanism — idle hangs ~1,600 rpm then drops", weight: 5, test: "Idle hangs high then falls off on its own; inspect the advance mechanism for weak return springs / binding", fix: "Free or replace the advance mechanism; do the carb last", urgency: "low", ride: "Rideable.", part: "ignition-module", source: "NOT an FSM cause — Easyriders ER_166 §69." },
        { cause: "Float-bowl breather pinched or pointed into the wind — erratic carb tune", weight: 5, test: "Carb tune goes erratic for no other reason; check the float-bowl breather tube — pinched, kinked, or pointed into the wind instead of still air", fix: "Free the breather tube and route it into still air", urgency: "low", ride: "Rideable; fix when convenient.", source: "NOT an FSM cause — Easyriders Tech Tips Vol. 2, §36 (Keihin tuning; Joe Minton)." }
      ]
    },
    {
      id: "no-start",
      system: "Starting",
      title: "Engine will not start / hard starting",
      steps: [
        { q: "Turn the key on. Do the lights come on bright?", yes: "next", no: "battery", note: "Dim or dead lights = battery first. 12V 18Ah; charge and load-test before replacing anything.", cite: "FSM #99482-98 section 8" },
        { q: "Hit the starter. Does it crank at normal speed?", yes: "next", no: "starter", note: "Slow crank = battery, cables, or starter. Check the battery cable first - a loose cable has caused exactly this before.", cite: "FSM #99482-98 section 8" },
        { q: "Does it crank but never fire?", yes: "ignition", no: "next", note: "Crank-no-fire splits fuel vs spark. Check spark first - it is the cheaper test.", cite: "FSM #99482-98 section 8, p. 8-321" },
        { q: "Pull a plug, ground it, crank. Do you see a strong blue spark?", yes: "fuel", no: "ignition", note: "Weak or yellow spark = coil, cables, or VOES. Strong spark = look at fuel.", cite: "FSM #99482-98 section 8" },
        { q: "Does the starter spin fast without turning the engine, or click then spin free?", yes: "jackshaft", no: "next", note: "A starter that spins without engaging points at the jackshaft / starter drive — binding, sticking, or a shaft/cover mismatch.", cite: "Easyriders ER_305 §18; ER_295 §139 (not an FSM cause)" },
        { q: "Sportster 1995–2003: is there fuel at the carb with the vacuum hose connected?", yes: "vacuum", no: "next", note: "The vacuum fuel valve only flows with engine vacuum on its diaphragm hose. No vacuum = no fuel.", cite: "sportster-86-03-trouble p. 55" },
        { q: "Does it crank slow and sluggish, or kick back against the starter?", yes: "stuck", no: "next", note: "Mechanical advance weights stuck in the full-advance position light the charge at/before TDC at cranking speed. Do NOT rewire the cranking circuit to fix this — that removes a safety interlock.", cite: "Easyriders Tips Vol. 3, PDF pp. 49–50 (not an FSM cause)" },
        { q: "Has the bike been parked for weeks or months, and does it act fuel-starved — runs, then dies, or cranks without firing?", yes: "screens", no: "next", note: "Petcock filter screens inside the tank block up with rust flaking off the tank walls while the bike sits. Check this before taking the carb apart.", cite: "Easyriders Tech Tips Vol. 2, §16 (not an FSM cause)" },
        { q: "Battery, cables, starter and solenoid all test good, but the engine still will not turn over at all — not even a partial rotation?", yes: "seized", no: "next", note: "If everything electrical tests good and the engine will not turn, the fault is mechanical — seized piston(s), seized crankshaft bearings, or a broken connecting rod.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Will Not Crank (PDF p. 3)" }
      ],
      causes: [
        { cause: "Battery discharged or failed", weight: 20, test: "Charge, then load-test; check voltage at rest (12.6V+) and cranking. If the leads are eaten by acid under the insulation, cleaning the terminals won't fix it — replace the leads; a wire broken inside its insulation looks identical to a good one (Easyriders Tips Vol. 3, PDF p. 127)", fix: "Charge or replace; check charging system after", urgency: "high", ride: "Do not ride - it will strand you." , part: "battery" },
        { cause: "Ignition fault (coil, cables, VOES, timing)", weight: 25, test: "Spark test, then coil 2.5-3.1 ohm (stock) / VOES closes 3.5-4.5 inHg / timing 20 deg BTDC", fix: "Replace the failed part; see Ignition Timing Helper", urgency: "high", ride: "Do not ride until it fires reliably." , part: ["coil", "plug-wires", "voes"] },
        { cause: "Fuel delivery (petcock, filter, carb)", weight: 15, test: "Fuel flow at the carb; petcock on RESERVE test; float bowl has fuel", fix: "Clean/replace filter; check float 0.413-0.453 in (CV40)", urgency: "medium", ride: "Do not ride until it runs." , part: ["carb-body", "float"] },
        { cause: "Starter or cables", weight: 10, test: "Voltage drop while cranking — Sportster troubleshooting manual: battery to solenoid under 1 V, solenoid to starter under 1 V, battery ground wire to starter under 0.2 V; any leg over its limit = dirty or loose terminals, clean and repair. Then starter current-draw test vs Table 1, then pinion/ring-gear inspection. (Clymer p. 47 gives <0.2 V per leg.)", fix: "Clean/tighten cables; rebuild or replace starter", urgency: "medium", ride: "Do not ride until it cranks normally." , part: "starter", source: "Sportster 1986-2003 Troubleshooting Manual, Starter stalls or spins too slowly (PDF p. 7); Clymer p. 47 for the per-leg figure." },
        { cause: "Jackshaft worn or mismatched — starter spins but won't engage", weight: 10, test: "Starter spins fast / clicks then spins free without turning the engine; check jackshaft binding, sticking, alignment, and starter-shaft length vs the outer primary cover (H-D shaft 31482-70 is ~1/4 in longer than the one it replaces)", fix: "Realign / tighten the jackshaft assembly or replace it; fit the correct-length starter shaft for the cover", urgency: "high", ride: "Do not ride until it cranks reliably.", part: "starter", source: "NOT an FSM cause — Easyriders ER_305 §18; starter table ER_295 §139." },
        { cause: "Vacuum petcock valve not opening (1995–2003 Sportster)", weight: 5, test: "Bench test with a hand vacuum pump and a drain hose to a gas can: apply 25 in. (635 mm) Hg of vacuum — fuel must flow with the lever on AND on reserve, and stop flowing when the vacuum is released; repeat 5 times. Never exceed the specified vacuum or the diaphragm is damaged. Also check the vacuum hose from the carb to the valve diaphragm is intact and connected.", fix: "Refit/replace the hose or valve; replace the valve if it fails the bench test", urgency: "medium", ride: "Do not ride until it runs.", source: "Sportster 1986-2003 Troubleshooting Manual, Fuel shutoff (vacuum) valve test (PDF pp. 56–57)." },
        { cause: "Advance weights stuck at full advance — slow, sluggish cranking / kickback", weight: 5, test: "Slow sluggish cranking or kickback; check that the mechanical advance weights move freely and are lubricated with light oil", fix: "Free and lubricate the advance weights; replace worn parts", urgency: "medium", ride: "Do not ride until it cranks normally.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF pp. 49–50. Distinct from the worn advance mechanism (ER_166 §69) — this is stuck, not worn." },
        { cause: "Petcock filter screens blocked by rust after storage — fuel starvation", weight: 5, test: "Bike sat parked for weeks or months (winter storage) and acts fuel-starved — runs then dies, or cranks without firing; drain the tank, pull the petcock and inspect the filter screens inside the tank for rust flakes", fix: "Clean or replace the petcock filter screens; replace hard or cracked fuel lines; reseal threads with Teflon tape", urgency: "medium", ride: "Do not ride until it runs.", source: "NOT an FSM cause — Easyriders Tech Tips Vol. 2, §16 (Gary's Fix-It Forum: petcock filter)." },
        { cause: "Seized engine — piston, crankshaft bearings, or broken connecting rod", weight: 5, test: "Starter, solenoid and battery all test good and the engine still will not turn over at all — seized piston(s), seized crankshaft bearings, or a broken connecting rod", fix: "Engine teardown — shop job", urgency: "critical", ride: "Do not ride — engine teardown.", source: "Sportster 1986-2003 Troubleshooting Manual, Engine Will Not Crank (PDF p. 3), items 11–13" }
      ]
    },
    {
      id: "charging",
      system: "Charging",
      title: "Battery goes dead / charging fault",
      steps: [
        { q: "With the engine at 3,600 rpm, is voltage at the battery 14.3-14.7V?", yes: "next", no: "charging", note: "14.3-14.7V @ 3600 rpm is the factory spec. Below it = charging fault; above it = regulator fault.", cite: "FSM #99482-98 section 8" },
        { q: "Does the battery run down during use (not just sitting)?", yes: "draw", no: "next", note: "Runs down in use = charging or a parasitic draw. Runs down sitting = self-discharge or a draw.", cite: "FSM #99482-98 section 8, p. 8-338" },
        { q: "Stator test: 16-20 VAC per 1,000 rpm across stator leads, 0.1-0.2 ohm lead-to-lead?", yes: "regulator", no: "stator", note: "Stator out of range = stator. Stator good + voltage wrong = regulator.", cite: "FSM #99482-98 section 8" },
        { q: "Stator output low — is there continuity from either stator socket to the crankcase?", yes: "grounded", no: "next", note: "Any continuity to the case = grounded stator. Also check the stator wires where the clamp plate holds them — the plate can rub through the insulation (1991–2003 Sportster).", cite: "Easyriders ER_297 §131; sportster-86-03-trouble p. 13" },
        { q: "Does it sputter, cough, pop and backfire like a carb fault — but the carb checks out?", yes: "masquerade", no: "next", note: "A dying charging system starves the ignition as voltage dips — an electrical gremlin dressed as a carb fault. Check battery voltage and grounds first.", cite: "Easyriders ER_298 §146 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Voltage regulator failed", weight: 35, test: "Stator good (16-20 VAC/1000 rpm, 0.1-0.2 ohm) but battery voltage out of 14.3-14.7V", fix: "Replace regulator (74519-88A Big Twin 32A; 74523-94A Sportster)", urgency: "high", ride: "Do not ride far - a dead battery strands you, an overcharging one cooks it." , part: "regulator" },
        { cause: "Stator failed", weight: 30, test: "Stator output under 16 VAC/1000 rpm or resistance out of 0.1-0.2 ohm", fix: "Replace stator (29970-88C Big Twin 32A; 29967-89C Sportster 22A)", urgency: "high", ride: "Do not ride far - battery will drain." , part: "stator" },
        { cause: "Parasitic draw", weight: 10, test: "Ammeter between the negative terminal and the cable, ignition off: over 3 mA (no clock/radio) or 15 mA (1988-up with radio/CB) = a drain to chase (FSM section 8, p. 8-340; Easyriders ER_297 §132)", fix: "Find the circuit drawing current; isolate accessories", urgency: "medium", ride: "Rideable if the battery holds a charge for the ride." },
        { cause: "Battery itself failed", weight: 10, test: "Load-test after a full charge", fix: "Replace 12V 18Ah", urgency: "medium", ride: "Do not ride until it holds a charge." , part: "battery" },
        { cause: "Stator grounded or wires chafed at the clamp plate", weight: 10, test: "Ohmmeter Rx1: either stator socket to crankcase ground — no continuity allowed; inspect stator wires at the flat metal clamp plate for rub-through (1991–2003 Sportster)", fix: "Replace a grounded stator; re-route / protect chafed wires", urgency: "high", ride: "Do not ride far - battery will drain.", part: "stator", source: "Easyriders ER_297 §131 (ground test, same as FSM #99482-98 p. 341); chafing: sportster-86-03-trouble p. 13." },
        { cause: "Charging decline masquerading as a carb fault", weight: 5, test: "Sputters/coughs/pops/backfires with a carb that checks out; rev the engine — does the headlight brighten? Multimeter on the battery — is it getting charge?", fix: "Fix the charging fault (bad battery ground or shorted/fried wire first); the carb was never the problem", urgency: "medium", ride: "Rideable short distance; fix soon.", source: "NOT an FSM cause — Easyriders ER_298 §146." }
      ]
    },
    {
      id: "ignition-misfire",
      system: "Ignition / electrical",
      title: "Misfire / missing / hard starting when hot",
      steps: [
        { q: "Does it miss at all speeds, or only when hot?", yes: "hot", no: "next", note: "Hot-only missing points at coil or ignition module breaking down with heat.", cite: "FSM #99482-98 section 8, p. 8-321" },
        { q: "Are the plugs the right ones, gapped 0.038-0.043 in (5R6A)?", yes: "next", no: "plugs", note: "Wrong plug or wrong gap is the cheapest fix in the book. Check it first.", cite: "FSM #99482-98 section 8" },
        { q: "Is timing 20 deg BTDC at idle?", yes: "next", no: "timing", note: "20 deg BTDC. See Ignition Timing Helper for the full procedure.", cite: "FSM #99482-98; Dynatek Dyna 2000i instructions" },
        { q: "Does the VOES close at 3.5-4.5 inHg?", yes: "next", no: "voes", note: "VOES stuck open = retarded timing under load; stuck closed = advance when it should retard.", cite: "FSM #99482-98 section 8" },
        { q: "Does it backfire through the carb, especially at full advance?", yes: "spare", no: "next", note: "Stock dual-fire ignitions fire both plugs at once — at full advance the rear cylinder gets a spare spark with its intake valve open. Single-fire reduces this.", cite: "Easyriders ER_217 §32–§33 (not an FSM cause)" },
        { q: "Dyna ignition, ~2 years old: cold-start flooding and fouled plugs that clear in minutes, then runs fine?", yes: "trigger", no: "next", note: "An aging Dyna trigger plate needs more battery voltage to operate. A new trigger plate fixed it.", cite: "Easyriders ER_246 §161 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Worn or wrong plugs / gap", weight: 25, test: "Plug condition + gap 0.038-0.043 in, 5R6A", fix: "Replace plugs, set gap", urgency: "low", ride: "Rideable; fix soon." , part: "plugs" },
        { cause: "Coil breaking down", weight: 20, test: "Coil primary 2.5-3.1 ohm stock (2.5-3.5 ohm with Dyna 2000i); swap in a known-good coil as the FSM directs. Clymer: test cold AND hot — a coil that passes cold can fail hot (blow-dryer trick, clymer pp. 62, 459)", fix: "Replace coil", urgency: "medium", ride: "Rideable short distance; a failing coil strands you." , part: "coil" },
        { cause: "VOES faulty", weight: 20, test: "Vacuum pump + hand vacuum: VOES must read 0 ohm at 3.5-4.5 inHg (89-114 mmHg); outside range = replace. On-bike strobe check: over 3,500 rpm for full advance; retard check at 700-800 rpm with the VOES hose off and the manifold fitting plugged (sportster-86-03 p. 412; Easyriders ER_233 §106)", fix: "Replace VOES (26557-83 / 26566-91 / 26566-96 by model)", urgency: "medium", ride: "Rideable; performance and mileage suffer." , part: "voes" },
        { cause: "Timing off / ignition module", weight: 10, test: "Timing light: 20 deg BTDC; module trouble codes 52/54/55 (Sportster)", fix: "Reset timing; see Ignition Timing Helper", urgency: "medium", ride: "Rideable if it runs; detonation under load means stop." , part: "ignition-module" },
        { cause: "Plug wires / insulation", weight: 10, test: "Inspect cables; spray water at night and watch for arcing; check cable resistance by length (Clymer p. 460)", fix: "Replace cables", urgency: "low", ride: "Rideable." , part: "plug-wires" },
        { cause: "Dual-fire spare spark lights the rear cylinder (backfire through carb)", weight: 10, test: "Backfire through the carb at full advance; Evo fires ~35° BTDC fully advanced near 5,200 rpm (magazine figure)", fix: "Single-fire ignition reduces the spare-spark backfire and runs better below 3,000 rpm", urgency: "low", ride: "Rideable.", part: "ignition-module", source: "NOT an FSM cause — Easyriders ER_217 §32–§33. The 35° figure is magazine-stated; no FSM match found." },
        { cause: "Aging Dyna trigger plate — needs more battery voltage (aftermarket)", weight: 5, test: "Cold-start flooding / fouled plugs that clear in minutes and then run fine; battery voltage marginal on an older Dyna", fix: "Replace the Dyna trigger plate", urgency: "low", ride: "Rideable once warm.", part: "ignition-module", source: "NOT an FSM cause — Easyriders ER_246 §161 (aftermarket Dyna, 1979 Low Rider case)." }
      ]
    },
    {
      id: "brakes",
      system: "Brakes",
      title: "Brake fault / soft lever / leak",
      steps: [
        { q: "Is there fluid leaking anywhere (caliper, master, reservoir, lines)?", yes: "leak", no: "next", note: "Evo brakes take DOT 5 silicone ONLY. A weeping rear reservoir is a live case on the Fat Boy.", cite: "FSM #99482-98; 1984-1999 Softail Repair Manual" },
        { q: "Is the lever/pedal soft or spongy?", yes: "air", no: "next", note: "Spongy = air in the lines or a failing master cylinder seal.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Are the pads at or under 1/16 in?", yes: "pads", no: "next", note: "Pads at 1/16 in are done. One pad set (44063-83C/D) fits all XL/FX/FL 1984-99 per factory bulletin P-20 - but pre-1992 pads must not be used with 1992 stainless rotors.", cite: "Factory bulletin P-20, Nov 18 1991" },
        { q: "Is the lever spongy no matter how much you bleed it — and are the hoses old rubber?", yes: "hose", no: "next", note: "Old neoprene hoses balloon under 500–1,500 psi line pressure. The permanent cure is braided stainless Teflon-lined hose.", cite: "Easyriders ER_226 §41 (not an FSM cause)" },
        { q: "Do the brakes fade or 'leave town' when hot?", yes: "aerate", no: "next", note: "DOT 5 can aerate; under heat the bubbles merge into one bubble. Never mix grades.", cite: "Easyriders ER_197 §119 (not an FSM cause)" },
        { q: "Is the lever travel excessive even after bleeding — and does it pump up with a second squeeze?", yes: "knockback", no: "next", note: "Rotor runout pushes the caliper piston back into its bore (knock-back), so the lever must travel further. Also check wheel-bearing end play.", cite: "Easyriders Tips Vol. 3, PDF pp. 79–80 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Leak (reservoir, line, caliper seal)", weight: 20, test: "Clean everything dry, pump the brake, watch where fluid appears", fix: "Replace the failed seal/line; refill DOT 5 only; bleed", urgency: "critical", ride: "DO NOT RIDE with a brake leak." , part: ["brake-line", "caliper", "master-cyl"] },
        { cause: "Air in the system", weight: 25, test: "Bleed: firm lever after bleeding = air was the fault", fix: "Bleed with DOT 5; bleeder valve 80-100 in-lbs", urgency: "critical", ride: "DO NOT RIDE with a soft lever." , part: "dot5-fluid" },
        { cause: "Pads worn out", weight: 20, test: "Pad thickness 1/16 in or less", fix: "Replace pads 44063-83C/D; check rotor", urgency: "high", ride: "Do not ride on worn pads - metal on rotor." , part: "pads" },
        { cause: "Master cylinder seal", weight: 10, test: "Lever slowly sinks under steady pressure", fix: "Rebuild master cylinder", urgency: "critical", ride: "DO NOT RIDE - the lever will sink when you need it." , part: "master-cyl" },
        { cause: "Old rubber brake hose swelling under pressure", weight: 10, test: "Lever spongy no matter how much you bleed; hoses are old neoprene (fluid runs 300–325°F)", fix: "Replace neoprene hoses with braided stainless Teflon-lined hose", urgency: "high", ride: "Do not ride far with a spongy lever.", part: "brake-line", source: "NOT an FSM cause — Easyriders ER_226 §41." },
        { cause: "DOT 5 fluid aerating when hot", weight: 10, test: "Brakes fade or disappear when hot; fluid aerates and bubbles merge under heat", fix: "Flush and refill with fresh DOT 5 from a sealed container; never mix grades", urgency: "critical", ride: "DO NOT RIDE with fading brakes.", part: "dot5-fluid", source: "NOT an FSM cause — Easyriders ER_197 §119." },
        { cause: "Rotor runout — knock-back, excessive lever travel", weight: 5, test: "Excessive lever travel after bleeding; check rotor lateral runout — the article quotes a maximum of .004 in (H-D figure, '72–'80 Banana-caliper article; NOT verified as an Evo FSM spec — check your manual); also check wheel-bearing end play", fix: "Correct rotor runout; replace a warped rotor", urgency: "high", ride: "Do not ride far with excessive lever travel.", part: "disc", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF pp. 79–80. The .004 in figure is magazine-quoted, not an Evo FSM spec." }
      ]
    },
    {
      id: "primary-drive",
      system: "Primary / drive",
      title: "Primary noise / clutch / drive fault",
      steps: [
        { q: "Is the noise a rattle that changes with engine speed at idle?", yes: "chain", no: "next", note: "Primary chain noise follows engine speed. Belt/drive noise follows road speed.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Does the clutch slip under load or drag when disengaged?", yes: "clutch", no: "next", note: "Slip = worn plates or weak springs. Drag = adjustment or warped plates.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Is the drive belt cracked, frayed, or missing teeth?", yes: "belt", no: "next", note: "Belt deflection 3/8-1/2 in. A frayed belt is a roadside failure waiting to happen.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Is there a rattle from the primary — and is the chain tensioner shoe cocked over?", yes: "anchor", no: "next", note: "The two tapered anchor-plate bolts (H-D #1783) on the inner primary loosen; the shoe cocks over and the bolt chews up. First sign is a weird primary noise.", cite: "Easyriders ER_305 §133–§134 (not an FSM cause)" },
        { q: "Is primary fluid leaking even though the cover gasket is good?", yes: "solenoid", no: "next", note: "Fluid gets past the foam gasket/seal on the starter solenoid — even with the cover sealed.", cite: "Easyriders ER_310 §38 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Primary chain loose or worn", weight: 35, test: "Chain deflection check; adjust to spec. If the chain is beyond the tensioner's adjusting capability (even with an M6 tensioner fitted) it slaps the inner primary — replace the chain (Easyriders ER_310 §39)", fix: "Adjust or replace chain; check shoe", urgency: "medium", ride: "Rideable short distance; a loose chain eats the case." , part: ["primary-chain", "primary-shoe"] },
        { cause: "Clutch plates/springs", weight: 25, test: "Slip test under load; drag test at a stop", fix: "Replace plates/springs; adjust cable", urgency: "medium", ride: "Rideable if it is not slipping badly." , part: "clutch" },
        { cause: "Drive belt worn", weight: 15, test: "Visual: cracks, fraying, missing teeth; deflection 3/8-1/2 in", fix: "Replace belt", urgency: "high", ride: "Do not ride far on a frayed belt." , part: "belt" },
        { cause: "Compensator / starter drive noise", weight: 10, test: "Noise on start/stop vs running", fix: "Inspect compensator", urgency: "medium", ride: "Rideable; get it checked." },
        { cause: "Inner-primary anchor-plate bolts loosening (H-D #1783)", weight: 10, test: "Rattle from the primary; tensioner shoe cocked over; bolt chewed up or nearly off", fix: "Re-tap 5/16×18, fit 1-1/2 in grade-8 (or better) bolts with red Loctite, spin nuts onto the threads protruding from the back of the inner primary so they can't back out", urgency: "high", ride: "Do not ride far — a loose bolt can punch through the derby cover and dump the primary oil.", part: "primary-shoe", source: "NOT an FSM cause — Easyriders ER_305 §133–§134 (the 'Double Nut' tip)." },
        { cause: "Primary fluid leaking past the starter-solenoid seal", weight: 5, test: "Primary leaks with a good cover gasket (even sealed with Hylomar); fluid on the chain and frame near the solenoid", fix: "Make a cork gasket or fit an O-ring on the solenoid", urgency: "medium", ride: "Rideable if the level holds — check it often.", part: "primary-chain", source: "NOT an FSM cause — Easyriders ER_310 §38." }
      ]
    },
    {
      id: "engine-noise",
      system: "Engine",
      title: "Engine noise (tick, knock, slap)",
      steps: [
        { q: "Is the noise a tick at about half engine speed?", yes: "lifter", no: "next", note: "Half engine speed = valvetrain (lifter tick). Once per rev = bottom end. The app ranks by sound; it never declares a verdict from sound alone.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Does it get worse under load?", yes: "knock", no: "next", note: "Worse under load + low oil pressure = stop and check oil pressure first.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Is oil pressure in spec and oil level correct?", yes: "next", no: "oil", note: "Check oil before anything else. A knock with no oil pressure is a stop-right-now fault.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Is it a lifter tick that never quiets down after a couple of minutes?", yes: "screen", no: "next", note: "A clogged tappet screen in the oil gallery starves the lifters — they won't pump up. Check it every oil change.", cite: "Easyriders ER_301 §147; FSM #99482-98 p. 151" },
        { q: "Is it a hiss rather than a tick or knock?", yes: "hiss", no: "next", note: "Hiss checklist (1995 FLSTC): gas cap venting, primary chain too tight, crankcase vents pinched in the air-filter housing, belt rubbing guards, tire rubbing the splash shield.", cite: "Easyriders ER_266 §45 (not an FSM cause)" },
        { q: "Did the clatter start right after an oil change or service?", yes: "crimped", no: "next", note: "A feed line crimped during service cuts off oil flow to the top end. Check the line from the pump before tearing into the top end.", cite: "Easyriders Tips Vol. 3, PDF p. 30 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Lifter tick", weight: 25, test: "Half engine speed; check lifter bleed-down and oil", fix: "Oil change; lifter replacement if it persists", urgency: "low", ride: "Rideable; monitor it." , part: "lifters" },
        { cause: "Rod knock (worse under load)", weight: 25, test: "Oil pressure check FIRST, then listen under load", fix: "Shop job - bottom end", urgency: "critical", ride: "DO NOT RIDE if oil pressure is low or the knock is heavy." },
        { cause: "Piston slap (worse cold, fades warm)", weight: 15, test: "Noise fades as the engine warms", fix: "Monitor; shop job if it gets worse", urgency: "medium", ride: "Rideable; keep an ear on it." },
        { cause: "Exhaust leak (tick that sounds like a lifter)", weight: 15, test: "Feel for pulsing air at the exhaust flanges; soapy water bubbles", fix: "Replace exhaust gaskets; torque flanges", urgency: "low", ride: "Rideable." , part: "exhaust-gaskets" },
        { cause: "Clogged tappet screen — tick that never quiets", weight: 10, test: "Tick that never quiets after a couple of minutes; check the tappet screen in the oil gallery (install spring in place, closed end up) + oil level and return circulation", fix: "Clean the screen every oil change; check oil return", urgency: "medium", ride: "Rideable; fix soon.", part: "lifters", source: "Easyriders ER_301 §147; FSM #99482-98 p. 151 lists a plugged lifter screen as a low-oil-pressure cause — the screen itself is real, the tip is magazine." },
        { cause: "Hiss from belt rub, pinched vent, or cap venting", weight: 5, test: "Hissing noise: check gas cap venting, primary chain tension, crankcase vents pinched inside the air-filter housing, belt rubbing guards/pulley, tire rubbing splash shield", fix: "Fix whichever item hisses", urgency: "low", ride: "Rideable.", part: "belt", source: "NOT an FSM cause — Easyriders ER_266 §45 (1995 FLSTC case)." },
        { cause: "Oil feed line crimped after service — top-end starved, clatter", weight: 5, test: "Clatter starts right after service; check the oil-pump feed line for a crimp and confirm oil is reaching the top end", fix: "Replace the crimped line; confirm oil flow before riding", urgency: "high", ride: "Do not ride with a starved top end.", part: "crankcase", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 30." }
      ]
    },
    {
      id: "wheels-tires",
      system: "Suspension / wheels / tires",
      title: "Tires / wheels / handling",
      steps: [
        { q: "Are the tires at the factory pressures? (FLSTC/FLSTF/FLSTS: 36/36 solo, 36/40 two-up. FXSTC/FXSTS/FXSTSB: 30/36 solo, 30/40 two-up. Dunlop, cold.)", yes: "next", no: "pressure", note: "Wrong pressure is the cheapest handling fix there is. Never exceed the sidewall maximum.", cite: "FSM #99482-98 section 2, p. 2-2" },
        { q: "Read the DOT date code (last four digits of the TIN = week/year). Is the tire over 10 years old?", yes: "age", no: "next", note: "Michelin + Dunlop rule: professional inspection after 5 years of use, replace at 10 years from manufacture.", cite: "Michelin/Dunlop guidance; 49 CFR 574.5" },
        { q: "Is there uneven wear, cupping, or cracking?", yes: "wear", no: "next", note: "Uneven wear = pressure, balance, or bearings. Cupping = suspension or balance.", cite: "1984-1999 Softail Repair Manual" },
        { q: "At speed, does the front end wobble — and with the front wheel off the ground, does the front end rattle fore-aft?", yes: "steering", no: "next", note: "Poorly adjusted steering-head bearings are the most common wobble cause. Fall-away test: wheel straight, push it aside — it should start falling after ~2 inches.", cite: "Easyriders ER_205 §36 (not an FSM cause)" },
        { q: "Is the fork oil wrong, or is it leaking from the top-clamp bolt?", yes: "forkoil", no: "next", note: "Evo forks want 5–20 weight; volume matters as much as weight. The top-clamp bolt has NO O-ring and is the most common fork-leak source.", cite: "Easyriders ER_205 §37–§38 (not an FSM cause)" },
        { q: "Spoked wheel: tap each spoke — do they ring at different pitches, or are some dead?", yes: "spoke", no: "next", note: "A spoke rings when tapped; pitch = tension. A big pitch difference after truing means a bent rim. Check spoke tightness every ~5,000 miles (magazine interval).", cite: "Easyriders Tips Vol. 3, PDF p. 73 (not an FSM cause)" },
        { q: "Does it behave one way turning left and another turning right — worse with speed?", yes: "track", no: "next", note: "Even a slight difference in the track of the two wheels affects steering; the difference grows with speed.", cite: "Easyriders Tips Vol. 3, PDF p. 64 (not an FSM cause)" },
        { q: "Does it wobble or weave at high speed even with the pressures right and the steering head tight?", yes: "weave", no: "next", note: "Choose the wrong tire and you'll have a wobble or weave at high speed. Too little air also makes a bike wobble — check pressure first (step 1).", cite: "Easyriders Tech Tips Vol. 2, §97–§98 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Wrong tire pressure", weight: 30, test: "Gauge reading cold vs the table above; replace when the wear bar is flush with the tread or tread depth equals the width of two new nickels (Easyriders ER_150 §36)", fix: "Set to factory pressure", urgency: "medium", ride: "Rideable once pressures are set." },
        { cause: "Tire age (10+ years)", weight: 20, test: "DOT date code", fix: "Replace the tire", urgency: "high", ride: "Do not ride far on a 10-year-old tire." },
        { cause: "Wheel bearings / balance", weight: 15, test: "Wheel play check; bearings every 10,000 mi — and annually / prior to storage (FSM §1 Scheduled Service Table, p. 1-35, (*) footnote)", fix: "Replace bearings (9052, two per wheel)", urgency: "medium", ride: "Rideable short distance; get it checked." , part: "wheel-bearing" },
        { cause: "Suspension (fork seals, shocks)", weight: 5, test: "Fork oil leaks; shock damping test", fix: "Seals / shocks", urgency: "low", ride: "Rideable." , part: ["fork", "shocks"] },
        { cause: "Steering-head loose / worn — wobble", weight: 10, test: "Front wheel off the ground: grab the lower fork legs, push/pull fore-aft — rattle or click = loose bearings; fall-away test (should start falling after ~2 in); falls after the first inch = too loose; sticks at 3 in = too tight; tight AND loose spots as you swing = dented/worn bearings, replace (Easyriders Tips Vol. 3, PDF p. 75)", fix: "Adjust / replace steering-head bearings; use light chassis grease, not heavy wheel-bearing grease", urgency: "high", ride: "Do not ride fast with a wobble.", part: "fork", source: "NOT an FSM cause — Easyriders ER_205 §36." },
        { cause: "Fork oil level/weight wrong, or leak at the top-clamp bolt", weight: 5, test: "Harsh ride (too heavy / too much oil) or loose front end (too light / too little); leak at the top-clamp bolt; new seals leak again if the tube has nicks — stone them out with 400-grit first (Easyriders Tips Vol. 3, PDF p. 76)", fix: "Set oil to 5–20 weight and correct volume (change ~every 10,000 mi — and annually / prior to storage per the FSM (*) footnote, FSM #99482-98 §1 Scheduled Service Table, p. 1-36); a garden-hose washer under the top bolt seals the O-ring-less clamp bolt", urgency: "low", ride: "Rideable.", part: "fork", source: "NOT an FSM cause — Easyriders ER_205 §37–§38. Annual leg is factory: FSM #99482-98 §1 Scheduled Service Table, p. 1-36 (*)." },
        { cause: "Loose spokes — crooked wheel, instability", weight: 5, test: "Tap each spoke with a small tool: pitch = tension; a big pitch difference after truing means a bent rim", fix: "True the wheel and tension the spokes; replace a bent rim", urgency: "high", ride: "Do not ride fast on loose spokes.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 73." },
        { cause: "Wheels not on the same track — asymmetric handling", weight: 5, test: "Behaves one way turning left, another turning right, worse with speed; check front/rear wheel alignment", fix: "Align the wheels to the same track", urgency: "medium", ride: "Rideable carefully; fix soon.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 64." },
        { cause: "Wrong tire for the bike — high-speed wobble / weave", weight: 5, test: "Wobble or weave shows up at high speed with pressures right and the steering head tight; tire construction wrong for the bike — a stiff heavy-touring tire on a rigid, or a mismatched set", fix: "Fit premium tires suited to the bike; ask other riders what works on the same model", urgency: "medium", ride: "Rideable carefully; fix soon — a high-speed weave is not a shrug.", source: "NOT an FSM cause — Easyriders Tech Tips Vol. 2, §97–§98 (tire choice; wobble or weave at high speed)." }
      ]
    },
    {
      id: "oil-leak",
      system: "Oil / lubrication",
      title: "Oil leak / low oil pressure",
      steps: [
        { q: "Is the oil level low at the tank? (Oil tank 3.0 qt with filter.)", yes: "oil-level", no: "next", note: "Check level with the bike upright and warm, per the manual. Low oil starves the pump.", cite: "FSM #99482-98 section 2" },
        { q: "Is there fresh oil at the rocker boxes, pushrod tubes, or the cases?", yes: "leak", no: "next", note: "Clean everything dry, run it, watch where oil appears. The leak shows itself.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Is the oil pressure light on, or a gauge reading under 12 psi at 2,000 rpm? (Spec 12-35 psi at 2,000 rpm.)", yes: "pressure", no: "next", note: "Low oil pressure with a knock is a stop-right-now fault.", cite: "FSM #99482-98" },
        { q: "Does it puke oil out the breather at startup?", yes: "wetsump", no: "next", note: "Wet-sumping: oil drains into the crankcase while sitting, reads 2 qt low, you top off — now 6 qt in a 4 qt system.", cite: "Easyriders ER_224 §112–§113 (not an FSM cause)" },
        { q: "Is oil disappearing with no smoke, no leaks, and no fouled plugs?", yes: "vanish", no: "next", note: "Oil can seep past the sprocket-shaft seal into the primary, leak past head gaskets into the cylinders, or get pushed into the air cleaner by the breather.", cite: "Easyriders ER_221 §122 (not an FSM cause)" },
        { q: "Does the engine spew oil everywhere — not just a breather puke at startup — with the level confirmed right?", yes: "breather", no: "next", note: "Wrong oil-breather timing makes the engine spew oil everywhere. This is a build/assembly fault, not a level problem.", cite: "Easyriders Tips Vol. 3, PDF p. 45 (not an FSM cause)" },
        { q: "Shut it off, open a pushrod tube — does a flood of oil come out?", yes: "drain", no: "next", note: "Top-end oil returns partly down the pushrod tubes; if the drain holes in the tappet guides are blocked, the tube fills and no seal can last.", cite: "Easyriders Tips Vol. 3, PDF pp. 25–26 (not an FSM cause)" },
        { q: "Is oil weeping from under a tappet-guide screw head?", yes: "spotface", no: "next", note: "On late Big Twins, if the screw spotface isn't flat the head can't seal; crankcase pressure forces oil vapor up the threads.", cite: "Easyriders Tips Vol. 3, PDF p. 25 (not an FSM cause)" },
        { q: "Is oil leaking at the cylinder base — or is the cylinder cracked — with no other source found?", yes: "basenuts", no: "next", note: "Loose base nuts are blamed for mysterious catastrophic failures; oil leaks or a cracked cylinder are the mild outcome. Torque values in the article are pre-Evo — use the FSM figure for your year.", cite: "Easyriders Tips Vol. 3, PDF p. 93 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Low oil level", weight: 20, test: "Level at the tank (3.0 qt with filter)", fix: "Top up; find out why it was low", urgency: "medium", ride: "Rideable once the level is right — find the loss." },
        { cause: "Oil leak — rocker, pushrod, or case gaskets", weight: 20, test: "Clean dry, run, watch where oil appears", fix: "Replace the failed gasket", urgency: "medium", ride: "Rideable if the level holds — check it often." , part: ["heads", "crankcase"] },
        { cause: "Low oil pressure", weight: 15, test: "Gauge reading: 12-35 psi at 2,000 rpm. Low pressure is often NOT a bad pump — stuck pressure-regulator piston in the oil pump, or high crankcase vacuum / loose rocker bushings / loose lifters (Easyriders ER_259 §42–§43; ER_227 §95). Take readings at the pump, not the tappet screen.", fix: "Oil pump / pressure relief valve — shop job if it is the pump", urgency: "critical", ride: "DO NOT RIDE with low oil pressure." },
        { cause: "Oil pressure switch faulty", weight: 10, test: "Switch under the oil filter boss — test with a gauge, not just the light", fix: "Replace the switch", urgency: "low", ride: "Rideable once a gauge confirms real pressure." },
        { cause: "Wet-sumping — overfilled / oil drained to crankcase, pukes from breather", weight: 10, test: "Oil puking from the breather at startup; tank reads low after sitting but the crankcase is full", fix: "Drain 1 qt from the tank, ride a few miles, let the scavenge pump bring oil back up; repeat until stable. Check the feed-side check ball for dirt/damage. Check-ball seal, loose idler-gear shaft, or pump drive-shaft seal can also let oil drain down (Easyriders Tips Vol. 3, PDF pp. 6–8).", urgency: "medium", ride: "Rideable once the level is right.", part: "crankcase", source: "NOT an FSM cause — Easyriders ER_224 §112–§113." },
        { cause: "Oil vanishing — seeping into primary or air cleaner", weight: 5, test: "Oil level drops with no smoke, no drips, clean plugs; check the primary (sprocket-shaft main-bearing seal), head gaskets, and the stock breather to the air cleaner", fix: "Replace the failed seal/gasket; re-route the breather if it is pushing oil into the cleaner", urgency: "medium", ride: "Rideable if the level holds — check it often.", part: "crankcase", source: "NOT an FSM cause — Easyriders ER_221 §122." },
        { cause: "Breather timing wrong — engine spews oil everywhere", weight: 5, test: "Oil spewing everywhere with the level right; breather timing checked against the manual", fix: "Set breather timing per the manual — shop job if the cases have to open", urgency: "high", ride: "Do not ride far — it will dump oil.", part: "crankcase", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 45." },
        { cause: "Pushrod-tube drain passage blocked — tube floods with oil", weight: 5, test: "Shut off, open a pushrod tube — a flood of oil comes out; check the drain holes in the tappet guides", fix: "Clear the drain holes so top-end oil can return past the tappets to the cam-gear cavity", urgency: "medium", ride: "Rideable; fix soon.", part: "crankcase", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF pp. 25–26." },
        { cause: "Tappet-guide screw spotface not flat — oil forced up the threads", weight: 5, test: "Oil weeping from under a tappet-guide screw head; spotface not flat (chrome plating can polish it away)", fix: "Fit a seal washer under each screw head; true the spotface flat", urgency: "medium", ride: "Rideable; fix soon.", part: "crankcase", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 25. No part number shipped — see the manual." },
        { cause: "Cylinder base nuts loose — oil leak / cracked cylinder", weight: 5, test: "Oil leaking at the cylinder base, or a cracked cylinder, with no other source; check base-nut torque per the FSM", fix: "Torque base nuts to the FSM figure for your year", urgency: "high", ride: "Do not ride far — a loose base can crack the cylinder.", part: "crankcase", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 93. Article torque values are pre-Evo and are NOT shipped." }
      ]
    },
    {
      id: "clutch",
      system: "Primary / clutch",
      title: "Clutch slip / drag / adjustment",
      steps: [
        { q: "Does the clutch slip under load — revs rise but speed does not?", yes: "clutch", no: "next", note: "Slip = worn plates or weak springs.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Does it drag — hard to find neutral, or the bike creeps in gear with the lever pulled?", yes: "drag", no: "next", note: "Drag = adjustment or warped plates.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Is clutch lever free play outside 1/16-1/8 in?", yes: "cable", no: "next", note: "Free play is measured at the lever. Out of range = adjust before replacing anything.", cite: "FSM #99482-98 p. 272" },
        { q: "Is the lever hard to pull halfway through — or does the clutch slip with a good cable?", yes: "dished", no: "next", note: "The diaphragm spring must sit flat (within .010 in of a straightedge). A/B/C adjuster-plate holes set how much it is compressed.", cite: "Easyriders ER_167 §71 (not an FSM cause)" },
        { q: "Does it grind going into first, creep in gear, or refuse neutral at a stop?", yes: "gummed", no: "next", note: "Oil vapor + clutch dust form a black gum that glues plates together; too much grease on the hub rollers does the same.", cite: "Easyriders ER_258 §41 (not an FSM cause)" },
        { q: "With the pushrod and cable adjusted, pull the clutch lever and watch the pressure plate lift. Does it tilt as it lifts instead of coming off the pack squarely?", yes: "pushrod", no: "next", note: "A wobbly spring retainer doesn't matter as long as the plate runs straight when released — but a tilting plate drags. Grooves worn in the pushrod where it rides in the mainshaft bushings let it fall off-center.", cite: "Easyriders Tech Tips Vol. 4, §79–§80 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Worn clutch plates / springs", weight: 30, test: "Slip test under load", fix: "Replace plates/springs; primary cover screws 108-120 in-lbs", urgency: "medium", ride: "Rideable if it is not slipping badly." , part: "clutch" },
        { cause: "Clutch drag — adjustment or warped plates", weight: 25, test: "Free play 1/16-1/8 in at the lever; drag test at a stop. Drag sources: warped plates (pressure plate lifts only ~1/8 in), over-tight primary chain pulling the basket off-center, oil too thick (STP locks the clutch solid) — Easyriders ER_167 §69", fix: "Adjust cable and clutch pack; replace warped plates", urgency: "medium", ride: "Rideable; fix before it gets worse." , part: "clutch" },
        { cause: "Cable / adjustment", weight: 20, test: "Free play 1/16-1/8 in", fix: "Adjust the cable", urgency: "low", ride: "Rideable." },
        { cause: "Primary oil wrong or low", weight: 5, test: "Primary oil level — 1997: 32 oz, 1998: 26 oz", fix: "Correct oil and level", urgency: "low", ride: "Rideable." },
        { cause: "Diaphragm spring dished — wrong A/B/C holes, spring not flat", weight: 10, test: "Lever hard halfway through, or slip; straightedge across the spring — no more than .010 in gap or it slips; 'C' holes compress least, 'B' most", fix: "Pick the holes that leave the spring flat; back the adjuster screw out 3/4 turn, locknut; convex side of the diaphragm must face out (Easyriders Tips Vol. 3, PDF p. 48)", urgency: "medium", ride: "Rideable; fix soon.", part: "clutch", source: "NOT an FSM cause — Easyriders ER_167 §71. 3/4 turn sits inside the FSM 1/2–1 turn range." },
        { cause: "Plates gummed together — creep, grind into first, no neutral", weight: 5, test: "Grinds neutral to first, can't find neutral stopped, bike creeps/bumps forward in gear; black gum streaks on the steel plates", fix: "Clean plates with non-oily solvent (brake/contact cleaner, lacquer thinner); lightly sand 120–180 grit; never soak linings (they swell), never water (rust); repeat every 5,000 miles", urgency: "medium", ride: "Rideable; fix soon.", part: "clutch", source: "NOT an FSM cause — Easyriders ER_258 §41." },
        { cause: "Pressure plate lifts uneven — release pushrod grooved or unsupported, mainshaft bent", weight: 5, test: "With the pushrod and cable adjusted, pull the lever and watch the pressure plate lift: it must come off the pack squarely. If it tilts, adjust the spring retainer nuts in or out until it lifts square; then check the release pushrod for grooves where it rides in the mainshaft bushings and the mainshaft for runout (article max .003 in)", fix: "Adjust retainer nuts for a square lift; replace a grooved pushrod or a bent mainshaft; check the hub key and thrust lining for damage", urgency: "medium", ride: "Rideable; fix soon — a dragging clutch grinds shifts and won't find neutral.", source: "NOT an FSM cause — Easyriders Tech Tips Vol. 4, §79–§80 (Rick Diaz clutch fix; same article as ER_258 §41 gummed plates)." }
      ]
    },
    {
      id: "lights",
      system: "Electrical / lights",
      title: "Lights / horn dead or flickering",
      steps: [
        { q: "Are ALL the lights dead — headlight, tail, and signals?", yes: "fuse", no: "next", note: "Everything dead at once = power or a breaker, not one bulb. Main breaker 30A; Lights 15A.", cite: "FSM #99482-98 section 8" },
        { q: "Is just one lamp dead?", yes: "bulb", no: "next", note: "One lamp = that bulb, socket, or wire.", cite: "FSM #99482-98 section 8" },
        { q: "Do the lights flicker or die over bumps?", yes: "ground", no: "next", note: "Flicker over bumps = a loose connector or a bad ground.", cite: "FSM #99482-98 section 8" },
        { q: "Do ALL the lights flicker or dim/brighten rapidly with the engine running — at any rpm?", yes: "flicker", no: "next", note: "Flicker only with the engine running, after grounds/battery check out, points at the regulator. Watch a voltmeter while it flickers.", cite: "Easyriders ER_284 §38 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Blown fuse / tripped breaker", weight: 30, test: "Fuses: Main 30A, Ignition 15A, Lights 15A, Accessory 15A, Instruments 15A", fix: "Replace the fuse; find the short that blew it", urgency: "medium", ride: "Do not ride at night or in traffic until the lights work." },
        { cause: "Bulb / socket at the lamp", weight: 30, test: "Bulb + socket condition", fix: "Replace the bulb; clean the socket", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Bad ground / loose connector", weight: 20, test: "Wiggle test; ground resistance under 0.2 ohm (planner check, not a factory spec)", fix: "Clean the ground point; seat the connector", urgency: "medium", ride: "Rideable once the lights stay on over bumps." },
        { cause: "Switch faulty", weight: 10, test: "Switch continuity", fix: "Replace the switch", urgency: "low", ride: "Rideable." },
        { cause: "Lights flicker with engine running — charging/regulator fault", weight: 10, test: "Headlight, taillight, signals and dash all dim/brighten rapidly with the engine running, any rpm; grounds and battery check out", fix: "Start with the regulator — hook a voltmeter up and watch it while the flicker happens; voltage dropping with the flicker = charging/regulating problem", urgency: "medium", ride: "Do not ride at night until the lights stay steady.", part: "regulator", source: "NOT an FSM cause — Easyriders ER_284 §38 (1988 FXRS case)." }
      ]
    },
    {
      id: "carb-rich-flood",
      system: "Carb / fuel",
      title: "Rich running / flooding",
      steps: [
        { q: "Is fuel dripping from the carb overflow, or is the bowl overflowing?", yes: "float", no: "next", note: "Overflow means the float or needle valve is not holding the fuel level. First try the tap test — fuel valve off, tap the float bowl lightly, fuel valve back on; if the overflow stops, dirt was holding the valve off its seat. Check float height 0.413-0.453 in (FSM §4 p. 4-12).", cite: "FSM #99482-98 §4, p. 4-3; §1 p. 1-13; tap test: Sportster 1986-2003 Troubleshooting Manual, Fuel level system (PDF p. 30)" },
        { q: "Does it stay rich with the enrichener pushed fully in once the engine is warm?", yes: "enrichener", no: "next", note: "A warm engine with the enrichener out runs rich; a valve that will not seat does the same. Check seating, cable free play, needle guide and spring.", cite: "FSM #99482-98 §4, p. 4-3" },
        { q: "Is it rich at cruise / mid-throttle, with a correct float level and a seated enrichener?", yes: "needle", no: "next", note: "Mid-throttle richness with float and enrichener ruled out points at the needle / needle jet. Inspect for bending, tip grooves, taper damage.", cite: "FSM #99482-98 §4, pp. 4-3–4-4" },
        { q: "Is the air cleaner element dirty or damaged?", yes: "air-cleaner", no: "next", note: "A choked element starves airflow and the mixture goes rich. Brief test with the element out only.", cite: "FSM #99482-98 §4, pp. 4-3–4-4" },
        { q: "Roll-off test at 3,500-4,500 rpm, full throttle, roll off to about 3/4: does it hesitate?", yes: "main-rich", no: "next", note: "Hesitates = main jet too large. Picks up speed = too lean. This cause is NOT in the FSM charts — it comes from the Easyriders ER_153 roll-off test only.", cite: "Easyriders ER_153 (not an FSM cause)" },
        { q: "On throttle opening, does it stumble — and with the air cleaner off, does the pump squirt look off-center?", yes: "pumpjet", no: "next", note: "Keihin pump jets leave the factory aimed at the rear cylinder only; aim at the center of the manifold. A pump rod too long dribbles fuel at cruise.", cite: "Easyriders ER_153 §147–§148 (not an FSM cause)" },
        { q: "Does it run rich, starve, or overflow fuel — and is the tank cap the vented type?", yes: "vent", no: "next", note: "A plugged tank vent or a wrong non-vent cap starves the carb or overflows fuel. Sportster: plugged cap (1990–91), plugged continuous vent (1992–2003).", cite: "sportster-86-03-trouble pp. 54–55" },
        { q: "With the air cleaner off, do you see fuel spraying back out of the carb throat — especially with a restrictive exhaust or a big cam?", yes: "reversion", no: "next", note: "Too much back pressure or too much valve overlap (cam) makes fuel spray back out the throat at overlap. A freer-flowing exhaust can prevent it.", cite: "Easyriders Tips Vol. 3, PDF p. 10 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Float level too high / inlet (needle) valve sticking, worn, or dirty — fuel overflows the bowl", weight: 20, test: "First — turn the fuel shutoff valve off, lightly tap the float bowl, turn it back on: if fuel stops running out of the overflow tube, whatever held the fuel valve off its seat has been dislodged. If fuel keeps flowing, remove the bowl, check float height 0.413–0.453 in (FSM §4 p. 4-12) and needle/seat for grooves or dirt", fix: "Clean or replace inlet valve and seat; bend float tab to set level; replace a leaky/damaged float", urgency: "medium", ride: "Rideable but running rich; fix soon — fuel overflow is a fire risk.", part: "float", source: "FSM §4 p. 4-3 'Overflow' items 4–7; §1 p. 1-13 'Floods' items 1–3, 5–6; tap test: Sportster 1986-2003 Troubleshooting Manual (PDF p. 30)" },
        { cause: "Enrichener valve not seated or leaking / enrichener left on too long", weight: 20, test: "With engine warm, push enrichener fully in — does idle clean up and plugs stop sooting? Check valve seating, cable free play, needle guide and spring", fix: "Adjust, clean, or replace the enrichener valve; push it fully in after warm-up", urgency: "low", ride: "Rideable; fix soon — poor fuel economy and fouled plugs.", part: "enrichener", source: "FSM §4 p. 4-3 'Poor Fuel Economy' items 1–2; §1 p. 1-13 'Spark Plug Fouls Repeatedly' item 3" },
        { cause: "Worn or damaged needle / needle jet", weight: 15, test: "Rich at cruise/mid-throttle with correct float level and a seated enrichener; inspect needle for bending, tip grooves, taper damage", fix: "Replace needle or needle jet", urgency: "medium", ride: "Rideable; fix soon.", source: "FSM §4 p. 4-3 'Poor Fuel Economy' item 9; p. 4-4 'Poor Performance' item 9" },
        { cause: "Dirty or damaged air cleaner element (chokes airflow → rich)", weight: 15, test: "Remove air cleaner, inspect element; does it run clean with the element out (brief test only)?", fix: "Clean or replace the element", urgency: "low", ride: "Rideable.", source: "FSM §4 p. 4-3 'Poor Fuel Economy' item 3; p. 4-4 'Poor Performance' item 4" },
        { cause: "Main jet too large", weight: 10, test: "Roll-off test at 3,500–4,500 rpm, full throttle, roll off to ~3/4: hesitates = too large; picks up speed = too lean", fix: "Go down one main size, re-test", urgency: "low", ride: "Rideable; fix when convenient.", part: "main-jet", source: "NOT an FSM cause — supported only by the Easyriders ER_153 roll-off test; the FSM §4 charts never list oversize jets" },
        { cause: "Accelerator pump jet mis-aimed — all fuel to rear cylinder", weight: 10, test: "Air cleaner off, watch the pump squirt on throttle opening: it should hit the center of the manifold / middle of the throttle plate, not the rear cylinder only; also check pump-rod length flush with the bowl bottom (throttle closed)", fix: "Turn the press-fit hex pump jet to aim at the manifold center; set rod length flush with the bowl bottom", urgency: "low", ride: "Rideable; fix when convenient.", part: "accel-pump", source: "NOT an FSM cause — Easyriders ER_153 §147–§148." },
        { cause: "Plugged fuel tank vent / wrong (non-vent) cap", weight: 5, test: "Runs rich, overflows, or starves; check the cap vents and the continuous vent system", fix: "Clear or replace the vent / fit the correct vented cap", urgency: "medium", ride: "Rideable short distance; fix soon.", source: "sportster-86-03-trouble pp. 54–55 (Sportster); same failure on Big Twins — check the cap first." },
        { cause: "Reversion spitback — fuel sprayed back out the carb throat", weight: 5, test: "Air cleaner off, watch the carb mouth at overlap: fuel spraying back out of the throat; worse with a restrictive exhaust or a big cam", fix: "Fit a freer-flowing exhaust; check cam overlap for the build", urgency: "low", ride: "Rideable.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 10." }
      ]
    },
    {
      id: "transmission-shifting",
      system: "Transmission",
      title: "Transmission shifting — hard shifts / false neutrals / jumping out of gear",
      steps: [
        { q: "Does the bike creep in gear with the lever pulled, or is neutral hard to find at a stop?", yes: "clutch-drag", no: "next", note: "Slight clutch drag makes shifts hard and neutral hard to find. Lever free play 1/16-1/8 in.", cite: "FSM #99482-98 §1, p. 1-13; §6 p. 6-1" },
        { q: "Does the shifter lever feel short, or does a gear not fully engage?", yes: "linkage", no: "next", note: "The 5-speed has two parallel shafts — mainshaft (input, carries the clutch) and countershaft. Three shifter forks move sliding gears whose dogs engage adjacent freewheeling gears; fork position is set by the drum-shaped shifter cam. If the rod is misadjusted the gears never fully engage.", cite: "FSM #99482-98 §7, p. 7-4" },
        { q: "Shift into 3rd gear (fully engaged). Move the shifter lever — is the free play and spring pressure different in one direction than the other?", yes: "pawl", no: "next", note: "Most shifting problems can be attributed to an improperly adjusted shifter pawl adjusting screw. (FSM §7 p. 7-5)", cite: "FSM #99482-98 §7, p. 7-5" },
        { q: "Adjustments done right and it still shifts hard or jumps out of gear — especially under load?", yes: "internal", no: "next", note: "Falling into neutral between gears is the FSM 'Jumps Out Of Gear' category — the manual never uses the phrase 'false neutral'.", cite: "FSM #99482-98 §1, p. 1-13" },
        { q: "Is the primary chain noisy, or is its free play outside 5/8–7/8 in (upper strand)?", yes: "chain", no: "next", note: "A badly worn or misaligned primary chain, or transmission lubricant too heavy for the temperature (winter), makes shifts hard. Transmission oil capacity 24 oz.", cite: "FSM #99482-98 §1, pp. 1-38–1-39" },
        { q: "No 3rd gear — especially after aftermarket forward controls, or with big heavy boots?", yes: "lever", no: "next", note: "A foot shifter lever set too low won't complete the 2nd-to-3rd shift. Tapping the lever down slightly after grabbing 2nd makes 3rd appear.", cite: "Easyriders ER_297 §136 (not an FSM cause)" },
        { q: "Does it jump out of gear under load even after the linkage and pawl are adjusted?", yes: "offcenter", no: "next", note: "Shift forks must sit exactly in the middle of each gear set; clutch gears must go at least 3/4 of the way into each gear.", cite: "Easyriders ER_259 §64 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Clutch dragging (slight drag makes shifts hard and neutral hard to find)", weight: 25, test: "Lever free play outside 1/16–1/8 in? Bike creeps in gear with lever pulled, or neutral is hard to find at a stop", fix: "Adjust cable and clutch pack to 1/16–1/8 in free play at the lever; replace warped plates if adjustment doesn't cure it", urgency: "medium", ride: "Rideable; fix before it gets worse.", part: "clutch", source: "FSM §1 p. 1-13 'Shifts Hard' item 2; 'Clutch Drags' items 1–3; §6 p. 6-1 free play 1/16–1/8 in" },
        { cause: "Shifter rod / linkage misadjusted (gears don't engage fully; shifter travel wrong)", weight: 20, test: "Shift through all gears — does the lever feel short or not fully engage? Inspect rod, locknuts, and linkage for wear/interference", fix: "Shifter linkage adjustment (§7 p. 7-4): disconnect one end of the rod, loosen locknuts, adjust rod, reconnect, tighten locknuts to 20–24 ft-lbs (27–33 Nm)", urgency: "medium", ride: "Rideable if every gear engages fully; do not ride if a gear slips out.", source: "FSM §7 p. 7-4 'Shifter Linkage Adjustment'; §1 p. 1-13 'Jumps Out Of Gear' item 1" },
        { cause: "Shifter pawl / gear engagement misadjusted", weight: 20, test: "Shift into 3rd gear (fully engaged); move shifter lever and feel free play and spring pressure in both directions — must be equal", fix: "Gear Engagement Adjustment (§7 p. 7-5) with Pawl Adjuster HD-39618 (all except FLSTS) / HD-42465 (FLSTS): loosen locknut, turn Allen screw in ≤1/4-turn increments until spring pressure and free play are equal both sides (measurement equal within 0.010 in / 0.25 mm); recheck after tightening locknut", urgency: "medium", ride: "Rideable once engagement is equal both ways; do not ride if it jumps out of gear.", source: "FSM §7 p. 7-5 'Gear Engagement Adjustment'. Most shifting problems can be attributed to an improperly adjusted shifter pawl adjusting screw." },
        { cause: "Worn/bent internal parts — shifter forks sprung or bent, shifter clutch-dog corners worn off, shifter drum damaged, engaging parts rounded, damaged gears", weight: 10, test: "Adjustments 2 and 3 done correctly and it still shifts hard or jumps out — especially under load; shift dogs rounded/worn flat won't hold under load — the undercut angle is what wedges them together (Easyriders ER_236 §43)", fix: "Shop/transmission teardown: replace worn forks, dogs, drum, or gears", urgency: "high", ride: "Do not ride far — a gear jumping out under load can lock or throw the bike.", part: "transmission", source: "FSM §1 p. 1-13 'Shifts Hard' items 3–5; 'Jumps Out Of Gear' items 2–5. Year split: the $429.00 Baker kit covers 1987–1993 (1990 Softail only); the 1995 needs the 1994–1998 kit." },
        { cause: "Primary chain badly worn/misaligned, or transmission lubricant too heavy (winter)", weight: 10, test: "Primary chain free play outside 5/8–7/8 in (upper strand, FSM §1 pp. 1-38–1-39); chain noisy or can't be adjusted", fix: "Adjust chain (shoe up/down, center-bolt nut 21–29 ft-lbs / 28–39 Nm); replace chain if it can't be adjusted; correct lubricant grade for the temperature", urgency: "low", ride: "Rideable short distance; a loose chain eats the case.", part: "primary-chain", source: "FSM §1 p. 1-13 'Shifts Hard' item 6; §1 pp. 1-38–1-39" },
        { cause: "Shifter lever set too low — can't reach 3rd (esp. forward controls)", weight: 10, test: "No 3rd gear after forward controls fitted, or with big boots; tapping the lever down slightly after 2nd makes 3rd appear", fix: "Raise/adjust the foot shifter lever for clearance", urgency: "low", ride: "Rideable if every gear engages fully.", part: "transmission", source: "NOT an FSM cause — Easyriders ER_297 §136 (1990 Softail Custom case)." },
        { cause: "Shift forks off-center — gears don't engage fully, jumps out", weight: 5, test: "Jumps out of gear under load after linkage + pawl are right; forks must sit exactly mid-gear-set (shims on fork shafts, feeler gauges); clutch gears at least 3/4 into each gear", fix: "Center the forks; shop job if the cases have to open", urgency: "high", ride: "Do not ride far — a gear jumping out under load can lock or throw the bike.", part: "transmission", source: "NOT an FSM cause — Easyriders ER_259 §64." }
      ]
    },
    {
      /* Smoking / oil consumption (batch 2, Nov 25, 2026). FSM spine:
         FSM #99482-98 §3 pp. 3-11–3-12 ("Diagnosing Smoking Engine or High
         Oil Consumption" + compression / leakdown diagnostic chart).
         Magazine cause: Easyriders Tech Tips Vol. 3, Carl Morrow FXRS
         hop-up (over-rev after rev-limiter removal) — flagged as NOT an
         FSM cause. Sportster note: white smoke/steam after a cold start is
         normal condensation (Sportster 86-03 p. 89; sportster-86-03-trouble
         p. 58). Weights sum to 100.
         Two deliberate deviations from the draft, both to keep the app
         honest: (1) step 1's yes/no was "smoke-color" — changed to "next",
         because scoring only bumps on a YES and a blue-gray YES must never
         bump the white-steam cause; (2) the rings cause carried
         part: "piston-rings", dropped — no piston-ring price is verified
         in the parts core (pg-parts-core.js) and the suite enforces every
         part key exists there.
         Every source string, cite, note, weight, test, fix, urgency and
         ride verdict is exactly as drafted. */
      id: "smoking-oil-consumption",
      system: "Engine / oil",
      title: "Smoking exhaust / high oil consumption",
      steps: [
        { q: "Is the smoke blue-gray (not white steam, not black soot)?", yes: "next", no: "next", note: "Blue-gray smoke is burning oil. White steam right after a cold start is normal condensation (Sportster 86-03 p. 89). Black soot is rich running — see the rich-running tree.", cite: "FSM #99482-98 §3 p. 3-11; sportster-86-03 p. 89" },
        { q: "Is oil consumption above normal — needing top-ups between changes?", yes: "next", no: "next", note: "Above-normal oil use plus blue-gray smoke plus low compression points at the rings (FSM §3 p. 3-11). Either symptom alone narrows less.", cite: "FSM #99482-98 §3 p. 3-11" },
        { q: "Is the oil level above the full mark — was it overfilled?", yes: "overfill", no: "next", note: "Overfill is on the FSM inspect list for a smoking engine. Check the level on a level surface, engine warm, before tearing anything down.", cite: "FSM #99482-98 §3 p. 3-12" },
        { q: "Compression test (engine warm, throttle wide open, 5–7 strokes): is either cylinder below 90 psi, or more than 10% apart between cylinders?", yes: "next", no: "seals", note: "90 psi minimum AND no more than 10% variance between cylinders is the FSM pass line. Below it, the wet test and leakdown test separate rings from valves from gasket.", cite: "FSM #99482-98 §3 p. 3-11" },
        { q: "Wet test — about 1/2 oz (15 ml) oil in each cylinder, repeat the test: does compression rise considerably?", yes: "rings", no: "next", note: "A considerable rise on the wet test means worn piston rings. No real rise means valve trouble or a head gasket leak.", cite: "FSM #99482-98 §3 p. 3-12 (diagnostic chart)" },
        { q: "Leakdown test: is air escaping through the exhaust pipe?", yes: "exhaust-valve", no: "next", note: "Air out the exhaust pipe is a leaking exhaust valve. Air out the carburetor is a leaking intake valve; air out the timing inspection hole is rings, piston/cylinder, or head gasket.", cite: "FSM #99482-98 §3 p. 3-12" },
        { q: "Leakdown test: is air escaping through the carburetor intake?", yes: "intake-valve", no: "next", note: "Air out the carburetor intake is a leaking intake valve. Check for correct pushrod length if air escapes through the valves.", cite: "FSM #99482-98 §3 p. 3-12" },
        { q: "Leakdown test: is air escaping through the timing inspection hole?", yes: "rings-gasket", no: "next", note: "Air through the timing hole means leaking, worn, or broken piston rings, a worn piston and/or cylinder, or a leaking head gasket.", cite: "FSM #99482-98 §3 p. 3-12" },
        { q: "Leakdown test on both cylinders: does the pressure loss differ by more than 12% between the two cylinders?", yes: "poor-condition", no: "next", note: "More than 12% difference between cylinders = the engine is in poor condition and further testing is required. The leak location (exhaust / carburetor / timing hole) says which part.", cite: "Sportster 1986-2003 Troubleshooting Manual, Leakdown Test (PDF pp. 58–59)" },
        { q: "Was the rev limiter removed, or has the engine been over-revved — a missed shift, or sustained running near 6,800 rpm?", yes: "over-rev", no: "next", note: "Over-revving on a missed shift can make the valve collars smack the seals and cause the bike to smoke. About 6,800 rpm is where wear climbs disproportionately. This cause is NOT in the FSM — it comes from Easyriders Tech Tips Vol. 3 only.", cite: "Easyriders Tech Tips Vol. 3, Carl Morrow FXRS hop-up (not an FSM cause)" },
        { q: "With the suspect head off: are the valve guide seals damaged, or is stem-to-guide clearance excessive?", yes: "seals", no: "carryover", note: "Head-off inspect list: valve guide seals, guide-to-stem clearance, gasket surfaces, and head casting porosity letting oil drain into the chamber. Check oil carryover BEFORE removing the head.", cite: "FSM #99482-98 §3 p. 3-12" }
      ],
      causes: [
        { cause: "Worn, broken, or stuck piston rings", weight: 20, test: "Compression low on first stroke, builds on following strokes but never reaches normal; improves considerably with oil added. Leakdown: air through the timing inspection hole.", fix: "Replace rings; inspect piston and cylinder for wear — if the cylinder is out of tolerance, bore/hone and fit oversize", urgency: "high", ride: "Do not ride until fixed — oil burning plus low compression.", source: "FSM #99482-98 §3 pp. 3-11–3-12 (diagnostic chart: Ring Trouble)" },
        { cause: "Leaking intake valve", weight: 15, test: "Compression low on first stroke, does not build up much, does not improve considerably with oil. Leakdown: air escaping through the carburetor intake.", fix: "Grind valves and valve seats; check for correct pushrod length", urgency: "high", ride: "Do not ride until fixed — low compression.", source: "FSM #99482-98 §3 p. 3-12 (diagnostic chart: Valve Trouble)" },
        { cause: "Leaking exhaust valve", weight: 15, test: "Same compression pattern as intake-valve trouble. Leakdown: air escaping through the exhaust pipe.", fix: "Grind valves and valve seats; check for correct pushrod length", urgency: "high", ride: "Do not ride until fixed — low compression.", source: "FSM #99482-98 §3 p. 3-12 (diagnostic chart: Valve Trouble)" },
        { cause: "Blown head gasket", weight: 10, test: "Same compression reaction as valve trouble. Leakdown: air through the timing inspection hole; inspect gasket surfaces of head and cylinder with the head off.", fix: "Replace head gasket; check both gasket surfaces for flatness", urgency: "high", ride: "Do not ride until fixed.", source: "FSM #99482-98 §3 p. 3-12 (diagnostic chart: Head Gasket Leak)" },
        { cause: "Poor engine condition — leakdown loss differs by more than 12% between cylinders", weight: 5, test: "Leakdown test warm, throttle/choke wide open, piston at TDC compression, 5th gear + rear brake holding the engine: pressure loss between the two cylinders differs by more than 12%. Listen for where the air escapes — exhaust = exhaust valve, carburetor = intake valve, timing inspection hole = rings, head gasket, or worn piston.", fix: "Further testing as the leak location indicates — top-end teardown (valves, rings, or head gasket); shop job", urgency: "high", ride: "Do not ride far — a leaking valve or ring gets worse fast.", source: "Sportster 1986-2003 Troubleshooting Manual, Leakdown Test (PDF pp. 58–59)" },
        { cause: "Valve guide seals damaged, or stem-to-guide clearance excessive", weight: 10, test: "Compression passes (90 psi, within 10%) but the engine still smokes; with the head off, inspect seals and measure stem-to-guide clearance.", fix: "Replace valve guide seals; replace guides/valves if clearance is excessive", urgency: "medium", ride: "Rideable if compression is good; fix soon — oil is getting past the seals.", source: "FSM #99482-98 §3 p. 3-12 (Diagnosing Smoking Engine inspect list)" },
        { cause: "Over-rev damage — valve collars smacked the seals after rev-limiter removal", weight: 10, test: "Smoking started after a missed shift or sustained high revs with the limiter removed; compression may still pass.", fix: "Replace valve guide seals; inspect collars and guides; refit a rev limiter", urgency: "medium", ride: "Rideable if compression is good; fix soon — and keep the limiter.", source: "NOT an FSM cause — Easyriders Tech Tips Vol. 3, Carl Morrow FXRS hop-up (removing the limiter; over-rev on a missed shift; ~6,800 rpm wears the engine disproportionately)" },
        { cause: "Oil overfill", weight: 5, test: "Oil level above the full mark on a level surface, engine warm.", fix: "Drain oil to the correct level", urgency: "low", ride: "Rideable once the level is corrected.", source: "FSM #99482-98 §3 p. 3-12 (Diagnosing Smoking Engine inspect list: Overfill)" },
        { cause: "Oil carryover, clogged oil return passages, or head casting porosity", weight: 5, test: "Compression passes and seals look good; check oil carryover BEFORE head removal; with the head off, check return passages for clogging and the head casting for porosity letting oil drain into the chamber.", fix: "Clear clogged return passages; a porous head casting is a head replacement — shop job", urgency: "medium", ride: "Rideable if compression is good; fix soon.", source: "FSM #99482-98 §3 p. 3-12 (Diagnosing Smoking Engine inspect list)" },
        { cause: "White smoke / steam after a cold start — normal condensation, not a fault", weight: 5, test: "White smoke or steam only right after first starting in cold weather; clears as the engine warms; no oil consumption.", fix: "No fix — this is condensed steam from combustion.", urgency: "low", ride: "Rideable.", source: "Sportster 86-03 p. 89; sportster-86-03-trouble p. 58 ('It is normal to see white smoke or steam from the exhaust after first starting the engine in cold weather')" }
      ]
    },
    {
      id: "speedometer-inoperative",
      system: "Electrical / instruments",
      title: "Speedometer inoperative, reads wrong, or erratic",
      steps: [
        { q: "Turn the ignition on. Is the speedometer backlighting on?", yes: "next", no: "backlight", note: "No backlight at all is a power/bulb fault, not a sensor fault.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" },
        { q: "Is the speedometer itself working but the odometer or trip odometer dead, or the display won't toggle between trip and odometer?", yes: "odometer", no: "next", note: "Fig. 93 is a separate chart for odometer/trip/reset-switch only — speedometer function is a different fault path.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 93 (PDF p. 65)" },
        { q: "Disconnect the speed-sensor connector [65]. Key on: is the voltage at the red wire on the speedometer side [65B] in spec — 8-12 V on 1995-96, 6-12 V on 1997-98?", yes: "next", no: "speedo-power", note: "No voltage at the red wire = open wiring, or the speedometer itself.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" },
        { q: "Is there continuity to ground at the black wire on the speedometer side of the speed-sensor connector [65B]?", yes: "next", no: "speedo-power", note: "No ground at the black wire = open wiring, or the speedometer itself.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" },
        { q: "With the speedometer test harness in-line between the speedometer and sensor sides of connector [65], key on, rotate the rear wheel: is 6-12 V present on the white wire at all?", yes: "next", no: "speedometer", note: "White wire dead with power and ground good = the speedometer head. The test harness is fabricated from one 3-pin Deutsch male connector, two 3-socket Deutsch female connectors, and 6-inch lengths of 18-gauge wire (manual p. 92, Fig. 90).", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" },
        { q: "Does the white-wire voltage fluctuate between 0-1 V and 6-12 V as the rear wheel turns?", yes: "next", no: "speed-sensor", note: "Steady 6-12 V with no drop to 0-1 V = the sensor is not switching. The manual says to swap in a known-good sensor and recheck.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" },
        { q: "Wiggle the harness while checking voltage between the orange/white wire and the black wire at the back of the speedometer (meter harness connector [20] on 1995-1996 models). Does the voltage fluctuate?", yes: "wiring", no: "next", note: "Fluctuation while wiggling = an intermittent break in the harness.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" },
        { q: "Are the spark-plug wire terminals properly seated on the plugs and coil standoffs, with no worn spots in the insulation?", yes: "speedometer", no: "plug-wires", note: "Damaged plug-wire insulation throws electrical noise that upsets the electronic speedometer — the manual checks this before condemning the head.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 94 (PDF p. 66)" }
      ],
      causes: [
        { cause: "Speedometer backlighting / bulbs failed, or no power to the head", weight: 15, test: "Check the speedometer and odometer bulbs; if the bulbs are good, check for 9-12 V on the orange/white wire and continuity to ground on the black wire at the terminals on the back of the speedometer", fix: "Replace bulbs as necessary; repair the orange/white power feed or black ground as needed", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Odometer / trip odometer / reset switch fault (speedometer itself works)", weight: 10, test: "Key on: does the odometer display correct numbers? Press the trip reset switch — does the LCD toggle between trip and odometer? If not, tighten the reset-switch boot clockwise and retry; then toggle the switch with the boot removed. 1997-98: cut the leads 1 in. from the reset switch and jumper across the leads to the speedometer; 1999-2003: momentarily jumper across the switch terminals on the connector at the back of the speedometer", fix: "Replace the boot if the switch works without it; replace the reset switch if the jumper toggles the display; otherwise the speedometer head (confirm at a dealership — further testing needs a Scanalyzer)", urgency: "low", ride: "Rideable — the speedometer still works; the odometer just doesn't record." },
        { cause: "No power or no ground to the speed sensor — open wiring or speedometer head", weight: 15, test: "Red wire [65B] out of 8-12 V (1995-96) / 6-12 V (1997-98), or no continuity to ground on the black wire [65B]", fix: "Repair the open wire; if the wires are in good condition, the speedometer head is at fault (confirm at a dealership — further testing needs a Scanalyzer)", urgency: "medium", ride: "Rideable — no speed reading, so judge speed by traffic and gears; fix soon." },
        { cause: "Speedometer head failed (white wire dead, or all else checks out)", weight: 20, test: "Power and ground good at [65B], white wire shows no 6-12 V with the wheel turning — or every other test passes and the needle is still dead/erratic", fix: "Replace the speedometer — but confirm it is defective at a dealership first; further testing requires a Scanalyzer", urgency: "medium", ride: "Rideable — no speed reading; fix soon." },
        { cause: "Speed sensor failed — steady voltage, no switching", weight: 20, test: "White wire holds 6-12 V but never drops to 0-1 V as the rear wheel turns (test harness in-line, Fig. 94). 1999 models: same check on the white terminal of connector [65] with the connector still connected to the speedometer (Fig. 97 — codes d05, d06, d08)", fix: "Replace the speed sensor with a known-good unit and recheck; clean the sensor first — a dirty sensor can read the same way. If the problem persists, dealership testing", urgency: "medium", ride: "Rideable — no speed reading; fix soon." },
        { cause: "Wiring fault — intermittent break in the speedometer harness", weight: 10, test: "Voltage between orange/white and black at the back of the speedometer fluctuates while wiggling the harness", fix: "Repair the wiring as necessary", urgency: "medium", ride: "Rideable; fix soon — an intermittent speedo is a distraction." },
        { cause: "Spark-plug wire damage interfering with the electronic speedometer", weight: 10, test: "Plug-wire terminals not seated on plugs/coil standoffs, or worn spots in the insulation", fix: "Seat the terminals; repair or replace damaged plug wires", urgency: "low", ride: "Rideable; fix soon.", part: "plug-wires" }
      ]
    },
    {
      id: "turn-signals",
      system: "Electrical / lights",
      title: "Turn signals won't flash or won't cancel",
      steps: [
        { q: "Do the signals turn on and flash, but stay on after the turn instead of cancelling?", yes: "cancel-module", no: "next", note: "Won't-cancel is a different fault path (speedometer signal to the module) from won't-flash. The full cancel test is in the cause below — Fig. 100.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 100 (PDF p. 74)" },
        { q: "Inspect the bulbs on the side that will not flash. Has a bulb failed?", yes: "bulbs", no: "next", note: "One failed bulb kills that side. Check the socket contacts for corrosion and the bulb wire for breaks at the same time (1991-96 text).", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 103 (PDF p. 77); Turn Signal Module 1991-1996 Troubleshooting (PDF p. 72)" },
        { q: "Disconnect the turn signal module connector [30]. Key on: measure the voltage between terminals 1 and 2 on the connector. Does it read 12 volts?", yes: "next", no: "module-power", note: "No 12 V at terminals 1-2 = module power or ground fault — check terminal 1 resistance to ground (under 1 ohm) and the 15-amp accessory circuit breaker next.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 103 (PDF p. 77)" },
        { q: "Keep the ignition on. Measure the voltage between terminals 1 and 7 of the module connector while the RIGHT turn signal switch is pressed. Does it read 12 volts?", yes: "next", no: "switch-right", note: "Terminals 1-7 are the right-switch input. No voltage here = the switch, its wiring, or its power feed — not the module.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 103 (PDF p. 77)" },
        { q: "Measure the voltage between terminals 1 and 8 of the module connector while the LEFT turn signal switch is pressed. Does it read 12 volts?", yes: "next", no: "switch-left", note: "Terminals 1-8 are the left-switch input.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 103 (PDF p. 78)" },
        { q: "Place a jumper across terminals 2 and 3 in the module connector, key on. Do BOTH right-side turn signal lamps turn on?", yes: "next", no: "wiring-right", note: "Jumper 2-3 bypasses the module for the right side. Lamps off = open wire or open ground between the lamps and connector [30].", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 103 (PDF p. 78); Fig. 102 (PDF p. 76)" },
        { q: "Place a jumper across terminals 2 and 4 in the module connector, key on. Do BOTH left-side turn signal lamps turn on?", yes: "module", no: "wiring-left", note: "Jumper 2-4 bypasses the module for the left side. Both jumpers lighting the lamps with the module in place doing nothing = the module itself.", cite: "Sportster 1986-2003 Troubleshooting Manual, Fig. 103 (PDF p. 78); Fig. 102 (PDF p. 76)" }
      ],
      causes: [
        { cause: "Turn signal module failed — signals won't cancel", weight: 20, test: "1997-98 (except late-98 883): key on, check voltage on the white/green terminal on the harness side of module connector [30] while connected — it must fluctuate 0-1 V to 6-12 V while the rear wheel turns. Fluctuating = replace the module. No voltage: disconnect [30], remove the white/green wire from the back of the speedometer, check continuity to ground — continuity present = short to ground on the white/green wire; no continuity = replace the module. No fluctuation: check continuity between the white/green wire at the back of the speedometer and [30] — no continuity = open in the white/green wire; continuity present = check for battery voltage on white/green with [30] disconnected (present = short to voltage; absent = refer to speedometer troubleshooting). 1991-96 text: 1994 models — ohmmeter on the speedometer white/green wire to ground, spin the FRONT wheel, reading must alternate 0 ohms/infinity; 1995-96 — voltmeter on pin 3, spin the REAR wheel, must alternate 0-1 V and 8-12 V. Late-98 883 / 1999-2003 (Fig. 101): meter must read 3-6 V with the wheel turning faster than 3 mph and 9-11 V stationary", fix: "Replace the turn signal module; repair the white/green wire fault if the test points there instead", urgency: "low", ride: "Rideable — cancel them by hand until fixed." },
        { cause: "Bulb failed (or corroded socket / broken bulb wire / loose socket)", weight: 20, test: "Bulb inspection on the dead side; socket contacts corroded, bulb wire broken, or socket loose where staked to the housing", fix: "Replace the bulb; clean corroded contacts (wipe with dielectric grease if corrosion keeps returning); repair the wire; replace the light assembly if the socket is loose", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "No power or bad ground to the turn signal module", weight: 15, test: "Terminals 1-2 on connector [30] do not read 12 V. Check resistance to ground at terminal 1 (must be under 1 ohm — if not, repair the poor ground; never run the module with pin 1 ungrounded, it will burn out). Then check 12 V at both terminals of the 15-amp accessory circuit breaker: 12 V at both = open in the orange/white wire between the breaker and the module; 12 V at one terminal only = replace the circuit breaker; at neither = open between the ignition switch and the breaker block", fix: "Repair the ground, the orange/white feed, or replace the accessory circuit breaker as the test indicates", urgency: "medium", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Right turn signal switch or its wiring failed", weight: 10, test: "Terminals 1-7 do not read 12 V with the right switch pressed. Press the right switch and check voltage at the white/brown terminal in the harness side of the right handlebar connector [22] while connected: 12 V present = open between connector [22] and the module; no 12 V = check continuity of the orange/white wire to ground (continuity = short to ground; no continuity = check 12 V at the orange/white wire in [22] — present = replace the turn signal switch; absent = open between [22] and the circuit breaker block)", fix: "Repair the open/short, or replace the turn signal switch", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Left turn signal switch or its wiring failed", weight: 10, test: "Terminals 1-8 do not read 12 V with the left switch pressed. Same procedure mirrored: white/violet terminal in the left handlebar connector [24]; 12 V present = open between [24] and the module; no 12 V = check white/violet continuity to ground (present = short to ground; absent = check 12 V at the orange/white wire in [24] — present = replace the switch; absent = open between [24] and the breaker block)", fix: "Repair the open/short, or replace the turn signal switch", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Open wire or open ground — right-side lamps", weight: 10, test: "Jumper across terminals 2-3 does not light both right lamps. With bulbs removed, check continuity between the bulb-socket terminal and terminal 3: continuity present = open ground circuit; no continuity = open in the wire (also check continuity between terminal 3 and the lamps)", fix: "Repair the open wire or the open ground circuit between the lamps and module connector [30]", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Open wire or open ground — left-side lamps", weight: 10, test: "Jumper across terminals 2-4 does not light both left lamps. With bulbs removed, check continuity between the bulb-socket terminal and terminal 4: continuity present = open ground circuit; no continuity = open in the wire", fix: "Repair the open wire or the open ground circuit between the lamps and module connector [30]", urgency: "low", ride: "Rideable in daylight; fix before night riding." },
        { cause: "Turn signal module failed — won't flash (lamps, switches, and wiring all good)", weight: 5, test: "Bulbs good, 12 V at terminals 1-2, 12 V at 1-7 (right pressed) and 1-8 (left pressed), and both jumper tests (2-3 right, 2-4 left) light the lamps — but the signals still will not flash with the module connected", fix: "Replace the turn signal module", urgency: "low", ride: "Rideable in daylight; fix before night riding." }
      ]
    },
    {
      id: "poor-power-acceleration",
      system: "Engine / carb",
      title: "Engine lacks power / poor acceleration",
      steps: [
        { q: "Is the air filter element dirty or contaminated?", yes: "air-filter", no: "next", note: "A choked element starves airflow — the manual lists it under low power at all speeds, poor power at low speeds, and poor power at high speeds.", cite: "Sportster 1986-2003 Troubleshooting Manual, CV Carburetor Troubleshooting (PDF pp. 54-55); Keihin Carburetor Troubleshooting (PDF p. 53)" },
        { q: "Are the brakes dragging — bike hard to push, discs hot after a ride, or the lever/pedal has no free play?", yes: "brake-drag", no: "next", note: "Dragging brakes are on the manual's own 'Engine Loses Power' list. The brakes tree covers the fix.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Loses Power (PDF p. 3)" },
        { q: "Is the engine overheating — pinging, running hotter than usual, oil temp up?", yes: "overheating", no: "next", note: "Overheating is itself a power-loss cause in the manual. See the engine-overheating tree.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Loses Power (PDF p. 3)" },
        { q: "Are the spark plugs the right heat range and gapped correctly (0.038-0.043 in, 5R6A)?", yes: "next", no: "plugs", note: "Incorrectly gapped plugs are on the 'Loses Power' list; wrong heat range also causes pinging under acceleration.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Loses Power (PDF p. 3)" },
        { q: "Is the ignition timing correct (20 deg BTDC at idle)?", yes: "next", no: "timing", note: "Incorrect timing is on the 'Loses Power' list. See the Ignition Timing Helper for the procedure.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Loses Power (PDF p. 3)" },
        { q: "Is fuel reaching the carb freely — fuel line, fuel filter, and in-tank strainers clear, tank clean?", yes: "next", no: "fuel-supply", note: "Fuel starvation list: clogged fuel line, dirty carburetor, clogged tank strainers, dirty fuel tank. Check this before opening the carb.", cite: "Sportster 1986-2003 Troubleshooting Manual, CV Carburetor Troubleshooting — Fuel starvation (PDF p. 53); Keihin Carburetor Troubleshooting (PDF p. 53)" },
        { q: "CV carb only: with the air cleaner off, does the vacuum piston (slide) rise smoothly when you blip the throttle, and settle back down?", yes: "next", no: "vacuum-piston", note: "A piston that doesn't rise or doesn't close kills power across the range. Diaphragm, spring, binding, and vent are all in the manual's list.", cite: "Sportster 1986-2003 Troubleshooting Manual, CV Carburetor Troubleshooting — Vacuum piston doesn't rise / doesn't close (PDF p. 55)" },
        { q: "Is the power loss worst at HIGH engine speeds, with low-speed running roughly normal?", yes: "high-speed", no: "next", note: "High-speed-only loss points at the main circuit and fuel level, not the pilot circuit.", cite: "Sportster 1986-2003 Troubleshooting Manual, CV Carburetor Troubleshooting — Poor power at high engine speeds (PDF p. 55); Keihin (PDF p. 53)" },
        { q: "Is the power loss worst at LOW engine speeds / off idle, with high-speed running roughly normal?", yes: "low-speed", no: "next", note: "Low-speed-only loss points at the pilot circuit and needle, not the main jet.", cite: "Sportster 1986-2003 Troubleshooting Manual, CV Carburetor Troubleshooting — Poor power at low engine speeds (PDF p. 54)" },
        { q: "Compression test: is one cylinder low, or do the two cylinders differ by more than 12% on a leakdown test?", yes: "engine-condition", no: "next", note: "Leakdown over 12% difference between cylinders = engine in poor condition, further testing required. Listen for where the air escapes.", cite: "Sportster 1986-2003 Troubleshooting Manual, Leakdown Test (PDF pp. 58-59)" },
        { q: "Is the muffler obstructed — dented, crushed, or internally collapsed?", yes: "muffler", no: "next", note: "An obstructed muffler is on the manual's 'Loses Power' list. Last check because it is the least common.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Loses Power (PDF p. 3)" }
      ],
      causes: [
        { cause: "Dirty or contaminated air filter element", weight: 15, test: "Remove and inspect the element; brief test run with the element out only", fix: "Clean or replace the element", urgency: "low", ride: "Rideable; fix soon." },
        { cause: "Fuel supply restricted — clogged line, filter, or in-tank strainers; dirty tank", weight: 15, test: "Fuel flow at the carb with the line disconnected; drain the tank and inspect the petcock strainers for rust/debris; check the float-bowl vent/overflow is not plugged", fix: "Clean or replace the line, filter, and strainers; clean the tank; clear the bowl vent", urgency: "medium", ride: "Rideable short distance; fix soon — it will strand you when it gets worse." },
        { cause: "Vacuum piston (CV slide) not rising or not closing", weight: 10, test: "Doesn't rise: piston binds in bore, diaphragm torn/damaged, spring binding, enrichener valve open or leaking, diaphragm cap loose/damaged, piston vent clogged, diaphragm pinched at the lip. Doesn't close: broken spring, torn diaphragm, piston binds in bore", fix: "Free the piston, replace the torn diaphragm or broken spring, seat the diaphragm lip correctly, clear the vent", urgency: "medium", ride: "Rideable; fix soon." },
        { cause: "Poor power at high speeds — main jet / fuel level", weight: 10, test: "Main jet loose or plugged; fuel level incorrect; also check contaminated air filter, damaged vacuum piston, worn needle/needle jet, plugged bowl vent/overflow, loose enrichener nut, plugged tank vent (1990-91 cap / 1992-2003 continuous vent), clogged fuel supply, intake air leak", fix: "Tighten or clean/replace the main jet; set the float level (0.413-0.453 in, CV40); clear the vent; fix the failed item the check finds", urgency: "medium", ride: "Rideable; fix soon.", part: "main-jet" },
        { cause: "Poor power at low speeds — pilot circuit / needle", weight: 10, test: "Idle speed misadjusted; contaminated air filter; damaged vacuum piston; worn/damaged needle jet or needle; clogged pilot jet system; plugged float-bowl vent/overflow; enrichener valve nut loose/damaged; plugged tank vent; clogged fuel supply; air leak at carb mounting", fix: "Set idle speed; clean the pilot jet system; replace the worn needle/needle jet; tighten the enrichener nut; clear the vent; fix the failed item the check finds", urgency: "medium", ride: "Rideable; fix soon.", part: "pilot-jet" },
        { cause: "Spark plugs wrong heat range or incorrectly gapped", weight: 10, test: "Plug heat range and gap 0.038-0.043 in (5R6A)", fix: "Fit the correct plugs, set the gap", urgency: "low", ride: "Rideable; fix soon.", part: "plugs" },
        { cause: "Ignition timing incorrect", weight: 10, test: "Timing 20 deg BTDC at idle", fix: "Set timing per the Ignition Timing Helper", urgency: "medium", ride: "Rideable; fix soon.", part: "ignition-module" },
        { cause: "Brakes dragging", weight: 5, test: "Bike hard to push; discs hot; no lever/pedal free play", fix: "See the brakes tree — free the caliper/pads, check the master-cylinder primary cup seal", urgency: "medium", ride: "Do not ride far — dragging brakes overheat and fade." },
        { cause: "Engine overheating", weight: 5, test: "Pinging, excess heat, oil temp up", fix: "See the engine-overheating tree", urgency: "high", ride: "Do not ride far with an overheating engine." },
        { cause: "Muffler obstructed", weight: 5, test: "Visual inspection — dented/crushed muffler; exhaust flow weak at the tip", fix: "Repair or replace the muffler", urgency: "low", ride: "Rideable; fix soon." },
        { cause: "Poor engine condition — valves, rings, or head gasket (leakdown)", weight: 5, test: "Leakdown test warm, throttle/choke wide open, piston at TDC compression, 5th gear + rear brake holding the engine: air hissing through the exhaust = leaking exhaust valve; through the carburetor = leaking intake valve (or pushrods too long); through the ignition-timing inspection hole = worn/broken rings, leaking head gasket, or worn piston. Over 12% loss difference between cylinders = poor condition", fix: "Top-end teardown — valves, rings, or head gasket as the leak indicates; shop job", urgency: "high", ride: "Do not ride far — a leaking valve or ring gets worse fast.", part: "heads" }
      ]
    },
    {
      id: "engine-overheating",
      system: "Engine",
      title: "Engine overheating",
      steps: [
        { q: "Is the oil level low at the tank?", yes: "oil-level", no: "next", note: "Low oil is the cheapest overheat cause and the first thing the manual lists after carb and timing. Check warm, bike upright.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Overheating (PDF p. 3)" },
        { q: "Does the oil light stay on when engine speed is above idle, or is oil not returning to the tank?", yes: "oil-circulation", no: "next", note: "Oil not circulating overheats the engine fast. The oil-light check is in the manual's lubrication section.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Lubrication — Oil Light (PDF p. 59)" },
        { q: "Are the spark plugs the correct heat range for the bike?", yes: "next", no: "plugs", note: "Too hot a plug range is a listed overheat cause — and a pinging cause under acceleration.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Overheating (PDF p. 3)" },
        { q: "Is the carburetor adjustment or jet selection correct — or is it running lean (see the carb-lean-idle tree)?", yes: "next", no: "carb-lean", note: "Incorrect carb adjustment or jet selection is the manual's first-listed overheat cause. Lean runs hot.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Overheating (PDF p. 3)" },
        { q: "Is the ignition timing correct (20 deg BTDC at idle), with no defective ignition components?", yes: "next", no: "timing", note: "Incorrect timing or defective ignition components are the manual's second-listed overheat cause.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Overheating (PDF p. 3)" },
        { q: "Compression/leakdown test: does air leak past the valves, or is there heavy carbon buildup in the combustion chamber?", yes: "valves-carbon", no: "next", note: "Leaking valves and heavy carbon deposits close the manual's list. Leakdown: air through the exhaust = exhaust valve; through the carb = intake valve.", cite: "Sportster 1986-2003 Troubleshooting Manual, Engine Performance — Engine Overheating (PDF p. 3); Leakdown Test (PDF pp. 58-59)" }
      ],
      causes: [
        { cause: "Low oil level", weight: 20, test: "Oil level at the tank (warm, bike upright)", fix: "Top up; find out why it was low", urgency: "high", ride: "Do not ride far with low oil — top up first, then ride." },
        { cause: "Oil not circulating — clogged/damaged return line or damaged oil pump", weight: 20, test: "Oil light stays on above idle with the level satisfactory; oil not returning to the tank. In below-freezing conditions, ice/sludge can block the oil feed pipe", fix: "Check for a clogged or damaged return line or a damaged oil pump; clear the feed pipe", urgency: "critical", ride: "DO NOT RIDE with oil not circulating." },
        { cause: "Carburetor adjustment or jet selection wrong — running lean", weight: 20, test: "Lean symptoms per the carb-lean-idle tree (enrichener-only start, hunting idle, white plugs); jet selection vs the manual", fix: "Correct the adjustment/jetting; fix any intake leak first", urgency: "high", ride: "Do not ride far — a lean idle can overheat the rear cylinder." },
        { cause: "Ignition timing incorrect or ignition components defective", weight: 15, test: "Timing 20 deg BTDC at idle; ignition components per the ignition-misfire tree", fix: "Set timing; replace the failed ignition component", urgency: "high", ride: "Do not ride far with wrong timing." },
        { cause: "Spark plugs of the wrong heat range", weight: 10, test: "Plug heat range vs the manual (5R6A)", fix: "Fit the correct heat-range plugs", urgency: "medium", ride: "Rideable; fix soon.", part: "plugs" },
        { cause: "Leaking valves or heavy carbon deposits", weight: 15, test: "Leakdown test: air through the exhaust = leaking exhaust valve; through the carburetor = leaking intake valve. Carbon buildup: inspect the combustion chamber", fix: "Valve job / decarbonize — shop job if the heads have to come off", urgency: "high", ride: "Do not ride far — a leaking valve burns fast.", part: "heads" }
      ]
    },
    {
      id: "starter-wont-disengage",
      system: "Starting",
      title: "Starter won't disengage / grinds",
      steps: [
        { q: "Release the start button. Does the starter keep running?", yes: "next", no: "grinding", note: "If it stops normally, the complaint is the grinding noise, not a stuck starter — go to the grinding check.", cite: "Sportster 1986-2003 Troubleshooting Manual, Starter will not disengage (PDF p. 7)" },
        { q: "Test the start button switch (Chapter Twelve, Switches) and the starter relay (this chapter). Is either damaged internally / sticking?", yes: "switch-relay", no: "next", note: "A sticking switch or relay holds the solenoid energized after you let go.", cite: "Sportster 1986-2003 Troubleshooting Manual, Starter will not disengage (PDF p. 7)" },
        { q: "Is the solenoid sticking — worn solenoid compression spring (A, Figure 11)?", yes: "solenoid-stick", no: "next", note: "A worn compression spring lets the solenoid stick engaged.", cite: "Sportster 1986-2003 Troubleshooting Manual, Starter will not disengage (PDF p. 7)" },
        { q: "High-mileage bike: is the starter pinion gear (A, Figure 8) jammed on a worn clutch ring gear (B)?", yes: "ring-gear", no: "solenoid-stick", note: "A jammed pinion cannot return, so the starter keeps running. This usually requires ring-gear replacement.", cite: "Sportster 1986-2003 Troubleshooting Manual, Starter will not disengage (PDF p. 7)" },
        { q: "Loud grinding noises when the starter turns — is the pinion-to-ring-gear engagement wrong, or the overrunning clutch broken?", yes: "grinding", no: "next", note: "Incorrect pinion/ring-gear engagement (B, Figure 8) or a broken overrunning clutch mechanism (Figure 12). Remove and inspect the starter (Chapter Twelve).", cite: "Sportster 1986-2003 Troubleshooting Manual, Loud grinding noises when the starter turns (PDF p. 7)" }
      ],
      causes: [
        { cause: "Sticking solenoid — worn solenoid compression spring", weight: 30, test: "Starter keeps running after the button is released; switch and relay test good; inspect the solenoid compression spring (A, Figure 11)", fix: "Replace the solenoid if damaged", urgency: "high", ride: "Do not ride — disconnect the battery until fixed; a runaway starter will burn itself out and can damage the ring gear.", part: "starter" },
        { cause: "Starter pinion gear jammed on a worn clutch ring gear", weight: 25, test: "High-mileage bike; starter keeps running; pinion gear (A, Figure 8) jammed on the clutch ring gear (B); inspect both gears with the primary drive cover off", fix: "Replace the ring gear (and the pinion if its teeth are chipped or worn)", urgency: "high", ride: "Do not ride — disconnect the battery until fixed.", part: "starter" },
        { cause: "Start button switch or starter relay sticking / internally damaged", weight: 20, test: "Test the start switch (Chapter Twelve, Switches) and the starter relay (this chapter)", fix: "Replace the failed switch or relay", urgency: "high", ride: "Do not ride — disconnect the battery until fixed." },
        { cause: "Grinding — wrong pinion/ring-gear engagement or broken overrunning clutch", weight: 25, test: "Loud grinding when the starter turns; remove and inspect the starter (Chapter Twelve); check pinion-to-ring-gear engagement (B, Figure 8) and the overrunning clutch (Figure 12)", fix: "Correct the engagement; replace the broken overrunning clutch mechanism", urgency: "high", ride: "Do not ride until it cranks cleanly — grinding chews up the ring gear.", part: "starter" }
      ]
    }
  ],
  /* Parts & prices — moved to the shared Pocket Garage parts core
     (pg-parts-core.js, vendored verbatim; canonical copy at
     ~/workspace/github-buildout/pg-parts-core.js). Every price is read
     from the module via PG_PartsCore.getPrice(key) — the atlas `part`
     keys below are already the shared keys, so no cause text changed.
     DIY cost is the part price; shop cost stays "part + ask your shop"
     — no labor rate exists anywhere. `see` pointers are returned as-is
     by the module and never silently followed. */

  sound_hints: [
    { sound: "Lifter tick", rate: "half engine speed", test: "Check lifter bleed-down and oil", urgency: "low" },
    { sound: "Rod knock", rate: "once per revolution, worse under load", test: "Oil-pressure check FIRST", urgency: "critical" },
    { sound: "Piston slap", rate: "worse cold, fades warm", test: "Listen cold vs warm", urgency: "medium" },
    { sound: "Exhaust leak", rate: "tick that sounds like a lifter", test: "Feel for pulsing air at flanges", urgency: "low" },
    { sound: "Primary chain noise", rate: "follows engine speed at idle", test: "Chain deflection check", urgency: "medium" },
    { sound: "Misfire pops", rate: "uneven firing at idle", test: "Plug + coil checks", urgency: "medium" }
  ],
  /* Listen and compare — YouTube links ONLY, never bundled audio.
     Every label below is the uploader's claim or the thread's guess, and the
     caveat says so. A video titled "rod knock" is not proof of rod knock.
     Phone recordings also lie: they amplify mechanical sounds and dampen the
     exhaust note, so a bike can sound worse on video than in reality.
     No usable video exists for piston slap, primary chain, detonation/ping,
     starter grind, or belt noise — those need your own recordings. */
  listen_compare: [
    { sound: "Rod knock", bike: "1998 Evo 1340 Softail Custom", claim: "Knock — rod or piston?", url: "https://www.youtube.com/watch?v=nW2R1I-7AgM", caveat: "Label unresolved — the HDForums thread splits between piston, rod, lifter, and pushrods." },
    { sound: "Rod knock", bike: "Evo, noise rises and falls", claim: "Rod knock (1998 95th Anniversary Evo, tight rods)", url: "https://www.youtube.com/watch?v=dP1ZYjpyvas", caveat: "Posted as an example for a Shovelhead problem; the thread splits between rods, lifters, and the compensator." },
    { sound: "Rod knock", bike: "2000 Road King", claim: "Knock — lifter roller bearings suspected", url: "https://www.youtube.com/watch?v=m0yi1Q0oUF0", caveat: "Suspected, never confirmed." },
    { sound: "Lifter tick", bike: "1989 Evo", claim: "Lifter tick — '1989 Evo Engine Noise. Normal?'", url: "https://www.youtube.com/watch?v=M2flmkeo9mU", caveat: "The video amplifies the mechanical sounds and dampens the exhaust note — it sounds worse on video than in reality." },
    { sound: "Lifter tick", bike: "Evo, Wood W6 cam + S&S lifters", claim: "Tic-tic-tic ringing", url: "https://www.youtube.com/watch?v=wSHOIizTRpY", caveat: "Contested — pushrod tubes vs cam/pinion gears." },
    { sound: "Lifter tick", bike: "Evo, rear-cylinder tick once warm", claim: "Tick once warm", url: "https://www.youtube.com/watch?v=OH3JKnJSKSI", caveat: "Sticky exhaust valve vs rocker shaft debated." },
    { sound: "Lifter tick", bike: "2019 FLHTK (Milwaukee-Eight, not an Evo)", claim: "Cold tick — bled-down lifter", url: "https://www.youtube.com/watch?v=gmqa3FQF6Wc", caveat: "Wrong engine family, but the clearest lifter consensus found anywhere: a bled-down lifter, not piston slap." },
    { sound: "Exhaust leak", bike: "2004 Electra Glide", claim: "Ticking under load / deceleration", url: "https://www.youtube.com/watch?v=3Gn6CBujDG4", caveat: "Community leans exhaust leak; primary chain also suggested." },
    { sound: "Exhaust leak", bike: "2013 Road Glide Ultra (Twin Cam 103)", claim: "Ticking after a 2-into-1 pipe swap", url: "https://youtu.be/65RXE9BWhRM", caveat: "Never resolved — exhaust leak vs lifter vs cam-chain tensioners." },
    { sound: "Valve train noise, explained", bike: "Twin Cam / M8", claim: "Star Racing — why your Harley has excessive valve train noise", url: "https://www.youtube.com/watch?v=AeN16l47Ci4", caveat: "A teaching video, not a fault sample." }
  ],
  /* Torque & specs — FSM values live in the shared parts core
     (pg-parts-core.js). data.js keeps only the Torque tab's index:
     the §2 table id + ordered slug list (sec2), one entry per chapter
     table (id + display title/ref + ordered slugs), and the sequence
     ids. app.js resolves every row through PG_PartsCore.getTorque
     (table id + slug — never a bare fastener name; the Sportster and
     Softail clutch-cover values differ) and every sequence through
     getTorqueSequence. This index is generated from the vendored
     module — do not hand-edit slugs; re-run the generator in the
     wiring handoff if the module changes. The Sportster Clymer
     chapter stays local: it is NOT in pg-parts-core v1 (the module
     seed covers the FSM tables + the factory Sportster table only),
     and its rows mix torque with clearances, idle speeds and timing.
     capacities / tire_pressures / dimensions stay local per the
     parts-core spec §4 — they are specs, not torque. */
  torque: {
    "source": "Harley-Davidson Softail 1997-1998 Service Manual 99482-98. Section 2 (Specifications), pp. 2-1 to 2-3; chapter torque tables: §3 p. 3-2, §4 p. 4-1, §5 p. 5-1, §6 p. 6-1, §8 p. 8-1; torque sequences: §3 pp. 3-21–3-22 (head bolts, Figs. 3-16/3-17) and p. 3-66 (crankcase, Fig. 3-88); turn direction and per-head structure from the 1984–1999 Repair Manual step 6B. Covers FXSTC, FXSTS, FXSTSB, FLSTC, FLSTF, FLSTS.",
    "sec2": {
      "id": "fsm-99482-98-sec2",
      "slugs": [
        "slider-cap-nuts-flstc-flstf-fxstc",
        "front-axle-nut-fxstc-flstc-flstf",
        "front-axle-nut-fxsts-fxstsb-flsts",
        "rear-axle-nut",
        "brake-disc-screws-rear",
        "brake-disc-screws-front",
        "brake-bleeder-valve",
        "brake-pad-retainer-screw",
        "rear-wheel-sprocket-mounting-bolts",
        "rear-brake-caliper-mounting-pin-bolts",
        "rear-fender-supports",
        "rear-shock-absorber-mounting-bolts",
        "front-brake-bracket-to-fender-bracket-mounting-bolt-fxsts-fxstsb-flsts",
        "front-brake-caliper-mounting-bolts-fxstc-flstc-flstf-upper",
        "front-brake-caliper-mounting-bolts-fxsts-fxstsb-flsts-upper-1997-models-12-pt-bolt",
        "front-brake-caliper-mounting-bolts-fxsts-fxstsb-flsts-upper-1998-models-socket-head-bolt",
        "front-brake-caliper-mounting-bolts-fxsts-fxstsb-flsts-lower",
        "brake-banjo-bolts"
      ]
    },
    "chapters": [
      {
        "id": "fsm-99482-98-ch3",
        "title": "Engine",
        "ref": "FSM §3, p. 3-2",
        "slugs": [
          "crank-pin-nut",
          "pinion-gear-nut",
          "oil-pump-cover-bolts",
          "hydraulic-lifter-guide-bolts",
          "hydraulic-lifter-screen-plug",
          "rocker-cover-screws-part-no-4718a",
          "rocker-cover-screws-part-nos-3997-882",
          "rocker-cover-screws-part-nos-3501-3500",
          "cylinder-head-bolts",
          "upper-engine-mounting-bracket-to-cylinder-heads",
          "upper-engine-mounting-bracket-to-frame",
          "crankcase-stud-nut",
          "crankcase-bolt",
          "gearcase-cover-screws",
          "timer-screws-inner-cover-and-sensor-plate",
          "spark-plug"
        ]
      },
      {
        "id": "fsm-99482-98-ch4",
        "title": "Carburetor",
        "ref": "FSM §4, p. 4-1",
        "slugs": [
          "manifold-mounting-capscrews",
          "backplate-to-cylinder-head-screws",
          "backplate-to-carburetor-screws",
          "air-cleaner-cover-screw"
        ]
      },
      {
        "id": "fsm-99482-98-ch5",
        "title": "Starter",
        "ref": "FSM §5, p. 5-1",
        "slugs": [
          "thru-bolts",
          "end-cover-mounting-bracket",
          "end-cover-center-screw",
          "cable-terminal-nuts",
          "starter-mounting-bolts",
          "jackshaft-bolt"
        ]
      },
      {
        "id": "fsm-99482-98-ch6",
        "title": "Clutch & primary",
        "ref": "FSM §6, p. 6-1",
        "slugs": [
          "primary-cover-screws",
          "primary-chain-inspection-cover-screws",
          "clutch-inspection-cover-screws",
          "compensating-sprocket-nut",
          "transmission-sprocket-nut",
          "transmission-sprocket-locking-screw",
          "clutch-hub-nut-left-hand-threads",
          "clutch-adjusting-screw-jamnut"
        ]
      },
      {
        "id": "fsm-99482-98-ch8",
        "title": "Electrical & charging",
        "ref": "FSM §8, p. 8-1",
        "slugs": [
          "neutral-switch-1997-models",
          "neutral-switch-1998-models",
          "sensor-plate-screws",
          "inner-timer-cover-screws",
          "rotor-bolt",
          "alternator-stator-torx-screws",
          "alternator-sprocket-nut",
          "battery-terminal-bolts",
          "headlamp-adjustment-screws-fxsts-fxstsb-flsts",
          "passing-lamp-bracket-nuts-flstc",
          "turn-signal-module-bolt",
          "horn-cover-screws-flsts",
          "horn-nut-all-except-flsts",
          "speed-sensor-mounting-screw",
          "handlebar-clamp-master-cylinder-torx-screws",
          "upper-and-lower-switch-housing-torx-screws",
          "handlebar-clamp-clutch-lever-bracket-torx-screws"
        ]
      },
      {
        "id": "sportster-86-03",
        "title": "Sportster (1986–2003)",
        "ref": "Sportster 1986–2003 Service Manual (sportster-86-03). These are Sportster values, NOT corrections to the Softail tables above — same fastener, different bike. Use only on 1986–2003 Sportsters.",
        "slugs": [
          "clutch-inspection-cover-screws",
          "spark-plug"
        ]
      }
    ],
    "sequences": [
      "head-bolts",
      "crankcase"
    ],
    "clymer": {
      "title": "Sportster — Clymer tables (1986–2003)",
      "ref": "Clymer Sportster 1986–2003, Ch. 3 Tables 7–9 (p. 150), read visually. AFTERMARKET — every value Clymer, never factory. Sportster values, NOT corrections to the Softail tables above or to the factory Sportster chapter. Use only on 1986–2003 Sportsters.",
      "rows": [
        {
          "fastener": "Brake pad minimum thickness (Clymer Table 7)",
          "value": "0.062 in (1.59 mm)"
        },
        {
          "fastener": "Clutch cable free play (Clymer Table 7)",
          "value": "1/16–1/8 in (1.6–3.2 mm)"
        },
        {
          "fastener": "Drive belt deflection, 1991–1999 (Clymer Table 7)",
          "value": "9/16–11/16 in (14.3–17.5 mm)"
        },
        {
          "fastener": "Drive belt deflection, 2000–2003, 883/1200/1200S (Clymer Table 7)",
          "value": "5/16–3/8 in (7.9–9.6 mm)"
        },
        {
          "fastener": "Drive belt deflection, 2000–2003, 883H and 883C (Clymer Table 7)",
          "value": "1/4–5/16 in (6.4–7.9 mm)"
        },
        {
          "fastener": "Drive chain (Clymer Table 7)",
          "value": "No. 530 (3/8 in wide) x 110 links"
        },
        {
          "fastener": "Drive chain free play (Clymer Table 7)",
          "value": "1/4 in (6.4 mm)"
        },
        {
          "fastener": "Engine compression, minimum (Clymer Table 7)",
          "value": "120 psi (828 kPa)"
        },
        {
          "fastener": "Idle speed, 1986–1987 slow idle (Clymer Table 7)",
          "value": "900–950 rpm"
        },
        {
          "fastener": "Idle speed, 1986–1987 fast idle (Clymer Table 7)",
          "value": "1500–1500 rpm (as printed) — Book prints 1500–1500; likely a misprint, unverified"
        },
        {
          "fastener": "Idle speed, 1988–2003 (Clymer Table 7)",
          "value": "1000–1050 rpm"
        },
        {
          "fastener": "Primary chain free play, cold engine (Clymer Table 7)",
          "value": "3/8–1/2 in (9.6–12.7 mm)"
        },
        {
          "fastener": "Primary chain free play, hot engine (Clymer Table 7)",
          "value": "1/4–3/8 in (6.4–9.6 mm)"
        },
        {
          "fastener": "Spark plugs (Clymer Table 7)",
          "value": "HD-6R12, gap 0.038–0.043 in (0.97–1.09 mm)"
        },
        {
          "fastener": "Tire wear / maximum tread depth (Clymer Table 7)",
          "value": "1/16 in (1.6 mm)"
        },
        {
          "fastener": "Ignition timing, 1986–1994, fast idle 1650–1750 rpm (Clymer Table 8)",
          "value": "VOES connected: 40° BTDC · VOES disconnected: Approx. 16° BTDC"
        },
        {
          "fastener": "Ignition timing, 1986–1994, normal 950–1050 rpm (Clymer Table 8)",
          "value": "VOES connected: 30° BTDC · VOES disconnected: Approx. 7.5° BTDC"
        },
        {
          "fastener": "Ignition timing, 1995 U.S., 1650–1950 rpm (Clymer Table 8)",
          "value": "VOES connected: 35° BTDC · VOES disconnected: Approx. 16° BTDC"
        },
        {
          "fastener": "Ignition timing, 1995 HDI, 1000–1050 rpm (Clymer Table 8)",
          "value": "VOES connected: 20° BTDC · VOES disconnected: Approx. 7.5° BTDC"
        },
        {
          "fastener": "Ignition timing, 1996–2003 (except 1998–2003 1200S), 1000–1050 rpm (Clymer Table 8)",
          "value": "VOES connected: 20° BTDC · VOES disconnected: Approx. 7.5° BTDC"
        },
        {
          "fastener": "Ignition timing, 1998–2000 1200S, 1000–1050 rpm (no VOES) (Clymer Table 8)",
          "value": "VOES connected: 20° BTDC · VOES disconnected: —"
        },
        {
          "fastener": "Ignition timing, 2001–2003 1200S, 1000–1050 rpm (no VOES) (Clymer Table 8)",
          "value": "VOES connected: 15° BTDC · VOES disconnected: —"
        },
        {
          "fastener": "Air filter cover (Clymer Table 9)",
          "value": "36–60 in-lbs (4–7 Nm)"
        },
        {
          "fastener": "Front fork cap, 1200S only (Clymer Table 9)",
          "value": "11–22 ft-lbs (15–30 Nm)"
        },
        {
          "fastener": "Primary chain adjuster locknut, 1986–1990 (Clymer Table 9)",
          "value": "98–144 in-lbs (11–16 Nm)"
        },
        {
          "fastener": "Primary chain adjuster locknut, 1991–2003 (Clymer Table 9)",
          "value": "20–25 ft-lbs (27–34 Nm)"
        },
        {
          "fastener": "Primary drive inspection cover retaining screws (Clymer Table 9)",
          "value": "84–108 in-lbs (10–12 Nm)"
        },
        {
          "fastener": "Rear axle nut (Clymer Table 9)",
          "value": "60–65 ft-lbs (81–88 Nm)"
        },
        {
          "fastener": "Transmission / primary chaincase drain plug (Clymer Table 9)",
          "value": "14–21 ft-lbs (19–28 Nm)"
        }
      ]
    },
    "capacities": {
      "all": "Oil tank 3.0 qt (with filter) · Transmission 24 oz · Primary chaincase 32 oz (1997) / 26 oz (1998)",
      "flstc": "Fuel tank 4.2 gal (0.4 reserve) · Front fork 11.5 oz each (wet, except Springers) — FLSTC / FLSTF / FLSTS / FXSTS / FXSTSB",
      "fxstc": "Fuel tank 5.2 gal (0.6 reserve) · Front fork 10.2 oz each (wet) — FXSTC",
      "sportster": "Sportster transmission / primary: 24 oz (1986–1992) · 32 oz (1993–2003) (sportster-86-03)"
    },
    "tire_pressures": {
      "flstc": "FLSTC / FLSTF / FLSTS — solo 36 front / 36 rear · rider + passenger 36 / 40",
      "fxstc": "FXSTC / FXSTS / FXSTSB — solo 30 front / 36 rear · rider + passenger 30 / 40",
      "note": "Dunlop only, cold. Never exceed the maximum pressure on the tire sidewall."
    },
    "dimensions": [
      {
        "model": "FLSTC",
        "length": "94.0 in",
        "wheelbase": "63.9 in",
        "saddle": "26.5 in",
        "height": "59.4 in",
        "dry": "704 lb",
        "gvwr": "1,118 lb"
      },
      {
        "model": "FLSTF",
        "length": "93.9 in",
        "wheelbase": "63.9 in",
        "saddle": "26.5 in",
        "height": "48.0 in",
        "dry": "631 lb",
        "gvwr": "1,118 lb"
      },
      {
        "model": "FLSTS",
        "length": "94.0 in",
        "wheelbase": "63.1 in",
        "saddle": "25.8 in",
        "height": "44.0 in",
        "dry": "690 lb",
        "gvwr": "1,135 lb"
      },
      {
        "model": "FXSTC",
        "length": "94.92 in",
        "wheelbase": "66.5 in",
        "saddle": "26.7 in",
        "height": "47.0 in",
        "dry": "613 lb",
        "gvwr": "1,084 lb"
      },
      {
        "model": "FXSTS",
        "length": "92.5 in",
        "wheelbase": "64.4 in",
        "saddle": "26.1 in",
        "height": "47.0 in",
        "dry": "625 lb",
        "gvwr": "1,084 lb"
      },
      {
        "model": "FXSTSB",
        "length": "92.5 in",
        "wheelbase": "64.4 in",
        "saddle": "25.7 in",
        "height": "47.0 in",
        "dry": "620 lb",
        "gvwr": "1,084 lb"
      }
    ]
  },
  /* "Before you start" safety block (batch 2, Nov 25, 2026). One consistent
     block, rendered at the top of every guided hands-on card (battery &
     charging, compression test, sag setter). Generic shop safety — NOT a
     manual procedure — except the battery items, which are FSM #99482-98
     §8 warnings (acid, eye protection, charger clamps). The compression
     test needs a WARM engine, so the cool-engine item names its own
     exception rather than contradicting the card it sits on. */
  safety_block: {
    title: "Before you start",
    note: "Generic shop safety — not a manual procedure. The battery items are FSM #99482-98 §8 warnings.",
    items: [
      "Ignition OFF before you touch plugs, wires, or the battery.",
      "Work on a cool engine — unless the card says warm (the compression test needs a warm engine).",
      "Eye protection on near the battery — batteries hold sulfuric acid.",
      "No sparks or open flame near fuel or the battery.",
      "Bike in neutral, on a stable stand, wheels chocked."
    ]
  },
  /* Sportster CV jetting / tire pressures / fork oil (batch 2, Nov 25, 2026).
     Clymer Sportster 1986–2003, read visually off the page renders (the FTS
     OCR text scrambles table columns). AFTERMARKET — every value labeled
     Clymer, never factory, never presented as a correction to Softail
     values. Flag every value as Sportster. CV40 carburetor jet sizes;
     1200S has its own main jet in 1998–2003 rows. */
  sportster_cv_jetting: {
    source: "Clymer Sportster 1986–2003, Ch. 11 Table 1 (p. 390), read visually",
    note: "CV40 carburetor jet sizes. 1200S has its own main jet in 1998–2003 rows.",
    usExceptCalifornia: {
      label: "U.S. except California",
      main: [
        { years: "1988", m883: 170, m1200: 200 },
        { years: "1989–1991", m883: 175, m1200: 175 },
        { years: "1992–1995", m883: 160, m1200: 170 },
        { years: "1996", m883: 160, m1200: 179 },
        { years: "1997", m883: 160, m1200: 170 },
        { years: "1998–2003", m883: 160, m1200: 170, m1200S: 195, note: "1200/1200C 170; 1200S 195" }
      ],
      pilot: [
        { years: "1988", m883: 35, m1200: 35 },
        { years: "1989–1991", m883: 45, m1200: 45 },
        { years: "1992–1995", m883: 40, m1200: 40 },
        { years: "1996–2003", m883: 42, m1200: 42 }
      ]
    },
    california: {
      label: "California",
      main: [
        { years: "1988", m883: 165, m1200: 180 },
        { years: "1989", m883: 155, m1200: 160 },
        { years: "1990–1991", m883: 160, m1200: 160 },
        { years: "1992", m883: 160, m1200: 170 },
        { years: "1993–1997", m883: 170, m1200: 185 },
        { years: "1998–2003", m883: 170, m1200: 185, m1200S: 195, note: "1200/1200C 185; 1200S 195" }
      ],
      pilot: [
        { years: "1988", m883: 35, m1200: 35 },
        { years: "1989", m883: 42, m1200: 42 },
        { years: "1990–1991", m883: 42, m1200: 42 },
        { years: "1992–1995", m883: 40, m1200: 40 },
        { years: "1996–2003", m883: 42, m1200: 42 }
      ]
    },
    hdi: {
      label: "HDI (international)",
      main: [
        { years: "1993–1994", m883: 160, m1200: 160 },
        { years: "1995–1997", m883: 190, m1200: 190 },
        { years: "1998", m883: 190, m1200: 190, m1200S: 195, note: "1200/1200C 190; 1200S 195" },
        { years: "1999–2003", m883: 190, m1200: 200 }
      ],
      pilot: [
        { years: "1993–1994", m883: 40, m1200: 40 },
        { years: "1995–2003", m883: 42, m1200: 42 }
      ]
    },
    swiss: {
      label: "Swiss",
      main: [
        { years: "1995", m883: 160, m1200: 160 },
        { years: "1996–1997", m883: 190, m1200: 190 },
        { years: "1998", m883: 190, m1200: 190, m1200S: 195, note: "1200/1200C 190; 1200S 195" },
        { years: "1999–2003", m883: 190, m1200: 200 }
      ],
      pilot: [
        { years: "1995", m883: 40, m1200: 40 },
        { years: "1996–2003", m883: 42, m1200: 42 }
      ]
    },
    floatHeight: [
      { years: "1988–1991", value: "0.725–0.730 in (18.4–18.5 mm)" },
      { years: "1992–2003", value: "0.413–0.453 in (10.5–11.5 mm)" }
    ]
  },
  sportster_tire_pressures: {
    source: "Clymer Sportster 1986–2003, Ch. 3 Table 2 (p. 149), read visually",
    note: "Cold pressures, original-equipment tires. Aftermarket tires may need a different pressure. 300 lb load includes rider, passenger and cargo. GVWR is on a decal on the frame.",
    upTo300lb: {
      front: [
        { models: "1200 models", psi: 30, kpa: 207 },
        { models: "883 and 1100 models, 1986–1990", psi: 26, kpa: 179 },
        { models: "883 and 1100 models, 1991–2003", psi: 30, kpa: 207 }
      ],
      rear: [
        { models: "1200 models", psi: 36, kpa: 248 },
        { models: "883 and 1100 models, 1986–1990", psi: 30, kpa: 207 },
        { models: "883 and 1100 models, 1991–2003", psi: 36, kpa: 248 }
      ]
    },
    upToGVWR: {
      front: [
        { models: "1200 models", psi: 30, kpa: 207 },
        { models: "883 and 1100 models, 1986–1990", psi: 26, kpa: 179 },
        { models: "883 and 1100 models, 1991–2003", psi: 30, kpa: 207 }
      ],
      rear: [
        { models: "1200 models", psi: 40, kpa: 276 },
        { models: "883 and 1100 models, 1986–1990", psi: 32, kpa: 221 },
        { models: "883 and 1100 models, 1991–2003", psi: 40, kpa: 276 }
      ]
    }
  },
  sportster_fork_oil: {
    source: "Clymer Sportster 1986–2003, Ch. 3 Table 6 (p. 150), read visually",
    note: "Front fork oil capacity per leg. Wet = after a drain; dry = after a full disassembly. Fork oil: H-D Type E or equivalent (Table 5, p. 149).",
    rows: [
      { years: "1986–1987", wetOz: 5.4, wetMl: 160, dryOz: 6.4, dryMl: 189 },
      { years: "1988–1991", wetOz: 9.0, wetMl: 266, dryOz: 10.2, dryMl: 302 },
      { years: "1992–1998, 883 Hugger", wetOz: 10.7, wetMl: 316, dryOz: 12.1, dryMl: 358 },
      { years: "1992–1998, all other models", wetOz: 9.0, wetMl: 266, dryOz: 10.2, dryMl: 302 },
      { years: "1999–2003", wetOz: 9.0, wetMl: 266, dryOz: 10.2, dryMl: 302 }
    ]
  },
  /* Knucklehead tire inflation pressures — Knucklehead 1940-1947 Service
     Manual p. 3, "TIRE INFLATION PRESSURES" table, read visually
     Nov 25, 2026. NOTE: the second tire size is 5.00" x 16", NOT 5.00 x 18
     — the page prints 5.00" x 16" Tire. Pressures are in lbs. (psi).
     Basis: rider and passenger weight of approximately 150 lbs. each;
     Package Truck load 150 lbs. Overload rule (printed below the table):
     when loads are exceeded by 50 lbs. or more, for each 50 lbs. of
     overload increase rear tire 2 lbs., front tire 1 lb., sidecar or
     package truck tire 1 lb. */
  knucklehead_tire_pressures: {
    source: "Knucklehead 1940–1947 Service Manual, p. 3",
    note: "Cold pressures in lbs. (psi), as printed. Based on rider and passenger weight of approximately 150 lbs. each; Package Truck load 150 lbs. Overload: when loads are exceeded by 50 lbs. or more, for each 50 lbs. of overload increase rear tire 2 lbs., front tire 1 lb., sidecar or package truck tire 1 lb.",
    rows: [
      { load: "Solo — Rider Only", tire: "4.00\" x 18\" Tire", front: 14, rear: 16, sidecar: null, packageTruck: null },
      { load: "Solo — Rider Only", tire: "5.00\" x 16\" Tire", front: 12, rear: 14, sidecar: null, packageTruck: null },
      { load: "Solo — Rider and One Passenger", tire: "4.00\" x 18\" Tire", front: 18, rear: 26, sidecar: null, packageTruck: null },
      { load: "Solo — Rider and One Passenger", tire: "5.00\" x 16\" Tire", front: 12, rear: 16, sidecar: null, packageTruck: null },
      { load: "Sidecar — Rider and One Sidecar Passenger or 150 lb. Sidecar Load", tire: "4.00\" x 18\" Tire", front: 20, rear: 24, sidecar: 14, packageTruck: null },
      { load: "Sidecar — Rider and One Sidecar Passenger or 150 lb. Sidecar Load", tire: "5.00\" x 16\" Tire", front: 14, rear: 16, sidecar: 14, packageTruck: null },
      { load: "Package Truck — Rider and 150 lb. Truck Load", tire: "4.00\" x 18\" Tire", front: 22, rear: 30, sidecar: null, packageTruck: 16 },
      { load: "Package Truck — Rider and 150 lb. Truck Load", tire: "5.00\" x 16\" Tire", front: 14, rear: 20, sidecar: null, packageTruck: 14 }
    ]
  },
  /* Local spots — Joshua's home turf, Glendale/Phoenix AZ. Every entry was
     verified from a live listing Nov 24, 2026 (address + phone + website).
     Call ahead — hours and services change. This list is Glendale only;
     other riders' towns aren't in here. NOTE: Harley-Davidson of Glendale
     is NOT on this list — the one with that name and the (818) number is in
     Glendale, California. The nearest Arizona dealer is Arrowhead, Peoria. */
  charging_tests: {
    ref: "FSM #99482-98 section 8, pp. 8-21 to 8-28",
    intro: "Work in order — battery first, then stator, then regulator. A dead battery makes every other reading lie. You need a multimeter, and a load tester for step 2.",
    steps: [
      { title: "Battery voltage at rest", how: "Multimeter across the posts, bike off, battery sat at least 1 hour.", pass: "13.0V = 100%, 12.8V = 75%, 12.5V = 50%, 12.2V = 25%.", fail: "Below 12.8V — charge it (constant current 1.8A: 75% takes 3-5 hrs, 50% 4-7 hrs, 25% 10 hrs) and recheck after it sat 1-2 hours. Still below 12.8V after 10 hours on the charger — replace the battery." },
      { title: "Battery load test", how: "Fully charge first. Load to 3x the amp-hour rating — 54 amps for the 18Ah YTX20L-BS — for 15 seconds.", pass: "Voltage holds 9.6V or more at 70F (21C) through the test.", fail: "Drops below 9.6V — the battery is done, replace it." },
      { title: "Charging voltage", how: "Start the bike, multimeter on the battery. Read at idle, then at 3,600 rpm.", pass: "14.3-14.7V at 3,600 rpm (at 75F).", fail: "Over 15V with the load removed — regulator not working, or loose/dirty connections. Under 13V at speed — go to the stator tests." },
      { title: "Stator AC output", how: "Unplug the regulator at the crankcase. AC voltmeter across both stator sockets, engine at 2,000 rpm.", pass: "32-40 AC volts (16-20 per 1,000 rpm).", fail: "Below spec — faulty rotor or stator; replace, then recheck charging voltage." },
      { title: "Stator resistance + ground check", how: "Ignition off, regulator unplugged. Ohmmeter RX1: crankcase to either stator socket, then across the two sockets.", pass: "No continuity crankcase-to-socket (infinite ohms); 0.1-0.2 ohms across the sockets.", fail: "Any continuity to the case = grounded stator, replace it. Under 0.1 ohms across the sockets = damaged stator, replace it." },
      { title: "Regulator bleed test", how: "Regulator connected to the battery, unplugged at the crankcase. Trouble light: one probe to a good ground, the other to each regulator pin in turn.", pass: "Light stays off on every pin.", fail: "Light glows on any pin — replace the regulator." },
      { title: "Milliamp draw (bike off)", how: "Ammeter between the negative battery terminal and the cable. Ignition off, all lights off.", pass: "No more than 3 milliamps.", fail: "More than 3 mA — something is draining the battery with the bike parked. Accessories wired to stay on are the usual suspect." },
      { title: "Total current draw vs output", how: "Regulator unplugged from the stator, bike running, everything on (headlamp high beam). Read total draw; compare with the output test (load tester on the battery, 3,000 rpm, hold 13.0V — output should be 26-32 amps).", pass: "Output exceeds draw by 3.5 amps minimum.", fail: "Closer than that — too many accessories for the charging system; shed load or upgrade." }
    ],
    notes: [
      "Battery is a YTX20L-BS on 1997-98 Softails (18Ah, sealed maintenance-free — never add water, never remove the cap strip). The 1990 takes a different battery (Yuasa YB16-B); the load rule is still 3x its amp-hour rating.",
      "Warnings from the manual: batteries hold sulfuric acid — eye protection on; unplug the charger before connecting or disconnecting clamps; never reverse the charger leads; stop charging if the battery gets hot (over 110F).",
      "Never leave a load-tester load switch on for more than 20 seconds.",
      "Sportster charging (sportster-86-03): stator 1986–90: 12–18 VAC/1,000 rpm; 1991–94: 19–26; 1995–2003: 38–52 at 2,000 rpm; stator resistance 0.2–0.4 Ω. Regulator 1986–93: 13.8–15 VDC; 1994–2003: 14.3–14.7 VDC. System output 19–23 A DC at 3,000 rpm holding 13.0 V; 19 A @ 3,600 rpm (1986–90) / 22 A (1991–2003). Battery 12V 19 Ah — not the Softail 18 Ah."
    ]
  },
  /* Compression test — FSM #99482-98 §3, pp. 3-11–3-12. Same guided shape
     as charging_tests: steps in order, each with how/pass/fail, plus the
     diagnostic chart. Tool: Cylinder Compression Gauge Part No. HD-33223-1,
     screw-in type adapter. FLAG: the manual publishes NO "standard" or
     maximum compression value — 90 psi is the minimum only. Do not present
     any higher "normal" number. */
  compression_tests: {
    ref: "FSM #99482-98 §3, pp. 3-11–3-12",
    intro: "Work in order — warm engine, both plugs out, throttle wide open. A cold engine or a closed throttle makes the readings lie.",
    tool: "Cylinder Compression Gauge Part No. HD-33223-1, screw-in type adapter.",
    steps: [
      { title: "Prep", how: "Engine at normal operating temperature. Disconnect spark plug wires, clean around plug base, remove both plugs.", pass: "Plugs out, tester ready.", fail: "Cold engine or plugs in — readings will lie." },
      { title: "Front cylinder", how: "Connect tester to the front cylinder per the tester's instructions. Transmission in neutral. Choke and carburetor throttle plates wide open. Crank continuously through 5 to 7 full compression strokes.", pass: "Note readings at the end of the first and last strokes; record both.", fail: "Throttle closed or fewer than 5 strokes — redo it." },
      { title: "Rear cylinder", how: "Repeat step 2 on the rear cylinder.", pass: "Both cylinders recorded.", fail: "—" },
      { title: "Verdict", how: "Compare the final readings.", pass: "Final readings 90 psi (620 kN/m²) or more AND no more than 10% variance between cylinders = compression normal.", fail: "Below 90 psi or more than 10% apart — see the diagnostic chart below." },
      { title: "Wet test", how: "Inject approx. 1/2 oz (15 ml) engine oil into each cylinder and repeat the test on both cylinders.", pass: "Readings about the same as the dry test — rings are sealing.", fail: "Readings considerably higher than the dry test = worn piston rings." },
      { title: "After", how: "Reinstall plugs. Be sure the throttle plate is in the CLOSED position before starting the engine.", pass: "Plugs in, throttle closed.", fail: "—" }
    ],
    chart: [
      { label: "Ring trouble", text: "Compression low on first stroke, builds on following strokes but does not reach normal; improves considerably with oil." },
      { label: "Valve trouble", text: "Low on first stroke, does not build much; does not improve with oil; check pushrod length." },
      { label: "Head gasket leak", text: "Same reaction as valve trouble." }
    ],
    leakdown: "Leakdown tester HD-35667; 5th gear + locked rear brake; leakage greater than 10% = internal problems; listen at the carb intake (intake valve), the exhaust pipe (exhaust valve), and the timing inspection hole (rings/piston/cylinder/head gasket).",
    notes: [
      "Gauge: Cylinder Compression Gauge Part No. HD-33223-1, screw-in type adapter.",
      "Low compression by itself indicates improperly seated valves, not worn rings (FSM §3 p. 3-11).",
      "The manual publishes NO 'standard' or maximum compression value — 90 psi is the minimum only. Do not present any higher number as 'normal'.",
      "Sportster (sportster-86-03): normal compression 120 psi, within 10 psi between cylinders — different from the Softail 90 psi minimum above. Use the Sportster figures only on Sportsters."
    ]
  },
  local_shops: [
    { name: "Arrowhead Harley-Davidson", kind: "Dealer — parts, service, sales", address: "16130 N Arrowhead Fountains Center Dr, Peoria, AZ", phone: "(623) 343-6190", url: "https://www.arrowheadharley.com/", note: "Nearest Harley dealer. 4.5 stars (836 reviews)." },
    { name: "Gnarly's V-Twin", kind: "Repair + parts", address: "6715 N Sunset Blvd Ste 320, Glendale, AZ", phone: "(480) 478-2038", url: "https://www.gnarlysvtwin.com/", note: "Closest independent in the search — under half a mile from you." },
    { name: "Highway Choppers", kind: "Repair + restoration", address: "6723 W Glendale Ave, Glendale, AZ", phone: "(623) 939-9083", url: "http://www.hwcclassics.com/", note: "Vintage iron — knuckles, pans, shovels on the floor. 4.9 stars." },
    { name: "Oscar's Bikes and Jetskis", kind: "Repair", address: "5023 N 54th Ave, Glendale, AZ", phone: "(623) 937-1523", url: "http://www.motorcycleandjetskirepairphoenix.com/", note: "25+ years; one of the few shops that works on old bikes of any age or make." },
    { name: "Tex's Cycles", kind: "Repair", address: "5808 W San Miguel Ave, Glendale, AZ", phone: "(623) 692-7253", url: "http://www.texscycles.com/", note: "Independent repair shop in Glendale." },
    { name: "Voodoo Bikeworks", kind: "Custom builds + parts", address: "6826 N 55th Dr, Glendale, AZ", phone: "(602) 997-2453", url: "http://www.voodoobikeworks.com/", note: "Custom shop — aftermarket parts and builds for Harleys. 4.4 stars (1,357 reviews)." },
    { name: "Cycle Gear — Peoria", kind: "Parts + gear", address: "8337 W Bell Rd Ste 101, Peoria, AZ 85382", phone: "(602) 313-6371", url: "https://www.cyclegear.com/stores", note: "Closest Cycle Gear — parts, gear, tires. About 8 miles." },
    { name: "Midcity Used Motorcycle Parts", kind: "Used parts", address: "50006 N 51st Ave, Glendale, AZ", phone: "(623) 931-0844", url: "", note: "Used parts, right in Glendale." },
    { name: "Ramjet Racing", kind: "Repair, fabrication, dyno + parts", address: "12001 N Cave Creek Rd, Phoenix, AZ 85020", phone: "(602) 788-0364", url: "https://www.ramjetracing.com/", note: "Fabrication, engine and transmission work, dyno tuning, electrical diagnostics — and the largest in-stock aftermarket parts inventory in the Southwest. 4.8 stars (133 reviews)." },
    { name: "8 Ball Motorcycle Tires", kind: "Motorcycle tires — installed while you wait", address: "1621 E McDowell Rd, Phoenix, AZ 85006", phone: "(833) 448-2255", url: "https://8ball.tires/", note: "1,000+ motorcycle tires in stock, installed while you wait. Also hosts chopper events." },
    { name: "Eleven10 Moto Garage", kind: "Motorcycle collective — DIY workshop + community hub", address: "1710 N 16th St, Phoenix, AZ 85006", phone: "(480) 485-5198", url: "https://eleven10garage.com/", note: "Co-op DIY workshop space for vintage, classic, and retro bikes. Two Wheel Tuesday open house every third Tuesday, 7-11 PM." }
  ],
  parts_suppliers: [
    { name: "J&P Cycles", url: "https://www.jpcycles.com/", note: "Best fitment tables + hosted manufacturer instruction PDFs" },
    { name: "Dennis Kirk", url: "https://www.denniskirk.com/", note: "Photos + instruction PDFs + OEM cross-reference" },
    { name: "RevZilla", url: "https://www.revzilla.com/", note: "Fitment tables + hosted instruction PDFs" },
    { name: "Harley SIP (free to view)", url: "https://serviceinfo.harley-davidson.com/sip/search/", note: "Factory parts catalogs, exploded diagrams + part tables" },
    { name: "Ronnie's HLSM fiche", url: "https://www.ronniesmailorder.com/", note: "Same factory fiche; * marks superseded parts" },
    { name: "Ronnie's fiche — 1995 FLSTF Fat Boy (model 203)", url: "https://partsfinder.onlinemicrofiche.com/ronnies/showmodel/13/harleydavidsonmc/203/%20/1995%20Harley%20Davidson%20Street%20Bike%20FLSTF%20FAT%20BOY%20(BM)", note: "Factory parts fiche for the 1995 Fat Boy — exploded diagrams + part numbers. Link only, no scraped content. Verified live Nov 25, 2026. The 1990 FLSTC has no page in Ronnie's system (the 1990 block is Sportsters only) — no link." }
  ],
  /* Joshua's own bikes — the ground truth for the atlas. His photos, not stock. */
  own_photos: [
    { file: "assets/softail-1990-joshua.jpg", subject: "1990 Softail — Joshua's bike, in the garage", credit: "Joshua's own photo (still from his Nov 24, 2026 video)", in_photo_map: true }
  ],
  cc_photos: [
    { file: "assets/fat-boy-1992.jpg", subject: "1992 Fat Boy", credit: "Calreyn88, CC BY 4.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley-Davidson_Fat_Boy_1992.jpg" },
    { file: "assets/fat-boy-1990-museum.jpg", subject: "1990 FLSTF Fat Boy, Harley Museum", credit: "Michael Barera, CC BY-SA 4.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley-Davidson_Museum_May_2024_17_(1990_FLSTF_Fat_Boy--OHV_V-Twin).jpg" },
    { file: "assets/heritage-softail-classic.jpg", subject: "Heritage Softail Classic", credit: "David Adam Kess, CC BY-SA 4.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley_Davidson_Heritage_Softail_Classic.jpg" },
    { file: "assets/xlh-1200-modded.jpg", subject: "XLH 1200 (modded)", credit: "Blakegripling ph, CC BY-SA 3.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:XLH_1200_modded.jpg" },
    { file: "assets/knucklehead-engine-room.jpg", subject: "Knucklehead engine room 1936-47, Harley Museum", credit: "Michael Barera, CC BY-SA 4.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley-Davidson_Museum_February_2024_11_(Engine_Room--Knucklehead,_1936-47).jpg" },
    { file: "assets/knucklehead-bike.jpg", subject: "Knucklehead bike", credit: "Triple-green, CC BY-SA 2.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley_Davidson_Knucklehead_(23969680887).jpg" },
    { file: "assets/evo-engine-room.jpg", subject: "Evolution engine room 1984-99, Harley Museum", credit: "Michael Barera, CC BY-SA 4.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley-Davidson_Museum_February_2024_14_(Engine_Room--Evolution,_1984-99).jpg" },
    { file: "assets/evo-sportster-engine-room.jpg", subject: "Evolution Sportster engine room, Harley Museum", credit: "Michael Barera, CC BY-SA 4.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley-Davidson_Museum_February_2024_24_(Engine_Room--Evolution_Sportster,_1986-present).jpg" },
    { file: "assets/v-twin-valve-diagram.jpg", subject: "V-twin valve diagram", credit: "Ericd, CC BY-SA 3.0, via Wikimedia Commons", page: "https://commons.wikimedia.org/wiki/File:Harley_V-twin_valve_diagram.jpg" }
  ],
  /* Shop tools (Nov 25, 2026 batch 1). Same rule as the rest of the app:
     every number is a published fact with its source. Magazine items are
     flagged "NOT an FSM cause" (or "magazine" here); a value the library
     does not publish is left out and the gap is named, never filled in. */
  shop: {
    plug_reader: {
      ref: "1984-1999 Softail Repair Manual, Ch. 3, p. 112 (Spark Plug Condition); install/cleaning notes p. 113. Sportster 1986-2003, p. 143 carries the same chart.",
      plug: "5R6A",
      gap: "0.038-0.043",
      conditions: [
        { name: "Normal", look: "Light tan or gray deposits on the firing tip.", cause: "A healthy plug — this is what right looks like.", action: "Leave it. Can be cleaned and returned to use.", see: "" },
        { name: "Gap bridged", look: "Deposit buildup closing the gap between the electrodes.", cause: "Oil or carbon fouling.", action: "Clean if the deposits are not excessive; then find the fouling source below.", see: "" },
        { name: "Carbon fouled", look: "Black, dry fluffy carbon deposits on insulator tips, exposed shell surfaces and electrodes.", cause: "Too cold a plug, weak ignition, dirty air cleaner, too rich a fuel mixture, or excessive idling.", action: "Clean the plug, then fix the rich mixture.", see: "Rich running / flooding tree (Diagnose tab)" },
        { name: "Fused spot deposit", look: "Melted or spotty deposits resembling bubbles or blisters.", cause: "Sudden acceleration.", action: "Can be cleaned.", see: "" },
        { name: "Lead fouled", look: "Dark gray, black, yellow, or tan deposits, or a fused glazed coating on the insulator tip.", cause: "Highly leaded gasoline.", action: "Can be cleaned.", see: "" },
        { name: "Overheating", look: "White or light gray insulator with small black or gray-brown spots, and a bluish-burnt appearance of the electrodes.", cause: "Engine overheating, wrong type of fuel, loose spark plugs, too hot a plug, or incorrect ignition timing.", action: "Replace the plug; find the heat source — white reads lean.", see: "Lean idle / won't hold idle tree (Diagnose tab)" },
        { name: "Oil fouled", look: "Wet black deposits on the insulator, shell bore and electrodes.", cause: "Excessive oil entering the combustion chamber through worn rings and pistons, excessive clearance between valve guides and stems, or worn or loose bearings.", action: "Can be cleaned. If the engine is not repaired, use a hotter plug.", see: "Compression test card (Diagnose tab) — wet test separates rings from valves" },
        { name: "Worn electrodes", look: "Severely eroded or worn electrodes.", cause: "Normal wear.", action: "Replace the plug.", see: "" },
        { name: "Preignition", look: "Melted electrodes and possibly a blistered insulator. Metallic deposits on the insulator indicate engine damage.", cause: "Wrong type of fuel, incorrect ignition timing or advance, too hot a plug, burned valves, or engine overheating.", action: "Replace the plug; check timing and valves before riding.", see: "Misfire / missing / hard starting when hot tree (Diagnose tab)" }
      ],
      notes: [
        "Blow dirt out of the plug wells before removing plugs — dirt falling into the cylinders causes serious engine damage (Repair Manual p. 113).",
        "Do NOT clean plugs with a sand-blast type device — abrasive left in the plug can fall into the engine (Repair Manual p. 113).",
        "Gap new plugs with a wire gauge: correct gap feels like a slight drag as the wire pulls through. Put a small drop of oil or anti-seize on the threads (Repair Manual p. 113).",
        "The Diagnose tab photo upload gives a rough color read from a photo; this card is the reference it reads against."
      ]
    },
    wire_fuse: {
      ref: "FSM #99482-98 §8 p. 8-1 (circuit breaker ratings); App. A Table 2, 1997 Main Harness Part No. 70216-96 (wire gauges); App. A p. A-20 (starter cable).",
      breakers: [
        { circuit: "Main", amps: 30 },
        { circuit: "Ignition", amps: 15 },
        { circuit: "Lights", amps: 15 },
        { circuit: "Accessory", amps: 15 },
        { circuit: "Instruments", amps: 15 }
      ],
      wires: [
        { circuit: "Main circuit breaker feed", gauge: "12" },
        { circuit: "Starter terminal / starter-to-breaker cable", gauge: "10" },
        { circuit: "Starter relay terminals 30 / 87", gauge: "14" },
        { circuit: "Fuse block positions 5-8", gauge: "14" },
        { circuit: "Ignition module", gauge: "16" },
        { circuit: "Harness grounds (under seat)", gauge: "16" },
        { circuit: "Oil pressure sending unit", gauge: "18" },
        { circuit: "Rear brake light switch", gauge: "18" },
        { circuit: "Horn", gauge: "18" },
        { circuit: "Starter relay terminals 85 / 86", gauge: "18" },
        { circuit: "Fuse block positions 1-4", gauge: "18" },
        { circuit: "Neutral switch", gauge: "18" },
        { circuit: "Coil", gauge: "18" },
        { circuit: "Taillight & rear turn signals", gauge: "18" }
      ],
      notes: [
        "Evo Softails use circuit breakers, not fuses — the 'fuse block' in the harness table is the breaker block. If a breaker keeps tripping, find the short; never fit a bigger breaker.",
        "The breaker protects the wire: the factory pairs the 30A main with 12 GA and the 15A circuits with 14/18 GA. Never upsize a breaker without upsizing the wire it feeds.",
        "No generic AWG ampacity table is published in the garage library, so none is printed here — the factory pairings above are the reference. A generic ampacity chart would be a guess, not a citation."
      ]
    },
    gear_ratio: {
      ref: "FSM #99482-98 §6 p. 6-1 (sprockets + overall gear ratios); Clymer Table 1, Five-Speed Transmission Specifications (internal gear ratios + overall ratios by year); tire sizes: Sportster 1986-2003 Tables 10/12, pp. 497-498.",
      stock: { comp: 25, clutch: 36, trans: 32, rear: 65 },
      internal: [
        { years: "1984-1993", gears: [3.24, 2.21, 1.60, 1.23, 1.00] },
        { years: "1994", gears: [3.24, 2.21, 1.57, 1.23, 1.00], note: "Domestic 1st 3.24 / HDI 1st 3.21; domestic 3rd 1.57 / HDI 3rd 1.60" },
        { years: "1995-1999", gears: [3.21, 2.21, 1.57, 1.23, 1.00] }
      ],
      overall: [
        { years: "1997-1998 (FSM §6)", gears: [10.11, 6.96, 4.95, 3.86, 3.15] },
        { years: "1995-1997 (Clymer)", gears: [10.41, 6.96, 4.95, 3.86, 3.15] },
        { years: "1991-1992 (Clymer)", gears: [10.93, 7.46, 5.40, 4.15, 3.37] }
      ],
      flag: "The FSM §6 sprocket table (25/36/32/65) and its own overall-ratio table do NOT reconcile: 36/25 x 65/32 x 1.00 = 2.93 in 5th, not the printed 3.15. The printed overall ratios match a 70-tooth rear (36/25 x 70/32 = 3.15 in 5th; 3.21 x 1.44 x 70/32 = 10.11 in 1st). Clymer's 1995-1997 1st (10.41) also disagrees with the FSM's 10.11. Count the teeth on your own bike — the calculator uses what you enter, not the book's tables.",
      tire_presets: [
        { label: "Sportster rear 130/90-16 (1991-2003, Dunlop D401)", section_mm: 130, aspect: 90, rim_in: 16, dia_in: 25.21 },
        { label: "Sportster front 100/90-19 (1991-2003, Dunlop D401)", section_mm: 100, aspect: 90, rim_in: 19, dia_in: 26.09 }
      ],
      tire_note: "Diameters are computed from the published sizes (rim + 2 x section x aspect), not measured. No Softail stock tire-size table was found in the library — measure your own rear tire (rollout: mark the tire and the ground, roll one full turn, measure) and enter its diameter."
    },
    tap_drill: {
      ref: "Inch: 1984-1999 Softail Repair Manual, Table 7 (American Tap Drill Sizes), p. 32 — read visually Nov 25, 2026. Metric: Clymer HD Evolution 1984-1998, Table 11 (American Tap and Drill Sizes), pp. 33-34 — read visually Nov 25, 2026.",
      inch: [
        { thread: "#0-80", drill: "3/64" }, { thread: "#1-64", drill: "No. 53" }, { thread: "#1-72", drill: "No. 53" },
        { thread: "#2-56", drill: "No. 51" }, { thread: "#2-64", drill: "No. 50" }, { thread: "#3-48", drill: "5/64" },
        { thread: "#3-56", drill: "No. 46" }, { thread: "#4-40", drill: "No. 43" }, { thread: "#4-48", drill: "No. 42" },
        { thread: "#5-40", drill: "No. 39" }, { thread: "#5-44", drill: "No. 37" }, { thread: "#6-32", drill: "No. 36" },
        { thread: "#6-40", drill: "No. 33" }, { thread: "#8-32", drill: "No. 29" }, { thread: "#8-36", drill: "No. 29" },
        { thread: "#10-24", drill: "No. 25" }, { thread: "#10-32", drill: "No. 21" }, { thread: "#12-24", drill: "No. 17" },
        { thread: "#12-28", drill: "No. 15" }, { thread: "1/4-20", drill: "No. 8" }, { thread: "1/4-28", drill: "No. 3" },
        { thread: "5/16-18", drill: "F" }, { thread: "5/16-24", drill: "I" }, { thread: "3/8-16", drill: "5/16" },
        { thread: "3/8-24", drill: "Q" }, { thread: "7/16-14", drill: "U" }, { thread: "7/16-20", drill: "W" },
        { thread: "1/2-13", drill: "27/64" }, { thread: "1/2-20", drill: "29/64" }, { thread: "9/16-12", drill: "31/64" },
        { thread: "9/16-18", drill: "33/64" }, { thread: "5/8-11", drill: "17/32" }, { thread: "5/8-18", drill: "37/64" },
        { thread: "3/4-10", drill: "21/32" }, { thread: "3/4-16", drill: "11/16" }, { thread: "7/8-9", drill: "49/64" },
        { thread: "7/8-14", drill: "13/16" }, { thread: "1-8", drill: "7/8" }, { thread: "1-14", drill: "15/16" }
      ],
      metric: [
        { thread: "3x0.50", drill: "No. 39", decimal: "0.0995", fraction: "3/32" },
        { thread: "3x0.60", drill: "3/32", decimal: "0.0937", fraction: "3/32" },
        { thread: "4x0.70", drill: "No. 30", decimal: "0.1285", fraction: "1/8" },
        { thread: "4x0.75", drill: "1/8", decimal: "0.125", fraction: "1/8" },
        { thread: "5x0.80", drill: "No. 19", decimal: "0.166", fraction: "11/64" },
        { thread: "5x0.90", drill: "No. 20", decimal: "0.161", fraction: "5/32" },
        { thread: "6x1.00", drill: "No. 9", decimal: "0.196", fraction: "13/64" },
        { thread: "7x1.00", drill: "15/64", decimal: "0.234", fraction: "15/64" },
        { thread: "8x1.00", drill: "J", decimal: "0.277", fraction: "9/32" },
        { thread: "8x1.25", drill: "17/64", decimal: "0.265", fraction: "17/64" },
        { thread: "9x1.00", drill: "5/16", decimal: "0.3125", fraction: "5/16" },
        { thread: "9x1.25", drill: "5/16", decimal: "0.3125", fraction: "5/16" },
        { thread: "10x1.25", drill: "11/32", decimal: "0.3437", fraction: "11/32" },
        { thread: "10x1.50", drill: "R", decimal: "0.339", fraction: "11/32" },
        { thread: "11x1.50", drill: "3/8", decimal: "0.375", fraction: "3/8" },
        { thread: "12x1.50", drill: "13/32", decimal: "0.406", fraction: "13/32" },
        { thread: "12x1.75", drill: "13/32", decimal: "0.406", fraction: "13/32" }
      ],
      notes: [
        "Clymer misprints the 7x1.00 drill-equivalent column as '16/64' — the decimal (0.234) and nearest-fraction (15/64) columns agree on 15/64, so 15/64 is printed here and the 16/64 is never used.",
        "The Repair Manual lists 1/4-20 as No. 8; some generic charts say No. 7. The manual is the source here — use No. 8 when you are working from this book.",
        "If you have to drill and tap a hole, refer to Table 7 (Repair Manual Ch. 1, p. 24)."
      ]
    },
    bolt_id: {
      ref: "Thread series: 1984-1999 Softail Repair Manual Table 7, p. 32 (inch) and Clymer Table 11, pp. 33-34 (metric). Numbered-screw diameters are the standard gauge definition (0.060 in + 0.013 in per gauge number).",
      how: "Measure the major diameter with calipers (across the threads, not the shank). For SAE, count the threads in 1/2 in and double it — that is the threads-per-inch. For metric, measure the distance between two adjacent thread crests in mm — that is the pitch. Match both numbers below; a diameter alone never identifies a thread.",
      sae: [
        { thread: "#0-80", dia_in: 0.06, tpi: 80 }, { thread: "#1-64", dia_in: 0.073, tpi: 64 }, { thread: "#1-72", dia_in: 0.073, tpi: 72 },
        { thread: "#2-56", dia_in: 0.086, tpi: 56 }, { thread: "#2-64", dia_in: 0.086, tpi: 64 }, { thread: "#3-48", dia_in: 0.099, tpi: 48 },
        { thread: "#3-56", dia_in: 0.099, tpi: 56 }, { thread: "#4-40", dia_in: 0.112, tpi: 40 }, { thread: "#4-48", dia_in: 0.112, tpi: 48 },
        { thread: "#5-40", dia_in: 0.125, tpi: 40 }, { thread: "#5-44", dia_in: 0.125, tpi: 44 }, { thread: "#6-32", dia_in: 0.138, tpi: 32 },
        { thread: "#6-40", dia_in: 0.138, tpi: 40 }, { thread: "#8-32", dia_in: 0.164, tpi: 32 }, { thread: "#8-36", dia_in: 0.164, tpi: 36 },
        { thread: "#10-24", dia_in: 0.19, tpi: 24 }, { thread: "#10-32", dia_in: 0.19, tpi: 32 }, { thread: "#12-24", dia_in: 0.216, tpi: 24 },
        { thread: "#12-28", dia_in: 0.216, tpi: 28 }, { thread: "1/4-20", dia_in: 0.25, tpi: 20 }, { thread: "1/4-28", dia_in: 0.25, tpi: 28 },
        { thread: "5/16-18", dia_in: 0.3125, tpi: 18 }, { thread: "5/16-24", dia_in: 0.3125, tpi: 24 }, { thread: "3/8-16", dia_in: 0.375, tpi: 16 },
        { thread: "3/8-24", dia_in: 0.375, tpi: 24 }, { thread: "7/16-14", dia_in: 0.4375, tpi: 14 }, { thread: "7/16-20", dia_in: 0.4375, tpi: 20 },
        { thread: "1/2-13", dia_in: 0.5, tpi: 13 }, { thread: "1/2-20", dia_in: 0.5, tpi: 20 }, { thread: "9/16-12", dia_in: 0.5625, tpi: 12 },
        { thread: "9/16-18", dia_in: 0.5625, tpi: 18 }, { thread: "5/8-11", dia_in: 0.625, tpi: 11 }, { thread: "5/8-18", dia_in: 0.625, tpi: 18 },
        { thread: "3/4-10", dia_in: 0.75, tpi: 10 }, { thread: "3/4-16", dia_in: 0.75, tpi: 16 }, { thread: "7/8-9", dia_in: 0.875, tpi: 9 },
        { thread: "7/8-14", dia_in: 0.875, tpi: 14 }, { thread: "1-8", dia_in: 1.0, tpi: 8 }, { thread: "1-14", dia_in: 1.0, tpi: 14 }
      ],
      metric: [
        { thread: "M3x0.50", dia_mm: 3, pitch: 0.5 }, { thread: "M3x0.60", dia_mm: 3, pitch: 0.6 },
        { thread: "M4x0.70", dia_mm: 4, pitch: 0.7 }, { thread: "M4x0.75", dia_mm: 4, pitch: 0.75 },
        { thread: "M5x0.80", dia_mm: 5, pitch: 0.8 }, { thread: "M5x0.90", dia_mm: 5, pitch: 0.9 },
        { thread: "M6x1.00", dia_mm: 6, pitch: 1.0 }, { thread: "M7x1.00", dia_mm: 7, pitch: 1.0 },
        { thread: "M8x1.00", dia_mm: 8, pitch: 1.0 }, { thread: "M8x1.25", dia_mm: 8, pitch: 1.25 },
        { thread: "M9x1.00", dia_mm: 9, pitch: 1.0 }, { thread: "M9x1.25", dia_mm: 9, pitch: 1.25 },
        { thread: "M10x1.25", dia_mm: 10, pitch: 1.25 }, { thread: "M10x1.50", dia_mm: 10, pitch: 1.5 },
        { thread: "M11x1.50", dia_mm: 11, pitch: 1.5 }, { thread: "M12x1.50", dia_mm: 12, pitch: 1.5 },
        { thread: "M12x1.75", dia_mm: 12, pitch: 1.75 }
      ]
    },
    oil: {
      ref: "FSM #99482-98 §1, p. 1-9 (Fluid Requirements — Engine Oil).",
      rule: "Always use the proper grade of oil for the lowest temperature expected before next scheduled oil change.",
      grades: [
        { type: "HD Multi-grade", viscosity: "SAE 10W40", hd_rating: "HD 240", lowest_temp: "Below 40°F (4°C)", cold_start: "Excellent" },
        { type: "HD Multi-grade", viscosity: "SAE 20W50", hd_rating: "HD 240", lowest_temp: "Above 40°F (4°C)", cold_start: "Good" },
        { type: "HD Regular Heavy", viscosity: "SAE 50", hd_rating: "HD 240", lowest_temp: "Above 60°F (16°C)", cold_start: "Poor" },
        { type: "HD Extra Heavy", viscosity: "SAE 60", hd_rating: "HD 240", lowest_temp: "Above 80°F (27°C)", cold_start: "Poor" }
      ],
      diesel: "If H-D oil is not available, use an oil certified for diesel engines — acceptable designations CE, CF, CF-4, and CG-4. Preferred viscosities for the diesel oils, in descending order: 20W-50, 15W-40, 10W-40. At the first opportunity, see a dealer to change back to 100 percent H-D oil.",
      service: "Oil tank 3.0 qt with filter; service at 500 mi, then every 5,000 mi — and annually / prior to storage (FSM §1 Scheduled Service Table pp. 1-34–1-37, (*) footnote: 'Also perform prior to storage or annually')."
    },
    compression_ratio: {
      ref: "1984-1999 Softail Repair Manual, Table 1 (General Engine Specifications), Ch. 5 p. 179; Sportster 1986-2003, Table 1 (General Engine Specifications), p. 193.",
      stock: [
        { model: "Evo Big Twin 1340", bore_in: 3.498, stroke_in: 4.25, disp_cid: 81.6, disp_cc: 1340, cr: 9.5, chamber_cc_derived: 78.7 },
        { model: "Sportster 883", bore_in: 3.0, stroke_in: 3.812, disp_cid: 53.9, disp_cc: 883, cr: 9.0, chamber_cc_derived: 55.2 },
        { model: "Sportster 1100", bore_in: 3.35, stroke_in: 3.812, disp_cid: 67.2, disp_cc: 1102, cr: 9.0, chamber_cc_derived: 68.8 },
        { model: "Sportster 1200", bore_in: 3.498, stroke_in: 3.812, disp_cid: 73.3, disp_cc: 1203, cr: 9.0, chamber_cc_derived: 75.0 },
        { model: "Sportster 1200S (1998-2003)", bore_in: 3.498, stroke_in: 3.812, disp_cid: 73.3, disp_cc: 1203, cr: 10.0, chamber_cc_derived: 66.7 }
      ],
      note: "Chamber volumes are DERIVED arithmetic (swept volume / (ratio - 1)), not published figures — the manuals publish bore, stroke, displacement and ratio, never a chamber volume. Measure your own chamber with a burette and enter it; the derived numbers are only a sanity check for a stock motor."
    },
    carb_cfm: {
      ref: "Displacement: 1984-1999 Softail Repair Manual, Table 1, Ch. 5 p. 179 (81.6 cu. in.). Formula: CFM = CID x RPM x VE / 3456 (standard volumetric-efficiency formula).",
      stock_disp_cid: 81.6,
      carb: "Keihin CV40, 40 mm bore",
      note: "No published CFM flow rating for the CV40 exists in the garage library — this calculator answers what the ENGINE needs at a given rpm and volumetric efficiency, not what the carb flows. VE is your assumption, not a spec: a stock street Evo is usually figured around 80-85%, a built motor higher. Enter your own VE and the number follows."
    },
    sag: {
      ref: "FSM #99482-98 §2, p. 2-73 (Rear Shock Absorbers — Adjustment); Easyriders ER_401 §113-§114 (Progressive adjustable shocks, magazine).",
      procedure: [
        "Loosen the locknuts.",
        "Use the spanner wrench, Part No. 94455-89, and extend or compress the springs to the rider's desired position. Mark the adjuster plates so you adjust both springs to the same position.",
        "Turning the adjuster plates OUT (toward the locknut) increases the spring preload to carry a heavier load. Turning them IN (away from the locknut) decreases the spring preload to carry a lighter load.",
        "Tighten the locknuts against the adjuster plates.",
        "Shock absorber bolts: 115-130 ft-lbs (156-176 Nm). The rear shock absorber is not repairable — if damaged, replace it."
      ],
      magazine: "Progressive adjustable shocks ship with the preload at their lightest setting; rotate the spring seat counter-clockwise to increase preload (Easyriders ER_401 §114, magazine — aftermarket shocks, not a factory spec).",
      measure: "Measure from the axle to a fixed point on the fender, straight up. First with the bike on a stand, wheel off the ground (unloaded). Then with the bike on the ground, you sitting on it in riding gear, feet on the pegs, a friend holding the bike upright (loaded). Sag is unloaded minus loaded — front and rear, separately.",
      no_target: "No factory sag target is published anywhere in the garage library — not in the FSM, not in Clymer, not in the magazines. This card records your measurements and the preload change you made; it does not print a target number, because there is none to cite. Set it by the FSM procedure above and by feel; if you know a target you trust, write it in the notes field, not as a factory number. Re-searched Nov 25, 2026 (sag / rider sag / static sag / preload): FSM #99482-98 §2 and the 1984-1999 Repair Manual suspension sections, Clymer Ch. 11 suspension chapter, Easyriders + Iron Horse (magsearch), Tech Tips Vols 1-4 + The Biker (techtips.db). What the books DO say: compare fork/valve springs for sag (worn springs sag — replace as a set); Clymer: fork-spring free-length service limits 'not available'. What the magazines say: how to turn preload adjusters and set ride height (Easyriders ER_401: a 1 1/2-inch drop is a ride-height choice, not a sag target). No rider-sag or static-sag target number exists in any of them — still needs Joshua's number."
    },
    tire_reader: {
      ref: "Tire & helmet standards research, Nov 21, 2026 (~/workspace/research_notes/tire-helmet-standards-20261121/report.md): DOT date code 49 CFR 574.5; age rule Michelin + Dunlop (Harley-Davidson OE suppliers), repeated by Harley-Davidson; size/load/speed tables ETRTO/ISO-based via Bridgestone, Dunlop, MIC Tire Guide.",
      alpha: [
        { alpha: "MH90", metric: "80/90", inch: "2.50/2.75", note: "" },
        { alpha: "MJ90", metric: "90/90", inch: "2.75/3.00", note: "" },
        { alpha: "MM90", metric: "100/90", inch: "3.25/3.50", note: "" },
        { alpha: "MN90", metric: "110/90", inch: "3.75/4.00", note: "" },
        { alpha: "MP85", metric: "110/90", inch: "4.00/4.25", note: "Rear fitment — the same code can map differently front vs rear." },
        { alpha: "MR90", metric: "120/90", inch: "4.25/4.50", note: "" },
        { alpha: "MT90", metric: "130/90", inch: "5.00/5.10", note: "Stock rear on most Evo Softails; common Heritage front." },
        { alpha: "MU90", metric: "140/90", inch: "5.50/6.00", note: "" },
        { alpha: "MV85", metric: "150/80", inch: "6.00/6.25", note: "" },
        { alpha: "MV90", metric: "150/90", inch: "6.00/6.25", note: "" }
      ],
      load_index: [
        { li: 40, kg: 140 }, { li: 41, kg: 145 }, { li: 42, kg: 150 }, { li: 43, kg: 155 },
        { li: 44, kg: 160 }, { li: 45, kg: 165 }, { li: 46, kg: 170 }, { li: 47, kg: 175 },
        { li: 48, kg: 180 }, { li: 49, kg: 185 }, { li: 50, kg: 190 }, { li: 51, kg: 195 },
        { li: 52, kg: 200 }, { li: 53, kg: 206 }, { li: 54, kg: 212 }, { li: 55, kg: 218 },
        { li: 56, kg: 224 }, { li: 57, kg: 230 }, { li: 58, kg: 236 }, { li: 59, kg: 243 },
        { li: 60, kg: 250 }, { li: 61, kg: 257 }, { li: 62, kg: 265 }, { li: 63, kg: 272 },
        { li: 64, kg: 280 }, { li: 65, kg: 290 }, { li: 66, kg: 300 }, { li: 67, kg: 307 },
        { li: 68, kg: 315 }, { li: 69, kg: 325 }, { li: 70, kg: 335 }, { li: 71, kg: 345 },
        { li: 72, kg: 355 }, { li: 73, kg: 365 }, { li: 74, kg: 375 }, { li: 75, kg: 387 },
        { li: 76, kg: 400 }, { li: 77, kg: 412 }, { li: 78, kg: 425 }, { li: 79, kg: 437 },
        { li: 80, kg: 450 }, { li: 81, kg: 462 }, { li: 82, kg: 475 }, { li: 83, kg: 487 },
        { li: 84, kg: 500 }, { li: 85, kg: 515 }, { li: 86, kg: 530 }, { li: 87, kg: 545 },
        { li: 88, kg: 560 }, { li: 89, kg: 580 }, { li: 90, kg: 600 }, { li: 91, kg: 615 }
      ],
      speed_rating: [
        { symbol: "F", kmh: 80, mph: 50 }, { symbol: "G", kmh: 90, mph: 56 },
        { symbol: "J", kmh: 100, mph: 62 }, { symbol: "K", kmh: 110, mph: 68 },
        { symbol: "L", kmh: 120, mph: 75 }, { symbol: "M", kmh: 130, mph: 81 },
        { symbol: "N", kmh: 140, mph: 87 }, { symbol: "P", kmh: 150, mph: 93 },
        { symbol: "Q", kmh: 160, mph: 99 }, { symbol: "R", kmh: 170, mph: 106 },
        { symbol: "S", kmh: 180, mph: 112 }, { symbol: "T", kmh: 190, mph: 118 },
        { symbol: "U", kmh: 200, mph: 124 }, { symbol: "H", kmh: 210, mph: 130 },
        { symbol: "V", kmh: 240, mph: 149 }, { symbol: "W", kmh: 270, mph: 168 },
        { symbol: "Y", kmh: 300, mph: 186 }, { symbol: "Z", kmh: 240, mph: 149, note: "240+ km/h — a Z in the size (180/55ZR17) means rated over 149 mph; the service description after the size gives the actual limit." },
        { symbol: "(W)", kmh: 270, mph: 168, note: "270+ km/h — the maker sets the actual maximum." }
      ],
      notes: [
        "Age rule (Michelin + Dunlop, motorcycle tires — Harley-Davidson repeats it): professional inspection every year after 5 years of use; replace at 10 years from the date of manufacture, even with tread left. There is no federal age limit; the 6-year figure is a car-tire number — do not use it here.",
        "The DOT date code is the last 4 digits of the Tire Identification Number (WWYY, 49 CFR 574.5) — the date decoder on the Diagnose tab reads it, and the card below reuses it. Pre-2000 tires use 3 digits (WWY); any 3-digit-code tire is 26+ years old — replace on sight.",
        "Pressures are COLD pressures (3+ hours since the last ride). The number on the sidewall is the MAXIMUM, never the recommended pressure. The recommended pressure lives in the owner's manual, the FSM tire-inflation table, or the label on the frame/swingarm.",
        "Tread: Harley-Davidson says consider new tires at 2/32 in; worn out at 1/32 in or less (the legal motorcycle limit, FMVSS 119). New tires need ~100 miles of gentle run-in (Dunlop) — no maximum power or hard cornering until then.",
        "Alpha conversions are approximate — Dunlop's own chart says the table 'does not imply interchangeability'. Verify actual dimensions, rim width, load and speed rating before changing from the manufacturer's specified size.",
        "Trap: on older alpha tires a trailing B can mean Load Range B (a ply rating, e.g. MT90-16B), not bias-belted construction. A B immediately before the rim number is construction; a B after the rim number is load range.",
        "Load index is per tire, at the maker's specified pressure. kg is the authoritative column (ISO); lb is kg x 2.2046, rounded — published tables differ by 1 lb on a few rows because some truncate instead of rounding.",
        "Speed rating P is 150 km/h = 93 mph — some tables print 94 mph; 93 is used here. Speed rating is the maximum SUSTAINED speed at rated load and correct inflation."
      ]
    },
    unit_converter: {
      ref: "Standard unit definitions (not manual specs): 1 in = 25.4 mm exactly (international inch, 1959); 1 lb = 0.45359237 kg exactly; 1 US gallon = 231 cu. in. exactly; 1 psi = 6.894757 kPa; 1 bar = 100 kPa exactly.",
      categories: [
        { id: "length", label: "Length", base: "mm", units: [
          { code: "mm", label: "millimetres", to_base: 1 },
          { code: "cm", label: "centimetres", to_base: 10 },
          { code: "m", label: "metres", to_base: 1000 },
          { code: "km", label: "kilometres", to_base: 1000000 },
          { code: "in", label: "inches", to_base: 25.4 },
          { code: "ft", label: "feet", to_base: 304.8 },
          { code: "yd", label: "yards", to_base: 914.4 },
          { code: "mi", label: "miles", to_base: 1609344 }
        ] },
        { id: "torque", label: "Torque", base: "N·m", units: [
          { code: "Nm", label: "newton-metres", to_base: 1 },
          { code: "ftlb", label: "foot-pounds", to_base: 1.3558179483314004 },
          { code: "inlb", label: "inch-pounds", to_base: 0.1129848290276167 },
          { code: "kgm", label: "kilogram-metres", to_base: 9.80665 },
          { code: "kgcm", label: "kilogram-centimetres", to_base: 0.0980665 }
        ] },
        { id: "pressure", label: "Pressure", base: "kPa", units: [
          { code: "kPa", label: "kilopascals", to_base: 1 },
          { code: "psi", label: "pounds per square inch", to_base: 6.894757293168 },
          { code: "bar", label: "bar", to_base: 100 },
          { code: "atm", label: "atmospheres", to_base: 101.325 },
          { code: "mmHg", label: "millimetres of mercury", to_base: 0.133322387415 }
        ] },
        { id: "volume", label: "Volume", base: "mL", units: [
          { code: "mL", label: "millilitres", to_base: 1 },
          { code: "cc", label: "cubic centimetres (cc = mL)", to_base: 1 },
          { code: "L", label: "litres", to_base: 1000 },
          { code: "cuin", label: "cubic inches", to_base: 16.387064 },
          { code: "floz", label: "US fluid ounces", to_base: 29.5735295625 },
          { code: "pt", label: "US pints", to_base: 473.176473 },
          { code: "qt", label: "US quarts", to_base: 946.352946 },
          { code: "gal", label: "US gallons", to_base: 3785.411784 }
        ] }
      ],
      notes: [
        "These are unit definitions, not manual specs — the factors are exact by definition (1 in = 25.4 mm, 1 ft-lb = 12 in-lb, 1 US fl oz = 29.5735295625 mL), so the converter never guesses.",
        "Torque: 1 ft-lb = 1.3558 N·m. The FSM prints torque in ft-lbs with Nm in brackets — this card converts either way.",
        "Volume: US quarts are the oil-tank unit (3.0 qt with filter, FSM §1) — 3 qt = 2.84 L. US gallons, pints and quarts here are the US customary units, not imperial."
      ]
    },
    belt: {
      ref: "FSM #99482-98 §1, pp. 1-43–1-44 (Drive Belt; Fig. 1-11 Belt Adjustment, Fig. 1-12 Axle Adjuster).",
      interval: "At the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter, inspect the drive belt for damage and check belt adjustment.",
      spec: "With BELT TENSION GAUGE (HD-35381), the drive belt top strand deflects 3/8–1/2 in (9.5–13 mm) while applying 10 lbs (4.5 kg) of force upward.",
      conditions: [
        "Set belt tension at the tightest point in the belt.",
        "Procedure should be performed with the motorcycle cold.",
        "Procedure should be performed with the weight of the owner on the vehicle."
      ],
      steps: [
        "See Figure 1-11. Using BELT TENSION GAUGE (HD-35381), check that the drive belt top strand deflects 3/8–1/2 in (9.5–13 mm) while applying 10 lbs (4.5 kg) of force upward.",
        "If belt adjustment is necessary, see Figure 1-12. Remove the spring clip and loosen the axle nut and jamnut.",
        "Remove the belt guard. Adjust belt tension by turning each adjuster bolt an equal number of turns to keep the wheel aligned until the specification in step 1 is achieved.",
        "Tighten the jamnuts.",
        "Tighten the axle nut to 60 ft-lbs (81 Nm) and check to see if the spring clip can be installed. If required, tighten the nut just enough to align the axle hole and nut slots, but do not exceed 65 ft-lbs (88 Nm)."
      ],
      caution: "Do not exceed 65 ft-lbs (88 Nm) when tightening the axle nut. Exceeding 65 ft-lbs (88 Nm) may cause the wheel bearings to seize during operation, resulting in personal injury."
    },
    clutch: {
      ref: "FSM #99482-98 §1, p. 1-40 (Clutch Adjustment; Fig. 1-5, Fig. 1-6, Fig. 1-7).",
      interval: "Perform this clutch adjustment procedure at predelivery, the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter.",
      caution: "The clutch adjustment should be performed with the motorcycle at room temperature. The clearance at the adjuster screw will increase as the power train temperature increases. If the adjuster screw is adjusted with the power train hot, clearance at the push rod bearing could be insufficient with the power train cold and clutch slippage could occur.",
      steps: [
        "Stand the vehicle upright and level.",
        "See Figure 1-2. Remove three screws, rubber sealing washers and the clutch inspection cover. Discard the washers.",
        "See Figure 1-7. The cable adjuster is located midway between the clutch cable ends. Push the rubber boot upwards on the cable until the adjuster is exposed. Loosen the nut and turn the adjuster all the way in to provide slack in the cable.",
        "See Figure 1-7. Loosen the clutch adjuster screw jamnut and turn the push rod adjusting screw inward (clockwise) to take up all free play in the pushrod.",
        "Back out the adjusting screw (counterclockwise) 1/2 to 1 full turn and tighten the jamnut to 6–10 ft-lbs (8–14 Nm), while holding the adjusting screw with an Allen wrench.",
        "See Figure 1-7. Squeeze the clutch lever to its maximum limit three times to set the ball and ramp release mechanism. Pull the outer cable conduit and at the same time adjust the cable adjuster to provide 1/16–1/8 in (1.6–3.2 mm) free play at the hand lever. Tighten the clutch cable adjuster jamnut and place the boot over the adjuster.",
        "Install the clutch cover in the primary chaincase cover with a new O-ring. Install three screws and new rubber sealing washers. Tighten the screws to 50–70 in-lbs (5.6–7.9 Nm)."
      ],
      note: "If clutch components are replaced during normal servicing, this adjustment must be performed. Adjust again after 500 miles (800 km) of use."
    },
    primary_chain: {
      ref: "FSM #99482-98 §1, pp. 1-38–1-39 (Primary Chain; Fig. 1-2 Primary Chaincase Covers, Fig. 1-3 Primary Chain Adjustment).",
      interval: "At the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter, inspect the primary chain and adjust the chain, if necessary.",
      warning: "To prevent accidental start-up of the motorcycle, disconnect the battery cable (negative cable first) before performing any of the following procedures. If the positive cable should contact ground with the negative cable installed, the resulting sparks may cause a battery explosion resulting in personal injury.",
      spec: "Free play in the upper strand, midway between the engine compensating sprocket in the front and the clutch sprocket in the rear: 5/8–7/8 in (15.9–22.3 mm) with the engine cold; 3/8–5/8 in (9.5–15.9 mm) with the engine hot.",
      caution: "Adjust the primary chain at the tightest spot in the chain. Do not adjust the chain tighter than the specified play. Running chains too tight will result in excessive wear.",
      steps: [
        "See Figure 1-2. With the vehicle upright and level, remove the primary chain inspection cover. The gasket between the primary chain adjustment inspection cover and the chaincase cover must be replaced each time the cover is removed.",
        "Check the primary chain tension. Push on the upper strand of the chain to verify that it has free up and down movement midway between the engine compensating sprocket in the front and the clutch sprocket in the rear.",
        "See Figure 1-3. If free play adjustment is required, loosen, but do not remove, the center bolt nut and move the shoe assembly up or down to obtain the specified free play. Tighten the center bolt nut to 21–29 ft-lbs (28–39 Nm). Replace the primary chain if it is worn to the point where it cannot be properly adjusted.",
        "Install the inspection cover with a new gasket. Tighten the primary chain inspection cover screws to the values shown in Figure 1-2."
      ],
      figure_note: "Figure 1-2 prints two torque callouts for the cover fasteners — 50–70 in-lbs (5.6–7.9 Nm) and 108–120 in-lbs (12.2–13.6 Nm). Match each screw to its callout in the figure; the clutch inspection cover screws are 50–70 in-lbs (5.6–7.9 Nm)."
    },
    storage: {
      ref: "FSM #99482-98 §1, p. 1-8 (Storage; Removal From Storage).",
      intro: "If the motorcycle will not be operated for several months, such as during the winter season, there are several things which should be done to protect parts against corrosion, to preserve the battery, and to prevent the buildup of gum and varnish in the carburetor.",
      dealer_note: "This work should be performed by a local Harley-Davidson dealer or other qualified technician following the procedures in this service manual.",
      put_away: [
        "Run the motorcycle until the engine is at normal operating temperature. Stop the engine then drain the oil tank, install a new oil filter, and fill the oil tank with the proper grade oil. Check the transmission lubricant level.",
        "Fill the fuel tank and add a gasoline stabilizer. Use one of the commercially available gasoline stabilizers following the manufacturer's instructions. Turn the fuel supply valve off. Drain all gasoline from the carburetor by loosening the fuel bowl drain screw one full turn; gasoline will drain through the fuel overflow fitting. Retighten the drain screw after all gasoline has been drained from the carburetor. OR: drain all gasoline from the fuel tank. Spray the inside of the fuel tank with one of the commercially available rust preventatives. Follow the manufacturer's instructions.",
        "Remove the spark plugs, inject a few squirts of engine oil into each cylinder and crank the engine 5–6 revolutions. Reinstall the spark plugs.",
        "Plug the line leading from the bottom of the oil tank to the 90° fitting on the oil pump cover. This will eliminate the possibility of oil seeping past the check ball into the oil pump and filling the engine flywheel compartment with oil.",
        "Adjust the primary chain.",
        "Check tire inflation. If the motorcycle will be stored for an extended period of time, securely support the motorcycle under the frame so that all weight is off the tires.",
        "Wash painted and chrome-plated surfaces. Apply a light film of oil to exposed unpainted surfaces. Do not apply any oil to brake discs or brake pads. Oil on disc pads degrades braking efficiency and can result in an accident causing personal injury.",
        "Remove the battery from the vehicle. Charge the battery until the correct voltage is obtained (see Section 8 for more information). Charge the battery every other month if it is stored at temperatures below 60°F (16°C). Charge the battery once a month if it is stored at temperatures above 60°F (16°C).",
        "Grease the wheel bearings and install new seals.",
        "If the motorcycle is to be covered, use a material that will breathe, such as light canvas. Plastic materials that do not breathe promote the formation of condensation, which leads to corrosion."
      ],
      warnings: [
        "Gasoline is flammable. Do not store a motorcycle having gasoline in the tank within the home or garage where open flames, pilot lights, sparks or electric motors are present. Inadequate safety precautions may cause an accident resulting in personal injury.",
        "Always unplug or turn off the battery charger before connecting or disconnecting charger clamps at the battery. Connecting or disconnecting clamps with the charger on could cause a spark and a possible battery explosion.",
        "Batteries produce explosive hydrogen gas at all times, especially when being charged. Keep cigarettes, open flame and sparks away from the battery at all times. Ventilate the area when charging the battery. Battery contains sulfuric acid which can cause severe burns to eyes, skin and clothing. Always protect hands and protect eyes with shield or goggles when working near a battery or acid."
      ],
      removal: [
        "Charge and install the battery.",
        "Remove and inspect the spark plugs. Replace if necessary.",
        "Clean the air cleaner element.",
        "If the fuel tank was drained, fill the fuel tank with fresh gasoline.",
        "If the oil feed line was pinched off or plugged, unplug it and reconnect.",
        "Start the engine and run until it reaches normal operating temperature.",
        "Check the engine oil level. Check the transmission lubricant level. Fill to proper levels with correct fluids, if required.",
        "Perform all of the checks in the PRE-RIDING CHECKLIST in the Owner's Manual."
      ],
      removal_warning: "After extended periods of storage and prior to starting the vehicle, place the transmission in gear, disengage the clutch by pulling in the clutch hand lever completely, and push the vehicle back and forth a few times to ensure proper clutch disengagement. Improper clutch disengagement could result in personal injury."
    },
    brake_pads: {
      ref: "FSM #99482-98 §2: Front Brake Caliper pp. 2-40–2-43 (Fig. 2-48 Front Brake Caliper Mounting, Fig. 2-49 Front Brake Caliper, Fig. 2-50 Threaded Bushing/Rivet Engagement, Fig. 2-51 Spring Clip Installation); Rear Brake Caliper pp. 2-47–2-48 (Fig. 2-55 Rear Caliper, Fig. 2-56 Retainer Clip Installation).",
      wear_limit: "If brake pads are worn to 1/16 in. (1.6 mm) or less of fiber/friction material, replace the entire set (4).",
      sets_rule: "For correct and safe brake operation, brake pads must be replaced in sets at the same time. Rear brake pads must also be replaced in sets. Mismatched brake pads could lead to an accident resulting in personal injury.",
      pump_caution: "Whenever a caliper is removed/installed, you must pump brake fluid pressure back up, until the pistons push the pads against the brake disc, BEFORE moving motorcycle. If you don't pump fluid pressure up again, the brakes will not be available to stop the vehicle and the vehicle may be damaged.",
      front: {
        steps: [
          "See Figure 2-48. Disconnect the brake line at the caliper fitting. Remove the upper and lower mounting bolts to release the caliper assembly from the vehicle. Move the caliper assembly to a clean bench area. NOTE: gently rock caliper to compress the caliper pistons and ease removal.",
          "See Figure 2-50. Remove retainer screw (15), pad retainer (14) and inside pad (9). Remove the outer pad (9), mounting plate (7 or 7A) and spring clip (8) as an assembly. Remove pad (9) from mounting plate (7) by pushing the pad free of the spring clip (8).",
          "Inspect: if brake pad friction material is worn to 1/16 in. (1.6 mm) or less, replace entire set. Inspect all components carefully for excessive wear or damage. Clean all metal parts with alcohol. Do not use gasoline. Clean all rubber parts in denatured alcohol or brake fluid.",
          "See Figure 2-50. Take the pad (9) that has the insulator backing, and place it on top of the spring clip with the lower end of the pad slightly entering the opening of the mounting plate. With the pad centered within the mounting plate and the insulated back facing downward, push down on the pad until it is against the flat surface and is held firmly by spring tension from the spring clip.",
          "Insert the outer pad (9), mounting plate (7) and spring clip (8) assembly into place with the backside of the pad against the face of the piston. NOTE: the spring clip loop and friction material must always face away from the piston. If it is wrong, the pad must be removed, the mounting plate reversed and the parts assembled again.",
          "Place the inner pad (9) (without insulator backing) in the recessed seat machined into the caliper. Position the pad retainer (14) within the counterbore at the inside end of the caliper. Insert self-tapping retainer screw (15) through the hole in the center of pad retainer (14) and thread into the hole in the pad. Tighten screw (15) to 40-50 in-lbs (4.5-5.6 Nm).",
          "Coat the outside diameter of lower mounting pin (2) with Dow Corning MOLY 44 grease. Position the caliper with the disc between the friction pads. Align the two mounting holes in the caliper with the mounting lugs on the fork. Place a flat washer (3) on upper mounting bolt (1), then insert the bolt through the fork lug and the mounting plate (7). Thread the bolt into the threaded bushing (4). Insert the lower mounting pin (2) through the caliper and the fork lug. Thread it into the tapped hole at the lower end of mounting plate (7). Tighten lower mounting pin to 25-30 ft-lbs (34-41 Nm). Tighten upper mounting bolt (1) to 25-30 ft-lbs (34-41 Nm).",
          "Use new banjo washers and connect the brake line to the caliper. Hold brake line in place and tighten banjo bolt to 17-22 ft-lbs (23-30 Nm). If the bleeder valve was removed, install it and tighten to 80-100 in-lbs (9.0-11.3 Nm).",
          "Shift handlebars so master cylinder is level. Fill reservoir with D.O.T. 5 hydraulic brake fluid to 1/8 in. (3.2 mm) below top. Install the master cylinder cover. Actuate the master cylinder and check for leaks. Bleed the brake system. See BLEEDING THE HYDRAULIC BRAKE SYSTEM."
        ],
        piston_note: "Piston must be pressed all the way into the bore when new brake pads have been installed to assure proper clearance when calipers are assembled to vehicle. WARNING: check to be sure that the caliper bushings are in the mounting lugs on the fork. Installing caliper without bushings will result in improper caliper location and possible locked brake, which could lead to an accident resulting in personal injury. CAUTION: the threaded bushing's flange must go UNDER the rivet head during assembly, and one of the U-shaped notches on the outer edge of the bushing flange must engage the rivet body — if the bushing is not positioned properly the rivet will be damaged when the mounting bolts are tightened."
      },
      rear: {
        steps: [
          "Remove rear muffler. NOTE: gently rock caliper to compress the caliper pistons and ease removal. See Figure 2-55. Remove pin bolts (11) and carefully lift caliper (10) off the brake disc and brake pads.",
          "Remove retainer clip (13). Slide outside brake pad off mounting bracket. Slide inside caliper off mounting bracket, toward wheel. Remove pad shims (3).",
          "Inspect: if the brake pads are worn to 1/16 in. (1.6 mm) thick or less of friction material, replace them as a set. Replace any parts that appear worn or damaged. Always replace seal (5) and dust boot (7) if removed from caliper bore. Replace rubber bushing (2) if damaged or worn. Do not hone or bore cylinder. Clean all metal parts in a non-flammable cleaning solvent and blow dry with compressed air. Clean all rubber parts in denatured alcohol or brake fluid. WARNING: always clean brake system rubber parts by washing in denatured alcohol. DO NOT use mineral base cleaning solvents which would deteriorate rubber parts.",
          "See Figure 2-55. Place pad shims (3) on mounting bracket with the tabs seated in mounting holes. Slide brake pad over pad shims (3) from saddlebag carrier side. From wheel side of brake disc, slide the other brake pad (4) over pad shims (3). Insert retainer clip (13) in holes in mounting bracket (1) and bring clip over the top of outer pad (4) as shown in Figure 2-56. CAUTION: be sure pads are on the pad shim. Motorcycle operation with the pad off the shim will result in rear brake pad drag, uneven pad wear and damage to the mounting bracket. Use care when installing caliper to be sure brake pads (4) are not knocked off pad shims (3).",
          "Lower caliper (10) so that caliper straddles brake pads. Align holes in caliper with holes in mounting bracket (1) and install pin bolts (11). Tighten bolts (11) to 15-20 ft-lbs (20-27 Nm).",
          "If brake line was disconnected, hold brake line in place and tighten banjo bolt to 17-22 ft-lbs (23-30 Nm). Bleed the rear brake system following the procedure BLEEDING THE HYDRAULIC SYSTEM contained in this section. Install rear muffler.",
          "After the brake pads are installed, avoid hard stops for 100 miles (160 km), to allow the pads to wear into the discs."
        ],
        piston_note: "Do not remove the pistons from the caliper unless there are signs of hydraulic fluid leakage or if the piston is not operating properly. If the piston must be removed: pump the brake lever until piston reaches its full travel. Disconnect the brake hose at the caliper. Remove the piston (6), dust boot (7) and seal (5). WARNING: piston may develop considerable force from pressure build-up. Take care to keep hands from under piston to prevent personal injury — place the caliper on the workbench with the piston facing downward, a clean shop towel under the piston, and apply low air pressure to the inlet hole until the piston is forced out; if tight, tap lightly around the caliper while applying air pressure. If piston (6) was removed, refer to the ASSEMBLY procedure for the FRONT BRAKE CALIPER for instructions needed to assemble seal (5), piston (6), boot (7) and retaining ring (8)."
      },
      burnish_note: "The manual prints two different burnish distances: front — 'Avoid hard stops for 300 miles. Proper burnishing will not occur if hard stops are made during the wear-in period.' (p. 2-42 caution); rear — 'avoid hard stops for 100 miles (160 km), to allow the pads to wear into the discs' (p. 2-47). Both are printed here as written; follow the one for the end you worked on."
    },
    fork_oil: {
      ref: "FSM #99482-98 §1, p. 1-42 (Front Fork Oil, for models with hydraulic front forks); fluid: §1 p. 1-9 (Fluid Requirements) and §1 p. 1-36 Scheduled Service Table (Part No. 99884-80, 16 oz.); capacities also in the §1 table, p. 1-36. §2 p. 2-54 front-fork assembly fills the fork sides with TYPE E fork oil 'in the amount specified under GENERAL' — the same capacities.",
      fluid: "Use only HYDRAULIC FORK OIL TYPE \"E\", Harley-Davidson Part No. 99884-80 (16 oz.).",
      interval: "At every 10,000 mile (16000 km) service interval, or prior to storage, replace the front fork oil.",
      capacities: [
        { models: "FXSTC Models", wet: "10.2 oz (302 ml)" },
        { models: "FLSTC/F Models (other models, except Springers)", wet: "11.5 oz (340 ml)" }
      ],
      steps: [
        "Support the vehicle so the front end is off the floor and the forks are fully extended.",
        "Remove the fork tube caps from the top of each fork.",
        "Remove the drain screws from the bottom of each fork and drain the fork oil. Don't lose the drain screw washer.",
        "Replace the drain screws and washers.",
        "Fill the fork with Harley-Davidson's TYPE E FORK OIL with the specified amounts listed below: FXSTC Models, Wet 10.2 oz (302 ml); FLSTC/F Models, Wet 11.5 oz (340 ml).",
        "Install fork tube caps and tighten caps to 40-60 ft-lbs (54-81 Nm)."
      ],
      note: "The capacities printed here are WET (drain-and-refill) amounts — the only amounts the manual prints for this service. No DRY (full teardown) capacity is printed anywhere in the FSM, so none is given here; §2 front-fork assembly (p. 2-54) fills to the same GENERAL amounts. Springer models (FLSTS, FXSTS, FXSTSB) have no hydraulic fork oil change in this procedure — the table lists the 11.5 oz capacity as 'Other models, except Springers'."
    },
    first_500: {
      ref: "FSM #99482-98 §1, p. 1-1 (Break-In Maintenance / Check at First 500 Miles) and §1 Scheduled Service Table, pp. 1-34–1-37 (500 mile / 800 km column, read visually Nov 25, 2026).",
      dealer_note: "After a new motorcycle has been driven the first 500 miles (800 km), initial service operations should be performed by an authorized Harley-Davidson dealer. The performance of new motorcycle initial service is required to keep new motorcycle warranty in force and to ensure proper emissions system operation.",
      deferral_note: "The FSM itself does not print a separate 500-mile checklist — p. 1-1 says 'After 500 miles (800 km) a Harley-Davidson dealer should perform the 500 mile (800 km) maintenance listed in the Owner's Manual (see Scheduled Service Table).' The Owner's Manual list IS the Scheduled Service Table printed in the FSM §1, pp. 1-34–1-37. The items below are exactly the 500-mile (800 km) column of that table. Key: R = Replace or change; I = Inspect, and if necessary, adjust, clean, or replace; L = Lubricate with specified lubricant; X = Perform; T = Tighten to proper torque; (*) = Also perform prior to storage or annually.",
      check_at_first_500: [
        "Tires for correct pressure, abrasions, cuts and wear.",
        "Belt for proper tension.",
        "Brakes, steering, and throttle for responsiveness.",
        "Brake fluid level and condition. Hydraulic lines and fittings for leaks. Also, check brake pads and discs for wear.",
        "Cables for fraying or crimping and free operation.",
        "Engine oil, primary chaincase, and transmission fluid levels. Do not overfill oil tank.",
        "Wheel spoke tightness, if applicable.",
        "Headlight, taillight and turn signal operation."
      ],
      replace: ["Engine oil (*)", "Engine oil filter (*)", "Primary chaincase lubricant", "Transmission lubricant (*)"],
      perform: ["Clutch adjustment", "Rocker bearing adjustment (FXSTS, FXSTSB, FLSTS)", "Road test"],
      inspect: [
        "Battery", "Primary chain", "Spoke tightness (if applicable)", "Tire condition and pressure",
        "Steering head bearing fall-away", "Brake fluid (*)", "Brake pad linings and discs",
        "Rear brake pedal height (FXSTC, FXSTS, FXSTSB)", "Drive belt", "Rear fork pivot bolts",
        "Rear shock absorbers", "Air cleaner", "Fuel system lines and fittings (leaks)",
        "Enrichener control", "Engine mounts", "Electrical components", "Engine idle speed"
      ],
      lubricate: ["Springer steering head bearings (FLSTS, FXSTS, FXSTSB)"],
      inspect_lubricate: ["Throttle cables"],
      tighten: ["Fasteners (except head bolts)"],
      not_at_500: "Not in the 500-mile column — first due later: front fork oil (R at 10,000 mi), wheel bearings (IL at 10,000 mi), steering head bearings, all other models (L at 10,000 mi), hydraulic lifter oil screen (I at 5,000 mi), brake caliper mounting pin (IL at 5,000 mi), fuel tank filter (I at 5,000 mi), spark plugs (I at 5,000 mi), ignition timing and V.O.E.S. (I at 5,000 mi), steering head bearings remove / inspect / repack (X at 20,000 mi)."
    },
    engine_oil: {
      ref: "FSM #99482-98 §1, p. 1-38 (Engine Oil/Engine Oil Filter; Fig. 1-1 Draining Engine Oil); oil-grade table p. 1-38; fluid chart §1 p. 1-33; Scheduled Service Table §1 pp. 1-34–1-35.",
      interval: "At the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter, change the engine oil and engine oil filter. (*) Also perform prior to storage or annually.",
      spec: "Fill tank with three (3) quarts (2.8 liters) engine oil. Oil level: full at bottom of fill plug with motorcycle level and engine warm (Scheduled Service Table service data).",
      oil_grades: [
        { type: "HD Multi-grade", viscosity: "SAE 10W40", rating: "HD 240", lowest_ambient: "Below 40°F (4°C)", cold_starts_below_50F: "Excellent" },
        { type: "HD Multi-grade", viscosity: "SAE 20W50", rating: "HD 240", lowest_ambient: "Above 40°F (4°C)", cold_starts_below_50F: "Good" },
        { type: "HD Regular Heavy", viscosity: "SAE 50", rating: "HD 240", lowest_ambient: "Above 60°F (16°C)", cold_starts_below_50F: "Poor" },
        { type: "HD Extra Heavy", viscosity: "SAE 60", rating: "HD 240", lowest_ambient: "Above 80°F (27°C)", cold_starts_below_50F: "Poor" }
      ],
      note: "If the motorcycle is ridden hard, under dusty conditions, or in cold weather, the oil and filter should be changed more often.",
      steps: [
        "Run engine until normal operating temperature is reached.",
        "See Figure 1-1. Remove the oil tank drain plug from oil drain hose and allow oil to drain completely.",
        "Remove the oil filter and clean the oil filter mount flange of any old gasket material.",
        "Lube the gasket on new oil filter with engine oil and install new filter. Hand tighten oil filter 1/2-3/4 turn after gasket contacts filter mounting surface.",
        "Install drain plug and clip plug in place.",
        "Fill tank with three (3) quarts (2.8 liters) engine oil specified below. Use the proper grade of oil for the lowest temperature expected before next oil change.",
        "Start engine and carefully check for oil leaks around drain plug and oil filter.",
        "Check oil level in tank with vehicle upright and level at normal operating temperatures, and if necessary, add oil. Do not overfill tank. Tank needs some air space."
      ]
    },
    transmission_oil: {
      ref: "FSM #99482-98 §1, p. 1-41 (Transmission Lubricant; Fig. 1-8 Transmission Fill and Drain); fluid chart §1 p. 1-33; Scheduled Service Table §1 p. 1-35.",
      interval: "At the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter, replace the transmission lubricant. (*) Also perform prior to storage or annually.",
      spec: "Fill the transmission with 24 oz. (709.8 ml) of Harley-Davidson TRANSMISSION LUBRICANT, Part No. 98853-96 (quart) / 98852-96 (gallon), or until the dipstick shows FULL with motorcycle in level, upright position and the dipstick dipped, not screwed, into the fill hole.",
      steps: [
        "See Figure 1-8. Remove the drain and fill plugs from the transmission and drain the used transmission fluid into a suitable container. The drain plug on FLSTS models can be accessed using a T40 bit on a universal joint.",
        "Install the drain plug so it projects 0.16-0.18 in. (4.1-4.6 mm) above surface of housing. Do not over-tighten. Over-tightening could cause transmission leakage.",
        "Fill the transmission with 24 oz. (709.8 ml) of Harley-Davidson TRANSMISSION LUBRICANT, Part No. 98853-96, or until the dipstick shows FULL with motorcycle in level, upright position and the dipstick dipped, not screwed, into the fill hole.",
        "Tighten the filler plug/dipstick finger tight."
      ],
      part_number_flag: "The §1 procedure text on p. 1-41 prints Part No. 99892-84 for the transmission lubricant. The §1 fluid chart (p. 1-33), the Scheduled Service Table service-data column (p. 1-35), and the §7 transmission assembly procedure (p. 7-8) all print Part No. 98853-96 (quart) / 98852-96 (gallon). This card wires 98853-96 — three FSM locations against one — and flags the conflict here rather than silently picking a number."
    },
    primary_oil: {
      ref: "FSM #99482-98 §1, pp. 1-39–1-40 (Primary Chaincase Lubricant; Fig. 1-2 Primary Chaincase Covers, Fig. 1-4 Removing Chaincase Drain Plug, Fig. 1-5 1997 Models Primary Chaincase Lubricant Level, Fig. 1-6 1998 Models Primary Chaincase Lubricant Level); fluid chart §1 p. 1-33; Scheduled Service Table §1 p. 1-34.",
      interval: "At the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter, change the primary chaincase lubricant.",
      spec: "Use only Harley-Davidson PRIMARY CHAINCASE LUBRICANT, Part No. 99887-84 (quart) or Part No. 99886-84 (gallon). Level, with the vehicle standing upright: at the bottom edge of the diaphragm spring — 1997 Models: approximately 32 oz. (946.4 ml); 1998 Models: approximately 26 oz. (768.9 ml). The lubricant level is visually checked through the clutch cover opening.",
      steps: [
        "See Figure 1-4. Remove drain plug at bottom of primary chaincase. Drain lubricant into suitable container.",
        "Clean drain plug and install drain plug in chaincase. If a large amount of debris had accumulated on the chaincase plug, inspect the condition of chaincase components.",
        "See Figure 1-2. Remove three socket screws with rubber sealing washers and clutch inspection cover. Discard sealing washers.",
        "Pour the proper amount and type of primary chaincase lubricant in through the clutch inspection cover opening. With the vehicle standing upright, the level of the lubricant must be at the bottom edge of the diaphragm spring or 2-3/4 inches (69.8 mm) from the centerline of the clutch adjuster screw. Use only Harley-Davidson PRIMARY CHAINCASE LUBRICANT, Part No. 99887-84 (quart) or Part No. 99886-84 (gallon). The lubricant level is visually checked through clutch cover opening. 1997 Models: See Figure 1-5. The primary chaincase lubricant should be level with bottom edge of the clutch diaphragm spring, approximately 32 oz. (946.4 ml). 1998 Models: See Figure 1-6. The primary chaincase lubricant should be level with the bottom edge of the clutch diaphragm spring, approximately 26 oz. (768.9 ml).",
        "Install clutch inspection cover in primary chaincase cover with new O-ring. Install three socket head screws using new rubber sealing washers. Tighten screws to 50-70 in-lbs (5.6-7.9 Nm)."
      ],
      caution: "Do not over-fill the primary chaincase with lubricant. Over-filling may cause rough clutch engagement, incomplete disengagement, clutch drag and/or difficulty in finding neutral at engine idle.",
      note: "If new clutch discs are being installed, or if the lubricant has been wiped from serviceable discs, submerge the discs in PRIMARY CHAINCASE LUBRICANT for a minimum of five minutes before installation."
    },
    brake_fluid_flush: {
      ref: "FSM #99482-98 §2, p. 2-49 (Bleeding the Hydraulic Brake System; Fig. 2-57 Bleeding Brakes); §1 p. 1-42 (Brake Fluid — level and condition inspection, reservoir fill level, reservoir cover torque); fluid chart §1 p. 1-33; Scheduled Service Table §1 p. 1-36.",
      interval: "At the 500 mile (800 km) service interval, and at every 5000 mile (8000 km) service interval thereafter, inspect the brake fluid level and condition. (*) Also perform prior to storage or annually. The FSM prints NO scheduled brake-fluid replacement interval — the Brake fluid row in the Scheduled Service Table is marked I (Inspect) at every interval, never R (Replace). The bleed procedure below is the manual's own method for renewing fluid in the system: it is what the manual prescribes whenever a hydraulic brake line or fitting is opened, and for clearing air from the system.",
      spec: "Use only D.O.T. 5 SILICONE HYDRAULIC BRAKE FLUID, Harley-Davidson Part No. 99902-77 (12 oz.) / 99901-77 (gal). NEVER DOT 3 or DOT 4 — this system is DOT 5 silicone only. Reservoir level: 1/8 in. (3.2 mm) below the gasket surface.",
      steps: [
        "See Figure 2-57. Slip a length of appropriate size clear plastic tubing over wheel cylinder bleeder valve with other end in a clean container. Turn handlebars so that bleeder valve is nearly vertical.",
        "Depress brake pedal or lever once to build up pressure. Open bleeder valve by rotating counterclockwise about one-half turn.",
        "Keep master cylinder full of fluid at all times. Slowly depress brake pedal or lever once until fluid stops flowing from tubing. Close the bleeder valve. Allow pedal or lever to return slowly to release position.",
        "Repeat operation until brake system is free of air bubbles. Add fluid to master cylinder to bring to original level. Do not reuse fluid. Tighten brake bleeder valve to 80-100 in-lbs (9.0-11.3 Nm)."
      ],
      note: "Hydraulic brake fluid bladder type pressure equipment can be used to fill brake master cylinder through the bleeder valve if master cylinder cover is removed so that system cannot pressurize. Do not use pressure bleeding equipment when the hydraulic system is sealed with master cylinder cover and gasket in place.",
      warning: "Whenever a hydraulic brake line or fitting is opened the fitting should be flushed with brake fluid and the brake system must be bled. Do this to eliminate any air or contaminants from the brake system. Air in the fluid will cause the brake pedal to have a spongy feel. If a contaminant becomes lodged in the seat of a fitting, leakage of fluid could occur, and/or air could be drawn into the system resulting in decreased brake performance and possible personal injury.",
      eye_warning: "D.O.T. 5 brake fluid can cause eye irritation. In case of contact with eyes, flush with plenty of water and get medical attention. KEEP BRAKE FLUID OUT OF THE REACH OF CHILDREN!",
      after_service: "Whenever the brake system is serviced, it should be tested on dry, clean pavement at slow speeds before putting the motorcycle in regular service. Improperly serviced brakes could lead to an accident resulting in personal injury. (§1 p. 1-42)",
      reservoir: "The front brake master cylinder reservoir is an integral part of the brake hand lever assembly. The rear brake master cylinder reservoir is located on the right side of the motorcycle near the brake pedal, or between the frame downtubes on FXSTC, FXSTS, FXSTSB models. To prevent dirt from entering the master cylinder reservoir, thoroughly clean the cover before removal. Install gaskets and covers and torque reservoir cover screws to 6-8 in-lbs (0.7-0.9 Nm). (§1 p. 1-42)"
    },
    carb_rebuild: {
      ref: "FSM #99482-98 §4: Carburetor Removal p. 4-14 (Fig. 4-11 Throttle Cables; Fig. 4-12 Carburetor exploded view, p. 4-15); Installation p. 4-16; Disassembly p. 4-16 (Vacuum Piston Chamber, Carburetor Body, Accelerator Pump); Cleaning and Inspection p. 4-16; Float Replacement p. 4-17 (Fig. 4-13); Assembly pp. 4-17–4-18. Read from the FSM text, Nov 25, 2026.",
      warning: "Gasoline is extremely flammable and highly explosive. Always stop the engine when refueling or servicing the fuel system. Do not smoke or allow open flame or sparks near the work site. Inadequate safety precautions may result in personal injury.",
      figure_note: "Part numbers in parentheses are Figure 4-12 callouts (exploded view, p. 4-15). Figure 4-11 is the throttle cables; Figure 4-13 is the float-pin pedestal.",
      removal: [
        "Turn the fuel supply valve off.",
        "Disconnect the fuel line. Remove the fuel tank. See FUEL TANK in this section.",
        "Remove the air cleaner and backplate. See AIR CLEANER in this section.",
        "Disconnect the throttle cables (see Figure 4-11) and enrichener cable (56, 57, and 58, Figure 4-12).",
        "See Figure 4-12. Remove enrichener valve (54) and spring (55). See Section 2, THROTTLE CONTROL.",
        "Remove vacuum hose from the carburetor. Pull carburetor free of seal ring and manifold (8).",
        "If the manifold, or manifold seals, need to be removed, remove the capscrews (9) that hold the manifold in place."
      ],
      installation_note: "When you position the manifold on the cylinder head studs, be sure the flanges are installed correctly on the manifold. Be sure the rubber seals are in place.",
      installation_caution: "Do not tighten capscrews and then try to align the manifold and flanges. The manifold seals will be damaged.",
      installation: [
        "See Figure 4-12. Place the intake manifold seal (11), flanges (10), and manifold (8) in position. Install the manifold mounting capscrews (9) finger tight. Place carburetor in position, for alignment purposes.",
        "Align the manifold, flanges, and carburetor.",
        "Tighten the manifold mounting capscrews to 15-17 ft-lbs (20-23 Nm). Remove carburetor and place seal ring (12) onto manifold inlet.",
        "Place carburetor outlet into manifold. Be sure carburetor is in a true vertical position. Misalignment could damage manifold seal ring.",
        "Connect throttle cables and vacuum hose to carburetor. Install enrichener cable in mounting bracket and adjust. See ADJUSTMENTS.",
        "Install fuel tank. See FUEL TANK in this section. Connect fuel line to carburetor.",
        "Install air cleaner back plate. Install air cleaner. See AIR CLEANER in this section.",
        "Route the float bowl overflow line between rear cylinder push rods, then down between engine oil pump cover and crankcase."
      ],
      disassembly_vacuum_piston: [
        "See Figure 4-12. Remove screws (16 and 18) and bracket (17).",
        "Remove screws (1) and washers. Remove top (2) and spring (3).",
        "Lift out vacuum piston (6) with needle (5) and spring seat (4). Remove loose parts from vacuum piston."
      ],
      disassembly_carb_body: [
        "Remove screws (48) and washers. Remove float bowl assembly.",
        "Remove pin (31), float (32) and valve (53).",
        "Unscrew main jet (49) and needle jet holder (50). Needle jet (51) is now free to be removed from bottom end of passage.",
        "Insert thin bladed screw driver into slow jet passage and turn out slow jet (30)."
      ],
      disassembly_accel_pump: [
        "Remove screws (43), lockwashers (42), accelerator pump housing (41), spring (40) and diaphragm (39). Remove O-ring (44) from housing."
      ],
      cleaning_vacuum_piston: [
        "Hold vacuum piston up to strong light. Examine diaphragm at top of vacuum piston for evidence of pinching, holes or tears. Replace if damaged.",
        "Examine vacuum passage through bottom of piston. Clean passage if restricted.",
        "See Figure 4-12. Examine spring (3) for stretching, crimping or any distortion or damage. Replace if damaged.",
        "Examine slide on sides of piston to be sure surface is smooth and clean. Clean or buff out any rough surfaces.",
        "Examine needle for evidence of bending or damage. Examine tip of float needle for grooves. Needle should be straight and surface of taper smooth and even. Examine float for holes."
      ],
      cleaning_carb_body: [
        "Check float bowl O-ring (35) for any distortion or damage. Replace if seating surfaces are damaged.",
        "Examine inlet valve (53) and inlet valve seat. Clean with carburetor cleaner. Replace if seating surfaces are damaged.",
        "Clean slow jet (30) with carburetor cleaner. Check to be sure all orifices are open.",
        "Check enrichener valve (54). Be sure needle guide is clean, straight and undamaged. Check seat surface and spring (55) for wear or damage. Replace if damaged.",
        "Check enrichener valve chamber. Clean with carburetor cleaner. Check that all passages are open and free of obstruction.",
        "Clean needle jet (51). Replace if damaged.",
        "Clean all internal fuel/air passages and jets. Check that all passages and jets are open and free of obstruction.",
        "Check needle jet holder (50). Clean bleed tube orifices. Replace holder if damaged.",
        "Check float (32) for cracks or other leaks. Replace if damaged. See FLOAT REPLACEMENT.",
        "Clean main jet with carburetor cleaner and inspect for damage. Replace if damaged."
      ],
      cleaning_caution: "Do not submerge inlet valve in cold acid dip. The valve's alloy will be etched/damaged.",
      float_note: "One of the carburetor float pedestals has an interference fit to hold the float pin more securely in place. See Figure 4-13. A cast-in arrow points at the pedestal that has the interference fit. The ROUNDED pedestal has the interference fit. The pin is a uniform width throughout its entire length, so it can be installed starting from either end. The arrow indicates direction of removal. Tap pin out from INTERFERENCE SIDE pedestal (direction of arrow); install pin from LOOSE SIDE pedestal (opposite arrow).",
      float_caution: "When removing or installing the float pin, be careful not to break the pedestal(s). If the pedestal(s) is broken, the carburetor will have to be replaced.",
      accel_pump_inspect: [
        "See Figure 4-12. Inspect the accelerator pump diaphragm (39) for holes, cracks or deformation. Replace as necessary.",
        "Replace the pump rod (34) if it is bent and replace the boot (33) if it is cracked."
      ],
      assembly_vacuum_piston: [
        "See Figure 4-12. Place needle (5) through center hole in vacuum piston (6). Place spring seat (4) over top of needle.",
        "Insert vacuum piston into carburetor body. The slides on the piston are off-center and the piston will fit into the slide track grooves only one way. If piston does not fit, rotate 180 degrees.",
        "Check to be sure diaphragm is seated evenly into groove at top of carburetor body.",
        "Place spring (3) over spring seat and carefully lower top (2). Keep spring straight while lowering top.",
        "After top is seated, hold top while lifting up on vacuum piston. Piston should rise to top smoothly. If piston movement is restricted, spring is cocked. Lift up on top and lower carefully, keeping spring coils straight.",
        "Once top is installed correctly, install screws (1) and washers. Place bracket (17) in position with idle screw resting on top of throttle cam stop. Install body screw (18) and washer first, then top screw (16), to prevent bending bracket or throttle cam."
      ],
      assembly_carb_body_caution: "Slow fuel jets from fixed venturi carburetors look the same as the slow jet of the CVH carburetor, however the air bleed hole sizes are different on fixed venturi carburetors and they must not be installed on CVH carburetors.",
      assembly_carb_body: [
        "See Figure 4-12. Screw slow jet (30) into slow jet passage with narrow bladed screwdriver.",
        "Turn carburetor upside down. Place needle jet (51) in main jet passage with needle passing through center hole. Be sure end of jet with larger opening and chamfered surface enters passage first.",
        "Insert needle jet holder (50) into main jet passage with needle inserted into center of holder. Thread holder into passage and tighten. Thread main jet (49) into tapped hole in holder and tighten.",
        "Place float assembly (32) into position with fuel valve (53) inserted into valve seat and pivot arm aligned with holes in mounting posts at bottom of carburetor body. Insert pin (31) through float pivot arm and float mounting posts.",
        "Place float bowl over float and onto carburetor body flange. Bowl will only fit in one position. Install screws (48) and washers and tighten.",
        "Install enrichener valve (54) and spring (55). Install enrichener cable (56, 57, and 58) on carburetor."
      ],
      assembly_accel_pump: [
        "Install diaphragm (39), spring (40), O-ring (44) and housing (41). Secure with three screws (43) and lockwashers (42)."
      ]
    },
    interchange: {
      ref: "Harley SIP factory parts catalogs + Ronnie's HLSM fiche; factory bulletin P-20 (Nov 18, 1991); FSM #99482-98 §8; Sportster 1986-2003; 1984-1999 Softail Repair Manual pp. 138-139; Easyriders ER_262 §145 and ER_305 §18 (magazine); aftermarket fitment corroboration: Drag Specialties, Cycle Electric, J&P Cycles, V-Twin Mfg, Dennis Kirk, RM Stator, AJ-Elec; FXR Archive VOES page.",
      rows: [
        { part: "Wheel bearing 9052 (race 9033)", fits: "Big Twins and Sportsters, 1973-99 — two per wheel", note: "The same bearing front and rear.", source: "Harley SIP factory parts catalogs; Ronnie's HLSM fiche" },
        { part: "Brake pads 44063-83C/D", fits: "All XL / FX / FL, 1984-99", note: "Pads are done at 1/16 in.", source: "Factory bulletin P-20 (Nov 18, 1991)" },
        { part: "Points ignition backup (breaker plate + mechanical advance + ignition cam)", fits: "Older Harley points parts bolt into late-model Evolution engines", note: "A mechanical backup for a failed electronic module.", source: "NOT an FSM cause — Easyriders ER_262 §145 (magazine interchange tip)" },
        { part: "Stator", fits: "DOES NOT interchange — Big Twin 29970-88C vs Sportster 29967-89C", note: "Different part, different output. Check the number before you buy.", source: "FSM #99482-98 §8; Sportster 1986-2003" },
        { part: "Regulator", fits: "DOES NOT interchange — Big Twin 74519-88A vs Sportster 74523-94A", note: "Different part. Check the number before you buy.", source: "FSM #99482-98 §8; Sportster 1986-2003" },
        { part: "Cylinder head bolts; rocker boxes and gaskets", fits: "NOT interchangeable between certain model years", note: "Buy for your Harley's model year — the manual warns twice.", source: "1984-1999 Softail Repair Manual, pp. 138-139" },
        { part: "Starter jackshaft 31482-70", fits: "~1/4 in longer than the shaft it replaces", note: "A longer shaft fixes a starter that spins without engaging.", source: "NOT an FSM cause — Easyriders ER_305 §18 (magazine)" },
        { part: "Big Twin stator 29970-88C (32A)", fits: "Softail 1989-99, Dyna 1991-98, FXR 1989-94, Touring 1989-96 carbureted", note: "Excludes EFI Touring (esp. 1997-98 FLT) and all Sportsters. Pairs with rotor 29957-81. Supersedes 29970-88/A/B.", source: "Drag Specialties stator fitment (RevZilla); Cycle Electric via W&W Cycles" },
        { part: "Sportster stator 29967-89C (22A)", fits: "All Sportster XL 1991-2006; Buell M2 Cyclone 1997-2002", note: "Supersedes 29967-89/A/B. Sportster and Big Twin stators do not interchange.", source: "J&P Cycles / Cycle Electric CE-9100; Drag Specialties; RM Stator" },
        { part: "Sportster regulator 74523-94A (22A)", fits: "All Sportster XL 1994-2003", note: "Supersedes 74523-94. Battery models only.", source: "Drag Specialties; Cycle Electric CE-208 (J&P Cycles); AJ-Elec" },
        { part: "Big Twin regulator 74519-88A (32A)", fits: "Softail 1989-99, Dyna 1991-98, FXR 1989-94, Touring 1989-96 carbureted", note: "Same year window as the 29970-88C stator — the charging system changed as a set in 1989.", source: "V-Twin Mfg Volt Tech 32-9098 fitment list" },
        { part: "Brake pads with 1992 stainless rotors", fits: "DOES NOT interchange — 1991-and-earlier pads must not be used with 1992 stainless-steel rotors", note: "New rotors need the new pads — old pads cause premature rotor wear.", source: "Factory bulletin P-20 (Nov 18, 1991)" },
        { part: "Wheel bearing 9052 (race 9033) — swingarm", fits: "Big Twin swingarms 1958-84", note: "Same bearing, second application — a wheel-bearing search should surface it.", source: "Dennis Kirk / Drag Specialties" },
        { part: "VOES (vacuum switch)", fits: "DOES NOT interchange across year bands — 26557-83 fits 1984-90 FXR; 26566-91 fits 1991-94; 26566-96 fits 1999 FXR2/3", note: "Different part per year band — buy for your year. Hose 26570-84.", source: "FXR Archive VOES page (factory catalog proof per year-band)" }
      ]
    },
    preride: {
      ref: "Clymer HD Evolution 1984-1998, Ch. 3, p. 74 (Routine Safety Checks — Pre-Ride Inspection); Sportster 1986-2003, Ch. 3, pp. 113-114 (same list plus chain, fasteners, and the Lights-and-Horn detail).",
      structure_note: "Grouped under the MSF T-CLOCS headings — the headings are the MSF's published pre-ride framework; every check under them is from Clymer / Sportster as cited per group.",
      groups: [
        { letter: "T", title: "Tires & wheels", items: ["Check wheel and tire condition. Check tire pressure — Dunlop cold pressures are on the Torque tab (FLSTC 36/36 solo, 36/40 two-up; FXSTC 30/36 solo, 30/40 two-up)."], source: "Clymer Ch. 3 item 1" },
        { letter: "C", title: "Controls", items: ["Check the operation of the front and rear brakes.", "Check clutch operation; adjust the clutch if necessary.", "Check throttle operation — it should move smoothly and return quickly when released; adjust throttle free play if necessary."], source: "Clymer Ch. 3 items 5-7" },
        { letter: "L", title: "Lights & electrics", items: ["Make sure all lights work."], source: "Clymer Ch. 3 item 2", sub_title: "Lights and horn — check each one (ignition on)", sub_items: ["Pull the front brake lever — brake light works.", "Push the rear brake pedal — brake light works.", "Headlight and taillight work.", "Dimmer switch high and low — both headlight elements work.", "Turn signal switch left and right — all four signals work.", "Accessory lights work, if fitted.", "Horn button works.", "If any light or the horn fails, see the Lights tree on the Diagnose tab."], sub_source: "Sportster Ch. 3, p. 114" },
        { letter: "O", title: "Oil, fuel & fluids", items: ["Check engine, transmission and primary chaincase for oil leakage; add oil if necessary.", "Check brake fluid level and condition; add fluid if necessary. DOT 5 silicone ONLY.", "Inspect the fuel system for leaks.", "Check the fuel level in the fuel tank."], source: "Clymer Ch. 3 items 3, 4, 10, 11" },
        { letter: "C", title: "Chassis", items: ["Inspect the front and rear suspension — solid feel, no looseness.", "Check the exhaust system for leaks or damage.", "Check drive belt tension — Big Twin 3/8-1/2 in.", "Check the tightness of exposed fasteners. CAUTION: do not check the cylinder head bolts without following the Chapter 4 procedure."], source: "Clymer Ch. 3 items 8, 9, 12; fastener item + caution: Sportster Ch. 3, p. 114" },
        { letter: "S", title: "Stands", items: [], note: "No stand check in the Clymer pre-ride list. The FSM covers the jiffy stand as a service item (§2 p. 2-82), not a pre-ride check — so no stand item is printed here rather than an invented one.", source: "FSM #99482-98 §2, p. 2-82" }
      ]
    }
  }
};
if (typeof module !== "undefined") module.exports = ED_DATA;
