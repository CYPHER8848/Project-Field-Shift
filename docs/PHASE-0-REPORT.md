# Phase 0 report

Status reviewed: 14 November 2026.

## Completed and merged to main
- Svelte + Vite + TypeScript scaffold and five-scene navigation skeleton.
- `npm run check` passed in GitHub Actions.
- `npm run build` passed in GitHub Actions.
- GitHub Pages artifact upload and deployment job passed in GitHub Actions.
- Three first-draft TypeScript contract files and synthetic mock datasets.
- Visual style guide with palette, Fraunces and DM Sans, and spacing direction.
- Six story beats and glossary outline.
- README, GitHub Pages workflow and Phase 0 closure issue.

## Data-source decisions
- NASA POWER: selected as the weather backbone; official docs confirm the daily point API. Exact sample requests for final region coordinates still need an external HTTP test.
- NASA GIBS: selected for satellite visualization; official docs confirm WMTS layers and time dimensions. Exact layer IDs, projection and tile requests still need validation.
- ISRIC SoilGrids REST: provider currently reports the REST API paused with no restoration estimate. Use labelled regional fallback values or omit these properties.
- Open Topo Data SRTM: selected for precomputed elevation; official docs provide the public API and SRTM 30m endpoint. Exact sample request still needs an external HTTP test.

## Still open before the Phase 0 gate
- Finalise the four exact demo coordinates, especially the Sahel/Kenya representative site.
- Run and record live POWER and Open Topo Data sample requests; validate GIBS layer IDs and tile retrieval.
- **Contracts frozen with whole-team agreement.** Weather uses weekly `{year, week, tmax, tmin, rain, soilWet, evap, solar}` records; crop traits include water use, nitrogen fixation, rooting depth, cover value and season; simulation output uses `{strategy, years[], meters{}, p10/p50/p90}`. Synthetic mock files have been reshaped to these interfaces.
- Phase 1 data lead still needs to populate the crop catalogue (about 12 cited crops) and replace synthetic weather values with fetched weekly regional data.
- Owner to configure branch protection/rules for `main`.
- Create the shared team task board and add members.
- Confirm the deployed URL opens in a normal browser session.

## Acceptance boundary
The UI is a navigation and storytelling skeleton. It does not yet query NASA services, run the agronomic simulation, or provide farm-specific recommendations. Mock values are synthetic and must remain labelled as such.

## Tracking
See [Phase 0 closure checklist](../issues/1) in the repository.
