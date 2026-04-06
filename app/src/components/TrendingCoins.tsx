import { Link } from 'react-router-dom';
import { TrendingUp, Flame } from 'lucide-react';
import type { TrendingCoin } from '@/types/crypto';
import { formatPrice, formatPercentage } from '@/lib/utils';
import { CoinImage } from './CoinImage';

interface TrendingCoinsProps {
  coins: TrendingCoin[];
}

export function TrendingCoinsList({ coins }: TrendingCoinsProps) {
  if (coins.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-medium text-white">Trending</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No trending data available
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <h3 className="text-sm font-medium text-white">Trending Search</h3>
      </div>

      <div className="space-y-3">
        {coins.slice(0, 5).map((coin, index) => {
          const priceChange = coin.item.data?.price_change_percentage_24h?.usd || 0;
          const isPositive = priceChange >= 0;

          return (
            <Link
              key={coin.item.id}
              to={`/coin/${coin.item.id}`}
              className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <CoinImage 
                  src={coin.item.small} 
                  alt={coin.item.name}
                  symbol={coin.item.symbol}
                  className="w-7 h-7 rounded-lg"
                  size={28}
                />
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-stitch-green transition-colors">
                    {coin.item.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {coin.item.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {coin.item.data?.price ? (
                  <>
                    <p className="text-sm font-medium text-white">
                      {formatPrice(coin.item.data.price)}
                    </p>
                    <div className={`flex items-center justify-end gap-0.5 text-[10px] font-medium ${
                      isPositive ? 'text-stitch-green' : 'text-red-400'
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
                      {formatPercentage(priceChange)}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Rank #{coin.item.market_cap_rank}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
