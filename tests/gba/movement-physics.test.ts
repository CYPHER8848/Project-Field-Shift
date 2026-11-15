import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  WORLD_WIDTH, 
  WORLD_HEIGHT, 
  COLLISION_OBSTACLES, 
  INTERACTIVE_ENTITIES 
} from '../../src/components/gba/mapData.ts';

// Pure implementation of GBA collision detection logic for regression verification
function checkCollision(newX: number, newY: number): boolean {
  const pBox = {
    x: newX - 10,
    y: newY + 2,
    width: 20,
    height: 14
  };

  // World boundaries
  if (newX < 24 || newX > WORLD_WIDTH - 24 || newY < 30 || newY > WORLD_HEIGHT - 30) {
    return true;
  }

  // Static obstacles
  for (const obs of COLLISION_OBSTACLES) {
    if (
      pBox.x < obs.x + obs.width &&
      pBox.x + pBox.width > obs.x &&
      pBox.y < obs.y + obs.height &&
      pBox.y + pBox.height > obs.y
    ) {
      return true;
    }
  }
  return false;
}

function checkProximity(px: number, py: number): string | null {
  let closest: string | null = null;
  let closestDist = Infinity;

  for (const ent of INTERACTIVE_ENTITIES) {
    const dist = Math.hypot(px - ent.x, py - ent.y);
    if (dist <= ent.interactionRadius && dist < closestDist) {
      closest = ent.id;
      closestDist = dist;
    }
  }
  return closest;
}

describe('GBA Overworld Movement Physics & Collision Suite', () => {
  test('center of the crossroads (x: 480, y: 360) is completely clear of obstacles', () => {
    assert.equal(checkCollision(480, 360), false, 'Initial player position should be free of collisions');
  });

  test('boundaries block player movement outside the valid farm perimeter', () => {
    // West border
    assert.equal(checkCollision(10, 360), true, 'West border should trigger collision');
    // East border
    assert.equal(checkCollision(WORLD_WIDTH - 10, 360), true, 'East border should trigger collision');
    // North border
    assert.equal(checkCollision(480, 15), true, 'North border should trigger collision');
    // South border
    assert.equal(checkCollision(480, WORLD_HEIGHT - 10), true, 'South border should trigger collision');
  });

  test('farmhouse and shed geometry correctly block penetration', () => {
    // Inside Farmhouse (x: 600..860, y: 80..220)
    assert.equal(checkCollision(700, 140), true, 'Inside farmhouse must block player');
    // Inside Seed Shed (x: 100..240, y: 90..190)
    assert.equal(checkCollision(160, 130), true, 'Inside seed storage shed must block player');
  });

  test('canal divider blocks direct water walking except across log bridge', () => {
    // Canal West bank (y: 465..497)
    assert.equal(checkCollision(200, 475), true, 'West canal bank must block crossing');
    // Canal East bank
    assert.equal(checkCollision(600, 475), true, 'East canal bank must block crossing');
    // Log Bridge opening at center (x: 480, y: 475)
    assert.equal(checkCollision(480, 475), false, 'Log bridge opening must permit player crossing');
  });

  test('proximity detection triggers at designated entity interaction radius', () => {
    // Near Amma on the veranda (x: 710, y: 220)
    const ammaTarget = checkProximity(710, 240);
    assert.equal(ammaTarget, 'amma', 'Standing in front of veranda should detect Amma');

    // Far away in empty field
    const emptyTarget = checkProximity(350, 350);
    assert.equal(emptyTarget, null, 'Empty field position should detect no entities');

    // Near Tubewell pump (x: 820, y: 380)
    const tubewellTarget = checkProximity(820, 400);
    assert.equal(tubewellTarget, 'tubewell', 'Standing next to pump should detect tubewell');

    // Near Ganga the Bullock (x: 270, y: 110)
    const bullockTarget = checkProximity(270, 130);
    assert.equal(bullockTarget, 'sacred_bullock', 'Standing beside shed should detect Ganga');
  });
});
