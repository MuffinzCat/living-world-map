import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("page loads the stylesheet and JavaScript entry module", async () => {
  const html = await read("index.html");
  assert.match(html, /href="styles\/app\.css"/);
  assert.match(html, /type="module" src="src\/main\.js"/);
  assert.match(html, /id="map"/);
  assert.match(html, /id="world-data"/);
});

test("page provides adjustable brush controls", async () => {
  const html = await read("index.html");
  assert.match(html, /id="brush-mode"/);
  assert.match(html, /id="brush-type"/);
  assert.match(html, /id="brush-size"[^>]+type="range"/);
  assert.match(html, /id="brush-size-value"/);
});

test("sample world is valid JSON with a format version", async () => {
  const sample = JSON.parse(await read("data/sample-world.json"));
  assert.equal(sample.formatVersion, 1);
});
