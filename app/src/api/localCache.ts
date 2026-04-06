const CACHE_PREFIX = 'eke_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes — show stale data up to 5 mins old

export const localCache = {
  set(key: string, data: any) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch {}
  },

  get(key: string): any | null {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL) return null; // expired
      return data;
    } catch {
      return null;
    }
  },

  getStale(key: string): any | null {
    // Returns data even if expired — used as last resort fallback
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw).data;
    } catch {
      return null;
    }
  },

  clear(key: string) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch {}
  },

  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  },
};