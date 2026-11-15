import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { stepDailyNitrogen } from '../../src/lib/simulation/nitrogen.js';
import { DEFAULT_SIMULATION_CONFIG } from '../../src/lib/simulation/types.js';
import type { CropTraits } from '../../contracts/crops.js';

describe('Nitrogen Dynamics & Fixation Rules', () => {
  const legumeCrop: CropTraits = {
    id: 'chickpea',
    name: 'Chickpea',
    waterUse: 300,
    nitrogenFixation: true,
    rootingDepth: 100,
    coverValue: 0.50,
    season: ['rabi'],
    waterUseUnit: 'mm_per_growing_season',
    rootingDepthUnit: 'cm',
    coverValueScale: '0_to_1',
    sources: ['Test Source'],
  };

  const cerealCrop: CropTraits = {
    id: 'wheat',
    name: 'Wheat',
    waterUse: 450,
    nitrogenFixation: false,
    rootingDepth: 120,
    coverValue: 0.55,
    season: ['rabi'],
    waterUseUnit: 'mm_per_growing_season',
    rootingDepthUnit: 'cm',
    coverValueScale: '0_to_1',
    sources: ['Test Source'],
  };

  it('provides biological nitrogen fixation gain for legumes', () => {
    const initialN = 40.0;
    const initialSOM = 1.8;
    const drainageMm = 0;
    const waterStressFactor = 1.0;

    const res = stepDailyNitrogen(
      initialN,
      initialSOM,
      legumeCrop,
      drainageMm,
      waterStressFactor,
      DEFAULT_SIMULATION_CONFIG
    );

    assert.ok(res.fixationGainKg > 0, 'Legume did not receive N fixation gain');
    assert.equal(
      res.fixationGainKg,
      Number((DEFAULT_SIMULATION_CONFIG.nitrogen.legumeFixationPerSeasonKg / 110).toFixed(3))
    );
  });

  it('provides zero biological nitrogen fixation gain for non-legume crops', () => {
    const initialN = 40.0;
    const initialSOM = 1.8;
    const drainageMm = 0;
    const waterStressFactor = 1.0;

    const res = stepDailyNitrogen(
      initialN,
      initialSOM,
      cerealCrop,
      drainageMm,
      waterStressFactor,
      DEFAULT_SIMULATION_CONFIG
    );

    assert.equal(res.fixationGainKg, 0, 'Non-legume incorrectly received N fixation gain');
    assert.ok(res.cropUptakeKg > 0, 'Cereal crop should have positive N uptake');
  });

  it('causes leaching loss when deep drainage occurs', () => {
    const initialN = 60.0;
    const initialSOM = 1.8;
    const heavyDrainageMm = 30.0;
    const waterStressFactor = 1.0;

    const resWithDrainage = stepDailyNitrogen(
      initialN,
      initialSOM,
      cerealCrop,
      heavyDrainageMm,
      waterStressFactor,
      DEFAULT_SIMULATION_CONFIG
    );

    assert.ok(resWithDrainage.leachingLossKg > 0, 'Expected leaching loss with drainage');
    assert.ok(resWithDrainage.newSoilNitrogenKg < initialN, 'Soil N did not decline after leaching');
  });

  it('guarantees soil nitrogen does not drop below baseline residual floor', () => {
    let soilN = 5.0; // At residual floor
    const som = 1.0;

    for (let day = 0; day < 20; day++) {
      const res = stepDailyNitrogen(soilN, som, cerealCrop, 0, 1.0, DEFAULT_SIMULATION_CONFIG);
      soilN = res.newSoilNitrogenKg;
      assert.ok(soilN >= 5.0, `Soil N dropped below floor: ${soilN}`);
    }
  });
});
