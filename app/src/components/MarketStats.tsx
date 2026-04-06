import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Layers } from 'lucide-react';
import type { MarketData } from '@/types/crypto';
import { formatCompactNumber, formatPercentage } from '@/lib/utils';

interface MarketStatsProps {
  data: MarketData | null;
}

export function MarketStats({ data }: MarketStatsProps) {
  if (!data) return null;

  const marketCapChange = data.market_cap_change_percentage_24h_usd;

  const stats = [
    {
      label: 'Total Market Cap',
      value: formatCompactNumber(data.total_market_cap?.usd || 0),
      change: marketCapChange,
      icon: DollarSign,
    },
    {
      label: '24h Volume',
      value: formatCompactNumber(data.total_volume?.usd || 0),
      change: null,
      icon: BarChart3,
    },
    {
      label: 'Active Cryptos',
      value: data.active_cryptocurrencies.toLocaleString(),
      change: null,
      icon: Layers,
    },
    {
      label: 'Markets',
      value: data.markets.toLocaleString(),
      change: null,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const statIsPositive = stat.change !== null ? stat.change >= 0 : true;
        
        return (
          <div 
            key={index}
            className="relative p-4 sm:p-5 rounded-xl bg-surface-container/60 border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group"
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-xl bg-stitch-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stitch-green" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {stat.value}
                </span>
                {stat.change !== null && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${
                    statIsPositive ? 'text-stitch-green' : 'text-red-400'
                  }`}>
                    {statIsPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatPercentage(stat.change)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
