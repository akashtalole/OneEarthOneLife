# Tree Offset Estimator

A small, dependency-free static web app giving a rough sense of scale: how many trees it
would take to absorb a given annual CO₂e footprint.

Part of the [OneEarthOneLife](../) project.

## Run it locally

No build step, no dependencies — just open the file:

```bash
open index.html      # macOS
xdg-open index.html  # Linux
```

Or serve it with any static server, e.g. `python3 -m http.server` from this folder.

## How the estimate works

All logic lives in `script.js`. It uses a widely-cited rough average of ~21 kg CO₂
absorbed per year by a mature tree (selectable between young/average/fast-growing rates).
Actual absorption varies enormously by species, age, climate, and soil, and a newly
planted tree takes years to decades to reach its mature rate — this tool is meant to
convey scale and motivate action, not to calculate a precise, verifiable offset.

It reads an optional `?tonnes=` query-string parameter to prefill the footprint field,
so the [Carbon Footprint Calculator](../carbon-footprint-calculator/) can link a user's
result straight into this tool.

## Deployment

This folder is published as part of the main OneEarthOneLife GitHub Pages site, at
`/tree-offset/`, by a copy step in `.github/workflows/pages.yml`. It has no build step
of its own, so any change to `index.html`, `styles.css`, or `script.js` here goes live on
the next Pages deploy.
