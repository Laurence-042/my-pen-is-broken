## Purpose

This file helps AI coding agents get productive quickly in the `my-pen-is-broken` repo by calling out architecture, workflows, and project-specific conventions.

## Big picture

- Single-page JavaScript app built with Webpack that bundles `src/index.js` into `dist/index.bundle.js` and produces an HTML shell (`src/index.html`).
- Primary runtime is a bookmarklet-style script (see `preBuild/auto.js` and `preBuild/manual.js`) that runs on arbitrary pages to detect and highlight Chinese-sensitive words.
- The app fetches a remote sensitive-word list (GBK-encoded) and converts page text to pinyin to perform fuzzy matches. See `src/index.js` for the matching pipeline (pinyin conversion -> find positions -> DOM replacement).

## Key files (examples to reference)

- `src/index.js` — main logic: pinyin conversion (`toPinyin`), DOM traversal (`getAllSusLeafNodesWIthText`), sensitive-word fetch `getAllSensitiveWords()` and match logic `findSensitiveWordPositions()`; contains `autoMode` flag and UI alarm helper.
- `preBuild/auto.js` and `preBuild/manual.js` — bookmarklet snippets derived from the source; used by README instructions and end-users.
- `src/index.html` — HTML template used by HtmlWebpackPlugin.
- `webpack.config.js` & `webpack.config.product.js` — build configuration (both currently set to `mode: 'production'`), output goes to `dist/`.
- `package.json` — scripts: `npm run build` (webpack), `npm run start` (webpack-dev-server open), `npm run watch` (webpack --watch).

## Build, run, and test workflows

- Local dev + live reload: `npm run start` (starts webpack dev server and opens browser)
- Production bundle: `npm run build` -> outputs to `dist/` (open `dist/index.html` to test manually)
- Quick watch rebuilds: `npm run watch`
- There are no automated tests in `package.json` — unit testing is not present; treat runtime/manual testing as primary verification.

## Project-specific conventions & patterns

- DOM selection: code treats leaf text nodes only (filter `:not(script):not(style)` and `!item.children.length`), so modifications should keep that pattern or explicitly handle non-leaf nodes.
- Text normalization: the project converts characters to pinyin (using the `pinyin` dependency) and matches on pinyin tokens; modifications to matching must preserve the token array shape (array of strings, non-pinyin characters preserved as separate tokens).
- External data: sensitive words are fetched live from a remote GitHub URL and decoded with `TextDecoder('gbk')`. For offline development, mock `getAllSensitiveWords()` or replace the fetch with a local fixture.
- UI: highlights are done by replacing matched text with a red `<span>` and (for click mode) calling `alarm()` to show pinyin. If changing visual behavior, update the CSS strings defined at the bottom of `src/index.js`.

## Integration points & dependencies

- External resources: sensitive-word list at `https://raw.githubusercontent.com/57ing/Sensitive-word/...` (GBK encoded) — network dependency and charset handling is important.
- NPM deps used at runtime/compile: `pinyin`, `howler`, `lodash`, `outmatch`, `@rse/soundfx`. Build tool deps: `webpack`, `babel-loader`, `@babel/preset-env`, `html-webpack-plugin`, `webpack-dev-server`.

## Examples for common agent tasks

- To add a new DOM-based rule: edit `src/index.js` — add or modify `getAllSusLeafNodesWIthText()` or the `susTextClickHandler()` flow. Keep the pinyin pipeline intact.
- To change the bookmarklet output: update `preBuild/*.js` and the README instructions that reference the bookmarklet generator workflow.
- To debug matching locally without network calls: replace `getAllSensitiveWords()` with a small hard-coded list (see the commented example at the top of that function in `src/index.js`).

## Small notes & gotchas for AI agents

- Webpack is configured to run in `production` by default in the config files — use `npm run start` to get dev server behavior. If you change `mode`, be explicit about source maps (`devtool`) and `output.clean` usage.
- The pinyin logic treats non-ASCII tokens as separators; tests editing or extending matching must account for interleaved non-pinyin tokens.
- The app mutates page DOM in-place when highlighting; prefer creating test fixtures and DOM snapshots for unit tests rather than running on arbitrary pages.

If anything here is unclear or you'd like more examples (unit test stubs, mocked `getAllSensitiveWords()` fixture, or an alternate dev build), tell me which piece to expand and I'll iterate.
