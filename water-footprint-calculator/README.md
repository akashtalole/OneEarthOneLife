# Water Footprint Calculator

A small, dependency-free static web app estimating a person's daily water footprint —
both direct household use (showers, baths, toilet, laundry, dishwashing) and the much
larger hidden "virtual water" footprint of their diet.

Part of the [OneEarthOneLife](../) project.

## Run it locally

No build step, no dependencies — just open the file:

```bash
open index.html      # macOS
xdg-open index.html  # Linux
```

Or serve it with any static server, e.g. `python3 -m http.server` from this folder.

## How the estimate works

All logic lives in `script.js`. Direct-use figures use commonly published fixture and
appliance averages. Dietary "virtual water" figures are rough per-day averages in the
range reported by water-footprint research (Hoekstra & Mekonnen) for different diet
patterns — these numbers vary a lot by specific foods and where they're grown, so treat
them as order-of-magnitude estimates for awareness, not a precise water audit.

## Deployment

This folder is published as part of the main OneEarthOneLife GitHub Pages site, at
`/water-footprint/`, by a copy step in `.github/workflows/pages.yml`. It has no build
step of its own, so any change to `index.html`, `styles.css`, or `script.js` here goes
live on the next Pages deploy.
