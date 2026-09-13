# Carbon Footprint Calculator

A small, dependency-free static web app that gives a rough, educational estimate of a
person's annual carbon footprint from home energy, transport, flights, diet, and general
consumption.

Part of the [OneEarthOneLife](../) project.

## Run it locally

No build step, no dependencies — just open the file:

```bash
open index.html      # macOS
xdg-open index.html  # Linux
```

Or serve it with any static server, e.g. `python3 -m http.server` from this folder.

## How the estimate works

All logic lives in `script.js`. Emission factors are widely-published rough averages
(sources noted in comments at the top of the file) — electricity grid intensity, per-km
car fuel factors, per-flight averages, and diet-footprint bands adapted from the
Poore & Nemecek (2018) study. This is meant to build awareness and show where the
biggest levers are (usually flights, car travel, and heating) — **not** a precise
carbon accounting tool.

## Deployment

This folder is published as part of the main OneEarthOneLife GitHub Pages site, at
`/calculator/`, by a copy step in `.github/workflows/pages.yml` (the MkDocs site build
doesn't include this folder directly — it's copied into the built `site/` output before
deploy). It has no build step of its own, so any change to `index.html`, `styles.css`,
or `script.js` here goes live on the next Pages deploy.
