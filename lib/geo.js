// Pure geo helpers shared by client and server code.

const EARTH_RADIUS_M = 6371000;

export const TRAVEL_MODES = ["walk", "bike", "car"];
export const DEFAULT_MODE = "walk";

// Beyond this many minutes with the chosen mode (about 400 m on foot),
// advise taking cover in place first.
export const FAR_THRESHOLD_MIN = 5;

// Average speeds in metres per minute: walk ~4.8 km/h, bike ~15 km/h,
// car ~30 km/h (urban, including traffic and parking).
const SPEED_M_PER_MIN = { walk: 80, bike: 250, car: 500 };
// Straight-line distance understates real street routes.
const DETOUR_FACTOR = 1.3;

const GOOGLE_TRAVELMODE = { walk: "walking", bike: "bicycling", car: "driving" };

export function normalizeMode(mode) {
  return TRAVEL_MODES.includes(mode) ? mode : DEFAULT_MODE;
}

export function haversineMeters(lat1, lon1, lat2, lon2) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Initial compass bearing from point 1 to point 2, in degrees clockwise
// from true north (0 = north, 90 = east).
export function bearingDegrees(lat1, lon1, lat2, lon2) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLon = rad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(rad(lat2));
  const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Index into the 8 compass points (0 = north, 1 = northeast, ...).
export function compassPoint(degrees) {
  return Math.round(degrees / 45) % 8;
}

// GPS is rarely better than ~10 m, so distances are shown and used at 10 m
// (under 1 km) or 100 m resolution. Rounding also lets nearby requests share
// a cached answer on the server.
export function roundDistance(meters) {
  return meters < 1000 ? Math.round(meters / 10) * 10 : Math.round(meters / 100) * 100;
}

export function formatDistance(meters) {
  const d = roundDistance(meters);
  if (d < 1000) return `${d} m`;
  return `${(d / 1000).toFixed(1)} km`;
}

// "59.33130, 18.05980": what any map app accepts, offline ones included.
// Five decimals is about 1 m. Always Latin digits, whatever the language.
export function formatCoords(lat, lon) {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

export function travelMinutes(meters, mode) {
  return Math.max(1, Math.round((roundDistance(meters) * DETOUR_FACTOR) / SPEED_M_PER_MIN[normalizeMode(mode)]));
}

export function tripContext(shelter, mode) {
  const minutes = travelMinutes(shelter.distanceMeters, mode);
  return {
    address: shelter.address,
    street: shelter.street ?? null,
    distanceText: formatDistance(shelter.distanceMeters),
    minutes,
    mode: normalizeMode(mode),
    far: minutes > FAR_THRESHOLD_MIN,
  };
}

// Shelters are { id, address, places, lat, lon }. A full scan of all 62,761
// takes a few milliseconds, also on a phone, so no spatial index is needed.
export function nearestShelters(shelters, lat, lon, count = 3) {
  return shelters
    .map((s) => {
      const distanceMeters = haversineMeters(lat, lon, s.lat, s.lon);
      return { ...s, distanceMeters, distanceText: formatDistance(distanceMeters) };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, count);
}

export function googleMapsRoute(lat, lon, mode) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=${GOOGLE_TRAVELMODE[normalizeMode(mode)]}`;
}
