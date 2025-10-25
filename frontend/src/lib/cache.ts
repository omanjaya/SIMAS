// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; expiry: number }>();

export function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedData(key: string, data: any, ttlSeconds = 300) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

// Clear cache entries that have expired
export function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiry <= now) {
      cache.delete(key);
    }
  }
}

// Clear all cache entries
export function clearCache() {
  cache.clear();
}