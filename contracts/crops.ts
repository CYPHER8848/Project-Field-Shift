export type CropCategory = 'cereal' | 'pulse' | 'oilseed' | 'cover';
export interface CropProfile {
  id: string; name: string; category: CropCategory; growingDays: number; waterDemandMm: number;
  heatSensitivity: 'low' | 'medium' | 'high'; soilCover: 'low' | 'medium' | 'high';
  nitrogenFixing: boolean; notes: string;
}
export interface CropCatalog { regionId: string; source: 'curated' | 'mock'; crops: CropProfile[]; }