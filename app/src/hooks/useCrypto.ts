import { useState, useEffect, useCallback } from 'react';
import { cryptoApi, handleApiError } from '@/services/cryptoApi';
import { localCache } from '@/api/localCache';
import type { CryptoAsset, CryptoDetail, MarketData, TrendingCoin, CryptoNews } from '@/types/crypto';

export const useTopCryptos = (page = 1, perPage = 50) => {
  const cacheKey = `coins_${page}_${perPage}`;
  const stale = localCache.getStale(cacheKey);
  const [data, setData] = useState<CryptoAsset[]>(stale || []);
  const [loading, setLoading] = useState(!stale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const cryptos = await cryptoApi.getTopCryptos(page, perPage);
        setData(cryptos);
        localCache.set(cacheKey, cryptos);
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        // Fallback to stale data if available
        const fallback = localCache.getStale(cacheKey);
        if (fallback) {
          setData(fallback);
          setError('Showing cached data — ' + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, perPage, cacheKey]);

  return { data, loading, error };
};

export const useCoinDetail = (id: string | undefined) => {
  const cacheKey = id ? `coin_detail_${id}` : null;
  const stale = cacheKey ? localCache.getStale(cacheKey) : null;
  const [data, setData] = useState<CryptoDetail | null>(stale || null);
  const [loading, setLoading] = useState(!stale && !!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const coin = await cryptoApi.getCoinDetail(id);
        setData(coin);
        if (cacheKey) localCache.set(cacheKey, coin);
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        const fallback = cacheKey ? localCache.getStale(cacheKey) : null;
        if (fallback) {
          setData(fallback);
          setError('Showing cached data — ' + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, cacheKey]);

  return { data, loading, error };
};

export const useCoinHistory = (id: string | undefined, days: number | 'max' = 7) => {
  const cacheKey = id ? `coin_history_${id}_${days}` : null;
  const stale = cacheKey ? localCache.getStale(cacheKey) : null;
  const [data, setData] = useState<{ prices: [number, number][] } | null>(stale || null);
  const [loading, setLoading] = useState(!stale && !!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await cryptoApi.getCoinHistory(id, days);
        setData(history);
        if (cacheKey) localCache.set(cacheKey, history);
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        const fallback = cacheKey ? localCache.getStale(cacheKey) : null;
        if (fallback) {
          setData(fallback);
          setError('Showing cached data — ' + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, days, cacheKey]);

  return { data, loading, error };
};

export const useGlobalData = () => {
  const cacheKey = 'global_data';
  const stale = localCache.getStale(cacheKey);
  const [data, setData] = useState<MarketData | null>(stale || null);
  const [loading, setLoading] = useState(!stale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const global = await cryptoApi.getGlobalData();
        setData(global.data);
        localCache.set(cacheKey, global.data);
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        const fallback = localCache.getStale(cacheKey);
        if (fallback) {
          setData(fallback);
          setError('Showing cached data — ' + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useTrendingCoins = () => {
  const cacheKey = 'trending_coins';
  const stale = localCache.getStale(cacheKey);
  const [data, setData] = useState<TrendingCoin[]>(stale || []);
  const [loading, setLoading] = useState(!stale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const trending = await cryptoApi.getTrendingCoins();
        setData(trending.coins);
        localCache.set(cacheKey, trending.coins);
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        const fallback = localCache.getStale(cacheKey);
        if (fallback) {
          setData(fallback);
          setError('Showing cached data — ' + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useGainersLosers = () => {
  const cacheKey = 'gainers_losers';
  const stale = localCache.getStale(cacheKey);
  const [data, setData] = useState<{ gainers: CryptoAsset[]; losers: CryptoAsset[] }>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(!stale);
  const [error, setError] = useState<string | null>(null);

  const fetchGainersLosers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cryptoApi.getGainersLosers();
      setData(result);
      localCache.set(cacheKey, result);
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      const fallback = localCache.getStale(cacheKey);
      if (fallback) {
        setData(fallback);
        setError('Showing cached data — ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGainersLosers();
  }, [fetchGainersLosers]);

  return { data, loading, error, refresh: fetchGainersLosers };
};

export const useCryptoNews = (limit = 6) => {
  const cacheKey = `crypto_news_${limit}`;
  const stale = localCache.getStale(cacheKey);
  const [data, setData] = useState<CryptoNews[]>(stale || []);
  const [loading, setLoading] = useState(!stale);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const news = await cryptoApi.getCryptoNews(limit);
      setData(news);
      localCache.set(cacheKey, news);
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      const fallback = localCache.getStale(cacheKey);
      if (fallback) {
        setData(fallback);
        setError('Showing cached data — ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, cacheKey]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { data, loading, error, refresh: fetchNews };
};

export const useExchangeRates = () => {
  const cacheKey = 'exchange_rates';
  const stale = localCache.getStale(cacheKey);
  const [rates, setRates] = useState<Record<string, number>>(stale || {});
  const [loading, setLoading] = useState(!stale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cryptoApi.getExchangeRates();
        setRates(data);
        localCache.set(cacheKey, data);
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        const fallback = localCache.getStale(cacheKey);
        if (fallback) {
          setRates(fallback);
          setError('Showing cached data — ' + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading, error };
};

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [coins, setCoins] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cryptoWatchlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWatchlist(parsed.map((item: { id: string }) => item.id));
      } catch {
        setWatchlist([]);
      }
    }
  }, []);

  // Fetch coins data when watchlist changes
  useEffect(() => {
    if (watchlist.length === 0) {
      setCoins([]);
      return;
    }

    const fetchCoins = async () => {
      setLoading(true);
      try {
        const data = await cryptoApi.getCoinsByIds(watchlist);
        setCoins(data);
      } catch (err) {
        console.error('Failed to fetch watchlist coins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [watchlist]);

  const addToWatchlist = useCallback((id: string) => {
    setWatchlist(prev => {
      if (prev.includes(id)) return prev;
      const newWatchlist = [...prev, id];
      const storageData = newWatchlist.map(id => ({ id, addedAt: Date.now() }));
      localStorage.setItem('cryptoWatchlist', JSON.stringify(storageData));
      return newWatchlist;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => {
      const newWatchlist = prev.filter(coinId => coinId !== id);
      const storageData = newWatchlist.map(id => ({ id, addedAt: Date.now() }));
      localStorage.setItem('cryptoWatchlist', JSON.stringify(storageData));
      return newWatchlist;
    });
  }, []);

  const isInWatchlist = useCallback((id: string) => {
    return watchlist.includes(id);
  }, [watchlist]);

  const toggleWatchlist = useCallback((id: string) => {
    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return { 
    watchlist, 
    coins, 
    loading, 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist,
    toggleWatchlist 
  };
};