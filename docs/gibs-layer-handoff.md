# NASA GIBS layer handoff (Workstream A → C/D)

GIBS is an imagery/visualization layer only. Do not use image tiles as numeric weather observations or as a substitute for the POWER weekly series.

## WMTS endpoint and request pattern

- EPSG:3857 endpoint: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi`
- EPSG:4326 endpoint: `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi`
- Capabilities: append `?SERVICE=WMTS&REQUEST=GetCapabilities` to the endpoint.
- GIBS REST tile pattern (EPSG:4326): `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{Layer}/{Style}/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.{Format}`

GIBS supports WMTS time dimensions. Select a date that exists in the layer's capabilities/time domain; do not assume every layer has a tile for every day. For web maps, use the EPSG:3857 endpoint with the matching matrix set and layer-specific format.

## Candidate layers for the demo

| Purpose | Layer identifier | Tile format / nominal resolution | Notes |
|---|---|---|---|
| Basemap / visual context | `MODIS_Terra_CorrectedReflectance_TrueColor` | JPEG / 250m | Daily true-colour reference layer. |
| Vegetation condition | `MODIS_Terra_NDVI_8Day` | PNG / 250m | 8-day NDVI; layer availability is product/date dependent. |
| Heat context | `MODIS_Terra_Land_Surface_Temp_Day` | PNG / 1km | Daytime land-surface temperature, not 2m air temperature. |
| Soil moisture imagery | Confirm exact current layer via GetCapabilities / GIBS product catalog | Product-specific | Do not wire an unverified layer name; Phase 0 notes SMAP imagery as a desired visual layer. |

The NDVI and LST identifiers above are documented in NASA GIBS visualization materials. Before implementation, C/D should verify each candidate's exact style, format, matrix set, and time domain from current GetCapabilities. GIBS layer catalog: https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/

## Attribution and interpretation

Display “NASA GIBS imagery” and the layer/date in the map UI. NDVI is a vegetation greenness index, LST is land-surface temperature, and SMAP soil-moisture imagery is a remotely sensed/retrieved product. These are not direct measurements at the selected illustrative farm point. Keep visual layers clearly separate from NASA POWER weather fields.

References:
- GIBS access basics and WMTS URL/time dimensions: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- GIBS layer naming convention: https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/
- GIBS product catalog: https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/
