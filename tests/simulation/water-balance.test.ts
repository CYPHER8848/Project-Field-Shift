import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { discretizeWeeklyWeather } from '../../src/lib/simulation/weather-discretizer.js';
import { stepDailyWaterBalance } from '../../src/lib/simulation/water-balance.js';
import { DEFAULT_SIMULATION_CONFIG, type SoilState, type DailyWeatherStep } from '../../src/lib/simulation/types.js';
import type { WeeklyWeatherRecord } from '../../contracts/weather.js';
import type { CropTraits } from '../../contracts/crops.js';

describe('Water Balance & Weather Discretization', () => {
  const mockCrop: CropTraits = {
    id: 'wheat',
    name: 'Wheat',
    waterUse: 450,
    nitrogenFixation: false,
    rootingDepth: 100, // 100 cm = 1000 mm
    coverValue: 0.60,
    season: ['rabi'],
    waterUseUnit: 'mm_per_growing_season',
    rootingDepthUnit: 'cm',
    coverValueScale: '0_to_1',
    sources: ['FAO-56'],
  };

  it('converts weekly weather record into exactly seven daily steps', () => {
    const weeklyRecords: WeeklyWeatherRecord[] = [
      { year: 2025, week: 25, tmax: 35.0, tmin: 22.0, rain: 28.0, soilWet: 0.25, evap: 4.0, solar: 20.0 },
    ];
    const limitations: string[] = [];
    const dailySteps = discretizeWeeklyWeather(weeklyRecords, limitations);

    assert.equal(dailySteps.length, 7);
    for (const step of dailySteps) {
      assert.equal(step.year, 2025);
      assert.equal(step.week, 25);
      assert.equal(step.rain, 4.0); // 28 mm / 7 days = 4.0 mm/day
      assert.equal(step.isDistributedWeeklyRain, true);
      assert.equal(step.evap, 4.0);
    }
    assert.ok(limitations.some((l) => l.includes('weekly aggregates')));
  });

  it('preserves null missing observations without fabricating data', () => {
    const recordsWithGaps: WeeklyWeatherRecord[] = [
      { year: 2025, week: 26, tmax: null, tmin: null, rain: null, soilWet: null, evap: null, solar: null },
    ];
    const limitations: string[] = [];
    const dailySteps = discretizeWeeklyWeather(recordsWithGaps, limitations);

    assert.equal(dailySteps.length, 7);
    for (const step of dailySteps) {
      assert.equal(step.rain, null);
      assert.equal(step.evap, null);
      assert.equal(step.tmax, null);
      assert.equal(step.isDistributedWeeklyRain, false);
    }
    assert.ok(limitations.some((l) => l.includes('Precipitation data missing')));
    assert.ok(limitations.some((l) => l.includes('Evaporation data missing')));
  });

  it('updates soil moisture under normal rainfall and evapotranspiration', () => {
    const initialSoil: SoilState = {
      soilMoisture: 0.25,
      organicMatter: 1.8,
      nitrogen: 40,
      erosionRisk: 0.2,
      cumulativeWaterUse: 0,
      relativeIncome: 100,
    };
    const weather: DailyWeatherStep = {
      year: 2025,
      week: 25,
      dayOfWeek: 1,
      dayOfYear: 169,
      tmax: 32,
      tmin: 20,
      rain: 5.0, // 5 mm rain
      isDistributedWeeklyRain: true,
      soilWet: 0.25,
      evap: 4.0, // 4 mm evap
      solar: 22,
    };

    const result = stepDailyWaterBalance(initialSoil, weather, mockCrop, DEFAULT_SIMULATION_CONFIG);

    assert.ok(result.newSoilMoisture > 0);
    assert.ok(result.evapotranspirationMm > 0);
    assert.ok(result.newSoilMoisture >= DEFAULT_SIMULATION_CONFIG.soil.wiltingPoint);
    assert.ok(result.newSoilMoisture <= DEFAULT_SIMULATION_CONFIG.soil.saturation);
  });

  it('EDGE CASE: extreme drought never causes negative soil moisture or drops below wilting point', () => {
    let soil: SoilState = {
      soilMoisture: 0.13, // Near wilting point (0.12)
      organicMatter: 1.8,
      nitrogen: 40,
      erosionRisk: 0.1,
      cumulativeWaterUse: 0,
      relativeIncome: 100,
    };
    const dryWeather: DailyWeatherStep = {
      year: 2025,
      week: 25,
      dayOfWeek: 1,
      dayOfYear: 169,
      tmax: 45,
      tmin: 30,
      rain: 0.0,
      isDistributedWeeklyRain: true,
      soilWet: 0.05,
      evap: 10.0, // High atmospheric demand
      solar: 28,
    };

    // Simulate 30 consecutive days of extreme drought
    for (let day = 0; day < 30; day++) {
      const res = stepDailyWaterBalance(soil, dryWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);
      soil.soilMoisture = res.newSoilMoisture;
      // Guarantee physically impossible negative values cannot happen
      assert.ok(soil.soilMoisture >= DEFAULT_SIMULATION_CONFIG.soil.wiltingPoint, `Moisture dropped below PWP on day ${day}`);
      assert.ok(soil.soilMoisture >= 0, 'Moisture dropped below zero');
    }
  });

  it('EDGE CASE: extreme deluge caps soil moisture at saturation and generates runoff', () => {
    const soil: SoilState = {
      soilMoisture: 0.30, // At field capacity
      organicMatter: 1.8,
      nitrogen: 40,
      erosionRisk: 0.2,
      cumulativeWaterUse: 0,
      relativeIncome: 100,
    };
    const floodWeather: DailyWeatherStep = {
      year: 2025,
      week: 30,
      dayOfWeek: 1,
      dayOfYear: 204,
      tmax: 28,
      tmin: 22,
      rain: 250.0, // 250 mm massive deluge
      isDistributedWeeklyRain: true,
      soilWet: 0.95,
      evap: 1.0,
      solar: 10,
    };

    const res = stepDailyWaterBalance(soil, floodWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);

    // Moisture cannot exceed physical porosity / saturation
    assert.ok(res.newSoilMoisture <= DEFAULT_SIMULATION_CONFIG.soil.saturation);
    // Deluge must generate substantial surface runoff
    assert.ok(res.runoffMm > 50, `Expected high runoff, got ${res.runoffMm}`);
    // Deep drainage should be triggered
    assert.ok(res.drainageMm > 0, `Expected drainage, got ${res.drainageMm}`);
  });
});
