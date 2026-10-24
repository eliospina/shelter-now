// Builds the static site that Capacitor packages into the Android app (out/).
//
// The app has no server of its own, so:
// - the shelters are bundled as public/shelters.json and searched on the phone;
// - app/api is moved aside during the build, because a static export can't
//   contain route handlers that read the request. The app calls those routes
//   on the live site instead, when there is internet.
//
// Usage: npm run build:app
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const geojsonPath = path.join(root, "data", "shelters.geojson");
const streetsPath = path.join(root, "data", "shelter_streets.json");
const outPath = path.join(root, "public", "shelters.json");
const apiDir = path.join(root, "app", "api");
const apiStash = path.join(root, ".api-stash");

// Rows of [id, address, places, lat, lon, street]: a fraction of the GeoJSON.
// Five decimals is about 1 m, finer than GPS. street is null when
// Lantmäteriet has no address within 100 m.
const geojson = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"));
const streets = fs.existsSync(streetsPath) ? JSON.parse(fs.readFileSync(streetsPath, "utf-8")).streets : {};
const rows = geojson.features.map(({ properties: p }) => [
  p.id,
  p.address,
  p.places,
  Math.round(p.lat * 1e5) / 1e5,
  Math.round(p.lon * 1e5) / 1e5,
  streets[p.id] ?? null,
]);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(rows));
console.log(`public/shelters.json: ${rows.length} shelters, ${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB`);

if (fs.existsSync(apiStash)) {
  throw new Error(".api-stash exists from an interrupted build. Move it back to app/api first.");
}
fs.renameSync(apiDir, apiStash);
let status = 1;
try {
  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "app", NEXT_PUBLIC_TARGET: "app" },
  });
  status = result.status ?? 1;
} finally {
  fs.renameSync(apiStash, apiDir);
}
process.exit(status);
