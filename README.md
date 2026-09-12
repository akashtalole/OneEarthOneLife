# 🌍 OneEarthOneLife

We have one planet, and one life to live on it. **OneEarthOneLife** is an open
initiative and documentation site focused on climate action, biodiversity, and
sustainable living — practical knowledge and community action for protecting the
Earth we all share.

The site is live at: **https://akashtalole.github.io/OneEarthOneLife/**

## Earth Pulse

The [Earth Pulse](docs/earth-pulse.md) page shows a daily snapshot of the planet —
atmospheric CO₂, global temperature anomaly, active hazard events, and significant
earthquakes — pulled from free, key-less public APIs (NOAA, NASA GISTEMP, NASA EONET,
USGS) by [`scripts/generate_earth_pulse.py`](scripts/generate_earth_pulse.py). A
scheduled GitHub Actions workflow (`.github/workflows/earth-pulse.yml`) regenerates and
commits the page daily.

## Tech

Built with [MkDocs](https://www.mkdocs.org/) and the
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme, deployed
automatically to GitHub Pages via GitHub Actions on every push to `main`.

## Local development

```bash
pip install -r requirements.txt
mkdocs serve
```

Then open http://127.0.0.1:8000/.

## Contributing

See the [Get Involved](docs/get-involved.md) page for ways to contribute content, fix
issues, or help spread the project's mission.

## License

[MIT](LICENSE)
