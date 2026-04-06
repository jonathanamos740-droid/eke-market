import type { CryptoAsset, CryptoDetail, MarketData, TrendingCoin, CryptoNews } from '@/types/crypto';
import { api } from '@/api/client';

// Convert CoinGecko data to our CryptoAsset format
const convertCoinGeckoAsset = (coin: any): CryptoAsset => ({
  id: coin.id,
  symbol: coin.symbol?.toLowerCase() || '',
  name: coin.name || '',
  image: coin.image || '',
  current_price: coin.current_price || 0,
  market_cap: coin.market_cap || 0,
  market_cap_rank: coin.market_cap_rank || 0,
  fully_diluted_valuation: coin.fully_diluted_valuation || null,
  total_volume: coin.total_volume || 0,
  high_24h: coin.high_24h || 0,
  low_24h: coin.low_24h || 0,
  price_change_24h: coin.price_change_24h || 0,
  price_change_percentage_24h: coin.price_change_percentage_24h || 0,
  market_cap_change_24h: coin.market_cap_change_24h || 0,
  market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h || 0,
  circulating_supply: coin.circulating_supply || 0,
  total_supply: coin.total_supply || null,
  max_supply: coin.max_supply || null,
  ath: coin.ath || 0,
  ath_change_percentage: coin.ath_change_percentage || 0,
  ath_date: coin.ath_date || '',
  atl: coin.atl || 0,
  atl_change_percentage: coin.atl_change_percentage || 0,
  atl_date: coin.atl_date || '',
  roi: coin.roi || null,
  last_updated: coin.last_updated || new Date().toISOString(),
  sparkline_in_7d: coin.sparkline_in_7d || { price: [] },
});

export const cryptoApi = {
  // Get list of top cryptocurrencies
  getTopCryptos: async (page = 1, perPage = 50): Promise<CryptoAsset[]> => {
    try {
      const result = await api.getCoins();
      console.log('API Response:', result);
      
      // Handle different response formats
      let data = null;
      if (result.success && result.data) {
        data = result.data;
      } else if (Array.isArray(result)) {
        // Direct array response
        data = result;
      } else if (result.data) {
        data = result.data;
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format:', result);
        return [];
      }
      
      const start = (page - 1) * perPage;
      const end = start + perPage;
      return data.slice(start, end).map(convertCoinGeckoAsset);
    } catch (error) {
      console.error('Failed to fetch top cryptos:', error);
      return [];
    }
  },

  // Get detailed info about a specific coin
  getCoinDetail: async (id: string): Promise<CryptoDetail> => {
    try {
      const result = await api.getCoin(id);
      if (!result.success || !result.data) {
        throw new Error('Coin data unavailable');
      }
      
      const coin = result.data;
      
      // Transform CoinGecko detail response to our CryptoDetail format
      // CoinGecko detail API returns nested market_data
      const marketData = coin.market_data || coin;
      
      return {
        id: coin.id,
        symbol: coin.symbol?.toLowerCase() || '',
        name: coin.name || '',
        web_slug: coin.web_slug || coin.id,
        image: coin.image?.large || coin.image?.small || coin.image?.thumb || '',
        current_price: marketData.current_price?.usd || marketData.current_price || 0,
        market_cap: marketData.market_cap?.usd || marketData.market_cap || 0,
        market_cap_rank: coin.market_cap_rank || 0,
        fully_diluted_valuation: marketData.fully_diluted_valuation?.usd || marketData.fully_diluted_valuation || null,
        total_volume: marketData.total_volume?.usd || marketData.total_volume || 0,
        high_24h: marketData.high_24h?.usd || marketData.high_24h || 0,
        low_24h: marketData.low_24h?.usd || marketData.low_24h || 0,
        price_change_24h: marketData.price_change_24h || 0,
        price_change_percentage_24h: marketData.price_change_percentage_24h || 0,
        market_cap_change_24h: marketData.market_cap_change_24h || 0,
        market_cap_change_percentage_24h: marketData.market_cap_change_percentage_24h || 0,
        circulating_supply: marketData.circulating_supply || 0,
        total_supply: marketData.total_supply || marketData.max_supply || null,
        max_supply: marketData.max_supply || null,
        ath: marketData.ath?.usd || marketData.ath || 0,
        ath_change_percentage: marketData.ath_change_percentage?.usd || marketData.ath_change_percentage || 0,
        ath_date: marketData.ath_date?.usd || marketData.ath_date || '',
        atl: marketData.atl?.usd || marketData.atl || 0,
        atl_change_percentage: marketData.atl_change_percentage?.usd || marketData.atl_change_percentage || 0,
        atl_date: marketData.atl_date?.usd || marketData.atl_date || '',
        roi: marketData.roi || null,
        last_updated: coin.last_updated || marketData.last_updated || new Date().toISOString(),
      } as CryptoDetail;
    } catch (error) {
      console.error(`Failed to fetch coin detail for ${id}:`, error);
      throw new Error('Failed to fetch coin details');
    }
  },

  // Get currency exchange rates for converter
  getExchangeRates: async (): Promise<Record<string, number>> => {
    try {
      const result = await api.getRates();
      if (!result.success || !result.data?.rates) {
        throw new Error('Exchange rates unavailable');
      }
      const rates = result.data.rates;
      return {
        usd: rates.USD || 1,
        eur: rates.EUR || 0.92,
        gbp: rates.GBP || 0.79,
        jpy: rates.JPY || 154.5,
        cad: rates.CAD || 1.36,
        aud: rates.AUD || 1.53,
        chf: rates.CHF || 0.88,
        cny: rates.CNY || 7.24,
        inr: rates.INR || 83.5,
        krw: rates.KRW || 1350,
        ngn: rates.NGN || 1550,
        zar: rates.ZAR || 18.8,
        brl: rates.BRL || 5.05,
        rub: rates.RUB || 92.5,
      };
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Return static fallback rates
      return {
        usd: 1,
        eur: 0.92,
        gbp: 0.79,
        jpy: 154.5,
        cad: 1.36,
        aud: 1.53,
        chf: 0.88,
        cny: 7.24,
        inr: 83.5,
        krw: 1350,
        ngn: 1550,
        zar: 18.8,
        brl: 5.05,
        rub: 92.5,
      };
    }
  },

  // Get coin price history
  getCoinHistory: async (id: string, days: number | 'max' = 7): Promise<{ prices: [number, number][] }> => {
    try {
      const result = await api.getChart(id, String(days));
      if (!result.success || !result.data?.prices) {
        return { prices: [] };
      }
      return { prices: result.data.prices };
    } catch (error) {
      console.error('Failed to fetch coin history:', error);
      return { prices: [] };
    }
  },

  // Get global market data
  getGlobalData: async (): Promise<{ data: MarketData }> => {
    try {
      const result = await api.getGlobal();
      if (!result.success || !result.data) {
        throw new Error('Global data unavailable');
      }
      return result.data;
    } catch (error) {
      console.error('Failed to fetch global data:', error);
      // Return mock data as fallback
      return {
        data: {
          active_cryptocurrencies: 13000,
          upcoming_icos: 0,
          ongoing_icos: 0,
          ended_icos: 0,
          markets: 700,
          total_market_cap: { usd: 2500000000000 },
          total_volume: { usd: 50000000000 },
          market_cap_percentage: { btc: 50, eth: 17 },
          market_cap_change_percentage_24h_usd: 0,
          updated_at: Math.floor(Date.now() / 1000),
        }
      };
    }
  },

  // Get trending coins
  getTrendingCoins: async (): Promise<{ coins: TrendingCoin[] }> => {
    try {
      const result = await api.getTrending();
      if (!result.success || !result.data?.coins) {
        return { coins: [] };
      }
      return { coins: result.data.coins };
    } catch (error) {
      console.error('Failed to fetch trending coins:', error);
      return { coins: [] };
    }
  },

  // Get top gainers and losers
  getGainersLosers: async (): Promise<{ gainers: CryptoAsset[]; losers: CryptoAsset[] }> => {
    try {
      const result = await api.getCoins();
      if (!result.success || !result.data) {
        return { gainers: [], losers: [] };
      }

      const cryptos = result.data.map(convertCoinGeckoAsset);
      
      // Sort by 24h change percentage
      const sortedByChange = [...cryptos].sort(
        (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      );
      
      const gainers = sortedByChange
        .filter((c) => (c.price_change_percentage_24h || 0) > 0)
        .slice(0, 15);
      
      const losers = sortedByChange
        .filter((c) => (c.price_change_percentage_24h || 0) < 0)
        .slice(0, 15);
      
      return { gainers, losers };
    } catch (error) {
      console.error('Failed to fetch gainers/losers:', error);
      return { gainers: [], losers: [] };
    }
  },

  // Get multiple coins by IDs
  getCoinsByIds: async (ids: string[]): Promise<CryptoAsset[]> => {
    if (ids.length === 0) return [];
    
    try {
      const result = await api.getCoins();
      if (!result.success || !result.data) return [];
      
      return result.data
        .filter((coin: any) => ids.includes(coin.id))
        .map(convertCoinGeckoAsset);
    } catch (error) {
      console.error('Failed to fetch coins by IDs:', error);
      return [];
    }
  },

  // Get crypto news (mock data - proxy doesn't handle news yet)
  getCryptoNews: async (limit = 10): Promise<CryptoNews[]> => {
    // Return mock news as the proxy doesn't handle news yet
    return [
      {
        id: 1,
        title: 'Bitcoin Surges Past Key Resistance Level as Institutional Interest Grows',
        source: 'CryptoNews',
        url: '#',
        published_at: new Date().toISOString(),
        kind: 'news',
        votes: { positive: 120, negative: 5 },
        coin: { code: 'BTC', name: 'Bitcoin' },
      },
      {
        id: 2,
        title: 'Ethereum Network Upgrade Successfully Deployed, Gas Fees Expected to Drop',
        source: 'CryptoNews',
        url: '#',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        kind: 'news',
        votes: { positive: 89, negative: 3 },
        coin: { code: 'ETH', name: 'Ethereum' },
      },
      {
        id: 3,
        title: 'Major Exchange Announces Support for New DeFi Tokens',
        source: 'CryptoNews',
        url: '#',
        published_at: new Date(Date.now() - 7200000).toISOString(),
        kind: 'news',
        votes: { positive: 56, negative: 8 },
      },
    ].slice(0, limit);
  },
};

// Error handler helper
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};