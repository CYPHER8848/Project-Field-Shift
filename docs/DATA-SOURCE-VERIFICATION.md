# Data-source verification — Field Shift

**Verification date:** 14 November 2026  
**Evidence origin:** Local Antigravity execution report supplied by the project team. The raw execution logs and JSON evidence were not available through the connected GitHub repository at the time this document was published. Treat the reported HTTP results below as team-reported evidence pending reproducibility from the committed test script.

| Source | Reported HTTP result | Status | Decision |
|---|---:|---|---|
| NASA POWER Daily Point API | 200 OK | **WORKS** (reported) | Use daily data as the weather backbone. Precompute selected points and aggregate to weekly records. |
| NASA GIBS WMTS | 200 OK for capabilities and sample tiles | **WORKS** (reported) | Use verified NDVI, land-surface-temperature and SMAP root-zone-moisture layers for map visualization. |
| ISRIC SoilGrids REST | Root 200; property query timed out after 15 s | **USE FALLBACK** | Do not make SoilGrids REST a runtime dependency. Use labelled regional values from authoritative surveys or omit soil properties. |
| Open Topo Data SRTM 30m | 200 OK | **WORKS** (reported) | Precompute elevation and slope proxies for demo points; do not query repeatedly from browsers. |

## Evidence reported by local verification run

The following details are transcribed from the Antigravity execution report. The reproducible script and machine-readable evidence still need to be pushed to this repository before this report can be independently rerun from GitHub.

### NASA POWER

- Test point: latitude 30.90, longitude 75.85 (illustrative Punjab point, not a farm location).
- Period: 1–7 January 2025.
- Reported request:

```text
https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,EVLAND,GWETROOT,GWETTOP,ALLSKY_SFC_SW_DWN&community=AG&longitude=75.85&latitude=30.90&start=20250101&end=20250107&format=JSON&time-standard=UTC
```

- Reported result: HTTP 200; all eight parameters present; zero missing values in the sample week; fill value metadata `-999.0`.
- Reported units: temperature in °C; precipitation and land evaporation in mm/day; `GWETROOT` and `GWETTOP` dimensionless wetness fractions; solar radiation in MJ/m²/day.
- Interpretation: wetness fractions are not volumetric soil moisture. `EVLAND` is land evaporation, not crop evapotranspiration. Map fill values to null.

### NASA GIBS

- Capabilities document reportedly returned HTTP 200 and parsed 1,330 layers.
- Reported layers:
  - `MODIS_Terra_L3_NDVI_16Day` — use for multi-year vegetation greenness.
  - `MODIS_Terra_NDVI_8Day` — reported rolling recent availability only; do not use for long historical series without checking its time domain.
  - `MODIS_Terra_Land_Surface_Temp_Day` — daytime land surface temperature.
  - `SMAP_L4_Analyzed_Root_Zone_Soil_Moisture` — root-zone moisture visualization.
- Sample tile requests reportedly returned valid PNG responses (HTTP 200). Exact URLs and binary evidence should be retained in the test JSON when the branch is updated.

### ISRIC SoilGrids

- Root endpoint reportedly returned HTTP 200.
- A property query timed out after 15 seconds with no response bytes.
- Decision: `USE FALLBACK`. Do not treat a successful root-page response as proof that property queries work. Any regional values must be explicitly labelled as estimates or regional reference values, not farm measurements.

### Open Topo Data SRTM 30m

- Test point: 30.90, 75.85.
- Reported request: `https://api.opentopodata.org/v1/srtm30m?locations=30.90,75.85`
- Reported result: HTTP 200, dataset `srtm30m`, elevation 247.0 m.
- A five-point neighborhood test reportedly returned valid elevations and was used to confirm that a coarse slope estimate can be derived. Slope is derived from neighboring elevations; it is not a direct API field.

## Four demonstration regions

The Antigravity report states that POWER, SRTM and GIBS sample requests were tested at provisional representative points:

| Region | Provisional point (lat, lon) | POWER mean T2M reported | SRTM elevation reported |
|---|---:|---:|---:|
| Punjab, India | 30.90, 75.85 | 12.56 °C | 247 m |
| Iowa, USA | 42.03, -93.63 | -4.05 °C | 277 m |
| Karnataka, India | 15.45, 75.00 | 21.24 °C | 739 m |
| Machakos, Kenya (Sahel/Kenya comparison placeholder) | -1.52, 37.26 | 22.61 °C | 1,611 m |

These are provisional demonstration coordinates, not verified farm sites. The reported rainfall values are single-week daily means and must not be interpreted as climatological rainfall or annual rainfall.

## Data and science cautions

- Preserve missing/fill values as null; do not silently interpolate.
- Distinguish observation/product cadence from the weekly simulation timestep.
- GIBS raster tiles are for visual context; do not treat rendered tile colours as calibrated numerical time-series data without a documented retrieval and scaling workflow.
- POWER land evaporation is not crop ET.
- POWER wetness fractions are not volumetric soil moisture.
- SRTM elevation is a terrain input; slope must be derived from a defined neighborhood or DEM processing method.
- All regional points remain provisional until the team approves exact representative locations.
- SoilGrids fallback values require citations and explicit provenance.

## Reproducibility and outstanding items

Antigravity reported creating:
- `scripts/verify_data_sources.py`
- `docs/evidence/verification_results.json`

Those files were **not present on the remote branch when this report was committed**. The local Antigravity push failed because its terminal had no usable Git credentials. They must be pushed in a follow-up commit, and the JSON should contain request URLs, timestamps, HTTP statuses, concise response metadata and sample values (not unnecessary large raw payloads).

Before treating this as fully closed:
1. Commit the script and JSON evidence.
2. Re-run the script from a clean checkout or CI and verify it exits successfully.
3. Confirm exact region points and the intended Kenya/Sahel framing.
4. Have the team review the data interpretation and approve the source decisions.

## Official references

- NASA POWER Daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- NASA POWER request tutorial: https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/
- NASA GIBS access basics: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA GIBS advanced topics: https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/
- ISRIC SoilGrids: https://isric.org/explore/soilgrids/
- ISRIC REST entry page: https://rest.isric.org/
- Open Topo Data API: https://www.opentopodata.org/api/
- Open Topo Data SRTM: https://www.opentopodata.org/datasets/srtm/
