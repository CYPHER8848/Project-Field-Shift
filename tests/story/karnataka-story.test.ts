import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DECCAN_CROPS,
  DECCAN_INITIAL_METERS,
  evaluateDeccanIntercrop,
  evaluateKrishiHondiSetup,
  evaluateClimateDilemmas,
  type DeccanCrop
} from '../../src/lib/story/karnataka-rules.ts';

describe('Karnataka Dryland Agroecological Rules & Minigame Mechanics Suite', () => {
  describe('Botanical & Agronomic Trait Verification', () => {
    test('DECCAN_CROPS database adheres to authentic agronomic parameters', () => {
      const requiredCrops: DeccanCrop[] = ['ragi', 'togari', 'avare', 'hybrid_maize'];
      for (const cropId of requiredCrops) {
        const crop = DECCAN_CROPS[cropId];
        assert.ok(crop, `Crop ${cropId} must be present in DECCAN_CROPS`);
        assert.ok(crop.name && crop.name.length > 0, `${cropId} missing display name`);
        assert.ok(crop.botanicalName && crop.botanicalName.length > 0, `${cropId} missing botanical name`);
        assert.ok(crop.waterMm > 0, `${cropId} water requirement must be positive`);
        assert.ok(typeof crop.nitrogenDelta === 'number', `${cropId} nitrogenDelta must be numeric`);
        assert.ok(typeof crop.somDelta === 'number', `${cropId} somDelta must be numeric`);
      }

      // Legumes fix nitrogen; cash cereals deplete nitrogen
      assert.ok(DECCAN_CROPS.togari.nitrogenDelta > 0, 'Togari (Red Gram) must fix positive biological nitrogen');
      assert.ok(DECCAN_CROPS.avare.nitrogenDelta > 0, 'Avare (Field Bean) must fix positive biological nitrogen');
      assert.ok(DECCAN_CROPS.hybrid_maize.nitrogenDelta < 0, 'Commercial hybrid maize must be a net nitrogen drain');
      assert.ok(DECCAN_CROPS.hybrid_maize.waterMm > DECCAN_CROPS.ragi.waterMm * 1.5, 'Hybrid maize water draw must be significantly higher than hardy ragi');
    });

    test('Deccan baseline meters strictly avoid financial currency tokens', () => {
      assert.equal(typeof DECCAN_INITIAL_METERS.soilMoisture, 'number');
      assert.equal(typeof DECCAN_INITIAL_METERS.organicMatter, 'number');
      assert.equal(typeof DECCAN_INITIAL_METERS.nitrogen, 'number');
      assert.equal(typeof DECCAN_INITIAL_METERS.erosionRisk, 'number');
      assert.ok(DECCAN_INITIAL_METERS.soilMoisture < 50, 'Semi-arid Deccan dryland soil moisture must be below 50% baseline');
    });
  });

  describe('Era 1 (1990): Akkadi Saalu 4-Row Intercropping Engine', () => {
    test('validates that exactly 4 rows must be assigned', () => {
      assert.throws(() => {
        // @ts-expect-error Testing invalid row input length
        evaluateDeccanIntercrop(['ragi', 'togari']);
      }, /Expected exactly 4 row crop assignments/);
    });

    test('traditional balanced polyculture (2 Ragi, 1 Togari, 1 Avare) succeeds with high biological gains', () => {
      const rows: DeccanCrop[] = ['ragi', 'togari', 'ragi', 'avare'];
      const result = evaluateDeccanIntercrop(rows);

      assert.equal(result.isSuccess, true, 'Balanced 2 Ragi + 2 Legume rows must pass');
      assert.equal(result.legumeCount, 2);
      assert.equal(result.hybridCount, 0);
      assert.equal(result.ragiCount, 2);
      assert.ok(result.netNitrogen > 0, `Expected net nitrogen gain, got ${result.netNitrogen}`);
      assert.ok(result.netSom > 0, `Expected positive SOM buildup, got ${result.netSom}`);
      assert.ok(result.totalWaterMm <= 1400, `Total water ${result.totalWaterMm} mm must remain within dryland limit`);
      assert.ok(result.praiseSummary && result.praiseSummary.includes('Akkadi Saalu'));
    });

    test('monocropping commercial hybrid maize fails and triggers Ajja Thimmegowda reprimand', () => {
      const rows: DeccanCrop[] = ['hybrid_maize', 'hybrid_maize', 'hybrid_maize', 'hybrid_maize'];
      const result = evaluateDeccanIntercrop(rows);

      assert.equal(result.isSuccess, false, 'Four rows of hybrid maize must fail validation');
      assert.equal(result.hybridCount, 4);
      assert.equal(result.legumeCount, 0);
      assert.ok(result.netNitrogen < 0, 'Hybrid maize monoculture must show severe nitrogen deficit');
      assert.ok(result.totalWaterMm >= 2500, 'Hybrid maize water requirement exceeds dryland monsoon budget');
      assert.ok(result.reprimandReason && result.reprimandReason.includes('Commercial hybrid maize'));
    });

    test('planting only cereal ragi with fewer than 2 legume rows fails due to nitrogen deficit', () => {
      const rows: DeccanCrop[] = ['ragi', 'ragi', 'ragi', 'togari'];
      const result = evaluateDeccanIntercrop(rows);

      assert.equal(result.isSuccess, false, 'Single legume companion is insufficient for dryland soil fertility');
      assert.equal(result.legumeCount, 1);
      assert.ok(result.reprimandReason && result.reprimandReason.includes('at least two companion legume rows'));
    });
  });

  describe('Era 2 (2026): Krishi Hondi Farm Pond & Micro-Drip Engine', () => {
    test('silt-filtered pond + micro-drip + ragi straw mulch achieves optimal water conservation', () => {
      const result = evaluateKrishiHondiSetup('silt_pond', 'krishi_hondi_drip', 'ragi_straw_mulch');

      assert.equal(result.isSuccess, true, 'Integrated silt pond + drip + mulch must succeed');
      assert.equal(result.runoffCapturePercent, 85, 'Silt pond must capture 85% of monsoon surface runoff');
      assert.equal(result.waterStressReductionPercent, 70, 'Drip (45%) + mulch (25%) must reduce water stress by 70%');
      assert.equal(result.aquiferImpact, 'recharging', 'Krishi Hondi harvesting must relieve aquifer pressure');
      assert.equal(result.reprimandReason, undefined);
    });

    test('drilling 1,000+ ft borewell depletes deep basalt aquifer and triggers reprimand', () => {
      const result = evaluateKrishiHondiSetup('silt_pond', 'deep_borewell_1000ft', 'ragi_straw_mulch');

      assert.equal(result.isSuccess, false, 'Hard-rock borewell cannot be approved');
      assert.equal(result.aquiferImpact, 'depleting');
      assert.ok(result.reprimandReason && result.reprimandReason.includes('1,000 feet into Deccan hard-rock basalt'));
    });

    test('leaving soil exposed without mulch causes high evaporation failure', () => {
      const result = evaluateKrishiHondiSetup('silt_pond', 'krishi_hondi_drip', 'bare_exposed');

      assert.equal(result.isSuccess, false, 'Bare soil under Deccan sun fails mulch requirement');
      assert.ok(result.reprimandReason && result.reprimandReason.includes('Leaving red soil exposed'));
    });
  });

  describe('Era 3 (2040): Climate Dilemmas & Farmer Sovereignty Engine', () => {
    test('all three correct sovereign farmer decisions achieve 100% score', () => {
      const answers = [1, 1, 1];
      const result = evaluateClimateDilemmas(answers);

      assert.equal(result.isAllAnswered, true);
      assert.equal(result.isSuccess, true);
      assert.equal(result.correctCount, 3);
      assert.equal(result.totalQuestions, 3);
      for (const item of result.breakdown) {
        assert.equal(item.isCorrect, true);
      }
    });

    test('selecting corporate credit or algorithmic tree-clearing triggers generational failure', () => {
      const answers = [0, 1, 0]; // 2 wrong answers
      const result = evaluateClimateDilemmas(answers);

      assert.equal(result.isAllAnswered, true);
      assert.equal(result.isSuccess, false);
      assert.equal(result.correctCount, 1);
      assert.equal(result.breakdown[0].isCorrect, false);
      assert.equal(result.breakdown[1].isCorrect, true);
      assert.equal(result.breakdown[2].isCorrect, false);
    });

    test('unanswered dilemmas fail completion check', () => {
      const answers = [1, null, 1];
      const result = evaluateClimateDilemmas(answers);

      assert.equal(result.isAllAnswered, false);
      assert.equal(result.isSuccess, false);
    });
  });
});
