# Data-source verification notes

This is an integration planning record, not a claim that every endpoint has passed a live request test.

| Source | Intended use | Status / caution |
|---|---|---|
| NASA POWER daily point API | Daily weather and selected surface variables | Documentation located; live requests still required for chosen locations and parameter sets. |
| NASA GIBS WMTS | Satellite imagery layers | Verify layer identifiers, projection and time dimensions before implementation. |
| ISRIC SoilGrids | Soil property context | REST service has carried an availability/pause notice. Do not make it a hard dependency. |
| Open Topo Data SRTM | Elevation context | Precompute small sets of locations and respect service limits. |

## Endpoints
- POWER: https://power.larc.nasa.gov/api/temporal/daily/point
- GIBS capabilities: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml
- SoilGrids: https://rest.isric.org/
- Open Topo Data example: https://api.opentopodata.org/v1/srtm30m?locations=30.90,75.85

## Interpretation cautions
- POWER GWETROOT and GWETTOP are wetness fractions, not volumetric soil moisture.
- EVLAND is land evaporation; do not relabel it as crop evapotranspiration.
- Preserve missing values as null. Do not silently interpolate or fabricate observations.
- The Punjab coordinate above is illustrative, not a verified farm location.

## Official documentation
- https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/
- https://nasa-gibs.github.io/gibs-api-docs/
- https://isric.org/explore/soilgrids/
- https://www.opentopodata.org/api/
- https://www.opentopodata.org/datasets/srtm/