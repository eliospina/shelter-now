# Shelter Now

Emergency shelter finder for Sweden. One button gives the 3 nearest official
shelters (skyddsrum), travel time and route for walking, cycling or driving,
calm step-by-step instructions, a packing checklist, and a one-tap "I'm safe"
message — in 7 languages (Swedish, English, Spanish, Arabic, Persian,
Ukrainian, Somali; RTL for Arabic/Persian).

If the nearest shelter is more than 5 minutes away with the chosen travel
mode (about 400 m on foot), the app tells people to take cover where they are
first and shows the shelters only as a secondary option. It also explains
that shelters open within 48 hours of heightened alert, describes the
beredskapslarm and flyglarm signals, and follows MCF's packing advice
(sources: mcf.se, krisinformation.se).

## Data

Official shelter data from **Myndigheten för civilt försvar** (Skyddsrum),
converted from the source shapefile (SWEREF99 TM / EPSG:3006) to WGS84
GeoJSON, keeping only `id`, `address`, `places`, `lat`, `lon`.

- **62,761 shelters, 6,678,979 total places** (`data/shelters.geojson`)
- 633 records with `statusType: "Tillfällig begränsning"` (temporarily
  restricted) were excluded from the app's dataset — see
  `data/stats.json` for the full breakdown, including the source totals.

To regenerate `data/shelters.geojson` from the raw shapefile:

```bash
pip install -r scripts/requirements.txt
unzip Skyddsrum.zip -d data/raw/skyddsrum
python3 scripts/convert_shelters.py
```

The unzipped shapefile (`data/raw/`) is gitignored — only the processed
GeoJSON is committed.

### Shelters per municipality

The data has no municipality field, so `scripts/shelters_by_municipality.py`
places each shelter using Lantmäteriet's detailed *distrikt* boundaries
(from the open [swemapdata](https://github.com/borstell/swemapdata) package,
pinned to a fixed commit and checksummed). Each distrikt is labelled with the
municipality it overlaps most, and a municipality belongs to the county whose
code it starts with. Output: `data/shelters_by_municipality.csv` (all 290
municipalities).

```bash
pip install -r scripts/requirements.txt
python3 scripts/shelters_by_municipality.py
```

| Area | Shelters | Places |
|---|---:|---:|
| Stockholms kommun | 6,430 | 656,857 |
| Stockholms län | 13,817 | 1,604,876 |
| Södertälje kommun | 779 | 93,010 |

Only 37 of Stockholms kommun's shelters lie within 100 m of its border, so
small boundary errors change its total by under 1%.

## Running locally

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. Without `ANTHROPIC_API_KEY` (or if the Claude
API call fails for any reason), the app automatically uses the built-in
offline instructions in the selected language — the emergency flow always
works.

## How it works

- `app/page.js` — the mobile-first UI: language selector, EMERGENCY button
  (uses `navigator.geolocation`, falls back to Stockholm C if unavailable),
  results, packing checklist, "I'm safe" SMS/WhatsApp links.
- `app/api/shelters/nearest/route.js` — server route, reads
  `data/shelters.geojson` once per process and returns the 3 nearest
  shelters to a given `lat`/`lon` (haversine distance, no client-side
  download of the full dataset).
- `app/api/instructions/route.js` — server route, calls the Anthropic API
  (`claude-sonnet-5`, using `ANTHROPIC_API_KEY`) for calm, localized
  instructions; falls back to `lib/i18n.js`'s `OFFLINE_STEPS` on any error.
- `lib/i18n.js` — all translated strings (UI, packing list, offline steps,
  "I'm safe" message templates), shared by client and server code.

## Deploying to Vercel

```bash
npm i -g vercel   # if not already installed
vercel
```

Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel project
settings (Production and Preview) before deploying, or via:

```bash
vercel env add ANTHROPIC_API_KEY
```

## Data source & disclaimer

Data: Myndigheten för civilt försvar. In a real emergency, follow
krisinformation.se, Sveriges Radio P4 and 112.
