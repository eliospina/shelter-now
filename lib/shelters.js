// Server-only: loads the processed shelter GeoJSON once per lambda/process
// and answers nearest-shelter queries. Never import this from client code.
import fs from "node:fs";
import path from "node:path";
import { haversineMeters, formatDistance } from "./geo";

const DATA_PATH = path.join(process.cwd(), "data", "shelters.geojson");

let cache = null;

function load() {
  if (cache) return cache;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const geojson = JSON.parse(raw);
  const shelters = geojson.features.map((f) => f.properties);
  const byId = new Map(shelters.map((s) => [s.id, s]));
  const totalPlaces = shelters.reduce((sum, s) => sum + s.places, 0);
  cache = { shelters, byId, stats: { shelterCount: shelters.length, totalPlaces } };
  return cache;
}

export function getStats() {
  return load().stats;
}

export function getShelterById(id) {
  return load().byId.get(id) ?? null;
}

export function nearestShelters(lat, lon, count = 3) {
  const { shelters } = load();
  const withDistance = shelters.map((s) => {
    const distanceMeters = haversineMeters(lat, lon, s.lat, s.lon);
    return {
      ...s,
      distanceMeters,
      distanceText: formatDistance(distanceMeters),
    };
  });
  withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return withDistance.slice(0, count);
}
