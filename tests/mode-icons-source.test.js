import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cssDeclarations, expectAttribute, openingTagWith } from "./source-helpers.js";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("map tools expose accessible names and tooltips", async () => {
  const html = await read("index.html");
  for (const [mode, label] of [["select", "Move settlements"], ["pan", "Move map"], ["brush", "Brush"]]) {
    const button = openingTagWith(html, "data-mode", mode);
    expectAttribute(button, "aria-label", label);
    expectAttribute(button, "data-tooltip", label);
    expectAttribute(button, "aria-pressed", mode === "pan" ? "true" : "false");
  }
});

test("map movement is the default tool", async () => {
  const source = await read("src/default-mode.js");
  assert.match(source, /button\[data-mode="pan"\]/);
});

test("tool icons remain visible and keyboard tooltips remain available", async () => {
  const html = await read("index.html");
  for (const mode of ["select", "pan", "brush"]) {
    const buttonStart = html.indexOf(openingTagWith(html, "data-mode", mode));
    const buttonEnd = html.indexOf("</button>", buttonStart);
    assert.match(html.slice(buttonStart, buttonEnd), /<svg\b[^>]*class="[^"]*mode-icon/);
  }
  const css = await read("styles/app.css");
  assert.equal(cssDeclarations(css, ".mode-icon").get("stroke"), "currentColor");
  assert.match(css, /\.icon-button:hover::after, \.icon-button:focus-visible::after/);
});
