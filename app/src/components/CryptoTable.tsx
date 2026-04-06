import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CryptoAsset } from '@/types/crypto';
import { formatPrice, formatPercentage, formatCompactNumber } from '@/lib/utils';
import { useLivePrice } from '@/hooks/useLivePrices';
import { useState, useEffect, useMemo } from 'react';
import { MiniChart } from '@/components/MiniChart';
import { CoinImage } from '@/components/CoinImage';

interface CryptoTableProps {
  cryptos: CryptoAsset[];
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function CryptoTable({ 
  cryptos, 
  isInWatchlist, 
  onToggleWatchlist,
  onLoadMore,
  hasMore = false
}: CryptoTableProps) {
  const animationClass = 'animate-fade-in-up';

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl bg-surface-container/60 border border-white/[0.04]">
        <table className="w-full">
          <thead className="animate-fade-in-down">
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                # Rank
              </th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Name
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Price
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                24h Change
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium hidden md:table-cell">
                Market Cap
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium hidden lg:table-cell">
                24h Volume
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium hidden lg:table-cell">
                All-Time High
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium hidden xl:table-cell">
                Circulating Supply
              </th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Watchlist
              </th>
              <th className="text-center py-3 px-4 text-xs text-muted-foreground uppercase tracking-wide font-medium hidden md:table-cell">
                7D Chart
              </th>
            </tr>
          </thead>
          <tbody className={animationClass} key={cryptos.length}>
            {cryptos.map((crypto, index) => (
              <CryptoTableRow
                key={crypto.id}
                crypto={crypto}
                isInWatchlist={isInWatchlist(crypto.id)}
                onToggleWatchlist={onToggleWatchlist}
                delay={index < 10 ? index + 1 : 10}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center py-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            className="gap-2 border-white/10 hover:bg-white/5 hover:border-stitch-green/30 group"
          >
            <span className="text-sm">Load More</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Mini 7-day chart component for table
function SevenDayChart({ crypto }: { crypto: CryptoAsset }) {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  
  // Generate more realistic 7-day chart data with more price movement
  const chartData = useMemo(() => {
    const data: number[] = [];
    const basePrice = crypto.current_price;
    const dailyVolatility = 0.05 + Math.random() * 0.05; // 5-10% daily volatility for more activity
    const overallTrend = (crypto.price_change_percentage_24h || 0) / 100;
    
    // Start with a price that creates visible movement
    let price = basePrice * (1 - overallTrend * 0.3);
    
    // Generate 7 data points with realistic crypto volatility
    for (let i = 0; i < 7; i++) {
      // Add more dramatic swings
      const randomFactor = (Math.random() - 0.5) * dailyVolatility * 2;
      const trendComponent = (overallTrend / 7) * (i + 1);
      
      // Occasionally add a "spike" or "dip" for more visual interest
      const spike = Math.random() > 0.7 ? (Math.random() - 0.5) * dailyVolatility * 3 : 0;
      
      price = price * (1 + randomFactor + trendComponent + spike);
      
      // Keep price within reasonable bounds (not more than 20% from base)
      price = Math.max(price, basePrice * 0.8);
      price = Math.min(price, basePrice * 1.2);
      
      data.push(price);
    }
    
    // Ensure last point matches current price
    data[6] = basePrice;
    
    return data;
  }, [crypto.current_price, crypto.price_change_percentage_24h]);

  return (
    <div className="w-28 h-12 mx-auto">
      <MiniChart 
        data={chartData} 
        isPositive={isPositive} 
        showGradient={true}
        height={48}
      />
    </div>
  );
}

function CryptoTableRow({ crypto, isInWatchlist, onToggleWatchlist, delay = 1 }: { 
  crypto: CryptoAsset; 
  isInWatchlist: boolean;
  onToggleWatchlist: (id: string) => void;
  delay?: number;
}) {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const { price: livePrice, isConnected, priceChange } = useLivePrice(crypto.id);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  
  const displayPrice = (isConnected && livePrice > 0) ? livePrice : crypto.current_price;
  
  useEffect(() => {
    if (!isConnected || livePrice === 0) return;
    if (Math.abs(priceChange || 0) > 0.001) {
      setFlash(priceChange > 0 ? 'up' : 'down');
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [livePrice, priceChange, isConnected]);
  
  const flashClass = flash === 'up' 
    ? 'text-stitch-green animate-pulse' 
    : flash === 'down' 
    ? 'text-red-400 animate-pulse' 
    : '';

  return (
    <tr className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200 table-row-hover animate-fade-in-up stagger-${delay}`}>
      <td className="py-4 px-4">
        <span className="text-sm text-muted-foreground">
          {crypto.market_cap_rank ? `#${crypto.market_cap_rank}` : '-'}
        </span>
      </td>
      <td className="py-4 px-4">
        <Link to={`/coin/${crypto.id}`} className="flex items-center gap-3 group">
          <CoinImage 
            src={crypto.image} 
            alt={crypto.name}
            symbol={crypto.symbol}
            className="w-8 h-8 rounded-lg"
            size={32}
          />
          <div>
            <span className="font-medium text-white group-hover:text-stitch-green transition-colors">
              {crypto.name}
            </span>
            <span className="text-xs text-muted-foreground uppercase ml-2">
              {crypto.symbol}
            </span>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={`font-medium text-white transition-colors duration-300 ${flashClass}`}>
          {formatPrice(displayPrice)}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-stitch-green' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="font-medium text-sm">
            {formatPercentage(Math.abs(crypto.price_change_percentage_24h))}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-right hidden md:table-cell">
        <span className="text-sm text-white">
          {crypto.market_cap ? formatCompactNumber(crypto.market_cap) : '-'}
        </span>
      </td>
      <td className="py-4 px-4 text-right hidden lg:table-cell">
        <span className="text-sm text-white">
          {crypto.total_volume ? formatCompactNumber(crypto.total_volume) : '-'}
        </span>
      </td>
      <td className="py-4 px-4 text-right hidden xl:table-cell">
        <span className="text-sm text-white">
          {crypto.ath ? formatPrice(crypto.ath) : '-'}
        </span>
      </td>
      <td className="py-4 px-4 text-right hidden xl:table-cell">
        <span className="text-sm text-white">
          {crypto.circulating_supply 
            ? `${formatCompactNumber(crypto.circulating_supply)} ${crypto.symbol.toUpperCase()}`
            : '-'
          }
        </span>
      </td>
      <td className="py-4 px-4 text-right">
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
      </td>
      <td className="py-2 px-4 text-center hidden md:table-cell">
        <SevenDayChart crypto={crypto} />
      </td>
    </tr>
  );
}