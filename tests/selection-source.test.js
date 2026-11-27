import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("selection controls are loaded with shared object actions", async () => {
  const page = await read("index.html");
  const source = await read("src/selection-controls.js");
  assert.match(page, /styles\/selection\.css/);
  assert.match(page, /src\/selection-controls\.js/);
  assert.match(source, /id="duplicate-selection"/);
  assert.match(source, /id="delete-selection"/);
});

test("settlements and manual mountains can be selected", async () => {
  const source = await read("src/selection-controls.js");
  assert.match(source, /closest\("\.settlement"\)/);
  assert.match(source, /mountain-symbol\[data-object-kind=/);
  assert.match(source, /is-selected/);
});

test("delete and duplicate edits use history and preserve valid roads", async () => {
  const source = await read("src/selection-controls.js");
  assert.match(source, /history-action-start/);
  assert.match(source, /history-action-finish/);
  assert.match(source, /world\.roads = world\.roads\.filter/);
  assert.match(source, /uniqueSettlementId/);
});

test("selection supports keyboard actions and stays out of SVG exports", async () => {
  const source = await read("src/selection-controls.js");
  assert.match(source, /event\.key === "Delete"/);
  assert.match(source, /key\.toLowerCase\(\) === "d"/);
  assert.match(source, /#export-svg/);
  assert.match(source, /remove\("is-selected"\)/);
});
