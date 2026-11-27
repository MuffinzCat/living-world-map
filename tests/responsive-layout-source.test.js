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

test("brush flyout uses toolbar width on narrow screens", async () => {
  const css = await read("styles/brush-flyout.css");
  assert.match(css, /\.brush-tool \{ position: static; \}/);
  assert.match(css, /\.brush-flyout \{ right: 0; left: 0; width: auto;/);
});

test("placement controls open as a full-width sliding toolbar", async () => {
  const css = await read("styles/placement-flyout.css");
  const source = await read("src/placement-controls.js");
  const flyout = cssDeclarations(css, ".placement-flyout");
  assert.equal(flyout.get("position"), "relative");
  assert.equal(flyout.get("width"), "100%");
  assert.equal(flyout.get("border-top"), "0");
  assert.match(flyout.get("animation"), /reveal-placement-toolbar/);
  assert.doesNotMatch(source, /append\(placementFlyout\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
