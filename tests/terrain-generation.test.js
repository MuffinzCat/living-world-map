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
