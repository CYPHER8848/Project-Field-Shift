import type { WeeklyWeatherRecord } from '../../../contracts/weather.js';
import type { DailyWeatherStep } from './types.js';

/**
 * Discretization Assumptions:
 * 1. Weekly rainfall is distributed evenly across 7 days (rain / 7) as a uniform allocation proxy.
 *    This is NOT an observed daily storm pattern; every generated step is tagged with `isDistributedWeeklyRain: true`.
 * 2. Missing observations (null) remain strictly null. They are NEVER silently interpolated or replaced with 0.
 * 3. Weekly evaporation (evap) from NASA POWER is in mm/day weekly mean equivalent, so it is applied
 *    directly as the daily reference evapotranspiration (ET0) for each day of that week.
 * 4. Temperature (tmax, tmin) and solar radiation are held constant across the 7 days of the week.
 */
export function discretizeWeeklyWeather(
  records: WeeklyWeatherRecord[],
  limitations: string[]
): DailyWeatherStep[] {
  const dailySteps: DailyWeatherStep[] = [];
  let nullRainCount = 0;
  let nullEvapCount = 0;

  for (const record of records) {
    if (record.rain === null) {
      nullRainCount++;
    }
    if (record.evap === null) {
      nullEvapCount++;
    }

    const dailyRain = record.rain === null ? null : Math.max(0, record.rain / 7);
    const isDistributedWeeklyRain = record.rain !== null;

    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      const dayOfYear = (record.week - 1) * 7 + dayOfWeek;
      dailySteps.push({
        year: record.year,
        week: record.week,
        dayOfWeek,
        dayOfYear,
        tmax: record.tmax,
        tmin: record.tmin,
        rain: dailyRain,
        isDistributedWeeklyRain,
        soilWet: record.soilWet,
        evap: record.evap, // mm/day equivalent
        solar: record.solar,
      });
    }
  }

  if (nullRainCount > 0) {
    limitations.push(
      `Precipitation data missing for ${nullRainCount} week(s). Missing observations were preserved as null and not interpolated; soil moisture on those days reflects zero rain input.`
    );
  }
  if (nullEvapCount > 0) {
    limitations.push(
      `Evaporation data missing for ${nullEvapCount} week(s). Evapotranspiration on those days defaulted to a zero-transpiration proxy to avoid fabricated atmospheric demand.`
    );
  }
  if (records.length > 0) {
    limitations.push(
      'Daily precipitation was converted from weekly aggregates (rain / 7). Peak daily runoff may be underestimated relative to single-day extreme rainfall events.'
    );
  }

  return dailySteps;
}
