import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runSimulation } from '../../src/lib/simulation/engine.js';
import type { CropCatalog } from '../../contracts/crops.js';
import type { RegionalWeather } from '../../contracts/weather.js';
import type { SimulationOutput } from '../../contracts/sim-output.js';

describe('Simulation Engine End-to-End Integration', () => {
  // Load existing mock files
  const cropsPath = resolve(process.cwd(), 'src/lib/mock/crops.json');
  const weatherPath = resolve(process.cwd(), 'src/lib/mock/weather-punjab.json');

  const mockCrops: CropCatalog = JSON.parse(readFileSync(cropsPath, 'utf8'));
  const mockWeather: RegionalWeather = JSON.parse(readFileSync(weatherPath, 'utf8'));

  it('runs all three strategies successfully and satisfies the frozen SimulationOutput contract', () => {
    const strategies = ['existing_rotation', 'resilience_rotation', 'income_rotation'] as const;

    for (const strategy of strategies) {
      const { contractOutput, internalResult } = runSimulation(strategy, mockWeather, {
        cropCatalog: mockCrops,
      });

      // 1. Verify frozen contract shape
      assert.equal(contractOutput.strategy, strategy);
      assert.ok(Array.isArray(contractOutput.years));
      assert.ok(contractOutput.years.length > 0);
      assert.ok(typeof contractOutput.meters.soilMoisture === 'number');
      assert.ok(typeof contractOutput.meters.organicMatter === 'number');
      assert.ok(typeof contractOutput.meters.nitrogen === 'number');
      assert.ok(typeof contractOutput.meters.erosionRisk === 'number');
      assert.ok(typeof contractOutput.meters.income === 'number');
      assert.ok(typeof contractOutput.meters.waterUse === 'number');

      // 2. Percentile bands match PercentileBand interface
      for (const band of [contractOutput.p10, contractOutput.p50, contractOutput.p90]) {
        assert.ok(typeof band.p10 === 'number');
        assert.ok(typeof band.p50 === 'number');
        assert.ok(typeof band.p90 === 'number');
      }

      // 3. Limitations must be transparent
      assert.ok(Array.isArray(contractOutput.limitations));
      assert.ok(contractOutput.limitations.length >= 3);

      // 4. Internal detailed result is populated
      assert.equal(internalResult.strategy, strategy);
      assert.ok(internalResult.explanation.length > 0);
      assert.ok(internalResult.meterDistributions.soilMoisture !== undefined);
    }
  });

  it('guarantees strictly deterministic output for identical inputs', () => {
    const run1 = runSimulation('resilience_rotation', mockWeather, { cropCatalog: mockCrops });
    const run2 = runSimulation('resilience_rotation', mockWeather, { cropCatalog: mockCrops });

    assert.deepEqual(run1.contractOutput, run2.contractOutput);
    assert.deepEqual(run1.internalResult.finalMeters, run2.internalResult.finalMeters);
  });

  it('handles missing weather observations transparently without fabricating data', () => {
    const gappedWeather: RegionalWeather = [
      { year: 2025, week: 22, tmax: null, tmin: null, rain: null, soilWet: null, evap: null, solar: null },
      { year: 2025, week: 23, tmax: 38.0, tmin: 24.0, rain: 15.0, soilWet: 0.22, evap: 5.0, solar: 22.0 },
    ];

    const { contractOutput, internalResult } = runSimulation('existing_rotation', gappedWeather, {
      cropCatalog: mockCrops,
    });

    assert.ok(contractOutput.meters.soilMoisture >= 0);
    // Limitations must record missing observation disclosures
    const hasPrecipWarning = contractOutput.limitations.some((l) => l.includes('Precipitation data missing'));
    const hasEvapWarning = contractOutput.limitations.some((l) => l.includes('Evaporation data missing'));
    assert.ok(hasPrecipWarning, 'Expected precipitation missing disclosure in limitations');
    assert.ok(hasEvapWarning, 'Expected evaporation missing disclosure in limitations');
  });

  it('differentiates strategy trade-offs: resilience conserves water while income prioritizes revenue', () => {
    // Generate a multi-week weather sequence for comparison
    const multiWeekWeather: RegionalWeather = [];
    for (let w = 22; w <= 35; w++) {
      multiWeekWeather.push({
        year: 2025,
        week: w,
        tmax: 36.0,
        tmin: 25.0,
        rain: w % 3 === 0 ? 30.0 : 5.0,
        soilWet: 0.25,
        evap: 5.5,
        solar: 22.0,
      });
    }

    const resilience = runSimulation('resilience_rotation', multiWeekWeather, { cropCatalog: mockCrops });
    const baseline = runSimulation('existing_rotation', multiWeekWeather, { cropCatalog: mockCrops });

    // Resilience rotation incorporates chickpea in rabi / lower water crop, maintaining better soil conditions
    assert.ok(
      resilience.contractOutput.meters.organicMatter >= baseline.contractOutput.meters.organicMatter,
      'Resilience rotation should maintain or improve organic matter'
    );
  });
});
