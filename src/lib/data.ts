/**
 * Typed data layer for the Phase 0 frontend.
 * Everything here is SYNTHETIC placeholder data (see README "Data integrity");
 * contracts/ holds the frozen Phase 0 types the simulation pipeline will fill.
 */
import type { CropCatalog } from '../../contracts/crops';
import type { MeterValues, SimulationOutput, StrategyId } from '../../contracts/sim-output';
import type { RegionalWeather } from '../../contracts/weather';
import cropsJson from './mock/crops.json';
import simExistingJson from './mock/sim-output-existing.json';
import simIncomeJson from './mock/sim-output-income.json';
import simResilienceJson from './mock/sim-output.json';
import weatherPunjabJson from './mock/weather-punjab.json';

export const crops = cropsJson as unknown as CropCatalog;
export const weatherPunjab = weatherPunjabJson as unknown as RegionalWeather;

export const sims: Record<StrategyId, SimulationOutput> = {
  existing_rotation: simExistingJson as unknown as SimulationOutput,
  resilience_rotation: simResilienceJson as unknown as SimulationOutput,
  income_rotation: simIncomeJson as unknown as SimulationOutput
};

/** Horizon years available across all strategy outputs, ascending. */
export const horizons: number[] = [...new Set(Object.values(sims).flatMap((s) => s.years.map((y) => y.year)))].sort(
  (a, b) => a - b
);

export type MeterKey = keyof MeterValues;

export interface MeterMeta {
  key: MeterKey;
  label: string;
  /** Provisional display unit; the simulation contract does not yet fix units. */
  unit: string;
  digits: number;
}

/** Display order and provisional units. Synthetic until the sim contract fixes them. */
export const METERS: MeterMeta[] = [
  { key: 'soilMoisture', label: 'Soil moisture', unit: 'fraction', digits: 2 },
  { key: 'organicMatter', label: 'Organic matter', unit: 'provisional', digits: 1 },
  { key: 'nitrogen', label: 'Nitrogen', unit: 'provisional', digits: 0 },
  { key: 'erosionRisk', label: 'Erosion risk', unit: '0–1 index', digits: 2 },
  { key: 'waterUse', label: 'Water use', unit: 'mm/season', digits: 0 },
  { key: 'income', label: 'Income', unit: 'index, 2026 = 100', digits: 0 }
];

/** Meters shown without a band edge clipped: spans every strategy, year, and percentile. */
function computeExtents(): Record<MeterKey, { min: number; max: number }> {
  const out = {} as Record<MeterKey, { min: number; max: number }>;
  for (const m of METERS) {
    let min = Infinity;
    let max = -Infinity;
    for (const s of Object.values(sims)) {
      for (const y of s.years) {
        min = Math.min(min, y.meters[m.key]);
        max = Math.max(max, y.meters[m.key]);
      }
      min = Math.min(min, s.p10[m.key]);
      max = Math.max(max, s.p90[m.key]);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    if (max - min < 1e-9) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.06;
    out[m.key] = { min: min - pad, max: max + pad };
  }
  return out;
}

export const meterExtents = computeExtents();

export function metersAt(id: StrategyId, year: number): MeterValues {
  return sims[id].years.find((y) => y.year === year)?.meters ?? sims[id].meters;
}

export interface RegionOption {
  id: string;
  label: string;
  /** Illustrative art palette only — carries no data meaning. */
  sky: string;
  soil: string;
  furrow: string;
  crop: string;
  sun: string;
}

export const REGIONS: RegionOption[] = [
  { id: 'punjab', label: 'Punjab, India', sky: '#dce5c9', soil: '#9a815b', furrow: '#d4b987', crop: '#486c42', sun: '#e8b95c' },
  { id: 'iowa', label: 'Iowa, USA', sky: '#d9e4dc', soil: '#8a6f52', furrow: '#c9b183', crop: '#3f6b3a', sun: '#e0a94e' },
  { id: 'karnataka', label: 'Karnataka, India', sky: '#e6e2cd', soil: '#a2603f', furrow: '#cf9a6b', crop: '#51713f', sun: '#dfae55' },
  {
    id: 'sahel',
    label: 'Sahel / Kenya (site to be confirmed)',
    sky: '#e9e3cf',
    soil: '#b08d55',
    furrow: '#d9c08a',
    crop: '#7c7f3f',
    sun: '#dfa63e'
  }
];

export function regionById(id: string): RegionOption {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}

/** One file per region per the weather contract; only the Punjab mock exists in Phase 0. */
export function weatherFor(regionId: string): RegionalWeather | null {
  return regionId === 'punjab' ? weatherPunjab : null;
}
