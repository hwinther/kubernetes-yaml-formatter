# Change Log

All notable changes to the "yet-another-better-yaml-formatter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 0.2.2 (02 July 2026)

- Lower the minimum required VS Code version (`engines.vscode`) back to `^1.63.0`. It had been raised to `^1.118.0`, which blocked installation on editors that bundle an older VS Code (e.g. Cursor, VSCodium) even though the extension only uses long-stable formatter APIs.

## 0.2.1 (14 May 2026)

Now also published to Open VSX registry.

## 0.2.0 (12 May 2026)

Updated to node 24 and updated all dependencies.

## 0.1.0 (11 May 2026)

First release under the `hwinther` publisher (fork of [longkai/kubernetes-yaml-formatter](https://github.com/longkai/kubernetes-yaml-formatter)). Version reset to reflect a new Marketplace listing.

- Add `github-actions-workflow` to supported language IDs so the formatter activates on files under `.github/workflows/` when the GitHub Actions extension is installed.

## Prior history (upstream `kennylong.kubernetes-yaml-formatter`)

## 2.5.0 (12 Jun 2025)

- Respect range indents when pasting code snippets.

## 2.4.0 (03 Dec 2024)

- add `better-yaml.flowCollectionPadding` option. When true, a single space of padding will be added inside the delimiters of non-empty single-line flow collections. Default true.

## 2.3.0 (19 Nov 2024)

- add `better-yaml.documentOptions.version` global option to set YAML version used by documents without a %YAML directive.
- upgrade dependencies.

## 2.0.0 (03 Nov 2024)

Rename to **Better YAML Formatter** since it works well with what you think about YAML :)

- Rewrite from grounding with **Correct**, **Consistent** and **Customized** result.
- Add universal platform support where VS Code runs including web browser!
- Add extension preview support staring this version.
- Add range formatting support!
- Add builtin helm and ansible support(with range formatting or valid content).
- Add comment string customization support.
- Add fine grained directives support.
- Bug fixes.

## 1.1.0 (20 Oct 2022)

This release is brought you from my work place, [Shenzhen](https://en.wikipedia.org/wiki/Shenzhen).

- Add builtin Emoji support!
- Add a new setting `kubernetes-yaml-formatter.includeDocumentStart` to include `---` at document start(default `false`).

## 1.0.0 (30 Sep 2022)

Hello, World from my hometown, [Guilin](https://en.wikipedia.org/wiki/Guilin)!

Initial release of the kubernetes style yaml formatter which allows you to customize the sequence indent style.
