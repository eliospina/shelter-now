// Best-effort abuse protection for paid API calls. State lives in memory, so
// limits apply per server instance; Vercel may run several instances at once.

export function createRateLimiter({ limit, windowMs, maxKeys = 10000 }) {
  const hits = new Map(); // key -> { count, resetAt }
  return function allow(key) {
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= maxKeys) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        if (hits.size >= maxKeys) hits.delete(hits.keys().next().value);
      }
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    if (entry.count >= limit) return false;
    entry.count += 1;
    return true;
  };
}

export function createTtlCache({ ttlMs, maxEntries }) {
  const items = new Map(); // key -> { value, expiresAt }; Map order = insertion order
  return {
    get(key) {
      const item = items.get(key);
      if (!item) return undefined;
      if (item.expiresAt <= Date.now()) {
        items.delete(key);
        return undefined;
      }
      return item.value;
    },
    set(key, value) {
      items.delete(key);
      if (items.size >= maxEntries) items.delete(items.keys().next().value);
      items.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
}

// On Vercel, x-real-ip and x-forwarded-for are set by the platform edge.
export function clientIp(request) {
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
