# Workstream A handoff

## Implemented on `workstream-a/data-pipeline`

- `scripts/regions.json`: four provisional point locations and 1981–2025 date range.
- `scripts/fetch_power.py`: NASA POWER daily point fetch, retry handling, missing-value preservation, ISO-week aggregation, and static JSON generation.
- `src/lib/data/crops.json`: 12 crop trait records using the frozen `CropTraits` contract.
- `docs/data-sources.md`: parameter mapping, units, aggregation rules, provenance, limitations and source decisions.
- `docs/gibs-layer-handoff.md`: candidate GIBS layers and WMTS handoff for frontend/visual work.
- `scripts/validate_data.py`: checks generated files against the frozen weather contract and the crop trait contract.

## Run

```bash
python scripts/fetch_power.py
python scripts/validate_data.py
```

The fetcher uses only Python's standard library. It writes `src/lib/data/weather_{region}.json`. It does not run at application runtime.

## Important gate status

The scripts and 12-crop catalogue are committed to this branch. The four **real, precomputed** NASA POWER JSON files are not included yet: this execution environment could not reach NASA POWER (DNS/network unavailable). Do not mark the Phase 1 data gate complete until the fetch script has run successfully from a network-enabled machine and `scripts/validate_data.py` passes with all four files present.

Region points remain provisional and need team approval. In particular, the “Sahel/Kenya” slot is represented as a Turkana-area Kenya point pending team confirmation. Crop rooting-depth and cover values are model-input estimates; the notes/sources flag proxies and values requiring agronomic review. This is not a field-specific recommendation dataset.
