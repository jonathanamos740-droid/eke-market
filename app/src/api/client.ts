const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiFetch = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
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