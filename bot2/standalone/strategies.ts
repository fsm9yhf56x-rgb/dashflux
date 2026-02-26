// bot2/standalone/strategies.ts
import { MarketData, Indicators, Signal, RegimeDetection, StrategyName } from '../shared/types';

export interface Strategy {
  analyze(marketData: MarketData, indicators: Indicators, regime: RegimeDetection): Signal;
}

class TrendFollowingStrategy implements Strategy {
  analyze(marketData: MarketData, indicators: Indicators, regime: RegimeDetection): Signal {
    const { price, symbol } = marketData;
    const { sma50, sma200, adx, rsi } = indicators;

    const bullishTrend = price > sma50 && sma50 > sma200 && adx > 25;
    const notOverbought = rsi < 70;
    const buySignal = bullishTrend && notOverbought;

    const bearishTrend = price < sma50 && sma50 < sma200 && adx > 25;
    const notOversold = rsi > 30;
    const sellSignal = bearishTrend && notOversold;

    if (buySignal) {
      return { type: 'buy', symbol, price, confidence: Math.min((adx / 100) * 100, 100), strategy: 'trend_following', regime: regime.regime, reason: 'Strong uptrend', timestamp: Date.now() };
    }
    if (sellSignal) {
      return { type: 'sell', symbol, price, confidence: Math.min((adx / 100) * 100, 100), strategy: 'trend_following', regime: regime.regime, reason: 'Strong downtrend', timestamp: Date.now() };
    }
    return { type: 'hold', symbol, price, confidence: 0, strategy: 'trend_following', regime: regime.regime, reason: 'No clear trend', timestamp: Date.now() };
  }
}

class MeanReversionStrategy implements Strategy {
  analyze(marketData: MarketData, indicators: Indicators, regime: RegimeDetection): Signal {
    const { price, symbol } = marketData;
    const { bollingerLower, bollingerUpper, rsi } = indicators;

    const oversold = price < bollingerLower && rsi < 30;
    const overbought = price > bollingerUpper && rsi > 70;

    if (oversold) {
      return { type: 'buy', symbol, price, confidence: 70, strategy: 'mean_reversion', regime: regime.regime, reason: 'Oversold', timestamp: Date.now() };
    }
    if (overbought) {
      return { type: 'sell', symbol, price, confidence: 70, strategy: 'mean_reversion', regime: regime.regime, reason: 'Overbought', timestamp: Date.now() };
    }
    return { type: 'hold', symbol, price, confidence: 0, strategy: 'mean_reversion', regime: regime.regime, reason: 'Normal range', timestamp: Date.now() };
  }
}

class BreakoutStrategy implements Strategy {
  analyze(marketData: MarketData, indicators: Indicators, regime: RegimeDetection): Signal {
    const { price, symbol, candles } = marketData;
    const { donchianUpper, donchianLower, volumeMA } = indicators;

    const currentVolume = candles[candles.length - 1].volume;
    const highVolume = currentVolume > volumeMA * 1.5;

    const bullishBreakout = price > donchianUpper && highVolume;
    const bearishBreakout = price < donchianLower && highVolume;

    if (bullishBreakout) {
      return { type: 'buy', symbol, price, confidence: 75, strategy: 'breakout', regime: regime.regime, reason: 'Bullish breakout', timestamp: Date.now() };
    }
    if (bearishBreakout) {
      return { type: 'sell', symbol, price, confidence: 75, strategy: 'breakout', regime: regime.regime, reason: 'Bearish breakout', timestamp: Date.now() };
    }
    return { type: 'hold', symbol, price, confidence: 0, strategy: 'breakout', regime: regime.regime, reason: 'No breakout', timestamp: Date.now() };
  }
}

export class StrategyFactory {
  private strategies: Map<StrategyName, Strategy>;

  constructor() {
    this.strategies = new Map([
      ['trend_following', new TrendFollowingStrategy()],
      ['mean_reversion', new MeanReversionStrategy()],
      ['breakout', new BreakoutStrategy()]
    ]);
  }

  getStrategy(name: StrategyName): Strategy | undefined {
    return this.strategies.get(name);
  }
}