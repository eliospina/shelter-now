#!/usr/bin/env python3
"""Count shelters and places per Swedish municipality (kommun) and county (län).

The shelter data has no municipality field, so each shelter is placed by its
position:
  1. Boundaries: Lantmäteriet's distrikt polygons (detailed), as republished
     in the open swemapdata package, pinned to a fixed commit below.
  2. Each distrikt lies inside one municipality. It is assigned to the SCB
     municipality polygon holding most of its land overlap. SCB's own
     municipality polygons are simplified and, per SCB, not suitable for
     analysis, so they are only used for this labelling step.
  3. Each shelter (data/shelters.geojson, WGS84) is converted to SWEREF 99 TM
     and placed in the distrikt that contains it.
  4. A municipality is in a county when its code starts with the county code.

Population: SCB table "Folkmängden efter region, civilstånd, ålder och kön.
År 2025" (TAB5557, 31 Dec 2025), read from TAB5557_sv.zip in the repo root.
Each area uses the total SCB publishes for that level (kommun, län, riket);
SCB's levels differ by a few people, so sums of municipalities can be off by
up to ~10 inhabitants.

Writes data/shelters_by_municipality.csv and prints the target areas with
places per inhabitant and a border-sensitivity check (shelters within 100 m
of each area's boundary).

    pip install -r scripts/requirements.txt
    python3 scripts/shelters_by_municipality.py
"""
import csv
import hashlib
import io
import json
import sys
import urllib.request
import warnings
import zipfile
from collections import defaultdict
from pathlib import Path

import numpy as np
import rdata
from pyproj import Transformer
from shapely.geometry import MultiPolygon, Point, Polygon
from shapely.ops import unary_union
from shapely.strtree import STRtree

ROOT = Path(__file__).resolve().parent.parent
SHELTERS = ROOT / "data" / "shelters.geojson"
OUT_CSV = ROOT / "data" / "shelters_by_municipality.csv"
CACHE = ROOT / "data" / "raw" / "boundaries"
SCB_ZIP = ROOT / "TAB5557_sv.zip"
SCB_CSV = "TAB5557_sv.csv"

SWEMAPDATA_COMMIT = "2dcca1da76662582ddb499d69d7b38bbb12f242c"
BOUNDARY_FILES = {
    "distrikt": "8d699cdc4c1a35603aaee37eab0ebf076564b5c992546d3e477f4448f49bdb17",
    "kommuner": "20228b7345a590f4b499783702b703e57d1bbc69952daf5c75636425c1262e80",
    "lan": "6fbf11202d1f2c1c83472fe34c662cc3a57bf1d8076dded40bd6f0560d53054a",
}

# Areas to report, by SCB region code: 4 digits = kommun, 2 = län, "00" = riket.
TARGETS = [
    ("Stockholms kommun", "0180"),
    ("Stockholms län", "01"),
    ("Södertälje kommun", "0181"),
    ("Sverige", "00"),
]


def in_area(kommun_code, area_code):
    return area_code == "00" or kommun_code.startswith(area_code)

SNAP_DISTANCE_M = 500
BORDER_CHECK_M = 100


def fetch_boundaries():
    CACHE.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, sha256 in BOUNDARY_FILES.items():
        path = CACHE / f"{name}.rda"
        if not path.exists():
            url = f"https://raw.githubusercontent.com/borstell/swemapdata/{SWEMAPDATA_COMMIT}/data/{name}.rda"
            print(f"Downloading {url}")
            urllib.request.urlretrieve(url, path)
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != sha256:
            sys.exit(f"Checksum mismatch for {path}; delete it and re-run.")
        paths[name] = path
    return paths


def load_polygons(path, key):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")  # rdata warns about R classes (sf) it has no Python type for
        df = rdata.conversion.convert(rdata.parser.parse_file(path), default_encoding="utf8")[key]
    rows = []
    for code, name, geom in zip(df["code"], df["name"], df["geometry"]):
        polygons = []
        for rings in geom:  # MULTIPOLYGON -> polygons -> rings of (x, y) in SWEREF 99 TM
            rings = [np.asarray(r)[:, :2] for r in rings]
            polygons.append(Polygon(rings[0], rings[1:]))
        rows.append((str(code), str(name), MultiPolygon(polygons).buffer(0)))
    return rows


def load_population():
    """Total population per SCB region code (all ages, sexes, marital statuses)."""
    population = {}
    with zipfile.ZipFile(SCB_ZIP) as z, z.open(SCB_CSV) as raw:
        for r in csv.DictReader(io.TextIOWrapper(raw, encoding="latin-1", newline="")):
            if (r["civilstånd"] == "totalt, samtliga civilstånd"
                    and r["ålder"] == "totalt, samtliga åldrar"
                    and r["kön"] == "totalt, samtliga män och kvinnor"
                    and r["tabellinnehåll"] == "Folkmängd"):
                code = r["region"].split(" ", 1)[0]
                population[code] = int(r["Folkmängden"])  # repeated per age grouping, same value
    return population


def assign_distrikt_to_kommun(distrikt, kommuner):
    tree = STRtree([g for *_, g in kommuner])
    d2k, weak = {}, 0
    for code, _, geom in distrikt:
        overlaps = [(kommuner[i][0], geom.intersection(kommuner[i][2]).area) for i in tree.query(geom)]
        overlaps = [o for o in overlaps if o[1] > 0]
        if not overlaps:  # small islands lost in SCB's simplified coastline
            d2k[code] = kommuner[tree.nearest(geom)][0]
            continue
        best_code, best_area = max(overlaps, key=lambda o: o[1])
        d2k[code] = best_code
        if best_area / sum(a for _, a in overlaps) < 0.9:
            weak += 1
    return d2k, weak


def main():
    paths = fetch_boundaries()
    distrikt = load_polygons(paths["distrikt"], "distrikt")
    kommuner = load_polygons(paths["kommuner"], "kommuner")
    lan = load_polygons(paths["lan"], "lan")
    kommun_name = {c: n for c, n, _ in kommuner}
    lan_name = {c: f"{n} län" for c, n, _ in lan}

    d2k, weak = assign_distrikt_to_kommun(distrikt, kommuner)
    print(f"{len(distrikt)} distrikt -> {len(set(d2k.values()))} municipalities "
          f"({weak} distrikt split <90/10 by SCB's simplified polygons; assigned to the majority)")

    to_sweref = Transformer.from_crs("EPSG:4326", "EPSG:3006", always_xy=True)
    shelters = [f["properties"] for f in json.loads(SHELTERS.read_text(encoding="utf-8"))["features"]]
    points = [Point(*to_sweref.transform(s["lon"], s["lat"])) for s in shelters]

    d_codes = [c for c, *_ in distrikt]
    d_geoms = [g for *_, g in distrikt]
    d_tree = STRtree(d_geoms)
    assigned, snapped, unassigned = [], 0, 0
    for p in points:
        hits = d_tree.query(p, predicate="covered_by")
        if len(hits):
            assigned.append(d2k[d_codes[hits[0]]])
            continue
        i = d_tree.nearest(p)
        if d_geoms[i].distance(p) <= SNAP_DISTANCE_M:
            assigned.append(d2k[d_codes[i]])
            snapped += 1
        else:
            assigned.append(None)
            unassigned += 1
    print(f"{len(shelters)} shelters: {snapped} snapped to a distrikt within {SNAP_DISTANCE_M} m, {unassigned} unassigned")

    population = load_population()
    missing = sorted(set(kommun_name) - set(population))
    if missing:
        sys.exit(f"No SCB population for municipality codes: {missing}")

    per_kommun = defaultdict(lambda: [0, 0])
    for s, k in zip(shelters, assigned):
        if k:
            per_kommun[k][0] += 1
            per_kommun[k][1] += s["places"]
    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["kommun_code", "kommun", "lan_code", "lan", "shelters", "places",
                    "population_2025", "places_per_100_inhabitants"])
        for k in sorted(kommun_name):
            n, places = per_kommun.get(k, (0, 0))
            w.writerow([k, kommun_name[k], k[:2], lan_name.get(k[:2], ""), n, places,
                        population[k], f"{100 * places / population[k]:.1f}"])
    print(f"Wrote {OUT_CSV.relative_to(ROOT)}\n")

    print(f"{'Area':20} {'Shelters':>9} {'Places':>11} {'Population':>11} {'Places/100 inh.':>16}   "
          f"Inside, within {BORDER_CHECK_M} m of border")
    for label, code in TARGETS:
        idx = [i for i, k in enumerate(assigned) if k and in_area(k, code)]
        places = sum(shelters[i]["places"] for i in idx)
        border = ""
        if code != "00":
            area = unary_union([g for c, _, g in distrikt if in_area(d2k[c], code)])
            near = [i for i in idx if area.boundary.distance(points[i]) <= BORDER_CHECK_M]
            border = f"{len(near)} shelters, {sum(shelters[i]['places'] for i in near):,} places"
        print(f"{label:20} {len(idx):>9,} {places:>11,} {population[code]:>11,} "
              f"{100 * places / population[code]:>16.1f}   {border}")


if __name__ == "__main__":
    main()
