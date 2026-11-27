import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

test("middle mouse starts the shared pan gesture before mode-specific actions", () => {
  assert.match(source, /function startPan\(event\)/);
  assert.match(source, /event\.button !== 0 && event\.button !== 1/);
  assert.match(source, /if \(event\.button === 1\) startPan\(event\);\s*else \{/);
});

test("middle mouse panning preserves the active tool and pending placement", () => {
  const middleMouseBranch = source.match(/if \(event\.button === 1\) startPan\(event\);\s*else \{/)?.[0] ?? "";
  assert.doesNotMatch(middleMouseBranch, /setMode|pendingPlacement|completePlacement|renderBrushPreview/);
  assert.match(source, /if \(completed\.kind !== "pan"\) \{ syncJSON\(\); refreshMap\(\); \}/);
});

test("middle-button browser behaviour is suppressed over the map", () => {
  assert.match(source, /map\.setPointerCapture\(event\.pointerId\);\s*event\.preventDefault\(\);/);
  assert.match(source, /map\.addEventListener\("auxclick", event => \{ if \(event\.button === 1\) event\.preventDefault\(\); \}\);/);
});
