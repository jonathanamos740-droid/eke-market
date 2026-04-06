// Mock data for the video ad - real-looking coin values
export const mockCoins = [
  { name: 'Bitcoin', symbol: 'BTC', price: 67420.50, change: +2.4, marketCap: '1.32T', volume: '28.5B', rank: 1 },
  { name: 'Ethereum', symbol: 'ETH', price: 3510.20, change: +1.8, marketCap: '421B', volume: '15.2B', rank: 2 },
  { name: 'BNB', symbol: 'BNB', price: 412.80, change: -0.6, marketCap: '63B', volume: '1.8B', rank: 3 },
  { name: 'Solana', symbol: 'SOL', price: 178.40, change: +5.2, marketCap: '82B', volume: '4.2B', rank: 4 },
  { name: 'XRP', symbol: 'XRP', price: 0.614, change: +0.9, marketCap: '35B', volume: '1.1B', rank: 5 },
  { name: 'Cardano', symbol: 'ADA', price: 0.452, change: -1.2, marketCap: '16B', volume: '420M', rank: 6 },
  { name: 'Dogecoin', symbol: 'DOGE', price: 0.163, change: +3.1, marketCap: '23B', volume: '2.1B', rank: 7 },
  { name: 'Avalanche', symbol: 'AVAX', price: 38.90, change: +4.7, marketCap: '16B', volume: '680M', rank: 8 },
];

// Bitcoin price history for chart animation (7 days)
export const btcPriceHistory = [
  64200, 64800, 65100, 64500, 65800, 66200, 67420
];

// Global market stats
export const globalStats = {
  totalMarketCap: '2.54T',
  totalVolume: '89.2B',
  btcDominance: 52.3,
  ethDominance: 17.1,
  activeCryptos: 13847,
  markets: 742,
};

// Format price with commas
export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(price < 1 ? 4 : 2);
};

// Format percentage
export const formatPercent = (val: number): string => {
  return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
};