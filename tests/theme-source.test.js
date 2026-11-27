import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("theme control is accessible and loaded", async () => {
  const html = await read("index.html");
  assert.match(html, /id="theme-toggle" type="button" aria-pressed="false"/);
  assert.match(html, /src="src\/theme\.js"/);
});

test("saved or system dark theme is applied before styles finish loading", async () => {
  const html = await read("index.html");
  assert.match(html, /localStorage\.getItem\("living-world-map-theme"\)/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.ok(html.indexOf("living-world-map-theme") < html.indexOf("styles/app.css"));
});

test("explicit theme choices are persistent", async () => {
  const source = await read("src/theme.js");
  assert.match(source, /localStorage\.setItem\(STORAGE_KEY, theme\)/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /dataset\.theme/);
});

test("dark mode themes interface chrome without transforming map artwork", async () => {
  const css = await read("styles/app.css");
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /#map \{[^}]*color-scheme: only light;/s);
  assert.doesNotMatch(css, /#map[^{}]*\{[^}]*(filter|opacity|mix-blend-mode|transform):/s);
});
