import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("brush settings live in an accessible toolbar flyout", async () => {
  const html = await read("index.html");
  assert.match(html, /id="brush-mode"[^>]*aria-controls="brush-controls"[^>]*aria-expanded="false"/);
  assert.match(html, /id="brush-controls" class="brush-flyout" role="group" aria-label="Brush controls" hidden/);
  assert.ok(html.indexOf('id="brush-controls"') < html.indexOf('class="toolbar-spacer"'));
  assert.match(html, /src="src\/brush-controls\.js"/);
  assert.match(html, /href="styles\/brush-flyout\.css"/);
});

test("brush flyout follows map mode selection and supports Escape", async () => {
  const source = await read("src/brush-controls.js");
  assert.match(source, /button\[data-mode\]/);
  assert.match(source, /button === brushButton/);
  assert.match(source, /brushControls\.hidden = !open/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /event\.key === "Escape"/);
});

test("brush undo is a labelled leftward circular arrow inside the flyout", async () => {
  const html = await read("index.html");
  const flyout = html.match(/id="brush-controls"[\s\S]*?<\/span>\s*<\/span>/)?.[0] ?? "";
  assert.match(flyout, /id="undo-brush"/);
  assert.match(flyout, /aria-label="Undo last brush stroke"/);
  assert.match(flyout, /<svg viewBox="0 0 24 24" aria-hidden="true">/);
  assert.match(flyout, /M8 7H3v-5/);
  assert.match(flyout, /A9 9 0 1 1 5 18/);
});

test("flyout is anchored to the brush tool and remains responsive", async () => {
  const css = await read("styles/brush-flyout.css");
  assert.match(css, /\.brush-tool \{[^}]*position: relative;/s);
  assert.match(css, /\.brush-flyout \{[^}]*position: absolute;/s);
  assert.match(css, /\.brush-flyout\[hidden\] \{ display: none; \}/);
  assert.match(css, /@media \(max-width: 700px\)/);
});
