#!/usr/bin/env python3
"""Validate Workstream A static data against the frozen Phase 0 contracts."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGIONS = json.loads((ROOT / "scripts/regions.json").read_text())["regions"]
WEATHER_KEYS = {"year", "week", "tmax", "tmin", "rain", "soilWet", "evap", "solar"}
CROP_KEYS = {"id", "name", "waterUse", "nitrogenFixation", "rootingDepth", "coverValue", "season", "waterUseUnit", "rootingDepthUnit", "coverValueScale", "sources"}
errors = []

crops = json.loads((ROOT / "src/lib/data/crops.json").read_text())
if len(crops) < 8:
    errors.append(f"crop catalogue has {len(crops)} entries; at least 8 required")
for crop in crops:
    missing = CROP_KEYS - crop.keys()
    if missing:
        errors.append(f"crop {crop.get('id')}: missing {sorted(missing)}")
    if crop.get("waterUseUnit") != "mm_per_growing_season":
        errors.append(f"crop {crop.get('id')}: invalid waterUseUnit")
    if not crop.get("sources"):
        errors.append(f"crop {crop.get('id')}: missing sources")

for region in REGIONS:
    path = ROOT / "src/lib/data" / f"weather_{region['id']}.json"
    if not path.exists():
        errors.append(f"missing generated weather file: {path.relative_to(ROOT)} (run scripts/fetch_power.py)")
        continue
    raw = path.read_bytes()
    if len(raw) >= 100_000:
        errors.append(f"{path.name} is {len(raw)} bytes; target is under 100 KB")
    records = json.loads(raw)
    previous = None
    for index, row in enumerate(records):
        if set(row) != WEATHER_KEYS:
            errors.append(f"{path.name}[{index}]: weather fields differ from frozen contract")
            break
        if not 1 <= row["week"] <= 53:
            errors.append(f"{path.name}[{index}]: week out of range")
            break
        key = (row["year"], row["week"])
        if previous is not None and key <= previous:
            errors.append(f"{path.name}[{index}]: records are not strictly ordered")
            break
        previous = key
        for field in WEATHER_KEYS - {"year", "week"}:
            value = row[field]
            if value is not None and not isinstance(value, (int, float)):
                errors.append(f"{path.name}[{index}].{field}: expected number or null")
                break

if errors:
    print("DATA VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)
print(f"Validated {len(crops)} crop traits and {len(REGIONS)} regional weather files.")
