/**
 * Karnataka Deccan Dryland Agroecological Rules & Minigame Engine
 * 
 * Implements the biophysical principles for the semi-arid Karnataka dryland plateau:
 * 1. Era 1 (1990): 4-Row Deccan Millets & Legumes Intercropping vs Hybrid Monoculture
 * 2. Era 2 (2026): Hard-rock Basalt Borewell Depletion vs Krishi Hondi Farm Pond Silt Sluices & Micro-Drip
 * 3. Era 3 (2040): +2.2°C Dryland Warming, Native Landrace Sovereignty, & Algorithmic Decision Ethics
 */

export type DeccanCrop = 'ragi' | 'togari' | 'avare' | 'hybrid_maize';

export interface DeccanCropOption {
  id: DeccanCrop;
  name: string;
  botanicalName: string;
  tag: string;
  nitrogenDelta: number; // kg N / ha equivalent
  somDelta: number;      // SOM % impact index
  waterMm: number;       // Seasonal crop water requirement in mm
  description: string;
}

export const DECCAN_CROPS: Record<DeccanCrop, DeccanCropOption> = {
  ragi: {
    id: 'ragi',
    name: 'Finger Millet (Ragi)',
    botanicalName: 'Eleusine coracana',
    tag: 'Indigenous Cereal',
    nitrogenDelta: +4,
    somDelta: +8,
    waterMm: 350,
    description: 'Fibrous silica roots puncture red soil hardpan; high calcium drought survivor'
  },
  togari: {
    id: 'togari',
    name: 'Red Gram (Togari Bele)',
    botanicalName: 'Cajanus cajan',
    tag: 'Deep Taproot Legume',
    nitrogenDelta: +18,
    somDelta: +10,
    waterMm: 380,
    description: 'Deep 1.8m taproot mines subsoil moisture; fixes 40 kg biological N/ha'
  },
  avare: {
    id: 'avare',
    name: 'Field Bean (Avarekai)',
    botanicalName: 'Lablab purpureus',
    tag: 'Moisture Cover Legume',
    nitrogenDelta: +14,
    somDelta: +12,
    waterMm: 280,
    description: 'Dense trailing foliage cushions raindrop impact and halts sheet wash'
  },
  hybrid_maize: {
    id: 'hybrid_maize',
    name: 'Commercial Hybrid Maize',
    botanicalName: 'Zea mays',
    tag: 'High-Demand Cash Crop',
    nitrogenDelta: -16,
    somDelta: -8,
    waterMm: 680,
    description: 'Heavy chemical feeder; drains soil reserves and leaves slopes bare after harvest'
  }
};

export interface IntercropEvaluationResult {
  legumeCount: number;
  hybridCount: number;
  ragiCount: number;
  netNitrogen: number;
  netSom: number;
  totalWaterMm: number;
  isSuccess: boolean;
  reprimandReason?: string;
  praiseSummary?: string;
}

/**
 * Evaluates the 4-Row Deccan intercropping configuration (1990 Era)
 * Traditional wisdom demands at least 2 legume companion rows (Togari/Avare)
 * and zero water-guzzling commercial hybrid maize monoculture.
 */
export function evaluateDeccanIntercrop(rowCrops: DeccanCrop[]): IntercropEvaluationResult {
  if (rowCrops.length !== 4) {
    throw new Error(`Expected exactly 4 row crop assignments, received ${rowCrops.length}`);
  }

  const legumeCount = rowCrops.filter(c => c === 'togari' || c === 'avare').length;
  const hybridCount = rowCrops.filter(c => c === 'hybrid_maize').length;
  const ragiCount = rowCrops.filter(c => c === 'ragi').length;

  const netNitrogen = rowCrops.reduce((acc, c) => acc + DECCAN_CROPS[c].nitrogenDelta, 0);
  const netSom = rowCrops.reduce((acc, c) => acc + DECCAN_CROPS[c].somDelta, 0);
  const totalWaterMm = rowCrops.reduce((acc, c) => acc + DECCAN_CROPS[c].waterMm, 0);

  const isSuccess = legumeCount >= 2 && hybridCount === 0;

  let reprimandReason: string | undefined;
  let praiseSummary: string | undefined;

  if (!isSuccess) {
    if (hybridCount > 0) {
      reprimandReason = 'Commercial hybrid maize demands 680mm of water and drains soil nutrients. In rain-fed Deccan red soil, monocropping hybrid maize without legumes risks total harvest collapse during dry spells.';
    } else if (legumeCount < 2) {
      reprimandReason = 'You need at least two companion legume rows (Red Gram Togari or Field Bean Avare) to fix atmospheric nitrogen and provide vegetative cover for soil moisture.';
    }
  } else {
    praiseSummary = `Exemplary Akkadi Saalu intercropping! ${ragiCount} rows of hardy Ragi paired with ${legumeCount} rows of nitrogen-fixing pulses fixes +${netNitrogen} kg N/ha within a modest ${totalWaterMm}mm water budget.`;
  }

  return {
    legumeCount,
    hybridCount,
    ragiCount,
    netNitrogen,
    netSom,
    totalWaterMm,
    isSuccess,
    reprimandReason,
    praiseSummary
  };
}

export type CatchmentSetup = 'bare_channel' | 'trench_bund' | 'silt_pond';
export type WaterSource = 'deep_borewell_1000ft' | 'krishi_hondi_drip' | 'diesel_tanker';
export type MulchPractice = 'bare_exposed' | 'ragi_straw_mulch';

export interface KrishiHondiEvaluationResult {
  isSuccess: boolean;
  runoffCapturePercent: number;
  waterStressReductionPercent: number;
  aquiferImpact: 'depleting' | 'recharging' | 'neutral';
  reprimandReason?: string;
}

/**
 * Evaluates the 2026 Water Harvesting & Hard-rock Aquifer Management
 * Sustainable path: Krishi Hondi pond with silt trap, gravity micro-drip, and ragi straw mulch.
 */
export function evaluateKrishiHondiSetup(
  catchment: CatchmentSetup,
  source: WaterSource,
  mulch: MulchPractice
): KrishiHondiEvaluationResult {
  const isSuccess = 
    catchment === 'silt_pond' && 
    source === 'krishi_hondi_drip' && 
    mulch === 'ragi_straw_mulch';

  let runoffCapturePercent = 15;
  if (catchment === 'trench_bund') runoffCapturePercent = 50;
  if (catchment === 'silt_pond') runoffCapturePercent = 85;

  let waterStressReductionPercent = 0;
  if (source === 'krishi_hondi_drip') waterStressReductionPercent += 45;
  if (mulch === 'ragi_straw_mulch') waterStressReductionPercent += 25;

  let aquiferImpact: 'depleting' | 'recharging' | 'neutral' = 'neutral';
  if (source === 'deep_borewell_1000ft') aquiferImpact = 'depleting';
  else if (catchment === 'silt_pond' && source === 'krishi_hondi_drip') aquiferImpact = 'recharging';

  let reprimandReason: string | undefined;
  if (!isSuccess) {
    if (source === 'deep_borewell_1000ft') {
      reprimandReason = 'Drilling deeper than 1,000 feet into Deccan hard-rock basalt causes pump cavitation, arsenic/fluoride mobilization, and accelerates regional aquifer loss.';
    } else if (catchment !== 'silt_pond') {
      reprimandReason = 'Without a dedicated Krishi Hondi farm pond with an inlet silt trap, monsoon runoff washes away rich red topsoil into roadside ravines.';
    } else if (mulch !== 'ragi_straw_mulch') {
      reprimandReason = 'Leaving red soil exposed under high sun bakes the surface crust and evaporates 40% of applied irrigation water within 48 hours.';
    }
  }

  return {
    isSuccess,
    runoffCapturePercent,
    waterStressReductionPercent,
    aquiferImpact,
    reprimandReason
  };
}

export interface DilemmaAnswer {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface DilemmaEvaluationResult {
  isAllAnswered: boolean;
  isSuccess: boolean;
  correctCount: number;
  totalQuestions: number;
  breakdown: DilemmaAnswer[];
}

/**
 * Evaluates the 2040 Climate Adaptation & Farmer Sovereignty Dilemmas
 * Option 1 is the sovereign, agroecologically grounded choice for all 3 dilemmas.
 */
export function evaluateClimateDilemmas(
  answers: (number | null)[]
): DilemmaEvaluationResult {
  const totalQuestions = 3;
  const isAllAnswered = answers.length === totalQuestions && answers.every(a => a !== null);

  const breakdown: DilemmaAnswer[] = answers.map((ans, idx) => ({
    questionIndex: idx,
    selectedOption: ans ?? -1,
    isCorrect: ans === 1
  }));

  const correctCount = breakdown.filter(b => b.isCorrect).length;
  const isSuccess = isAllAnswered && correctCount === totalQuestions;

  return {
    isAllAnswered,
    isSuccess,
    correctCount,
    totalQuestions,
    breakdown
  };
}

export const DECCAN_INITIAL_METERS = {
  soilMoisture: 38,
  organicMatter: 42,
  nitrogen: 48,
  erosionRisk: 38,
  income: 150,
  waterUse: 320
} as const;
