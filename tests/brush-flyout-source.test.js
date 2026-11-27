import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cssDeclarations, expectAttribute, expectLoaded, openingTagWith } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("brush settings use the shared accessible toolbar", async () => {
  const html = await read("index.html");
  const button = openingTagWith(html, "id", "brush-mode");
  expectAttribute(button, "aria-controls", "brush-controls");
  expectAttribute(button, "aria-expanded", "false");
  const toolbar = openingTagWith(html, "id", "tool-options-toolbar");
  assert.match(toolbar, /\bhidden\b/);
  const controls = openingTagWith(html, "id", "brush-controls");
  expectAttribute(controls, "role", "group");
  expectAttribute(controls, "aria-label", "Brush controls");
  assert.match(controls, /\bhidden\b/);
  expectLoaded(html, "script", "src/brush-controls.js");
  expectLoaded(html, "style", "styles/toolbar-flyout.css");
});

test("brush content follows map mode selection and supports Escape", async () => {
  const source = await read("src/brush-controls.js");
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /isToolOptionsVisible\(brushControls\)/);
});

test("brush undo remains accessible", async () => {
  const html = await read("index.html");
  const undo = openingTagWith(html, "id", "undo-brush");
  expectAttribute(undo, "aria-label", "Undo last brush stroke");
});

test("brush content is hideable and responsive inside the shared toolbar", async () => {
  const css = await read("styles/toolbar-flyout.css");
  assert.equal(cssDeclarations(css, ".tool-options-content").get("display"), "flex");
  assert.equal(cssDeclarations(css, ".tool-options-content[hidden]").get("display"), "none");
  assert.equal(cssDeclarations(css, ".brush-flyout").get("justify-content"), "flex-start");
  assert.match(css, /@media \(max-width: 700px\)/);
});
