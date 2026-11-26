import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENT_FORMAT_VERSION,
  migrateWorld,
  serialiseWorld,
  validateWorld
} from "../src/world-data.js";

function validWorld() {
  return {
    formatVersion: CURRENT_FORMAT_VERSION,
    canvas: { width: 1200, height: 800 },
    terrain: [{ type: "land", points: [[0, 0], [100, 0], [100, 100]] }],
    settlements: [
      { id: "oak", name: "Oak Haven", type: "town", x: 100, y: 120 },
      { id: "ford", name: "Riverford", type: "village", x: 300, y: 280 }
    ],
    roads: [{ from: "oak", to: "ford" }],
    rivers: [{ points: [[10, 10], [20, 20]] }],
    forests: [{ x: 50, y: 60 }],
    mountains: [{ x: 80, y: 90 }],
    mountainRanges: [{ points: [[100, 100], [150, 140]], size: 32 }],
    brushStrokes: [{ type: "water", size: 40, points: [[200, 200], [220, 220]] }],
    notes: "A valid world."
  };
}

test("accepts and clones a canonical world", () => {
  const input = validWorld();
  const world = validateWorld(input);
  assert.deepEqual(world, input);
  assert.notEqual(world, input);
});

test("fills absent legacy collections and notes", () => {
  const world = validateWorld({ canvas: { width: 400, height: 300 }, terrain: [] });
  assert.equal(world.formatVersion, CURRENT_FORMAT_VERSION);
  assert.equal(world.notes, "");
  assert.deepEqual(world.roads, []);
});

test("migrates recognised legacy terrain features without dropping them", () => {
  const world = migrateWorld({
    canvas: { width: 400, height: 300 },
    terrain: [
      { type: "land", points: [[0, 0], [10, 0], [10, 10]] },
      { type: "river", points: [[1, 1], [2, 2]] },
      { type: "forest", x: 3, y: 4 },
      { type: "mountain", x: 5, y: 6 },
      { type: "mountain_range", points: [[7, 7], [8, 8]] },
      { type: "water", size: 20, points: [[9, 9], [10, 10]] }
    ]
  });
  assert.equal(world.terrain.length, 1);
  assert.equal(world.rivers.length, 1);
  assert.equal(world.forests.length, 1);
  assert.equal(world.mountains.length, 1);
  assert.equal(world.mountainRanges.length, 1);
  assert.deepEqual(world.brushStrokes[0], { type: "water", size: 20, points: [[9, 9], [10, 10]] });
});

test("normalises legacy collection and brush names", () => {
  const world = validateWorld({
    canvas: { width: 400, height: 300 },
    mountain_ranges: [{ points: [[1, 1]], size: 20 }],
    brush_strokes: [{ type: "mountain_range", size: 30, points: [[2, 2]] }]
  });
  assert.equal(world.mountainRanges.length, 1);
  assert.equal(world.brushStrokes[0].type, "mountainRange");
});

test("rejects unsupported explicit versions", () => {
  const world = validWorld();
  world.formatVersion = 999;
  assert.throws(() => validateWorld(world), /Unsupported world format version/);
});

test("rejects duplicate settlement IDs", () => {
  const world = validWorld();
  world.settlements.push({ id: "oak", name: "Other Oak", type: "city", x: 3, y: 4 });
  assert.throws(() => validateWorld(world), /must be unique/);
});

test("rejects roads with missing endpoints", () => {
  const world = validWorld();
  world.roads[0].to = "missing";
  assert.throws(() => validateWorld(world), /existing settlement IDs/);
});

test("rejects malformed points and invalid brush sizes", () => {
  const malformed = validWorld();
  malformed.rivers[0].points = [[1]];
  assert.throws(() => validateWorld(malformed), /\[x, y\] pair/);

  const invalidSize = validWorld();
  invalidSize.brushStrokes[0].size = 0;
  assert.throws(() => validateWorld(invalidSize), /positive number/);
});

test("serialises only canonical validated data", () => {
  const legacy = { canvas: { width: 100, height: 100 }, brush_strokes: [] };
  const saved = JSON.parse(serialiseWorld(legacy));
  assert.equal(saved.formatVersion, CURRENT_FORMAT_VERSION);
  assert.ok(Array.isArray(saved.brushStrokes));
  assert.equal("brush_strokes" in saved, false);
});
