import type { CryptoAsset } from '@/types/crypto';

export interface Insight {
  icon: 'rocket' | 'chartUp' | 'chart' | 'chartDown' | 'crown' | 'trophy' | 'diamond' | 'seedling' | 'fire' | 'droplet' | 'warning' | 'trending' | 'supply' | 'diluted';
  text: string;
}

interface AnalysisResult {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  momentum: string;
  insights: Insight[];
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
}

export function useCoinAnalysis(coin: CryptoAsset | null) {
  if (!coin) {
    return null;
  }

  const analysis: AnalysisResult = generateAnalysis(coin);
  return analysis;
}

function generateAnalysis(coin: CryptoAsset): AnalysisResult {
  const insights: Insight[] = [];
  let sentimentScore = 0;

  // Analyze price change
  const priceChange = coin.price_change_percentage_24h || 0;
  if (priceChange > 10) {
    insights.push({ icon: 'rocket', text: `Strong upward momentum with ${priceChange.toFixed(1)}% gain in 24h` });
    sentimentScore += 3;
  } else if (priceChange > 5) {
    insights.push({ icon: 'chartUp', text: `Positive price action, up ${priceChange.toFixed(1)}% in 24h` });
    sentimentScore += 2;
  } else if (priceChange > 0) {
    insights.push({ icon: 'chart', text: `Modest gains of ${priceChange.toFixed(1)}% in 24h` });
    sentimentScore += 1;
  } else if (priceChange > -5) {
    insights.push({ icon: 'chartDown', text: `Slight decline of ${Math.abs(priceChange).toFixed(1)}% in 24h` });
    sentimentScore -= 1;
  } else if (priceChange > -10) {
    insights.push({ icon: 'chartDown', text: `Notable drop of ${Math.abs(priceChange).toFixed(1)}% in 24h` });
    sentimentScore -= 2;
  } else {
    insights.push({ icon: 'warning', text: `Significant selloff with ${Math.abs(priceChange).toFixed(1)}% loss in 24h` });
    sentimentScore -= 3;
  }

  // Analyze market cap rank
  if (coin.market_cap_rank === 1) {
    insights.push({ icon: 'crown', text: 'Market leader - The #1 cryptocurrency by market cap' });
  } else if (coin.market_cap_rank <= 5) {
    insights.push({ icon: 'trophy', text: `Top 5 cryptocurrency - Strong market position (#${coin.market_cap_rank})` });
  } else if (coin.market_cap_rank <= 20) {
    insights.push({ icon: 'diamond', text: `Established project - Ranked #${coin.market_cap_rank} by market cap` });
  } else {
    insights.push({ icon: 'seedling', text: `Emerging project - Ranked #${coin.market_cap_rank || 'N/A'} by market cap` });
  }

  // Analyze volume
  const volumeToMarketCap = coin.total_volume / (coin.market_cap || 1);
  if (volumeToMarketCap > 0.1) {
    insights.push({ icon: 'fire', text: 'High trading volume - Strong liquidity and trader interest' });
    sentimentScore += 1;
  } else if (volumeToMarketCap > 0.05) {
    insights.push({ icon: 'droplet', text: 'Moderate trading volume - Healthy market activity' });
  } else if (volumeToMarketCap < 0.01 && coin.market_cap > 0) {
    insights.push({ icon: 'warning', text: 'Low trading volume - Limited liquidity, trade carefully' });
  }

  // Analyze price range
  if (coin.high_24h && coin.low_24h) {
    const range = ((coin.high_24h - coin.low_24h) / coin.low_24h) * 100;
    if (range > 15) {
      insights.push({ icon: 'trending', text: `High volatility - ${range.toFixed(1)}% price range in 24h` });
    } else if (range > 5) {
      insights.push({ icon: 'chart', text: `Moderate volatility - ${range.toFixed(1)}% price range in 24h` });
    }
  }

  // Analyze supply
  if (coin.max_supply && coin.circulating_supply) {
    const supplyPercent = (coin.circulating_supply / coin.max_supply) * 100;
    if (supplyPercent > 90) {
      insights.push({ icon: 'diluted', text: `Nearly fully diluted - ${supplyPercent.toFixed(0)}% of max supply in circulation` });
    } else if (supplyPercent < 50) {
      insights.push({ icon: 'supply', text: `Early stage - Only ${supplyPercent.toFixed(0)}% of max supply released` });
    }
  }

  // Determine sentiment
  let sentiment: 'bullish' | 'bearish' | 'neutral';
  if (sentimentScore >= 2) {
    sentiment = 'bullish';
  } else if (sentimentScore <= -2) {
    sentiment = 'bearish';
  } else {
    sentiment = 'neutral';
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (coin.market_cap_rank && coin.market_cap_rank <= 10 && volumeToMarketCap > 0.05) {
    riskLevel = 'low';
  } else if (coin.market_cap_rank && coin.market_cap_rank <= 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  // Generate momentum description
  let momentum: string;
  if (priceChange > 8) {
    momentum = 'Strong Bullish';
  } else if (priceChange > 3) {
    momentum = 'Bullish';
  } else if (priceChange > -3) {
    momentum = 'Neutral';
  } else if (priceChange > -8) {
    momentum = 'Bearish';
  } else {
    momentum = 'Strong Bearish';
  }

  // Generate summary
  const summary = generateSummary(coin, sentiment, momentum, riskLevel, priceChange);

  return {
    sentiment,
    momentum,
    insights,
    riskLevel,
    summary,
  };
}

function generateSummary(
  coin: CryptoAsset,
  sentiment: string,
  momentum: string,
  riskLevel: string,
  priceChange: number
): string {
  const name = coin.name;
  const symbol = coin.symbol.toUpperCase();
  
  const sentimentText = sentiment === 'bullish' 
    ? 'positive' 
    : sentiment === 'bearish' 
    ? 'cautious' 
    : 'neutral';

  const riskText = riskLevel === 'low'
    ? 'lower risk'
    : riskLevel === 'medium'
    ? 'moderate risk'
    : 'higher risk';

  if (priceChange > 5) {
    return `${name} (${symbol}) shows ${sentimentText} signals with strong upward momentum. Current market sentiment is ${momentum.toLowerCase()}. This is a ${riskText} investment given its market position.`;
  } else if (priceChange < -5) {
    return `${name} (${symbol}) is experiencing selling pressure with ${sentimentText} signals. Current market sentiment is ${momentum.toLowerCase()}. Consider the ${riskText} profile before trading.`;
  } else {
    return `${name} (${symbol}) is trading with ${sentimentText} signals and ${momentum.toLowerCase()} momentum. This represents a ${riskText} profile based on current market conditions.`;
  }
}