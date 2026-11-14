export interface ScenarioInput {
  id: string; label: string; cropSequence: string[];
  irrigationStrategy: 'rainfed' | 'supplemental' | 'irrigated';
}
export interface ScenarioYear {
  year: number; waterStressIndex: number; heatStressDays: number;
  soilCoverScore: number; relativeIncomeIndex: number;
}
export interface ScenarioResult {
  scenario: ScenarioInput; years: ScenarioYear[];
  uncertainty: { low: number; central: number; high: number };
  limitations: string[]; isForecast: false;
}