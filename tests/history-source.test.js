import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("editor places icon history controls before zoom controls", async () => {
  const controls = await read("src/history-controls.js");
  const brush = await read("src/brush-controls.js");
  assert.match(brush, /import "\.\/history-controls\.js"/);
  assert.match(controls, /document\.querySelector\("#undo-brush"\)\.remove\(\)/);
  assert.match(controls, /zoomIn\.insertAdjacentHTML\("beforebegin"/);
  assert.match(controls, /id="undo" class="icon-button"/);
  assert.match(controls, /id="redo" class="icon-button"/);
  assert.match(controls, /id="history-limit"/);
  assert.match(controls, /<svg class="mode-icon"/);
});

test("history records editor gestures and JSON replacement", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /map\.addEventListener\("pointerdown", beginAction, true\)/);
  assert.match(source, /pointerup/);
  assert.match(source, /applyButton\.addEventListener/);
  assert.match(source, /#load/);
});

test("undo and redo preserve the current map viewport", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /const viewBox = map\.getAttribute\("viewBox"\)/);
  assert.match(source, /map\.setAttribute\("viewBox", viewBox\)/);
  assert.match(source, /history-view-restored/);
});

test("history supports standard shortcuts and persistent limits", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /event\.key\.toLowerCase\(\)/);
  assert.match(source, /event\.shiftKey/);
  assert.match(source, /key === "y"/);
  assert.match(source, /localStorage\.setItem\(limitStorageKey/);
});
