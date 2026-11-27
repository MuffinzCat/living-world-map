import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const script = await readFile(new URL("src/flyout.js", root), "utf8");
const styles = await readFile(new URL("styles/app.css", root), "utf8");

test("world JSON is contained in an accessible flyout dialog", () => {
  assert.match(html, /id="open-json"[^>]+aria-haspopup="dialog"/);
  assert.match(html, /aria-controls="json-flyout"[^>]+aria-expanded="false"/);
  assert.match(html, /<dialog id="json-flyout"[^>]+aria-labelledby="data-heading"/);
  assert.match(html, /id="close-json"/);
  assert.match(html, /id="world-data"/);
  assert.match(html, /src="src\/flyout\.js"/);
});

test("closed flyout is removed from layout", () => {
  assert.match(styles, /\.data-panel:not\(\[open\]\) \{ display: none; \}/);
});

test("flyout opens non-modally and supports button and escape closing", () => {
  assert.match(script, /flyout\.show\(\)/);
  assert.doesNotMatch(script, /showModal/);
  assert.match(script, /closeButton\.addEventListener/);
  assert.match(script, /event\.key === "Escape"/);
  assert.match(script, /json-flyout-open/);
});

test("open flyout is docked right and shrinks the editor", () => {
  assert.match(styles, /\.data-panel\[open\][^{]*\{[^}]*position: fixed/s);
  assert.match(styles, /inset: 0 0 0 auto/);
  assert.match(styles, /body\.json-flyout-open \.site-header, body\.json-flyout-open \.app-shell \{ margin-right: var\(--flyout-width\); \}/);
});

test("the editor fits inside the browser viewport without page scrolling", () => {
  assert.match(styles, /html, body \{[^}]*height: 100%[^}]*overflow: hidden/s);
  assert.match(styles, /body \{[^}]*display: flex[^}]*flex-direction: column/s);
  assert.match(styles, /\.app-shell \{[^}]*min-height: 0[^}]*flex: 1 1 auto[^}]*overflow: hidden/s);
  assert.match(styles, /\.panel \{[^}]*height: 100%[^}]*min-height: 0[^}]*flex-direction: column/s);
  assert.match(styles, /\.map-frame \{[^}]*min-height: 0[^}]*flex: 1 1 auto[^}]*overflow: hidden/s);
});

test("shared tool-options controller opens only one content panel", async () => {
  const source = await readFile(new URL("src/tool-options.js", root), "utf8");
  assert.match(source, /getContents\(\)\.forEach\(item => \{ item\.hidden = item !== content; \}\)/);
  assert.match(source, /#roads-mode/);
  assert.match(source, /data-mode="select"/);
  assert.match(source, /document\.addEventListener\("tool-change"/);
  assert.match(source, /hideToolOptions\(activeContent\)/);
  assert.match(source, /if \(!content \|\| activeContent !== content\) return/);
});

test("narrow screens use a full-width flyout without squeezing the map", () => {
  assert.match(styles, /@media \(max-width: 700px\)/);
  assert.match(styles, /--flyout-width: 100vw/);
  assert.match(styles, /margin-right: 0/);
});
