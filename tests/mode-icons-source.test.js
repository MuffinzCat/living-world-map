import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("map modes use accessible inline icon buttons", async () => {
  const html = await read("index.html");
  for (const [mode, label] of [["select", "Move settlements"], ["pan", "Move map"], ["brush", "Brush"]]) {
    assert.match(html, new RegExp(`class="icon-button"[^>]*(?:data-mode="${mode}"[^>]*aria-label="${label}"|aria-label="${label}"[^>]*data-mode="${mode}")`));
    assert.match(html, new RegExp(`data-tooltip="${label}"`));
  }
  assert.equal((html.match(/class="mode-icon/g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
});

test("map movement is first and selected by default", async () => {
  const html = await read("index.html");
  assert.ok(html.indexOf('data-mode="pan"') < html.indexOf('data-mode="select"'));
  assert.match(html, /data-mode="pan"[^>]*aria-label="Move map"[^>]*aria-pressed="true"/);
  assert.match(html, /data-mode="select"[^>]*aria-label="Move settlements"[^>]*aria-pressed="false"/);
  assert.match(html, /src="src\/default-mode\.js"/);
  const source = await read("src/default-mode.js");
  assert.match(source, /button\[data-mode="pan"\]/);
  assert.match(source, /\.click\(\)/);
});

test("settlement movement reuses a separated map movement symbol", async () => {
  const html = await read("index.html");
  assert.equal((html.match(/class="move-symbol"/g) ?? []).length, 2);
  assert.match(html, /data-mode="select"[\s\S]*?class="move-symbol-outline"[\s\S]*?class="move-symbol"/);
  const css = await read("styles/app.css");
  assert.match(css, /\.move-symbol-outline \{[^}]*stroke-width: 4;/s);
  assert.match(css, /\.move-symbol-outline \{[^}]*vector-effect: non-scaling-stroke;/s);
});

test("brush icon uses the approved outlined design and orientation", async () => {
  const html = await read("index.html");
  const brush = html.match(/id="brush-mode"[\s\S]*?<\/button>/)?.[0] ?? "";
  assert.match(brush, /class="mode-icon approved-paintbrush"/);
  assert.match(brush, /transform="rotate\(45 12 12\)"/);
  assert.match(brush, /stroke-width="1\.7"/);
  assert.match(brush, /class="paint-fill"/);
  assert.match(brush, /fill="currentColor" stroke="none"/);
});

test("icon controls retain mode and pressed-state hooks", async () => {
  const html = await read("index.html");
  assert.match(html, /id="brush-mode"[^>]*data-mode="brush"[^>]*aria-label="Brush"[^>]*data-tooltip="Brush"[^>]*aria-pressed="false"/);
});

test("tooltips appear for pointer and keyboard focus", async () => {
  const css = await read("styles/app.css");
  assert.match(css, /\.icon-button:hover::after, \.icon-button:focus-visible::after/);
  assert.match(css, /\.mode-icon \{[^}]*stroke: currentColor;/s);
  assert.match(css, /\.icon-button \{[^}]*min-height: 2\.75rem;/s);
});
