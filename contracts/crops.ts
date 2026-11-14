/**
 * Frozen Phase 0 contract — curated crop trait table.
 * Traits are decision-model inputs, not universal agronomic constants.
 * Values and sources are populated by the data/science lead in Phase 1.
 */
export type CropSeason = "kharif" | "rabi" | "zaid" | "spring" | "summer" | "autumn" | "winter" | "year_round";

export interface CropTraits {
  id: string;
  name: string;
  waterUse: number;
  nitrogenFixation: boolean;
  rootingDepth: number;
  coverValue: number;
  season: CropSeason[];
  waterUseUnit: "mm_per_growing_season";
  rootingDepthUnit: "cm";
  coverValueScale: "0_to_1";
  sources: string[];
  notes?: string;
}

/** Shared crop catalogue; region suitability is handled by the region/crop mapping. */
export type CropCatalog = CropTraits[];
