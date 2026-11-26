import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const previewSource = await readFile(new URL("../src/brush-preview.js", import.meta.url), "utf8");
const rendererSource = await readFile(new URL("../src/map-renderer.js", import.meta.url), "utf8");

function functionSection(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `${startMarker} should exist`);
  assert.notEqual(end, -1, `${endMarker} should follow ${startMarker}`);
  return source.slice(start, end);
}

test("pointer movement updates only the active brush layer", () => {
  const pointerMove = functionSection(
    'map.addEventListener("pointermove"',
    "function finishGesture"
  );
  assert.match(pointerMove, /renderBrushPreview/);
  assert.doesNotMatch(pointerMove, /renderWorld|refreshMap/);
});

test("a brush gesture is committed only when it finishes", () => {
  const pointerDown = functionSection(
    'map.addEventListener("pointerdown"',
    'map.addEventListener("pointermove"'
  );
  const finishGesture = functionSection(
    "function finishGesture",
    'map.addEventListener("pointerup"'
  );
  assert.doesNotMatch(pointerDown, /world\.brushStrokes\.push/);
  assert.match(finishGesture, /world\.brushStrokes\.push\(completed\.stroke\)/);
});

test("live strokes use the canonical renderer and matching layer order", () => {
  assert.match(previewSource, /renderBrushStroke\(layer, stroke/);
  assert.match(rendererSource, /export function renderBrushStroke/);
  assert.match(source, /stroke\.type === "mountainRange" \? "\.mountain-layer" : "\.terrain-layer"/);
  assert.match(source, /target\.after\(liveLayer\)/);
});

test("brush colours use the same fill palette as map terrain", () => {
  const brushRenderer = rendererSource.slice(
    rendererSource.indexOf("export function renderBrushStroke"),
    rendererSource.indexOf("function drawNotes")
  );
  assert.match(rendererSource, /water: "#355b57"/);
  assert.match(brushRenderer, /stroke\.type === "mountainRange" \? palette\.mountain : palette\[stroke\.type\]/);
  assert.match(brushRenderer, /append\(parent, "rect"/);
  assert.match(brushRenderer, /fill: colour/);
  assert.match(brushRenderer, /mask: `url\(#\$\{maskId\}\)`/);
});

test("mountain brush paints a continuous masked path instead of symbols", () => {
  const brushRenderer = rendererSource.slice(
    rendererSource.indexOf("export function renderBrushStroke"),
    rendererSource.indexOf("function drawNotes")
  );
  assert.match(brushRenderer, /append\(mask, "path"/);
  assert.doesNotMatch(brushRenderer, /drawMountainRange/);
  assert.match(brushRenderer, /"stroke-width": stroke\.size/);
});

test("brush outline uses half the selected stroke width as its radius", () => {
  assert.match(source, /Number\(brushSize\.value\) \/ 2/);
  assert.match(source, /class", "brush-outline"/);
});
