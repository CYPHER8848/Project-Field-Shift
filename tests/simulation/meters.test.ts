import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Agricultural Meters & Science Boundaries Unit Suite', () => {
  test('soil moisture meter accurately reflects root-zone hydration without negative values', () => {
    const calcMoisture = (current: number, rain: number, evap: number) => {
      const net = rain - evap;
      return Math.max(0, Math.min(100, current + net * 0.4));
    };

    assert.equal(calcMoisture(50, 20, 10), 54);
    assert.equal(calcMoisture(10, 0, 50), 0, 'Drought must clamp at 0% wilting point');
    assert.equal(calcMoisture(95, 80, 5), 100, 'Heavy rain must clamp at 100% saturation');
  });

  test('soil organic matter (SOM) accumulates with cover crops and oxidizes under bare fallow', () => {
    const updateSOM = (som: number, hasCover: boolean) => {
      // Annual change rate: +0.15% with cover, -0.08% with bare fallow
      const delta = hasCover ? 0.15 : -0.08;
      return Math.max(0.1, Number((som + delta).toFixed(2)));
    };

    let som = 1.20;
    som = updateSOM(som, true);
    assert.equal(som, 1.35, 'Cover crop must accumulate SOM');
    som = updateSOM(som, false);
    assert.equal(som, 1.27, 'Bare fallow must deplete SOM');
  });

  test('biological nitrogen fixation (BNF) provides positive gain only for legumes', () => {
    const calcNitrogenGain = (cropId: string) => {
      const legumeMap: Record<string, number> = {
        moong_bean: 35,
        chickpea: 40,
        cowpea: 38,
        soybean: 45,
        pigeonpea: 42
      };
      return legumeMap[cropId] ?? 0;
    };

    assert.ok(calcNitrogenGain('moong_bean') > 30, 'Moong bean must fix biological nitrogen');
    assert.ok(calcNitrogenGain('chickpea') > 30, 'Chickpea must fix biological nitrogen');
    assert.equal(calcNitrogenGain('rice_paddy'), 0, 'Rice paddy must provide zero biological nitrogen fixation');
    assert.equal(calcNitrogenGain('wheat'), 0, 'Wheat cereal must provide zero biological nitrogen fixation');
  });

  test('erosion risk proxy is strictly suppressed by high vegetative cover values', () => {
    const calcErosionRisk = (coverValue: number, slopeFactor = 0.5) => {
      // RUSLE C-factor proxy: higher coverValue dampens risk
      const cFactor = 1.0 - coverValue;
      return Math.max(0.0, Math.min(1.0, Number((cFactor * slopeFactor).toFixed(2))));
    };

    const bareFallowRisk = calcErosionRisk(0.0);
    const coverCropRisk = calcErosionRisk(0.90); // Winter rye / cowpea
    assert.ok(coverCropRisk < bareFallowRisk, 'Cover crop must substantially reduce erosion risk compared to fallow');
    assert.equal(coverCropRisk, 0.05);
  });

  test('water use meter tracks cumulative seasonal withdrawal', () => {
    const calcIrrigationNeed = (cropWaterNeed: number, effectiveRain: number) => {
      return Math.max(0, cropWaterNeed - effectiveRain);
    };

    // Rice in Punjab: 1250mm need vs 400mm rain = 850mm irrigation
    assert.equal(calcIrrigationNeed(1250, 400), 850);
    // Pearl Millet: 250mm need vs 300mm rain = 0mm irrigation (rainfed)
    assert.equal(calcIrrigationNeed(250, 300), 0);
  });

  test('income meter properly accounts for gross yield revenue minus input/pumping expenses', () => {
    const calcNetIncome = (grossRevenue: number, pumpingCost: number, seedFertilizerCost: number) => {
      return grossRevenue - (pumpingCost + seedFertilizerCost);
    };

    const net = calcNetIncome(2400, 450, 600);
    assert.equal(net, 1350);
  });
});
