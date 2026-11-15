import type { WeeklyWeatherRecord } from '../../../contracts/weather.js';
import type { DailyWeatherStep, ObservationCoverage } from './types.js';

export interface WeatherDiscretizationResult {
  dailySteps: DailyWeatherStep[];
  coverage: ObservationCoverage;
}

/**
 * Discretization Assumptions & Missing Data Policy:
 * 1. Weekly rainfall is distributed evenly across 7 days (rain / 7) as a uniform allocation proxy.
 *    This is a weekly average allocation, NOT an observed daily storm; steps are tagged with `isDistributedWeeklyRain: true`.
 * 2. Missing observations (null) remain strictly null in daily records. They are NEVER silently interpolated or replaced with 0.
 * 3. Quantified data coverage is calculated for both rainfall and evaporation.
 * 4. Transparent Missing Data Water Balance Policy:
 *    - Missing rainfall (null): Precipitation cannot be observed. Soil moisture is stepped without rainfall recharge (inflow = 0).
 *      This is recorded as an unobserved precipitation gap, NOT verified dry weather.
 *    - Missing evaporation (null): Atmospheric demand cannot be observed from NASA products. Crop evapotranspiration is held at 0
 *      for physical mass conservation, and flagged as an unobserved atmospheric demand gap, NOT zero demand.
 * 5. Weekly evaporation (evap) from NASA POWER is in mm/day weekly mean equivalent, applied directly as daily ET0 when valid.
 */
export function discretizeWeeklyWeather(
  records: WeeklyWeatherRecord[],
  limitations: string[]
): WeatherDiscretizationResult {
  const dailySteps: DailyWeatherStep[] = [];
  let nullRainWeeks = 0;
  let nullEvapWeeks = 0;

  for (const record of records) {
    if (record.rain === null) {
      nullRainWeeks++;
    }
    if (record.evap === null) {
      nullEvapWeeks++;
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

  const totalWeeks = records.length;
  const totalDays = dailySteps.length;
  const missingRainfallDays = nullRainWeeks * 7;
  const validRainfallDays = totalDays - missingRainfallDays;
  const rainfallCoveragePercent = totalDays > 0 ? Number(((validRainfallDays / totalDays) * 100).toFixed(1)) : 0;

  const missingEvaporationDays = nullEvapWeeks * 7;
  const validEvaporationDays = totalDays - missingEvaporationDays;
  const evaporationCoveragePercent = totalDays > 0 ? Number(((validEvaporationDays / totalDays) * 100).toFixed(1)) : 0;

  const coverage: ObservationCoverage = {
    totalWeeks,
    totalDays,
    validRainfallDays,
    missingRainfallDays,
    rainfallCoveragePercent,
    validEvaporationDays,
    missingEvaporationDays,
    evaporationCoveragePercent,
    isRainfallComplete: missingRainfallDays === 0,
    isEvaporationComplete: missingEvaporationDays === 0,
  };

  // Quantified coverage limitation
  if (totalDays > 0) {
    limitations.push(
      `Observation coverage: Rainfall available for ${rainfallCoveragePercent}% of days (${validRainfallDays}/${totalDays}); ` +
      `Evaporation available for ${evaporationCoveragePercent}% of days (${validEvaporationDays}/${totalDays}).`
    );
  }

  // Missing data policy disclosures
  if (missingRainfallDays > 0) {
    limitations.push(
      `Precipitation observations missing for ${missingRainfallDays} day(s) (${nullRainWeeks} week(s)). ` +
      `Water balance policy: Soil moisture is stepped without rainfall recharge (inflow = 0). ` +
      `This is handled as an unobserved precipitation gap, NOT verified dry weather.`
    );
  }
  if (missingEvaporationDays > 0) {
    limitations.push(
      `Atmospheric evaporation observations missing for ${missingEvaporationDays} day(s) (${nullEvapWeeks} week(s)). ` +
      `Water balance policy: Evapotranspiration is held at 0 for mass-balance safety. ` +
      `This is handled as an unobserved demand gap, NOT verified zero atmospheric demand; soil moisture drawdown may be underestimated.`
    );
  }
  if (validRainfallDays > 0) {
    limitations.push(
      'Daily precipitation was converted from weekly aggregates (rain / 7). Peak daily runoff may be underestimated relative to single-day extreme rainfall events.'
    );
  }

  return { dailySteps, coverage };
}
