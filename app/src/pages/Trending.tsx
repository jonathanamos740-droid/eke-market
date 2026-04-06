import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, TrendingUp, TrendingDown, Sparkles, ExternalLink, ThumbsUp, Clock } from 'lucide-react';
import { useTrendingCoins, useCryptoNews } from '@/hooks/useCrypto';
import { Button } from '@/components/ui/button';
import { formatPrice, formatPercentage } from '@/lib/utils';

export function Trending() {
  const { data: trendingCoins, loading, error } = useTrendingCoins();
  const { data: news, loading: newsLoading } = useCryptoNews(6);

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

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-px h-4 bg-orange-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
              Hot Right Now
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Trending Coins
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Discover the most searched cryptocurrencies right now. Based on global search volume and social engagement.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 rounded-xl bg-surface-container/60 border border-white/[0.04] animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                    <div>
                      <div className="h-4 w-24 bg-white/10 rounded mb-1" />
                      <div className="h-3 w-10 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-14 bg-white/10 rounded-full" />
                </div>
                <div className="h-8 w-28 bg-white/10 rounded mb-1" />
                <div className="h-16 w-full bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-white/10 hover:bg-white/5"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Featured */}
            {trendingCoins.length >= 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stitch-green" />
                  <h2 className="text-sm font-medium text-white">Top Trending</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trendingCoins.slice(0, 3).map((coin) => {
                    const priceChange = coin.item.data?.price_change_percentage_24h?.usd || 0;
                    const isPositive = priceChange >= 0;

                    return (
                      <div 
                        key={coin.item.id}
                        className="relative p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group"
                      >
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-400">#{coin.item.score + 1}</span>
                        </div>
                        
                        <Link to={`/coin/${coin.item.id}`} className="block">
                          <div className="flex items-center gap-3 mb-4">
                            <img 
                              src={coin.item.large} 
                              alt={coin.item.name}
                              className="w-12 h-12 rounded-xl"
                            />
                            <div>
                              <h3 className="font-display font-semibold text-lg text-white group-hover:text-orange-400 transition-colors">
                                {coin.item.name}
                              </h3>
                              <span className="text-sm text-muted-foreground uppercase">
                                {coin.item.symbol}
                              </span>
                            </div>
                          </div>

                          {coin.item.data?.price && (
                            <div className="mb-3">
                              <p className="font-display text-2xl font-bold text-white">
                                {formatPrice(coin.item.data.price)}
                              </p>
                              <div className={`flex items-center gap-1 text-sm font-medium ${
                                isPositive ? 'text-stitch-green' : 'text-red-400'
                              }`}>
                                {isPositive ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                {formatPercentage(priceChange)}
                              </div>
                            </div>
                          )}

                          {coin.item.data?.market_cap && (
                            <p className="text-xs text-muted-foreground">
                              Market Cap: {coin.item.data.market_cap}
                            </p>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Trending List */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                All Trending
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingCoins.map((coin) => {
                  const priceChange = coin.item.data?.price_change_percentage_24h?.usd || 0;
                  const isPositive = priceChange >= 0;

                  return (
                    <Link
                      key={coin.item.id}
                      to={`/coin/${coin.item.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-transparent hover:border-white/[0.06] transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={coin.item.small} 
                            alt={coin.item.name}
                            className="w-10 h-10 rounded-lg"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-orange-400">
                              #{coin.item.score + 1}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                            {coin.item.name}
                          </h4>
                          <span className="text-xs text-muted-foreground uppercase">
                            {coin.item.symbol}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {coin.item.data?.price ? (
                          <>
                            <p className="font-display font-semibold text-white">
                              {formatPrice(coin.item.data.price)}
                            </p>
                            <p className={`text-xs font-medium ${
                              isPositive ? 'text-stitch-green' : 'text-red-400'
                            }`}>
                              {formatPercentage(priceChange)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Rank #{coin.item.market_cap_rank}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="p-5 rounded-xl bg-surface-container/40 border border-white/[0.04] border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    About Trending
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Trending coins are ranked based on search volume across global exchanges and social media platforms. 
                    This data updates frequently to reflect the most popular cryptocurrencies right now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Crypto News Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-px h-4 bg-blue-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                Latest Updates
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Powered by CryptoPanic
            </span>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface-container/60 border border-white/[0.04] animate-pulse">
                  <div className="h-4 w-3/4 bg-white/10 rounded mb-3" />
                  <div className="h-3 w-1/2 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {item.coin && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                          {item.coin.code}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                        {item.source}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                  
                  <h3 className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors line-clamp-2 mb-3">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(item.published_at).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                    {item.votes.positive > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-stitch-green">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{item.votes.positive}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
