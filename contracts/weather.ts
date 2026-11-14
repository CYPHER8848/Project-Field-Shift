/**
 * Frozen Phase 0 contract — weekly regional weather.
 * Source: Field Shift Master Plan, Hour 0–1 contract.
 * Missing observations must be null; do not fabricate or silently interpolate.
 */
export interface WeeklyWeatherRecord {
  year: number;
  week: number;
  tmax: number | null;
  tmin: number | null;
  rain: number | null;
  soilWet: number | null;
  evap: number | null;
  solar: number | null;
}

/** One file per region: weather_{region}.json */
export type RegionalWeather = WeeklyWeatherRecord[];

/**
 * Canonical units:
 * tmax/tmin = °C; rain = mm/week; soilWet = NASA POWER wetness fraction;
 * evap = mm/day-equivalent weekly mean (POWER EVLAND source units retained in prep metadata);
 * solar = MJ/m²/day-equivalent weekly mean.
 */
export const WEATHER_UNITS = {
  tmax: "°C",
  tmin: "°C",
  rain: "mm/week",
  soilWet: "fraction",
  evap: "mm/day",
  solar: "MJ/m²/day"
} as const;
