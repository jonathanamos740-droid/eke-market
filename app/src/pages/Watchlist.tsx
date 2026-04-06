import { Link } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useCrypto';
import { CryptoCard } from '@/components/CryptoCard';
import { WatchlistSkeleton } from '@/components/LoadingSkeleton';

export function Watchlist() {
  const { coins, loading, toggleWatchlist, watchlist } = useWatchlist();

  const isEmpty = watchlist.length === 0;

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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-px h-4 bg-stitch-green" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
              Your Portfolio
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Watchlist
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your favorite cryptocurrencies in real-time.
              </p>
            </div>
            {!isEmpty && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container/60 border border-white/[0.04]">
                <Star className="w-4 h-4 text-stitch-green fill-stitch-green" />
                <span className="text-sm text-white font-medium">{coins.length}</span>
                <span className="text-sm text-muted-foreground">assets tracked</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <WatchlistSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
              <Star className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-white mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Start tracking your favorite cryptocurrencies by adding them to your watchlist. 
              Click the star icon on any coin to add it here.
            </p>
            <Link to="/">
              <Button 
                className="gap-2 bg-stitch-green/20 text-stitch-green hover:bg-stitch-green/30 border border-stitch-green/30"
              >
                <TrendingUp className="w-4 h-4" />
                Browse Markets
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Watchlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coins.map((crypto) => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  variant="featured"
                  isInWatchlist={true}
                  onToggleWatchlist={toggleWatchlist}
                />
              ))}
            </div>

            {/* Info Card */}
            <div className="p-5 rounded-xl bg-surface-container/40 border border-white/[0.04] border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-stitch-green/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-stitch-green" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    Watchlist Tips
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your watchlist is stored locally in your browser. Click the star icon on any coin 
                    to remove it from your watchlist. Prices update automatically every 60 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
