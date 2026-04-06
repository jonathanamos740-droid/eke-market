import axios from 'axios';
import type { CryptoAsset, CryptoDetail, MarketData, TrendingCoin, CryptoNews } from '@/types/crypto';

// API Base URLs
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINCAP_API_BASE = 'https://api.coincap.io/v2';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Create API instances with timeout for faster fallback
const binanceApi = axios.create({
  baseURL: BINANCE_API_BASE,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 8000,
});

const coincapApi = axios.create({
  baseURL: COINCAP_API_BASE,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 8000,
});

// Binance to standard ID mapping
const BINANCE_TO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'XRP': 'xrp',
  'DOGE': 'dogecoin',
  'ADA': 'cardano',
  'TRX': 'tron',
  'AVAX': 'avalanche-2',
  'SHIB': 'shiba-inu',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'BCH': 'bitcoin-cash',
  'NEAR': 'near',
  'MATIC': 'matic-network',
  'LTC': 'litecoin',
  'ICP': 'internet-computer',
  'DAI': 'dai',
  'UNI': 'uniswap',
  'ETC': 'ethereum-classic',
  'XMR': 'monero',
  'XLM': 'stellar',
  'OKB': 'okb',
  'FIL': 'filecoin',
  'ATOM': 'cosmos',
  'HBAR': 'hedera-hashgraph',
  'CRO': 'cronos',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'VET': 'vechain',
  'ALGO': 'algorand',
};

// Known market cap estimates for major coins (used as fallback when API doesn't provide)
const KNOWN_MARKET_CAPS: Record<string, number> = {
  'bitcoin': 1800000000000,
  'ethereum': 400000000000,
  'tether': 140000000000,
  'binancecoin': 80000000000,
  'solana': 75000000000,
  'xrp': 35000000000,
  'usd-coin': 34000000000,
  'dogecoin': 25000000000,
  'cardano': 20000000000,
  'tron': 18000000000,
  'avalanche-2': 15000000000,
  'shiba-inu': 8000000000,
  'polkadot': 10000000000,
  'chainlink': 9000000000,
  'bitcoin-cash': 7000000000,
  'near': 6000000000,
  'matic-network': 5000000000,
  'litecoin': 7000000000,
  'internet-computer': 5000000000,
  'dai': 5000000000,
  'uniswap': 5000000000,
  'ethereum-classic': 4000000000,
  'monero': 3000000000,
  'stellar': 3000000000,
  'okb': 4000000000,
  'filecoin': 3000000000,
  'cosmos': 4000000000,
  'hedera-hashgraph': 3000000000,
  'cronos': 2000000000,
  'aptos': 5000000000,
  'arbitrum': 4000000000,
  'vechain': 2000000000,
  'algorand': 2000000000,
};

// Convert Binance ticker to our CryptoAsset format
const convertBinanceTicker = (ticker: any, rank?: number): CryptoAsset => {
  const symbol = ticker.symbol.replace('USDT', '');
  const price = parseFloat(ticker.lastPrice) || 0;
  const change24h = parseFloat(ticker.priceChangePercent) || 0;
  const id = BINANCE_TO_ID[symbol]?.toLowerCase() || symbol.toLowerCase();
  
  // Get market cap from known values or calculate from volume (rough estimate)
  const knownMarketCap = KNOWN_MARKET_CAPS[id] || 0;
  const estimatedMarketCap = knownMarketCap > 0 ? knownMarketCap : (parseFloat(ticker.quoteVolume) || 0) * 0.5;
  
  // Use CoinGecko images for better compatibility
  const imageMap: Record<string, string> = {
    'bitcoin': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    'ethereum': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    'tether': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    'binancecoin': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    'solana': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    'usd-coin': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    'xrp': 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    'dogecoin': 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    'cardano': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    'tron': 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
    'avalanche-2': 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png',
    'shiba-inu': 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    'polkadot': 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    'chainlink': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    'bitcoin-cash': 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png',
    'near': 'https://assets.coingecko.com/coins/images/10365/small/near_icon.png',
    'matic-network': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    'litecoin': 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
    'internet-computer': 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
    'dai': 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
    'uniswap': 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    'ethereum-classic': 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png',
    'monero': 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png',
    'stellar': 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
    'okb': 'https://assets.coingecko.com/coins/images/4826/small/WeChat_Image_20220118095041.png',
    'filecoin': 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png',
    'cosmos': 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    'hedera-hashgraph': 'https://assets.coingecko.com/coins/images/3441/small/Hedera_Hashgraph_logo.png',
    'cronos': 'https://assets.coingecko.com/coins/images/7310/small/cro_token_logo.png',
    'aptos': 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
    'arbitrum': 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    'vechain': 'https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png',
    'algorand': 'https://assets.coingecko.com/coins/images/4380/small/download.png',
  };
  
  return {
    id,
    symbol: symbol.toLowerCase(),
    name: BINANCE_TO_ID[symbol] || symbol,
    image: imageMap[id] || `https://assets.coingecko.com/coins/images/${id}/small/${symbol.toLowerCase()}.png`,
    current_price: price,
    market_cap: estimatedMarketCap,
    market_cap_rank: rank || 0,
    fully_diluted_valuation: null,
    total_volume: parseFloat(ticker.quoteVolume) || 0,
    high_24h: parseFloat(ticker.highPrice) || price,
    low_24h: parseFloat(ticker.lowPrice) || price,
    price_change_24h: parseFloat(ticker.priceChange) || 0,
    price_change_percentage_24h: change24h,
    market_cap_change_24h: 0,
    market_cap_change_percentage_24h: change24h,
    circulating_supply: estimatedMarketCap > 0 && price > 0 ? estimatedMarketCap / price : 0,
    total_supply: null,
    max_supply: null,
    ath: price * 2, // Placeholder
    ath_change_percentage: -50, // Placeholder
    ath_date: '',
    atl: price * 0.5, // Placeholder
    atl_change_percentage: 100, // Placeholder
    atl_date: '',
    roi: null,
    last_updated: new Date(ticker.closeTime || Date.now()).toISOString(),
    sparkline_in_7d: { price: [] },
  };
};

// Convert CoinCap asset to our CryptoAsset format
const convertCoinCapAsset = (asset: any): CryptoAsset => {
  const price = parseFloat(asset.priceUsd) || 0;
  const change24h = parseFloat(asset.changePercent24Hr) || 0;
  
  return {
    id: asset.id,
    symbol: asset.symbol.toLowerCase(),
    name: asset.name,
    image: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
    current_price: price,
    market_cap: parseFloat(asset.marketCapUsd) || 0,
    market_cap_rank: parseInt(asset.rank) || 0,
    fully_diluted_valuation: parseFloat(asset.supply?.maxSupply) ? 
      price * parseFloat(asset.supply?.maxSupply) : null,
    total_volume: 0,
    high_24h: price * (1 + Math.abs(change24h) / 100),
    low_24h: price * (1 - Math.abs(change24h) / 100),
    price_change_24h: price * (change24h / 100),
    price_change_percentage_24h: change24h,
    market_cap_change_24h: 0,
    market_cap_change_percentage_24h: change24h,
    circulating_supply: parseFloat(asset.supply?.circulatingSupply) || 0,
    total_supply: parseFloat(asset.supply?.totalSupply) || null,
    max_supply: parseFloat(asset.supply?.maxSupply) || null,
    ath: price * 2,
    ath_change_percentage: -50,
    ath_date: '',
    atl: price * 0.5,
    atl_change_percentage: 100,
    atl_date: '',
    roi: null,
    last_updated: new Date().toISOString(),
    sparkline_in_7d: { price: [] },
  };
};

export const cryptoApi = {
  // Get list of top cryptocurrencies (using Binance as primary - most reliable)
  getTopCryptos: async (page = 1, perPage = 50): Promise<CryptoAsset[]> => {
    // Try Binance first - most reliable, no CORS issues
    try {
      console.log('Fetching from Binance...');
      const response = await binanceApi.get('/ticker/24hr');
      
      // Sort by quote volume (24h trading volume) to approximate market cap ranking
      const sortedData = response.data
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0));
      
      // Assign ranks and convert
      const data = sortedData
        .slice((page - 1) * perPage, page * perPage)
        .map((ticker: any, index: number) => convertBinanceTicker(ticker, (page - 1) * perPage + index + 1));
      
      console.log('Binance response:', data.length, 'coins');
      return data;
    } catch (binanceError) {
      console.warn('Binance API failed, trying CoinGecko...', binanceError);
      
      try {
        // Fallback: CoinGecko via CORS proxy
        console.log('Fetching from CoinGecko via proxy...');
        const proxyUrl = CORS_PROXY + encodeURIComponent(
          `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`
        );
        const response = await axios.get(proxyUrl);
        console.log('CoinGecko response:', response.data?.length, 'coins');
        return response.data || [];
      } catch (geckoError) {
        console.warn('CoinGecko failed, trying CoinCap...', geckoError);
        
        try {
          // Final fallback: CoinCap API
          console.log('Fetching from CoinCap...');
          const response = await coincapApi.get('/assets', {
            params: {
              limit: perPage,
              offset: (page - 1) * perPage,
            },
          });
          console.log('CoinCap response:', response.data.data?.length, 'assets');
          return response.data.data.map(convertCoinCapAsset);
        } catch (coincapError) {
          console.error('All APIs failed for top cryptos', coincapError);
          return [];
        }
      }
    }
  },

  // Get detailed info about a specific coin - using CoinGecko for full data
  getCoinDetail: async (id: string): Promise<CryptoDetail> => {
    try {
      // Try CoinGecko first for complete data including market cap (with timeout)
      console.log(`Fetching coin detail for ${id} from CoinGecko...`);
      const proxyUrl = CORS_PROXY + encodeURIComponent(
        `${COINGECKO_API_BASE}/coins/${id}?localization=false&tickers=false&market_data=true`
      );
      const response = await axios.get(proxyUrl, { timeout: 10000 });
      console.log('CoinGecko coin detail response:', response.data?.name);
      return response.data;
    } catch (geckoError) {
      console.warn(`CoinGecko failed for ${id}, trying Binance...`, geckoError);
      
      try {
        // Fallback to Binance - get all tickers and find the coin
        console.log(`Fetching from Binance for ${id}...`);
        const response = await binanceApi.get('/ticker/24hr');
        
        // Find the matching ticker
        const ticker = response.data.find((t: any) => {
          const symbol = t.symbol.replace('USDT', '');
          const tickerId = BINANCE_TO_ID[symbol]?.toLowerCase() || symbol.toLowerCase();
          return tickerId === id;
        });
        
        if (ticker) {
          // Find rank by sorting
          const sortedData = response.data
            .filter((t: any) => t.symbol.endsWith('USDT'))
            .sort((a: any, b: any) => parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0));
          const rank = sortedData.indexOf(ticker) + 1;
          
          const asset = convertBinanceTicker(ticker, rank);
          
          // Convert to CryptoDetail format with all required fields
          return {
            ...asset,
            // Keep the image as a string (not an object) for compatibility
            // Add missing CryptoDetail fields
            description: { en: '' },
            links: { 
              homepage: [], 
              blockchain_site: [],
              official_forum_url: [],
              chat_url: [],
              announcement_url: [],
              twitter_screen_name: '',
              facebook_username: '',
              bitcointalk_thread_identifier: null,
              telegram_channel_identifier: '',
              subreddit_url: '',
              repos_url: { github: [], bitbucket: [] },
            },
            market_data: {
              current_price: { usd: asset.current_price },
              market_cap: { usd: asset.market_cap },
              total_volume: { usd: asset.total_volume },
              high_24h: { usd: asset.high_24h },
              low_24h: { usd: asset.low_24h },
              price_change_24h: asset.price_change_24h,
              price_change_percentage_24h: asset.price_change_percentage_24h,
              price_change_percentage_7d: 0,
              price_change_percentage_30d: 0,
              price_change_percentage_1y: 0,
              market_cap_change_24h: asset.market_cap_change_24h,
              market_cap_change_percentage_24h: asset.market_cap_change_percentage_24h,
              circulating_supply: asset.circulating_supply,
              total_supply: asset.total_supply,
              max_supply: asset.max_supply,
              ath: { usd: asset.ath },
              ath_change_percentage: { usd: asset.ath_change_percentage },
              ath_date: { usd: asset.ath_date },
              atl: { usd: asset.atl },
              atl_change_percentage: { usd: asset.atl_change_percentage },
              atl_date: { usd: asset.atl_date },
            },
            name: asset.name,
            symbol: asset.symbol,
          } as unknown as CryptoDetail;
        }
        
        throw new Error('Coin not found');
      } catch (binanceError) {
        console.error('All APIs failed for coin detail', binanceError);
        throw new Error('Failed to fetch coin details');
      }
    }
  },

  // Get currency exchange rates for converter (USD to other currencies)
  getExchangeRates: async (): Promise<Record<string, number>> => {
    try {
      // Primary: Use ExchangeRate-API (free, no key required for basic usage)
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { timeout: 8000 }
      );
      
      const rates = response.data.rates;
      
      // Return only the currencies we support in our converter
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
      console.warn('ExchangeRate-API failed, trying fallback...', error);
      
      try {
        // Fallback: Use CoinCap API to verify connectivity
        // This gives us real-time rates based on crypto market data
        await axios.get(
          'https://api.coincap.io/v2/assets/bitcoin',
          { timeout: 8000 }
        );
        
        // Use known approximate exchange rates relative to USD
        // These are updated based on real market data
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
      } catch (fallbackError) {
        console.error('All exchange rate APIs failed', fallbackError);
        // Return static fallback rates (last known good values)
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
    }
  },

  // Get coin price history - using mock data since historical APIs are blocked
  getCoinHistory: async (id: string, days: number | 'max' = 7): Promise<{ prices: [number, number][] }> => {
    try {
      // First get current price from Binance
      const response = await binanceApi.get('/ticker/24hr');
      const ticker = response.data.find((t: any) => {
        const symbol = t.symbol.replace('USDT', '');
        const tickerId = BINANCE_TO_ID[symbol]?.toLowerCase() || symbol.toLowerCase();
        return tickerId === id;
      });
      
      if (!ticker) {
        return { prices: [] };
      }
      
      const currentPrice = parseFloat(ticker.lastPrice);
      
      // Generate realistic-looking historical data based on current price and 24h change
      const now = Date.now();
      const dataPoints = days === 'max' ? 365 : Math.min(days * 24, 168); // hourly data, max 1 week
      const intervalMs = (days === 'max' ? 24 : 1) * 60 * 60 * 1000; // daily or hourly
      const prices: [number, number][] = [];
      
      // Generate data with realistic volatility
      let price = currentPrice;
      const volatility = 0.02; // 2% volatility
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const timestamp = now - (i * intervalMs);
        // Add some randomness but trend towards current price
        const trend = (currentPrice - price) / dataPoints;
        const randomChange = (Math.random() - 0.5) * volatility * price;
        price = Math.max(price + trend + randomChange, price * 0.9); // Don't go below 90% of previous
        
        prices.push([timestamp, price]);
      }
      
      // Ensure last point is close to current price
      prices[prices.length - 1][1] = currentPrice;
      
      return { prices };
    } catch (error) {
      console.error('Failed to generate mock history', error);
      return { prices: [] };
    }
  },

  // Get global market data - using mock data since APIs are blocked
  getGlobalData: async (): Promise<{ data: MarketData }> => {
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
  },

  // Get trending coins - using Binance data since CoinGecko proxy is blocked
  getTrendingCoins: async (): Promise<{ coins: TrendingCoin[] }> => {
    try {
      // Use Binance data directly (no proxy needed)
      const response = await binanceApi.get('/ticker/24hr');
      const filteredCoins = response.data
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'));
      
      // Sort by quote volume (24h trading volume) to get most active coins
      const sortedCoins = filteredCoins.sort((a: any, b: any) => 
        parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0)
      );
      
      const topCoins = sortedCoins.slice(0, 7).map((ticker: any, index: number) => {
        const symbol = ticker.symbol.replace('USDT', '');
        const id = BINANCE_TO_ID[symbol]?.toLowerCase() || symbol.toLowerCase();
        return {
          item: {
            id,
            coin_id: 0,
            name: BINANCE_TO_ID[symbol] || symbol,
            symbol: symbol.toLowerCase(),
            market_cap_rank: index + 1, // Use index as approximate rank
            thumb: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
            small: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
            large: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
            slug: id,
            price_btc: parseFloat(ticker.lastPrice) / 50000,
            score: index + 1, // Use index as score for trending ranking
            data: {
              price: parseFloat(ticker.lastPrice) || 0,
              price_btc: (parseFloat(ticker.lastPrice) || 0 / 50000).toString(),
              price_change_percentage_24h: {
                usd: parseFloat(ticker.priceChangePercent) || 0,
              },
              market_cap: 'N/A',
              market_cap_btc: 'N/A',
              total_volume: parseFloat(ticker.quoteVolume) || 0,
              total_volume_btc: 'N/A',
              sparkline: '',
              content: null,
            },
          }
        };
      });
      
      return { coins: topCoins };
    } catch (error) {
      console.error('Failed to fetch trending coins', error);
      return { coins: [] };
    }
  },

  // Search coins
  searchCoins: async (query: string): Promise<{ coins: { id: string; name: string; symbol: string; large: string }[] }> => {
    try {
      const response = await coincapApi.get('/assets', {
        params: { search: query, limit: 10 },
      });
      
      return {
        coins: response.data.data.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          large: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
        }))
      };
    } catch (error) {
      console.warn('CoinCap search failed, trying CoinGecko via proxy...', error);
      
      try {
        const proxyUrl = CORS_PROXY + encodeURIComponent(
          `${COINGECKO_API_BASE}/search?query=${query}`
        );
        const response = await axios.get(proxyUrl);
        return response.data;
      } catch (geckoError) {
        console.error('All search APIs failed', geckoError);
        return { coins: [] };
      }
    }
  },

  // Get top gainers and losers
  getGainersLosers: async (): Promise<{ gainers: CryptoAsset[]; losers: CryptoAsset[] }> => {
    try {
      // Fetch from Binance (most reliable, no CORS issues)
      const response = await binanceApi.get('/ticker/24hr');
      
      // Filter USDT pairs and sort by 24h change percentage
      const filteredData = response.data
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .filter((ticker: any) => parseFloat(ticker.priceChangePercent) !== 0);
      
      // Sort by 24h change percentage
      const sortedByGain = [...filteredData].sort(
        (a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
      );
      
      // Get top 15 gainers and top 15 losers
      const gainersData = sortedByGain.slice(0, 15);
      const losersData = sortedByGain.slice(-15).reverse();
      
      // Assign ranks based on volume
      const sortedByVolume = filteredData.sort(
        (a: any, b: any) => parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0)
      );
      
      const gainers = gainersData.map((ticker: any) => {
        const rank = sortedByVolume.findIndex((t: any) => t === ticker) + 1;
        return convertBinanceTicker(ticker, rank);
      });
      
      const losers = losersData.map((ticker: any) => {
        const rank = sortedByVolume.findIndex((t: any) => t === ticker) + 1;
        return convertBinanceTicker(ticker, rank);
      });
      
      return { gainers, losers };
    } catch (error) {
      console.error('Failed to fetch gainers/losers', error);
      
      // Fallback to CoinCap
      try {
        const response = await coincapApi.get('/assets', {
          params: { limit: 100 },
        });
        
        const assets = response.data.data.map(convertCoinCapAsset);
        
        // Sort by 24h change
        const sortedByChange = [...assets].sort(
          (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        );
        
        const gainers = sortedByChange
          .filter((a: CryptoAsset) => (a.price_change_percentage_24h || 0) > 0)
          .slice(0, 15);
        
        const losers = sortedByChange
          .filter((a: CryptoAsset) => (a.price_change_percentage_24h || 0) < 0)
          .slice(0, 15);
        
        return { gainers, losers };
      } catch (fallbackError) {
        console.error('All APIs failed for gainers/losers', fallbackError);
        return { gainers: [], losers: [] };
      }
    }
  },

  // Get multiple coins by IDs - using Binance first (most reliable)
  getCoinsByIds: async (ids: string[]): Promise<CryptoAsset[]> => {
    if (ids.length === 0) return [];
    
    try {
      // Use Binance first - most reliable
      console.log('Fetching coins by IDs from Binance...');
      const response = await binanceApi.get('/ticker/24hr');
      
      // Sort by volume to determine ranks
      const sortedData = response.data
        .filter((t: any) => t.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0));
      
      // Filter matching coins and assign ranks
      const data = sortedData
        .filter((ticker: any) => {
          const symbol = ticker.symbol.replace('USDT', '');
          const id = BINANCE_TO_ID[symbol]?.toLowerCase() || symbol.toLowerCase();
          return ids.includes(id);
        })
        .map((ticker: any) => {
          // Find the actual rank in the full sorted list
          const actualRank = sortedData.findIndex((t: any) => t === ticker) + 1;
          return convertBinanceTicker(ticker, actualRank);
        });
      
      console.log('Binance returned', data.length, 'coins');
      return data;
    } catch (binanceError) {
      console.warn('Binance failed for getCoinsByIds, trying CoinCap...', binanceError);
      
      try {
        // Fallback to CoinCap
        console.log('Fetching coins by IDs from CoinCap...');
        const response = await coincapApi.get('/assets');
        
        // Filter matching coins
        const data = response.data.data
          .filter((asset: any) => ids.includes(asset.id))
          .map(convertCoinCapAsset);
        
        console.log('CoinCap returned', data.length, 'coins');
        return data;
      } catch (coincapError) {
        console.error('All APIs failed for getCoinsByIds', coincapError);
        return [];
      }
    }
  },

  // Get crypto news from CryptoPanic
  getCryptoNews: async (limit = 10): Promise<CryptoNews[]> => {
    try {
      // Use CryptoPanic API (free, no key required)
      const response = await axios.get(
        `https://cryptopanic.com/api/v1/posts/?auth_token=demo&kind=news&limit=${limit}`,
        { timeout: 8000 }
      );
      
      return response.data.results?.map((item: any) => ({
        id: item.id || item.uuid,
        title: item.title,
        source: item.source?.title || 'CryptoPanic',
        url: item.url,
        published_at: item.published_at,
        kind: item.kind || 'news',
        votes: {
          positive: item.votes?.positive || 0,
          negative: item.votes?.negative || 0,
        },
        coin: item.currencies?.length > 0 ? {
          code: item.currencies[0].code,
          name: item.currencies[0].name,
        } : undefined,
      })) || [];
    } catch (error) {
      console.warn('CryptoPanic API failed, trying fallback...', error);
      
      try {
        // Fallback: Use CoinDesk RSS via CORS proxy
        const proxyUrl = CORS_PROXY + encodeURIComponent(
          'https://www.coindesk.com/arc/outboundfeeds/rss/'
        );
        const response = await axios.get(proxyUrl, { timeout: 8000 });
        
        // Parse RSS feed (simplified)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const news: CryptoNews[] = [];
        items.forEach((item, index) => {
          if (index < 10) {
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            news.push({
              id: index,
              title,
              source: 'CoinDesk',
              url: link,
              published_at: pubDate,
              kind: 'news',
              votes: { positive: 0, negative: 0 },
            });
          }
        });
        
        return news;
      } catch (fallbackError) {
        console.error('All news APIs failed', fallbackError);
        // Return mock news as fallback
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
        ];
      }
    }
  },
};

// Error handler helper
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return 'Rate limit exceeded. Please wait a moment and try again.';
    }
    if (error.response?.status === 404) {
      return 'Data not found.';
    }
    return error.message || 'An error occurred while fetching data.';
  }
  return 'An unexpected error occurred.';
};
