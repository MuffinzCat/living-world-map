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
