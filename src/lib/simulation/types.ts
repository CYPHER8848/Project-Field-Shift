import type { CropTraits } from '../../../contracts/crops.js';
import type { WeeklyWeatherRecord } from '../../../contracts/weather.js';
import type { StrategyId, MeterValues, SimulationYear, PercentileBand, SimulationOutput } from '../../../contracts/sim-output.js';
import type { RegionalCalendar, SupportedRegionId } from './regional-calendars.js';

/**
 * Discretized daily weather record.
 * Distinguishes observed daily values from uniformly distributed weekly allocations.
 * Missing observations remain null.
 */
export interface DailyWeatherStep {
  year: number;
  week: number;
  dayOfWeek: number; // 1 to 7
  dayOfYear: number; // 1 to 365/366
  tmax: number | null;
  tmin: number | null;
  rain: number | null;
  isDistributedWeeklyRain: boolean;
  soilWet: number | null;
  evap: number | null;
  solar: number | null;
}

/**
 * Quantified observation coverage for weather data.
 */
export interface ObservationCoverage {
  totalWeeks: number;
  totalDays: number;
  validRainfallDays: number;
  missingRainfallDays: number;
  rainfallCoveragePercent: number;
  validEvaporationDays: number;
  missingEvaporationDays: number;
  evaporationCoveragePercent: number;
  isRainfallComplete: boolean;
  isEvaporationComplete: boolean;
}

/**
 * Configurable biophysical parameters for the simulation engine.
 */
export interface SimulationConfig {
  soil: {
    wiltingPoint: number;       // Permanent wilting point fraction (theta_pwp, default ~0.12)
    fieldCapacity: number;      // Field capacity fraction (theta_fc, default ~0.30)
    saturation: number;         // Saturation porosity fraction (theta_sat, default ~0.45)
    drainageRate: number;       // Daily drainage fraction above field capacity (0 to 1)
  };
  nitrogen: {
    legumeFixationPerSeasonKg: number; // Configurable model assumption for legume N fixation (kg N/ha/season)
    baseMineralizationPerYearKg: number; // Base mineralization per % SOM
    leachingSensitivity: number;        // Leaching factor per mm drainage
  };
  organicMatter: {
    decompositionRatePerYear: number;   // Fractional decomposition rate per year (~0.02)
    residueCarbonFactor: number;        // Carbon input scale from crop cover & biomass
  };
  erosion: {
    rainfallThresholdMm: number;        // Weekly rainfall threshold where erosive runoff begins (mm/week)
  };
}

/**
 * Default simulation parameters based on typical sub-humid/semi-arid agricultural soils.
 */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  soil: {
    wiltingPoint: 0.12,
    fieldCapacity: 0.30,
    saturation: 0.45,
    drainageRate: 0.40,
  },
  nitrogen: {
    legumeFixationPerSeasonKg: 35.0, // Parameterized model assumption, not a measured constant
    baseMineralizationPerYearKg: 15.0,
    leachingSensitivity: 0.05,
  },
  organicMatter: {
    decompositionRatePerYear: 0.02,
    residueCarbonFactor: 0.08,
  },
  erosion: {
    rainfallThresholdMm: 35.0,
  },
};

/**
 * Internal state of the simulated soil block.
 */
export interface SoilState {
  soilMoisture: number;     // Volumetric soil moisture fraction (bounded between wiltingPoint and saturation)
  organicMatter: number;    // Soil organic matter percentage (e.g. 1.8%)
  nitrogen: number;         // Available soil inorganic nitrogen pool (kg N/ha)
  erosionRisk: number;      // Current erosion risk proxy (0 to 1)
  cumulativeWaterUse: number; // Total cumulative crop water use (mm)
  relativeIncome: number;   // Relative income indicator (100 = baseline)
  isRainMissing?: boolean;  // Flag if today's rainfall input was an unobserved gap
  isEvapMissing?: boolean;  // Flag if today's evaporation input was an unobserved gap
}

/**
 * Detailed step record emitted during simulation execution.
 */
export interface StepResult {
  year: number;
  week: number;
  day: number;
  weather: DailyWeatherStep;
  cropId: string | null;
  evapotranspirationMm: number;
  drainageMm: number;
  runoffMm: number;
  soil: SoilState;
}

/**
 * Strategy rotation specification: which crops grow in which seasons.
 */
export interface CropRotationPlan {
  strategyId: StrategyId;
  name: string;
  description: string;
  managementRegime: 'conventional' | 'conservation' | 'intensive_commercial';
  rotationBySeason: {
    season: 'kharif' | 'rabi' | 'zaid';
    cropId: string;
    targetYieldIndex: number; // Baseline yield expectation under optimal moisture
  }[];
}

/**
 * Modeled economic assumptions for calculating net income.
 * Crop pricing and input costs are not present in the frozen crop contract.
 */
export interface StrategyEconomics {
  grossRevenuePotential: number; // Modeled revenue index before stress
  baseProductionCost: number;     // Fixed seed, labor, equipment costs
  irrigationCostPerMm: number;    // Pumping energy/water cost per mm applied
  fertilizerCostPerKgN: number;   // Cost of synthetic nitrogen fertilizer ($/kg N)
  stressVulnerability: number;    // Downside revenue loss factor under moisture stress
}

/**
 * Run options passed into runSimulation.
 */
export interface SimulationRunOptions {
  region?: SupportedRegionId | string;
  regionalCalendar?: RegionalCalendar;
  validateRegion?: boolean;
  config?: Partial<SimulationConfig>;
  initialSoil?: Partial<SoilState>;
  cropCatalog?: CropTraits[];
  recordHistory?: boolean;
}

/**
 * Internal multi-dimensional simulation result.
 * Keeps detailed statistical distributions separate from the frozen SimulationOutput contract.
 */
export interface InternalSimulationResult {
  strategy: StrategyId;
  strategyName: string;
  region: string;
  years: SimulationYear[];
  finalMeters: MeterValues;
  meterDistributions: Record<keyof MeterValues, PercentileBand>;
  overallScore: PercentileBand;
  coverage: ObservationCoverage;
  explanation: string;
  limitations: string[];
  stepHistory?: StepResult[];
}

export type { CropTraits, WeeklyWeatherRecord, StrategyId, MeterValues, SimulationYear, PercentileBand, SimulationOutput, SupportedRegionId, RegionalCalendar };
