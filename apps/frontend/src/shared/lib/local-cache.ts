const PREFIX = 'ucache:';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlSeconds: number): void {
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlSeconds * 1000 };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Silently ignore quota errors
  }
}

export function cacheDel(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Silently ignore
  }
}
