import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface PriceChartProps {
  data: { prices: [number, number][] } | null;
  isPositive: boolean;
  loading?: boolean;
}

type TimeRange = '1' | '7' | '30' | '90' | '365';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '1', label: '1D' },
  { value: '7', label: '7D' },
  { value: '30', label: '30D' },
  { value: '90', label: '90D' },
  { value: '365', label: '1Y' },
];

export function PriceChart({ data, isPositive, loading = false }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7');

  const chartData = useMemo(() => {
    if (!data?.prices || data.prices.length === 0) return [];
    
    // Filter data based on selected range
    const now = Date.now();
    const rangeMs = parseInt(selectedRange) * 24 * 60 * 60 * 1000;
    const cutoff = now - rangeMs;
    
    // Filter to get data within the selected time range
    const filtered = data.prices.filter(([timestamp]) => timestamp >= cutoff);
    
    // If no data in range, use the most recent data points as fallback
    if (filtered.length === 0) {
      // Get the last N data points based on selected range
      const dataPoints = parseInt(selectedRange) * 24; // roughly one point per hour
      const recentData = data.prices.slice(-Math.max(dataPoints, 10));
      return recentData.map(([timestamp, price]) => ({
        date: timestamp,
        price: price,
      }));
    }
    
    return filtered.map(([timestamp, price]) => ({
      date: timestamp,
      price: price,
    }));
  }, [data, selectedRange]);

  const color = isPositive ? '#b7f9d9' : '#f87171';
  const gradientColor = isPositive ? 'rgba(183, 249, 217, 0.2)' : 'rgba(248, 113, 113, 0.2)';

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (selectedRange === '1') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: number }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-high/95 backdrop-blur-glass border border-white/[0.08] rounded-lg p-3 shadow-ambient">
          <p className="text-xs text-muted-foreground mb-1">
            {label && formatDate(label)}
          </p>
          <p className="font-display font-semibold text-white">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] bg-surface-container-lowest/50 rounded-xl flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-stitch-green border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] bg-surface-container-lowest/50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No chart data available</p>
          <p className="text-xs text-muted-foreground opacity-60">
            This may be due to API rate limits. Try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Time Range Selector */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto no-scrollbar">
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRange(range.value)}
            className={`
              px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300
              ${selectedRange === range.value 
                ? 'bg-stitch-green/20 text-stitch-green' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }
            `}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.03)" 
              vertical={false}
            />
            <XAxis 
              dataKey="date"
              tickFormatter={formatDate}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
