import { useState, useEffect, useCallback } from 'react';
import { cryptoApi, handleApiError } from '@/services/cryptoApi';
import type { CryptoAsset, CryptoDetail, MarketData, TrendingCoin, CryptoNews } from '@/types/crypto';

export const useTopCryptos = (page = 1, perPage = 50) => {
  const [data, setData] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const cryptos = await cryptoApi.getTopCryptos(page, perPage);
        setData(cryptos);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, perPage]);

  return { data, loading, error };
};

export const useCoinDetail = (id: string | undefined) => {
  const [data, setData] = useState<CryptoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const coin = await cryptoApi.getCoinDetail(id);
        setData(coin);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
};

export const useCoinHistory = (id: string | undefined, days: number | 'max' = 7) => {
  const [data, setData] = useState<{ prices: [number, number][] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await cryptoApi.getCoinHistory(id, days);
        setData(history);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, days]);

  return { data, loading, error };
};

export const useGlobalData = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const global = await cryptoApi.getGlobalData();
        setData(global.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useTrendingCoins = () => {
  const [data, setData] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const trending = await cryptoApi.getTrendingCoins();
        setData(trending.coins);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useGainersLosers = () => {
  const [data, setData] = useState<{ gainers: CryptoAsset[]; losers: CryptoAsset[] }>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGainersLosers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cryptoApi.getGainersLosers();
      setData(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGainersLosers();
  }, []);

  return { data, loading, error, refresh: fetchGainersLosers };
};

export const useCryptoNews = (limit = 6) => {
  const [data, setData] = useState<CryptoNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const news = await cryptoApi.getCryptoNews(limit);
      setData(news);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [limit]);

  return { data, loading, error, refresh: fetchNews };
};

export const useExchangeRates = () => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cryptoApi.getExchangeRates();
        setRates(data);
      } catch (err) {
        setError(handleApiError(err));
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
