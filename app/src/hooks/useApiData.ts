import { useState, useEffect, useCallback } from 'react';
import { localCache } from '../api/localCache';

interface UseApiDataOptions {
  cacheKey: string;
  fetchFn: () => Promise<any>;
  enabled?: boolean;
}

export const useApiData = ({ cacheKey, fetchFn, enabled = true }: UseApiDataOptions) => {
  const stale = localCache.getStale(cacheKey);
  const [data, setData] = useState<any>(stale || null); // show stale immediately
  const [loading, setLoading] = useState(!stale); // only show spinner if no stale data
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      if (!data) setLoading(true);
      const result = await fetchFn();
      if (result?.data !== undefined) {
        setData(result.data);
        localCache.set(cacheKey, result.data);
      } else if (result !== undefined) {
        // Handle cases where result itself is the data
        setData(result);
        localCache.set(cacheKey, result);
      }
    } catch (err: any) {
      console.error(`useApiData [${cacheKey}] failed:`, err);
      // If live fetch fails, try stale cache as last resort
      const fallback = localCache.getStale(cacheKey);
      if (fallback) {
        setData(fallback);
        setError('Showing cached data — pull to refresh');
      } else {
        setError('Could not load data. Tap to retry.');
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, data]);

  useEffect(() => {
    if (enabled) fetch();
  }, [enabled]);

  return { data, loading, error, refetch: fetch };
};