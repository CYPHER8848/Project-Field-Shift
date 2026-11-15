# Field Shift data sources and preparation

## NASA POWER weekly weather

The static regional weather files are precomputed from the NASA POWER **daily point API**, Agroclimatology community (`community=AG`). The request parameters are:

| Field in frozen contract | POWER parameter | Aggregation | Published unit |
|---|---|---|---|
| `tmax` | `T2M_MAX` | maximum daily maximum within ISO week | °C |
| `tmin` | `T2M_MIN` | minimum daily minimum within ISO week | °C |
| `rain` | `PRECTOTCORR` | sum of daily precipitation | mm/week |
| `soilWet` | `GWETTOP` | mean daily surface wetness | fraction (0–1) |
| `evap` | `EVLAND` | mean daily latent-energy equivalent converted to water depth | mm/day |
| `solar` | `ALLSKY_SFC_SW_DWN` | mean daily shortwave radiation | MJ/m²/day |

EVLAND is a latent-energy flux in the daily hydrology product. The prep script checks the response metadata before publishing values. If POWER reports mm/day, the value is used directly. If POWER reports MJ/m²/day, the script converts it to an equivalent mm/day using 2.45 MJ/kg. Any unrecognized unit causes the script to stop rather than publish a silent unit error. This is an energy-equivalent evaporation proxy, not a direct field measurement.

The date range is 1981-01-01 through 2025-12-31 (45 calendar years). Records are grouped by ISO year and ISO week. A missing POWER value (`-999`) becomes `null`; it is never interpolated or replaced with synthetic values. In a week with partial observations, aggregation uses available daily values. Consumers should preserve nulls and should not treat them as zero. The final three calendar days (29–31 December 2025) belong to ISO year 2026, week 1. Therefore, the final record is labelled 2026-W01 and contains only those three days. This preserves the complete requested calendar date range.

### API and parameter references

- NASA POWER daily point API tutorial: https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/
- NASA POWER parameter guide: https://power.larc.nasa.gov/docs/tutorials/parameters/
- NASA POWER hydrology data-source notes (soil wetness and evaporation variables): https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/

## Region points

The coordinates in `scripts/regions.json` are **illustrative, provisional points**, not verified farm locations. Punjab uses a Ludhiana-area point; Iowa an Ames-area point; Karnataka a Raichur-area point; and the ambiguous “Sahel/Kenya” slot is represented provisionally by a Turkana-area point in Kenya. The Phase 0 completion report explicitly requires team approval before these are described as representative farm locations. Replace/approve the points with the team before final submission.

## Supporting data decisions

- NASA GIBS is a visualization layer, not a source for the weekly weather values. See https://nasa-gibs.github.io/gibs-api-docs/ and use the selected product's WMTS capabilities for exact layer/time settings.
- SoilGrids property requests timed out in Phase 0. Do not depend on SoilGrids at runtime; use clearly labelled provisional soil values if needed.
- Open Topo Data/SRTM is precomputed supporting context, not a live dependency. See https://www.opentopodata.org/.
- POWER reanalysis values are gridded estimates, not measurements from Amma's farm. They support historical context and a transparent decision aid; they do not produce guaranteed yields or farm-specific recommendations.
