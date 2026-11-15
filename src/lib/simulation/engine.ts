import type { CropCatalog, CropTraits } from '../../../contracts/crops.js';
import type { RegionalWeather } from '../../../contracts/weather.js';
import type { StrategyId, MeterValues, SimulationYear, PercentileBand, SimulationOutput } from '../../../contracts/sim-output.js';
import {
  type SimulationConfig,
  type SoilState,
  type StepResult,
  type InternalSimulationResult,
  DEFAULT_SIMULATION_CONFIG,
} from './types.js';
import { discretizeWeeklyWeather } from './weather-discretizer.js';
import { stepDailyWaterBalance } from './water-balance.js';
import { stepDailyNitrogen } from './nitrogen.js';
import { stepDailyOrganicMatter } from './organic-matter.js';
import { calculateErosionRisk } from './erosion.js';
import { STANDARD_ROTATION_PLANS, explainStrategyOutcomes } from './scorer.js';

export interface SimulationRunOptions {
  config?: Partial<SimulationConfig>;
  initialSoil?: Partial<SoilState>;
  cropCatalog?: CropCatalog;
  recordHistory?: boolean;
}

/**
 * Determine which crop from the strategy plan is currently growing based on the calendar week.
 */
function getActiveCropForWeek(
  week: number,
  strategyId: StrategyId,
  crops: Map<string, CropTraits>
): CropTraits | null {
  const plan = STANDARD_ROTATION_PLANS[strategyId];
  if (!plan) return null;

  // Agricultural seasonal calendar (Northern Hemisphere / South Asian baseline):
  // Kharif (Monsoon): Weeks 22 - 42 (~June to mid-October)
  // Rabi (Winter): Weeks 43 - 16 (~mid-October to mid-April)
  // Zaid / Fallow: Weeks 17 - 21 (~mid-April to end of May)
  let targetSeason: 'kharif' | 'rabi' | 'zaid' = 'zaid';
  if (week >= 22 && week <= 42) {
    targetSeason = 'kharif';
  } else if (week >= 43 || week <= 16) {
    targetSeason = 'rabi';
  }

  const assignment = plan.rotationBySeason.find((r) => r.season === targetSeason);
  if (!assignment) return null;

  return crops.get(assignment.cropId) ?? null;
}

/**
 * Primary simulation engine function.
 * Deterministic, pure function operating over provided weather and crop catalog data.
 */
export function runSimulation(
  strategy: StrategyId,
  weatherRecords: RegionalWeather,
  options: SimulationRunOptions = {}
): {
  contractOutput: SimulationOutput;
  internalResult: InternalSimulationResult;
} {
  const limitations: string[] = [];

  // Deep merge configuration
  const config: SimulationConfig = {
    soil: { ...DEFAULT_SIMULATION_CONFIG.soil, ...options.config?.soil },
    nitrogen: { ...DEFAULT_SIMULATION_CONFIG.nitrogen, ...options.config?.nitrogen },
    organicMatter: { ...DEFAULT_SIMULATION_CONFIG.organicMatter, ...options.config?.organicMatter },
    erosion: { ...DEFAULT_SIMULATION_CONFIG.erosion, ...options.config?.erosion },
  };

  // Build crop trait lookup
  const cropMap = new Map<string, CropTraits>();
  if (options.cropCatalog) {
    for (const crop of options.cropCatalog) {
      cropMap.set(crop.id, crop);
    }
  }

  // Initial soil state
  let currentSoil: SoilState = {
    soilMoisture: options.initialSoil?.soilMoisture ?? 0.30,
    organicMatter: options.initialSoil?.organicMatter ?? 1.80,
    nitrogen: options.initialSoil?.nitrogen ?? 40.0,
    erosionRisk: options.initialSoil?.erosionRisk ?? 0.20,
    cumulativeWaterUse: options.initialSoil?.cumulativeWaterUse ?? 0.0,
    relativeIncome: options.initialSoil?.relativeIncome ?? 100.0,
  };

  // 1. Step weather discretization
  const dailyWeather = discretizeWeeklyWeather(weatherRecords, limitations);

  const stepHistory: StepResult[] = [];
  const yearlyMetrics = new Map<
    number,
    {
      moistures: number[];
      soms: number[];
      nitrogens: number[];
      erosions: number[];
      waterUseMm: number;
      stressSum: number;
      stepCount: number;
    }
  >();

  // 2. Daily stepping loop
  for (const day of dailyWeather) {
    const activeCrop = getActiveCropForWeek(day.week, strategy, cropMap);

    // A. Daily water balance
    const waterRes = stepDailyWaterBalance(currentSoil, day, activeCrop, config);

    // B. Daily nitrogen dynamics
    const nitrogenRes = stepDailyNitrogen(
      currentSoil.nitrogen,
      currentSoil.organicMatter,
      activeCrop,
      waterRes.drainageMm,
      waterRes.waterStressFactor,
      config
    );

    // C. Daily organic matter
    const somRes = stepDailyOrganicMatter(currentSoil.organicMatter, activeCrop, config);

    // D. Daily erosion risk proxy
    const erosionRes = calculateErosionRisk(day.rain, waterRes.runoffMm, activeCrop, config);

    // Update cumulative water use
    const newCumulativeWaterUse = currentSoil.cumulativeWaterUse + waterRes.evapotranspirationMm;

    // Relative income proxy update
    // Calibrated baseline: target yield penalized by severe moisture stress
    const plan = STANDARD_ROTATION_PLANS[strategy];
    const targetIncome = plan.rotationBySeason[0]?.targetYieldIndex ?? 100;
    const stressPenalty = (1.0 - waterRes.waterStressFactor) * 20;
    const dayIncomeIndex = Math.max(50, targetIncome - stressPenalty);

    currentSoil = {
      soilMoisture: waterRes.newSoilMoisture,
      organicMatter: somRes.newSOM,
      nitrogen: nitrogenRes.newSoilNitrogenKg,
      erosionRisk: erosionRes.erosionRisk,
      cumulativeWaterUse: Number(newCumulativeWaterUse.toFixed(2)),
      relativeIncome: Number(dayIncomeIndex.toFixed(1)),
    };

    if (options.recordHistory) {
      stepHistory.push({
        year: day.year,
        week: day.week,
        day: day.dayOfWeek,
        weather: day,
        cropId: activeCrop?.id ?? null,
        evapotranspirationMm: waterRes.evapotranspirationMm,
        drainageMm: waterRes.drainageMm,
        runoffMm: waterRes.runoffMm,
        soil: { ...currentSoil },
      });
    }

    // Accumulate metrics per year
    if (!yearlyMetrics.has(day.year)) {
      yearlyMetrics.set(day.year, {
        moistures: [],
        soms: [],
        nitrogens: [],
        erosions: [],
        waterUseMm: 0,
        stressSum: 0,
        stepCount: 0,
      });
    }
    const ym = yearlyMetrics.get(day.year)!;
    ym.moistures.push(currentSoil.soilMoisture);
    ym.soms.push(currentSoil.organicMatter);
    ym.nitrogens.push(currentSoil.nitrogen);
    ym.erosions.push(currentSoil.erosionRisk);
    ym.waterUseMm += waterRes.evapotranspirationMm;
    ym.stressSum += waterRes.waterStressFactor;
    ym.stepCount++;
  }

  // 3. Compile SimulationYear array
  const years: SimulationYear[] = [];
  const allYearMeters: MeterValues[] = [];

  for (const [year, data] of yearlyMetrics.entries()) {
    const avgMoisture = data.moistures.reduce((a, b) => a + b, 0) / data.moistures.length;
    const avgSom = data.soms.reduce((a, b) => a + b, 0) / data.soms.length;
    const avgN = data.nitrogens.reduce((a, b) => a + b, 0) / data.nitrogens.length;
    const avgErosion = data.erosions.reduce((a, b) => a + b, 0) / data.erosions.length;
    const avgStress = data.stressSum / data.stepCount;

    const plan = STANDARD_ROTATION_PLANS[strategy];
    const targetIncome = plan.rotationBySeason[0]?.targetYieldIndex ?? 100;
    const yearIncome = Math.round(targetIncome - (1.0 - avgStress) * 25);

    const yearMeter: MeterValues = {
      soilMoisture: Number(avgMoisture.toFixed(3)),
      organicMatter: Number(avgSom.toFixed(2)),
      nitrogen: Number(avgN.toFixed(1)),
      erosionRisk: Number(avgErosion.toFixed(3)),
      income: yearIncome,
      waterUse: Number(data.waterUseMm.toFixed(1)),
    };

    years.push({ year, meters: yearMeter });
    allYearMeters.push(yearMeter);
  }

  // If no weather records were provided, fallback to baseline year 2026
  if (years.length === 0) {
    const fallbackYear = 2026;
    const fallbackMeter: MeterValues = {
      soilMoisture: currentSoil.soilMoisture,
      organicMatter: currentSoil.organicMatter,
      nitrogen: currentSoil.nitrogen,
      erosionRisk: currentSoil.erosionRisk,
      income: currentSoil.relativeIncome,
      waterUse: currentSoil.cumulativeWaterUse,
    };
    years.push({ year: fallbackYear, meters: fallbackMeter });
    allYearMeters.push(fallbackMeter);
    limitations.push('No weather records provided. Output reflects un-stepped baseline initial conditions.');
  }

  // Compute final summary meters (mean of simulated years or final year)
  const finalMeters: MeterValues = {
    soilMoisture: Number((allYearMeters.reduce((s, m) => s + m.soilMoisture, 0) / allYearMeters.length).toFixed(3)),
    organicMatter: Number((allYearMeters.reduce((s, m) => s + m.organicMatter, 0) / allYearMeters.length).toFixed(2)),
    nitrogen: Number((allYearMeters.reduce((s, m) => s + m.nitrogen, 0) / allYearMeters.length).toFixed(1)),
    erosionRisk: Number((allYearMeters.reduce((s, m) => s + m.erosionRisk, 0) / allYearMeters.length).toFixed(3)),
    income: Math.round(allYearMeters.reduce((s, m) => s + m.income, 0) / allYearMeters.length),
    waterUse: Number((allYearMeters.reduce((s, m) => s + m.waterUse, 0) / allYearMeters.length).toFixed(1)),
  };

  // 4. Calculate Percentile Bands
  // Helper to compute p10, p50, p90 for an array of numbers
  function computePercentileBand(values: number[]): PercentileBand {
    if (values.length === 0) return { p10: 0, p50: 0, p90: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const getP = (p: number) => {
      const idx = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      const weight = idx - lower;
      return Number((sorted[lower] * (1 - weight) + sorted[upper] * weight).toFixed(2));
    };
    return {
      p10: getP(10),
      p50: getP(50),
      p90: getP(90),
    };
  }

  // Internal detailed per-meter distributions
  const perMeterPercentiles: Record<keyof MeterValues, PercentileBand> = {
    soilMoisture: computePercentileBand(allYearMeters.map((m) => m.soilMoisture)),
    organicMatter: computePercentileBand(allYearMeters.map((m) => m.organicMatter)),
    nitrogen: computePercentileBand(allYearMeters.map((m) => m.nitrogen)),
    erosionRisk: computePercentileBand(allYearMeters.map((m) => m.erosionRisk)),
    income: computePercentileBand(allYearMeters.map((m) => m.income)),
    waterUse: computePercentileBand(allYearMeters.map((m) => m.waterUse)),
  };

  // Composite score percentile band (relative resilience index across simulated years)
  // Weighted index: 25% moisture stability, 25% organic matter, 25% income, 25% erosion safety
  const compositeScores = allYearMeters.map((m) => {
    const moistureScore = (m.soilMoisture / 0.45) * 100;
    const somScore = (m.organicMatter / 2.5) * 100;
    const erosionScore = (1.0 - m.erosionRisk) * 100;
    return 0.3 * m.income + 0.3 * moistureScore + 0.2 * somScore + 0.2 * erosionScore;
  });
  const overallScoreBand = computePercentileBand(compositeScores);

  // 5. Generate transparent explanations
  const evaluation = explainStrategyOutcomes(strategy, finalMeters);

  // Transparent methodology disclosures
  limitations.push(
    'Rule-based decision support model, not an agronomic yield forecast or real-time farm sensor measurement.',
    `Biological nitrogen fixation is a model assumption (${config.nitrogen.legumeFixationPerSeasonKg} kg N/ha/season), not measured nodulation.`,
    'Relative income is a stylized economic index (baseline 100) penalized by crop water stress, not observed market accounting.',
    'Schema note: contracts/sim-output.ts defines p10/p50/p90 as {p10, p50, p90} PercentileBands, whereas mock JSON structures them as MeterValues. Output strictly satisfies the TypeScript contract.'
  );

  const internalResult: InternalSimulationResult = {
    strategy,
    strategyName: evaluation.strategyName,
    years,
    finalMeters,
    meterDistributions: perMeterPercentiles,
    overallScore: overallScoreBand,
    explanation: evaluation.detailedExplanation,
    limitations: [...limitations],
    stepHistory: options.recordHistory ? stepHistory : undefined,
  };

  // 6. Contract-compliant output matching contracts/sim-output.ts
  const contractOutput: SimulationOutput = {
    strategy,
    years,
    meters: finalMeters,
    // Frozen contract requires p10, p50, p90 of type PercentileBand
    p10: perMeterPercentiles.soilMoisture, // Representing primary soil moisture percentile band
    p50: overallScoreBand,                // Overall composite resilience score band
    p90: perMeterPercentiles.income,       // Economic return percentile band
    limitations: [...limitations],
  };

  return { contractOutput, internalResult };
}
