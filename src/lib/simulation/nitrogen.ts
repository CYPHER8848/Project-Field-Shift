import type { CropTraits } from '../../../contracts/crops.js';
import type { SimulationConfig } from './types.js';

export interface DailyNitrogenResult {
  newSoilNitrogenKg: number;    // Soil mineral N pool (kg N/ha)
  fixationGainKg: number;       // Biological N fixation contribution (kg N/ha)
  mineralizationGainKg: number; // N released from SOM mineralization (kg N/ha)
  cropUptakeKg: number;         // N removed by crop vegetative growth/grain (kg N/ha)
  leachingLossKg: number;       // Soluble nitrate lost via deep drainage (kg N/ha)
}

/**
 * Step daily soil nitrogen dynamics.
 *
 * Explicit Assumptions:
 * 1. CropTraits only provides `nitrogenFixation: boolean`. Fixation rate is a configurable
 *    model assumption (`legumeFixationPerSeasonKg`), NOT a measured field observation.
 * 2. Active legume nodule fixation is modulated by crop water stress factor (drought impairs BNF).
 * 3. Crop uptake is proportional to crop water demand and relative biomass.
 * 4. Excess water percolation through deep drainage leaches mobile nitrate downward.
 */
export function stepDailyNitrogen(
  currentSoilNitrogenKg: number,
  currentSOM: number,
  crop: CropTraits | null,
  drainageMm: number,
  waterStressFactor: number,
  config: SimulationConfig
): DailyNitrogenResult {
  const { legumeFixationPerSeasonKg, baseMineralizationPerYearKg, leachingSensitivity } = config.nitrogen;

  // 1. Biological Nitrogen Fixation (BNF)
  let fixationGainKg = 0;
  if (crop && crop.nitrogenFixation) {
    // Configurable assumption: ~110 days active nodule fixation per season
    const dailyPotentialFixation = legumeFixationPerSeasonKg / 110;
    // Drought stress reduces biological fixation
    fixationGainKg = dailyPotentialFixation * Math.max(0.1, waterStressFactor);
  }

  // 2. Soil organic matter mineralization (daily background release)
  // Higher SOM yields higher natural nitrogen mineralization
  const somScaling = Math.max(0.2, currentSOM / 1.8);
  const mineralizationGainKg = (baseMineralizationPerYearKg * somScaling) / 365;

  // 3. Crop uptake demand from soil mineral pool
  let cropUptakeKg = 0;
  if (crop) {
    // Non-legume cereals draw heavily on soil mineral N (~95 kg/ha/season)
    // Legumes obtain majority of N from atmosphere via BNF, drawing minimally (~15 kg/ha) on soil pool
    const seasonalDemandKg = crop.nitrogenFixation ? 15 : 95;
    const dailyBaseUptake = seasonalDemandKg / 110;
    cropUptakeKg = dailyBaseUptake * Math.max(0.2, waterStressFactor);
    // Uptake cannot exceed available soil nitrogen
    cropUptakeKg = Math.min(cropUptakeKg, currentSoilNitrogenKg + fixationGainKg + mineralizationGainKg);
  }

  // 4. Nitrate leaching via deep percolation
  let leachingLossKg = 0;
  if (drainageMm > 0 && currentSoilNitrogenKg > 0) {
    const fractionLeached = Math.min(0.20, (drainageMm * leachingSensitivity) / 100);
    leachingLossKg = currentSoilNitrogenKg * fractionLeached;
  }

  // 5. Mass balance
  const nextN = currentSoilNitrogenKg + fixationGainKg + mineralizationGainKg - cropUptakeKg - leachingLossKg;
  const newSoilNitrogenKg = Math.max(5.0, Number(nextN.toFixed(2))); // Floor at 5 kg/ha residual baseline

  return {
    newSoilNitrogenKg,
    fixationGainKg: Number(fixationGainKg.toFixed(3)),
    mineralizationGainKg: Number(mineralizationGainKg.toFixed(3)),
    cropUptakeKg: Number(cropUptakeKg.toFixed(3)),
    leachingLossKg: Number(leachingLossKg.toFixed(3)),
  };
}
