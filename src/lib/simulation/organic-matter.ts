import type { CropTraits } from '../../../contracts/crops.js';
import type { SimulationConfig } from './types.js';

export interface DailyOrganicMatterResult {
  newSOM: number;         // New soil organic matter percentage (e.g. 1.82%)
  dailyLossPercent: number; // Daily decomposition loss (%)
  dailyGainPercent: number; // Daily residue addition (%)
}

/**
 * Step daily Soil Organic Matter (SOM %) dynamics.
 *
 * Explicit Assumptions:
 * 1. SOM decomposition is driven by microbial respiration at an annual fractional rate (~2% per year).
 * 2. Carbon input from crop residues is proxied using the crop's coverValue (0 to 1 scale)
 *    and root biomass turnover.
 * 3. Legume crops provide higher quality organic residues, receiving a residue quality multiplier.
 * 4. Fallow periods yield zero organic inputs, leading to net gradual depletion.
 */
export function stepDailyOrganicMatter(
  currentSOM: number,
  crop: CropTraits | null,
  config: SimulationConfig
): DailyOrganicMatterResult {
  const { decompositionRatePerYear, residueCarbonFactor } = config.organicMatter;

  // Daily decomposition loss
  const dailyLossPercent = (currentSOM * decompositionRatePerYear) / 365;

  // Daily organic input from root turnover and retained above-ground residue
  let dailyGainPercent = 0;
  if (crop) {
    const coverScale = Math.min(1.0, Math.max(0.0, crop.coverValue));
    const legumeMultiplier = crop.nitrogenFixation ? 1.25 : 1.0;
    // Scaled across typical ~110 day growing season
    dailyGainPercent = (residueCarbonFactor * coverScale * legumeMultiplier) / 110;
  }

  // Net SOM change
  const updatedSOM = currentSOM - dailyLossPercent + dailyGainPercent;
  // Physically reasonable agronomic bounds (0.4% degraded - 6.0% highly organic soil)
  const clampedSOM = Math.max(0.4, Math.min(6.0, updatedSOM));

  return {
    newSOM: Number(clampedSOM.toFixed(4)),
    dailyLossPercent: Number(dailyLossPercent.toFixed(6)),
    dailyGainPercent: Number(dailyGainPercent.toFixed(6)),
  };
}
