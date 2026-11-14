/**
 * Frozen Phase 0 contract — transparent simulation output.
 * The model is a rule-based decision aid, not a yield forecast.
 */
export type StrategyId = "existing_rotation" | "resilience_rotation" | "income_rotation";

export interface MeterValues {
  soilMoisture: number;
  organicMatter: number;
  nitrogen: number;
  erosionRisk: number;
  income: number;
  waterUse: number;
}

export interface SimulationYear {
  year: number;
  meters: MeterValues;
}

export interface PercentileBand {
  p10: number;
  p50: number;
  p90: number;
}

export interface SimulationOutput {
  strategy: StrategyId;
  years: SimulationYear[];
  meters: MeterValues;
  p10: PercentileBand;
  p50: PercentileBand;
  p90: PercentileBand;
  limitations: string[];
}
