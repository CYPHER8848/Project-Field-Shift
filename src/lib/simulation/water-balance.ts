import type { CropTraits } from '../../../contracts/crops.js';
import type { DailyWeatherStep, SimulationConfig, SoilState } from './types.js';

export interface DailyWaterBalanceResult {
  newSoilMoisture: number;      // New volumetric soil moisture fraction (bounded by [wiltingPoint, saturation])
  evapotranspirationMm: number; // Actual daily crop evapotranspiration / soil evaporation (mm)
  runoffMm: number;             // Surface runoff caused by rain exceeding soil saturation capacity (mm)
  drainageMm: number;           // Deep percolation beyond field capacity (mm)
  cropWaterDemandMm: number;    // Unstressed potential crop water demand (mm)
  waterStressFactor: number;    // 0 (severe stress/wilting) to 1 (optimal moisture)
}

/**
 * Step the daily root-zone soil water balance.
 *
 * Physical Principles:
 * - Uses a single-layer root-zone bucket model bounded by permanent wilting point (PWP) and saturation (SAT).
 * - Soil moisture cannot drop below wiltingPoint or exceed saturation under any circumstance.
 * - Infiltration from rain is captured up to saturation; excess becomes surface runoff.
 * - Drainage occurs above field capacity based on soil hydraulic conductivity (drainageRate).
 * - Actual evapotranspiration (ETc) is scaled by crop coverValue, reference evap (ET0), and water stress (Ks).
 */
export function stepDailyWaterBalance(
  currentSoil: SoilState,
  weather: DailyWeatherStep,
  crop: CropTraits | null,
  config: SimulationConfig
): DailyWaterBalanceResult {
  const { wiltingPoint, fieldCapacity, saturation, drainageRate } = config.soil;

  // Active root-zone depth in mm (rootingDepth is in cm in CropTraits)
  const rootDepthMm = crop ? Math.max(200, crop.rootingDepth * 10) : 300; // 300 mm topsoil when fallow

  // Current water storage in root zone (mm)
  const currentWaterMm = currentSoil.soilMoisture * rootDepthMm;
  const pwpWaterMm = wiltingPoint * rootDepthMm;
  const fcWaterMm = fieldCapacity * rootDepthMm;
  const satWaterMm = saturation * rootDepthMm;

  // Inflow: daily precipitation (mm)
  // If weather observation is null, precipitation is 0; never fabricated.
  const rainMm = weather.rain !== null ? Math.max(0, weather.rain) : 0;

  // 1. Water addition and surface runoff check
  const waterAfterRain = currentWaterMm + rainMm;
  let runoffMm = 0;
  let storageBeforeET = waterAfterRain;

  if (waterAfterRain > satWaterMm) {
    runoffMm = waterAfterRain - satWaterMm;
    storageBeforeET = satWaterMm;
  }

  // 2. Crop water demand and actual evapotranspiration
  // Reference ET (evap is mm/day weekly mean)
  const et0 = weather.evap !== null ? Math.max(0, weather.evap) : 0;

  // Crop coefficient Kc (bare soil: ~0.25; full canopy: ~1.15)
  const kc = crop ? 0.35 + 0.80 * Math.min(1, Math.max(0, crop.coverValue)) : 0.25;
  const potentialDemandMm = kc * et0;

  // Water stress factor Ks (FAO-56 dual coefficient concept)
  // Readily available water is typically 50% of available water capacity (FC - PWP)
  const availableWater = Math.max(0, storageBeforeET - pwpWaterMm);
  const maxAvailableWater = Math.max(1, fcWaterMm - pwpWaterMm);
  const fractionAvailable = availableWater / maxAvailableWater;

  let ks = 1.0;
  if (fractionAvailable <= 0) {
    ks = 0.0; // At or below wilting point, plants cannot extract water
  } else if (fractionAvailable < 0.5) {
    ks = fractionAvailable / 0.5; // Linear decline in transpiration under moisture deficit
  }

  // Actual evapotranspiration cannot pull water below the permanent wilting point
  const desiredET = ks * potentialDemandMm;
  const actualET = Math.min(desiredET, availableWater);

  const storageAfterET = storageBeforeET - actualET;

  // 3. Deep drainage / percolation beyond field capacity
  let drainageMm = 0;
  let finalStorage = storageAfterET;

  if (storageAfterET > fcWaterMm) {
    drainageMm = (storageAfterET - fcWaterMm) * drainageRate;
    finalStorage = storageAfterET - drainageMm;
  }

  // 4. Strict physical bounds clamping
  const clampedStorage = Math.max(pwpWaterMm, Math.min(satWaterMm, finalStorage));
  const newMoistureFraction = Number((clampedStorage / rootDepthMm).toFixed(4));

  return {
    newSoilMoisture: newMoistureFraction,
    evapotranspirationMm: Number(actualET.toFixed(3)),
    runoffMm: Number(runoffMm.toFixed(3)),
    drainageMm: Number(drainageMm.toFixed(3)),
    cropWaterDemandMm: Number(potentialDemandMm.toFixed(3)),
    waterStressFactor: Number(ks.toFixed(3)),
  };
}
