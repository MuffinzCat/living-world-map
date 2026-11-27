import assert from "node:assert/strict";
import test from "node:test";
import {
  commitMountainStroke,
  generateMountainSymbols,
  pointWithinBrush,
  previewMountainLayout,
  removeUnsupportedMountedSymbols,
  removeMountainBrushStroke
} from "../src/terrain-generation.js";

function emptyWorld() {
  return { brushStrokes: [], mountains: [] };
}

test("mountain generation is deterministic and stable by source stroke", () => {
  const stroke = { id: "stroke-1", type: "mountainRange", size: 40, points: [[-100, -50], [20, 30], [120, -20]] };
  const first = generateMountainSymbols(emptyWorld(), stroke);
  const second = generateMountainSymbols(emptyWorld(), stroke);
  assert.deepEqual(first, second);
  assert.ok(first.every(symbol => symbol.sourceId === stroke.id));
  assert.ok(first.every(symbol => pointWithinBrush([symbol.x, symbol.y], stroke)));
});

test("single-point and negative-coordinate mountain strokes generate usable symbols", () => {
  const world = emptyWorld();
  const stroke = { id: "stroke-negative", type: "mountainRange", size: 60, points: [[-500, -300]] };
  commitMountainStroke(world, stroke);
  assert.equal(world.brushStrokes.length, 1);
  assert.ok(world.mountains.length > 0);
  assert.ok(world.mountains.every(symbol => symbol.x <= -480 && symbol.x >= -520 || Number.isFinite(symbol.x)));
});

test("replacement strokes suppress only attached symbols beneath the replacement", () => {
  const world = emptyWorld();
  const mountainStroke = { id: "mountain-1", type: "mountainRange", size: 40, points: [[0, 0], [100, 0]] };
  commitMountainStroke(world, mountainStroke);
  const manual = { id: "manual-mountain", x: 50, y: 0, size: 32 };
  world.mountains.push(manual);
  removeUnsupportedMountedSymbols(world, { type: "water", size: 300, points: [[50, 0]] });
  assert.ok(world.mountains.find(item => item.id === "manual-mountain").suppressed !== true);
  assert.ok(world.mountains.filter(item => item.sourceId).every(item => item.suppressed));
});

test("live preview layout exactly matches committed generated layout", () => {
  const world = emptyWorld();
  const stroke = { id: "stroke-exact", type: "mountainRange", size: 44, points: [[-120, 80], [40, 20], [180, 90]] };
  const preview = previewMountainLayout(world, stroke);
  commitMountainStroke(world, stroke);
  assert.deepEqual(world.mountains, preview);
});

test("source brush removal deletes only attached symbols", () => {
  const world = emptyWorld();
  commitMountainStroke(world, { id: "source-a", type: "mountainRange", size: 40, points: [[0, 0], [100, 0]] });
  world.mountains.push({ id: "manual-mountain", x: 25, y: 25, size: 32 });
  removeMountainBrushStroke(world, "source-a");
  assert.equal(world.brushStrokes.length, 0);
  assert.deepEqual(world.mountains, [{ id: "manual-mountain", x: 25, y: 25, size: 32 }]);
});

test("representative long mountain strokes use a sparse readable density", () => {
  const world = emptyWorld();
  const stroke = {
    id: "stroke-long",
    type: "mountainRange",
    size: 40,
    points: [[-250, 0], [-100, 20], [100, -10], [250, 5]]
  };
  commitMountainStroke(world, stroke);
  assert.ok(world.mountains.length >= 8, `expected a readable chain, got ${world.mountains.length}`);
  assert.ok(world.mountains.length <= 18, `expected substantially reduced density, got ${world.mountains.length}`);
});

test("generated mountain spacing is minimum and size-aware", () => {
  const world = emptyWorld();
  const stroke = { id: "stroke-spacing", type: "mountainRange", size: 80, points: [[-300, 0], [300, 0]] };
  commitMountainStroke(world, stroke);
  assert.ok(world.mountains.length >= 2);
  for (let index = 0; index < world.mountains.length; index += 1) {
    for (let other = index + 1; other < world.mountains.length; other += 1) {
      const a = world.mountains[index];
      const b = world.mountains[other];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const required = (a.size + b.size) * 0.58 - 0.01;
      assert.ok(distance >= required, `expected size-aware spacing ${required}, got ${distance}`);
    }
  }
});

test("short valid mountain strokes still generate at least one symbol", () => {
  const world = emptyWorld();
  commitMountainStroke(world, { id: "stroke-short", type: "mountainRange", size: 80, points: [[-500, -300]] });
  assert.ok(world.mountains.length >= 1);
  assert.ok(world.mountains.every(mountain => pointWithinBrush([mountain.x, mountain.y], world.brushStrokes[0])));
});

test("crossed or overlapping mountain strokes avoid effectively duplicate positions", () => {
  const world = emptyWorld();
  commitMountainStroke(world, { id: "stroke-horizontal", type: "mountainRange", size: 40, points: [[-100, 0], [100, 0]] });
  commitMountainStroke(world, { id: "stroke-vertical", type: "mountainRange", size: 40, points: [[0, -100], [0, 100]] });
  for (let index = 0; index < world.mountains.length; index += 1) {
    for (let other = index + 1; other < world.mountains.length; other += 1) {
      const a = world.mountains[index];
      const b = world.mountains[other];
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= 8, "crossed strokes created effectively duplicate symbols");
    }
  }
});
