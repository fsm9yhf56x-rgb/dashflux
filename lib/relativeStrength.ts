// =====================================================
// RELATIVE STRENGTH MODULE - Méthode Steffan
// =====================================================
// Compare la performance de chaque asset vs benchmark (SPY)

import { PriceData } from './types';

/**
 * MÉTHODE STEFFAN:
 * "Achète ce qui surperforme le marché, vends ce qui sous-performe"
 * 
 * Relative Strength = Performance Asset - Performance Benchmark
 * 
 * RS > +15% = Très fort (score 90)
 * RS > +10% = Fort (score 80)
 * RS > +5% = Bon (score 65)
 * RS 0 à +5% = Neutre+ (score 55)
 * RS 0 à -5% = Neutre- (score 45)
 * RS < -5% = Faible (score 35)
 * RS < -10% = Très faible (score 20)
 * RS < -15% = Extrêmement faible (score 10)
 */

// Cache global pour SPY (éviter fetch multiple)
let spyCache: {
  data: PriceData[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

// =====================================================
// FETCH SPY BENCHMARK
// =====================================================

export async function fetchSPYBenchmark(): Promise<PriceData[]> {
  const now = Date.now();
  
  // Vérifier cache
  if (spyCache && (now - spyCache.timestamp) < CACHE_DURATION) {
    console.log('📊 Using cached SPY benchmark');
    return spyCache.data;
  }
  
  console.log('📊 Fetching SPY benchmark...');
  
  const end = Math.floor(Date.now() / 1000);
  const start = end - (730 * 24 * 60 * 60); // 2 ans
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/SPY?period1=${start}&period2=${end}&interval=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error('No SPY data');
    }
    
    const timestamps = data.chart.result[0].timestamp;
    const closes = data.chart.result[0].indicators.quote[0].close;
    
    const priceData: PriceData[] = timestamps
      .map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        close: closes[i]
      }))
      .filter((d: PriceData) => d.close !== null);
    
    // Mettre en cache
    spyCache = {
      data: priceData,
      timestamp: now
    };
    
    console.log(`✅ SPY benchmark loaded (${priceData.length} days)`);
    
    return priceData;
    
  } catch (error) {
    console.error('❌ Error fetching SPY benchmark:', error);
    
    // Retourner cache même expiré si disponible
    if (spyCache) {
      console.log('⚠️ Using expired SPY cache');
      return spyCache.data;
    }
    
    return [];
  }
}

// =====================================================
// CALCULATE RELATIVE STRENGTH
// =====================================================

export interface RelativeStrengthData {
  score: number;                // 0-100
  relativeStrength: number;     // % diff vs benchmark
  assetPerf3M: number;          // Performance 3M asset
  benchmarkPerf3M: number;      // Performance 3M SPY
  signal: 'very_strong' | 'strong' | 'neutral' | 'weak' | 'very_weak';
  explanation: string;
}

export function calculateRelativeStrength(
  assetData: PriceData[],
  benchmarkData: PriceData[]
): RelativeStrengthData {
  // Valeurs par défaut si pas assez de données
  if (assetData.length < 63 || benchmarkData.length < 63) {
    return {
      score: 50,
      relativeStrength: 0,
      assetPerf3M: 0,
      benchmarkPerf3M: 0,
      signal: 'neutral',
      explanation: 'Pas assez de données pour calcul RS'
    };
  }
  
  // Performance 3 mois (63 jours trading)
  const assetCurrent = assetData[assetData.length - 1].close;
  const asset3MAgo = assetData[assetData.length - 63].close;
  const assetPerf3M = ((assetCurrent - asset3MAgo) / asset3MAgo) * 100;
  
  const benchCurrent = benchmarkData[benchmarkData.length - 1].close;
  const bench3MAgo = benchmarkData[benchmarkData.length - 63].close;
  const benchmarkPerf3M = ((benchCurrent - bench3MAgo) / bench3MAgo) * 100;
  
  // Relative Strength = différence de performance
  const rs = assetPerf3M - benchmarkPerf3M;
  
  // Scoring selon RS
  let score = 50; // Neutre
  let signal: RelativeStrengthData['signal'] = 'neutral';
  let explanation = '';
  
  if (rs > 15) {
    score = 90;
    signal = 'very_strong';
    explanation = `Surperformance majeure vs marché (+${rs.toFixed(1)}%)`;
  } else if (rs > 10) {
    score = 80;
    signal = 'strong';
    explanation = `Forte surperformance vs marché (+${rs.toFixed(1)}%)`;
  } else if (rs > 5) {
    score = 65;
    signal = 'strong';
    explanation = `Surperformance vs marché (+${rs.toFixed(1)}%)`;
  } else if (rs > 0) {
    score = 55;
    signal = 'neutral';
    explanation = `Légère surperformance vs marché (+${rs.toFixed(1)}%)`;
  } else if (rs > -5) {
    score = 45;
    signal = 'neutral';
    explanation = `Légère sous-performance vs marché (${rs.toFixed(1)}%)`;
  } else if (rs > -10) {
    score = 35;
    signal = 'weak';
    explanation = `Sous-performance vs marché (${rs.toFixed(1)}%)`;
  } else if (rs > -15) {
    score = 20;
    signal = 'very_weak';
    explanation = `Forte sous-performance vs marché (${rs.toFixed(1)}%)`;
  } else {
    score = 10;
    signal = 'very_weak';
    explanation = `Sous-performance majeure vs marché (${rs.toFixed(1)}%)`;
  }
  
  return {
    score,
    relativeStrength: Math.round(rs * 100) / 100,
    assetPerf3M: Math.round(assetPerf3M * 100) / 100,
    benchmarkPerf3M: Math.round(benchmarkPerf3M * 100) / 100,
    signal,
    explanation
  };
}

// =====================================================
// HELPER: Calculate avec auto-fetch SPY
// =====================================================

export async function calculateRelativeStrengthAuto(
  assetData: PriceData[]
): Promise<RelativeStrengthData> {
  const spyData = await fetchSPYBenchmark();
  return calculateRelativeStrength(assetData, spyData);
}

// =====================================================
// CLEAR CACHE (pour admin/debug)
// =====================================================

export function clearSPYCache(): void {
  spyCache = null;
  console.log('✅ SPY cache cleared');
}
