import assert from "node:assert/strict";
import test from "node:test";
import { panView, zoomView } from "../src/view-maths.js";

test("continuous pan is derived from the fixed starting view", () => {
  const start = { x: 100, y: 50, width: 1200, height: 800 };
  const halfway = panView(start, { x: 10, y: 10 }, { x: 60, y: 40 }, { width: 600, height: 400 });
  const final = panView(start, { x: 10, y: 10 }, { x: 110, y: 70 }, { width: 600, height: 400 });
  assert.deepEqual(halfway, { x: 0, y: -10, width: 1200, height: 800 });
  assert.deepEqual(final, { x: -100, y: -70, width: 1200, height: 800 });
});

test("zoom keeps its world anchor fixed", () => {
  assert.deepEqual(zoomView({ x: 0, y: 0, width: 1000, height: 500 }, 0.5, { x: 250, y: 100 }), { x: 125, y: 50, width: 500, height: 250 });
});
