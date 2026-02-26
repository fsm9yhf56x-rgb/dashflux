// bot2/standalone/regime-detector.ts
import { MarketData, Indicators, RegimeDetection, RegimeType } from '../shared/types';

export class RegimeDetector {
  detect(marketData: MarketData, indicators: Indicators): RegimeDetection {
    const { candles } = marketData;
    
    const adx = indicators.adx;
    const rsi = indicators.rsi;
    const price = candles[candles.length - 1].close;
    const sma50 = indicators.sma50;
    const sma200 = indicators.sma200;
    const atr = indicators.atr;
    const avgPrice = (candles.slice(-20).reduce((sum, c) => sum + c.close, 0)) / 20;
    const volatility = (atr / avgPrice) * 100;

    const trendingThreshold = 25;
    const strongTrend = adx > trendingThreshold;

    const bullish = price > sma50 && sma50 > sma200;
    const bearish = price < sma50 && sma50 < sma200;

    const highVolatility = volatility > 3;

    let regime: RegimeType;
    let confidence = 0;

    if (strongTrend && bullish) {
      regime = 'trending_up';
      confidence = Math.min(adx, 100);
    } else if (strongTrend && bearish) {
      regime = 'trending_down';
      confidence = Math.min(adx, 100);
    } else if (highVolatility) {
      regime = 'high_volatility';
      confidence = Math.min(volatility * 20, 100);
    } else {
      regime = 'ranging';
      confidence = 100 - Math.min(adx, 100);
    }

    return {
      regime,
      confidence,
      adx,
      trend: bullish ? 1 : bearish ? -1 : 0,
    };
  }

  getRegimeDescription(regime: RegimeType): string {
    const descriptions: Record<RegimeType, string> = {
      trending_up: 'Strong upward trend with momentum',
      trending_down: 'Strong downward trend with momentum',
      ranging: 'Sideways movement, low trend strength',
      high_volatility: 'High volatility, unpredictable price action'
    };

    return descriptions[regime];
  }

  getPreferredStrategies(regime: RegimeType): string[] {
    const strategies: Record<RegimeType, string[]> = {
      trending_up: ['trend_following', 'breakout'],
      trending_down: ['trend_following', 'breakout'],
      ranging: ['mean_reversion'],
      high_volatility: ['breakout', 'mean_reversion']
    };

    return strategies[regime];
  }
}