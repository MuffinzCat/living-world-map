import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cssDeclarations } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("editor shell can shrink without page overflow", async () => {
  const css = await read("styles/app.css");
  assert.equal(cssDeclarations(css, "body").get("min-width"), "0");
  assert.equal(cssDeclarations(css, ".app-shell").get("min-width"), "0");
  assert.equal(cssDeclarations(css, ".panel").get("max-width"), "100%");
  assert.equal(cssDeclarations(css, ".map-frame").get("min-width"), "0");
});

test("spacing and heading size respond to the viewport", async () => {
  const css = await read("styles/app.css");
  assert.match(css, /--page-gap: clamp\(/);
  assert.match(css, /\.site-header h1 \{[^}]*font-size: clamp\(/s);
  assert.match(css, /padding: clamp\([^;]+\) clamp\(/);
});

test("narrow headers wrap actions while preserving map space", async () => {
  const css = await read("styles/app.css");
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /\.site-header \{ max-height: 42dvh; overflow-y: auto; \}/);
  assert.match(css, /\.actions > button \{ flex: 1 1 9rem; \}/);
  assert.match(css, /\.toolbar-spacer \{ flex-basis: 100%; height: 0; \}/);
});

test("JSON panel remains within the viewport", async () => {
  const css = await read("styles/app.css");
  assert.equal(cssDeclarations(css, ".data-panel[open]").get("max-width"), "100vw");
  assert.equal(cssDeclarations(css, ".data-panel[open]").get("max-height"), "100dvh");
});

test("all current and future toolbar flyouts share one stylesheet and minimum size", async () => {
  const html = await read("index.html");
  const css = await read("styles/toolbar-flyout.css");
  assert.match(html, /styles\/toolbar-flyout\.css/);
  assert.doesNotMatch(html, /styles\/(?:brush|placement)-flyout\.css/);
  assert.match(html, /id="brush-controls" class="tool-options-toolbar brush-flyout"/);
  assert.match(html, /id="placement-controls" class="tool-options-toolbar placement-flyout"/);
  assert.match(css, /--toolbar-flyout-min-height:/);
  assert.equal(cssDeclarations(css, ".tool-options-toolbar").get("min-height"), "var(--toolbar-flyout-min-height)");
  assert.equal(cssDeclarations(css, ".tool-options-toolbar").get("align-content"), "center");
});

test("tool menus stay outside the main toolbar so they resize the map view", async () => {
  const html = await read("index.html");
  const toolbarEnd = html.indexOf("</div>\n    <div id=\"brush-controls\"");
  assert.ok(toolbarEnd > html.indexOf("class=\"toolbar mode-toolbar\""));
  assert.ok(html.indexOf("id=\"brush-controls\"") < html.indexOf("class=\"map-frame\""));
  assert.ok(html.indexOf("id=\"placement-controls\"") < html.indexOf("class=\"map-frame\""));
});

test("tool menu switching keeps animation suppressed until the menu closes", async () => {
  const shared = await read("src/tool-options.js");
  const css = await read("styles/toolbar-flyout.css");
  assert.match(shared, /visibleToolbar && visibleToolbar !== target/);
  assert.match(shared, /classList\.toggle\("skip-open-animation", switching\)/);
  assert.match(shared, /classList\.remove\("is-open", "skip-open-animation"\)/);
  assert.doesNotMatch(shared, /requestAnimationFrame/);
  assert.equal(cssDeclarations(css, ".tool-options-toolbar.skip-open-animation").get("animation"), "none");
});
