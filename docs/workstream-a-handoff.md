# Workstream A handoff

## Implemented on `workstream-a/data-pipeline`

- `scripts/regions.json`: four provisional regional point locations and 1981–2025 date range.
- `scripts/fetch_power.py`: NASA POWER daily point fetch, retry handling, missing-value preservation, ISO-week aggregation, and static JSON generation.
- `src/lib/data/weather_punjab.json`: 2,349 weekly records, 1981-W01 through 2026-W01 (final week partial).
- `src/lib/data/weather_iowa.json`: 2,349 weekly records, 1981-W01 through 2026-W01 (final week partial).
- `src/lib/data/weather_karnataka.json`: 2,349 weekly records, 1981-W01 through 2026-W01 (final week partial).
- `src/lib/data/weather_sahel-kenya.json`: 2,349 weekly records, 1981-W01 through 2026-W01 (final week partial).
- `src/lib/data/crops.json`: 12 crop trait records using the frozen `CropTraits` contract.
- `docs/data-sources.md`: parameter mapping, units, aggregation rules, provenance, limitations and source decisions.
- `docs/gibs-layer-handoff.md`: candidate GIBS layers and WMTS handoff for frontend/visual work.
- `scripts/validate_data.py`: validates generated weather files and crop traits, including the compressed-size target.

## Validation results

- Four regional weather files generated successfully.
- Each file contains 2,349 weekly records from 1981-W01 through 2026-W01 (final week is partial).
- No missing weeks, extra weeks or duplicate weeks.
- 12 crop traits validated.
- All four gzip-compressed weather files are below 100 KB.
- `python3 scripts/validate_data.py` passes.

The 100 KB size target is assessed using gzip-compressed size; raw JSON files are larger than 100 KB.

## Run

```bash
python3 scripts/fetch_power.py
python3 scripts/validate_data.py
```

The fetcher uses Python's standard library. It generates static JSON files and does not run at application runtime.

## Important limitations and handoff notes
## Generated regional datasets

The four precomputed NASA POWER datasets are now present:

- weather_punjab.json
- weather_iowa.json
- weather_karnataka.json
- weather_sahel-kenya.json

Each file contains 2,349 weekly records. The date range is 1981-01-01 through 2025-12-31. The final record is ISO week 2026-W01, containing 29–31 December 2025.

All four files are below 100KB when gzip-compressed. Their uncompressed JSON sizes exceed 100KB.

Validation passed: python3 scripts/validate_data.py.
- Region points remain provisional and need team approval. The Sahel/Kenya slot currently uses a Turkana-area Kenya point.
- Crop rooting-depth and cover values are model-input estimates; they require agronomic review.
- Missing NASA POWER observations are preserved as null where applicable.
- These datasets are regional demonstration inputs, not field-specific recommendations or guaranteed yield forecasts.
- The application should communicate uncertainty and local-expert-review caveats.
- The final ISO week, 2026-W01, contains 29–31 December 2025.