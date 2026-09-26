#!/usr/bin/env python3
"""Convert the official MSB/MCF Skyddsrum shapefile (SWEREF99 TM) to WGS84 GeoJSON.

Source: Myndigheten för civilt försvar (MCF), Skyddsrum.zip
Fields kept: id, address, places, lat, lon
Records with statusType == 'Tillfällig begränsning' (temporarily restricted /
not currently usable) are excluded — this is a safety app and should not
direct people to a shelter that is flagged as unavailable.
"""
import json
import shapefile
from pyproj import Transformer

SRC = "data/raw/skyddsrum/Skyddsrum"
OUT_GEOJSON = "data/shelters.geojson"
OUT_STATS = "data/stats.json"

EXCLUDED_STATUS = {"Tillfällig begränsning"}

transformer = Transformer.from_crs("EPSG:3006", "EPSG:4326", always_xy=True)

def main():
    sf = shapefile.Reader(SRC)
    features = []
    excluded = 0
    total_places_all = 0

    for sr in sf.iterShapeRecords():
        rec = sr.record.as_dict()
        total_places_all += rec["numberOfOc"] or 0
        if rec["statusType"] in EXCLUDED_STATUS:
            excluded += 1
            continue

        x, y = sr.shape.points[0][0], sr.shape.points[0][1]
        lon, lat = transformer.transform(x, y)
        lon, lat = round(lon, 6), round(lat, 6)

        address = (rec["additional"] or "").strip()
        places = int(rec["numberOfOc"] or 0)
        shelter_id = (rec["name"] or rec["InspireID"]).strip()

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
        "excludedRestricted": excluded,
        "sourceRecordCount": len(features) + excluded,
        "sourceTotalPlacesIncludingRestricted": total_places_all,
        "sourceCrs": "EPSG:3006 (SWEREF99 TM)",
        "outputCrs": "EPSG:4326 (WGS84)",
    }
    with open(OUT_STATS, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print(json.dumps(stats, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
