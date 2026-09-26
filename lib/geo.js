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

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function travelMinutes(meters, mode) {
  return Math.max(1, Math.round((meters * DETOUR_FACTOR) / SPEED_M_PER_MIN[normalizeMode(mode)]));
}

export function tripContext(shelter, mode) {
  const minutes = travelMinutes(shelter.distanceMeters, mode);
  return {
    address: shelter.address,
    distanceText: formatDistance(shelter.distanceMeters),
    minutes,
    mode: normalizeMode(mode),
    far: minutes > FAR_THRESHOLD_MIN,
  };
}

export function googleMapsRoute(lat, lon, mode) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=${GOOGLE_TRAVELMODE[normalizeMode(mode)]}`;
}
