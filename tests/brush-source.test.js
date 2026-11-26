import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

test("pointer movement updates only the live brush preview", () => {
  const pointerMove = source.slice(source.indexOf('map.addEventListener("pointermove"'), source.indexOf('map.addEventListener("pointerdown"'));
  assert.match(pointerMove, /renderBrushPreview/);
  assert.doesNotMatch(pointerMove, /renderWorld|refreshMap/);
});

test("brush outline uses half the selected stroke width as its radius", () => {
  assert.match(source, /Number\(brushSize\.value\) \/ 2/);
  assert.match(source, /class", "brush-outline"/);
});
