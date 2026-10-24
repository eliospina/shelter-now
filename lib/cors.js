// The Android app (Capacitor) runs at https://localhost and calls the Claude
// routes on the live site. Only the app's origins are allowed; the same rate
// limits apply as for the website.
const APP_ORIGINS = new Set(["https://localhost", "capacitor://localhost"]);

export function withCors(request, response) {
  const origin = request.headers.get("origin");
  if (APP_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function preflight(request) {
  const response = new Response(null, { status: 204 });
  if (APP_ORIGINS.has(request.headers.get("origin"))) {
    response.headers.set("Access-Control-Allow-Methods", "POST");
    response.headers.set("Access-Control-Allow-Headers", "content-type");
    response.headers.set("Access-Control-Max-Age", "86400");
  }
  return withCors(request, response);
}
