import { PriceData } from './types';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands,
  calculateATR,
  detectRSIDivergence 
} from './technicalIndicators';

// Multi-timeframe analysis
export interface TimeframeAnalysis {
  short: number;      // 1 week
  medium: number;     // 1 month
  long: number;       // 3 months
  veryLong: number;   // 6 months
  alignment: number;  // 0-100
  consensus: 'bullish' | 'bearish' | 'neutral' | 'conflicted';
}

export function analyzeMultipleTimeframes(data: PriceData[]): TimeframeAnalysis {
  if (data.length < 126) {
    return {
      short: 50,
      medium: 50,
      long: 50,
      veryLong: 50,
      alignment: 50,
      consensus: 'neutral'
    };
  }

  const calculateTrendScore = (startIdx: number, endIdx: number): number => {
    const slice = data.slice(startIdx, endIdx);
    if (slice.length < 2) return 50;
    
    const firstPrice = slice[0].close;
    const lastPrice = slice[slice.length - 1].close;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return 50 + Math.min(Math.max(change * 2, -50), 50);
  };

  const short = calculateTrendScore(-5, data.length);
  const medium = calculateTrendScore(-21, data.length);
  const long = calculateTrendScore(-63, data.length);
  const veryLong = calculateTrendScore(-126, data.length);

  const scores = [short, medium, long, veryLong];
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - avg, 2), 0) / scores.length;
  const alignment = 100 - Math.min(variance, 100);

  const bullishCount = scores.filter(s => s > 55).length;
  const bearishCount = scores.filter(s => s < 45).length;
  
  let consensus: 'bullish' | 'bearish' | 'neutral' | 'conflicted';
  if (bullishCount >= 3) consensus = 'bullish';
  else if (bearishCount >= 3) consensus = 'bearish';
  else if (alignment < 50) consensus = 'conflicted';
  else consensus = 'neutral';

  return { short, medium, long, veryLong, alignment, consensus };
}

// Signal confluence
export interface SignalConfluence {
  totalSignals: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  confluenceScore: number;
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak';
  signals: Array<{ name: string; direction: 'bullish' | 'bearish' | 'neutral'; weight: number }>;
}

export function calculateSignalConfluence(
  data: PriceData[], 
  volumes?: { date: string; volume: number }[]
): SignalConfluence {
  const signals: Array<{ name: string; direction: 'bullish' | 'bearish' | 'neutral'; weight: number }> = [];

  if (data.length < 50) {
    return {
      totalSignals: 0,
      bullishCount: 0,
      bearishCount: 0,
      neutralCount: 0,
      confluenceScore: 50,
      strength: 'weak',
      signals: []
    };
  }

  try {
    const rsi = calculateRSI(data);
    if (rsi < 30) signals.push({ name: 'RSI Oversold', direction: 'bullish', weight: 10 });
    else if (rsi > 70) signals.push({ name: 'RSI Overbought', direction: 'bearish', weight: 10 });
    else signals.push({ name: 'RSI Neutral', direction: 'neutral', weight: 5 });

    const macd = calculateMACD(data);
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      signals.push({ name: 'MACD Bullish', direction: 'bullish', weight: 12 });
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      signals.push({ name: 'MACD Bearish', direction: 'bearish', weight: 12 });
    }

    const bb = calculateBollingerBands(data);
    const currentPrice = data[data.length - 1].close;
    if (currentPrice < bb.lower) {
      signals.push({ name: 'Below BB Lower', direction: 'bullish', weight: 10 });
    } else if (currentPrice > bb.upper) {
      signals.push({ name: 'Above BB Upper', direction: 'bearish', weight: 10 });
    }

    const ma50 = data.slice(-50).reduce((sum, d) => sum + d.close, 0) / 50;
    const ma200 = data.length >= 200 
      ? data.slice(-200).reduce((sum, d) => sum + d.close, 0) / 200 
      : ma50;

    if (currentPrice > ma50 && currentPrice > ma200) {
      signals.push({ name: 'Above MAs', direction: 'bullish', weight: 15 });
    } else if (currentPrice < ma50 && currentPrice < ma200) {
      signals.push({ name: 'Below MAs', direction: 'bearish', weight: 15 });
    }

    if (ma50 > ma200) {
      signals.push({ name: 'Golden Cross', direction: 'bullish', weight: 15 });
    } else if (ma50 < ma200) {
      signals.push({ name: 'Death Cross', direction: 'bearish', weight: 15 });
    }

    if (data.length >= 63) {
      const perf3M = ((data[data.length - 1].close - data[data.length - 63].close) / data[data.length - 63].close) * 100;
      if (perf3M > 10) {
        signals.push({ name: 'Strong Uptrend', direction: 'bullish', weight: 12 });
      } else if (perf3M < -10) {
        signals.push({ name: 'Strong Downtrend', direction: 'bearish', weight: 12 });
      }
    }

    const divergence = detectRSIDivergence(data);
    if (divergence.hasBullishDivergence) {
      signals.push({ name: 'RSI Bull Divergence', direction: 'bullish', weight: 15 });
    }
    if (divergence.hasBearishDivergence) {
      signals.push({ name: 'RSI Bear Divergence', direction: 'bearish', weight: 15 });
    }

  } catch (error) {
    console.error('Error in signal confluence:', error);
  }

  const bullishSignals = signals.filter(s => s.direction === 'bullish');
  const bearishSignals = signals.filter(s => s.direction === 'bearish');
  const neutralSignals = signals.filter(s => s.direction === 'neutral');

  const totalBullishWeight = bullishSignals.reduce((sum, s) => sum + s.weight, 0);
  const totalBearishWeight = bearishSignals.reduce((sum, s) => sum + s.weight, 0);
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);

  const netBullish = totalBullishWeight - totalBearishWeight;
  const confluenceScore = totalWeight > 0 ? 50 + (netBullish / totalWeight) * 50 : 50;

  const agreementRatio = totalWeight > 0 ? Math.abs(totalBullishWeight - totalBearishWeight) / totalWeight : 0;
  let strength: 'very_strong' | 'strong' | 'moderate' | 'weak';
  if (agreementRatio > 0.8) strength = 'very_strong';
  else if (agreementRatio > 0.6) strength = 'strong';
  else if (agreementRatio > 0.4) strength = 'moderate';
  else strength = 'weak';

  return {
    totalSignals: signals.length,
    bullishCount: bullishSignals.length,
    bearishCount: bearishSignals.length,
    neutralCount: neutralSignals.length,
    confluenceScore: Math.min(Math.max(confluenceScore, 0), 100),
    strength,
    signals
  };
}

// Market structure
export interface MarketStructure {
  type: 'strong_uptrend' | 'weak_uptrend' | 'range' | 'weak_downtrend' | 'strong_downtrend';
  quality: number;
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  support: number;
  resistance: number;
}

export function analyzeMarketStructure(data: PriceData[]): MarketStructure {
  if (data.length < 50) {
    return {
      type: 'range',
      quality: 50,
      higherHighs: false,
      higherLows: false,
      lowerHighs: false,
      lowerLows: false,
      support: 0,
      resistance: 0
    };
  }

  const pivots: { index: number; price: number; type: 'high' | 'low' }[] = [];
  
  for (let i = 5; i < data.length - 5; i++) {
    const current = data[i].close;
    const isHigh = data.slice(i - 5, i).every(d => d.close < current) &&
                   data.slice(i + 1, i + 6).every(d => d.close < current);
    const isLow = data.slice(i - 5, i).every(d => d.close > current) &&
                  data.slice(i + 1, i + 6).every(d => d.close > current);
    
    if (isHigh) pivots.push({ index: i, price: current, type: 'high' });
    if (isLow) pivots.push({ index: i, price: current, type: 'low' });
  }

  const highs = pivots.filter(p => p.type === 'high').slice(-3);
  const lows = pivots.filter(p => p.type === 'low').slice(-3);

  const higherHighs = highs.length >= 2 && highs[highs.length - 1].price > highs[highs.length - 2].price;
  const higherLows = lows.length >= 2 && lows[lows.length - 1].price > lows[lows.length - 2].price;
  const lowerHighs = highs.length >= 2 && highs[highs.length - 1].price < highs[highs.length - 2].price;
  const lowerLows = lows.length >= 2 && lows[lows.length - 1].price < lows[lows.length - 2].price;

  let type: MarketStructure['type'];
  if (higherHighs && higherLows) type = 'strong_uptrend';
  else if (higherHighs || higherLows) type = 'weak_uptrend';
  else if (lowerHighs && lowerLows) type = 'strong_downtrend';
  else if (lowerHighs || lowerLows) type = 'weak_downtrend';
  else type = 'range';

  const returns = data.slice(-50).map((d, i, arr) => 
    i > 0 ? (d.close - arr[i - 1].close) / arr[i - 1].close : 0
  );
  const avgReturn = returns.reduce((a, b) => a + Math.abs(b), 0) / returns.length;
  const quality = Math.min(100, (1 - avgReturn * 10) * 100);

  const support = lows.length > 0 ? Math.min(...lows.map(l => l.price)) : 0;
  const resistance = highs.length > 0 ? Math.max(...highs.map(h => h.price)) : 0;

  return { type, quality, higherHighs, higherLows, lowerHighs, lowerLows, support, resistance };
}

// Adaptive thresholds
export interface AdaptiveThresholds {
  rsiOversold: number;
  rsiOverbought: number;
  rsiNeutralLow: number;
  rsiNeutralHigh: number;
  volatilityLow: number;
  volatilityHigh: number;
}

export function calculateAdaptiveThresholds(data: PriceData[]): AdaptiveThresholds {
  return {
    rsiOversold: 30,
    rsiOverbought: 70,
    rsiNeutralLow: 45,
    rsiNeutralHigh: 55,
    volatilityLow: 15,
    volatilityHigh: 40
  };
}

// Risk-adjusted metrics
export interface RiskAdjustedMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  riskAdjustedScore: number;
}

export function calculateRiskAdjustedMetrics(data: PriceData[]): RiskAdjustedMetrics {
  if (data.length < 60) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      calmarRatio: 0,
      winRate: 0,
      profitFactor: 0,
      riskAdjustedScore: 50
    };
  }

  const returns = data.slice(1).map((d, i) => 
    (d.close - data[i].close) / data[i].close
  );

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const annualizedReturn = avgReturn * 252 * 100;

  const variance = returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const annualizedVol = stdDev * Math.sqrt(252) * 100;

  const riskFreeRate = 2;
  const sharpeRatio = annualizedVol > 0 ? (annualizedReturn - riskFreeRate) / annualizedVol : 0;

  const negativeReturns = returns.filter(r => r < 0);
  const downsideVariance = negativeReturns.reduce((acc, r) => acc + Math.pow(r, 2), 0) / returns.length;
  const downsideDev = Math.sqrt(downsideVariance) * Math.sqrt(252) * 100;
  const sortinoRatio = downsideDev > 0 ? (annualizedReturn - riskFreeRate) / downsideDev : 0;

  let peak = data[0].close;
  let maxDD = 0;
  let maxDDPercent = 0;

  for (const d of data) {
    if (d.close > peak) peak = d.close;
    const dd = peak - d.close;
    const ddPercent = (dd / peak) * 100;
    if (dd > maxDD) {
      maxDD = dd;
      maxDDPercent = ddPercent;
    }
  }

  const calmarRatio = maxDDPercent > 0 ? annualizedReturn / maxDDPercent : 0;

  const positiveReturns = returns.filter(r => r > 0);
  const winRate = (positiveReturns.length / returns.length) * 100;

  const totalGains = positiveReturns.reduce((sum, r) => sum + r, 0);
  const totalLosses = Math.abs(negativeReturns.reduce((sum, r) => sum + r, 0));
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : 0;

  let score = 50;
  if (sharpeRatio > 2) score += 20;
  else if (sharpeRatio > 1) score += 10;
  else if (sharpeRatio < -1) score -= 20;

  if (maxDDPercent < 10) score += 15;
  else if (maxDDPercent > 30) score -= 15;

  if (winRate > 60) score += 15;
  else if (winRate < 40) score -= 15;

  score = Math.min(Math.max(score, 0), 100);

  return {
    sharpeRatio,
    sortinoRatio,
    maxDrawdown: maxDD,
    maxDrawdownPercent: maxDDPercent,
    calmarRatio,
    winRate,
    profitFactor,
    riskAdjustedScore: score
  };
}