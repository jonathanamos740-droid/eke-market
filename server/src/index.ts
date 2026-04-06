import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const COINGECKO_API_KEY = 'CG-ww38dvoPhso7kYTyXbLrMQ8h';

// ── CORS CONFIGURATION ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Manual CORS headers as safety net
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// ── IN-MEMORY CACHE ──
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds for general data
const COIN_DETAIL_CACHE = 5 * 60 * 1000; // 5 minutes for coin details (reduce API calls)
const CHART_CACHE = 3 * 60 * 1000; // 3 minutes for charts

const getCached = (key: string, customDuration?: number) => {
  const entry = cache[key];
  if (!entry) return null;
  const duration = customDuration || CACHE_DURATION;
  if (Date.now() - entry.timestamp > duration) return null;
  return entry.data;
};

const setCache = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

// ── LAST KNOWN GOOD DATA (survives API downtime) ──
const lastGood: Record<string, any> = {};

const fetchWithFallback = async (key: string, fetchFn: () => Promise<any>) => {
  // 1. Return cache if fresh
  const cached = getCached(key);
  if (cached) return { data: cached, source: 'cache' };

  // 2. Try live fetch
  try {
    const data = await fetchFn();
    setCache(key, data);
    lastGood[key] = data; // save as last known good
    return { data, source: 'live' };
  } catch (err) {
    // 3. Fall back to last known good data
    if (lastGood[key]) {
      return { data: lastGood[key], source: 'fallback' };
    }
    throw err;
  }
};

// ── ROUTES ──

// Top coins list
app.get('/api/coins', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('coins', async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d',
        { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } }
      );
      if (!response.ok) throw new Error(`CoinGecko failed: ${response.status} ${response.statusText}`);
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error('API coins error:', err);
    res.status(503).json({ success: false, error: 'Market data unavailable', data: [] });
  }
});

// Mock data for popular coins (fallback when API fails)
const mockCoins: Record<string, any> = {
  ethereum: {
    id: 'ethereum', symbol: 'eth', name: 'Ethereum', web_slug: 'ethereum',
    image: { large: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628' },
    market_cap_rank: 2,
    market_data: {
      current_price: { usd: 3450 }, market_cap: { usd: 415000000000 },
      total_volume: { usd: 15000000000 }, circulating_supply: 120000000,
      total_supply: 120000000, max_supply: null,
      ath: { usd: 4878 }, ath_change_percentage: { usd: -29.3 },
      ath_date: { usd: '2021-11-10T14:24:19.604Z' },
      atl: { usd: 0.432 }, atl_change_percentage: { usd: 798000 },
      atl_date: { usd: '2015-10-20T00:00:00.000Z' },
      price_change_24h: 50, price_change_percentage_24h: 1.5,
      market_cap_change_24h: 6000000000, market_cap_change_percentage_24h: 1.5,
      high_24h: { usd: 3500 }, low_24h: { usd: 3400 },
      fully_diluted_valuation: { usd: 415000000000 },
      last_updated: new Date().toISOString()
    },
    last_updated: new Date().toISOString()
  },
  bnb: {
    id: 'bnb', symbol: 'bnb', name: 'BNB', web_slug: 'bnb',
    image: { large: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970' },
    market_cap_rank: 4,
    market_data: {
      current_price: { usd: 610 }, market_cap: { usd: 90000000000 },
      total_volume: { usd: 1200000000 }, circulating_supply: 147000000,
      total_supply: 147000000, max_supply: 200000000,
      ath: { usd: 720 }, ath_change_percentage: { usd: -15.3 },
      ath_date: { usd: '2021-05-10T07:24:17.097Z' },
      atl: { usd: 0.0398 }, atl_change_percentage: { usd: 1532000 },
      atl_date: { usd: '2017-10-19T00:00:00.000Z' },
      price_change_24h: 8, price_change_percentage_24h: 1.3,
      market_cap_change_24h: 1200000000, market_cap_change_percentage_24h: 1.3,
      high_24h: { usd: 620 }, low_24h: { usd: 600 },
      fully_diluted_valuation: { usd: 122000000000 },
      last_updated: new Date().toISOString()
    },
    last_updated: new Date().toISOString()
  },
  solana: {
    id: 'solana', symbol: 'sol', name: 'Solana', web_slug: 'solana',
    image: { large: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1696505549' },
    market_cap_rank: 5,
    market_data: {
      current_price: { usd: 145 }, market_cap: { usd: 68000000000 },
      total_volume: { usd: 3500000000 }, circulating_supply: 469000000,
      total_supply: 580000000, max_supply: null,
      ath: { usd: 260 }, ath_change_percentage: { usd: -44.2 },
      ath_date: { usd: '2021-11-06T21:54:35.825Z' },
      atl: { usd: 0.5 }, atl_change_percentage: { usd: 28900 },
      atl_date: { usd: '2020-05-11T19:35:23.449Z' },
      price_change_24h: 3, price_change_percentage_24h: 2.1,
      market_cap_change_24h: 1400000000, market_cap_change_percentage_24h: 2.1,
      high_24h: { usd: 148 }, low_24h: { usd: 140 },
      fully_diluted_valuation: { usd: 84100000000 },
      last_updated: new Date().toISOString()
    },
    last_updated: new Date().toISOString()
  },
  ripple: {
    id: 'ripple', symbol: 'xrp', name: 'XRP', web_slug: 'xrp',
    image: { large: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501419' },
    market_cap_rank: 3,
    market_data: {
      current_price: { usd: 2.15 }, market_cap: { usd: 124000000000 },
      total_volume: { usd: 5000000000 }, circulating_supply: 57500000000,
      total_supply: 100000000000, max_supply: 100000000000,
      ath: { usd: 3.4 }, ath_change_percentage: { usd: -36.8 },
      ath_date: { usd: '2026-01-15T00:00:00.000Z' },
      atl: { usd: 0.00268 }, atl_change_percentage: { usd: 80000 },
      atl_date: { usd: '2014-05-22T00:00:00.000Z' },
      price_change_24h: 0.05, price_change_percentage_24h: 2.4,
      market_cap_change_24h: 3000000000, market_cap_change_percentage_24h: 2.5,
      high_24h: { usd: 2.2 }, low_24h: { usd: 2.1 },
      fully_diluted_valuation: { usd: 215000000000 },
      last_updated: new Date().toISOString()
    },
    last_updated: new Date().toISOString()
  },
  dogecoin: {
    id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', web_slug: 'dogecoin',
    image: { large: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png?1696501407' },
    market_cap_rank: 9,
    market_data: {
      current_price: { usd: 0.22 }, market_cap: { usd: 32000000000 },
      total_volume: { usd: 2000000000 }, circulating_supply: 145000000000,
      total_supply: 145000000000, max_supply: null,
      ath: { usd: 0.73 }, ath_change_percentage: { usd: -69.9 },
      ath_date: { usd: '2021-05-08T05:08:23.458Z' },
      atl: { usd: 0.00008547 }, atl_change_percentage: { usd: 256000 },
      atl_date: { usd: '2015-05-06T00:00:00.000Z' },
      price_change_24h: 0.005, price_change_percentage_24h: 2.3,
      market_cap_change_24h: 700000000, market_cap_change_percentage_24h: 2.2,
      high_24h: { usd: 0.225 }, low_24h: { usd: 0.215 },
      fully_diluted_valuation: { usd: 31900000000 },
      last_updated: new Date().toISOString()
    },
    last_updated: new Date().toISOString()
  }
};

// Single coin detail
app.get('/api/coins/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `coin_${id}`;
  
  // Check cache first with longer duration
  const cached = getCached(cacheKey, COIN_DETAIL_CACHE);
  if (cached) {
    return res.json({ success: true, data: cached, source: 'cache' });
  }
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } }
    );
    
    if (!response.ok) {
      // If rate limited, return cached or fallback data
      if (lastGood[cacheKey]) {
        return res.json({ success: true, data: lastGood[cacheKey], source: 'fallback' });
      }
      // Use mock data for popular coins
      if (mockCoins[id]) {
        console.log(`Using mock data for ${id}`);
        return res.json({ success: true, data: mockCoins[id], source: 'mock' });
      }
      throw new Error('CoinGecko failed');
    }
    
    const data = await response.json();
    setCache(cacheKey, data);
    lastGood[cacheKey] = data;
    res.json({ success: true, data, source: 'live' });
  } catch (err) {
    // Return fallback data if available
    if (lastGood[cacheKey]) {
      return res.json({ success: true, data: lastGood[cacheKey], source: 'fallback' });
    }
    // Use mock data for popular coins
    if (mockCoins[id]) {
      console.log(`Using mock data for ${id}`);
      return res.json({ success: true, data: mockCoins[id], source: 'mock' });
    }
    res.status(503).json({ success: false, error: 'Coin data unavailable', data: null });
  }
});

// Coin chart history
app.get('/api/coins/:id/chart', async (req, res) => {
  const { id } = req.params;
  const { days = '7' } = req.query;
  const cacheKey = `chart_${id}_${days}`;
  
  // Check cache first
  const cached = getCached(cacheKey, CHART_CACHE);
  if (cached) {
    return res.json({ success: true, data: cached, source: 'cache' });
  }
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } }
    );
    
    if (!response.ok) {
      if (lastGood[cacheKey]) {
        return res.json({ success: true, data: lastGood[cacheKey], source: 'fallback' });
      }
      throw new Error('CoinGecko failed');
    }
    
    const data = await response.json();
    setCache(cacheKey, data);
    lastGood[cacheKey] = data;
    res.json({ success: true, data, source: 'live' });
  } catch (err) {
    if (lastGood[cacheKey]) {
      return res.json({ success: true, data: lastGood[cacheKey], source: 'fallback' });
    }
    res.status(503).json({ success: false, error: 'Chart data unavailable', data: null });
  }
});

// Global market stats
app.get('/api/global', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('global', async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      if (!response.ok) throw new Error('CoinGecko failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Global data unavailable', data: null });
  }
});

// Trending coins
app.get('/api/trending', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('trending', async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/search/trending', {
        headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY }
      });
      if (!response.ok) throw new Error('CoinGecko failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Trending data unavailable', data: null });
  }
});

// Real-time price from Binance
app.get('/api/price/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const { data } = await fetchWithFallback(`price_${symbol}`, async () => {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`
      );
      if (!response.ok) throw new Error('Binance failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Price data unavailable', data: null });
  }
});

// Currency exchange rates
app.get('/api/rates', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('rates', async () => {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      if (!response.ok) throw new Error('Exchange rates failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    // hardcoded fallback rates if API fails
    res.json({
      success: true,
      data: {
        rates: {
          NGN: 1580, EUR: 0.93, GBP: 0.79,
          GHS: 14.2, KES: 129, ZAR: 18.6,
        }
      },
      source: 'fallback'
    });
  }
});

// Coin search
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  try {
    const { data } = await fetchWithFallback(`search_${query}`, async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`,
        { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } }
      );
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Search unavailable', data: null });
  }
});

// Top gainers and losers
app.get('/api/gainers-losers', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('gainers_losers', async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=24h',
        { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } }
      );
      if (!response.ok) throw new Error('Gainers losers failed');
      return response.json();
    });
    // Sort for gainers and losers on the server side
    const sorted = [...data].sort((a: any, b: any) =>
      (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );
    res.json({
      success: true,
      data: {
        gainers: sorted.filter((c: any) => (c.price_change_percentage_24h || 0) > 0).slice(0, 10),
        losers: sorted.filter((c: any) => (c.price_change_percentage_24h || 0) < 0).slice(0, 10),
      }
    });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Data unavailable', data: null });
  }
});

// Coin comparison — fetch multiple coins at once
app.get('/api/compare', async (req, res) => {
  const { ids } = req.query; // comma separated e.g. bitcoin,ethereum,solana
  try {
    const { data } = await fetchWithFallback(`compare_${ids}`, async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
        { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } }
      );
      if (!response.ok) throw new Error('Comparison failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Comparison unavailable', data: null });
  }
});

// Fear and greed index
app.get('/api/fear-greed', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('fear_greed', async () => {
      const response = await fetch('https://api.alternative.me/fng/?limit=1');
      if (!response.ok) throw new Error('Fear greed failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Fear greed unavailable', data: null });
  }
});

// Binance real-time prices for multiple symbols
app.get('/api/prices', async (req, res) => {
  try {
    const { data } = await fetchWithFallback('binance_prices', async () => {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!response.ok) throw new Error('Binance failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Price data unavailable', data: [] });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), cache: Object.keys(cache).length });
});

// ── CACHE WARMER ──
const warmCache = async () => {
  try {
    await fetch(`http://localhost:${PORT}/api/coins`);
    await fetch(`http://localhost:${PORT}/api/global`);
    await fetch(`http://localhost:${PORT}/api/trending`);
    console.log('Cache warmed at', new Date().toISOString());
  } catch (err) {
    console.error('Cache warm failed:', err);
  }
};

// Run immediately on startup then every 55 seconds
setTimeout(warmCache, 5000);
setInterval(warmCache, 55 * 1000);

// ── KEEP-ALIVE SELF-PING (prevents Render free tier sleep) ──
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

setInterval(async () => {
  try {
    await fetch(`${SELF_URL}/health`);
    console.log('Keep-alive ping sent to', SELF_URL);
  } catch (err) {
    console.warn('Keep-alive ping failed:', err);
  }
}, 10 * 60 * 1000); // every 10 minutes

app.listen(PORT, () => {
  console.log(`Eke Market API running on port ${PORT}`);
  console.log(`External URL: ${SELF_URL}`);
});
