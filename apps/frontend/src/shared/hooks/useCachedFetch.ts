'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cacheGet, cacheSet } from '@/shared/lib/local-cache';

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; error: string };
type ApiResult<T> = ApiOk<T> | ApiErr;

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  refresh: () => void;
}

/**
 * Cache-first data fetching hook.
 * - Shows cached data instantly (loading=false) on cache hit.
 * - Always fetches fresh data in background and updates if changed.
 * - loading=true only on true first load (no cached data available).
 */
export function useCachedFetch<T>(
  cacheKey: string | null,
  fetcher: () => Promise<ApiResult<T>>,
  ttlSeconds: number,
): UseCachedFetchResult<T> {
  const [data, setData] = useState<T | null>(() => {
    if (!cacheKey || typeof window === 'undefined') return null;
    return cacheGet<T>(cacheKey);
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!cacheKey || typeof window === 'undefined') return true;
    return cacheGet<T>(cacheKey) === null;
  });

  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  const run = useCallback(async () => {
    if (!cacheKey) return;
    const result = await fetcherRef.current();
    if (result.ok) {
      setData(result.data);
      setLoading(false);
      cacheSet(cacheKey, result.data, ttlSeconds);
    } else {
      setLoading(false);
    }
  }, [cacheKey, ttlSeconds]);

  useEffect(() => {
    if (!cacheKey) return;
    void run();
  }, [cacheKey, run]);

  return { data, loading, refresh: run };
}
