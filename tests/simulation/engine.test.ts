import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runSimulation } from '../../src/lib/simulation/engine.js';
import { UnsupportedRegionError } from '../../src/lib/simulation/regional-calendars.js';
import type { CropCatalog } from '../../contracts/crops.js';
import type { RegionalWeather } from '../../contracts/weather.js';

describe('Simulation Engine Integration & Review Regression Suite', () => {
  const cropsPath = resolve(process.cwd(), 'src/lib/mock/crops.json');
  const weatherPath = resolve(process.cwd(), 'src/lib/mock/weather-punjab.json');

  const mockCrops: CropCatalog = JSON.parse(readFileSync(cropsPath, 'utf8'));
  const mockWeatherPunjab: RegionalWeather = JSON.parse(readFileSync(weatherPath, 'utf8'));

  // Multi-week weather sequence spanning both Kharif (weeks 22-42) and Rabi (weeks 43-52)
  const fullSeasonWeather: RegionalWeather = [];
  for (let w = 22; w <= 52; w++) {
    const isMonsoon = w >= 22 && w <= 38;
    fullSeasonWeather.push({
      year: 2025,
      week: w,
      tmax: isMonsoon ? 34.0 : 22.0,
      tmin: isMonsoon ? 24.0 : 10.0,
      rain: isMonsoon ? 25.0 : 4.0, // Monsoon rains vs dry winter
      soilWet: isMonsoon ? 0.40 : 0.20,
      evap: isMonsoon ? 5.0 : 2.5,
      solar: isMonsoon ? 22.0 : 16.0,
    });
  }

  it('runs all three strategies and satisfies the frozen SimulationOutput contract', () => {
    const strategies = ['existing_rotation', 'resilience_rotation', 'income_rotation'] as const;

    for (const strategy of strategies) {
      const { contractOutput, internalResult } = runSimulation(strategy, mockWeatherPunjab, {
        cropCatalog: mockCrops,
        region: 'punjab',
      });

      assert.equal(contractOutput.strategy, strategy);
      assert.ok(contractOutput.years.length > 0);
      assert.ok(typeof contractOutput.meters.soilMoisture === 'number');
      assert.ok(typeof contractOutput.meters.organicMatter === 'number');
      assert.ok(typeof contractOutput.meters.nitrogen === 'number');
      assert.ok(typeof contractOutput.meters.erosionRisk === 'number');
      assert.ok(typeof contractOutput.meters.income === 'number');
      assert.ok(typeof contractOutput.meters.waterUse === 'number');

      // Percentile bands match PercentileBand interface
      for (const band of [contractOutput.p10, contractOutput.p50, contractOutput.p90]) {
        assert.ok(typeof band.p10 === 'number');
        assert.ok(typeof band.p50 === 'number');
        assert.ok(typeof band.p90 === 'number');
      }

      assert.ok(contractOutput.limitations.length >= 4);
      assert.equal(internalResult.region, 'punjab');
    }
  });

  it('verifies actual crop selected across Kharif and Rabi seasons', () => {
    const baseline = runSimulation('existing_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
      recordHistory: true,
    });
    const resilience = runSimulation('resilience_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
      recordHistory: true,
    });

    const baselineHistory = baseline.internalResult.stepHistory!;
    const resilienceHistory = resilience.internalResult.stepHistory!;

    // Kharif week 25: Both rotations plant Rice
    const kharifStepBase = baselineHistory.find((s) => s.week === 25);
    const kharifStepRes = resilienceHistory.find((s) => s.week === 25);
    assert.equal(kharifStepBase?.cropId, 'rice');
    assert.equal(kharifStepRes?.cropId, 'rice');

    // Rabi week 46: Existing rotation plants Wheat; Resilience rotation plants Chickpea
    const rabiStepBase = baselineHistory.find((s) => s.week === 46);
    const rabiStepRes = resilienceHistory.find((s) => s.week === 46);
    assert.equal(rabiStepBase?.cropId, 'wheat', 'Baseline must select wheat in Rabi');
    assert.equal(rabiStepRes?.cropId, 'chickpea', 'Resilience must select chickpea in Rabi');
  });

  it('verifies resilience rotation differs meaningfully from existing rotation during Rabi', () => {
    const baseline = runSimulation('existing_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
    });
    const resilience = runSimulation('resilience_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
    });

    // 1. Water savings: Chickpea (300 mm trait) vs Wheat (450 mm trait)
    // Over the Rabi period, chickpea has lower water extraction demand
    const waterDifference = baseline.contractOutput.meters.waterUse - resilience.contractOutput.meters.waterUse;
    assert.ok(
      waterDifference >= 5.0,
      `Expected resilience water use to save at least 5 mm, saved: ${waterDifference} mm`
    );

    // 2. Nitrogen retention: Chickpea biological fixation keeps residual soil nitrogen higher
    const baselineWithHist = runSimulation('existing_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
      recordHistory: true,
    });
    const resilienceWithHist = runSimulation('resilience_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
      recordHistory: true,
    });
    const endRabiNBase = baselineWithHist.internalResult.stepHistory!.at(-1)!.soil.nitrogen;
    const endRabiNRes = resilienceWithHist.internalResult.stepHistory!.at(-1)!.soil.nitrogen;

    assert.ok(
      endRabiNRes >= endRabiNBase + 5.0,
      `Expected end-of-Rabi residual N for chickpea (${endRabiNRes}) to be at least 5 kg/ha higher than wheat (${endRabiNBase})`
    );
    assert.ok(
      resilience.contractOutput.meters.nitrogen > baseline.contractOutput.meters.nitrogen,
      'Annual average soil N should be higher for resilience rotation'
    );
  });

  it('verifies income rotation differs for explicit modeled economic reasons', () => {
    // Under favorable rainfall conditions, intensive commercial management realizes higher gross revenue
    const favorableWeather: RegionalWeather = [];
    for (let w = 22; w <= 52; w++) {
      const isMonsoon = w >= 22 && w <= 38;
      favorableWeather.push({
        year: 2025,
        week: w,
        tmax: isMonsoon ? 32.0 : 20.0,
        tmin: isMonsoon ? 22.0 : 8.0,
        rain: isMonsoon ? 35.0 : 18.0, // Favorable rains across both seasons
        soilWet: 0.35,
        evap: 3.5,
        solar: 20.0,
      });
    }

    const baseline = runSimulation('existing_rotation', favorableWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
    });
    const income = runSimulation('income_rotation', favorableWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
    });

    // Modeled income must be calculated from strategy economics (higher gross potential overcoming higher input costs)
    assert.ok(
      income.contractOutput.meters.income > baseline.contractOutput.meters.income,
      `Expected income rotation (${income.contractOutput.meters.income}) > baseline (${baseline.contractOutput.meters.income})`
    );

    // Intensive commercial management consumes more water due to higher irrigation demand
    assert.ok(
      income.contractOutput.meters.waterUse >= baseline.contractOutput.meters.waterUse,
      'Income rotation should have equal or higher water draw'
    );
  });

  it('supports at least two verified regional calendars (Punjab and Karnataka)', () => {
    // Test Punjab: Kharif starts at week 22
    const punjabRun = runSimulation('existing_rotation', [{ year: 2025, week: 22, tmax: 38, tmin: 24, rain: 20, soilWet: 0.3, evap: 5, solar: 22 }], {
      cropCatalog: mockCrops,
      region: 'punjab',
      recordHistory: true,
    });
    assert.equal(punjabRun.internalResult.stepHistory![0].cropId, 'rice', 'Punjab week 22 should be Kharif (rice)');

    // Test Karnataka: Kharif starts at week 24; week 22 is still Summer/Zaid fallow
    const karnatakaWeek22 = runSimulation('existing_rotation', [{ year: 2025, week: 22, tmax: 32, tmin: 21, rain: 5, soilWet: 0.2, evap: 4, solar: 20 }], {
      cropCatalog: mockCrops,
      region: 'karnataka',
      recordHistory: true,
    });
    assert.equal(karnatakaWeek22.internalResult.stepHistory![0].cropId, null, 'Karnataka week 22 should be summer fallow (no crop)');

    const karnatakaWeek25 = runSimulation('existing_rotation', [{ year: 2025, week: 25, tmax: 30, tmin: 20, rain: 40, soilWet: 0.4, evap: 4, solar: 18 }], {
      cropCatalog: mockCrops,
      region: 'karnataka',
      recordHistory: true,
    });
    assert.equal(karnatakaWeek25.internalResult.stepHistory![0].cropId, 'rice', 'Karnataka week 25 should be Kharif (rice)');
  });

  it('handles unsupported regions with clear validation errors or disclosures', () => {
    // Strict validation throws UnsupportedRegionError
    assert.throws(
      () => {
        runSimulation('existing_rotation', mockWeatherPunjab, {
          region: 'iowa',
          validateRegion: true,
        });
      },
      (err: unknown) => {
        return err instanceof UnsupportedRegionError && err.message.includes("Unsupported region: 'iowa'");
      }
    );

    // Non-strict mode records explicit disclosure in limitations
    const nonStrict = runSimulation('existing_rotation', mockWeatherPunjab, {
      region: 'kenya',
      validateRegion: false,
    });
    assert.ok(nonStrict.contractOutput.limitations.some((l) => l.includes('Unsupported region')));
  });

  it('quantifies missing observation coverage and handles gaps transparently', () => {
    const mixedWeather: RegionalWeather = [
      { year: 2025, week: 22, tmax: null, tmin: null, rain: null, soilWet: null, evap: 5.0, solar: 22.0 }, // Rain missing
      { year: 2025, week: 23, tmax: 36.0, tmin: 22.0, rain: 20.0, soilWet: 0.2, evap: null, solar: null }, // Evap missing
      { year: 2025, week: 24, tmax: null, tmin: null, rain: null, soilWet: null, evap: null, solar: null }, // Both missing
      { year: 2025, week: 25, tmax: 34.0, tmin: 21.0, rain: 15.0, soilWet: 0.3, evap: 4.5, solar: 20.0 }, // Both valid
    ];

    const { contractOutput, internalResult } = runSimulation('resilience_rotation', mixedWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
    });

    const cov = internalResult.coverage;
    assert.equal(cov.totalWeeks, 4);
    assert.equal(cov.totalDays, 28);
    assert.equal(cov.validRainfallDays, 14); // 2 valid weeks * 7 = 14
    assert.equal(cov.missingRainfallDays, 14);
    assert.equal(cov.rainfallCoveragePercent, 50.0);

    assert.equal(cov.validEvaporationDays, 14);
    assert.equal(cov.missingEvaporationDays, 14);
    assert.equal(cov.evaporationCoveragePercent, 50.0);

    // Check transparent limitations
    assert.ok(contractOutput.limitations.some((l) => l.includes('Observation coverage: Rainfall available for 50')));
    assert.ok(contractOutput.limitations.some((l) => l.includes('Precipitation observations missing for 14 day(s)')));
    assert.ok(contractOutput.limitations.some((l) => l.includes('Atmospheric evaporation observations missing for 14 day(s)')));
  });

  it('verifies percentile semantic consistency and monotonic ordering', () => {
    const { contractOutput } = runSimulation('resilience_rotation', fullSeasonWeather, {
      cropCatalog: mockCrops,
      region: 'punjab',
    });

    const { p10, p50, p90 } = contractOutput;

    // All bands refer to the same metric: Farm Resilience Index (0 to 100)
    for (const band of [p10, p50, p90]) {
      assert.ok(band.p10 >= 0 && band.p10 <= 120, `p10 out of range: ${band.p10}`);
      assert.ok(band.p50 >= 0 && band.p50 <= 120, `p50 out of range: ${band.p50}`);
      assert.ok(band.p90 >= 0 && band.p90 <= 120, `p90 out of range: ${band.p90}`);
      // Internal band ordering
      assert.ok(band.p10 <= band.p50, `Expected band.p10 (${band.p10}) <= band.p50 (${band.p50})`);
      assert.ok(band.p50 <= band.p90, `Expected band.p50 (${band.p50}) <= band.p90 (${band.p90})`);
    }

    // Monotonic ordering across scenario bands: Adverse (p10) <= Median (p50) <= Favorable (p90)
    assert.ok(p10.p50 <= p50.p50, `Expected p10.p50 (${p10.p50}) <= p50.p50 (${p50.p50})`);
    assert.ok(p50.p50 <= p90.p50, `Expected p50.p50 (${p50.p50}) <= p90.p50 (${p90.p50})`);
  });

  it('guarantees strictly deterministic output for identical inputs', () => {
    const run1 = runSimulation('resilience_rotation', fullSeasonWeather, { cropCatalog: mockCrops });
    const run2 = runSimulation('resilience_rotation', fullSeasonWeather, { cropCatalog: mockCrops });

    assert.deepEqual(run1.contractOutput, run2.contractOutput);
    assert.deepEqual(run1.internalResult.finalMeters, run2.internalResult.finalMeters);
  });
});
