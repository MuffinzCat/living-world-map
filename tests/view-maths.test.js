import assert from "node:assert/strict";
import test from "node:test";
import { fitAuthoredMap, panView, zoomView } from "../src/view-maths.js";

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

test("fit authored map frames negative bounds with padding", () => {
  const view = fitAuthoredMap(
    { left: -500, top: -300, right: 100, bottom: 100 },
    { width: 800, height: 400 },
    50
  );
  assert.equal(view.x, -700);
  assert.equal(view.y, -350);
  assert.equal(view.width, 1000);
  assert.equal(view.height, 500);
});

test("fit authored map uses a deterministic empty-world fallback", () => {
  assert.deepEqual(
    fitAuthoredMap(null, { width: 800, height: 400 }, 50),
    { x: -600, y: -400, width: 1200, height: 800 }
  );
});
