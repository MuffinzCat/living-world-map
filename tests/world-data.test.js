import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENT_FORMAT_VERSION,
  calculateAuthoredBounds,
  exportWorldBounds,
  migrateWorld,
  serialiseWorld,
  validateWorld
} from "../src/world-data.js";

function validWorld() {
  return {
    formatVersion: CURRENT_FORMAT_VERSION,
    canvas: { width: 1200, height: 800 },
    bounds: { left: -500, top: -300, right: 1500, bottom: 900 },
    initialView: { x: -600, y: -400, width: 1200, height: 800 },
    terrain: [{ type: "land", points: [[0, 0], [100, 0], [100, 100]] }],
    settlements: [
      { id: "oak", name: "Oak Haven", type: "town", x: 100, y: 120 },
      { id: "ford", name: "Riverford", type: "village", x: 300, y: 280 }
    ],
    roads: [{ id: "road-1", from: "oak", to: "ford", points: [] }],
    rivers: [{ id: "river-1", points: [[10, 10], [20, 20]] }],
    forests: [{ id: "forest-1", x: 50, y: 60 }],
    mountains: [{ id: "mountain-1", x: 80, y: 90 }],
    mountainRanges: [],
    brushStrokes: [{ id: "stroke-1", type: "water", size: 40, points: [[200, 200], [220, 220]] }],
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
  assert.equal(world.mountains.some(item => item.id === "mountain-1"), true);
  assert.equal(world.mountainRanges.length, 0);
  assert.equal(world.brushStrokes.some(stroke => stroke.type === "mountainRange"), true);
  assert.equal(world.brushStrokes.some(stroke => stroke.type === "water"), true);
});

test("normalises legacy collection and brush names", () => {
  const world = validateWorld({
    canvas: { width: 400, height: 300 },
    mountain_ranges: [{ points: [[1, 1]], size: 20 }],
    brush_strokes: [{ type: "mountain_range", size: 30, points: [[2, 2]] }]
  });
  assert.equal(world.mountainRanges.length, 0);
  assert.equal(world.brushStrokes.filter(stroke => stroke.type === "mountainRange").length, 2);
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

test("migrates stable forest, mountain, and road identities and bend points", () => {
  const world = migrateWorld({
    canvas: { width: 400, height: 300 },
    settlements: [
      { id: "oak", name: "Oak", type: "town", x: 100, y: 100 },
      { id: "ford", name: "Ford", type: "village", x: 300, y: 200 },
    ],
    forests: [{ x: 30, y: 40 }],
    mountains: [{ x: 50, y: 60 }],
    roads: [{ from: "oak", to: "ford", points: [[200, 150]] }],
  });
  assert.equal(world.forests[0].id, "forest-1");
  assert.equal(world.mountains[0].id, "mountain-1");
  assert.equal(world.roads[0].id, "road-1");
  assert.deepEqual(world.roads[0].points, [[200, 150]]);
});

test("rejects malformed road bend points and duplicate road connections", () => {
  const malformed = validWorld();
  malformed.roads[0].points = [[200]];
  assert.throws(() => validateWorld(malformed), /\[x, y\] pair/);

  const duplicate = validWorld();
  duplicate.roads.push({ id: "reverse", from: "ford", to: "oak", points: [] });
  assert.throws(() => validateWorld(duplicate), /duplicates an existing road/);
});

test("migrates river IDs without changing geometry", () => {
  const world = migrateWorld({
    canvas: { width: 400, height: 300 },
    rivers: [{ points: [[-100, -50], [0, 20], [100, -30]] }]
  });
  assert.equal(world.rivers[0].id, "river-1");
  assert.deepEqual(world.rivers[0].points, [[-100, -50], [0, 20], [100, -30]]);
});

test("rejects malformed river IDs and point arrays", () => {
  const malformedId = validWorld();
  malformedId.rivers[0].id = "";
  assert.throws(() => validateWorld(malformedId), /rivers\[0\].id/);

  const malformedPoints = validWorld();
  malformedPoints.rivers[0].points = [[0, 0]];
  assert.throws(() => validateWorld(malformedPoints), /at least two/);

  const duplicate = validWorld();
  duplicate.rivers.push({ id: duplicate.rivers[0].id, points: [[1, 1], [2, 2]] });
  assert.throws(() => validateWorld(duplicate), /unique/);
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

test("calculates empty, positive, negative, and mixed authored bounds", () => {
  assert.equal(calculateAuthoredBounds({}), null);
  assert.deepEqual(calculateAuthoredBounds({
    settlements: [{ x: 10, y: 20 }, { x: 100, y: 200 }]
  }), { left: 10, top: 20, right: 100, bottom: 200 });
  assert.deepEqual(calculateAuthoredBounds({
    mountains: [{ x: -100, y: -50 }, { x: -10, y: -5 }]
  }), { left: -100, top: -50, right: -10, bottom: -5 });
  assert.deepEqual(calculateAuthoredBounds({
    forests: [{ x: -40, y: 30 }],
    roads: [{ points: [[100, -20]] }]
  }), { left: -40, top: -20, right: 100, bottom: 30 });
});

test("preserves negative coordinates across every canonical object type", () => {
  const world = validateWorld({
    formatVersion: 2,
    canvas: { width: 1200, height: 800 },
    terrain: [{ type: "land", points: [[-500, -400], [-200, -100]] }],
    settlements: [
      { id: "oak", name: "Oak", type: "town", x: -300, y: -250 },
      { id: "ford", name: "Ford", type: "village", x: 300, y: 250 }
    ],
    roads: [{ id: "road-1", from: "oak", to: "ford", points: [[-450, -350]] }],
    rivers: [{ points: [[-700, 100], [-600, 200]] }],
    forests: [{ id: "forest-1", x: -800, y: 300 }],
    mountains: [{ id: "mountain-1", x: 400, y: -900 }],
    mountainRanges: [{ points: [[-900, -100], [500, 600]] }],
    brushStrokes: [{ type: "water", size: 40, points: [[-100, -100]] }],
    notes: ""
  });
  assert.equal(world.settlements[0].x, -300);
  assert.equal(world.forests[0].x, -800);
  assert.equal(world.mountains[0].y, -900);
  assert.equal(world.brushStrokes[0].points[0][0], -100);
});

test("export bounds contain authored content independent of viewport travel", () => {
  const world = validateWorld({
    formatVersion: 2,
    canvas: { width: 1200, height: 800 },
    bounds: { left: -500, top: -400, right: 600, bottom: 700 },
    initialView: { x: -10000, y: -10000, width: 2000, height: 2000 },
    terrain: [{ type: "land", points: [[-500, -400], [600, 700]] }],
    settlements: [],
    roads: [],
    rivers: [],
    forests: [],
    mountains: [],
    mountainRanges: [],
    brushStrokes: [],
    notes: ""
  });
  assert.deepEqual(exportWorldBounds(world, 80), { x: -580, y: -480, width: 1260, height: 1260 });
});

test("rejects malformed authored bounds", () => {
  const world = validWorld();
  world.bounds = { left: 0, top: 0, right: 100, bottom: "bad" };
  assert.throws(() => validateWorld(world), /bounds\.bottom/);
});
