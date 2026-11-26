import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

function functionSection(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `${startMarker} should exist`);
  assert.notEqual(end, -1, `${endMarker} should follow ${startMarker}`);
  return source.slice(start, end);
}

test("pointer movement updates only the live brush preview", () => {
  const pointerMove = functionSection(
    'map.addEventListener("pointermove"',
    "function finishGesture"
  );
  assert.match(pointerMove, /renderBrushPreview/);
  assert.doesNotMatch(pointerMove, /renderWorld|refreshMap/);
});

test("brush outline uses half the selected stroke width as its radius", () => {
  assert.match(source, /Number\(brushSize\.value\) \/ 2/);
  assert.match(source, /class", "brush-outline"/);
});
