import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CryptoAsset } from '@/types/crypto';
import { formatPrice, formatPercentage, formatCompactNumber } from '@/lib/utils';
import { MiniChart } from './MiniChart';
import { useLivePrice } from '@/hooks/useLivePrices';
import { CoinImage } from './CoinImage';

interface CryptoCardProps {
  crypto: CryptoAsset;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (id: string) => void;
  variant?: 'default' | 'compact' | 'featured';
  enableLivePrice?: boolean;
}

export function CryptoCard({ 
  crypto, 
  isInWatchlist = false, 
  onToggleWatchlist,
  variant = 'default',
  enableLivePrice = true
}: CryptoCardProps) {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const sparklineData = crypto.sparkline_in_7d?.price || [];
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  
  // Live price updates
  const { price: livePrice, priceChange, isConnected } = useLivePrice(enableLivePrice ? crypto.id : null);
  
  // Use live price if available, otherwise use the static price
  const displayPrice = (isConnected && livePrice > 0) ? livePrice : crypto.current_price;
  
  // Flash effect when price changes
  useEffect(() => {
    if (!isConnected || livePrice === 0) return;
    
    if (priceChange > 0.001) {
      setPriceFlash('up');
      const timer = setTimeout(() => setPriceFlash(null), 500);
      return () => clearTimeout(timer);
    } else if (priceChange < -0.001) {
      setPriceFlash('down');
      const timer = setTimeout(() => setPriceFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [livePrice, priceChange, isConnected]);

  // Flash animation classes
  const flashClass = priceFlash === 'up' 
    ? 'animate-pulse text-stitch-green' 
    : priceFlash === 'down' 
    ? 'animate-pulse text-red-400' 
    : '';

  if (variant === 'featured') {
    return (
      <Link 
        to={`/coin/${crypto.id}`}
        className="group relative block p-6 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-low border border-white/[0.06] hover:border-stitch-green/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-ambient overflow-hidden hover-lift"
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-stitch-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-stitch-green/10 transition-colors duration-500" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CoinImage 
                src={crypto.image} 
                alt={crypto.name}
                symbol={crypto.symbol}
                className="w-12 h-12 rounded-xl"
                size={48}
              />
              <div>
                <h3 className="font-display font-semibold text-lg text-white group-hover:text-stitch-green transition-colors">
                  {crypto.name}
                </h3>
                <span className="text-sm text-muted-foreground uppercase tracking-wide">
                  {crypto.symbol}
                </span>
              </div>
            </div>
            {onToggleWatchlist && (
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-lg ${isInWatchlist ? 'text-stitch-green' : 'text-muted-foreground hover:text-white'}`}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleWatchlist(crypto.id);
                }}
              >
                <Star className={`w-5 h-5 ${isInWatchlist ? 'fill-stitch-green' : ''}`} />
              </Button>
            )}
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className={`font-display text-3xl font-bold transition-colors duration-300 ${flashClass}`}>
                {formatPrice(displayPrice)}
              </span>
              {isConnected && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-stitch-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-stitch-green"></span>
                </span>
              )}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isPositive 
                  ? 'bg-stitch-green/20 text-stitch-green' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercentage(crypto.price_change_percentage_24h)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Vol 24h: {formatCompactNumber(crypto.total_volume)}
            </p>
          </div>

          {/* Chart */}
          <div className="h-16">
            <MiniChart 
              data={sparklineData} 
              isPositive={isPositive}
              showGradient
            />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link 
        to={`/coin/${crypto.id}`}
        className="group flex items-center justify-between p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-transparent hover:border-white/[0.06] transition-all duration-300 hover-lift"
      >
        <div className="flex items-center gap-3">
          <CoinImage 
            src={crypto.image} 
            alt={crypto.name}
            symbol={crypto.symbol}
            className="w-10 h-10 rounded-lg"
            size={40}
          />
          <div>
            <h4 className="font-medium text-white group-hover:text-stitch-green transition-colors">
              {crypto.name}
            </h4>
            <span className="text-xs text-muted-foreground uppercase">
              {crypto.symbol}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`font-display font-semibold transition-colors duration-300 ${flashClass}`}>
              {formatPrice(displayPrice)}
            </p>
            <p className={`text-xs font-medium ${isPositive ? 'text-stitch-green' : 'text-red-400'}`}>
              {formatPercentage(crypto.price_change_percentage_24h)}
            </p>
          </div>
          {onToggleWatchlist && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${isInWatchlist ? 'text-stitch-green' : 'text-muted-foreground hover:text-white'}`}
              onClick={(e) => {
                e.preventDefault();
                onToggleWatchlist(crypto.id);
              }}
            >
              <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-stitch-green' : ''}`} />
            </Button>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link 
      to={`/coin/${crypto.id}`}
      className="group block p-5 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-transparent hover:border-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover-lift animate-fade-in-up"
    >
      <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <CoinImage 
          src={crypto.image} 
          alt={crypto.name}
          symbol={crypto.symbol}
          className="w-10 h-10 rounded-lg"
          size={40}
        />
          <div>
            <h4 className="font-medium text-white group-hover:text-stitch-green transition-colors">
              {crypto.name}
            </h4>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {crypto.symbol}
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-stitch-green/20 text-stitch-green' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPercentage(crypto.price_change_percentage_24h)}
        </div>
      </div>

      <div className="mb-3">
        <p className={`font-display text-2xl font-bold transition-colors duration-300 ${flashClass}`}>
          {formatPrice(displayPrice)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          MCap: {formatCompactNumber(crypto.market_cap)}
        </p>
      </div>

      <div className="h-12">
        <MiniChart 
          data={sparklineData.slice(-24)} 
          isPositive={isPositive}
        />
      </div>
    </Link>
  );
}
