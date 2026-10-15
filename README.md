# Veronika Rosicova: CV site

[![CI](https://github.com/rveruna/rveruna.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/rveruna/rveruna.github.io/actions/workflows/ci.yml)

**[Live site](https://rveruna.github.io/)**

My CV as an interactive page: a career told as a bus route, live project demos you can open as case studies, a keyboard command palette, and a print stylesheet that turns the same data into a plain two-page CV.

React, TypeScript and Vite. No animation library, no UI kit.

## What's in it

- **Career as a bus route.** An SVG road winds past each job. The bus is placed on it from the scroll position (`getPointAtLength`, with a binary search to find the point at the current height). The road and cards are laid out from measured card heights, so nothing overlaps at any width.
- **Physics hero.** The letters of my name are spring-driven and flee the cursor. The spring is a pure function (`src/lib/spring.ts`).
- **Case studies with live demos.** Project cards morph into a dialog using the View Transitions API, with the deployed app embedded. Browsers without it just open the dialog.
- **⌘K / Ctrl+K command palette.** An ARIA combobox: jump to a section, open a project or link, or print the CV.
- **Print CV.** `@media print` hides the app and shows a linear CV built from the same data (`src/data/cv.ts`), so the site and the PDF cannot disagree.

## Decisions worth a look

- **One data file.** Jobs, projects, links and skills live in `src/data/cv.ts`. The route, cards, palette and print CV all read it.
- **Pure logic, tested.** Route layout, nearest-stop and path-length search, command scoring and spring physics have unit tests. One test pins a bug I hit: fuzzy search matched "pdf" against hidden keywords.
- **Calm layout when it can't be wow.** Phones, tablets and touch screens get stacked cards and a static name. Anyone with `prefers-reduced-motion` gets no hero physics, no view transitions and no continuous bus movement: the bus just sits at the stop you're reading.
- **Accessible by construction.** Skip link, native `<dialog>` focus handling, focus returned to the card on close, a real heading structure, visible focus rings, 44px targets, and screen-reader text for the physics letters.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm test
npm run lint
npm run format
```

## Not done

- No Lighthouse or axe run in CI yet, so accessibility and performance are checked by hand and by lint rules, not gated.
- The View Transitions animation is verified to open, close and return focus. I have not checked its look in Safari or Firefox.
- Embedded demos load from their own GitHub Pages sites, so the case-study dialog needs a network connection.
