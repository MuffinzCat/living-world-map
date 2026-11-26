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

## Canonical world data

Worlds use versioned JSON with these top-level fields:

- `formatVersion`: currently `1`
- `canvas`: positive `width` and `height`
- `terrain`: land and water polygons with point arrays
- `settlements`: stable ID, name, type and x/y position
- `roads`: settlement ID pairs in `from` and `to`
- `rivers`: point paths
- `forests` and `mountains`: x/y positions
- `mountainRanges`: point paths with an optional positive size
- `brushStrokes`: land, water or `mountainRange` strokes with size and points
- `notes`: plain text shown with the map

All points are readable `[x, y]` pairs. Loading always migrates into this canonical shape before validation and saving.

### Legacy compatibility

Unversioned prototype files are accepted and migrated. Recognised rivers, forests, mountains and mountain ranges that were stored in `terrain` move to their canonical collections. Terrain entries marked as brushes by `size`, `brush: true` or `kind: "brush"` move to `brushStrokes`. Legacy `mountain_range`, `mountain_ranges`, `brush_strokes` names are normalised. Unknown terrain entries stay in `terrain` so validation reports them rather than silently discarding data. Explicit future or unsupported `formatVersion` values are rejected.

## Development rules

Keep the project readable and hobby-sized. Avoid frameworks, generated bundles, unnecessary abstractions and coding agents. Changes go through pull requests, automated checks and manual browser testing.
