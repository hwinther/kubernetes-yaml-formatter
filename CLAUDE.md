# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A VS Code extension ("Better YAML Formatter", publisher `hwinther`) that replaces VS Code's built-in YAML formatter with one driven by [`eemeli/yaml`](https://github.com/eemeli/yaml). It exists so users can customize behavior the built-in formatter refuses to expose — notably non-indented block sequences for kubectl/kustomize-style YAML. It registers itself as the default formatter for `yaml`, `helm`, and `ansible` document selectors.

## Build, lint, test

```
npm install
npm run compile         # tsc -> out/ (desktop entry: out/extension.js)
npm run compile-web     # webpack -> dist/web/ (browser entry: dist/web/extension.js)
npm run watch           # tsc --watch
npm run lint            # eslint src --ext ts
npm test                # runs pretest (compile + lint) then vscode-test
```

`vscode-test` discovers compiled tests at `out/test/**/*.test.js` (see `.vscode-test.js`), so always run `npm run compile` before invoking it directly. `vscode:prepublish` runs both `compile` and `compile-web` — both targets must build cleanly to publish.

There is no single-test runner script wired up; pass a Mocha grep through `npx vscode-test --grep "<pattern>"` after compiling.

## Architecture

All extension code lives in `src/extension.ts` (~100 lines). The big picture:

- **Two formatter providers** are registered against the `yaml`/`helm`/`ansible` selectors:
  - `registerDocumentFormattingEditProvider` — formats the entire buffer.
  - `registerDocumentRangeFormattingEditProvider` — formats a selected range. This path has two non-obvious adjustments: (1) it forces `directives = null` in `makeFormattingOptions` so a stray `---` document-start marker isn't injected mid-document, and (2) after stringifying it re-indents every line by `range.start.character` spaces via `indent()` so the formatted block lines up with where it was pasted/selected. It also strips a trailing `\n` when the original range did not end in one, to avoid breaking the VS Code `Range`.
- **Option mapping** is the only real logic. `makeFormattingOptions` reads `better-yaml.*` workspace settings and `editor.tabSize`, and maps them to `yaml.ToStringOptions`. `makeDocumentOptions` maps `better-yaml.documentOptions.*` to `yaml.DocumentOptions` (used at parse time). `commentString` is special-cased — when set, it's wrapped as a function that prepends the configured string to each comment.
- **Parse → stringify** happens in `format()`, which uses `YAML.parseAllDocuments` (multi-document aware) and joins the stringified outputs. If parsing throws, the error is both shown via `vscode.window.showErrorMessage` and re-thrown so VS Code's formatter pipeline aborts cleanly. The `|| text` fallback at the end preserves input that the parser returns as empty (e.g. a file containing only comments).

### Adding a new setting

1. Declare it under `contributes.configuration.properties` in `package.json` with type, default, and description.
2. Read it in `makeFormattingOptions` (or `makeDocumentOptions` for parse-time options) via `conf.get('better-yaml.<name>')` and map it to the matching `yaml.ToStringOptions` / `DocumentOptions` field.
3. Mirror the setting in `README.md`'s "Extension Settings" section so docs don't drift.

If the setting must behave differently for range formatting vs. full-document formatting, branch on the `rangeFormatting` parameter passed into `makeFormattingOptions` (see how `directives` is overridden).

## Build targets

The extension ships as a dual-target build:

- **Desktop** — TypeScript compiled by `tsc` per `tsconfig.json` (`module: Node16`, `target: ES2022`, `rootDir: src`, `outDir: out`). `package.json#main` points at `out/extension.js`.
- **Web (browser)** — Bundled by `webpack.config.js` with `target: 'webworker'` to `dist/web/extension.js` (`package.json#browser`). The webpack config provides browser fallbacks for `assert` and `process/browser`. Don't introduce Node-only APIs (`fs`, `child_process`, etc.) — they will break the web build.

## Release

`.github/workflows/release.yaml` packages the extension once with `vsce package` and publishes the same `.vsix` to both the VS Code Marketplace (`vsce publish --packagePath`) and Open VSX (`ovsx publish`) when a tag matching `[0-9]+.[0-9]+.[0-9]+` is pushed. Pre-releases (odd minor) use `--pre-release` on both. The workflow needs the `VSCE_PAT` and `OVSX_PAT` secrets. Bump `version` in `package.json` and add an entry to `CHANGELOG.md` before tagging.
