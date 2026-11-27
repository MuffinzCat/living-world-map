import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cssDeclarations, expectAttribute, expectLoaded, openingTagWith } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("placement actions share the accessible toolbar container", async () => {
  const html = await read("index.html");
  const toolbar = openingTagWith(html, "id", "tool-options-toolbar");
  assert.match(toolbar, /\bhidden\b/);
  const content = openingTagWith(html, "id", "placement-controls");
  expectAttribute(content, "role", "group");
  expectAttribute(content, "aria-labelledby", "placement-title");
  assert.match(content, /\bhidden\b/);
  for (const id of ["add-settlement", "add-mountain"]) {
    const button = openingTagWith(html, "id", id);
    expectAttribute(button, "aria-controls", "tool-options-toolbar");
    expectAttribute(button, "aria-expanded", "false");
  }
  expectLoaded(html, "script", "src/placement-controls.js");
  expectLoaded(html, "style", "styles/toolbar-flyout.css");
});

test("settlement fields keep correct label associations", async () => {
  const html = await read("index.html");
  assert.match(html, /<label for="settlement-name">Name<\/label>/);
  assert.ok(openingTagWith(html, "id", "settlement-name"));
  assert.match(html, /<label for="settlement-type">Type<\/label>/);
  assert.ok(openingTagWith(html, "id", "settlement-type"));
  assert.ok(openingTagWith(html, "id", "cancel-placement"));
});

test("settlement controls align and wrap inside the shared toolbar", async () => {
  const css = await read("styles/toolbar-flyout.css");
  assert.equal(cssDeclarations(css, "#settlement-fields").get("display"), "flex");
  assert.equal(cssDeclarations(css, ".placement-field-row").get("display"), "flex");
  assert.equal(cssDeclarations(css, ".placement-field-row > :is(input, select)").get("min-width"), "0");
  assert.equal(cssDeclarations(css, ".placement-content-row").get("min-width"), "0");
});

test("placement cancellation remains visibly contained", async () => {
  const css = await read("styles/toolbar-flyout.css");
  assert.equal(cssDeclarations(css, ".placement-action-row").get("justify-content"), "flex-end");
  assert.equal(cssDeclarations(css, "#cancel-placement").get("flex"), "0 0 auto");
});

test("placement content switches context and closes safely", async () => {
  const source = await read("src/placement-controls.js");
  assert.match(source, /settlementFields\.hidden = !settlement/);
  assert.match(source, /settlement \? "Place settlement" : "Place mountain"/);
  assert.match(source, /showToolOptions\(placementFlyout\)/);
  assert.match(source, /hideToolOptions\(placementFlyout\)/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /event\.key === "Escape"/);
});
