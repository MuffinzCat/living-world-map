import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_FORMAT_VERSION, validateWorld } from "../src/world-data.js";

function validWorld() {
  return {
    formatVersion: CURRENT_FORMAT_VERSION,
    canvas: { width: 1200, height: 800 },
    terrain: [], settlements: [], roads: [], rivers: [], forests: [],
    mountains: [], mountainRanges: [], brushStrokes: [], notes: ""
  };
}

test("accepts the canonical foundation world", () => {
  const world = validWorld();
  assert.equal(validateWorld(world), world);
});

test("rejects an unsupported format version", () => {
  const world = validWorld();
  world.formatVersion = 999;
  assert.throws(() => validateWorld(world), /Unsupported world format version/);
});

test("rejects missing canonical collections", () => {
  const world = validWorld();
  delete world.roads;
  assert.throws(() => validateWorld(world), /roads must be an array/);
});
