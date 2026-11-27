import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cssDeclarations, expectAttribute, expectLoaded, openingTagWith } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("placement actions share an accessible contextual flyout", async () => {
  const html = await read("index.html");
  const flyout = openingTagWith(html, "id", "placement-controls");
  expectAttribute(flyout, "role", "group");
  expectAttribute(flyout, "aria-labelledby", "placement-title");
  assert.match(flyout, /\bhidden\b/);
  for (const id of ["add-settlement", "add-mountain"]) {
    const button = openingTagWith(html, "id", id);
    expectAttribute(button, "aria-controls", "placement-controls");
    expectAttribute(button, "aria-expanded", "false");
  }
  expectLoaded(html, "script", "src/placement-controls.js");
  expectLoaded(html, "style", "styles/placement-flyout.css");
});

test("settlement fields keep correct label associations", async () => {
  const html = await read("index.html");
  assert.match(html, /<label for="settlement-name">Name<\/label>/);
  assert.ok(openingTagWith(html, "id", "settlement-name"));
  assert.match(html, /<label for="settlement-type">Type<\/label>/);
  assert.ok(openingTagWith(html, "id", "settlement-type"));
  assert.ok(openingTagWith(html, "id", "cancel-placement"));
});

test("settlement controls use separate rows aligned inside the flyout", async () => {
  const css = await read("styles/placement-flyout.css");
  assert.equal(cssDeclarations(css, "#settlement-fields").get("flex-direction"), "column");
  assert.equal(cssDeclarations(css, ".placement-field-row").get("display"), "grid");
  assert.equal(cssDeclarations(css, ".placement-field-row > :is(input, select)").get("justify-self"), "end");
  assert.equal(cssDeclarations(css, ".placement-content-row").get("min-width"), "0");
});

test("placement cancellation remains visibly contained", async () => {
  const css = await read("styles/placement-flyout.css");
  assert.equal(cssDeclarations(css, ".placement-action-row").get("justify-content"), "flex-end");
  assert.equal(cssDeclarations(css, ".placement-action-row").get("width"), "100%");
});

test("placement flyout switches context and closes safely", async () => {
  const source = await read("src/placement-controls.js");
  assert.match(source, /settlementFields\.hidden = !settlement/);
  assert.match(source, /settlement \? "Place settlement" : "Place mountain"/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /event\.key === "Escape"/);
});
