import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const source = await readFile(new URL("src/main.js", root), "utf8");
const styles = await readFile(new URL("styles/app.css", root), "utf8");

test("placement starts from feature actions instead of a separate choose mode", () => {
  assert.doesNotMatch(html, /data-mode="choose"/);
  assert.match(source, /beginSettlementPlacement/);
  assert.match(source, /beginMountainPlacement/);
  assert.doesNotMatch(source, /mode === "choose"/);
});

test("pending placement has visible feedback and cancellation", () => {
  assert.match(html, /id="placement-status"/);
  assert.match(html, /id="cancel-placement"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /setMode\("placement"\)/);
  assert.match(styles, /data-mode="placement"/);
});

test("one valid map click completes the requested placement", () => {
  assert.match(source, /mode === "placement" && inside\(point\)/);
  assert.match(source, /completePlacement\(point\)/);
  assert.match(source, /world\.settlements\.push/);
  assert.match(source, /world\.mountains\.push/);
  assert.match(source, /pendingPlacement = null/);
});
