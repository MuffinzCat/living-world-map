import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("editor exposes general history controls", async () => {
  const html = await read("index.html");
  for (const id of ["undo", "redo", "history-limit"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /src="src\/history-controls\.js"/);
  assert.doesNotMatch(html, /id="undo-brush"/);
});

test("history records editor gestures and JSON replacement", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /map\.addEventListener\("pointerdown", beginAction, true\)/);
  assert.match(source, /pointerup/);
  assert.match(source, /applyButton\.addEventListener/);
  assert.match(source, /#load/);
});

test("history supports standard shortcuts and persistent limits", async () => {
  const source = await read("src/history-controls.js");
  assert.match(source, /event\.key\.toLowerCase\(\)/);
  assert.match(source, /event\.shiftKey/);
  assert.match(source, /key === "y"/);
  assert.match(source, /localStorage\.setItem\(limitStorageKey/);
});
