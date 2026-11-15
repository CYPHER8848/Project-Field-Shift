import type { CropTraits } from '../../../contracts/crops.js';
import type { DailyWeatherStep, SimulationConfig, SoilState } from './types.js';

export interface DailyWaterBalanceResult {
  newSoilMoisture: number;      // New volumetric soil moisture fraction (bounded by [wiltingPoint, saturation])
  evapotranspirationMm: number; // Actual daily crop evapotranspiration / soil evaporation (mm)
  runoffMm: number;             // Surface runoff caused by rain exceeding soil saturation capacity (mm)
  drainageMm: number;           // Deep percolation beyond field capacity (mm)
  cropWaterDemandMm: number;    // Unstressed potential crop water demand (mm)
  waterStressFactor: number;    // 0 (severe stress/wilting) to 1 (optimal moisture)
  isRainMissing: boolean;       // Flagged true if rainfall was an unobserved data gap
  isEvapMissing: boolean;       // Flagged true if evaporation was an unobserved data gap
}

/**
 * Step the daily root-zone soil water balance.
 *
 * Physical Principles & Missing Observation Policies:
 * - Single-layer root-zone bucket model strictly bounded between permanent wilting point (PWP) and saturation (SAT).
 * - Soil moisture cannot drop below wiltingPoint or exceed saturation under any circumstance.
 * - Missing Rainfall Policy: If weather.rain is null, rainMm is 0 for mass balance, but flagged as isRainMissing.
 *   It is treated as an unobserved precipitation gap, NOT verified dry weather.
 * - Missing Evaporation Policy: If weather.evap is null, reference ET is 0 for mass balance, but flagged as isEvapMissing.
 *   It is treated as an unobserved atmospheric demand gap, NOT zero atmospheric demand.
 * - Excess water above saturation becomes surface runoff.
 * - Drainage occurs above field capacity based on soil drainageRate.
 */
export function stepDailyWaterBalance(
  currentSoil: SoilState,
  weather: DailyWeatherStep,
  crop: CropTraits | null,
  config: SimulationConfig
): DailyWaterBalanceResult {
  const { wiltingPoint, fieldCapacity, saturation, drainageRate } = config.soil;

  const isRainMissing = weather.rain === null;
  const isEvapMissing = weather.evap === null;

  // Active root-zone depth in mm (rootingDepth is in cm in CropTraits)
  const rootDepthMm = crop ? Math.max(200, crop.rootingDepth * 10) : 300; // 300 mm topsoil when fallow

  // Current water storage in root zone (mm)
  const currentWaterMm = currentSoil.soilMoisture * rootDepthMm;
  const pwpWaterMm = wiltingPoint * rootDepthMm;
  const fcWaterMm = fieldCapacity * rootDepthMm;
  const satWaterMm = saturation * rootDepthMm;

  // Inflow: daily precipitation (mm)
  // Missing observations are treated as unobserved gaps (0 inflow) rather than verified dry weather.
  const rainMm = !isRainMissing && weather.rain !== null ? Math.max(0, weather.rain) : 0;

  // 1. Water addition and surface runoff check
  const waterAfterRain = currentWaterMm + rainMm;
  let runoffMm = 0;
  let storageBeforeET = waterAfterRain;

  if (waterAfterRain > satWaterMm) {
    runoffMm = waterAfterRain - satWaterMm;
    storageBeforeET = satWaterMm;
  }

  // 2. Crop water demand and actual evapotranspiration
  // Missing evap is treated as unobserved demand gap (0 ET) rather than zero atmospheric demand.
  const et0 = !isEvapMissing && weather.evap !== null ? Math.max(0, weather.evap) : 0;

  // Crop coefficient Kc combines canopy cover and crop waterUse trait (normalized to 450 mm baseline)
  // Rice (1200 mm) has high transpiration; Chickpea (300 mm) has low water demand
  const waterUseFactor = crop ? Math.max(0.5, Math.min(2.5, crop.waterUse / 450)) : 1.0;
  const baseKc = crop ? 0.30 + 0.60 * Math.min(1, Math.max(0, crop.coverValue)) : 0.25;
  const kc = baseKc * waterUseFactor;
  const potentialDemandMm = kc * et0;

  // Water stress factor Ks (FAO-56 dual coefficient concept)
  const availableWater = Math.max(0, storageBeforeET - pwpWaterMm);
  const maxAvailableWater = Math.max(1, fcWaterMm - pwpWaterMm);
  const fractionAvailable = availableWater / maxAvailableWater;

  let ks = 1.0;
  if (fractionAvailable <= 0) {
    ks = 0.0; // Wilting point reached
  } else if (fractionAvailable < 0.5) {
    ks = fractionAvailable / 0.5; // Linear decline under water stress
  }

  // Actual evapotranspiration cannot pull storage below permanent wilting point
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
    isRainMissing,
    isEvapMissing,
  };
}
