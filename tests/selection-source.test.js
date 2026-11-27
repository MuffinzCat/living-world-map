import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("selection controls are loaded in the shared tool-options toolbar", async () => {
  const page = await read("index.html");
  const source = await read("src/selection-controls.js");
  assert.match(page, /styles\/selection\.css/);
  assert.match(page, /src\/selection-controls\.js/);
  assert.match(source, /optionsToolbar\.append\(controls\)/);
  assert.match(source, /showToolOptions\(controls\)/);
  assert.match(source, /id="duplicate-selection"/);
  assert.match(source, /id="delete-selection"/);
  assert.match(source, /id="clear-selection"/);
});

test("settlements and manual mountains support click and box selection", async () => {
  const source = await read("src/selection-controls.js");
  const styles = await read("styles/selection.css");
  assert.match(source, /matches\("\.settlement"\)/);
  assert.match(source, /mountain-symbol\[data-object-id/);
  assert.match(source, /startBoxSelection/);
  assert.match(source, /getBBox\(\)/);
  assert.match(source, /event\.shiftKey/);
  assert.match(styles, /\.selection-box/);
});

test("delete and duplicate apply to the full selection through history", async () => {
  const source = await read("src/selection-controls.js");
  assert.match(source, /const targets = \[\.\.\.selected\]/);
  assert.match(source, /history-action-start/);
  assert.match(source, /history-action-finish/);
  assert.match(source, /deleteObjects/);
  assert.match(source, /duplicateObjects/);
});

test("selection supports keyboard actions and stays out of SVG exports", async () => {
  const source = await read("src/selection-controls.js");
  assert.match(source, /event\.key === "Delete"/);
  assert.match(source, /key\.toLowerCase\(\) === "d"/);
  assert.match(source, /#export-svg/);
  assert.match(source, /remove\("is-selected"\)/);
});

test("selection includes settlement editing, forest movement, road creation, and bend editing", async () => {
  const source = await read("src/selection-controls.js");
  assert.match(source, /selected-settlement-name/);
  assert.match(source, /SETTLEMENT_TYPES/);
  assert.match(source, /forest-object/);
  assert.match(source, /road-from/);
  assert.match(source, /road-to/);
  assert.match(source, /add-road-point/);
  assert.match(source, /road-bend-handle/);
});
