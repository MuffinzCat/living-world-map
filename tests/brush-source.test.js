import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

function listenerBody(eventName, nextEventName) {
  const start = source.indexOf(`map.addEventListener("${eventName}"`);
  const end = source.indexOf(`map.addEventListener("${nextEventName}"`, start);
  assert.notEqual(start, -1, `${eventName} listener should exist`);
  assert.notEqual(end, -1, `${nextEventName} listener should follow ${eventName}`);
  return source.slice(start, end);
}

test("pointer movement updates only the live brush preview", () => {
  const pointerMove = listenerBody("pointermove", "pointerup");
  assert.match(pointerMove, /renderBrushPreview/);
  assert.doesNotMatch(pointerMove, /renderWorld|refreshMap/);
});

test("brush outline uses half the selected stroke width as its radius", () => {
  assert.match(source, /Number\(brushSize\.value\) \/ 2/);
  assert.match(source, /class", "brush-outline"/);
});
