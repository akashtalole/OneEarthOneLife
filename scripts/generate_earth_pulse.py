"""Fetch open environmental data feeds and render docs/earth-pulse.md.

Run manually with `python scripts/generate_earth_pulse.py`, or via the
scheduled "Update Earth Pulse" GitHub Actions workflow. All sources are
free and require no API key. Each source fails independently so one
outage doesn't block the rest of the page from updating.
"""

from __future__ import annotations

import datetime as dt
import time
from pathlib import Path

import requests

TIMEOUT = 20
RETRIES = 2
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "docs" / "earth-pulse.md"


def get_with_retry(url: str, **kwargs) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(RETRIES):
        try:
            r = requests.get(url, timeout=TIMEOUT, **kwargs)
            r.raise_for_status()
            return r
        except Exception as exc:  # noqa: BLE001 - retried below, re-raised after
            last_error = exc
            if attempt < RETRIES - 1:
                time.sleep(2)
    assert last_error is not None
    raise last_error

EONET_CATEGORY_LABELS = {
    "wildfires": ("Wildfires", ":material-fire:"),
    "severeStorms": ("Severe Storms", ":material-weather-hurricane:"),
    "floods": ("Floods", ":material-home-flood:"),
    "volcanoes": ("Volcanoes", ":material-image-filter-hdr:"),
    "drought": ("Drought", ":material-water-off:"),
    "seaLakeIce": ("Sea & Lake Ice", ":material-snowflake:"),
    "snow": ("Snow", ":material-weather-snowy:"),
    "dustHaze": ("Dust & Haze", ":material-weather-fog:"),
    "landslides": ("Landslides", ":material-terrain:"),
    "manmade": ("Man-made", ":material-factory:"),
    "waterColor": ("Water Color", ":material-water:"),
    "tempExtremes": ("Temperature Extremes", ":material-thermometer:"),
}


def fetch_co2() -> dict | None:
    try:
        r = get_with_retry("https://global-warming.org/api/co2-api")
        rows = r.json()["co2"]
        latest = rows[-1]
        return {
            "ppm": float(latest["trend"]),
            "date": f"{latest['year']}-{int(latest['month']):02d}-{int(latest['day']):02d}",
        }
    except Exception:
        return None


def fetch_temperature_anomaly() -> dict | None:
    try:
        r = get_with_retry("https://global-warming.org/api/temperature-api")
        rows = r.json()["result"]
        latest = rows[-1]
        year_frac = float(latest["time"])
        year = int(year_frac)
        return {
            "anomaly_c": float(latest["station"]),
            "year": year,
        }
    except Exception:
        return None


def fetch_eonet_events() -> dict | None:
    try:
        r = get_with_retry(
            "https://eonet.gsfc.nasa.gov/api/v3/events",
            params={"status": "open", "days": 7, "limit": 500},
        )
        events = r.json().get("events", [])
    except Exception:
        return None

    by_category: dict[str, list[dict]] = {}
    for event in events:
        for category in event.get("categories", []):
            cat_id = category.get("id", "other")
            by_category.setdefault(cat_id, []).append(event)

    return {"total": len(events), "by_category": by_category}


def fetch_significant_earthquakes() -> dict | None:
    try:
        r = get_with_retry(
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"
        )
        features = r.json().get("features", [])
    except Exception:
        return None

    quakes = sorted(
        (f["properties"] for f in features),
        key=lambda p: p.get("mag") or 0,
        reverse=True,
    )
    return {"count": len(quakes), "top": quakes[:5]}


def render(co2, temp, eonet, quakes) -> str:
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    lines = [
        "---",
        "title: Earth Pulse",
        "---",
        "",
        "# 🌡️ Earth Pulse",
        "",
        "A daily snapshot of the planet, pulled straight from open, public data feeds —",
        "no models, no opinions, just current readings.",
        "",
        f"*Last updated: {now}*",
        "",
        '<div class="grid cards" markdown>',
        "",
    ]

    if co2:
        lines += [
            "-   :material-molecule-co2: **Atmospheric CO₂**",
            "",
            "    ---",
            "",
            f"    **{co2['ppm']:.1f} ppm** (trend value, as of {co2['date']})",
            "",
            "    Source: NOAA Global Monitoring Laboratory (Mauna Loa Observatory)",
            "",
        ]
    else:
        lines += ["-   :material-molecule-co2: **Atmospheric CO₂**", "", "    ---", "", "    _Data unavailable right now._", ""]

    if temp:
        sign = "+" if temp["anomaly_c"] >= 0 else ""
        lines += [
            "-   :material-thermometer: **Global Temperature Anomaly**",
            "",
            "    ---",
            "",
            f"    **{sign}{temp['anomaly_c']:.2f}°C** vs. 1951–1980 baseline ({temp['year']})",
            "",
            "    Source: NASA GISTEMP",
            "",
        ]
    else:
        lines += ["-   :material-thermometer: **Global Temperature Anomaly**", "", "    ---", "", "    _Data unavailable right now._", ""]

    if eonet:
        lines += [
            "-   :material-alert: **Active Hazard Events (7 days)**",
            "",
            "    ---",
            "",
            f"    **{eonet['total']}** open events with activity in the last 7 days",
            "",
            "    Source: NASA EONET",
            "",
        ]
    else:
        lines += ["-   :material-alert: **Active Hazard Events (7 days)**", "", "    ---", "", "    _Data unavailable right now._", ""]

    if quakes:
        strongest = f"M{quakes['top'][0]['mag']:.1f}" if quakes["top"] else "—"
        lines += [
            "-   :material-vibrate: **Significant Earthquakes (7 days)**",
            "",
            "    ---",
            "",
            f"    **{quakes['count']}** event(s) &nbsp;·&nbsp; strongest: {strongest}",
            "",
            "    Source: USGS Earthquake Hazards Program",
            "",
        ]
    else:
        lines += ["-   :material-vibrate: **Significant Earthquakes (7 days)**", "", "    ---", "", "    _Data unavailable right now._", ""]

    lines += ["", "</div>", ""]

    if eonet and eonet["by_category"]:
        lines += ["## Active hazard events by category (last 7 days)", ""]
        sorted_cats = sorted(
            eonet["by_category"].items(), key=lambda kv: len(kv[1]), reverse=True
        )
        for cat_id, cat_events in sorted_cats:
            label, icon = EONET_CATEGORY_LABELS.get(cat_id, (cat_id, ":material-alert-circle:"))
            lines.append(f"- {icon} **{label}** — {len(cat_events)} active")
        lines += ["", "*Explore the full live map: [NASA EONET](https://eonet.gsfc.nasa.gov/)*", ""]

    if quakes and quakes["top"]:
        lines += ["## Strongest earthquakes this week", ""]
        lines += ["| Magnitude | Location | USGS Detail |", "|---|---|---|"]
        for q in quakes["top"]:
            mag = f"M{q['mag']:.1f}" if q.get("mag") is not None else "—"
            place = q.get("place", "Unknown location")
            url = q.get("url", "https://earthquake.usgs.gov/")
            lines.append(f"| {mag} | {place} | [details]({url}) |")
        lines += [""]

    lines += [
        "!!! note \"About this page\"",
        "    Figures are fetched automatically from public sources (NOAA, NASA, USGS) on a",
        "    daily schedule and are provided as-is for awareness. For deeper context, see",
        "    [Resources](resources.md).",
        "",
    ]

    return "\n".join(lines)


def main() -> None:
    co2 = fetch_co2()
    temp = fetch_temperature_anomaly()
    eonet = fetch_eonet_events()
    quakes = fetch_significant_earthquakes()

    content = render(co2, temp, eonet, quakes)
    OUTPUT_PATH.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
