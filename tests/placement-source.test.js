import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { expectAttribute, openingTagWith } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const source = await readFile(new URL("src/main.js", root), "utf8");

test("placement starts from labelled settlement and mountain actions", () => {
  for (const [id, kind, label] of [["add-settlement", "settlement", "Add settlement"], ["add-mountain", "mountain", "Add mountain"]]) {
    const button = openingTagWith(html, "id", id);
    expectAttribute(button, "data-placement", kind);
    expectAttribute(button, "aria-label", label);
  }
  assert.match(source, /beginSettlementPlacement/);
  assert.match(source, /beginMountainPlacement/);
  assert.doesNotMatch(html, /data-mode="choose"/);
});

test("pending placement can be cancelled and announces its state", () => {
  const status = openingTagWith(html, "id", "placement-status");
  expectAttribute(status, "aria-live", "polite");
  assert.ok(openingTagWith(html, "id", "cancel-placement"));
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /setMode\("placement"\)/);
});

test("one valid left click completes the requested placement", () => {
  assert.match(source, /mode === "placement" && inside\(point\)/);
  assert.match(source, /completePlacement\(point\)/);
  assert.match(source, /world\.settlements\.push/);
  assert.match(source, /world\.mountains\.push/);
});
