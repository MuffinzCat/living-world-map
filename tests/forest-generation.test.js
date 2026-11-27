import assert from "node:assert/strict";
import test from "node:test";
import {
  commitForestStroke,
  generateForestSymbols,
  pointWithinForest,
  removeUnsupportedForestSymbols
} from "../src/forest-generation.js";

function emptyWorld() {
  return { brushStrokes: [], forests: [] };
}

test("forest generation is deterministic and source-owned", () => {
  const stroke = { id: "stroke-forest", type: "forest", size: 50, points: [[-300, 100], [-100, 150], [200, -40]] };
  const first = generateForestSymbols(emptyWorld(), stroke);
  const second = generateForestSymbols(emptyWorld(), stroke);
  assert.deepEqual(first, second);
  assert.ok(first.every(tree => tree.sourceId === stroke.id));
  assert.ok(first.every(tree => pointWithinForest([tree.x, tree.y], stroke)));
});

test("single-point forest strokes and negative coordinates generate stable trees", () => {
  const world = emptyWorld();
  commitForestStroke(world, { id: "stroke-negative", type: "forest", size: 60, points: [[-700, -500]] });
  assert.equal(world.brushStrokes.length, 1);
  assert.ok(world.forests.length > 0);
  assert.ok(world.forests.every(tree => Number.isFinite(tree.x) && Number.isFinite(tree.y)));
});

test("land or water replacement suppresses attached trees but preserves manual trees", () => {
  const world = emptyWorld();
  commitForestStroke(world, { id: "forest-source", type: "forest", size: 80, points: [[0, 0], [100, 0]] });
  world.forests.push({ id: "manual-tree", x: 50, y: 0 });
  removeUnsupportedForestSymbols(world, { type: "water", size: 300, points: [[50, 0]] });
  assert.equal(world.forests.find(tree => tree.id === "manual-tree").suppressed, undefined);
  assert.ok(world.forests.filter(tree => tree.sourceId).every(tree => tree.suppressed));
});
