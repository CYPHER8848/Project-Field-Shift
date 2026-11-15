# Karnataka Deccan Dryland Story Adaptation — Semi-Arid Millets & Hard-Rock Aquifers

This document outlines the authoritative narrative architecture, pedagogical objectives, character dialogues, and agroecological mechanics for the **Karnataka Deccan Plateau** (Kolar/Tumkur illustrative dryland archetype).

---

## 1. Agroecological & Regional Framing

- **Geography & Soil:** Deccan semi-arid red gravelly sandy clay loam (*Alfisol* / *Inceptisol*). Characterized by shallow topsoil (15–30 cm), high crusting risk, rapid drainage, low natural organic carbon (0.35–0.50% SOM), and an underlying impermeable granite/gneiss hardpan.
- **Climatic Pressures:** Highly erratic rainfall (550–750 mm annually) with an average precipitation coefficient of variation (CV) exceeding 32%. Increasing occurrence of prolonged mid-monsoon dry spells (20–35 days) during critical flowering and grain-filling windows.
- **Aquifer Geohydrology:** Deep hard-rock crystalline aquifers. Historically recharged by cascade tank systems (*Kere*). Post-1990 tubewell boom led to rapid proliferation of 800–1,200 ft borewells, resulting in borehole dry-outs, high capital debt, and mobilization of geogenic fluoride and arsenic.
- **Sovereign Counter-Strategy:** Traditional *Akkadi Saalu* (multi-crop row intercropping of Finger Millet *Ragi*, Red Gram *Togari*, and Field Bean *Avare*), decentralized farm ponds (*Krishi Hondi*) with silt-filtration traps, gravity micro-drip pulses, and open-pollinated landrace preservation (*GPU-28, ML-365, Hallu Ragi*).

---

## 2. Character Cast & Generational Arcs

1. **Ajja Thimmegowda (1990 Matriarch/Patriarch):**
   - Guardian of indigenous soil knowledge. Speaks of stone contour bunds (*Katte*), bamboo seed storage (*Kanaja*), and the sacred balance of 4-row *Akkadi Saalu*. Reprimands the player if they chase single-season hybrid monocultures on credit.
2. **Young Gowri (1990) → Elder Ajji Gowri (2026 & 2040):**
   - The central generational protagonist. In 1990, she learns seed selection by hand. By 2026, as an elder farmer, she confronts the borewell crisis when her son Chetan attempts to drill past 1,000 feet. In 2040, she guides her grandchildren Ananya and Tejas through climate heatwaves.
3. **Adult Chetan (2026):**
   - Gowri’s son, representing the green revolution transition generation trapped in commercial water-drilling debt, struggling between aggressive pumping and community pond restoration.
4. **Ananya & Tejas (2040):**
   - Gowri’s tech-literate grandchildren who integrate NASA satellite telemetry (POWER & GRACE) with ancestral seed wisdom, maintaining village seed sovereignty and solar micro-drip networks.

---

## 3. Generational Eras & Interactive Minigames

### Era 1: 1990 — The Inherited Red Soil & Akkadi Saalu
- **Context:** The ancestral dryland farm. Monsoon is variable, but village cascade tanks hold seasonal buffer. Seed companies begin marketing commercial hybrid maize that demands high nitrogen and chemical inputs.
- **Interactive Minigame:** 4-Row Deccan Intercrop Configuration.
  - Crops available:
    - *Finger Millet (Ragi / Eleusine coracana)*: Fibrous silica roots loosen red soil hardpan; high calcium drought survivor.
    - *Red Gram (Togari Bele / Cajanus cajan)*: Deep 1.8m taproot mines subsoil moisture; fixes 40 kg biological N/ha.
    - *Field Bean (Avarekai / Lablab purpureus)*: Dense trailing foliage cushions raindrop impact, preventing surface crusting.
    - *Commercial Hybrid Maize (Zea mays)*: High-demand cash crop requiring 680mm water and heavy chemical fertilizer.
  - **Success Condition:** Player must assign at least two legume rows (Togari/Avare) and zero hybrid maize monoculture.
  - **Reprimand Loop:** If hybrid maize monoculture is chosen, Ajja Thimmegowda intervenes:
    > *“Look at the red dust on your feet! Hybrid maize drinks six hundred millimeters of water—in our dry red soil, a twenty-day August dry spell will shrivel its tassels before the cob forms. Ragi and Togari are sisters: the millet feeds our family, and the pulse feeds the soil. Replant the rows!”*

### Era 2: 2026 — The Hard-Rock Borewell Crisis & Krishi Hondi
- **Context:** Severe regional groundwater depression. Surrounding farms have drilled 1,200 ft borewells into Deccan basalt, exhausting fracture zones and pumping brackish fluoride water. NASA GRACE telemetry confirms localized aquifer depletion rate of $-2.8\text{ cm/yr}$.
- **Interactive Minigame:** Krishi Hondi Silt Sluice & Micro-Drip Calibration.
  - Three tactical decisions:
    1. *Catchment Inlet:* Bare channel vs Trench bund vs Silt-filtration pond.
    2. *Water Delivery:* 1,200-ft deep borewell vs Krishi Hondi gravity micro-drip vs Diesel tanker.
    3. *Soil Covering:* Bare exposed red clay vs Ragi straw residue mulch.
  - **Success Condition:** Silt pond + Krishi Hondi micro-drip + Ragi straw mulch.
  - **Reprimand Loop:** If the 1,200-ft borewell is activated:
    > *“Chetan, stop the pump! The impeller is grinding dry basalt gravel at twelve hundred feet! NASA GRACE satellite telemetry reveals our regional water table is collapsing at nearly three centimeters every single year. The deeper you drill, the more toxic fluoride you draw up. We must catch the rain where it falls!”*

### Era 3: 2040 — +2.2°C Dryland Warming & Seed Sovereignty
- **Context:** 2040 regional climate models predict +2.2°C ambient temperature rise and a 35-day delayed monsoon onset. Corporate agri-tech firms offer automated AI advisory tools that dictate corporate seed contracts.
- **Interactive Minigame:** The Three Sovereignty Dilemmas.
  1. *Delayed Monsoon Onset:* Wait for pre-sowing showers and drill indigenous short-duration Ragi (ML-365) + Cowpea rather than buying hybrid maize on credit.
  2. *August Dry Spell Rationing:* Meter micro-drip pulses at 2 liters/plant during dawn and twilight rather than draining the farm pond with flood irrigation.
  3. *AI Decision Ethics:* Uphold the foundational Field Shift principle: **“Field Shift supports farmers and local experts. It does not replace their judgment.”** Reject automated corporate tree-clearing advice.
  4. **Success Dialogue:** Ajji Gowri awards the sacred Sankranti sheaves of grain to Ananya and Tejas, celebrating 50 years of soil sponge restoration (+20% SOM increase).

---

## 4. Verification & Testing

The Karnataka dryland rules engine is verified with 100% automated test coverage in `tests/story/karnataka-story.test.ts`:
- Pure algorithmic evaluation in `src/lib/story/karnataka-rules.ts`.
- Validates crop biological traits, nitrogen fixation rules, water mass conservation, and dilemma scoring.
- Zero financial tokens/currencies exposed in story mode (strictly ecological vitals: Moisture %, SOM %, Nitrogen %).
