import { env } from '../../config/env';
import { redis } from '../../config/redis';

const defaultTtlSeconds = env.REDIS_DEFAULT_TTL;

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redis?.isOpen) return null;

  const raw = await redis.get(key);
  if (!raw) return null;

  return JSON.parse(raw) as T;
};

export const setCache = async <T>(key: string, value: T, ttlSeconds = defaultTtlSeconds): Promise<void> => {
  if (!redis?.isOpen) return;

  await redis.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
};

export const delCache = async (key: string): Promise<void> => {
  if (!redis?.isOpen) return;

  await redis.del(key);
};

export const delCacheByPattern = async (pattern: string): Promise<void> => {
  if (!redis?.isOpen) return;

  let cursor = 0;
  do {
    const result = await redis.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = result.cursor;

    if (result.keys.length > 0) {
      await redis.del(result.keys);
    }
  } while (cursor !== 0);
};

export const getOrSetCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = defaultTtlSeconds,
): Promise<T> => {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await setCache(key, fresh, ttlSeconds);
  return fresh;
};
