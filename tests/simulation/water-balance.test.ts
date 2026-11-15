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

  it('converts weekly weather record into exactly seven daily steps and quantifies coverage', () => {
    const weeklyRecords: WeeklyWeatherRecord[] = [
      { year: 2025, week: 25, tmax: 35.0, tmin: 22.0, rain: 28.0, soilWet: 0.25, evap: 4.0, solar: 20.0 },
    ];
    const limitations: string[] = [];
    const { dailySteps, coverage } = discretizeWeeklyWeather(weeklyRecords, limitations);

    assert.equal(dailySteps.length, 7);
    assert.equal(coverage.totalDays, 7);
    assert.equal(coverage.validRainfallDays, 7);
    assert.equal(coverage.missingRainfallDays, 0);
    assert.equal(coverage.rainfallCoveragePercent, 100);
    assert.equal(coverage.validEvaporationDays, 7);
    assert.equal(coverage.missingEvaporationDays, 0);
    assert.equal(coverage.evaporationCoveragePercent, 100);

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
    const { dailySteps, coverage } = discretizeWeeklyWeather(recordsWithGaps, limitations);

    assert.equal(dailySteps.length, 7);
    assert.equal(coverage.missingRainfallDays, 7);
    assert.equal(coverage.missingEvaporationDays, 7);
    assert.equal(coverage.rainfallCoveragePercent, 0);
    assert.equal(coverage.evaporationCoveragePercent, 0);

    for (const step of dailySteps) {
      assert.equal(step.rain, null);
      assert.equal(step.evap, null);
      assert.equal(step.tmax, null);
      assert.equal(step.isDistributedWeeklyRain, false);
    }
    assert.ok(limitations.some((l) => l.includes('Precipitation observations missing')));
    assert.ok(limitations.some((l) => l.includes('Atmospheric evaporation observations missing')));
  });

  it('handles missing rainfall only: soil is stepped without rainfall recharge and flagged as gap', () => {
    const initialSoil: SoilState = {
      soilMoisture: 0.28,
      organicMatter: 1.8,
      nitrogen: 40,
      erosionRisk: 0.2,
      cumulativeWaterUse: 0,
      relativeIncome: 100,
    };
    const missingRainWeather: DailyWeatherStep = {
      year: 2025,
      week: 25,
      dayOfWeek: 1,
      dayOfYear: 169,
      tmax: 32,
      tmin: 20,
      rain: null, // MISSING
      isDistributedWeeklyRain: false,
      soilWet: null,
      evap: 4.0, // Valid
      solar: 22,
    };

    const result = stepDailyWaterBalance(initialSoil, missingRainWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);

    assert.equal(result.isRainMissing, true);
    assert.equal(result.isEvapMissing, false);
    // Transpiration occurred based on valid evap
    assert.ok(result.evapotranspirationMm > 0);
    // Moisture declined because no rain recharged the profile
    assert.ok(result.newSoilMoisture < initialSoil.soilMoisture);
  });

  it('handles missing evaporation only: crop ET is held at zero for mass conservation and flagged as gap', () => {
    const initialSoil: SoilState = {
      soilMoisture: 0.25,
      organicMatter: 1.8,
      nitrogen: 40,
      erosionRisk: 0.2,
      cumulativeWaterUse: 0,
      relativeIncome: 100,
    };
    const missingEvapWeather: DailyWeatherStep = {
      year: 2025,
      week: 25,
      dayOfWeek: 1,
      dayOfYear: 169,
      tmax: 32,
      tmin: 20,
      rain: 5.0, // Valid
      isDistributedWeeklyRain: true,
      soilWet: null,
      evap: null, // MISSING
      solar: 22,
    };

    const result = stepDailyWaterBalance(initialSoil, missingEvapWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);

    assert.equal(result.isRainMissing, false);
    assert.equal(result.isEvapMissing, true);
    // ET is held at 0 to avoid fabricating demand
    assert.equal(result.evapotranspirationMm, 0);
    // Moisture increased due to valid rain
    assert.ok(result.newSoilMoisture > initialSoil.soilMoisture);
  });

  it('handles both rainfall and evaporation missing: no crash, mass conserved, both flagged', () => {
    const initialSoil: SoilState = {
      soilMoisture: 0.25,
      organicMatter: 1.8,
      nitrogen: 40,
      erosionRisk: 0.2,
      cumulativeWaterUse: 0,
      relativeIncome: 100,
    };
    const bothMissingWeather: DailyWeatherStep = {
      year: 2025,
      week: 25,
      dayOfWeek: 1,
      dayOfYear: 169,
      tmax: null,
      tmin: null,
      rain: null,
      isDistributedWeeklyRain: false,
      soilWet: null,
      evap: null,
      solar: null,
    };

    const result = stepDailyWaterBalance(initialSoil, bothMissingWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);

    assert.equal(result.isRainMissing, true);
    assert.equal(result.isEvapMissing, true);
    assert.equal(result.evapotranspirationMm, 0);
    assert.equal(result.runoffMm, 0);
    // Soil moisture is held stable
    assert.equal(result.newSoilMoisture, initialSoil.soilMoisture);
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
      rain: 5.0,
      isDistributedWeeklyRain: true,
      soilWet: 0.25,
      evap: 4.0,
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
      soilMoisture: 0.13,
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
      evap: 10.0,
      solar: 28,
    };

    for (let day = 0; day < 30; day++) {
      const res = stepDailyWaterBalance(soil, dryWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);
      soil.soilMoisture = res.newSoilMoisture;
      assert.ok(soil.soilMoisture >= DEFAULT_SIMULATION_CONFIG.soil.wiltingPoint);
      assert.ok(soil.soilMoisture >= 0);
    }
  });

  it('EDGE CASE: extreme deluge caps soil moisture at saturation and generates runoff', () => {
    const soil: SoilState = {
      soilMoisture: 0.30,
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
      rain: 250.0,
      isDistributedWeeklyRain: true,
      soilWet: 0.95,
      evap: 1.0,
      solar: 10,
    };

    const res = stepDailyWaterBalance(soil, floodWeather, mockCrop, DEFAULT_SIMULATION_CONFIG);

    assert.ok(res.newSoilMoisture <= DEFAULT_SIMULATION_CONFIG.soil.saturation);
    assert.ok(res.runoffMm > 50);
    assert.ok(res.drainageMm > 0);
  });
});
