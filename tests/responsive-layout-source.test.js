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

test("all current and future toolbar flyouts share one container and stylesheet", async () => {
  const html = await read("index.html");
  const css = await read("styles/toolbar-flyout.css");
  assert.match(html, /styles\/toolbar-flyout\.css/);
  assert.match(html, /id="tool-options-toolbar" class="tool-options-toolbar"/);
  assert.match(html, /id="brush-controls" class="tool-options-content brush-flyout"/);
  assert.match(html, /id="placement-controls" class="tool-options-content placement-flyout"/);
  assert.equal((html.match(/class="tool-options-toolbar"/g) ?? []).length, 1);
  assert.match(css, /--toolbar-flyout-min-height:/);
  assert.equal(cssDeclarations(css, ".tool-options-toolbar").get("min-height"), "var(--toolbar-flyout-min-height)");
});

test("all tool triggers target the one toolbar container", async () => {
  const html = await read("index.html");
  for (const id of ["add-settlement", "add-mountain", "brush-mode"]) {
    const button = html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`))?.[0] ?? "";
    assert.match(button, /aria-controls="tool-options-toolbar"/);
  }
});

test("switching tool content does not close or reopen the toolbar", async () => {
  const source = await read("src/tool-options.js");
  assert.match(source, /const toolbar = document\.querySelector\("#tool-options-toolbar"\)/);
  assert.match(source, /contents\.forEach\(item => \{ item\.hidden = item !== content; \}\)/);
  assert.match(source, /const opening = toolbar\.hidden/);
  assert.match(source, /classList\.toggle\("animate-open", opening\)/);
  assert.match(source, /if \(activeContent !== content\) return/);
  assert.doesNotMatch(source, /pendingSwitch|hideOtherToolbars|visibleToolbar/);
});
