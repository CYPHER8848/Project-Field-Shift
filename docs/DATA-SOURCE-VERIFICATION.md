# Data-source verification notes

Status reviewed: 14 November 2026. This records what official documentation and service notices establish. It does not claim that all four live sample requests have passed.

| Source | Phase 0 status | Decision |
|---|---|---|
| NASA POWER daily point API | **Documented / suitable; exact sample request still needs an external HTTP test.** The official Daily API supports point time series, UTC/LST selection and daily data from 1981 to near-real-time. The request supports the planned AG community and daily parameters, but validate the full parameter combination at each final demo coordinate. | **Use POWER** as the weather backbone. Precompute the selected locations and aggregate daily data to the weekly contract. |
| NASA GIBS WMTS | **Documented / suitable; exact layer IDs and tile requests still need validation.** Official docs describe WMTS layers, human-readable layer identifiers and time dimensions. The capabilities XML could not be parsed by the browser-based inspection tool because it returned XML; that is not evidence the service is down. | **Use GIBS** for the visual satellite layer after confirming exact MODIS NDVI/LST/SMAP layer identifiers, projection and available dates. |
| ISRIC SoilGrids REST | **Gated / paused by provider.** ISRIC's current notice says the REST API is temporarily paused and gives no restoration estimate. | **Do not depend on the REST API.** Use clearly labelled regional fallback values or omit soil properties. Do not present fallback values as measured farm data. |
| Open Topo Data SRTM | **Documented / suitable; exact sample request still needs an external HTTP test.** Official docs show a public API and an SRTM 30m endpoint with example JSON responses. | **Use SRTM 30m elevation** for precomputed demonstration points; do not call it repeatedly at runtime. |

## Sample requests to run from a network-enabled machine

NASA POWER (Punjab example coordinate only; not a verified farm):
```text
https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,EVLAND,GWETROOT,GWETTOP,ALLSKY_SFC_SW_DWN&community=AG&longitude=75.85&latitude=30.90&start=20250101&end=20250107&format=JSON&time-standard=UTC
```

GIBS capabilities:
```text
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml
```

SoilGrids:
```text
https://rest.isric.org/rest/soilgrids/v2.0/properties/query?lon=75.85&lat=30.90
```

Open Topo Data SRTM 30m:
```text
https://api.opentopodata.org/v1/srtm30m?locations=30.90,75.85
```

## Interpretation cautions

- POWER `GWETROOT` and `GWETTOP` are wetness fractions, not volumetric soil moisture.
- `EVLAND` is land evaporation; do not relabel it as crop evapotranspiration.
- Preserve missing values as null. Do not silently interpolate or fabricate observations.
- The Punjab coordinate above is illustrative, not a verified farm location.
- A documented endpoint is not the same as a successful live request. Record HTTP status and response validation when the sample requests are run.

## Official references

- NASA POWER Daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- NASA POWER request tutorial: https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/
- NASA GIBS access basics: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA GIBS layer naming: https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/
- ISRIC SoilGrids current status: https://isric.org/explore/soilgrids/
- ISRIC REST entry page: https://rest.isric.org/
- Open Topo Data API: https://www.opentopodata.org/api/
- Open Topo Data SRTM dataset: https://www.opentopodata.org/datasets/srtm/
