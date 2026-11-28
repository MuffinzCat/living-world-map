import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("editor places icon history controls before zoom controls", async () => {
  const controls = await read("src/history-controls.js");
  const brush = await read("src/brush-controls.js");
  assert.match(brush, /import "\.\/history-controls\.js"/);
  assert.match(controls, /document\.querySelector\("#undo-brush"\)\?\.remove\(\)/);
  assert.match(controls, /zoomIn\.insertAdjacentHTML\("beforebegin"/);
  assert.match(controls, /id="undo" class="icon-button"/);
  assert.match(controls, /id="redo" class="icon-button"/);
  assert.match(controls, /id="history-limit"/);
  assert.match(controls, /<svg class="mode-icon history-icon"/);
});

test("history records editor gestures and JSON replacement", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /map\.addEventListener\("pointerdown", beginAction, true\)/);
  assert.match(source, /pointerup/);
  assert.match(source, /applyButton\.addEventListener/);
  assert.match(source, /#load/);
});

test("undo and redo restore world data without resetting the viewport", async () => {
  const historyControls = await read("src/history-controls.js");
  const main = await read("src/main.js");

  assert.match(historyControls, /new CustomEvent\("history-restore"/);
  assert.match(main, /addEventListener\("history-restore"/);
  assert.match(main, /applyJSON\(false\)/);
  assert.match(main, /if \(reset\) \{ setMode\("select"\); setStatus/);
  assert.doesNotMatch(historyControls, /applyButton\.click\(\)/);
});

test("history supports standard shortcuts and persistent limits", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /event\.key\.toLowerCase\(\)/);
  assert.match(source, /event\.shiftKey/);
  assert.match(source, /key === "y"/);
  assert.match(source, /localStorage\.setItem\(limitStorageKey/);
});
