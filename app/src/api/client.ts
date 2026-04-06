const BASE_URL = import.meta.env.VITE_API_URL;

// Debug logging
console.log('API URL:', BASE_URL);
if (!BASE_URL) {
  console.error('VITE_API_URL is not set — API calls will fail for all users');
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const apiFetch = async (endpoint: string, retries = 3, backoff = 800): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout per attempt

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      const isLast = attempt === retries;
      if (isLast) throw err;
      console.warn(`Attempt ${attempt} failed for ${endpoint}, retrying in ${backoff * attempt}ms...`);
      await sleep(backoff * attempt); // exponential backoff: 800ms, 1600ms, 2400ms
    }
  }
};

export const api = {
  getCoins: () => apiFetch('/api/coins'),
  getCoin: (id: string) => apiFetch(`/api/coins/${id}`),
  getChart: (id: string, days: string) => apiFetch(`/api/coins/${id}/chart?days=${days}`),
  getGlobal: () => apiFetch('/api/global'),
  getTrending: () => apiFetch('/api/trending'),
  getPrice: (symbol: string) => apiFetch(`/api/price/${symbol}`),
  getPrices: () => apiFetch('/api/prices'),
  getRates: () => apiFetch('/api/rates'),
  searchCoins: (query: string) => apiFetch(`/api/search?query=${encodeURIComponent(query)}`),
  getGainersLosers: () => apiFetch('/api/gainers-losers'),
  compareCoins: (ids: string[]) => apiFetch(`/api/compare?ids=${ids.join(',')}`),
  getFearGreed: () => apiFetch('/api/fear-greed'),
};