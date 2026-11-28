import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("Roads flyout contains creation and bend controls outside Select", async () => {
  const html = await read("index.html");
  const source = await read("src/road-controls.js");
  const selection = await read("src/selection-controls.js");
  assert.match(html, /id="roads-controls"[^>]*role="group"/);
  assert.match(html, /<label for="road-from">From/);
  assert.match(html, /<label for="road-to">To/);
  assert.match(html, /id="create-road"/);
  assert.match(html, /id="cancel-road"/);
  assert.match(source, /addRoad/);
  assert.match(source, /road-from/);
  assert.match(source, /road-to/);
  assert.doesNotMatch(selection, /road-from/);
  assert.doesNotMatch(selection, /road-to/);
  assert.doesNotMatch(selection, /create-road/);
});

test("Road controls refresh settlements and use history for creation and bends", async () => {
  const source = await read("src/road-controls.js");
  assert.match(source, /world-data-changed/);
  assert.match(source, /refreshOptions/);
  assert.match(source, /history-action-start/);
  assert.match(source, /history-action-finish/);
  assert.match(source, /addRoadPoint/);
  assert.match(source, /moveRoadPoint/);
  assert.match(source, /removeRoadPoint/);
});

test("road click adds a bend and deselection clears bend handles", async () => {
  const roadSource = await read("src/road-controls.js");
  const selectionSource = await read("src/selection-controls.js");
  assert.match(roadSource, /road-click/);
  assert.match(roadSource, /insertRoadPoint/);
  assert.match(roadSource, /road-selected/);
  assert.match(selectionSource, /road-click/);
  assert.match(selectionSource, /road-selected/);
  assert.match(selectionSource, /detail: \{ id: null \}/);
  assert.match(roadSource, /showToolOptions\(roadsControls, document\.querySelector\('\[data-mode="select"\]'\)\)/);
});

test("road cancellation and Escape return to Move map and clear road state", async () => {
  const source = await read("src/road-controls.js");
  assert.match(source, /function cancelRoad/);
  assert.match(source, /selectedRoadId = null/);
  assert.match(source, /selectedPointIndex = null/);
  assert.match(source, /\[data-mode="pan"\].*\.click\(\)/);
  assert.match(source, /event\.key === "Escape"/);
});

test("river selection matches road edit state and all handles remain movable", async () => {
  const riverSource = await read("src/river-controls.js");
  const selectionSource = await read("src/selection-controls.js");
  assert.match(riverSource, /showToolOptions\(riverControls, document\.querySelector\('\[data-mode="select"\]'\)\)/);
  assert.match(riverSource, /moveRiverPoint/);
  assert.doesNotMatch(riverSource, /river-line-start/);
  assert.match(selectionSource, /river-click/);
  assert.match(selectionSource, /clickTarget/);
});
