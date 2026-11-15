import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateErosionRisk } from '../../src/lib/simulation/erosion.js';
import { stepDailyOrganicMatter } from '../../src/lib/simulation/organic-matter.js';
import { DEFAULT_SIMULATION_CONFIG } from '../../src/lib/simulation/types.js';
import type { CropTraits } from '../../contracts/crops.js';

describe('Erosion Proxy & Soil Organic Matter', () => {
  const highCoverCrop: CropTraits = {
    id: 'cover_crop',
    name: 'Cover Crop',
    waterUse: 250,
    nitrogenFixation: true,
    rootingDepth: 80,
    coverValue: 0.85, // 85% canopy cover
    season: ['zaid'],
    waterUseUnit: 'mm_per_growing_season',
    rootingDepthUnit: 'cm',
    coverValueScale: '0_to_1',
    sources: ['Test Source'],
  };

  it('guarantees erosion risk is strictly bounded within [0.0, 1.0]', () => {
    // Normal rain
    const normal = calculateErosionRisk(10.0, 0, highCoverCrop, DEFAULT_SIMULATION_CONFIG);
    assert.ok(normal.erosionRisk >= 0.0 && normal.erosionRisk <= 1.0);

    // Extreme storm on bare ground
    const extreme = calculateErosionRisk(300.0, 150.0, null, DEFAULT_SIMULATION_CONFIG);
    assert.ok(extreme.erosionRisk >= 0.0 && extreme.erosionRisk <= 1.0);
    assert.equal(extreme.erosionRisk, 1.0, 'Extreme storm on bare soil should cap at 1.0');

    // Zero rain
    const dry = calculateErosionRisk(0.0, 0, highCoverCrop, DEFAULT_SIMULATION_CONFIG);
    assert.equal(dry.erosionRisk, 0.0, 'Zero rain should yield zero erosion');
  });

  it('proves high crop cover significantly dampens erosion risk compared to bare fallow', () => {
    const rainEventMm = 30.0;
    const runoffMm = 5.0;

    const bareResult = calculateErosionRisk(rainEventMm, runoffMm, null, DEFAULT_SIMULATION_CONFIG);
    const coveredResult = calculateErosionRisk(rainEventMm, runoffMm, highCoverCrop, DEFAULT_SIMULATION_CONFIG);

    assert.ok(
      coveredResult.erosionRisk < bareResult.erosionRisk,
      `Expected covered risk (${coveredResult.erosionRisk}) < bare risk (${bareResult.erosionRisk})`
    );
    assert.ok(
      coveredResult.coverProtectionFactor < bareResult.coverProtectionFactor,
      'Canopy cover should reduce protection factor'
    );
  });

  it('accumulates SOM with cover crops and depletes SOM under bare fallow', () => {
    let somWithCrop = 1.80;
    let somFallow = 1.80;

    // Simulate 120 days of crop growth vs fallow
    for (let day = 0; day < 120; day++) {
      const cropRes = stepDailyOrganicMatter(somWithCrop, highCoverCrop, DEFAULT_SIMULATION_CONFIG);
      const fallowRes = stepDailyOrganicMatter(somFallow, null, DEFAULT_SIMULATION_CONFIG);

      somWithCrop = cropRes.newSOM;
      somFallow = fallowRes.newSOM;
    }

    assert.ok(
      somWithCrop > somFallow,
      `SOM with crop (${somWithCrop}) should exceed fallow SOM (${somFallow})`
    );
    assert.ok(somFallow < 1.80, 'Fallow SOM should gradually decline due to decomposition');
  });
});
