"""Find the street address nearest to each shelter, using Lantmäteriet's
"Belägenhetsadress Nedladdning, vektor" (STAC API, one GeoPackage per kommun).

Run this on your own computer, never in the cloud: the raw address files are
personal data, and Lantmäteriet's decision (LM2026/147116) only allows them
to be stored and processed on the applicant's own computer in Sweden. Each
kommun file is deleted as soon as it has been matched; only one address per
shelter is kept, in data/shelter_addresses.csv.

    pip install -r scripts/requirements.txt
    python3 scripts/match_shelter_addresses.py --explore      # lists files, downloads nothing
    python3 scripts/match_shelter_addresses.py --kommun 0180  # test with one kommun
    python3 scripts/match_shelter_addresses.py                # whole country

Username and password are your Geotorget login. They are asked for when the
script starts (or read from LM_USER / LM_PASSWORD) and never saved.
"""

import argparse
import base64
import csv
import getpass
import json
import os
import shutil
import sqlite3
import struct
import sys
import time
import urllib.error
import urllib.request
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
from pyproj import Transformer
from scipy.spatial import cKDTree

try:
    # Trust the same certificates as the computer's browser (the macOS Keychain),
    # so HTTPS works behind antivirus software, VPNs or networks that inspect it.
    import truststore

    truststore.inject_into_ssl()
except ImportError:
    pass

STAC_URL = "https://api.lantmateriet.se/stac-vektor/v1"
SHELTERS_URL = "https://raw.githubusercontent.com/eliospina/shelter-now/main/data/shelters.geojson"
ROOT = Path(__file__).resolve().parent.parent
SHELTERS = ROOT / "data" / "shelters.geojson"
RAW_DIR = ROOT / "data" / "raw" / "lantmateriet"  # gitignored, emptied after each kommun
OUT = ROOT / "data" / "shelter_addresses.csv"
LAYER = "belagenhetsadress"
REQUEST_PAUSE_S = 1  # pause before every API request
MAX_DISTANCE_M = 100  # farther than this, the shelter gets no street address
ATTRIBUTION = "Källa: Belägenhetsadress Nedladdning, vektor, ©Lantmäteriet. Informationen har bearbetats. CC BY 4.0."


# --- STAC API --------------------------------------------------------------

class Stac:
    def __init__(self, base_url, user, password):
        self.base_url = base_url.rstrip("/")
        token = base64.b64encode(f"{user}:{password}".encode()).decode()
        self.headers = {"Authorization": f"Basic {token}", "Accept": "application/json"}

    def open(self, url):
        if not url.startswith("http"):
            url = f"{self.base_url}/{url.lstrip('/')}"
        request = urllib.request.Request(url, headers=self.headers)
        for attempt in range(8):
            time.sleep(REQUEST_PAUSE_S)  # stay well under Lantmäteriet's rate limit
            try:
                return urllib.request.urlopen(request, timeout=120)
            except urllib.error.HTTPError as error:
                if error.code in (401, 403):
                    sys.exit(f"Lantmäteriet refused the login ({error.code}) for {url}. Check your Geotorget username and password.")
                if error.code not in (429, 500, 502, 503, 504) or attempt == 7:
                    raise
                retry_after = error.headers.get("Retry-After", "")
                wait = int(retry_after) if retry_after.isdigit() else min(2 ** attempt * 5, 120)
                print(f"  Lantmäteriet answered {error.code}; waiting {wait} s before trying again...")
                time.sleep(wait)
            except urllib.error.URLError as error:
                if "CERTIFICATE_VERIFY_FAILED" in str(error.reason):
                    sys.exit("HTTPS certificate check failed. Run: pip install truststore  (then try again)")
                raise

    def json(self, url):
        with self.open(url) as response:
            return json.load(response)

    def download(self, url, path):
        with self.open(url) as response, open(path, "wb") as f:
            shutil.copyfileobj(response, f)

    def address_collections(self):
        collections = self.json("collections").get("collections", [])
        wanted = [c for c in collections if "belagenhetsadress" in fold(f"{c.get('id', '')} {c.get('title', '')}")]
        return collections, wanted

    def item(self, collection_id, item_id):
        try:
            return self.json(f"collections/{collection_id}/items/{item_id}")
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
            raise

    def items(self, collection_id):
        url = f"collections/{collection_id}/items?limit=1000"
        while url:
            page = self.json(url)
            yield from page.get("features", [])
            url = next((link["href"] for link in page.get("links", []) if link.get("rel") == "next"), None)


def fold(text):
    """Lowercase and strip Swedish letters, so "Belägenhetsadress" matches "belagenhetsadress"."""
    return text.lower().translate(str.maketrans("åäö", "aao"))


def data_assets(item):
    """The downloadable files of an item: zipped or plain GeoPackages."""
    for key, asset in item.get("assets", {}).items():
        href = asset.get("href", "")
        name = href.split("?")[0].rsplit("/", 1)[-1]
        if name.endswith((".zip", ".gpkg")) or "geopackage" in asset.get("type", ""):
            yield key, name or f"{item['id']}-{key}", href


def kommun_of(item, filename):
    for text in (filename, item.get("id", "")):
        digits = text.split("_kn")[-1][:4] if "_kn" in text else ""
        if digits.isdigit():
            return digits
    return item.get("properties", {}).get("kommunkod")


# --- GeoPackage ------------------------------------------------------------

def point_from_gpkg_blob(blob):
    """(x, y) from a GeoPackage point geometry: 'GP' header, then WKB."""
    if blob is None or blob[:2] != b"GP":
        return None
    flags = blob[3]
    if flags & 0b10000:  # empty geometry
        return None
    envelope = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[(flags >> 1) & 0b111]
    wkb = blob[8 + envelope:]
    order = "<" if wkb[0] == 1 else ">"
    geometry_type = (struct.unpack(order + "I", wkb[1:5])[0] & 0x0FFFFFFF) % 1000  # ignore Z/M flags
    if geometry_type == 4:  # MultiPoint: use the first point
        wkb = wkb[9:]
        order = "<" if wkb[0] == 1 else ">"
    return struct.unpack(order + "dd", wkb[5:21])


STATUSES = Counter()  # address status values seen, printed at the end as a sanity check


def read_addresses(gpkg_path):
    """Current address points in one kommun file, as coordinates plus display text."""
    db = sqlite3.connect(gpkg_path)
    try:
        geometry_column = db.execute(
            "SELECT column_name FROM gpkg_geometry_columns WHERE table_name = ?", (LAYER,)
        ).fetchone()
        if not geometry_column:
            tables = [row[0] for row in db.execute("SELECT table_name FROM gpkg_contents")]
            sys.exit(f"{gpkg_path.name}: no '{LAYER}' layer. Layers found: {tables}")
        columns = {row[1] for row in db.execute(f'PRAGMA table_info("{LAYER}")')}
        wanted = ["adressomrade_faststalltnamn", "gardsadressomrade_faststalltnamn", "adressplatsnummer",
                  "bokstavstillagg", "postnummer", "postort", "statusforbelagenhetsadress"]
        selected = [c if c in columns else "NULL" for c in wanted]
        rows = db.execute(f'SELECT "{geometry_column[0]}", {", ".join(selected)} FROM "{LAYER}"').fetchall()
    finally:
        db.close()

    STATUSES.update(row[7] or "(empty)" for row in rows)
    statuses = {(row[7] or "").lower() for row in rows}
    only_current = "gällande" in statuses
    xy, labels = [], []
    for geometry, area, farm, number, letter, postcode, town, status in rows:
        if only_current and (status or "").lower() != "gällande":
            continue
        point = point_from_gpkg_blob(geometry)
        street = " ".join(part for part in (area, farm) if part)
        if not point or not street:
            continue
        house = f"{number or ''}{letter or ''}".strip()
        xy.append(point)
        labels.append((f"{street} {house}".strip(), str(postcode or ""), town or ""))
    return np.array(xy, dtype=float).reshape(-1, 2), labels


# --- Matching --------------------------------------------------------------

def load_shelters():
    if not SHELTERS.exists():
        print(f"Downloading {SHELTERS_URL}")
        SHELTERS.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(SHELTERS_URL, SHELTERS)
    features = json.loads(SHELTERS.read_text())["features"]
    ids = [f["properties"]["id"] for f in features]
    lon = np.array([f["properties"]["lon"] for f in features])
    lat = np.array([f["properties"]["lat"] for f in features])
    to_sweref = Transformer.from_crs("EPSG:4326", "EPSG:3006", always_xy=True)
    x, y = to_sweref.transform(lon, lat)
    return ids, np.column_stack([x, y])


def match_file(gpkg_path, shelter_xy, best_distance, best_label):
    address_xy, labels = read_addresses(gpkg_path)
    if not labels:
        return 0
    distance, index = cKDTree(address_xy).query(shelter_xy, distance_upper_bound=MAX_DISTANCE_M)
    better = distance < best_distance
    for i in np.flatnonzero(better):
        best_distance[i] = distance[i]
        best_label[i] = labels[index[i]]
    return len(labels)


def remove_raw():
    if RAW_DIR.exists():
        shutil.rmtree(RAW_DIR)


def run(stac, collection_id, only_kommun):
    ids, shelter_xy = load_shelters()
    best_distance = np.full(len(ids), np.inf)
    best_label = [None] * len(ids)
    files = addresses = 0
    started = time.time()

    # Item ids are kommun codes, so one kommun is a single request.
    items = stac.items(collection_id)
    if only_kommun:
        item = stac.item(collection_id, only_kommun)
        if item:
            items = [item]

    remove_raw()
    try:
        for item in items:
            for _, filename, href in data_assets(item):
                kommun = kommun_of(item, filename)
                if only_kommun and kommun != only_kommun:
                    continue
                RAW_DIR.mkdir(parents=True, exist_ok=True)
                download = RAW_DIR / filename
                stac.download(href, download)
                gpkgs = [download]
                if filename.endswith(".zip"):
                    with zipfile.ZipFile(download) as archive:
                        archive.extractall(RAW_DIR)
                    gpkgs = list(RAW_DIR.rglob("*.gpkg"))
                for gpkg in gpkgs:
                    addresses += match_file(gpkg, shelter_xy, best_distance, best_label)
                remove_raw()  # nothing from this kommun stays on disk
                files += 1
                print(f"  kommun {kommun or '?'}: done ({files} files, {time.time() - started:.0f} s)")
    finally:
        remove_raw()

    if files == 0:
        sys.exit("No address files found. Run with --explore and share the output.")

    matched = 0
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        f.write(f"# {ATTRIBUTION}\n")
        writer = csv.writer(f)
        writer.writerow(["id", "street", "postnummer", "postort", "distance_m"])
        for shelter_id, label, distance in zip(ids, best_label, best_distance):
            if label:
                writer.writerow([shelter_id, *label, round(float(distance))])
                matched += 1

    print(f"\nRead {addresses:,} address points from {files} files.")
    print("Address status values: " + ", ".join(f"{k} ({v:,})" for k, v in STATUSES.most_common()))
    print(f"{matched:,} of {len(ids):,} shelters ({matched / len(ids):.1%}) have an address within {MAX_DISTANCE_M} m.")
    print(f"Wrote {OUT}. The raw Lantmäteriet files have been deleted.")


def explore(stac):
    """Print what the API offers. Metadata only: no address data is downloaded."""
    collections, wanted = stac.address_collections()
    print("Collections:")
    for c in collections:
        print(f"  {c.get('id')}  |  {c.get('title', '')}")
    if not wanted:
        sys.exit("\nNo collection with 'belagenhetsadress' in its id or title.")
    collection = wanted[0]
    print(f"\nUsing collection '{collection['id']}'. First items:")
    for n, item in enumerate(stac.items(collection["id"])):
        if n == 3:
            break
        print(f"  item {item.get('id')}")
        for key, filename, href in data_assets(item):
            print(f"    asset {key}: {filename}  ({href})")
        if not any(True for _ in data_assets(item)):
            print(f"    assets: {json.dumps(item.get('assets', {}), ensure_ascii=False)[:600]}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--explore", action="store_true", help="list collections and files, download nothing")
    parser.add_argument("--kommun", help="only this kommun code, e.g. 0180 for Stockholm")
    parser.add_argument("--stac-url", default=STAC_URL)
    args = parser.parse_args()

    user = os.environ.get("LM_USER") or input("Geotorget username (e-mail): ").strip()
    password = os.environ.get("LM_PASSWORD") or getpass.getpass("Geotorget password (not shown): ")
    stac = Stac(args.stac_url, user, password)

    if args.explore:
        explore(stac)
        return
    _, wanted = stac.address_collections()
    if not wanted:
        sys.exit("No address collection found. Run with --explore and share the output.")
    run(stac, wanted[0]["id"], args.kommun)


if __name__ == "__main__":
    main()
