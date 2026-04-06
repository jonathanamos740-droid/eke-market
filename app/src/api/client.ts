const BASE_URL = import.meta.env.VITE_API_URL;

// Debug logging
console.log('API URL:', BASE_URL);
if (!BASE_URL) {
  console.error('VITE_API_URL is not set — API calls will fail for all users');
}

const apiFetch = async (endpoint: string) => {
  // Try proxy first
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Proxy failed, falling back to direct API:', err);
    }
  }

  // Fallback to direct API calls
  try {
    let fallbackUrl = endpoint;
    
    // Map proxy endpoints to direct CoinGecko URLs
    if (endpoint === '/api/coins') {
      fallbackUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true';
    } else if (endpoint === '/api/global') {
      fallbackUrl = 'https://api.coingecko.com/api/v3/global';
    } else if (endpoint === '/api/trending') {
      fallbackUrl = 'https://api.coingecko.com/api/v3/search/trending';
    } else if (endpoint.startsWith('/api/coins/') && endpoint.includes('/chart')) {
      const match = endpoint.match(/\/api\/coins\/([^/]+)\/chart\?days=(\d+)/);
      if (match) {
        fallbackUrl = `https://api.coingecko.com/api/v3/coins/${match[1]}/market_chart?vs_currency=usd&days=${match[2]}`;
      }
    } else if (endpoint.startsWith('/api/coins/') && !endpoint.includes('/chart')) {
      const id = endpoint.replace('/api/coins/', '');
      fallbackUrl = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true`;
    } else if (endpoint.startsWith('/api/rates')) {
      fallbackUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
    }

    const res = await fetch(fallbackUrl);
    if (!res.ok) throw new Error(`Direct API error: ${res.status}`);
    return await res.json();
  } catch (fallbackErr) {
    console.error('Direct API fallback also failed:', fallbackErr);
    throw new Error(`All API attempts failed: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'}`);
  }
};

export const api = {
  getCoins: () => apiFetch('/api/coins'),
  getCoin: (id: string) => apiFetch(`/api/coins/${id}`),
  getChart: (id: string, days: string) => apiFetch(`/api/coins/${id}/chart?days=${days}`),
  getGlobal: () => apiFetch('/api/global'),
  getTrending: () => apiFetch('/api/trending'),
  getPrice: (symbol: string) => apiFetch(`/api/price/${symbol}`),
  getRates: () => apiFetch('/api/rates'),
};