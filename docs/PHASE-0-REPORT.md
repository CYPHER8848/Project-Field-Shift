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

## Data-source verification

Committed verification artifacts are included in this PR: [the verification report](./DATA-SOURCE-VERIFICATION.md), [the test script](../scripts/verify_data_sources.py), and [machine-readable evidence](./evidence/verification_results.json). GitHub Actions passed the offline evidence/schema check. That check validates the committed evidence file; it does not repeat the live external requests.

- NASA POWER Daily Point API: **WORKS (evidence recorded)**. Sample request returned HTTP 200 for all eight requested parameters at the illustrative Punjab point for 1–7 January 2025.
- NASA GIBS WMTS: **WORKS (reported)**. Capabilities XML and sample NDVI/LST/SMAP tile requests reportedly returned HTTP 200.
- ISRIC SoilGrids REST: **USE FALLBACK**. Evidence records HTTP 200 for the root page; the property query timed out after 15 seconds.
- Open Topo Data SRTM 30m: **WORKS (reported)**. Sample query reportedly returned HTTP 200 and 247 m elevation at the illustrative Punjab point.

Four provisional regional points have evidence recorded for POWER, SRTM and GIBS. They are not verified farm locations and still require team approval. See the verification report for the points, request evidence, and interpretation cautions.

## Still open before the Phase 0 gate
- Run the live verification suite from a network-enabled environment if the team requires fresh endpoint results; the current passing CI check is offline and validates the committed evidence structure.
- Finalise the four exact demo coordinates, especially the Sahel/Kenya representative site.
- **Contracts frozen with whole-team agreement.** Weather uses weekly `{year, week, tmax, tmin, rain, soilWet, evap, solar}` records; crop traits include water use, nitrogen fixation, rooting depth, cover value and season; simulation output uses `{strategy, years[], meters{}, p10/p50/p90}`. Synthetic mock files have been reshaped to these interfaces.
- Phase 1 data lead still needs to populate the crop catalogue (about 12 cited crops) and replace synthetic weather values with fetched weekly regional data.
- Owner to configure branch protection/rules for `main`.
- Create the shared team task board and add members.
- Confirm the deployed URL opens in a normal browser session.

## Acceptance boundary
The UI is a navigation and storytelling skeleton. It does not yet query NASA services, run the agronomic simulation, or provide farm-specific recommendations. Mock values are synthetic and must remain labelled as such.

## Tracking
See [Phase 0 closure checklist](../issues/1) in the repository.
