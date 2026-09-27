# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A printable A4-landscape presentation deck for **núcleomap** (industrial automation: PLC/robot programming, electrical/mechanical projects). Content is in pt-BR. There is no JavaScript, no framework and no bundler: just one HTML file plus one compiled stylesheet.

- `Apresentacao.html` (repo root) is the whole deck (~700 KB): 13 `<section class="l-page">` pages (cover, quem somos, soluções overview, one page per solution — 5 engineering + 3 "Indústria 4.0": dados/OEE, IA, software —, experiência, contato). The Indústria 4.0 pages use HTML diagrams (`c-oee`, `c-flow`, `c-stack` in `_c-industry.scss`) instead of illustrations. Nearly all of the size is the hidden **SVG sprite** at the top of `<body>` (`<symbol id="logo">`, `art-*` illustrations, `icon-*`); pages draw them with `<use href="#…">`. Don't read the file whole; grep for `class="l-page`/`class="c-` or read past the sprite with offset/limit.
- The `*.svg` files at the repo root (`AutomationFactory.svg`, `CarAssembly.svg`, social icons, `logo.svg`, …) are the source artwork. They are **not referenced by path**: their contents are inlined as `<symbol>`s in the HTML sprite. If you change an SVG at the root, you also have to update the inlined symbol. Illustration parts with `class="change-color-in-svg"` are recolored to the brand color by CSS.
- `app/assets/css/style.min.css` (+ `.map`) is the **compiled output** of the Sass under `app/assets/sass/`, and it is committed. The HTML links only this file.

## Commands

```bash
npm install          # from repo root: prettier, webhint, utopia-core-scss
npx prettier --write "Apresentacao.html" "app/**/*.scss"
npx hint Apresentacao.html   # webhint, config in .hintrc
```

No `npm` scripts are defined and there are no tests. To preview, serve the repo root statically (the VS Code workspace is set up for Live Server on port 5501).

**The deliverable is a PDF** printed from the page (one A4 landscape sheet per `.l-page`, via `@page` in `03-generics/_print.scss`). Generate it with headless Chrome; `--virtual-time-budget` gives the Google Fonts (Montserrat + Roboto) time to load so they get embedded:

```powershell
& "$env:ProgramFiles/Google/Chrome/Application/chrome.exe" --headless=new --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf=Apresentacao-NucleoMAP.pdf "file:///D:/Repos/Apresentacao/Apresentacao.html"
```

**Sass compilation has no script in the repo.** The minified CSS was produced by an editor extension (Live Sass Compiler style). To regenerate it from the CLI, run from the repo root after `npm install`:

```bash
npx sass --style=compressed app/assets/sass/index.scss app/assets/css/style.min.css
```

`sass` isn't a declared dependency, so `npx` will fetch it. `01-settings/_typography.scss` imports utopia through a hard-coded relative path to the **repo-root** `node_modules` (`../../../../node_modules/utopia-core-scss/...`), so `npm install` must run at the root before compiling. Always recompile and commit `style.min.css` after editing any `.scss`, because the page never loads Sass directly.

## Sass architecture (ITCSS + cascade layers)

`index.scss` declares `@layer settings, tools, generics, elements, objects, components, utilities;` and loads each numbered folder into its layer through `meta.load-css`. Each folder has an `_index.scss` that `@forward`s its partials, so **a new partial must be added to its folder's `_index.scss`**.

- `01-settings`: design tokens emitted as CSS custom properties on `:root` (colors in HSL built from `--color-brand-hue`, fluid type and space scales from utopia `--step-*`/`--space-*`, sizing, transitions, z-index). It also holds the `breakpoint($point)` mixin (`small-up`, `medium-down`, …, or a raw px number).
- `02-tools`: tiny accessor functions over those custom properties: `v(name)` → `var(--name)`, `color(name)` → `var(--color-name)`, `z-index(name)` → `var(--z-index-name)`. Component partials `@use` these and never hard-code values.
- `06-components` (`c-*`) and `07-layouts` (`l-*`): note that layouts are loaded into the **`components`** layer, not a separate one, and after the components, so an `l-*` rule wins over a `c-*` rule of equal specificity on the same element. Nest a component inside `.l-page__body` rather than putting both classes on one element.
- `99-utilities`: highest-priority layer.

Naming is BEM with ITCSS prefixes: `c-block__element--modifier` for components and `l-*` for layout regions. Layout: `.l-deck` stacks `.l-page`s; each `.l-page` has `aspect-ratio: 297 / 210` on screen and is exactly 297mm × 210mm in print. `.l-page` is a size container, and everything inside is sized with the `--slide-*` tokens (`01-settings/_slide.scss`, in `cqi` units), so a page looks identical on screen and on paper. Don't use the viewport-based utopia `--step-*`/`--space-*` scales inside pages. The `.c-reader-bar` scroll-progress bar is pure CSS (`animation-timeline: scroll()`).

## Formatting config quirks

- There are two Prettier configs. `.prettierrc.json` (printWidth 100, `trailingComma: all`) takes precedence over `prettier.config.js` (printWidth 120, SCSS override to 9999), so the `.js` one is effectively ignored.
- `.prettierignore` excludes `01-settings/_sizing.scss` (long utopia-generated lines). Its `style/03-generics/...` entry is a stale path.
- `.hintrc` treats `disown-opener` as an error (external links need `rel="noopener"`) and warns on inline styles, including `<style>` elements.
