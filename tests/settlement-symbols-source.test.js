import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/map-renderer.js", import.meta.url), "utf8");

function functionSection(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `${startMarker} should exist`);
  assert.notEqual(end, -1, `${endMarker} should follow ${startMarker}`);
  return source.slice(start, end);
}

test("village, town, and city use progressively larger symbols", () => {
  const symbols = functionSection("function drawSettlementSymbol", "function drawNotes");
  assert.match(symbols, /village: 5\.5, town: 7\.5, city: 10/);
  assert.match(symbols, /settlement-symbol-\$\{safeType\}/);
});

test("castle uses a distinct fortified symbol", () => {
  const symbols = functionSection("function drawSettlementSymbol", "function drawNotes");
  assert.match(symbols, /type === "castle"/);
  assert.match(symbols, /settlement-symbol-castle/);
  assert.match(symbols, /append\(parent, "path"/);
});

test("unknown settlement types use a safe town-sized fallback", () => {
  const symbols = functionSection("function drawSettlementSymbol", "function drawNotes");
  assert.match(symbols, /safeType = Object\.hasOwn\(radii, type\) \? type : "unknown"/);
  assert.match(symbols, /radii\[type\] \?\? 7\.5/);
});

test("settlement groups preserve identity and type in exported SVG", () => {
  const settlementLayer = source.slice(source.indexOf('class: "layer settlement-layer"'));
  assert.match(settlementLayer, /"data-id": settlement\.id/);
  assert.match(settlementLayer, /"data-type": settlement\.type/);
  assert.match(settlementLayer, /drawSettlementSymbol\(group, settlement\.type\)/);
});
