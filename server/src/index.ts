import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
const CACHE_DURATION = 60 * 1000; // 60 seconds

const getCached = (key: string) => {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) return null;
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
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      );
      if (!response.ok) throw new Error('CoinGecko failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Market data unavailable', data: [] });
  }
});

// Single coin detail
app.get('/api/coins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await fetchWithFallback(`coin_${id}`, async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      if (!response.ok) throw new Error('CoinGecko failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Coin data unavailable', data: null });
  }
});

// Coin chart history
app.get('/api/coins/:id/chart', async (req, res) => {
  const { id } = req.params;
  const { days = '7' } = req.query;
  try {
    const { data } = await fetchWithFallback(`chart_${id}_${days}`, async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
      );
      if (!response.ok) throw new Error('CoinGecko failed');
      return response.json();
    });
    res.json({ success: true, data });
  } catch (err) {
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
      const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
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

app.listen(PORT, () => {
  console.log(`Eke Market API running on port ${PORT}`);
});