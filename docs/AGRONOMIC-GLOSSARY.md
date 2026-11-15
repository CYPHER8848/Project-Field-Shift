# Project Field Shift — Agronomic & Earth Science Glossary

> **Purpose**: Authoritative reference for agronomic terms, NASA Earth Science telemetry indicators, and engineering principles used across *Project Field Shift*.  
> **Scientific Mandate**: *"Field Shift supports farmers and local experts. It does not replace their judgement."*

---

## 1. NASA Earth Science Observations

### NASA GRACE / GRACE-FO (Gravity Recovery and Climate Experiment)
- **What it is**: Twin satellites tracking minute changes in Earth's gravitational field caused by regional shifts in subterranean water mass.
- **Project Application**: Monitored at the Ancestral Tubewell in Punjab to quantify the regional groundwater overdraft trend ($-3.2\text{ to }-4.0\text{ cm/yr}$ equivalent water height anomaly).
- **Caveat**: GRACE provides coarse regional mass changes; it does not measure an individual farmer's borehole head or replace local water table dipping tubes.

### NASA SMAP L4 (Soil Moisture Active Passive)
- **Parameter**: `GWETROOT` (Root-zone wetness, 0–100 cm depth) and `GWETTOP` (Surface 0–5 cm skin layer wetness).
- **Physical Meaning**: Expressed as relative saturation (dimensionless fraction from 0.0 to 1.0).
- **Critical Distinction**: `GWETTOP` is heavily influenced by rapid diurnal surface evaporation and solar baking, whereas `GWETROOT` determines actual crop transpirational access.

### NASA POWER (Prediction of Worldwide Energy Resources)
- **`ALLSKY_SFC_SW_DWN`**: All-sky downward solar shortwave radiation ($MJ/m^2/day$). Essential for photosynthetic assimilation and evaporative potential. Satellite records begin on 1984-01-01; prior years must remain null (not fabricated).
- **`EVLAND`**: Total land surface evapotranspiration ($mm/day$). Combines transpiration from vegetation canopy and direct evaporation from soil.
- **`PRECTOTCORR`**: Total bias-corrected precipitation ($mm/day$).
- **`T2M_MAX` / `T2M_MIN`**: Daily maximum and minimum ambient 2-meter air temperatures ($^\circ C$).

---

## 2. Agroecological Principles & Interventions

### Alternate Wetting and Drying (AWD)
- **Concept**: Developed by the International Rice Research Institute (IRRI) and adapted by Punjab Agricultural University (PAU).
- **Mechanism**: Instead of keeping paddy fields continuously submerged under 5–10 cm of standing water, the water is allowed to naturally drop 5–15 cm below the soil surface before re-irrigating.
- **Benefits**: Cuts water extraction volume by 30–38%, prevents pump motor burnout, aerates root tips, and reduces anaerobic methane ($CH_4$) emissions by up to 40%.

### Biological Nitrogen Fixation (BNF) & Leghemoglobin
- **Concept**: Symbiosis between legumes (*Vigna radiata*, chickpea, cowpea, soybean) and soil bacteria (*Rhizobium*).
- **Mechanism**: Bacteria within root nodules express the enzyme **nitrogenase** to convert inert atmospheric nitrogen gas ($N_2$) into ammonium ($NH_4^+$).
- **Indicator**: Active nodules exhibit a distinct pink/red interior caused by **leghemoglobin**, a plant oxygen-carrier protein that protects oxygen-sensitive nitrogenase.
- **Agronomic Value**: Adds 30–50 kg of bioavailable nitrogen per hectare, dampening synthetic urea dependency.

### Turbo Happy Seeder & In-Situ Residue Management
- **Concept**: Tractor-mounted implement designed to sow wheat directly into standing, unburned rice stubble.
- **Agronomic Benefit**:
  1. Completely eliminates seasonal paddy stubble burning smog.
  2. Preserves 40% more soil moisture during early vegetative growth.
  3. Lowers surface soil temperature by 3–5°C during pre-monsoon heatwaves.
  4. Recycles organic carbon into the soil profile.

### The Soil Sponge (Soil Organic Matter / SOM)
- **Concept**: Decomposed plant and microbial biomass forming stable humus in the top 15 cm.
- **Rule of Thumb**: For every 1.0% increase in topsoil SOM, the soil profile can hold up to 20,000 additional gallons of water per acre, creating a vital hydrological buffer against extreme dry spells.

### Tubewell Cavitation & Sand Suction
- **Concept**: Fluid dynamics phenomenon occurring when deep submersible pumps extract water faster than regional aquifer recharge.
- **Breakdown**: Rapid pressure drops create vapor bubbles that collapse violently against the pump impeller, pitting stainless steel blades and pulling abrasive sand particles into the motor, causing catastrophic failure ($1,200+ repair cost).

### RUSLE Cover and Management Factor ($C$)
- **Concept**: Factor from the Revised Universal Soil Loss Equation (RUSLE).
- **Mechanism**: Vegetative ground cover and dense root networks intercept raindrop kinetic energy and bind loose soil granules.
- **Model Behavior**: High-cover crops (e.g., cereal rye at 0.90, cowpea at 0.75) dampen soil erosion risk to near zero compared to exposed bare fallow ($C = 1.0$).
