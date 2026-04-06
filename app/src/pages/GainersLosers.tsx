import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useGainersLosers } from '@/hooks/useCrypto';
import type { CryptoAsset } from '@/types/crypto';
import { formatPrice, formatCompactNumber, formatPercentage } from '@/lib/utils';
import { CoinImage } from '@/components/CoinImage';
import { LoadingScreen } from '@/components/LoadingScreen';

type TabType = 'gainers' | 'losers';

export function GainersLosers() {
  const [activeTab, setActiveTab] = useState<TabType>('gainers');
  const { data, loading, error, refresh } = useGainersLosers();
  
  const coins = activeTab === 'gainers' ? data.gainers : data.losers;
  
  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    if (index === 1) return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    if (index === 2) return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    return 'text-muted-foreground';
  };

  if (loading && coins.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
              Top Gainers & Losers
            </h1>
            <p className="text-muted-foreground">
              Track the biggest price movers in the last 24 hours
            </p>
          </div>
          
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all disabled:opacity-50 self-start"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'gainers'
                ? 'bg-stitch-green/20 text-stitch-green border border-stitch-green/30'
                : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'losers'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Top Losers
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Coins List */}
        <div className="grid gap-3">
          {coins.length === 0 && !loading ? (
            <div className="text-center py-12 text-muted-foreground">
              No data available at the moment
            </div>
          ) : (
            coins.map((coin: CryptoAsset, index: number) => {
              const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
              
              return (
                <Link
                  key={coin.id}
                  to={`/coin/${coin.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container/60 border border-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getRankColor(index)}`}>
                    {index + 1}
                  </div>
                  
                  {/* Coin Image */}
                  <CoinImage
                    src={coin.image}
                    alt={coin.name}
                    symbol={coin.symbol}
                    className="w-10 h-10"
                    size={40}
                  />
                  
                  {/* Coin Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white group-hover:text-eke-amber transition-colors">
                        {coin.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-white/5 text-muted-foreground">
                        {coin.symbol}
                      </span>
                      {coin.market_cap_rank && (
                        <span className="text-[10px] text-muted-foreground">
                          #{coin.market_cap_rank}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right hidden sm:block">
                    <div className="font-display font-bold text-white">
                      {formatPrice(coin.current_price)}
                    </div>
                  </div>
                  
                  {/* 24h Change */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isPositive 
                      ? 'bg-stitch-green/10 text-stitch-green' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {isPositive ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )}
                    <span className="font-bold text-sm">
                      {formatPercentage(Math.abs(coin.price_change_percentage_24h || 0))}
                    </span>
                  </div>
                  
                  {/* Market Cap - Hidden on mobile */}
                  <div className="text-right hidden md:block min-w-[100px]">
                    <div className="text-sm text-muted-foreground">
                      Market Cap
                    </div>
                    <div className="font-medium text-white">
                      {formatCompactNumber(coin.market_cap)}
                    </div>
                  </div>
                  
                  {/* Volume - Hidden on mobile */}
                  <div className="text-right hidden lg:block min-w-[100px]">
                    <div className="text-sm text-muted-foreground">
                      24h Vol
                    </div>
                    <div className="font-medium text-white">
                      {formatCompactNumber(coin.total_volume)}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-xl bg-surface-container/60 border border-white/[0.04]">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Top Gainer
            </div>
            <div className="font-display font-bold text-stitch-green">
              {data.gainers[0]?.name || 'N/A'}
            </div>
            <div className="text-sm text-stitch-green">
              {data.gainers[0] ? `+${formatPercentage(data.gainers[0].price_change_percentage_24h || 0)}` : ''}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-surface-container/60 border border-white/[0.04]">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Top Loser
            </div>
            <div className="font-display font-bold text-red-400">
              {data.losers[0]?.name || 'N/A'}
            </div>
            <div className="text-sm text-red-400">
              {data.losers[0] ? `${formatPercentage(data.losers[0].price_change_percentage_24h || 0)}` : ''}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-surface-container/60 border border-white/[0.04]">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Avg Gainer
            </div>
            <div className="font-display font-bold text-stitch-green">
              {data.gainers.length > 0 
                ? `+${formatPercentage(data.gainers.reduce((sum: number, c: CryptoAsset) => sum + (c.price_change_percentage_24h || 0), 0) / data.gainers.length)}`
                : 'N/A'
              }
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-surface-container/60 border border-white/[0.04]">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Avg Loser
            </div>
            <div className="font-display font-bold text-red-400">
              {data.losers.length > 0
                ? `${formatPercentage(data.losers.reduce((sum: number, c: CryptoAsset) => sum + (c.price_change_percentage_24h || 0), 0) / data.losers.length)}`
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}