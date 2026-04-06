import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Layers,
  Activity,
  Clock,
  Wifi,
  ArrowRightLeft,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCoinDetail, useCoinHistory, useWatchlist, useExchangeRates } from '@/hooks/useCrypto';
import { PriceChart } from '@/components/PriceChart';
import { CoinDetailSkeleton } from '@/components/LoadingSkeleton';
import { formatPrice, formatCompactNumber, formatPercentage, formatDate } from '@/lib/utils';
import { useLivePrice } from '@/hooks/useLivePrices';
import { AIAnalysis } from '@/components/AIAnalysis';
import { CoinImage } from '@/components/CoinImage';

// Supported currencies for converter
const CURRENCIES = [
  { value: 'usd', label: 'USD', symbol: '$' },
  { value: 'eur', label: 'EUR', symbol: '€' },
  { value: 'gbp', label: 'GBP', symbol: '£' },
  { value: 'jpy', label: 'JPY', symbol: '¥' },
  { value: 'cad', label: 'CAD', symbol: 'C$' },
  { value: 'aud', label: 'AUD', symbol: 'A$' },
  { value: 'chf', label: 'CHF', symbol: 'Fr' },
  { value: 'cny', label: 'CNY', symbol: '¥' },
  { value: 'inr', label: 'INR', symbol: '₹' },
  { value: 'krw', label: 'KRW', symbol: '₩' },
  { value: 'ngn', label: 'NGN', symbol: '₦' },
  { value: 'zar', label: 'ZAR', symbol: 'R' },
  { value: 'brl', label: 'BRL', symbol: 'R$' },
  { value: 'rub', label: 'RUB', symbol: '₽' },
];

// Quick amount presets for the converter
const PRESET_AMOUNTS = [1, 10, 100, 1000];

export function CoinDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: coin, loading: coinLoading, error: coinError, refetch: refetchCoin } = useCoinDetail(id);
  const { data: historyData } = useCoinHistory(id, 'max');
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { rates: exchangeRates } = useExchangeRates();
  
  // Converter state
  const [showConverter, setShowConverter] = useState(false);
  const [convertAmount, setConvertAmount] = useState<number>(1);
  const [convertTo, setConvertTo] = useState('usd');
  const [copied, setCopied] = useState(false);
  
  // Calculate conversion
  const coinPriceUSD = coin?.current_price || 0;
  const targetRate = exchangeRates[convertTo] || 1;
  const convertedValue = convertAmount * coinPriceUSD * targetRate;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(convertedValue.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Live price updates
  const { price: livePrice, isConnected, priceChange } = useLivePrice(id || null);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  
  // Flash effect when price changes significantly
  useEffect(() => {
    if (!isConnected || livePrice === 0) return;
    
    if (priceChange > 0.01) {
      setPriceFlash('up');
      const timer = setTimeout(() => setPriceFlash(null), 1000);
      return () => clearTimeout(timer);
    } else if (priceChange < -0.01) {
      setPriceFlash('down');
      const timer = setTimeout(() => setPriceFlash(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [livePrice, priceChange, isConnected]);
  
  // Use live price if available
  const displayPrice = (isConnected && livePrice > 0) ? livePrice : coin?.current_price || 0;
  const flashClass = priceFlash === 'up' 
    ? 'text-stitch-green animate-pulse' 
    : priceFlash === 'down' 
    ? 'text-red-400 animate-pulse' 
    : '';

  if (coinLoading && !coin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <CoinDetailSkeleton />
        </div>
      </div>
    );
  }

  // Show error with retry option
  if (coinError && !coin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{coinError}</p>
            <div className="flex items-center justify-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => refetchCoin()}
                className="border-white/10 hover:bg-white/5 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Link to="/">
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - if coin is still null (shouldn't happen after error check)
  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <CoinDetailSkeleton />
        </div>
      </div>
    );
  }

  const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
  const inWatchlist = isInWatchlist(coin.id);

  const stats = [
    {
      label: 'Market Cap',
      value: formatCompactNumber(coin.market_cap),
      icon: DollarSign,
    },
    {
      label: '24h Volume',
      value: formatCompactNumber(coin.total_volume),
      icon: BarChart3,
    },
    {
      label: 'Circulating Supply',
      value: `${formatCompactNumber(coin.circulating_supply)} ${coin.symbol.toUpperCase()}`,
      icon: Layers,
    },
    {
      label: 'Rank',
      value: `#${coin.market_cap_rank}`,
      icon: Activity,
    },
  ];

  const additionalStats = [
    {
      label: 'All-Time High',
      value: formatPrice(coin.ath),
      date: `on ${formatDate(coin.ath_date)}`,
      change: coin.ath_change_percentage,
    },
    {
      label: 'All-Time Low',
      value: formatPrice(coin.atl),
      date: `on ${formatDate(coin.atl_date)}`,
      change: coin.atl_change_percentage,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Navigation */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Markets</span>
        </Link>

        {/* Coin Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <CoinImage 
              src={coin.image} 
              alt={coin.name}
              symbol={coin.symbol}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl"
              size={80}
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {coin.name}
                </h1>
                <span className="px-2 py-1 rounded-lg bg-surface-container-high text-muted-foreground text-sm font-medium uppercase">
                  {coin.symbol}
                </span>
                {coin.market_cap_rank && (
                  <span className="px-2 py-1 rounded-lg bg-stitch-green/20 text-stitch-green text-xs font-medium">
                    Rank #{coin.market_cap_rank}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <a 
                  href={`https://www.coingecko.com/en/coins/${coin.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-stitch-green transition-colors flex items-center gap-1"
                >
                  View on CoinGecko
                  <ExternalLink className="w-3 h-3" />
                </a>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-stitch-green">
                    <Wifi className="w-3 h-3" />
                    Live
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleWatchlist(coin.id)}
            className={`
              gap-2 border-white/10 hover:bg-white/5 self-start
              ${inWatchlist ? 'text-stitch-green border-stitch-green/30' : 'text-muted-foreground'}
            `}
          >
            <Star className={`w-4 h-4 ${inWatchlist ? 'fill-stitch-green' : ''}`} />
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </Button>
        </div>

        {/* Price Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
            <span className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold transition-colors duration-300 ${flashClass}`}>
              {formatPrice(displayPrice)}
            </span>
            {isConnected && Math.abs(priceChange || 0) > 0 && (
              <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-stitch-green' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange || 0)}
              </span>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isPositive 
                ? 'bg-stitch-green/20 text-stitch-green' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{formatPercentage(coin.price_change_percentage_24h || 0)}</span>
              <span className="text-sm opacity-70">(24h)</span>
            </div>
          </div>
          
          {/* Price Range */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Low:</span>
              <span className="text-white font-medium">{formatPrice(coin.low_24h)}</span>
            </div>
            <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-stitch-green rounded-full"
                style={{ 
                  width: `${((coin.current_price - coin.low_24h) / (coin.high_24h - coin.low_24h)) * 100}%` 
                }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>High:</span>
              <span className="text-white font-medium">{formatPrice(coin.high_24h)}</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-surface-container/60 border border-white/[0.04]">
          <PriceChart 
            data={historyData} 
            isPositive={isPositive}
            loading={coinLoading}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="p-4 sm:p-5 rounded-xl bg-surface-container/60 border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-stitch-green" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
                <p className="font-display text-lg sm:text-xl font-bold text-white">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* AI Analysis Section */}
        <div className="mb-8">
          <AIAnalysis coin={coin} />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additionalStats.map((stat, index) => (
            <div 
              key={index}
              className="p-4 sm:p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p className="font-display text-xl sm:text-2xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.date}</p>
                <p className={`text-xs font-medium ${
                  (stat.change || 0) >= 0 ? 'text-stitch-green' : 'text-red-400'
                }`}>
                  {formatPercentage(stat.change || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Last updated: {formatDate(coin.last_updated)}</span>
        </div>
      </div>

      {/* Converter FAB Button (side) */}
      {!showConverter && (
        <button
          onClick={() => setShowConverter(true)}
          className="fixed right-4 bottom-32 z-50 animate-bounce-slow"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-stitch-green/20 border-2 border-stitch-green/50 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-stitch-green/20 hover:scale-110 transition-transform duration-300">
              <ArrowRightLeft className="w-6 h-6 text-stitch-green" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-stitch-green rounded-full animate-ping" />
          </div>
        </button>
      )}

      {/* Converter Panel - Compact */}
      {showConverter && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowConverter(false)}
          />
          
          {/* Panel - Smaller, centered */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm animate-slide-up">
            <div className="rounded-2xl bg-surface-container/98 backdrop-blur-xl border border-white/[0.12] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stitch-green/20 flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4 text-stitch-green" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {coin.name} Converter
                  </span>
                </div>
                <button
                  onClick={() => setShowConverter(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content - Compact */}
              <div className="p-3 space-y-3">
                {/* Amount Input */}
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Amount</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Amount"
                      className="bg-surface-container-low border-white/[0.06] focus:border-stitch-green/50 text-white text-base font-medium h-10"
                    />
                    <span className="px-2 py-1.5 rounded-lg bg-stitch-green/10 text-stitch-green text-xs font-medium whitespace-nowrap">
                      {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Quick presets - inline */}
                <div className="flex gap-1.5">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setConvertAmount(preset)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        convertAmount === preset
                          ? 'bg-stitch-green text-stitch-green-dark shadow-md shadow-stitch-green/30'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      {preset >= 1000 ? `${preset/1000}K` : preset}
                    </button>
                  ))}
                </div>
                
                {/* Currency Selector - 2 rows of 5 */}
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Currency</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {CURRENCIES.slice(0, 10).map((currency) => (
                      <button
                        key={currency.value}
                        onClick={() => setConvertTo(currency.value)}
                        className={`py-1.5 rounded-md text-xs font-medium transition-all ${
                          convertTo === currency.value
                            ? 'bg-stitch-green/20 text-stitch-green border border-stitch-green/30'
                            : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        {currency.symbol}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                    {CURRENCIES.slice(10).map((currency) => (
                      <button
                        key={currency.value}
                        onClick={() => setConvertTo(currency.value)}
                        className={`py-1.5 rounded-md text-xs font-medium transition-all ${
                          convertTo === currency.value
                            ? 'bg-stitch-green/20 text-stitch-green border border-stitch-green/30'
                            : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        {currency.symbol}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Result - Compact */}
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 rounded-lg bg-gradient-to-br from-stitch-green/10 to-stitch-green/5 border border-stitch-green/20">
                      <span className="font-display text-lg font-bold text-stitch-green">
                        {CURRENCIES.find(c => c.value === convertTo)?.symbol}{convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      className="h-10 w-10 shrink-0 border-white/[0.06] hover:bg-white/5"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-stitch-green" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Exchange rate info */}
                <div className="pt-1 border-t border-white/[0.06]">
                  <p className="text-[10px] text-muted-foreground text-center">
                    1 {coin.symbol.toUpperCase()} = <span className="text-white font-medium">{CURRENCIES.find(c => c.value === convertTo)?.symbol}{(coinPriceUSD * targetRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
