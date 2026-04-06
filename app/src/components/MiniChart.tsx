import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface MiniChartProps {
  data: number[];
  isPositive: boolean;
  showGradient?: boolean;
  height?: number;
}

export function MiniChart({ 
  data, 
  isPositive, 
  showGradient = false,
  height = 60
}: MiniChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((price, index) => ({ index, price }));
  }, [data]);

  const color = isPositive ? '#b7f9d9' : '#f87171';
  const gradientColor = isPositive ? 'rgba(183, 249, 217, 0.25)' : 'rgba(248, 113, 113, 0.25)';

  if (chartData.length === 0) {
    return <div className="w-full h-full bg-surface-container-lowest/50 rounded" />;
  }

  if (showGradient) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#gradient-${isPositive})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
