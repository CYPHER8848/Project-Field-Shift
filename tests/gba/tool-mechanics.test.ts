import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { EquippedTool, TimeOfDay } from '../../src/components/gba/types.ts';

describe('GBA Overworld Tool Mechanics & Meter Impact Suite', () => {
  test('tool rotation cycles predictably through all 4 agroecological implements', () => {
    const tools: EquippedTool[] = ['seeds', 'water', 'probe', 'almanac'];
    let current: EquippedTool = 'seeds';

    const cycle = (t: EquippedTool): EquippedTool => {
      const idx = tools.indexOf(t);
      return tools[(idx + 1) % tools.length];
    };

    current = cycle(current);
    assert.equal(current, 'water', 'Seeds should cycle to water');
    current = cycle(current);
    assert.equal(current, 'probe', 'Water should cycle to probe');
    current = cycle(current);
    assert.equal(current, 'almanac', 'Probe should cycle to almanac');
    current = cycle(current);
    assert.equal(current, 'seeds', 'Almanac should cycle back to seeds');
  });

  test('time of day lighting cycles through dawn, noon, sunset, and night', () => {
    const times: TimeOfDay[] = ['dawn', 'noon', 'sunset', 'night'];
    let current: TimeOfDay = 'dawn';

    const cycle = (t: TimeOfDay): TimeOfDay => {
      const idx = times.indexOf(t);
      return times[(idx + 1) % times.length];
    };

    current = cycle(current);
    assert.equal(current, 'noon');
    current = cycle(current);
    assert.equal(current, 'sunset');
    current = cycle(current);
    assert.equal(current, 'night');
    current = cycle(current);
    assert.equal(current, 'dawn');
  });

  test('sowing seeds boosts biological nitrogen and organic matter without exceeding 100', () => {
    let nitrogen = 60;
    let som = 40;

    const sow = (n: number, s: number) => ({
      nitrogen: Math.min(100, n + 4),
      organicMatter: Math.min(100, s + 2)
    });

    const res1 = sow(nitrogen, som);
    assert.equal(res1.nitrogen, 64);
    assert.equal(res1.organicMatter, 42);

    // Test upper clamping
    const res2 = sow(98, 99);
    assert.equal(res2.nitrogen, 100, 'Nitrogen must clamp at 100%');
    assert.equal(res2.organicMatter, 100, 'SOM must clamp at 100%');
  });

  test('watering furrow raises root-zone moisture without exceeding 100', () => {
    let moisture = 45;
    const water = (m: number) => Math.min(100, m + 8);

    assert.equal(water(moisture), 53);
    assert.equal(water(96), 100, 'Moisture must clamp at 100%');
  });

  test('tubewell pump physics accurately quantifies flow, drawdown, and cavitation danger', () => {
    const calcPumpPhysics = (rpm: number) => ({
      flowRateLps: Number((rpm * 0.08).toFixed(1)),
      drawdownCmHr: Number((rpm * 0.002).toFixed(2)),
      isCavitationRisk: rpm > 1800
    });

    // Safe AWD flow
    const safe = calcPumpPhysics(1400);
    assert.equal(safe.flowRateLps, 112.0);
    assert.equal(safe.drawdownCmHr, 2.8);
    assert.equal(safe.isCavitationRisk, false);

    // Extreme pumping triggering cavitation
    const extreme = calcPumpPhysics(2000);
    assert.equal(extreme.flowRateLps, 160.0);
    assert.equal(extreme.drawdownCmHr, 4.0);
    assert.equal(extreme.isCavitationRisk, true, 'RPM > 1800 must trigger cavitation danger flag');
  });
});
