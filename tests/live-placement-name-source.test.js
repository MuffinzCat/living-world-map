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

test("name input live-updates pending settlement placement", () => {
  const update = functionSection("function updatePendingSettlementName", 'map.addEventListener("pointerdown"');
  assert.match(source, /settlementName\.addEventListener\("input", updatePendingSettlementName\)/);
  assert.match(update, /pendingPlacement\?\.kind !== "settlement"/);
  assert.match(update, /pendingPlacement\.name = name/);
  assert.match(update, /updatePlacementUI\(\)/);
});

test("empty names keep placement pending and show feedback", () => {
  const update = functionSection("function updatePendingSettlementName", 'map.addEventListener("pointerdown"');
  assert.match(update, /if \(!name\)/);
  assert.match(update, /Enter a settlement name/);
  assert.doesNotMatch(update, /pendingPlacement = null|cancelPlacement/);
});

test("settlement creation uses the latest valid name and type", () => {
  const complete = functionSection("function completePlacement", "function startPan");
  assert.match(complete, /const name = settlementName\.value\.trim\(\)/);
  assert.match(complete, /if \(!name\)/);
  assert.match(complete, /placement\.name = name/);
  assert.match(complete, /placement\.type = settlementType\.value/);
  assert.match(complete, /world\.settlements\.push\(\{ id: settlementId\(name\), name/);
});
