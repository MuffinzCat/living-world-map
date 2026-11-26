import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const script = await readFile(new URL("src/flyout.js", root), "utf8");
const styles = await readFile(new URL("styles/app.css", root), "utf8");

test("world JSON is contained in an accessible flyout dialog", () => {
  assert.match(html, /id="open-json"[^>]+aria-haspopup="dialog"/);
  assert.match(html, /<dialog id="json-flyout"[^>]+aria-labelledby="data-heading"/);
  assert.match(html, /id="close-json"/);
  assert.match(html, /id="world-data"/);
  assert.match(html, /src="src\/flyout\.js"/);
});

test("flyout supports button, backdrop, and native escape closing", () => {
  assert.match(script, /flyout\.showModal\(\)/);
  assert.match(script, /closeButton\.addEventListener/);
  assert.match(script, /event\.target === flyout/);
  assert.match(html, /<dialog/);
});

test("map frame follows the rendered map aspect ratio", () => {
  assert.match(script, /MutationObserver/);
  assert.match(script, /--map-aspect/);
  assert.match(script, /values\[2\].*values\[3\]/s);
  assert.match(styles, /aspect-ratio: var\(--map-aspect/);
  assert.doesNotMatch(styles, /height: min\(72vh, 760px\)/);
});

test("flyout remains usable across viewport sizes", () => {
  assert.match(styles, /width: min\(38rem, calc\(100vw - 2rem\)\)/);
  assert.match(styles, /height: 100dvh/);
  assert.match(styles, /@media \(max-width: 520px\)/);
});
