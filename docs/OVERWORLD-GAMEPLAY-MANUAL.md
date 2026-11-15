# Project Field Shift — 2D Retro Overworld Game & Systems Manual

> **Target Audience**: Players, Evaluators, and Developers exploring the 2D Top-Down Retro Overworld in *Project Field Shift*.  
> **Aesthetic**: Botanical Field Journal meets 16-Bit Game Boy Advance (Zelda: A Link to the Past & FireRed styling) — strictly **zero emojis**, Earth and botanical color palettes, and real NASA Earth Science telemetry.

---

## 1. Overview & Vision

The Overworld is a fully interactive, edge-to-edge 2D top-down retro simulation of **Amma's Farm in Punjab**. Rather than presenting agroecological data in static tables, players navigate the actual landscape—inspecting terraced fields, monitoring irrigation canals, consulting with local elders and extension agronomists, and applying real agricultural practices.

---

## 2. Controls & Input Mapping

The engine supports full keyboard accessibility on desktop as well as a virtual on-screen D-Pad and action buttons for mobile touch devices.

| Action | Desktop Keyboard | Mobile Gamepad | Effect |
| :--- | :--- | :--- | :--- |
| **Move Up / Down / Left / Right** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual 4-Way D-Pad | Smooth directional movement with wall-sliding physics |
| **Sprint / Run** | `Shift` or `X` (Hold) | `[B]` Button (Hold) | 1.55× movement speed with footstep dust trails |
| **Action / Interact** | `Space`, `Enter`, or `E` | `[A]` Button | Talk to NPCs, inspect machinery, or execute equipped tool on plots |
| **Cycle Equipped Tool** | `Q` or `Tab` | `[TOOL]` Pill | Cycle between Seeds, Water, Soil Probe, and Almanac |
| **Cycle Time of Day** | `T` (or click HUD pill) | Tap HUD Time Badge | Cycle lighting: Dawn → Noon → Sunset → Night |
| **Toggle Mini-Map Radar** | `M` (or click radar box) | Tap Radar Box | Toggle bottom-left 84×63 radar screen |
| **Pause / Quick Menu** | `Escape` | `[START]` Button | Opens pause menu with rotation comparison and scene transitions |

---

## 3. The Agroecological Tool Belt

Players carry four tactile farming implements in their equipped item box (top-right HUD):

### 1. 🌱 Seed Pouch (Cover Crops & Legumes)
- **Tool Logic**: Press `[Space]` while standing on either the North or South terrace.
- **Agronomic Impact**: Sows deep-rooted *Vigna radiata* (Mung bean) or clover cover crops.
- **Telemetry Change**: **+4 kg/ha Biological Nitrogen**, **+2% Soil Organic Matter (SOM)**.
- **Audio & Visual**: Green and gold scattering seed particles with a gentle rising arpeggio sound.

### 2. 💧 Alternate Wetting & Drying (AWD) Water Lota
- **Tool Logic**: Press `[Space]` on furrows to irrigate with measured canal flow.
- **Agronomic Impact**: Simulates intermittent PAU Alternate Wetting and Drying (AWD). Avoids continuous standing water, aerating roots and reducing methane volatilization by 38%.
- **Telemetry Change**: **+8% Root-Zone Moisture**.
- **Audio & Visual**: Splashing water droplet arcs with liquid trickle audio.

### 3. 🔬 NASA SMAP Soil Core Probe
- **Tool Logic**: Press `[Space]` anywhere on fields to launch an active telemetry scan.
- **Interactive Readout**: Opens the **NASA SMAP Soil Core Modal**, rendering a 3-stratum geological cross-section:
  - **0–15 cm (Topsoil)**: Soil Organic Matter %, aggregate crumb stability, earthworm burrows.
  - **15–60 cm (Subsoil Root-Zone)**: NASA SMAP GWETROOT moisture %, legume root nodulation.
  - **60+ cm (Parent Hardpan)**: NASA GRACE aquifer drawdown depth (40m in 1990, 82m in 2026), plow pan compaction.

### 4. 📜 Crop Rotation Almanac
- **Tool Logic**: Press `[Space]` to immediately open the 3-Strategy Comparison Screen (`existing`, `income`, `resilience`) featuring Monte Carlo percentiles (p10, p50, p90).

---

## 4. Living Farm Wildlife & Atmospheric Systems

- **Ganga the Sahiwal Bullock Companion**:
  - Positioned beside the ancestral seed shed (x: 270, y: 110) with gentle breathing bob, ear twitches, and tail swishing.
  - Interaction allows collecting composted farm manure to feed field plots (**+6% SOM**).
- **Canal Waterfall & Foam Bubbles**:
  - The ancestral tubewell discharge pipe expels a frothing blue water cascade into the canal, spawning foam bubbles that drift westward with wave ripples.
- **Gliding Dragonflies**:
  - 3 dragonflies (Azure, Golden, Emerald) skim across the water canal and flower clusters with realistic sinusoidal flight physics.
- **Chimney Smoke**:
  - Warm pixel smoke puffs rise and expand continuously from Amma's farmhouse roof.
- **Diurnal Time-of-Day Lighting Filter**:
  - **Dawn**: Soft morning turmeric amber (`rgba(255, 210, 120, 0.12)`).
  - **Noon**: Crisp, natural high-noon sun.
  - **Sunset**: Terracotta golden hour glow (`rgba(235, 110, 40, 0.18)`).
  - **Night**: Deep sapphire twilight (`rgba(10, 20, 50, 0.42)`) with glowing radial lantern halos around Amma’s veranda, the tubewell pump, and the seed shed.

---

## 5. NASA Earth Science Telemetry Integration

The overworld directly connects physical farm mechanics to authoritative satellite observations:

1. **NASA GRACE / GRACE-FO (Aquifer Gravity Anomaly)**:
   - Monitored at the Ancestral Tubewell (x: 820, y: 380).
   - Simulates regional mass variation ($−3.2\text{ to }−4.0\text{ cm/yr}$).
   - **Cavitation Risk Mechanic**: Pumping above 1800 RPM draws sand and silt from depleted subterranean aquifers, causing cavitation pitting and engine wear.
2. **NASA SMAP L4 (Soil Moisture Active Passive)**:
   - Sampled via the Soil Core Probe.
   - Accurately tracks root-zone wetness (`GWETROOT`), distinguishing surface moisture from subsoil drought.
3. **NASA POWER (Meteorology & Solar Irradiance)**:
   - Monitored at the Village Weather Post (x: 80, y: 370).
   - Displays all-sky surface solar irradiance (`ALLSKY_SFC_SW_DWN`) and evaporative demand (`EVLAND`).

---

## 6. Verification & Automated Test Suite

The engine includes full unit and integration test coverage:

```bash
# Run all 39 automated tests (24 simulation engine + 15 GBA overworld)
npm test

# Run GBA-specific engine tests
npm run test:gba

# Run simulation contracts and physics tests
npm run test:sim
```

- **`tests/gba/dialogue-graph.test.ts`**: Verifies 100% of dialogue nodes have valid choices, no broken link targets, and valid speaker portraits.
- **`tests/gba/movement-physics.test.ts`**: Verifies bounding collision checks, wall-sliding, canal bridge crossing, and proximity radii.
- **`tests/gba/tool-mechanics.test.ts`**: Verifies tool state cycles, diurnal lighting transitions, meter clamping [0, 100], and pump physics formulas.
