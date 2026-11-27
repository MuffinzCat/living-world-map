import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("preview workflow reports publishing, ready, and failed states", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  assert.match(workflow, /Status: Publishing/);
  assert.match(workflow, /Status: Ready/);
  assert.match(workflow, /Status: Failed/);
  assert.match(workflow, /Deployed revision/);
  assert.match(workflow, /Wait for GitHub Pages to serve this revision/);
});

test("preview metadata is generated only in the copied preview", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  const sourceHtml = await read("index.html");
  const sourceCss = await read("styles/app.css");

  assert.match(workflow, /preview_dir="previews\/pr-\$\{PR_NUMBER\}"/);
  assert.match(workflow, /id="pr-preview-build"/);
  assert.match(workflow, /app\.css\?v=\{revision\}/);
  assert.match(workflow, /main\.js\?v=\{revision\}/);
  assert.doesNotMatch(sourceHtml, /pr-preview-build/);
  assert.doesNotMatch(sourceCss, /pr-preview-build/);
});

test("preview workflow preserves cleanup and same-repository restriction", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  assert.match(workflow, /head\.repo\.full_name == github\.repository/);
  assert.match(workflow, /types: \[opened, reopened, synchronize, closed\]/);
  assert.match(workflow, /rm -rf "\$preview_dir"/);
});
