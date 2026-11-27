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
