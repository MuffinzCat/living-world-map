import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cssDeclarations, expectAttribute, expectLoaded, openingTagWith } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("brush settings use an accessible toolbar flyout", async () => {
  const html = await read("index.html");
  const button = openingTagWith(html, "id", "brush-mode");
  expectAttribute(button, "aria-controls", "brush-controls");
  expectAttribute(button, "aria-expanded", "false");
  const controls = openingTagWith(html, "id", "brush-controls");
  expectAttribute(controls, "role", "group");
  expectAttribute(controls, "aria-label", "Brush controls");
  assert.match(controls, /\bhidden\b/);
  expectLoaded(html, "script", "src/brush-controls.js");
  expectLoaded(html, "style", "styles/brush-flyout.css");
});

test("brush flyout follows map mode selection and supports Escape", async () => {
  const source = await read("src/brush-controls.js");
  assert.match(source, /button\[data-mode\]/);
  assert.match(source, /brushControls\.hidden = !open/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /event\.key === "Escape"/);
});

test("brush undo remains accessible", async () => {
  const html = await read("index.html");
  const undo = openingTagWith(html, "id", "undo-brush");
  expectAttribute(undo, "aria-label", "Undo last brush stroke");
});

test("brush flyout is anchored, hideable, and responsive", async () => {
  const css = await read("styles/brush-flyout.css");
  assert.equal(cssDeclarations(css, ".brush-tool").get("position"), "relative");
  assert.equal(cssDeclarations(css, ".brush-flyout").get("position"), "absolute");
  assert.equal(cssDeclarations(css, ".brush-flyout[hidden]").get("display"), "none");
  assert.match(css, /@media \(max-width: 700px\)/);
});
