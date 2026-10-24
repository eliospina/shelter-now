// Server-only: loads the processed shelter GeoJSON once per lambda/process
// and answers nearest-shelter queries. Never import this from client code.
import fs from "node:fs";
import path from "node:path";
import { nearestShelters as nearestOf } from "./geo";

const DATA_PATH = path.join(process.cwd(), "data", "shelters.geojson");
// Nearest street address per shelter, from Lantmäteriet (see
// scripts/import_street_addresses.mjs). Optional: without it, shelters are
// named by property designation only.
const STREETS_PATH = path.join(process.cwd(), "data", "shelter_streets.json");

let cache = null;

function load() {
  if (cache) return cache;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const geojson = JSON.parse(raw);
  const streets = fs.existsSync(STREETS_PATH) ? JSON.parse(fs.readFileSync(STREETS_PATH, "utf-8")).streets : {};
  const shelters = geojson.features.map((f) => ({ ...f.properties, street: streets[f.properties.id] ?? null }));
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
  return nearestOf(load().shelters, lat, lon, count);
}
