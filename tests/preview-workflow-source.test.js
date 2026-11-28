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

test("preview workflow preserves the pull request security and concurrency boundary", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  assert.match(workflow, /on:\r?\n\s+pull_request:/);
  assert.doesNotMatch(workflow, /pull_request_target/);
  assert.match(workflow, /head\.repo\.full_name == github\.repository/);
  assert.match(workflow, /types: \[opened, reopened, synchronize, closed\]/);
  assert.match(workflow, /group: preview-\$\{\{\s*github\.event\.pull_request\.number\s*\}\}/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /rm -rf "\$preview_dir"/);
  assert.match(workflow, /preview_dir="previews\/pr-\$\{PR_NUMBER\}"/);
});

test("preview readiness downloads and evaluates the complete response", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  assert.match(workflow, /response_file=\$\(mktemp\)/);
  assert.match(workflow, /trap 'rm -f "\$response_file"' EXIT/);
  assert.match(workflow, /curl --fail --silent --show-error --output "\$response_file" "\$attempt_url"/);
  assert.match(workflow, /if curl --fail --silent --show-error --output/);
  assert.match(workflow, /else\s+curl_status=\$\?/);
  assert.match(workflow, /grep --fixed-strings --quiet "\$short_sha" "\$response_file"/);
  assert.match(workflow, /attempt=\$\{attempt\}&timestamp=\$\{timestamp\}/);
  assert.match(workflow, /GitHub Pages is serving revision \$\{short_sha\}/);
  assert.match(workflow, /does not contain revision \$\{short_sha\} yet/);
  assert.match(workflow, /Pages request failed on attempt.*curl exit \$\{curl_status\}/);
  assert.match(workflow, /retrying\./);
  assert.match(workflow, /for attempt in \$\(seq 1 30\)/);
  assert.match(workflow, /did not serve revision \$\{short_sha\} within the verification window/);
  assert.doesNotMatch(workflow, /curl[^|\n]*\|\s*grep[^|\n]*--quiet/);
  assert.doesNotMatch(workflow, /curl[^|\n]*\|\s*(grep|head|tail|sed|awk)/);
});

test("preview publication fetches and rebases before bounded normal pushes", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  assert.match(workflow, /git fetch origin main/);
  assert.match(workflow, /git rebase origin\/main/);
  assert.match(workflow, /git push origin main/);
  assert.match(workflow, /for attempt in 1 2 3 4 5/);
  assert.match(workflow, /lost a race/);
  assert.match(workflow, /failed after 5 bounded fetch\/rebase\/push attempts/);
  assert.doesNotMatch(workflow, /git push(?: --force|-f)\b|git push origin main --force|git push origin main -f/);
});

test("close cleanup removes only the matching pull request preview", async () => {
  const workflow = await read(".github/workflows/pr-preview.yml");
  assert.match(workflow, /preview_dir="previews\/pr-\$\{PR_NUMBER\}"/);
  assert.match(workflow, /rm -rf "\$preview_dir"/);
  assert.match(workflow, /if \[ "\$PR_ACTION" = "closed" \]/);
  assert.match(workflow, /remove preview for PR #\$\{PR_NUMBER\}/);
  assert.doesNotMatch(workflow, /rm -rf previews(?:\/\*|\$\{[^}]*\}\*)/);
  assert.doesNotMatch(workflow, /chore: remove preview for PR #\$\{PR_NUMBER\}[\s\S]*pull_request_target/);
});
