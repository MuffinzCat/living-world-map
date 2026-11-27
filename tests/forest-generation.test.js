import assert from "node:assert/strict";
import test from "node:test";
import {
  commitForestStroke,
  generateForestSymbols,
  pointWithinForest,
  previewForestLayout,
  removeUnsupportedForestSymbols
} from "../src/forest-generation.js";
import { generateMountainSymbols } from "../src/terrain-generation.js";

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

test("forest density is roughly 1.8 times mountain density", () => {
  const stroke = { id: "stroke-density", type: "forest", size: 40, points: [[-250, 0], [-100, 20], [100, -10], [250, 5]] };
  const mountainStroke = { ...stroke, id: "stroke-mountain-density", type: "mountainRange" };
  const forests = generateForestSymbols({ forests: [] }, stroke);
  const mountains = generateMountainSymbols({ mountains: [] }, mountainStroke);
  assert.ok(forests.length > 0 && mountains.length > 0);
  const ratio = forests.length / mountains.length;
  assert.ok(ratio >= 1.5 && ratio <= 2.5, `forest/mountain density ratio was ${ratio}`);
});

test("forest spacing is size-aware and crossed strokes avoid duplicates", () => {
  const world = emptyWorld();
  commitForestStroke(world, { id: "forest-horizontal", type: "forest", size: 80, points: [[-300, 0], [300, 0]] });
  commitForestStroke(world, { id: "forest-vertical", type: "forest", size: 80, points: [[0, -300], [0, 300]] });
  assert.ok(world.forests.length >= 2);
  for (let index = 0; index < world.forests.length; index += 1) {
    for (let other = index + 1; other < world.forests.length; other += 1) {
      const a = world.forests[index];
      const b = world.forests[other];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      assert.ok(distance >= (a.size + b.size) * 0.18 - 0.01);
    }
  }
});

test("single-point and preview layouts exactly match committed forests", () => {
  const world = emptyWorld();
  const short = { id: "forest-short", type: "forest", size: 80, points: [[-500, -300]] };
  assert.ok(previewForestLayout(world, short).length >= 1);
  commitForestStroke(world, short);
  assert.deepEqual(world.forests, previewForestLayout({ forests: [] }, short));
  assert.ok(world.forests.every(tree => pointWithinForest([tree.x, tree.y], short)));
});
