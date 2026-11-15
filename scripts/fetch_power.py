#!/usr/bin/env python3
"""Precompute Field Shift weekly weather JSON from NASA POWER daily point data.

Run from repository root:
  python -m pip install -r scripts/requirements.txt
  python scripts/fetch_power.py

No runtime app calls are made. Missing POWER fill values become null; weeks are
retained and no interpolation or synthetic observations are introduced.
"""
from __future__ import annotations

import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGIONS_FILE = ROOT / "scripts" / "regions.json"
OUT_DIR = ROOT / "src" / "lib" / "data"
BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
PARAMETERS = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "GWETTOP", "EVLAND", "ALLSKY_SFC_SW_DWN"]
FILL_VALUES = {-999, -999.0, -999.9}
MAX_RETRIES = 4
TIMEOUT_SECONDS = 90
# Latent heat of vaporisation near typical field temperatures, MJ kg-1.
LATENT_HEAT_MJ_PER_KG = 2.45


def chunks(start: date, end: date, days: int = 365):
    cursor = start
    while cursor <= end:
        stop = min(cursor + timedelta(days=days - 1), end)
        yield cursor, stop
        cursor = stop + timedelta(days=1)


def fetch_chunk(latitude: float, longitude: float, start: date, end: date) -> dict:
    query = urllib.parse.urlencode({
        "parameters": ",".join(PARAMETERS),
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start.strftime("%Y%m%d"),
        "end": end.strftime("%Y%m%d"),
        "format": "JSON",
    })
    url = f"{BASE_URL}?{query}"
    request = urllib.request.Request(url, headers={"User-Agent": "FieldShift-data-prep/1.0"})
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                payload = json.loads(response.read().decode("utf-8"))
            if "properties" not in payload or "parameter" not in payload["properties"]:
                raise ValueError(f"Unexpected NASA POWER response: {payload.get('messages', payload)}")
            return payload
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            if attempt + 1 < MAX_RETRIES:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"NASA POWER request failed for {start}..{end}: {last_error}")


def number(value):
    if value is None:
        return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(result) or result in FILL_VALUES:
        return None
    return result


def aggregate_daily(payload: dict, daily: dict):
    params = payload["properties"]["parameter"]
    for key in params["T2M_MAX"]:
        dt = datetime.strptime(key, "%Y%m%d").date()
        iso_year, iso_week, _ = dt.isocalendar()
        bucket = daily[(iso_year, iso_week)]
        for source, target in [
            ("T2M_MAX", "tmax"), ("T2M_MIN", "tmin"),
            ("PRECTOTCORR", "rain"), ("GWETTOP", "soilWet"),
            ("EVLAND", "evap"), ("ALLSKY_SFC_SW_DWN", "solar"),
        ]:
            val = number(params.get(source, {}).get(key))
            if val is not None:
                bucket[target].append(val)


def mean(values):
    return sum(values) / len(values) if values else None


def main():
    config = json.loads(REGIONS_FILE.read_text())
    start = date.fromisoformat(config["dateRange"]["start"])
    end = date.fromisoformat(config["dateRange"]["end"])
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for region in config["regions"]:
        daily = defaultdict(lambda: defaultdict(list))
        for chunk_start, chunk_end in chunks(start, end):
            print(f"{region['id']}: fetching {chunk_start} to {chunk_end}", flush=True)
            payload = fetch_chunk(region["latitude"], region["longitude"], chunk_start, chunk_end)
            aggregate_daily(payload, daily)

        records = []
        for (year, week), values in sorted(daily.items()):
            # Contract units: weekly precipitation sum; daily-mean wetness/ET/solar;
            # extrema across the days available in the ISO week.
            evap_raw = mean(values["evap"])
            evap_unit = payload.get("parameters", {}).get("EVLAND", {}).get("units", "")
            # POWER EVLAND daily hydrology values are energy flux (MJ/m²/day).
            # Convert latent-energy equivalent to mm/day; if metadata differs, fail
            # rather than silently publish a wrong unit.
            if evap_raw is not None:
                if "MJ" in str(evap_unit):
                    evap_value = evap_raw / LATENT_HEAT_MJ_PER_KG
                else:
                    raise ValueError(f"Unexpected EVLAND unit {evap_unit!r}; review conversion before publishing.")
            else:
                evap_value = None
            records.append({
                "year": year, "week": week,
                "tmax": max(values["tmax"]) if values["tmax"] else None,
                "tmin": min(values["tmin"]) if values["tmin"] else None,
                "rain": sum(values["rain"]) if values["rain"] else None,
                "soilWet": mean(values["soilWet"]),
                "evap": evap_value,
                "solar": mean(values["solar"]),
            })

        output = OUT_DIR / f"weather_{region['id']}.json"
        output.write_text(json.dumps(records, separators=(",", ":"), allow_nan=False) + "\n")
        print(f"Wrote {output.relative_to(ROOT)} ({len(records)} weeks, {output.stat().st_size:,} bytes)")
        if output.stat().st_size >= 100_000:
            print(f"WARNING: {output.name} exceeds the 100 KB target; minified output retained.")


if __name__ == "__main__":
    main()
