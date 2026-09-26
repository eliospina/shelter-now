import { nearestShelters, getStats } from "@/lib/shelters";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lon = parseFloat(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: "lat and lon query params are required" }, { status: 400 });
  }

  const shelters = nearestShelters(lat, lon, 3);
  return Response.json({ shelters, stats: getStats() });
}
