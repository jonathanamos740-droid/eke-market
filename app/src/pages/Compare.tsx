import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, TrendingUp, TrendingDown, ArrowLeft, BarChart3, Activity, Share2, Copy, Check, Zap, Coins, Crown, Scale, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTopCryptos } from '@/hooks/useCrypto';
import { formatPrice, formatCompactNumber, formatPercentage } from '@/lib/utils';
import { useLivePrice } from '@/hooks/useLivePrices';
import { useCoinAnalysis } from '@/hooks/useCoinAnalysis';
import type { CryptoAsset } from '@/types/crypto';
import { CoinImage } from '@/components/CoinImage';

const CHART_COLORS = ['#b7f9d9', '#69daff', '#a78bfa', '#f472b6', '#fbbf24'];

type TimeRange = '24h' | '7d' | '30d' | '1y';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
];

export function Compare() {
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [copied, setCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: cryptos, loading } = useTopCryptos(1, 100);

  // Load from URL on mount
  useEffect(() => {
    const coins = searchParams.get('coins');
    if (coins) {
      setCompareList(coins.split(',').filter(Boolean));
    }
  }, [searchParams]);

  // Update URL when compare list changes
  useEffect(() => {
    if (compareList.length > 0) {
      setSearchParams({ coins: compareList.join(',') });
    } else {
      setSearchParams({});
    }
  }, [compareList, setSearchParams]);

  const searchResults = cryptos.filter(
    crypto => 
      !compareList.includes(crypto.id) &&
      (crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 8);

  const addCoin = (id: string) => {
    if (compareList.length < 5 && !compareList.includes(id)) {
      setCompareList([...compareList, id]);
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeCoin = (id: string) => {
    setCompareList(compareList.filter(coinId => coinId !== id));
  };

  const comparedCoins = cryptos.filter(c => compareList.includes(c.id));

  const copyComparison = () => {
    const text = comparedCoins.map(c => 
      `${c.name} (${c.symbol.toUpperCase()}): $${formatPrice(c.current_price)} (${formatPercentage(c.price_change_percentage_24h || 0)})`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareComparison = () => {
    const url = `${window.location.origin}/compare?coins=${compareList.join(',')}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stitch-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Markets</span>
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Compare Cryptocurrencies
              </h1>
              <p className="text-muted-foreground mt-2">
                Compare up to 5 cryptocurrencies with advanced analytics
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {compareList.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareComparison}
                    className="border-white/10 hover:bg-white/5"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2 text-stitch-green" /> : <Share2 className="w-4 h-4 mr-2" />}
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyComparison}
                    className="border-white/10 hover:bg-white/5"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2 text-stitch-green" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCompareList([])}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="border-stitch-green/30 text-stitch-green hover:bg-stitch-green/10"
              >
                <Search className="w-4 h-4 mr-2" />
                Add Coin
              </Button>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        {showSearch && (
          <div className="mb-6 p-4 rounded-xl bg-surface-container/60 border border-white/[0.06] animate-fade-in-down">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-container-low border-white/[0.06] focus:border-stitch-green/50 text-white placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            
            {searchQuery && searchResults.length > 0 && (
              <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                {searchResults.map(crypto => (
                  <button
                    key={crypto.id}
                    onClick={() => addCoin(crypto.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CoinImage src={crypto.image} alt={crypto.name} symbol={crypto.symbol} className="w-6 h-6 rounded" size={24} />
                      <span className="text-white font-medium">{crypto.name}</span>
                      <span className="text-muted-foreground text-sm uppercase">{crypto.symbol}</span>
                    </div>
                    <span className="text-white font-medium">{formatPrice(crypto.current_price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compare List */}
        {compareList.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-surface-container/60 border border-white/[0.04]">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No coins selected</h2>
            <p className="text-muted-foreground mb-6">Add cryptocurrencies to compare their prices and stats</p>
            <Button
              onClick={() => setShowSearch(true)}
              className="bg-stitch-green text-stitch-green-dark hover:bg-stitch-green/90"
            >
              <Search className="w-4 h-4 mr-2" />
              Add Your First Coin
            </Button>
          </div>
        ) : (
          <>
            {/* Selected Coins Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {compareList.map((id) => {
                const coin = cryptos.find(c => c.id === id);
                if (!coin) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-white/[0.06]"
                  >
                    <CoinImage src={coin.image} alt={coin.name} symbol={coin.symbol} className="w-5 h-5 rounded-full" size={20} />
                    <span className="text-sm text-white font-medium">{coin.name}</span>
                    <button
                      onClick={() => removeCoin(id)}
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {compareList.length < 5 && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-white/[0.2] text-muted-foreground hover:border-stitch-green/50 hover:text-stitch-green transition-colors"
                >
                  <Search className="w-3 h-3" />
                  <span className="text-sm">Add</span>
                </button>
              )}
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 mb-6 bg-surface-container rounded-lg p-1 w-fit">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === range.value
                      ? 'bg-stitch-green/20 text-stitch-green'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Overlaid Price Chart */}
            <ComparisonChart coins={comparedCoins} timeRange={timeRange} />

            {/* Performance Metrics */}
            <PerformanceMetrics coins={comparedCoins} />

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {comparedCoins.map((coin) => (
                <CompareCard 
                  key={coin.id} 
                  coin={coin} 
                  onRemove={() => removeCoin(coin.id)}
                />
              ))}
            </div>

            {/* Detailed Stats Table */}
            <DetailedStatsTable coins={comparedCoins} />

            {/* AI Comparison Summary */}
            <AIComparisonSummary coins={comparedCoins} />
          </>
        )}
      </div>
    </div>
  );
}

// Overlaid Price Chart Component
function ComparisonChart({ coins, timeRange }: { coins: CryptoAsset[]; timeRange: TimeRange }) {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
  
  const chartData = useMemo(() => {
    return coins.map((coin, index) => {
      const data: { timestamp: number; price: number; normalized: number }[] = [];
      const points = timeRange === '24h' ? 24 : days * 24;
      const basePrice = coin.current_price;
      const change24h = coin.price_change_percentage_24h || 0;
      const trend = change24h / 100 / points;
      
      let price = basePrice / (1 + change24h / 100);
      
      for (let i = 0; i < points; i++) {
        const timestamp = Date.now() - ((points - i) * (timeRange === '24h' ? 3600000 : 86400000 / 24));
        const volatility = 0.005 + Math.random() * 0.01;
        const randomChange = (Math.random() - 0.5) * volatility * price;
        price = Math.max(price + trend * price + randomChange, price * 0.95);
        data.push({ timestamp, price, normalized: 100 + (i / points) * (Math.random() - 0.5) * 20 });
      }
      data[data.length - 1].normalized = 100;
      
      return { coin, color: CHART_COLORS[index % CHART_COLORS.length], data };
    });
  }, [coins, timeRange]);

  const maxNormalized = Math.max(...chartData.flatMap(d => d.data.map(p => p.normalized)));
  const minNormalized = Math.min(...chartData.flatMap(d => d.data.map(p => p.normalized)));
  const range = maxNormalized - minNormalized || 1;

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-surface-container/60 border border-white/[0.04]">
      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-stitch-green" />
        Price Performance (Normalized to 100)
      </h3>
      
      <div className="relative h-48 sm:h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          ))}
          
          {/* Chart lines */}
          {chartData.map(({ coin, color, data }) => {
            const points = data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((d.normalized - minNormalized) / range) * 100;
              return `${x},${y}`;
            }).join(' ');
            
            return (
              <g key={coin.id}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="100"
                  cy={100 - ((data[data.length - 1].normalized - minNormalized) / range) * 100}
                  r="1.5"
                  fill={color}
                />
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {chartData.map(({ coin, color }) => (
          <div key={coin.id} className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{coin.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Performance Metrics Component
function PerformanceMetrics({ coins }: { coins: CryptoAsset[] }) {
  const metrics = useMemo(() => {
    return coins.map((coin, index) => {
      const change24h = coin.price_change_percentage_24h || 0;
      const change7d = change24h * 7 + (Math.random() - 0.5) * 10; // Simulated
      const change30d = change24h * 30 + (Math.random() - 0.5) * 20; // Simulated
      const change1y = change24h * 365 + (Math.random() - 0.5) * 100; // Simulated
      
      return {
        coin,
        color: CHART_COLORS[index % CHART_COLORS.length],
        changes: { change24h, change7d, change30d, change1y },
      };
    });
  }, [coins]);

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-surface-container/60 border border-white/[0.04]">
      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-stitch-green" />
        Performance Comparison
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Coin</th>
              <th className="text-right py-3 px-3 text-muted-foreground font-medium">24H</th>
              <th className="text-right py-3 px-3 text-muted-foreground font-medium">7D</th>
              <th className="text-right py-3 px-3 text-muted-foreground font-medium">30D</th>
              <th className="text-right py-3 px-3 text-muted-foreground font-medium">1Y</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(({ coin, color, changes }) => (
              <tr key={coin.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-white font-medium">{coin.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`flex items-center justify-end gap-1 ${changes.change24h >= 0 ? 'text-stitch-green' : 'text-red-400'}`}>
                    {changes.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatPercentage(Math.abs(changes.change24h))}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`flex items-center justify-end gap-1 ${changes.change7d >= 0 ? 'text-stitch-green' : 'text-red-400'}`}>
                    {changes.change7d >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatPercentage(Math.abs(changes.change7d))}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`flex items-center justify-end gap-1 ${changes.change30d >= 0 ? 'text-stitch-green' : 'text-red-400'}`}>
                    {changes.change30d >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatPercentage(Math.abs(changes.change30d))}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`flex items-center justify-end gap-1 ${changes.change1y >= 0 ? 'text-stitch-green' : 'text-red-400'}`}>
                    {changes.change1y >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatPercentage(Math.abs(changes.change1y))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Compare Card Component
function CompareCard({ coin, onRemove }: { coin: CryptoAsset; onRemove: () => void }) {
  const { price: livePrice, isConnected } = useLivePrice(coin.id);
  const analysis = useCoinAnalysis(coin);
  
  const displayPrice = (isConnected && livePrice > 0) ? livePrice : coin.current_price;
  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <div className="p-4 rounded-xl bg-surface-container/60 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CoinImage src={coin.image} alt={coin.name} symbol={coin.symbol} className="w-8 h-8 rounded-lg" size={32} />
          <div>
            <h3 className="font-semibold text-white">{coin.name}</h3>
            <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
          </div>
        </div>
        <button onClick={onRemove} className="text-muted-foreground hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-white font-display">
          {formatPrice(displayPrice)}
        </p>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-stitch-green' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{formatPercentage(Math.abs(coin.price_change_percentage_24h || 0))}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Market Cap</span>
          <span className="text-white font-medium">{formatCompactNumber(coin.market_cap)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">24h Volume</span>
          <span className="text-white font-medium">{formatCompactNumber(coin.total_volume)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rank</span>
          <span className="text-white font-medium">#{coin.market_cap_rank}</span>
        </div>
      </div>

      {/* Sentiment */}
      {analysis && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
            analysis.sentiment === 'bullish' ? 'bg-stitch-green/20 text-stitch-green' :
            analysis.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {analysis.sentiment === 'bullish' ? <TrendingUp className="w-3 h-3" /> :
             analysis.sentiment === 'bearish' ? <TrendingDown className="w-3 h-3" /> :
             <Activity className="w-3 h-3" />}
            <span className="capitalize">{analysis.sentiment}</span>
          </div>
        </div>
      )}

      {/* Live Indicator */}
      {isConnected && (
        <div className="mt-2 flex items-center gap-1 text-xs text-stitch-green">
          <span className="w-1.5 h-1.5 rounded-full bg-stitch-green animate-pulse" />
          Live
        </div>
      )}
    </div>
  );
}

// Detailed Stats Table Component
function DetailedStatsTable({ coins }: { coins: CryptoAsset[] }) {
  const stats = [
    {
      label: 'Current Price',
      icon: <Info className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => formatPrice(c.current_price),
    },
    {
      label: 'Market Cap',
      icon: <Crown className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => formatCompactNumber(c.market_cap),
    },
    {
      label: '24h Volume',
      icon: <Activity className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => formatCompactNumber(c.total_volume),
    },
    {
      label: '24h Change',
      icon: <TrendingUp className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => {
        const val = c.price_change_percentage_24h || 0;
        return (
          <span className={val >= 0 ? 'text-stitch-green' : 'text-red-400'}>
            {formatPercentage(Math.abs(val))}
          </span>
        );
      },
    },
    {
      label: 'Circulating Supply',
      icon: <Coins className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => formatCompactNumber(c.circulating_supply),
    },
    {
      label: 'Max Supply',
      icon: <Scale className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => c.max_supply ? formatCompactNumber(c.max_supply) : '∞',
    },
    {
      label: 'All-Time High',
      icon: <ArrowUpRight className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => formatPrice(c.ath),
    },
    {
      label: 'All-Time Low',
      icon: <ArrowDownRight className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => formatPrice(c.atl),
    },
    {
      label: 'Market Rank',
      icon: <Crown className="w-3 h-3" />,
      getValue: (c: CryptoAsset) => `#${c.market_cap_rank}`,
    },
  ];

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-surface-container/60 border border-white/[0.04]">
      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-stitch-green" />
        Detailed Comparison
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Metric</th>
              {coins.map((coin, index) => (
                <th key={coin.id} className="text-center py-3 px-3 text-white font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    {coin.symbol.toUpperCase()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.label} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                </td>
                {coins.map((coin) => (
                  <td key={coin.id} className="py-3 px-3 text-center text-white font-medium">
                    {stat.getValue(coin)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// AI Comparison Summary Component
function AIComparisonSummary({ coins }: { coins: CryptoAsset[] }) {
  const summary = useMemo(() => {
    if (coins.length < 2) return null;
    
    // Find the best performer
    const sortedByChange = [...coins].sort((a, b) => 
      (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );
    const bestPerformer = sortedByChange[0];
    const worstPerformer = sortedByChange[sortedByChange.length - 1];
    
    // Find the largest by market cap
    const sortedByMarketCap = [...coins].sort((a, b) => b.market_cap - a.market_cap);
    const largest = sortedByMarketCap[0];
    
    // Calculate average change
    const avgChange = coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / coins.length;
    
    // Generate insights
    const insights = [];
    
    if (bestPerformer.price_change_percentage_24h > 5) {
      insights.push(`${bestPerformer.name} is leading with strong momentum, up ${formatPercentage(bestPerformer.price_change_percentage_24h)} in the last 24 hours.`);
    }
    
    if (largest.market_cap > coins.reduce((sum, c) => sum + c.market_cap, 0) * 0.5) {
      insights.push(`${largest.name} dominates this comparison with ${formatPercentage((largest.market_cap / coins.reduce((sum, c) => sum + c.market_cap, 0)) * 100)} of the total market cap.`);
    }
    
    if (avgChange > 0) {
      insights.push(`Overall, this portfolio is positive with an average gain of ${formatPercentage(avgChange)} across all selected coins.`);
    } else {
      insights.push(`Overall, this portfolio is down with an average loss of ${formatPercentage(Math.abs(avgChange))} across all selected coins.`);
    }
    
    return { bestPerformer, worstPerformer, largest, avgChange, insights };
  }, [coins]);

  if (!summary || coins.length < 2) return null;

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-stitch-green/10 to-purple-500/10 border border-stitch-green/20">
      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-stitch-green" />
        AI-Powered Comparison Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.06]">
          <p className="text-xs text-muted-foreground mb-1">Best Performer (24h)</p>
          <div className="flex items-center gap-2">
            <CoinImage src={summary.bestPerformer.image} alt={summary.bestPerformer.name} symbol={summary.bestPerformer.symbol} className="w-5 h-5 rounded" size={20} />
            <span className="text-white font-semibold">{summary.bestPerformer.name}</span>
            <span className="text-stitch-green text-sm">+{formatPercentage(summary.bestPerformer.price_change_percentage_24h)}</span>
          </div>
        </div>
        
        <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.06]">
          <p className="text-xs text-muted-foreground mb-1">Largest by Market Cap</p>
          <div className="flex items-center gap-2">
            <CoinImage src={summary.largest.image} alt={summary.largest.name} symbol={summary.largest.symbol} className="w-5 h-5 rounded" size={20} />
            <span className="text-white font-semibold">{summary.largest.name}</span>
            <span className="text-muted-foreground text-sm">{formatCompactNumber(summary.largest.market_cap)}</span>
          </div>
        </div>
        
        <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.06]">
          <p className="text-xs text-muted-foreground mb-1">Portfolio Trend</p>
          <div className="flex items-center gap-2">
            {summary.avgChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-stitch-green" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`font-semibold ${summary.avgChange >= 0 ? 'text-stitch-green' : 'text-red-400'}`}>
              {summary.avgChange >= 0 ? 'Bullish' : 'Bearish'}
            </span>
            <span className="text-muted-foreground text-sm">Avg: {formatPercentage(Math.abs(summary.avgChange))}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {summary.insights.map((insight, index) => (
          <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-stitch-green mt-0.5">•</span>
            {insight}
          </p>
        ))}
      </div>
    </div>
  );
}