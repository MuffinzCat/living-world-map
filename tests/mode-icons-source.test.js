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
  assert.equal((html.match(/class="mode-icon"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
});

test("icon controls retain mode and pressed-state hooks", async () => {
  const html = await read("index.html");
  assert.match(html, /data-mode="select"[^>]*aria-pressed="true"/);
  assert.match(html, /data-mode="pan"[^>]*aria-pressed="false"/);
  assert.match(html, /id="brush-mode"[^>]*data-mode="brush"[^>]*aria-label="Brush"[^>]*data-tooltip="Brush"[^>]*aria-pressed="false"/);
});

test("tooltips appear for pointer and keyboard focus", async () => {
  const css = await read("styles/app.css");
  assert.match(css, /\.icon-button:hover::after, \.icon-button:focus-visible::after/);
  assert.match(css, /\.mode-icon \{[^}]*stroke: currentColor;/s);
  assert.match(css, /\.icon-button \{[^}]*min-height: 2\.75rem;/s);
});
