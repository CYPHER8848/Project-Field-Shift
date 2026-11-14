# Field Shift — Four Seasons of Amma's Field

A story-driven farm adaptation simulation for NASA Space Apps Challenge 2026.

## Phase 0 starter

- Concept: Four Seasons of Amma's Field
- Demonstration regions: Punjab (India), Iowa (USA), Karnataka (India), and a representative Sahel/Kenya site (to be confirmed)
- Frontend: Svelte 5 + Vite + TypeScript
- Farm scene: inline SVG and CSS
- Simulation: TypeScript, with a Web Worker planned for a later phase
- Hosting target: GitHub Pages
- Weather backbone: NASA POWER daily point API
- Satellite visualization: NASA GIBS WMTS
- Soil: SoilGrids REST is currently unavailable/paused; use clearly labelled provisional regional values until access is restored
- Elevation: Open Topo Data SRTM API; precompute values rather than depend on runtime calls

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
npm run check
npm run build
```

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` is intended to deploy the Vite `dist/` directory to GitHub Pages. In repository Settings → Pages, set the deployment source to **GitHub Actions**.

## Data integrity

Files under `src/lib/mock/` contain synthetic placeholders only. They are not NASA observations, measured soil properties, crop-yield forecasts, or agronomic recommendations. Replace them with cited, precomputed source data during the data-integration phases.

See `docs/` and `contracts/` for the Phase 0 planning material and data contracts.
