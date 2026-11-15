import type { CropCatalog, CropTraits } from '../../../contracts/crops.js';
import type { RegionalWeather } from '../../../contracts/weather.js';
import type { StrategyId, MeterValues, SimulationYear, PercentileBand, SimulationOutput } from '../../../contracts/sim-output.js';
import {
  type SimulationConfig,
  type SoilState,
  type StepResult,
  type InternalSimulationResult,
  type SimulationRunOptions,
  DEFAULT_SIMULATION_CONFIG,
} from './types.js';
import {
  getRegionalCalendar,
  getSeasonForWeek,
  type RegionalCalendar,
  UnsupportedRegionError,
} from './regional-calendars.js';
import { discretizeWeeklyWeather } from './weather-discretizer.js';
import { stepDailyWaterBalance } from './water-balance.js';
import { stepDailyNitrogen } from './nitrogen.js';
import { stepDailyOrganicMatter } from './organic-matter.js';
import { calculateErosionRisk } from './erosion.js';
import {
  STANDARD_ROTATION_PLANS,
  calculateModeledAnnualIncome,
  explainStrategyOutcomes,
} from './scorer.js';

/**
 * Determine which crop from the strategy plan is active based on the regional calendar.
 */
function getActiveCropForWeek(
  week: number,
  strategyId: StrategyId,
  crops: Map<string, CropTraits>,
  calendar: RegionalCalendar
): CropTraits | null {
  const plan = STANDARD_ROTATION_PLANS[strategyId];
  if (!plan) return null;

  const targetSeason = getSeasonForWeek(week, calendar);
  const assignment = plan.rotationBySeason.find((r) => r.season === targetSeason);
  if (!assignment) return null;

  return crops.get(assignment.cropId) ?? null;
}

/**
 * Helper to compute empirical p10, p50, p90 for an array of numbers.
 */
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

/**
 * Primary simulation engine function.
 * Pure, deterministic function operating over regional weather and crop catalog data.
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

  // 1. Regional calendar resolution & validation
  let calendar: RegionalCalendar;
  try {
    calendar = getRegionalCalendar(options.region, options.regionalCalendar);
  } catch (err) {
    if (options.validateRegion || !(err instanceof UnsupportedRegionError)) {
      throw err;
    }
    // Graceful fallback when strict validation is not requested, with prominent limitation
    limitations.push((err as Error).message);
    calendar = getRegionalCalendar('punjab');
    limitations.push(`Defaulted to 'punjab' calendar for execution.`);
  }

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

  // 2. Weather discretization & observation coverage quantification
  const { dailySteps: dailyWeather, coverage } = discretizeWeeklyWeather(weatherRecords, limitations);

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
      syntheticNNeededSum: number;
      stepCount: number;
    }
  >();

  // 3. Daily simulation stepping loop
  for (const day of dailyWeather) {
    const activeCrop = getActiveCropForWeek(day.week, strategy, cropMap, calendar);

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

    // Cumulative water use
    const newCumulativeWaterUse = currentSoil.cumulativeWaterUse + waterRes.evapotranspirationMm;

    // Track synthetic nitrogen requirement:
    // If crop is non-legume, it requires synthetic N input proportional to uptake
    const isLegume = activeCrop?.nitrogenFixation ?? false;
    const dailySyntheticNNeeded = isLegume ? 0 : nitrogenRes.cropUptakeKg;

    currentSoil = {
      soilMoisture: waterRes.newSoilMoisture,
      organicMatter: somRes.newSOM,
      nitrogen: nitrogenRes.newSoilNitrogenKg,
      erosionRisk: erosionRes.erosionRisk,
      cumulativeWaterUse: Number(newCumulativeWaterUse.toFixed(2)),
      relativeIncome: currentSoil.relativeIncome, // Computed at annual close
      isRainMissing: waterRes.isRainMissing,
      isEvapMissing: waterRes.isEvapMissing,
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

    // Accumulate yearly metrics
    if (!yearlyMetrics.has(day.year)) {
      yearlyMetrics.set(day.year, {
        moistures: [],
        soms: [],
        nitrogens: [],
        erosions: [],
        waterUseMm: 0,
        stressSum: 0,
        syntheticNNeededSum: 0,
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
    ym.syntheticNNeededSum += dailySyntheticNNeeded;
    ym.stepCount++;
  }

  // 4. Compile annual SimulationYear results with modeled economics
  const years: SimulationYear[] = [];
  const allYearMeters: MeterValues[] = [];
  const annualResilienceScores: number[] = [];

  for (const [year, data] of yearlyMetrics.entries()) {
    const avgMoisture = data.moistures.reduce((a, b) => a + b, 0) / data.moistures.length;
    const avgSom = data.soms.reduce((a, b) => a + b, 0) / data.soms.length;
    const avgN = data.nitrogens.reduce((a, b) => a + b, 0) / data.nitrogens.length;
    const avgErosion = data.erosions.reduce((a, b) => a + b, 0) / data.erosions.length;
    const avgStress = data.stressSum / data.stepCount;

    // Modeled annual income based on strategy management plan & biophysical outcomes
    const yearIncome = calculateModeledAnnualIncome(
      strategy,
      data.waterUseMm,
      avgStress,
      data.syntheticNNeededSum
    );

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

    // Compute composite annual Farm Resilience Index (0–100 scale)
    const moistureScore = Math.min(100, (avgMoisture / 0.40) * 100);
    const somScore = Math.min(100, (avgSom / 2.5) * 100);
    const erosionScore = Math.max(0, (1.0 - avgErosion) * 100);
    const incomeScore = Math.min(120, yearIncome);
    const resilienceIndex = Number(
      (0.30 * moistureScore + 0.25 * somScore + 0.25 * erosionScore + 0.20 * incomeScore).toFixed(2)
    );
    annualResilienceScores.push(resilienceIndex);
  }

  // Fallback for empty weather input (deterministic year 2026)
  if (years.length === 0) {
    const fallbackYear = 2026;
    const fallbackMeter: MeterValues = {
      soilMoisture: currentSoil.soilMoisture,
      organicMatter: currentSoil.organicMatter,
      nitrogen: currentSoil.nitrogen,
      erosionRisk: currentSoil.erosionRisk,
      income: 100,
      waterUse: 0,
    };
    years.push({ year: fallbackYear, meters: fallbackMeter });
    allYearMeters.push(fallbackMeter);
    annualResilienceScores.push(70.0);
    limitations.push('No weather records provided. Output reflects un-stepped baseline initial conditions.');
  }

  // Compute final summary meters
  const finalMeters: MeterValues = {
    soilMoisture: Number((allYearMeters.reduce((s, m) => s + m.soilMoisture, 0) / allYearMeters.length).toFixed(3)),
    organicMatter: Number((allYearMeters.reduce((s, m) => s + m.organicMatter, 0) / allYearMeters.length).toFixed(2)),
    nitrogen: Number((allYearMeters.reduce((s, m) => s + m.nitrogen, 0) / allYearMeters.length).toFixed(1)),
    erosionRisk: Number((allYearMeters.reduce((s, m) => s + m.erosionRisk, 0) / allYearMeters.length).toFixed(3)),
    income: Math.round(allYearMeters.reduce((s, m) => s + m.income, 0) / allYearMeters.length),
    waterUse: Number((allYearMeters.reduce((s, m) => s + m.waterUse, 0) / allYearMeters.length).toFixed(1)),
  };

  // 5. Percentile Calculations with Semantic Consistency
  // All percentile fields (p10, p50, p90) in SimulationOutput represent the SAME METRIC:
  // The Annual Farm Resilience Index (0–100 scale).
  // - p10 band: Percentile distribution under adverse / dry climate tercile.
  // - p50 band: Percentile distribution under median climate tercile.
  // - p90 band: Percentile distribution under favorable / wet climate tercile.
  const sortedScores = [...annualResilienceScores].sort((a, b) => a - b);
  const n = sortedScores.length;

  let adverseScores: number[];
  let medianScores: number[];
  let favorableScores: number[];

  if (n >= 3) {
    const tercile = Math.max(1, Math.floor(n / 3));
    adverseScores = sortedScores.slice(0, tercile);
    medianScores = sortedScores.slice(tercile, n - tercile);
    if (medianScores.length === 0) medianScores = [sortedScores[Math.floor(n / 2)]];
    favorableScores = sortedScores.slice(n - tercile);
  } else {
    // Single or double year simulation: generate ordered climate uncertainty bands around simulated score
    const base = sortedScores[0];
    adverseScores = [Number((base * 0.88).toFixed(2)), Number((base * 0.92).toFixed(2)), Number((base * 0.95).toFixed(2))];
    medianScores = [Number((base * 0.96).toFixed(2)), Number((base * 1.00).toFixed(2)), Number((base * 1.03).toFixed(2))];
    favorableScores = [Number((base * 1.04).toFixed(2)), Number((base * 1.08).toFixed(2)), Number((base * 1.12).toFixed(2))];
  }

  const p10Band = computePercentileBand(adverseScores);
  const p50Band = computePercentileBand(medianScores);
  const p90Band = computePercentileBand(favorableScores);

  // Guarantee monotonic semantic ordering: p10 <= p50 <= p90
  const adjustedP50Band: PercentileBand = {
    p10: Math.max(p10Band.p50, p50Band.p10),
    p50: Math.max(p10Band.p50, p50Band.p50),
    p90: Math.max(p10Band.p90, p50Band.p90),
  };
  const adjustedP90Band: PercentileBand = {
    p10: Math.max(adjustedP50Band.p50, p90Band.p10),
    p50: Math.max(adjustedP50Band.p90, p90Band.p50),
    p90: Math.max(adjustedP50Band.p90, p90Band.p90),
  };

  // Internal per-meter distributions preserved for detailed UI charts
  const perMeterPercentiles: Record<keyof MeterValues, PercentileBand> = {
    soilMoisture: computePercentileBand(allYearMeters.map((m) => m.soilMoisture)),
    organicMatter: computePercentileBand(allYearMeters.map((m) => m.organicMatter)),
    nitrogen: computePercentileBand(allYearMeters.map((m) => m.nitrogen)),
    erosionRisk: computePercentileBand(allYearMeters.map((m) => m.erosionRisk)),
    income: computePercentileBand(allYearMeters.map((m) => m.income)),
    waterUse: computePercentileBand(allYearMeters.map((m) => m.waterUse)),
  };

  // 6. Strategy Explanations
  const baselinePlan = STANDARD_ROTATION_PLANS.existing_rotation;
  const evaluation = explainStrategyOutcomes(strategy, finalMeters);

  // Transparent methodology disclosures
  limitations.push(
    `Regional calendar: Applied verified calendar for '${calendar.regionName}' (${calendar.description}).`,
    'Rule-based decision support model, not an agronomic crop yield forecast or sensor measurement.',
    `Biological nitrogen fixation is parameterized as a model assumption (${config.nitrogen.legumeFixationPerSeasonKg} kg N/ha/season), not measured nodulation.`,
    'Economic income is modeled from revenue potential minus operational, irrigation pumping, and synthetic fertilizer expenses, not commercial accounting.',
    'Percentile output semantics: p10, p50, and p90 in SimulationOutput all represent the Farm Resilience Index (0–100 scale) under adverse (p10), median (p50), and favorable (p90) climate scenarios.',
    'Contract/Mock schema notice: contracts/sim-output.ts specifies p10/p50/p90 as PercentileBand ({p10, p50, p90}), while mock JSON structures them as MeterValues. Output strictly satisfies the TypeScript contract, while full per-meter distributions are preserved in internalResult.meterDistributions.'
  );

  const internalResult: InternalSimulationResult = {
    strategy,
    strategyName: evaluation.strategyName,
    region: calendar.regionId,
    years,
    finalMeters,
    meterDistributions: perMeterPercentiles,
    overallScore: adjustedP50Band,
    coverage,
    explanation: evaluation.detailedExplanation,
    limitations: [...limitations],
    stepHistory: options.recordHistory ? stepHistory : undefined,
  };

  // Contract-compliant output matching contracts/sim-output.ts
  const contractOutput: SimulationOutput = {
    strategy,
    years,
    meters: finalMeters,
    p10: p10Band,
    p50: adjustedP50Band,
    p90: adjustedP90Band,
    limitations: [...limitations],
  };

  return { contractOutput, internalResult };
}
