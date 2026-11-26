# Living World Map

A lightweight, data-first fantasy map editor for worlds that grow during play.

## Technical foundation

- Browser-native HTML, CSS and JavaScript
- Native ES modules, with no framework or build step
- SVG map rendering
- Versioned JSON world files
- Static deployment through GitHub Pages
- Dependency-free checks using Node.js built-ins

## Run locally

From the repository root, start any static file server. For example:

```sh
python3 -m http.server 8000
```

Then open `http://<scrubbed-url-domain>/%60.

Opening `index.html` directly is not supported because the application loads JavaScript modules and JSON data.

## Project structure

- `index.html` provides the application shell.
- `styles/` contains presentation styles.
- `src/` contains small browser-native JavaScript modules.
- `data/` contains readable world files.
- `tests/` contains dependency-free regression and smoke checks.

## World data

Worlds use versioned JSON. `formatVersion` allows older files to be migrated deliberately rather than silently breaking them. The canonical format will be documented as the editor is rebuilt.

## Development rules

Keep the project readable and hobby-sized. Avoid frameworks, generated bundles, unnecessary abstractions and coding agents. Changes go through pull requests, automated checks and manual browser testing.
