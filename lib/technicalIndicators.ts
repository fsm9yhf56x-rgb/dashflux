import { PriceData } from './types';

// ============================================
// INDICATEURS TECHNIQUES AVANCÉS
// ============================================

// 1. RSI (Relative Strength Index)
export function calculateRSI(data: PriceData[], period: number = 14): number {
  if (data.length < period + 1) return 50;
  
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0);
  const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
  
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

// 2. MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: PriceData[]): {
  macd: number;
  signal: number;
  histogram: number;
  isBullish: boolean;
} {
  if (data.length < 26) {
    return { macd: 0, signal: 0, histogram: 0, isBullish: false };
  }

  const closes = data.map(d => d.close);
  
  // EMA 12
  const ema12 = calculateEMA(closes, 12);
  // EMA 26
  const ema26 = calculateEMA(closes, 26);
  
  const macd = ema12 - ema26;
  
  // Signal line (EMA 9 du MACD)
  const macdHistory = [macd]; // Simplifié pour cet exemple
  const signal = macd * 0.9; // Approximation
  
  const histogram = macd - signal;
  const isBullish = histogram > 0;
  
  return { macd, signal, histogram, isBullish };
}

function calculateEMA(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1];
  
  const k = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  
  return ema;
}

// 3. Bollinger Bands
export function calculateBollingerBands(data: PriceData[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
  percentB: number; // Position dans les bandes (0-1)
  isSqueeze: boolean; // Consolidation
} {
  if (data.length < period) {
    const price = data[data.length - 1].close;
    return { upper: price, middle: price, lower: price, percentB: 0.5, isSqueeze: false };
  }

  const closes = data.slice(-period).map(d => d.close);
  const middle = closes.reduce((a, b) => a + b, 0) / period;
  
  const variance = closes.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  const upper = middle + (standardDeviation * stdDev);
  const lower = middle - (standardDeviation * stdDev);
  
  const currentPrice = data[data.length - 1].close;
  const percentB = (currentPrice - lower) / (upper - lower);
  
  // Squeeze detection (bandes étroites = consolidation)
  const bandWidth = (upper - lower) / middle;
  const isSqueeze = bandWidth < 0.1; // Moins de 10% = squeeze
  
  return { upper, middle, lower, percentB, isSqueeze };
}

// 4. ATR (Average True Range) - Volatilité
export function calculateATR(data: PriceData[], period: number = 14): number {
  if (data.length < period + 1) return 0;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].close * 1.02; // Approximation (pas de high/low dans nos données)
    const low = data[i].close * 0.98;
    const prevClose = data[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    
    trueRanges.push(tr);
  }
  
  const recentTR = trueRanges.slice(-period);
  const atr = recentTR.reduce((a, b) => a + b, 0) / period;
  
  return atr;
}

// 5. Volume Relatif (détection accumulation/distribution)
export function calculateVolumeScore(data: PriceData[]): {
  score: number;
  isAccumulating: boolean;
  volumeTrend: 'increasing' | 'decreasing' | 'neutral';
} {
  // Note: Yahoo Finance data n'a pas toujours de volume fiable
  // On simule avec volatilité comme proxy
  
  if (data.length < 20) {
    return { score: 50, isAccumulating: false, volumeTrend: 'neutral' };
  }

  const recentVolatility = data.slice(-10).map(d => Math.abs(d.close - data[data.length - 11].close));
  const olderVolatility = data.slice(-20, -10).map(d => Math.abs(d.close - data[data.length - 21].close));
  
  const avgRecentVol = recentVolatility.reduce((a, b) => a + b, 0) / recentVolatility.length;
  const avgOlderVol = olderVolatility.reduce((a, b) => a + b, 0) / olderVolatility.length;
  
  const volRatio = avgRecentVol / avgOlderVol;
  
  let score = 50;
  let volumeTrend: 'increasing' | 'decreasing' | 'neutral' = 'neutral';
  
  if (volRatio > 1.3) {
    score = 75; // Volume augmente
    volumeTrend = 'increasing';
  } else if (volRatio < 0.7) {
    score = 35; // Volume diminue
    volumeTrend = 'decreasing';
  }
  
  // Accumulation si prix stable mais "volume" (volatilité) augmente
  const priceChange = Math.abs((data[data.length - 1].close - data[data.length - 10].close) / data[data.length - 10].close);
  const isAccumulating = priceChange < 0.03 && volRatio > 1.2;
  
  return { score, isAccumulating, volumeTrend };
}

// 6. Divergence RSI vs Prix (signal précoce)
export function detectRSIDivergence(data: PriceData[]): {
  hasBullishDivergence: boolean;
  hasBearishDivergence: boolean;
  strength: number; // 0-100
} {
  if (data.length < 30) {
    return { hasBullishDivergence: false, hasBearishDivergence: false, strength: 0 };
  }

  const closes = data.map(d => d.close);
  const rsiValues: number[] = [];
  
  // Calculer RSI pour les 20 derniers points
  for (let i = data.length - 20; i < data.length; i++) {
    const subset = data.slice(Math.max(0, i - 14), i + 1);
    rsiValues.push(calculateRSI(subset, 14));
  }
  
  const recentPrices = closes.slice(-20);
  
  // Détecter divergence haussière : prix fait lower low, RSI fait higher low
  const priceLowIndex1 = recentPrices.indexOf(Math.min(...recentPrices.slice(0, 10)));
  const priceLowIndex2 = recentPrices.indexOf(Math.min(...recentPrices.slice(10)));
  
  const rsiLow1 = rsiValues[priceLowIndex1];
  const rsiLow2 = rsiValues[priceLowIndex2];
  
  const priceLow1 = recentPrices[priceLowIndex1];
  const priceLow2 = recentPrices[priceLowIndex2];
  
  const hasBullishDivergence = priceLow2 < priceLow1 && rsiLow2 > rsiLow1;
  
  // Divergence baissière (inverse)
  const priceHighIndex1 = recentPrices.indexOf(Math.max(...recentPrices.slice(0, 10)));
  const priceHighIndex2 = recentPrices.indexOf(Math.max(...recentPrices.slice(10)));
  
  const rsiHigh1 = rsiValues[priceHighIndex1];
  const rsiHigh2 = rsiValues[priceHighIndex2];
  
  const priceHigh1 = recentPrices[priceHighIndex1];
  const priceHigh2 = recentPrices[priceHighIndex2];
  
  const hasBearishDivergence = priceHigh2 > priceHigh1 && rsiHigh2 < rsiHigh1;
  
  let strength = 0;
  if (hasBullishDivergence) {
    strength = Math.min(100, Math.abs(rsiLow2 - rsiLow1) * 2);
  } else if (hasBearishDivergence) {
    strength = Math.min(100, Math.abs(rsiHigh2 - rsiHigh1) * 2);
  }
  
  return { hasBullishDivergence, hasBearishDivergence, strength };
}

// 7. Smart Money Flow (volume sur hausses vs baisses)
export function calculateSmartMoneyFlow(data: PriceData[]): {
  score: number;
  isSmartMoneyBuying: boolean;
} {
  if (data.length < 20) {
    return { score: 50, isSmartMoneyBuying: false };
  }

  let upVolume = 0;
  let downVolume = 0;
  
  for (let i = 1; i < data.length; i++) {
    const priceChange = data[i].close - data[i - 1].close;
    const volume = Math.abs(priceChange); // Proxy pour volume
    
    if (priceChange > 0) {
      upVolume += volume;
    } else {
      downVolume += volume;
    }
  }
  
  const totalVolume = upVolume + downVolume;
  const buyPressure = totalVolume > 0 ? (upVolume / totalVolume) * 100 : 50;
  
  const isSmartMoneyBuying = buyPressure > 55;
  
  return { score: Math.round(buyPressure), isSmartMoneyBuying };
}

// 8. Consolidation / Breakout Detection
export function detectConsolidation(data: PriceData[]): {
  isConsolidating: boolean;
  daysConsolidating: number;
  breakoutPotential: number; // 0-100
} {
  if (data.length < 30) {
    return { isConsolidating: false, daysConsolidating: 0, breakoutPotential: 0 };
  }

  const recent = data.slice(-30);
  const closes = recent.map(d => d.close);
  
  const max = Math.max(...closes);
  const min = Math.min(...closes);
  const range = max - min;
  const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length;
  
  const rangePercent = (range / avgPrice) * 100;
  
  // Consolidation = range < 10% sur 30 jours
  const isConsolidating = rangePercent < 10;
  
  // Compter combien de jours consécutifs en consolidation
  let daysConsolidating = 0;
  for (let i = closes.length - 1; i >= 0; i--) {
    const subset = closes.slice(Math.max(0, i - 20), i + 1);
    const subMax = Math.max(...subset);
    const subMin = Math.min(...subset);
    const subRange = ((subMax - subMin) / closes[i]) * 100;
    
    if (subRange < 10) {
      daysConsolidating++;
    } else {
      break;
    }
  }
  
  // Plus la consolidation est longue, plus le breakout potentiel est fort
  const breakoutPotential = isConsolidating ? Math.min(100, daysConsolidating * 3) : 0;
  
  return { isConsolidating, daysConsolidating, breakoutPotential };
}