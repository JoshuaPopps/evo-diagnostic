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
    oil_service: "500 mi then every 5,000 mi"
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
    "dot5-fluid": { name: "DOT 5 silicone brake fluid", fn: "Silicone hydraulic fluid for the disc brakes.", spec: "Use only D.O.T. 5 SILICONE HYDRAULIC BRAKE FLUID, Harley-Davidson Part No. 99902-77 (12 oz). Use only DOT 5 fluid from a sealed container.", failures: "Moisture/dust contamination (keep reservoir cover closed); wrong fluid.", source: "FSM #99482-98 §1 pp. 1-9, 1-33; §2" },
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
    "wheel-bearing": { name: "Wheel bearing 9052", fn: "Lets the wheel spin on the axle.", spec: "Bearing 9052, front and rear, two per wheel; cup/race is 9033. Fits Big Twins and Sportsters 1973-99.", failures: "Growl or wobble at speed; check every 10,000 mi. Magazine schedule: inspect/repack every 5,000 mi (Easyriders ER_259 §85).", source: "Harley SIP factory parts catalogs; Ronnie's HLSM fiche" }
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
    ]
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
        { q: "Is the idle mixture screw within its baseline? (Super E: 1-1/4 turns out. CV40: baseline per manual.)", yes: "next", no: "mixture", note: "S&S order: set the intermediate jet FIRST, then the mixture screw. Every intermediate change needs a mixture-screw re-adjustment.", cite: "S&S instruction 51-1012; Easyriders ER_166" },
        { q: "Roll-off test: near peak torque (3,500-4,500 rpm), full throttle, roll off to about 3/4. Does it pick up speed?", yes: "main-lean", no: "next", note: "Picks up = too lean. Hesitates = too large. Just slows = within one size.", cite: "Easyriders ER_153" },
        { q: "Look at a plug (see Plug Reader). Is the insulator white or very light tan?", yes: "main-lean", no: "next", note: "White = lean. Tan = about right. Black/sooty = rich.", cite: "1984-1999 Softail Repair Manual" },
        { q: "Set the best idle with the mixture screw, then count the turns open. Is best idle under 1/2 turn out (Keihin)?", yes: "turncount", no: "next", note: "Best idle under 1/2 turn = idle jet too big; over 1-1/4 turns = too small. Keihin only — S&S Super E uses 1 to 1-1/2 turns.", cite: "Easyriders ER_153 §28 (not an FSM cause)" },
        { q: "Does the idle hang around 1,600 rpm, then drop off on its own?", yes: "advance", no: "next", note: "A worn advance mechanism with weak return springs hangs the idle high until the advancer finally returns. Check the advancer before touching the carb.", cite: "Easyriders ER_166 §69 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Intake leak at the manifold seals", weight: 25, test: "Carb-cleaner spray test at the seals (see step 3); Evolution Big Twin compliance fittings are particularly troublesome — many maladies unjustly blamed on the carb are caused by leaking intake seals (Easyriders Tips Vol. 3, PDF p. 27)", fix: "Replace intake seals; re-torque manifold", urgency: "medium", ride: "Rideable short distance, fix soon - a lean idle can overheat the rear cylinder." , part: "intake-seals" },
        { cause: "Intermediate (slow) jet too small / mixture screw mis-set", weight: 25, test: "Set intermediate first, then mixture screw per S&S order; re-check warm idle 1000-1050 rpm. Never force the mixture screw — an over-tightened screw can crack the carb body at the screw hole (S&S Super B, Easyriders Tips Vol. 3, PDF p. 28)", fix: "S&S order: intermediate jet first, main jet last; mixture screw 1-1/4 turns out baseline", urgency: "medium", ride: "Rideable if it holds idle warm; do not ride if it dies at stops." },
        { cause: "Main jet too small", weight: 15, test: "Roll-off test at 3,500-4,500 rpm (see step 5)", fix: "Go up one main size, re-test", urgency: "low", ride: "Rideable; fix when convenient." },
        { cause: "Enrichener circuit stuck or misadjusted", weight: 10, test: "Enrichener cable free play + plunger seating", fix: "Free the cable, seat the plunger", urgency: "low", ride: "Rideable." },
        { cause: "Keihin rubber plug missing (CV40 only): all gas passes through the main jet first and the idle jet is fed through it - plug left out runs like the choke is on", weight: 10, test: "Open the carb, check the rubber plug is in place", fix: "Refit the plug", urgency: "medium", ride: "Rideable but running rich; fix soon.", applies: "b2" , part: "carb-body" },
        { cause: "Idle jet wrong size — mixture-screw turn-count diagnosis (Keihin)", weight: 10, test: "Warm engine, set best idle with the mixture screw, count turns open: under 1/2 turn = jet too big; over 1-1/4 turns = jet too small", fix: "Change the idle (slow) jet one size in the indicated direction, re-set the mixture screw", urgency: "low", ride: "Rideable; fix when convenient.", part: "pilot-jet", source: "NOT an FSM cause — Easyriders ER_153 §28 (Keihin butterfly carb). S&S Super E uses 1–1 1/2 turns instead (ER_166 §72)." },
        { cause: "Worn advance mechanism — idle hangs ~1,600 rpm then drops", weight: 5, test: "Idle hangs high then falls off on its own; inspect the advance mechanism for weak return springs / binding", fix: "Free or replace the advance mechanism; do the carb last", urgency: "low", ride: "Rideable.", part: "ignition-module", source: "NOT an FSM cause — Easyriders ER_166 §69." }
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
        { q: "Does it crank slow and sluggish, or kick back against the starter?", yes: "stuck", no: "next", note: "Mechanical advance weights stuck in the full-advance position light the charge at/before TDC at cranking speed. Do NOT rewire the cranking circuit to fix this — that removes a safety interlock.", cite: "Easyriders Tips Vol. 3, PDF pp. 49–50 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Battery discharged or failed", weight: 25, test: "Charge, then load-test; check voltage at rest (12.6V+) and cranking. If the leads are eaten by acid under the insulation, cleaning the terminals won't fix it — replace the leads; a wire broken inside its insulation looks identical to a good one (Easyriders Tips Vol. 3, PDF p. 127)", fix: "Charge or replace; check charging system after", urgency: "high", ride: "Do not ride - it will strand you." , part: "battery" },
        { cause: "Ignition fault (coil, cables, VOES, timing)", weight: 25, test: "Spark test, then coil 2.5-3.1 ohm (stock) / VOES closes 3.5-4.5 inHg / timing 20 deg BTDC", fix: "Replace the failed part; see Ignition Timing Helper", urgency: "high", ride: "Do not ride until it fires reliably." , part: ["coil", "plug-wires", "voes"] },
        { cause: "Fuel delivery (petcock, filter, carb)", weight: 20, test: "Fuel flow at the carb; petcock on RESERVE test; float bowl has fuel", fix: "Clean/replace filter; check float 0.413-0.453 in (CV40)", urgency: "medium", ride: "Do not ride until it runs." , part: ["carb-body", "float"] },
        { cause: "Starter or cables", weight: 10, test: "Voltage drop across cables while cranking (<0.2 V per leg — Clymer p. 47); starter draw", fix: "Clean/tighten cables; rebuild or replace starter", urgency: "medium", ride: "Do not ride until it cranks normally." , part: "starter" },
        { cause: "Jackshaft worn or mismatched — starter spins but won't engage", weight: 10, test: "Starter spins fast / clicks then spins free without turning the engine; check jackshaft binding, sticking, alignment, and starter-shaft length vs the outer primary cover (H-D shaft 31482-70 is ~1/4 in longer than the one it replaces)", fix: "Realign / tighten the jackshaft assembly or replace it; fit the correct-length starter shaft for the cover", urgency: "high", ride: "Do not ride until it cranks reliably.", part: "starter", source: "NOT an FSM cause — Easyriders ER_305 §18; starter table ER_295 §139." },
        { cause: "Vacuum petcock valve not opening (1995–2003 Sportster)", weight: 5, test: "Vacuum hose carb to valve diaphragm intact and connected; no vacuum = no fuel flow", fix: "Refit/replace the hose or valve", urgency: "medium", ride: "Do not ride until it runs.", source: "sportster-86-03-trouble p. 55. Full test steps continue onto p. 56 — not yet added." },
        { cause: "Advance weights stuck at full advance — slow, sluggish cranking / kickback", weight: 5, test: "Slow sluggish cranking or kickback; check that the mechanical advance weights move freely and are lubricated with light oil", fix: "Free and lubricate the advance weights; replace worn parts", urgency: "medium", ride: "Do not ride until it cranks normally.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF pp. 49–50. Distinct from the worn advance mechanism (ER_166 §69) — this is stuck, not worn." }
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
        { q: "Does it behave one way turning left and another turning right — worse with speed?", yes: "track", no: "next", note: "Even a slight difference in the track of the two wheels affects steering; the difference grows with speed.", cite: "Easyriders Tips Vol. 3, PDF p. 64 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Wrong tire pressure", weight: 30, test: "Gauge reading cold vs the table above; replace when the wear bar is flush with the tread or tread depth equals the width of two new nickels (Easyriders ER_150 §36)", fix: "Set to factory pressure", urgency: "medium", ride: "Rideable once pressures are set." },
        { cause: "Tire age (10+ years)", weight: 20, test: "DOT date code", fix: "Replace the tire", urgency: "high", ride: "Do not ride far on a 10-year-old tire." },
        { cause: "Wheel bearings / balance", weight: 15, test: "Wheel play check; bearings every 10,000 mi", fix: "Replace bearings (9052, two per wheel)", urgency: "medium", ride: "Rideable short distance; get it checked." , part: "wheel-bearing" },
        { cause: "Suspension (fork seals, shocks)", weight: 10, test: "Fork oil leaks; shock damping test", fix: "Seals / shocks", urgency: "low", ride: "Rideable." , part: ["fork", "shocks"] },
        { cause: "Steering-head loose / worn — wobble", weight: 10, test: "Front wheel off the ground: grab the lower fork legs, push/pull fore-aft — rattle or click = loose bearings; fall-away test (should start falling after ~2 in); falls after the first inch = too loose; sticks at 3 in = too tight; tight AND loose spots as you swing = dented/worn bearings, replace (Easyriders Tips Vol. 3, PDF p. 75)", fix: "Adjust / replace steering-head bearings; use light chassis grease, not heavy wheel-bearing grease", urgency: "high", ride: "Do not ride fast with a wobble.", part: "fork", source: "NOT an FSM cause — Easyriders ER_205 §36." },
        { cause: "Fork oil level/weight wrong, or leak at the top-clamp bolt", weight: 5, test: "Harsh ride (too heavy / too much oil) or loose front end (too light / too little); leak at the top-clamp bolt; new seals leak again if the tube has nicks — stone them out with 400-grit first (Easyriders Tips Vol. 3, PDF p. 76)", fix: "Set oil to 5–20 weight and correct volume (change ~every 10,000 mi); a garden-hose washer under the top bolt seals the O-ring-less clamp bolt", urgency: "low", ride: "Rideable.", part: "fork", source: "NOT an FSM cause — Easyriders ER_205 §37–§38." },
        { cause: "Loose spokes — crooked wheel, instability", weight: 5, test: "Tap each spoke with a small tool: pitch = tension; a big pitch difference after truing means a bent rim", fix: "True the wheel and tension the spokes; replace a bent rim", urgency: "high", ride: "Do not ride fast on loose spokes.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 73." },
        { cause: "Wheels not on the same track — asymmetric handling", weight: 5, test: "Behaves one way turning left, another turning right, worse with speed; check front/rear wheel alignment", fix: "Align the wheels to the same track", urgency: "medium", ride: "Rideable carefully; fix soon.", source: "NOT an FSM cause — Easyriders Tips Vol. 3, PDF p. 64." }
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
        { q: "Does it grind going into first, creep in gear, or refuse neutral at a stop?", yes: "gummed", no: "next", note: "Oil vapor + clutch dust form a black gum that glues plates together; too much grease on the hub rollers does the same.", cite: "Easyriders ER_258 §41 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Worn clutch plates / springs", weight: 30, test: "Slip test under load", fix: "Replace plates/springs; primary cover screws 108-120 in-lbs", urgency: "medium", ride: "Rideable if it is not slipping badly." , part: "clutch" },
        { cause: "Clutch drag — adjustment or warped plates", weight: 25, test: "Free play 1/16-1/8 in at the lever; drag test at a stop. Drag sources: warped plates (pressure plate lifts only ~1/8 in), over-tight primary chain pulling the basket off-center, oil too thick (STP locks the clutch solid) — Easyriders ER_167 §69", fix: "Adjust cable and clutch pack; replace warped plates", urgency: "medium", ride: "Rideable; fix before it gets worse." , part: "clutch" },
        { cause: "Cable / adjustment", weight: 20, test: "Free play 1/16-1/8 in", fix: "Adjust the cable", urgency: "low", ride: "Rideable." },
        { cause: "Primary oil wrong or low", weight: 10, test: "Primary oil level — 1997: 32 oz, 1998: 26 oz", fix: "Correct oil and level", urgency: "low", ride: "Rideable." },
        { cause: "Diaphragm spring dished — wrong A/B/C holes, spring not flat", weight: 10, test: "Lever hard halfway through, or slip; straightedge across the spring — no more than .010 in gap or it slips; 'C' holes compress least, 'B' most", fix: "Pick the holes that leave the spring flat; back the adjuster screw out 3/4 turn, locknut; convex side of the diaphragm must face out (Easyriders Tips Vol. 3, PDF p. 48)", urgency: "medium", ride: "Rideable; fix soon.", part: "clutch", source: "NOT an FSM cause — Easyriders ER_167 §71. 3/4 turn sits inside the FSM 1/2–1 turn range." },
        { cause: "Plates gummed together — creep, grind into first, no neutral", weight: 5, test: "Grinds neutral to first, can't find neutral stopped, bike creeps/bumps forward in gear; black gum streaks on the steel plates", fix: "Clean plates with non-oily solvent (brake/contact cleaner, lacquer thinner); lightly sand 120–180 grit; never soak linings (they swell), never water (rust); repeat every 5,000 miles", urgency: "medium", ride: "Rideable; fix soon.", part: "clutch", source: "NOT an FSM cause — Easyriders ER_258 §41." }
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
        { q: "Is fuel dripping from the carb overflow, or is the bowl overflowing?", yes: "float", no: "next", note: "Overflow means the float or needle valve is not holding the fuel level. Check float height 0.413-0.453 in (FSM §4 p. 4-12).", cite: "FSM #99482-98 §4, p. 4-3; §1 p. 1-13" },
        { q: "Does it stay rich with the enrichener pushed fully in once the engine is warm?", yes: "enrichener", no: "next", note: "A warm engine with the enrichener out runs rich; a valve that will not seat does the same. Check seating, cable free play, needle guide and spring.", cite: "FSM #99482-98 §4, p. 4-3" },
        { q: "Is it rich at cruise / mid-throttle, with a correct float level and a seated enrichener?", yes: "needle", no: "next", note: "Mid-throttle richness with float and enrichener ruled out points at the needle / needle jet. Inspect for bending, tip grooves, taper damage.", cite: "FSM #99482-98 §4, pp. 4-3–4-4" },
        { q: "Is the air cleaner element dirty or damaged?", yes: "air-cleaner", no: "next", note: "A choked element starves airflow and the mixture goes rich. Brief test with the element out only.", cite: "FSM #99482-98 §4, pp. 4-3–4-4" },
        { q: "Roll-off test at 3,500-4,500 rpm, full throttle, roll off to about 3/4: does it hesitate?", yes: "main-rich", no: "next", note: "Hesitates = main jet too large. Picks up speed = too lean. This cause is NOT in the FSM charts — it comes from the Easyriders ER_153 roll-off test only.", cite: "Easyriders ER_153 (not an FSM cause)" },
        { q: "On throttle opening, does it stumble — and with the air cleaner off, does the pump squirt look off-center?", yes: "pumpjet", no: "next", note: "Keihin pump jets leave the factory aimed at the rear cylinder only; aim at the center of the manifold. A pump rod too long dribbles fuel at cruise.", cite: "Easyriders ER_153 §147–§148 (not an FSM cause)" },
        { q: "Does it run rich, starve, or overflow fuel — and is the tank cap the vented type?", yes: "vent", no: "next", note: "A plugged tank vent or a wrong non-vent cap starves the carb or overflows fuel. Sportster: plugged cap (1990–91), plugged continuous vent (1992–2003).", cite: "sportster-86-03-trouble pp. 54–55" },
        { q: "With the air cleaner off, do you see fuel spraying back out of the carb throat — especially with a restrictive exhaust or a big cam?", yes: "reversion", no: "next", note: "Too much back pressure or too much valve overlap (cam) makes fuel spray back out the throat at overlap. A freer-flowing exhaust can prevent it.", cite: "Easyriders Tips Vol. 3, PDF p. 10 (not an FSM cause)" }
      ],
      causes: [
        { cause: "Float level too high / inlet (needle) valve sticking, worn, or dirty — fuel overflows the bowl", weight: 20, test: "Fuel dripping from the overflow; remove bowl, check float height 0.413–0.453 in (FSM §4 p. 4-12) and needle/seat for grooves or dirt", fix: "Clean or replace inlet valve and seat; bend float tab to set level; replace a leaky/damaged float", urgency: "medium", ride: "Rideable but running rich; fix soon — fuel overflow is a fire risk.", part: "float", source: "FSM §4 p. 4-3 'Overflow' items 4–7; §1 p. 1-13 'Floods' items 1–3, 5–6" },
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
    }
  ],
  /* Parts & prices — every price read from a live product page Nov 24, 2026
     (39 J&P Cycles, 1 Dennis Kirk — the main jet; RevZilla never needed).
     DIY cost is the part price. Shop cost is part + labor, and NO labor time
     or shop rate was published on any page checked, so the app never invents
     one — shop cost reads "part + ask your shop". Prices move; the app shows
     "checked Nov 24, 2026" with a link out per record. `note` flags the
     fitment surprises (year splits) and the two ambiguous prices (shocks
     per-pair-or-each, main-jet family page). `pads` is its own key (the
     atlas `disc` record is the rotor). `rubber-plug` has no standalone price
     — it only ships inside rebuild kits, so it points at the kit. */
  prices: {
    "master-cyl": { name: "Front master cylinder assembly, 5/8 in. bore (Milwaukee Twins)", price: 189.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/milwaukee-twins-front-brake-master-cylinder-assembly", date: "2026-11-24", note: "Complete assembly, not a rebuild kit." },
    "brake-line": { name: "Front brake line kit, stainless braided (Drag Specialties)", price: 57.70, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-standard-length-front-brake-line-kit-for-harley-flstcfn-1987-1999", date: "2026-11-24" },
    "caliper": { name: "Front caliper rebuild kit — piston + seals (Drag Specialties)", price: 33.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-front-caliper-rebuild-piston-and-seals-kit-for-harley-1984-1999", date: "2026-11-24", note: "Rebuild kit, not a complete caliper." },
    "disc": { name: "Front brake rotor, vented stainless (Milwaukee Twins)", price: 95.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/milwaukee-twins-steel-disc-brake-rotor-for-harley-1984-1999", date: "2026-11-24", note: "Per rotor." },
    "pads": { name: "Front brake pads 44063-83C/D, organic (Milwaukee Twins)", price: 20.89, source: "J&P Cycles", url: "https://www.jpcycles.com/product/milwaukee-twins-organic-front-brake-pads-for-harley-1984-1999", date: "2026-11-24", note: "One set per disc." },
    "dot5-fluid": { name: "DOT 5 silicone brake fluid, 500ml (Maxima)", price: 39.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/maxima-dot-5-silicone-brake-fluid", date: "2026-11-24", note: "DOT 5 only — never mix with DOT 3, DOT 4, or 5.1." },
    "fork": { name: "Fork seal kit, 41mm (James Gasket)", price: 25.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/james-gasket-fork-seal-kit-for-harley-1984-2016?sku_id=984925", date: "2026-11-24", note: "Seal kit for both forks, not a full fork assembly." },
    "front-axle": { name: "Front axle + hardware kit (V-Twin)", price: 56.40, source: "J&P Cycles", url: "https://www.jpcycles.com/product/v-twin-mfg-replacement-front-axle-hardware-kit-for-harley-fl-softail-1987-1995", date: "2026-11-24" },
    "rear-axle": { name: "Rear axle kit, chrome (Drag Specialties)", price: 87.69, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-chrome-rear-axle-kit-for-harley-softail-1986-1999?sku_id=1153461", date: "2026-11-24" },
    "shocks": { name: "Adjustable shocks, Softail 1989-1999 (V-Twin)", price: 288.36, source: "J&P Cycles", url: "https://www.jpcycles.com/product/v-twin-mfg-adjustable-shocks-for-harley-softail-1989-1999", date: "2026-11-24", note: "The listing does not say whether this is per pair or per shock." },
    "wheel-bearing": { name: "Wheel bearing + race 9052 (Timken)", price: 24.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/timken-wheel-bearing-and-race-for-harley-1973-1999", date: "2026-11-24", note: "Each — two bearings per wheel." },
    "exhaust-gaskets": { name: "Tapered exhaust gasket (S&S)", price: 8.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/ss-tapered-exhaust-gasket-for-harley-1984-2021?rrec=true", date: "2026-11-24", note: "Each — two per bike." },
    "slide": { name: "CV40 vacuum piston / slide + diaphragm (Milwaukee Twins)", price: 39.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/milwaukee-twins-cv-vacuum-piston-for-harley-1988-2006", date: "2026-11-24" },
    "carb-body": { name: "CV40 rebuild kit, 13-piece (Cycle Pro)", price: 25.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/cycle-pro-deluxe-rebuild-kit-for-keihin-cv-for-harley-1990-2006", date: "2026-11-24", note: "A whole CV40 body is not sold alone — this rebuild kit is the buyable proxy. Contains the rubber plug." },
    "float-bowl": { name: "CV carb rebuild kit, 13-piece (James Gasket)", price: 82.55, source: "J&P Cycles", url: "https://www.jpcycles.com/product/401-016/genuine-james-rebuild-kit-for-keihin-cv-carbs", date: "2026-11-24", note: "A float bowl alone is not sold — this kit is the buyable proxy." },
    "rubber-plug": { see: "carb-body", note: "No standalone price — the plug only ships inside rebuild kits." },
    "jackshaft": { see: "starter", note: "No standalone price verified in the Nov 25, 2026 library sweep — the jackshaft ships with the starter drive; no price invented." },
    "enrichener": { name: "CV choke cable, 8 in. (Drag Specialties)", price: 26.45, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-keihin-cv-choke-cable-for-harley-1988-2006", date: "2026-11-24", note: "Discontinued — the replacement cable is $23.99 and out of stock." },
    "mixture-screw": { name: "Extended fuel mixture screw (All Balls Racing)", price: 14.02, source: "J&P Cycles", url: "https://www.jpcycles.com/product/all-balls-racing-extended-fuel-mixture-screw-for-harley-cv-carb-1990-2006", date: "2026-11-24" },
    "accel-pump": { name: "CV accelerator pump upgrade kit (Cycle Pro)", price: 18.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/cycle-pro-cv-accelerator-pump-upgrade-for-harley-cv-carb-1990-2006", date: "2026-11-24", note: "Upgrade kit, not a diaphragm alone — the standalone diaphragm only ships inside rebuild kits." },
    "main-jet": { name: "CV40 main jet, size 185 (Cycle Pro)", price: 6.26, source: "Dennis Kirk", url: "https://www.denniskirk.com/cycle-pro/main-jet-for-cv-type-keihin-carb.ph17217.prd/173477.sku", date: "2026-11-24", note: "Price from the family page; size 185 is a listed orderable size." },
    "pilot-jet": { name: "CV40 pilot jet, size 45 (CV Performance)", price: 4.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/cv-performance-cv-style-carburetor-pilot-jet-for-harley-1988-2006", date: "2026-11-24" },
    "float": { name: "CV carb float (V-Twin)", price: 18.64, source: "J&P Cycles", url: "https://www.jpcycles.com/product/v-twin-mfg-cv-carburetor-float-for-harley-1992-2006", date: "2026-11-24", note: "Fits 1992 and later — the 1995 Fat Boy only, not the 1990 Softail." },
    "intake-seals": { name: "Intake manifold seal (James Gasket)", price: 4.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/james-gasket-intake-manifold-seal-for-harley-big-twin-sportster-1986-2022", date: "2026-11-24", note: "Each — two per bike." },
    "primary-chain": { name: "Primary chain, 82 links (Twin Power)", price: 89.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/twin-power-primary-chain-for-harley-big-twin-1941-2006", date: "2026-11-24" },
    "primary-shoe": { name: "Primary chain tensioner shoe (Milwaukee Twins)", price: 8.79, source: "J&P Cycles", url: "https://www.jpcycles.com/product/milwaukee-twins-primary-chain-tensioner-shoe-for-harley-big-twin-1965-2000", date: "2026-11-24" },
    "clutch": { name: "Clutch kit — 8 Kevlar + 6 steel plates (Twin Power)", price: 256.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/twin-power-clutch-kit-for-harley-big-twin-sportster-1990-2021", date: "2026-11-24" },
    "transmission": { name: "Transmission rebuild kit, 5-speed (Baker)", price: 429.00, source: "J&P Cycles", url: "https://www.jpcycles.com/product/baker-drivetrain-transmission-rebuild-kit-for-harley-big-twin-evo-1987-1993", date: "2026-11-24", note: "Covers 1987-1993 — the 1990 Softail only; the 1995 needs the 1994-1998 kit." },
    "belt": { name: "Final drive belt, 130-tooth (S&S X7N)", price: 305.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/ss-cycle-x7n-high-strength-final-drive-belt-for-harley-fl-softail-1995-1999", date: "2026-11-24", note: "Fits 1995-1999 only — the 1990 Softail uses a 132-tooth belt." },
    "heads": { name: "Cylinder head / base gasket kit (James Gasket)", price: 52.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/james-gasket-cylinder-headbase-gasket-kit-for-harley-evo-1984-1999", date: "2026-11-24", note: "Price shown on the page; the listing ranges $47.85-$78.95 by bore/gasket option." },
    "valves": { name: "Adjustable chromoly pushrod set (S&S)", price: 152.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/ss-adjustable-chromoly-pushrods-for-harley-big-twin-1984-1999", date: "2026-11-24", note: "Pushrod set — the buyable proxy for valves + pushrods." },
    "lifters": { name: "Hydraulic lifters, set of 4 (Feuling HP+)", price: 289.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/feuling-hp-hydraulic-lifters-for-harley-1984-1999", date: "2026-11-24" },
    "crankcase": { name: "Complete engine gasket set (James Gasket)", price: 126.95, source: "J&P Cycles", url: "https://www.jpcycles.com/product/james-gasket-engine-gasket-set-for-harley-evo-1992-1999", date: "2026-11-24", note: "Covers 1992-1999 — the 1995 Fat Boy only; the 1990 needs the 1984-1991 kit." },
    "battery": { name: "Battery — Yuasa YB16-B-CX, 12V 225 CCA", price: 116.96, source: "J&P Cycles", url: "https://www.jpcycles.com/product/yuasa-yb16-b-cx-yumicron-cx-battery", date: "2026-11-24", note: "Fits the 1990 Softail only — the 1995 Fat Boy takes the larger YTX20-size battery. Out of stock at time of check." },
    "ignition-module": { name: "Ignition module — Dynatek Dyna 2000i (D2KI-1P)", price: 311.10, source: "J&P Cycles", url: "https://www.jpcycles.com/product/dynatek-2000i-ignition-kit-for-harley-1970-2000", date: "2026-11-24" },
    "coil": { name: "Single-fire 3-ohm coil, chrome (Twin Power)", price: 114.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/twin-power-single-fire-3-ohm-ignition-coil-for-harley-1980-1999?sku_id=10066572", date: "2026-11-24", note: "Chrome finish; the black finish ($99.99) was out of stock." },
    "plugs": { name: "Spark plugs, pair (Drag Specialties, replaces 5R6A)", price: 15.85, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-performance-spark-plugs-for-harley-big-twin-1975-2000", date: "2026-11-24", note: "Price is per pair." },
    "voes": { name: "VOES (Drag Specialties replacement)", price: 67.36, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-replacement-vacuum-operated-electrical-switch", date: "2026-11-24" },
    "stator": { name: "Stator, 32-amp (Drag Specialties, replaces 29970-88)", price: 93.04, source: "J&P Cycles", url: "https://www.jpcycles.com/product/drag-specialties-stator-for-harley-evo-1988-1999", date: "2026-11-24" },
    "regulator": { name: "Regulator, 32-amp, black (Milwaukee Twins, replaces 74519-88)", price: 72.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/milwaukee-twins-regulator-for-harley-evo-1989-1999", date: "2026-11-24" },
    "plug-wires": { name: "Spark plug wire set (Hot Fire, 1980-1999)", price: 58.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/hot-fire-spark-plug-wire-set-for-harley-1980-1999", date: "2026-11-24" },
    "starter": { name: "Starter motor, 1.4kW, black (All Balls Racing)", price: 389.99, source: "J&P Cycles", url: "https://www.jpcycles.com/product/all-balls-racing-high-performance-14kw-starter-for-harley-big-twin-1990-2006", date: "2026-11-24" }
  },
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
  /* Torque & specs — FSM #99482-98 §2 (pp. 2-1 to 2-3) plus the chapter torque
     tables, all read visually from the rendered pages Nov 24, 2026: §3 p. 3-2
     (engine), §4 p. 4-1 (carburetor), §5 p. 5-1 (starter), §6 p. 6-1 (clutch &
     primary), §8 p. 8-1 (electrical & charging). Factory values only, never
     guessed. The generic bolt-size table (FSM §1, p. 1-10) is not included —
     the specific tables govern. Torque sequences (FSM §3 pp. 3-21–3-22 head
     bolts, p. 3-66 crankcase) were verified from the rendered pages
     Nov 24–25, 2026 and live in torque.sequences. */
  torque: {
    source: "Harley-Davidson Softail 1997-1998 Service Manual 99482-98. Section 2 (Specifications), pp. 2-1 to 2-3; chapter torque tables: §3 p. 3-2, §4 p. 4-1, §5 p. 5-1, §6 p. 6-1, §8 p. 8-1; torque sequences: §3 pp. 3-21–3-22 (head bolts, Figs. 3-16/3-17) and p. 3-66 (crankcase, Fig. 3-88); turn direction and per-head structure from the 1984–1999 Repair Manual step 6B. Covers FXSTC, FXSTS, FXSTSB, FLSTC, FLSTF, FLSTS.",
    rows: [
      { fastener: "Slider cap nuts (FLSTC, FLSTF, FXSTC)", value: "9-13 ft-lbs (12-18 Nm)" },
      { fastener: "Front axle nut (FXSTC, FLSTC, FLSTF)", value: "45-50 ft-lbs (61-68 Nm)" },
      { fastener: "Front axle nut (FXSTS, FXSTSB, FLSTS)", value: "60-65 ft-lbs (81-88 Nm)" },
      { fastener: "Rear axle nut", value: "60-65 ft-lbs (81-88 Nm)" },
      { fastener: "Brake disc screws, rear", value: "30-45 ft-lbs (41-61 Nm)" },
      { fastener: "Brake disc screws, front", value: "16-24 ft-lbs (22-33 Nm)" },
      { fastener: "Brake bleeder valve", value: "80-100 in-lbs (9-11.3 Nm)" },
      { fastener: "Brake pad retainer screw", value: "40-50 in-lbs (4.5-5.6 Nm)" },
      { fastener: "Rear wheel sprocket mounting bolts", value: "55-65 ft-lbs (74.6-88.1 Nm)" },
      { fastener: "Rear brake caliper (mounting) pin bolts", value: "15-20 ft-lbs (20-27 Nm)" },
      { fastener: "Rear fender supports", value: "30-33 ft-lbs (41-45 Nm)" },
      { fastener: "Rear shock absorber mounting bolts", value: "115-130 ft-lbs (156-176 Nm)" },
      { fastener: "Front brake bracket to fender bracket mounting bolt (FXSTS, FXSTSB, FLSTS)", value: "10-20 ft-lbs (14-27 Nm)" },
      { fastener: "Front brake caliper mounting bolts, FXSTC/FLSTC/FLSTF (upper)", value: "25-30 ft-lbs (34-41 Nm)" },
      { fastener: "Front brake caliper mounting bolts, FXSTS/FXSTSB/FLSTS (upper), 1997 models (12 pt. bolt)", value: "42-46 ft-lbs (57-62 Nm)" },
      { fastener: "Front brake caliper mounting bolts, FXSTS/FXSTSB/FLSTS (upper), 1998 models (socket head bolt)", value: "28-30 ft-lbs (38-41 Nm)" },
      { fastener: "Front brake caliper mounting bolts, FXSTS/FXSTSB/FLSTS (lower)", value: "25-30 ft-lbs (34-41 Nm)" },
      { fastener: "Brake banjo bolts", value: "17-22 ft-lbs (23-30 Nm)" }
    ],
    chapters: [
      { title: "Engine", ref: "FSM §3, p. 3-2", rows: [
        { fastener: "Crank pin nut", value: "180-210 ft-lbs (244-285 Nm)" },
        { fastener: "Pinion gear nut", value: "35-45 ft-lbs (47-61 Nm)" },
        { fastener: "Oil pump cover bolts", value: "90-120 in-lbs (10.2-13.6 Nm)" },
        { fastener: "Hydraulic lifter guide bolts", value: "9-12 ft-lbs (12-16 Nm)" },
        { fastener: "Hydraulic lifter screen plug", value: "90-120 in-lbs (10.2-13.6 Nm)" },
        { fastener: "Rocker cover screws — Part No. 4718A", value: "90-120 in-lbs (10-13 Nm)" },
        { fastener: "Rocker cover screws — Part Nos. 3997/882", value: "10-14 ft-lbs (14-19 Nm)" },
        { fastener: "Rocker cover screws — Part Nos. 3501/3500", value: "15-19 ft-lbs (20-26 Nm)" },
        { fastener: "Cylinder head bolts", value: "See Cylinder Head Torque Sequence below (FSM §3)" },
        { fastener: "Upper engine mounting bracket — to cylinder heads", value: "28-35 ft-lbs (38-48 Nm)" },
        { fastener: "Upper engine mounting bracket — to frame", value: "28-32 ft-lbs (38-43 Nm)" },
        { fastener: "Crankcase stud nut", value: "See Crankcase Torque Sequence below (FSM §3)" },
        { fastener: "Crankcase bolt", value: "See Crankcase Torque Sequence below (FSM §3)" },
        { fastener: "Gearcase cover screws", value: "90-120 in-lbs (10.2-13.6 Nm)" },
        { fastener: "Timer screws (inner cover and sensor plate)", value: "15-30 in-lbs (1.7-3.4 Nm)" },
        { fastener: "Spark plug", value: "18-22 ft-lbs (24-30 Nm)" }
      ] },
      { title: "Carburetor", ref: "FSM §4, p. 4-1", rows: [
        { fastener: "Manifold mounting capscrews", value: "15-17 ft-lbs (20-23 Nm)" },
        { fastener: "Backplate-to-cylinder head screws", value: "10-12 ft-lbs (14-16 Nm)" },
        { fastener: "Backplate-to-carburetor screws", value: "3-5 ft-lbs (4-7 Nm)" },
        { fastener: "Air cleaner cover screw", value: "3-5 ft-lbs (4-7 Nm)" }
      ] },
      { title: "Starter", ref: "FSM §5, p. 5-1", rows: [
        { fastener: "Thru-bolts", value: "39-65 in-lbs (4.4-7.3 Nm)" },
        { fastener: "End cover mounting bracket", value: "50-60 in-lbs (5.6-6.8 Nm)" },
        { fastener: "End cover center screw", value: "90-110 in-lbs (10.2-12.4 Nm)" },
        { fastener: "Cable terminal nuts", value: "65-80 in-lbs (7.3-9.0 Nm)" },
        { fastener: "Starter mounting bolts", value: "13-20 ft-lbs (18-27 Nm)" },
        { fastener: "Jackshaft bolt", value: "7-9 ft-lbs (9-12 Nm)" }
      ] },
      { title: "Clutch & primary", ref: "FSM §6, p. 6-1", rows: [
        { fastener: "Primary cover screws", value: "108-120 in-lbs (12-13.5 Nm)" },
        { fastener: "Primary chain inspection cover screws", value: "50-70 in-lbs (5.6-7.9 Nm)" },
        { fastener: "Clutch inspection cover screws", value: "50-70 in-lbs (5.6-7.9 Nm)" },
        { fastener: "Compensating sprocket nut", value: "150-165 ft-lbs (203-224 Nm)" },
        { fastener: "Transmission sprocket nut", value: "50 ft-lbs (67.8 Nm) initial torque, then turn another 30°-45°" },
        { fastener: "Transmission sprocket locking screw", value: "7-9 ft-lbs (9-12 Nm)" },
        { fastener: "Clutch hub nut (left hand threads)", value: "70-80 ft-lbs (95-108 Nm)" },
        { fastener: "Clutch adjusting screw jamnut", value: "6-10 ft-lbs (8-14 Nm)" }
      ] },
      { title: "Electrical & charging", ref: "FSM §8, p. 8-1", rows: [
        { fastener: "Neutral switch (1997 models)", value: "3-5 ft-lbs (4-7 Nm)" },
        { fastener: "Neutral switch (1998 models)", value: "10-15 ft-lbs (13.6-20.3 Nm)" },
        { fastener: "Sensor plate screws", value: "15-30 in-lbs (1.7-3.4 Nm)" },
        { fastener: "Inner timer cover screws", value: "12-20 in-lbs (1.4-2.3 Nm)" },
        { fastener: "Rotor bolt", value: "75-80 in-lbs (8.5-9.0 Nm)" },
        { fastener: "Alternator stator Torx screws", value: "30-40 in-lbs (3.5-4.5 Nm)" },
        { fastener: "Alternator sprocket nut", value: "150-165 ft-lbs (203-224 Nm)" },
        { fastener: "Battery terminal bolts", value: "40 in-lbs (4.5 Nm)" },
        { fastener: "Headlamp adjustment screws (FXSTS, FXSTSB, FLSTS)", value: "30 ft-lbs (41 Nm)" },
        { fastener: "Passing lamp & bracket nuts (FLSTC)", value: "18 ft-lbs (24 Nm)" },
        { fastener: "Turn signal module bolt", value: "10 in-lbs (1.1 Nm)" },
        { fastener: "Horn cover screws (FLSTS)", value: "23-28 in-lbs (2.6-3.1 Nm)" },
        { fastener: "Horn nut (all except FLSTS)", value: "110 in-lbs (12.4 Nm)" },
        { fastener: "Speed sensor mounting screw", value: "7-9 ft-lbs (9.5-12 Nm)" },
        { fastener: "Handlebar clamp — master cylinder Torx screws", value: "60-80 in-lbs (6.8-9.0 Nm)" },
        { fastener: "Upper and lower switch housing Torx screws", value: "35-45 in-lbs (3.9-5.1 Nm)" },
        { fastener: "Handlebar clamp — clutch lever bracket Torx screws", value: "60-80 in-lbs (6.8-9.0 Nm)" }
      ] },
      { title: "Sportster (1986–2003)", ref: "Sportster 1986–2003 Service Manual (sportster-86-03). These are Sportster values, NOT corrections to the Softail tables above — same fastener, different bike. Use only on 1986–2003 Sportsters.", rows: [
        { fastener: "Clutch inspection cover screws", value: "84–108 in-lbs (9.5–12.2 Nm) — conflicts with Softail FSM §6 50–70 in-lbs" },
        { fastener: "Spark plug", value: "11–18 ft-lbs (15–24 Nm) — Softail FSM §3 says 18–22 ft-lbs" }
      ] }
    ],
    /* Torque sequences — verified from the rendered FSM pages Nov 24–25,
       2026 (full write-up: ~/workspace/research_notes/torque-sequences-figures.md).
       Head: mirrored numbering between heads, three passes per head, repeat on
       the other head (Repair Manual 6B). Crankcase: 8 positions criss-cross,
       two passes with cylinders/heads installed between them. The FSM misprints
       the crankcase second pass as "(20–35 Nm)" — the real conversion is
       20–23 Nm, flagged in the note, never used as a value. */
    sequences: [
      {
        id: "head-bolts",
        title: "Cylinder head bolts",
        ref: "FSM #99482-98 §3, pp. 3-21–3-22 (Figs. 3-16, 3-17)",
        figure: "Front head: 1 top-left, 3 top-right, 2 bottom-left, 4 bottom-right. Rear head mirrored: 2 top-left, 4 top-right, 1 bottom-left, 3 bottom-right. The 1-2-3-4 order runs one side's pair first, then the other.",
        caution: "Extremely critical — prevents gasket leaks, stud failure, and head and cylinder distortion.",
        prep: [
          "New O-rings over the cylinder dowels before the head gasket.",
          "Clean and lubricate bolt threads with engine oil; screw the bolts onto the studs to check for friction — dirt makes torque readings lie.",
          "Dip the bottom face of bolts in oil, wipe off excess; install finger tight.",
          "Hardened fasteners only — never substitute unhardened parts; do not reuse fiber cover seals."
        ],
        passes: [
          { value: "7–9 ft-lbs (9–12 Nm)", order: "1, 2, 3, 4" },
          { value: "12–14 ft-lbs (16–19 Nm)", order: "1, 2, 3, 4" },
          { value: "One quarter-turn (90°) clockwise, one bolt at a time", order: "1, 2, 3, 4", note: "Mark a line on the head and a matching line on each bolt head first (Fig. 3-17); finished when all marks sit as in View B" }
        ],
        repeat: "Repeat the whole procedure on the other head.",
        note: "FSM step 2 reads 'on the other cylinder'; the 1984–1999 Repair Manual step 6B (same values) makes clear both passes are done per head, then repeated on the opposite head. Turn direction (clockwise) is from Repair Manual 6B.d, consistent with FSM Fig. 3-17."
      },
      {
        id: "crankcase",
        title: "Crankcase fasteners",
        ref: "FSM #99482-98 §3, p. 3-66 (Fig. 3-88)",
        figure: "8 positions, criss-cross: 1 bottom-right of the flywheel cavity, 2 top-center between the cylinders, 3 bottom-left of the cavity, 4 upper-right edge, 5 mid-left edge, 6 far-right edge, 7 upper-left edge, 8 lower-right edge. Never two adjacent positions in a row.",
        caution: "Follow the procedure — crankcase longevity may be compromised otherwise.",
        prep: [
          "Three alignment studs first — they align the case halves and go in before the remaining studs.",
          "Non-hardening sealer (HD-99650-81 or 3M #800) on the mating surfaces.",
          "Start nuts and tighten until snug, then torque in sequence."
        ],
        passes: [
          { value: "10 ft-lbs (14 Nm)", order: "1 through 8, starting with #1", note: "Cases empty" },
          { value: "15–17 ft-lbs (20–23 Nm)", order: "1 through 8, same sequence", note: "After cylinders and heads are installed" }
        ],
        note: "The FSM prints '(20–35 Nm)' for the second pass — a misprint in the book. 15–17 ft-lbs converts to 20–23 Nm. Never use 35 Nm."
      }
    ],
    capacities: {
      all: "Oil tank 3.0 qt (with filter) · Transmission 24 oz · Primary chaincase 32 oz (1997) / 26 oz (1998)",
      flstc: "Fuel tank 4.2 gal (0.4 reserve) · Front fork 11.5 oz each (wet, except Springers) — FLSTC / FLSTF / FLSTS / FXSTS / FXSTSB",
      fxstc: "Fuel tank 5.2 gal (0.6 reserve) · Front fork 10.2 oz each (wet) — FXSTC",
      sportster: "Sportster transmission / primary: 24 oz (1986–1992) · 32 oz (1993–2003) (sportster-86-03)"
    },
    tire_pressures: {
      flstc: "FLSTC / FLSTF / FLSTS — solo 36 front / 36 rear · rider + passenger 36 / 40",
      fxstc: "FXSTC / FXSTS / FXSTSB — solo 30 front / 36 rear · rider + passenger 30 / 40",
      note: "Dunlop only, cold. Never exceed the maximum pressure on the tire sidewall."
    },
    dimensions: [
      { model: "FLSTC", length: "94.0 in", wheelbase: "63.9 in", saddle: "26.5 in", height: "59.4 in", dry: "704 lb", gvwr: "1,118 lb" },
      { model: "FLSTF", length: "93.9 in", wheelbase: "63.9 in", saddle: "26.5 in", height: "48.0 in", dry: "631 lb", gvwr: "1,118 lb" },
      { model: "FLSTS", length: "94.0 in", wheelbase: "63.1 in", saddle: "25.8 in", height: "44.0 in", dry: "690 lb", gvwr: "1,135 lb" },
      { model: "FXSTC", length: "94.92 in", wheelbase: "66.5 in", saddle: "26.7 in", height: "47.0 in", dry: "613 lb", gvwr: "1,084 lb" },
      { model: "FXSTS", length: "92.5 in", wheelbase: "64.4 in", saddle: "26.1 in", height: "47.0 in", dry: "625 lb", gvwr: "1,084 lb" },
      { model: "FXSTSB", length: "92.5 in", wheelbase: "64.4 in", saddle: "25.7 in", height: "47.0 in", dry: "620 lb", gvwr: "1,084 lb" }
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
    { name: "Ronnie's HLSM fiche", url: "https://www.ronniesmailorder.com/", note: "Same factory fiche; * marks superseded parts" }
  ],
  /* Joshua's own bikes — the ground truth for the atlas. His photos, not stock. */
  own_photos: [
    { file: "assets/softail-1990-joshua.jpg", subject: "1990 Softail — Joshua's bike, in the garage", credit: "Joshua's own photo (still from his Nov 24, 2026 video)" }
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
  ]
};
if (typeof module !== "undefined") module.exports = ED_DATA;
