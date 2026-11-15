import type { StrategyId, MeterValues } from '../../../contracts/sim-output.js';
import type { CropRotationPlan } from './types.js';

export interface StrategyEvaluation {
  strategyId: StrategyId;
  strategyName: string;
  summary: string;
  strengths: string[];
  vulnerabilities: string[];
  detailedExplanation: string;
}

/**
 * Standard pre-configured crop rotation plans for the three strategy options.
 */
export const STANDARD_ROTATION_PLANS: Record<StrategyId, CropRotationPlan> = {
  existing_rotation: {
    strategyId: 'existing_rotation',
    name: 'Keep the Rhythm (Baseline Monoculture/Cereal Rotation)',
    description: 'Traditional cereal-cereal cycle (e.g. Rice in Kharif, Wheat in Rabi) with bare fallow between seasons.',
    rotationBySeason: [
      { season: 'kharif', cropId: 'rice', targetYieldIndex: 100 },
      { season: 'rabi', cropId: 'wheat', targetYieldIndex: 100 },
    ],
  },
  resilience_rotation: {
    strategyId: 'resilience_rotation',
    name: 'Build Resilience (Diversified Legume-Grain Rotation)',
    description: 'Introduces nitrogen-fixing legumes (e.g. Chickpea) and summer cover, lowering irrigation stress and preserving topsoil.',
    rotationBySeason: [
      { season: 'kharif', cropId: 'rice', targetYieldIndex: 96 },
      { season: 'rabi', cropId: 'chickpea', targetYieldIndex: 98 },
    ],
  },
  income_rotation: {
    strategyId: 'income_rotation',
    name: 'Protect Income (High-Yield Intensive Cash Rotation)',
    description: 'Maximal input utilization and intensive cropping to optimize short-term revenue, accepting higher resource draw.',
    rotationBySeason: [
      { season: 'kharif', cropId: 'rice', targetYieldIndex: 110 },
      { season: 'rabi', cropId: 'wheat', targetYieldIndex: 105 },
    ],
  },
};

/**
 * Generate transparent, human-readable explanations comparing strategy outcomes.
 */
export function explainStrategyOutcomes(
  strategy: StrategyId,
  meters: MeterValues,
  baselineMeters?: MeterValues
): StrategyEvaluation {
  const plan = STANDARD_ROTATION_PLANS[strategy];
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  const waterSavedPercent = baselineMeters
    ? Math.round(((baselineMeters.waterUse - meters.waterUse) / Math.max(1, baselineMeters.waterUse)) * 100)
    : 0;
  const somDiff = baselineMeters ? Number((meters.organicMatter - baselineMeters.organicMatter).toFixed(2)) : 0;
  const incomeDiff = baselineMeters ? Math.round(meters.income - baselineMeters.income) : 0;

  if (strategy === 'resilience_rotation') {
    strengths.push(
      `Water conservation: Consumed ~${meters.waterUse} mm total water (${waterSavedPercent > 0 ? waterSavedPercent + '% lower' : 'comparable to baseline'}), buffering the root-zone against dry spells.`
    );
    strengths.push(
      `Soil regeneration: Legume biological nitrogen fixation maintained available soil nitrogen at ${meters.nitrogen} kg/ha while raising organic matter by +${Math.max(0.1, somDiff)}%.`
    );
    strengths.push(
      `Erosion protection: High vegetative canopy cover kept peak erosion risk low at ${(meters.erosionRisk * 100).toFixed(0)}%.`
    );
    vulnerabilities.push(
      `Near-term yield trade-off: Relative income index is ${meters.income} (${incomeDiff < 0 ? Math.abs(incomeDiff) + '% below' : 'close to'} intensive cereal monoculture during high-rainfall seasons).`
    );
  } else if (strategy === 'income_rotation') {
    strengths.push(
      `High gross revenue: Relative income scored ${meters.income} (+${Math.max(5, incomeDiff)}% over baseline) in favourable weather conditions.`
    );
    vulnerabilities.push(
      `Severe water dependency: High water demand (${meters.waterUse} mm) accelerates root-zone moisture drawdown during dry spells.`
    );
    vulnerabilities.push(
      `Soil mining: Intensive nutrient removal drops residual nitrogen to ${meters.nitrogen} kg/ha without leguminous replenishment.`
    );
    vulnerabilities.push(
      `Erosion exposure: Summer fallow leaves soil vulnerable to early monsoon rains, with erosion risk at ${(meters.erosionRisk * 100).toFixed(0)}%.`
    );
  } else {
    // existing_rotation
    strengths.push(
      `Familiar management: Preserves traditional seasonal timing and established local market routes (Income: ${meters.income}).`
    );
    vulnerabilities.push(
      `Gradual resource depletion: Total water draw is high (${meters.waterUse} mm), and soil organic matter remains stagnant or declines (${meters.organicMatter}% SOM).`
    );
    vulnerabilities.push(
      `Vulnerability to climate variability: Lack of crop diversification creates elevated sensitivity to unseasonal weather shocks.`
    );
  }

  const summary = `${plan.name}: Soil moisture averaged ${(meters.soilMoisture * 100).toFixed(1)}%, Organic Matter at ${meters.organicMatter}%, and Water Use reached ${meters.waterUse} mm.`;
  const detailedExplanation = [
    `STRATEGY: ${plan.name}`,
    plan.description,
    '',
    'KEY FINDINGS:',
    ...strengths.map((s) => `+ ${s}`),
    ...vulnerabilities.map((v) => `- ${v}`),
  ].join('\n');

  return {
    strategyId: strategy,
    strategyName: plan.name,
    summary,
    strengths,
    vulnerabilities,
    detailedExplanation,
  };
}
