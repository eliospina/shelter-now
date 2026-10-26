#!/usr/bin/env python3
"""Convert the official MSB/MCF Skyddsrum shapefile (SWEREF99 TM) to WGS84 GeoJSON.

Source: Myndigheten för civilt försvar (MCF), Skyddsrum.zip
Fields kept: id, address, places, lat, lon
Records with statusType == 'Tillfällig begränsning' (temporarily restricted /
not currently usable) are excluded — this is a safety app and should not
direct people to a shelter that is flagged as unavailable.

When data/mcf_register.json exists (see import_mcf_register.py), MCF's own
list of active shelters decides instead, because the open shapefile lags
behind the register: a shelter is kept only if it is on that list.
"""
import os
import json
import shapefile
from pyproj import Transformer

SRC = "data/raw/skyddsrum/Skyddsrum"
OUT_GEOJSON = "data/shelters.geojson"
OUT_STATS = "data/stats.json"
REGISTER = "data/mcf_register.json"

EXCLUDED_STATUS = {"Tillfällig begränsning"}

transformer = Transformer.from_crs("EPSG:3006", "EPSG:4326", always_xy=True)

def load_active_ids():
    if not os.path.exists(REGISTER):
        return None, None
    with open(REGISTER, encoding="utf-8") as f:
        register = json.load(f)
    return set(register["firstInspectionYear"]), register["asOf"]


def main():
    sf = shapefile.Reader(SRC)
    active_ids, register_as_of = load_active_ids()
    features = []
    excluded = 0
    total_places_all = 0

    for sr in sf.iterShapeRecords():
        rec = sr.record.as_dict()
        total_places_all += rec["numberOfOc"] or 0
        shelter_id = (rec["name"] or rec["InspireID"]).strip()
        if active_ids is not None:
            inactive = shelter_id not in active_ids
        else:
            inactive = rec["statusType"] in EXCLUDED_STATUS
        if inactive:
            excluded += 1
            continue

        x, y = sr.shape.points[0][0], sr.shape.points[0][1]
        lon, lat = transformer.transform(x, y)
        lon, lat = round(lon, 6), round(lat, 6)

        address = (rec["additional"] or "").strip()
        places = int(rec["numberOfOc"] or 0)

        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "id": shelter_id,
                "address": address,
                "places": places,
                "lat": lat,
                "lon": lon,
            },
        })

    geojson = {"type": "FeatureCollection", "features": features}

    with open(OUT_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))

    total_places = sum(f["properties"]["places"] for f in features)
    stats = {
        "shelterCount": len(features),
        "totalPlaces": total_places,
        "excludedInactive": excluded,
        "sourceRecordCount": len(features) + excluded,
        "sourceTotalPlacesIncludingRestricted": total_places_all,
        "sourceCrs": "EPSG:3006 (SWEREF99 TM)",
        "outputCrs": "EPSG:4326 (WGS84)",
    }
    if active_ids is not None:
        found = {f["properties"]["id"] for f in features}
        stats["registerAsOf"] = register_as_of
        stats["registerActiveCount"] = len(active_ids)
        # Active in the register but missing from the shapefile, so no position yet.
        stats["activeWithoutPosition"] = len(active_ids - found)
    with open(OUT_STATS, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print(json.dumps(stats, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
