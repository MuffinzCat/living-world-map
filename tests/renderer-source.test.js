import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/map-renderer.js", import.meta.url), "utf8");

test("renderer contains each canonical visual layer", () => {
  for (const layer of ["terrain-layer", "river-layer", "road-layer", "forest-layer", "mountain-layer", "settlement-layer"]) {
    assert.match(source, new RegExp(layer));
  }
});

test("renderer draws non-empty notes and brush strokes", () => {
  assert.match(source, /world\.notes\.trim\(\)/);
  assert.match(source, /class: "map-notes"/);
  assert.match(source, /world\.brushStrokes/);
});

test("all brush types render together in chronological order", () => {
  assert.match(source, /for \(const stroke of world\.brushStrokes\) renderBrushStroke\(terrainLayer, stroke\)/);
  assert.doesNotMatch(source, /world\.brushStrokes\.filter/);
});

test("mountain symbols remain separate from painted terrain", () => {
  const mountainLayer = source.slice(source.indexOf('class: "layer mountain-layer"'), source.indexOf('class: "layer settlement-layer"'));
  assert.match(mountainLayer, /drawMountainRange/);
  assert.match(mountainLayer, /world\.mountains/);
  assert.doesNotMatch(mountainLayer, /renderBrushStroke/);
});
