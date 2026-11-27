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
  assert.match(html, /class="placement-content-row"[\s\S]*?id="placement-title">Place settlement/);
  assert.match(html, /id="settlement-fields"[\s\S]*?for="settlement-name">Name[\s\S]*?id="settlement-name"[\s\S]*?for="settlement-type">Type[\s\S]*?id="settlement-type"/);
  assert.match(html, /class="placement-action-row">\s*<button id="cancel-placement"/);
});

test("settlement name and type use separate field rows", async () => {
  const html = await read("index.html");
  const fields = html.match(/id="settlement-fields"[\s\S]*?<\/span>/)?.[0] ?? "";
  assert.equal((fields.match(/class="placement-field-row"/g) ?? []).length, 2);
  assert.match(fields, /class="placement-field-row"><label for="settlement-name">Name<\/label><input id="settlement-name"/);
  assert.match(fields, /class="placement-field-row"><label for="settlement-type">Type<\/label><select id="settlement-type"/);
  const css = await read("styles/placement-flyout.css");
  assert.match(css, /#settlement-fields \{[^}]*display: flex;[^}]*flex-direction: column;/s);
  assert.match(css, /\.placement-field-row \{[^}]*display: grid;[^}]*grid-template-columns: auto minmax\(0, 1fr\);/s);
});

test("settlement controls stay within the flyout instead of overflowing", async () => {
  const css = await read("styles/placement-flyout.css");
  assert.match(css, /\.placement-flyout \{[^}]*flex-direction: column;[^}]*align-items: stretch;[^}]*width: fit-content;[^}]*max-width:/s);
  assert.match(css, /\.placement-content-row \{[^}]*display: flex;[^}]*flex-wrap: wrap;[^}]*min-width: 0;/s);
  assert.match(css, /#settlement-fields \{[^}]*min-width: 0;/s);
  assert.match(css, /\.placement-field-row \{[^}]*min-width: 0;/s);
});

test("cancel placement stays visibly contained in a dedicated action row", async () => {
  const html = await read("index.html");
  const flyout = html.match(/id="placement-controls"[\s\S]*?<span id="placement-status"/)?.[0] ?? "";
  assert.match(flyout, /<div class="placement-action-row">\s*<button id="cancel-placement"/);
  const css = await read("styles/placement-flyout.css");
  assert.match(css, /\.placement-action-row \{[^}]*display: flex;[^}]*justify-content: flex-end;[^}]*width: 100%;[^}]*border-top:/s);
  assert.match(css, /#cancel-placement \{[^}]*flex: 0 0 auto;/s);
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
