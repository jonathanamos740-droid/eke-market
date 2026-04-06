import { useState } from 'react';
import { RefreshCw, Search, TrendingUp, Table2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTopCryptos, useGlobalData, useTrendingCoins, useWatchlist } from '@/hooks/useCrypto';
import { CryptoCard } from '@/components/CryptoCard';
import { CryptoTable } from '@/components/CryptoTable';
import { MarketStats } from '@/components/MarketStats';
import { FearGreedIndex } from '@/components/FearGreedIndex';
import { TrendingCoinsList } from '@/components/TrendingCoins';
import { CryptoCardSkeleton, MarketStatsSkeleton } from '@/components/LoadingSkeleton';

export function MarketOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { data: cryptos, loading: cryptosLoading, error: cryptosError } = useTopCryptos(page, 20);
  const { data: globalData, loading: globalLoading } = useGlobalData();
  const { data: trendingCoins, loading: trendingLoading } = useTrendingCoins();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topGainers = [...cryptos]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-px h-4 bg-stitch-green" />
                <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                  Market Terminal
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Market Overview
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Real-time data from global exchanges. Prices updated every 60 seconds to ensure maximum precision.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/10 hover:bg-white/5 hover:border-stitch-green/30"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Market Stats */}
          {globalLoading ? (
            <MarketStatsSkeleton />
          ) : (
            <MarketStats data={globalData} />
          )}
        </div>

          {/* Main Content Grid */}
        <div className={`transition-all duration-500 ease-in-out ${viewMode === 'table' ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'}`}>
          {/* Left Column - Crypto List */}
          <div className={`transition-all duration-500 ease-in-out ${viewMode === 'table' ? 'col-span-1' : 'lg:col-span-2'} space-y-6`}>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-container-low border-white/[0.06] focus:border-stitch-green/50 text-white placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`gap-2 ${viewMode === 'grid' ? 'bg-stitch-green/20 text-stitch-green' : 'text-muted-foreground hover:text-white'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`gap-2 ${viewMode === 'table' ? 'bg-stitch-green/20 text-stitch-green' : 'text-muted-foreground hover:text-white'}`}
                >
                  <Table2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
              </div>
            </div>

            {/* Featured Cards - Top Gainers */}
            {!cryptosLoading && !searchQuery && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-stitch-green" />
                  <h2 className="text-sm font-medium text-white">Top Gainers</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topGainers.map((crypto) => (
                    <CryptoCard
                      key={crypto.id}
                      crypto={crypto}
                      variant="compact"
                      isInWatchlist={isInWatchlist(crypto.id)}
                      onToggleWatchlist={toggleWatchlist}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Trending Search - Floating in Table Mode */}
            {viewMode === 'table' && !trendingLoading && (
              <div className="sticky top-0 z-50 mb-6 animate-fade-in-down">
                <div className="rounded-xl bg-surface-container/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-stitch-green" />
                      <span className="text-sm font-medium text-white">Trending Now</span>
                    </div>
                    <div className="flex gap-2">
                      {trendingCoins.slice(0, 3).map((coin) => (
                        <div key={coin.item.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-white">
                          <img src={coin.item.small} alt={coin.item.name} className="w-4 h-4 rounded" />
                          <span>{coin.item.symbol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Cryptos Grid */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-stitch-green" />
                All Cryptocurrencies
              </h2>
              
              {cryptosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <CryptoCardSkeleton key={i} />
                  ))}
                </div>
              ) : cryptosError ? (
                <div className="p-8 rounded-xl bg-surface-container/60 border border-white/[0.04] text-center">
                  <p className="text-red-400 mb-4">{cryptosError}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredCryptos.length === 0 ? (
                <div className="p-8 rounded-xl bg-surface-container/60 border border-white/[0.04] text-center">
                  <p className="text-muted-foreground">No cryptocurrencies found</p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="rounded-xl bg-surface-container/60 border border-white/[0.04] overflow-hidden">
                  <CryptoTable 
                    cryptos={filteredCryptos}
                    isInWatchlist={isInWatchlist}
                    onToggleWatchlist={toggleWatchlist}
                    onLoadMore={() => setPage(p => p + 1)}
                    hasMore={cryptos.length >= 20}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCryptos.map((crypto) => (
                    <CryptoCard
                      key={crypto.id}
                      crypto={crypto}
                      isInWatchlist={isInWatchlist(crypto.id)}
                      onToggleWatchlist={toggleWatchlist}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Load More - Only show in grid mode */}
            {viewMode === 'grid' && !cryptosLoading && !searchQuery && cryptos.length >= 20 && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  className="border-white/10 hover:bg-white/5 hover:border-stitch-green/30"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar - Hidden in Table Mode */}
          <div className={`space-y-6 transition-all duration-500 ease-in-out ${viewMode === 'table' ? 'hidden lg:block opacity-0' : 'opacity-100'}`}>
            {/* Fear & Greed Index */}
            <FearGreedIndex />

            {/* Trending Coins */}
            {!trendingLoading && (
              <TrendingCoinsList coins={trendingCoins} />
            )}

            {/* Market Info Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-stitch-green/10 to-stitch-cyan/5 border border-stitch-green/20">
              <h3 className="text-sm font-medium text-white mb-3">
                Data Sources
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Real-time cryptocurrency data from multiple reliable sources.
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-stitch-green" />
                  <span className="text-white font-medium">Binance API</span>
                  <span className="text-muted-foreground">- Real-time prices & volumes</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-stitch-green" />
                  <span className="text-white font-medium">CoinCap API</span>
                  <span className="text-muted-foreground">- Asset details & history</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-stitch-green" />
                  <span className="text-white font-medium">CoinGecko API</span>
                  <span className="text-muted-foreground">- Global market stats</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-stitch-green">
                <div className="w-2 h-2 rounded-full bg-stitch-green animate-pulse" />
                <span>Live WebSocket connection active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
