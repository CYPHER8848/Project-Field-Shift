import type { CropTraits } from '../../../contracts/crops.js';
import type { SimulationConfig } from './types.js';

export interface DailyErosionResult {
  erosionRisk: number;         // Dimensionless erosion proxy index (0 = negligible risk, 1 = extreme risk)
  erosivityFactor: number;     // Rainfall detachment pressure
  coverProtectionFactor: number;// Protective shielding factor (0 = full protection, 1 = no protection)
}

/**
 * Compute daily/weekly soil erosion risk proxy.
 *
 * Explicit Assumptions:
 * 1. Water erosion is driven by rainfall energy and surface runoff detachment.
 * 2. Crop canopy and surface mulch (proxied by `coverValue`, scale 0 to 1) directly intercept
 *    raindrops and impede surface runoff velocity.
 * 3. When a field is left bare (fallow, coverValue = 0), detachment risk is maximal.
 * 4. The resulting risk score is strictly normalized between 0.0 and 1.0.
 */
export function calculateErosionRisk(
  dailyRainMm: number | null,
  runoffMm: number,
  crop: CropTraits | null,
  config: SimulationConfig
): DailyErosionResult {
  // If rainfall observation is missing (null), erosion risk relies strictly on runoff if any
  const effectiveRain = dailyRainMm !== null ? Math.max(0, dailyRainMm) : 0;
  const thresholdMm = config.erosion.rainfallThresholdMm / 7; // Convert weekly threshold to daily equivalent (~5 mm/day)

  // 1. Rainfall erosivity pressure
  // Non-linear response: light drizzle produces negligible erosion; heavy downpours produce high detachment
  let erosivityFactor = 0;
  if (effectiveRain > 1.5 || runoffMm > 0) {
    const rainPressure = Math.pow(effectiveRain / Math.max(1, thresholdMm), 1.2);
    const runoffPressure = runoffMm * 0.4;
    erosivityFactor = Math.min(1.5, rainPressure + runoffPressure);
  }

  // 2. Vegetative canopy cover protection (RUSLE C-factor concept)
  // coverValue: 0 (bare soil) to 1 (full dense canopy)
  const cover = crop ? Math.min(1.0, Math.max(0.0, crop.coverValue)) : 0.0;
  // Dense canopy intercepts up to 85% of raindrop kinetic energy
  const coverProtectionFactor = 1.0 - 0.85 * cover;

  // 3. Composite erosion risk index
  const rawRisk = (erosivityFactor * coverProtectionFactor) / 1.5;

  // Strictly clamp between 0.0 and 1.0
  const erosionRisk = Math.max(0.0, Math.min(1.0, Number(rawRisk.toFixed(3))));

  return {
    erosionRisk,
    erosivityFactor: Number(erosivityFactor.toFixed(3)),
    coverProtectionFactor: Number(coverProtectionFactor.toFixed(3)),
  };
}
