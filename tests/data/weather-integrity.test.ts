import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Regional Weather & Crop Catalogue Dataset Integrity Suite', () => {
  const dataDir = join(process.cwd(), 'src/lib/data');
  const regions = ['punjab', 'iowa', 'karnataka', 'sahel-kenya'];

  test('all 4 regional weather JSON files exist in src/lib/data', () => {
    for (const r of regions) {
      const p = join(dataDir, `weather_${r}.json`);
      assert.ok(existsSync(p), `Missing regional weather file: weather_${r}.json`);
    }
  });

  test('all 4 regional weather files contain exactly 2,349 weekly records (1981-W01 to 2026-W01)', () => {
    for (const r of regions) {
      const p = join(dataDir, `weather_${r}.json`);
      const data = JSON.parse(readFileSync(p, 'utf-8'));
      assert.ok(Array.isArray(data), `${r} is not an array`);
      assert.equal(data.length, 2349, `${r} record count mismatch`);
      assert.equal(data[0].year, 1981, `${r} first year must be 1981`);
      assert.equal(data[0].week, 1, `${r} first week must be 1`);
      assert.equal(data[data.length - 1].year, 2026, `${r} last year must be 2026`);
      assert.equal(data[data.length - 1].week, 1, `${r} last week must be 1`);
    }
  });

  test('all weather fields satisfy physical bounds and contract types', () => {
    for (const r of regions) {
      const p = join(dataDir, `weather_${r}.json`);
      const data = JSON.parse(readFileSync(p, 'utf-8'));

      for (const [idx, rec] of data.entries()) {
        assert.ok(typeof rec.year === 'number', `${r}[${idx}]: year not a number`);
        assert.ok(typeof rec.week === 'number', `${r}[${idx}]: week not a number`);

        // Temperature bounds
        if (rec.tmax !== null) {
          assert.ok(rec.tmax >= -60 && rec.tmax <= 65, `${r}[${idx}]: tmax extreme ${rec.tmax}`);
        }
        if (rec.tmin !== null) {
          assert.ok(rec.tmin >= -60 && rec.tmin <= 65, `${r}[${idx}]: tmin extreme ${rec.tmin}`);
        }
        if (rec.tmax !== null && rec.tmin !== null) {
          assert.ok(rec.tmax >= rec.tmin, `${r}[${idx}]: tmax < tmin (${rec.tmax} < ${rec.tmin})`);
        }

        // Precipitation bounds
        if (rec.rain !== null) {
          assert.ok(rec.rain >= 0, `${r}[${idx}]: negative rain ${rec.rain}`);
        }

        // Evaporation bounds
        if (rec.evap !== null) {
          assert.ok(rec.evap >= 0, `${r}[${idx}]: negative evaporation ${rec.evap}`);
        }
      }
    }
  });

  test('crops.json strictly adheres to CropTraits contract with cited scientific sources', () => {
    const cropsPath = join(dataDir, 'crops.json');
    assert.ok(existsSync(cropsPath), 'crops.json must exist');
    const crops = JSON.parse(readFileSync(cropsPath, 'utf-8'));
    assert.ok(Array.isArray(crops), 'crops must be array');
    assert.equal(crops.length, 12, 'Must contain 12 regional crops');

    for (const c of crops) {
      assert.ok(c.id && typeof c.id === 'string', 'Crop missing id');
      assert.ok(c.name && typeof c.name === 'string', 'Crop missing name');
      assert.ok(typeof c.waterUse === 'number' && c.waterUse > 0, `Crop ${c.id} invalid waterUse`);
      assert.ok(typeof c.nitrogenFixation === 'boolean', `Crop ${c.id} missing nitrogenFixation`);
      assert.ok(typeof c.rootingDepth === 'number' && c.rootingDepth > 0, `Crop ${c.id} invalid rootingDepth`);
      assert.ok(typeof c.coverValue === 'number' && c.coverValue >= 0 && c.coverValue <= 1, `Crop ${c.id} invalid coverValue`);
      assert.ok(Array.isArray(c.season) && c.season.length > 0, `Crop ${c.id} missing season`);
      assert.ok(Array.isArray(c.sources) && c.sources.length > 0, `Crop ${c.id} missing scientific citations`);
    }
  });
});
