export interface VolumeData {
  date: string;
  volume: number;
}

export async function fetchVolumeData(ticker: string): Promise<VolumeData[]> {
  const end = Math.floor(Date.now() / 1000);
  const start = end - (730 * 24 * 60 * 60); // 2 ans
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${start}&period2=${end}&interval=1d`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const timestamps = data.chart.result[0].timestamp;
    const volumes = data.chart.result[0].indicators.quote[0].volume;
    
    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      volume: volumes[i] || 0
    })).filter((d: VolumeData) => d.volume > 0);
  } catch (error) {
    console.error(`Error fetching volume for ${ticker}:`, error);
    return [];
  }
}

// Calculer le volume relatif (vrai)
export function calculateRealVolumeScore(volumes: VolumeData[]): {
  score: number;
  isAccumulating: boolean;
  volumeTrend: 'increasing' | 'decreasing' | 'neutral';
  avgVolume: number;
  currentVolume: number;
  volumeRatio: number;
} {
  if (volumes.length < 20) {
    return {
      score: 50,
      isAccumulating: false,
      volumeTrend: 'neutral',
      avgVolume: 0,
      currentVolume: 0,
      volumeRatio: 1
    };
  }

  const recentVolumes = volumes.slice(-10).map(v => v.volume);
  const olderVolumes = volumes.slice(-20, -10).map(v => v.volume);
  
  const avgRecent = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const avgOlder = olderVolumes.reduce((a, b) => a + b, 0) / olderVolumes.length;
  
  const currentVolume = volumes[volumes.length - 1].volume;
  const avgVolume20 = volumes.slice(-20).reduce((a, b) => a + b.volume, 0) / 20;
  
  const volumeRatio = avgRecent / avgOlder;
  
  let score = 50;
  let volumeTrend: 'increasing' | 'decreasing' | 'neutral' = 'neutral';
  
  if (volumeRatio > 1.3) {
    score = 80; // Volume augmente fortement
    volumeTrend = 'increasing';
  } else if (volumeRatio > 1.1) {
    score = 65; // Volume augmente modérément
    volumeTrend = 'increasing';
  } else if (volumeRatio < 0.7) {
    score = 30; // Volume diminue
    volumeTrend = 'decreasing';
  } else if (volumeRatio < 0.9) {
    score = 45;
    volumeTrend = 'decreasing';
  }
  
  // Accumulation : volume élevé sans mouvement de prix important
  const isAccumulating = currentVolume > avgVolume20 * 1.5;
  
  return {
    score,
    isAccumulating,
    volumeTrend,
    avgVolume: avgVolume20,
    currentVolume,
    volumeRatio
  };
}

// Smart Money Flow avec VRAI volume
export function calculateRealSmartMoneyFlow(
  prices: number[],
  volumes: number[]
): {
  score: number;
  isSmartMoneyBuying: boolean;
  buyVolume: number;
  sellVolume: number;
  buyPressure: number;
} {
  if (prices.length < 2 || volumes.length < 2 || prices.length !== volumes.length) {
    return {
      score: 50,
      isSmartMoneyBuying: false,
      buyVolume: 0,
      sellVolume: 0,
      buyPressure: 50
    };
  }

  let buyVolume = 0;
  let sellVolume = 0;
  
  for (let i = 1; i < prices.length; i++) {
    const priceChange = prices[i] - prices[i - 1];
    const volume = volumes[i];
    
    if (priceChange > 0) {
      buyVolume += volume;
    } else if (priceChange < 0) {
      sellVolume += volume;
    }
  }
  
  const totalVolume = buyVolume + sellVolume;
  const buyPressure = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;
  
  const isSmartMoneyBuying = buyPressure > 55;
  
  return {
    score: Math.round(buyPressure),
    isSmartMoneyBuying,
    buyVolume,
    sellVolume,
    buyPressure
  };
}

// OBV (On-Balance Volume) - indicateur d'accumulation
export function calculateOBV(prices: number[], volumes: number[]): number[] {
  const obv: number[] = [volumes[0] || 0];
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      obv.push(obv[i - 1] + volumes[i]);
    } else if (prices[i] < prices[i - 1]) {
      obv.push(obv[i - 1] - volumes[i]);
    } else {
      obv.push(obv[i - 1]);
    }
  }
  
  return obv;
}

// Détection divergence OBV vs Prix (signal fort)
export function detectOBVDivergence(
  prices: number[],
  volumes: number[]
): {
  hasBullishDivergence: boolean;
  hasBearishDivergence: boolean;
  strength: number;
} {
  if (prices.length < 30 || volumes.length < 30) {
    return { hasBullishDivergence: false, hasBearishDivergence: false, strength: 0 };
  }

  const obv = calculateOBV(prices, volumes);
  const recentPrices = prices.slice(-20);
  const recentOBV = obv.slice(-20);
  
  // Trouver les lows
  const priceLowIndex1 = recentPrices.indexOf(Math.min(...recentPrices.slice(0, 10)));
  const priceLowIndex2 = 10 + recentPrices.slice(10).indexOf(Math.min(...recentPrices.slice(10)));
  
  const priceLow1 = recentPrices[priceLowIndex1];
  const priceLow2 = recentPrices[priceLowIndex2];
  
  const obvLow1 = recentOBV[priceLowIndex1];
  const obvLow2 = recentOBV[priceLowIndex2];
  
  // Divergence haussière : prix fait lower low, OBV fait higher low
  const hasBullishDivergence = priceLow2 < priceLow1 && obvLow2 > obvLow1;
  
  // Divergence baissière : prix fait higher high, OBV fait lower high
  const priceHighIndex1 = recentPrices.indexOf(Math.max(...recentPrices.slice(0, 10)));
  const priceHighIndex2 = 10 + recentPrices.slice(10).indexOf(Math.max(...recentPrices.slice(10)));
  
  const priceHigh1 = recentPrices[priceHighIndex1];
  const priceHigh2 = recentPrices[priceHighIndex2];
  
  const obvHigh1 = recentOBV[priceHighIndex1];
  const obvHigh2 = recentOBV[priceHighIndex2];
  
  const hasBearishDivergence = priceHigh2 > priceHigh1 && obvHigh2 < obvHigh1;
  
  let strength = 0;
  if (hasBullishDivergence) {
    strength = Math.min(100, Math.abs((obvLow2 - obvLow1) / obvLow1) * 100);
  } else if (hasBearishDivergence) {
    strength = Math.min(100, Math.abs((obvHigh2 - obvHigh1) / obvHigh1) * 100);
  }
  
  return { hasBullishDivergence, hasBearishDivergence, strength };
}

// VWAP (Volume Weighted Average Price)
export function calculateVWAP(prices: number[], volumes: number[]): number {
  if (prices.length === 0 || volumes.length === 0) return 0;
  
  let sumPV = 0;
  let sumV = 0;
  
  for (let i = 0; i < Math.min(prices.length, volumes.length); i++) {
    sumPV += prices[i] * volumes[i];
    sumV += volumes[i];
  }
  
  return sumV > 0 ? sumPV / sumV : prices[prices.length - 1];
}

// Money Flow Index (MFI) - RSI avec volume
export function calculateMFI(prices: number[], volumes: number[], period: number = 14): number {
  if (prices.length < period + 1 || volumes.length < period + 1) return 50;
  
  const typicalPrices = prices.map((price, i) => price); // Simplifié (on devrait utiliser (H+L+C)/3)
  const moneyFlow = typicalPrices.map((tp, i) => tp * volumes[i]);
  
  let positiveFlow = 0;
  let negativeFlow = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    if (i === 0) continue;
    
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveFlow += moneyFlow[i];
    } else {
      negativeFlow += moneyFlow[i];
    }
  }
  
  if (negativeFlow === 0) return 100;
  
  const moneyRatio = positiveFlow / negativeFlow;
  const mfi = 100 - (100 / (1 + moneyRatio));
  
  return mfi;
}