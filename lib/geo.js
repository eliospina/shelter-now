// Pure geo helpers shared by client and server code.

const EARTH_RADIUS_M = 6371000;

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

// Average walking speed ~4.8 km/h (80 m/min), with a margin for real streets.
export function walkMinutes(meters) {
  return Math.max(1, Math.round((meters * 1.3) / 80));
}

export function googleMapsWalkingRoute(lat, lon) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
}
