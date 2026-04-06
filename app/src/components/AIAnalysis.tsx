import { Brain, TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Target, Activity, Rocket, ArrowUpRight, BarChart3, ArrowDownRight, Crown, Trophy, Gem, Sprout, Flame, Droplets, TrendingDown as TrendingDownIcon, Coins, Hourglass } from 'lucide-react';
import type { CryptoAsset } from '@/types/crypto';
import { useCoinAnalysis, type Insight } from '@/hooks/useCoinAnalysis';

interface AIAnalysisProps {
  coin: CryptoAsset;
}

function getInsightIcon(icon: Insight['icon']) {
  const iconMap = {
    rocket: Rocket,
    chartUp: ArrowUpRight,
    chart: BarChart3,
    chartDown: ArrowDownRight,
    crown: Crown,
    trophy: Trophy,
    diamond: Gem,
    seedling: Sprout,
    fire: Flame,
    droplet: Droplets,
    warning: AlertTriangle,
    trending: TrendingDownIcon,
    supply: Hourglass,
    diluted: Coins,
  };
  
  const IconComponent = iconMap[icon] || BarChart3;
  return <IconComponent className="w-4 h-4 text-purple-400 flex-shrink-0" />;
}

export function AIAnalysis({ coin }: AIAnalysisProps) {
  const analysis = useCoinAnalysis(coin);

  if (!analysis) return null;

  const { sentiment, momentum, insights, riskLevel, summary } = analysis;

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'bullish': return 'text-stitch-green bg-stitch-green/10 border-stitch-green/20';
      case 'bearish': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-stitch-green';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
    }
  };

  const RiskIcon = riskLevel === 'low' ? Shield : riskLevel === 'medium' ? Activity : AlertTriangle;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="font-display font-semibold text-white">AI Market Analysis</h3>
        <span className="ml-auto text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
          Auto-generated
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {summary}
      </p>

      {/* Sentiment & Momentum */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-xl border ${getSentimentColor()}`}>
          <p className="text-xs uppercase tracking-wide mb-1 opacity-70">Sentiment</p>
          <div className="flex items-center gap-1">
            {sentiment === 'bullish' ? (
              <TrendingUp className="w-4 h-4" />
            ) : sentiment === 'bearish' ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span className="font-semibold capitalize">{sentiment}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-white/[0.06] bg-surface-container/50">
          <p className="text-xs uppercase tracking-wide mb-1 opacity-70">Momentum</p>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-white">{momentum}</span>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-surface-container/50 border border-white/[0.06]">
        <RiskIcon className={`w-4 h-4 ${getRiskColor()}`} />
        <span className="text-xs text-muted-foreground">Risk Level:</span>
        <span className={`font-semibold capitalize ${getRiskColor()}`}>{riskLevel} risk</span>
      </div>

      {/* Key Insights */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
          <Target className="w-3 h-3" />
          Key Insights
        </p>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li 
              key={index}
              className="text-sm text-white/90 p-2 rounded-lg bg-white/[0.02] border border-white/[0.03] flex items-start gap-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {getInsightIcon(insight.icon)}
              <span>{insight.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ This analysis is for informational purposes only. Always do your own research.
        </p>
      </div>
    </div>
  );
}