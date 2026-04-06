import { useState, useEffect } from 'react';
import { api } from '@/api/client';

interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
}

export function FearGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getFearGreed();
        if (result.success && result.data?.data && result.data.data.length > 0) {
          setData(result.data.data[0]);
        } else {
          // Fallback data if API fails
          setData({ value: 50, value_classification: 'Neutral', timestamp: new Date().toISOString() });
        }
      } catch (error) {
        console.error('Failed to fetch fear & greed index:', error);
        // Fallback data
        setData({ value: 50, value_classification: 'Neutral', timestamp: new Date().toISOString() });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSentimentColor = (value: number) => {
    if (value <= 20) return '#ef4444'; // Extreme Fear - Red
    if (value <= 40) return '#f97316'; // Fear - Orange
    if (value <= 60) return '#eab308'; // Neutral - Yellow
    if (value <= 80) return '#84cc16'; // Greed - Light Green
    return '#b7f9d9'; // Extreme Greed - Stitch Green
  };

  const getSentimentLabel = (classification: string) => {
    const labels: Record<string, string> = {
      'Extreme Fear': 'Extreme Fear',
      'Fear': 'Fear',
      'Neutral': 'Neutral',
      'Greed': 'Greed',
      'Extreme Greed': 'Extreme Greed',
    };
    return labels[classification] || classification;
  };

  if (loading || !data) {
    return (
      <div className="p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-white/10 rounded mb-4" />
          <div className="h-16 w-16 bg-white/10 rounded-full mx-auto mb-3" />
          <div className="h-4 w-20 bg-white/10 rounded mx-auto" />
        </div>
      </div>
    );
  }

  const value = typeof data.value === 'string' ? parseInt(data.value) : data.value;
  const color = getSentimentColor(value);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Fear & Greed</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">24h</span>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Progress Circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold" style={{ color }}>
            {value}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            Index
          </span>
        </div>
      </div>

      {/* Sentiment Label */}
      <div className="mt-4 text-center">
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: `${color}20`,
            color 
          }}
        >
          {getSentimentLabel(data.value_classification)}
        </span>
      </div>

      {/* Scale */}
      <div className="mt-4 flex justify-between text-[10px] text-muted-foreground">
        <span>Extreme Fear</span>
        <span>Extreme Greed</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-stitch-green" />
    </div>
  );
}
