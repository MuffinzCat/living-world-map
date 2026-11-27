import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("placement controls use one contextual toolbar flyout", async () => {
  const html = await read("index.html");
  assert.match(html, /id="placement-controls" class="placement-flyout"[^>]*hidden/);
  assert.match(html, /id="add-settlement"[^>]*aria-controls="placement-controls"[^>]*aria-expanded="false"/);
  assert.match(html, /id="add-mountain"[^>]*aria-controls="placement-controls"[^>]*aria-expanded="false"/);
  assert.match(html, /src="src\/placement-controls\.js"/);
  assert.match(html, /href="styles\/placement-flyout\.css"/);
});

test("settlement flyout has concise title, name, type, and cancel controls", async () => {
  const html = await read("index.html");
  assert.match(html, /id="placement-title">Place settlement/);
  assert.match(html, /id="settlement-fields"[\s\S]*?for="settlement-name">Name[\s\S]*?id="settlement-name"[\s\S]*?for="settlement-type">Type[\s\S]*?id="settlement-type"/);
  assert.match(html, /id="cancel-placement"/);
});

test("mountain flyout hides settlement-only fields and keeps cancel", async () => {
  const source = await read("src/placement-controls.js");
  assert.match(source, /settlementFields\.hidden = !settlement/);
  assert.match(source, /settlement \? "Place settlement" : "Place mountain"/);
  assert.match(source, /button\.parentElement\.append\(placementFlyout\)/);
});

test("placement flyout closes when placement ends or Escape is pressed", async () => {
  const source = await read("src/placement-controls.js");
  assert.match(source, /MutationObserver/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /event\.key === "Escape"/);
});
