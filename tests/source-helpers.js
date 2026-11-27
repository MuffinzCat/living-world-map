import assert from "node:assert/strict";

export function openingTagWith(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<[^>]+\\b${attribute}="${escaped}"[^>]*>`));
  assert.ok(match, `Expected an element with ${attribute}="${value}"`);
  return match[0];
}

export function expectAttribute(tag, name, value) {
  assert.match(tag, new RegExp(`\\b${name}="${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
}

export function expectLoaded(html, kind, path) {
  const attribute = kind === "script" ? "src" : "href";
  expectAttribute(openingTagWith(html, attribute, path), attribute, path);
}

export function cssDeclarations(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Expected CSS rule for ${selector}`);
  return new Map(match[1].split(";").map(part => part.trim()).filter(Boolean).map(part => {
    const separator = part.indexOf(":");
    return [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }));
}
