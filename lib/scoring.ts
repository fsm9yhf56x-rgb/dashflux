import { Asset, AssetScore, PriceData } from './types';
import { calculateGlobalLiquidity, blendWithLiquidity, type LiquidityIndicators } from './liquidity';
import { getPositioningScore, hasPositioningData, type PositioningAnalysis } from './positioning';
import { calculateRelativeStrengthAuto, type RelativeStrengthData } from './relativeStrength';
import { calculateDrawdown, type DrawdownData } from './drawdown';
import { calculateValuationScore, calculateValuationScoreV2, type ValuationData } from './valuation';
import { calculateMacroRegionalScore, type MacroRegionalData } from './macroRegional';

export const ASSETS: Asset[] = [
  // === INDICES MAJEURS US (4) ===
  { ticker: 'SPY', name: 'S&P 500', category: 'equity' },
  { ticker: 'QQQ', name: 'Nasdaq 100', category: 'equity' },
  { ticker: 'DIA', name: 'Dow Jones', category: 'equity' },
  { ticker: 'IWM', name: 'Russell 2000', category: 'equity' },
  
  // === CHINE (3) ===
  { ticker: 'BABA', name: 'Alibaba', category: 'equity', subcategory: 'china' },
  { ticker: 'BIDU', name: 'Baidu', category: 'equity', subcategory: 'china' },
  { ticker: 'JD', name: 'JD.com', category: 'equity', subcategory: 'china' },
  
  // === TECH GIANTS (7 Magnifiques) ===
  { ticker: 'AAPL', name: 'Apple', category: 'equity' },
  { ticker: 'MSFT', name: 'Microsoft', category: 'equity' },
  { ticker: 'GOOGL', name: 'Google/Alphabet', category: 'equity' },
  { ticker: 'AMZN', name: 'Amazon', category: 'equity' },
  { ticker: 'META', name: 'Meta/Facebook', category: 'equity' },
  { ticker: 'NVDA', name: 'Nvidia', category: 'equity' },
  { ticker: 'TSLA', name: 'Tesla', category: 'equity' },

// === EUROPE ===
  { ticker: 'UBI.PA', name: 'Ubisoft', category: 'equity' },
  
  // === AI & SEMICONDUCTORS (3) ===
  { ticker: 'AMD', name: 'AMD', category: 'equity' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'equity' },
  { ticker: 'INTC', name: 'Intel', category: 'equity' },
  
  // === SECTEURS US (6) ===
  { ticker: 'XLE', name: 'Energy', category: 'equity' },
  { ticker: 'XLF', name: 'Financials', category: 'equity' },
  { ticker: 'XLK', name: 'Technology', category: 'equity' },
  { ticker: 'XLU', name: 'Utilities', category: 'equity' },
  { ticker: 'XLP', name: 'Consumer Staples', category: 'equity' },
  { ticker: 'XLY', name: 'Consumer Discretionary', category: 'equity' },
  
  // === INNOVATION (3) ===
  { ticker: 'ARKK', name: 'ARK Innovation', category: 'equity' },
  { ticker: 'ICLN', name: 'Clean Energy', category: 'equity' },
  { ticker: 'BOTZ', name: 'Robotics & AI', category: 'equity' },
  
  // === INTERNATIONAL (3) ===
  { ticker: 'EEM', name: 'Emerging Markets', category: 'equity' },
  { ticker: 'EWJ', name: 'Japan', category: 'equity' },
  { ticker: 'VGK', name: 'Europe', category: 'equity' },
  
  // === MÉTAUX PRÉCIEUX (6) ===
  { ticker: 'GLD', name: 'Or', category: 'commodity' },
  { ticker: 'SLV', name: 'Argent', category: 'commodity' },
  { ticker: 'PPLT', name: 'Platine', category: 'commodity' },
  { ticker: 'PALL', name: 'Palladium', category: 'commodity' },
  { ticker: 'COPX', name: 'Copper Miners', category: 'commodity' },
  { ticker: 'URA', name: 'Uranium', category: 'commodity' },
  
  // === ÉNERGIE (3) ===
  { ticker: 'USO', name: 'Pétrole WTI', category: 'commodity' },
  { ticker: 'BNO', name: 'Pétrole Brent', category: 'commodity' },
  { ticker: 'UNG', name: 'Gaz Naturel', category: 'commodity' },
  
  // === AGRICULTURE (8) ===
  { ticker: 'DBA', name: 'Agriculture', category: 'commodity' },
  { ticker: 'CORN', name: 'Corn (Maïs)', category: 'commodity' },
  { ticker: 'WEAT', name: 'Wheat (Blé)', category: 'commodity' },
  { ticker: 'SOYB', name: 'Soybeans (Soja)', category: 'commodity' },
  { ticker: 'COW', name: 'Livestock (Bétail)', category: 'commodity' },
  { ticker: 'SGG', name: 'Sugar (Sucre)', category: 'commodity' },
  { ticker: 'JO', name: 'Coffee (Café)', category: 'commodity' },
  
  // === CRYPTO (8) ===
  { ticker: 'BTC-USD', name: 'Bitcoin', category: 'crypto' },
  { ticker: 'ETH-USD', name: 'Ethereum', category: 'crypto' },
  { ticker: 'BNB-USD', name: 'BNB', category: 'crypto' },
  { ticker: 'SOL-USD', name: 'Solana', category: 'crypto' },
  { ticker: 'XRP-USD', name: 'XRP', category: 'crypto' },
  { ticker: 'LINK-USD', name: 'Chainlink', category: 'crypto' },
  { ticker: 'LTC-USD', name: 'Litecoin', category: 'crypto' },
  { ticker: 'DOGE-USD', name: 'Dogecoin', category: 'crypto' },
  
  // === OBLIGATIONS (4) ===
  { ticker: 'TLT', name: 'Obligations 20Y+', category: 'bond' },
  { ticker: 'IEF', name: 'Obligations 7-10Y', category: 'bond' },
  { ticker: 'SHY', name: 'Obligations 1-3Y', category: 'bond' },
  { ticker: 'HYG', name: 'High Yield Bonds', category: 'bond' },
  
  // === DEVISES (2) ===
  { ticker: 'UUP', name: 'Dollar US', category: 'currency' },
  { ticker: 'FXY', name: 'Yen', category: 'currency' },
];

// Total : 65 assets

// =====================================
// FETCH FUNCTIONS
// =====================================

async function fetchYahooData(ticker: string): Promise<PriceData[]> {
  const end = Math.floor(Date.now() / 1000);
  const start = end - (730 * 24 * 60 * 60);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${start}&period2=${end}&interval=1d`;
  
  try {
    const response = await fetch(url);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Yahoo Finance returned non-JSON for ${ticker}`);
      return [];
    }
    
    if (!response.ok) {
      console.warn(`⚠️ Yahoo Finance HTTP ${response.status} for ${ticker}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      console.warn(`⚠️ No chart data for ${ticker}`);
      return [];
    }
    
    const timestamps = data.chart.result[0].timestamp;
    const closes = data.chart.result[0].indicators.quote[0].close;
    const volumes = data.chart.result[0].indicators.quote[0].volume;  // ✅ Volume
    
    if (!timestamps || !closes) {
      console.warn(`⚠️ Missing timestamps or closes for ${ticker}`);
      return [];
    }
    
    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      close: closes[i],
      volume: volumes?.[i] || undefined  // ✅ Volume (undefined si absent)
    })).filter((d: PriceData) => d.close !== null);
  } catch (error) {
    return [];
  }
}

async function fetchCoinGeckoData(coinId: string): Promise<PriceData[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=730&interval=daily`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) {
      throw new Error('No prices data');
    }
    
    return data.prices.map((p: [number, number]) => ({
      date: new Date(p[0]).toISOString().split('T')[0],
      close: p[1]
    }));
  } catch (error) {
    console.error(`❌ CoinGecko error for ${coinId}:`, error);
    return [];
  }
}

async function fetchPriceData(asset: Asset): Promise<PriceData[]> {
  console.log(`📡 Fetching ${asset.category === 'crypto' ? 'Crypto' : 'Yahoo'}: ${asset.ticker}`);
  
  if (asset.category === 'crypto') {
    if (asset.ticker.includes('-USD')) {
      return await fetchYahooData(asset.ticker);
    } else {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await fetchCoinGeckoData(asset.ticker);
    }
  } else {
    return await fetchYahooData(asset.ticker);
  }
}

// =====================================
// CALCULATION HELPERS
// =====================================

function calculatePerformance(data: PriceData[], days: number): number {
  if (data.length < days) return 0;
  const current = data[data.length - 1].close;
  const past = data[data.length - days].close;
  return ((current - past) / past) * 100;
}

function calculateMA(data: PriceData[], period: number): number {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, d) => acc + d.close, 0);
  return sum / period;
}

function calculateRSI(data: PriceData[], period: number = 14): number {
  if (data.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
  
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

// =====================================
// SCORE ACTUEL (Momentum Présent)
// =====================================

function calculateMomentumScore(data: PriceData[]): number {
  if (data.length < 250) return 50;
  
  const perf1M = calculatePerformance(data, 21);
  const perf3M = calculatePerformance(data, 63);
  const perf6M = calculatePerformance(data, 126);
  const perf12M = calculatePerformance(data, 252);
  
  const currentPrice = data[data.length - 1].close;
  const ma50 = calculateMA(data, 50);
  const ma200 = calculateMA(data, 200);
  
  let score = 50;
  
  if (perf1M > 0) score += 5;
  if (perf3M > 0) score += 10;
  if (perf6M > 0) score += 10;
  if (perf12M > 0) score += 10;
  
  if (currentPrice > ma50) score += 10;
  if (currentPrice > ma200) score += 5;
  if (ma50 > ma200) score += 10;
  
  return Math.min(Math.max(score, 0), 100);
}

function calculateVolatilityScore(data: PriceData[]): number {
  if (data.length < 30) return 50;
  
  const returns = [];
  for (let i = 1; i < data.length; i++) {
    const ret = (data[i].close - data[i-1].close) / data[i-1].close;
    returns.push(ret);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const annualizedVol = stdDev * Math.sqrt(252) * 100;
  
  if (annualizedVol < 15) return 90;
  if (annualizedVol < 25) return 70;
  if (annualizedVol < 40) return 50;
  return 30;
}

function calculateTrendScore(data: PriceData[]): number {
  if (data.length < 50) return 50;
  
  const currentPrice = data[data.length - 1].close;
  const ma20 = calculateMA(data, 20);
  const ma50 = calculateMA(data, 50);
  
  let score = 50;
  
  if (currentPrice > ma20 && ma20 > ma50) score = 90;
  else if (currentPrice > ma20) score = 70;
  else if (currentPrice < ma20 && ma20 < ma50) score = 10;
  else if (currentPrice < ma20) score = 30;
  
  return score;
}

function calculateSeasonalityScore(asset: Asset): number {
  const month = new Date().getMonth();
  
  const seasonality: Record<string, number[]> = {
    'GLD': [85, 75, 65, 55, 50, 50, 60, 70, 75, 80, 85, 90],
    'SPY': [70, 70, 65, 75, 85, 70, 70, 70, 60, 75, 85, 90],
    'TLT': [80, 75, 70, 65, 60, 65, 70, 75, 80, 80, 75, 80],
    'DBC': [60, 65, 70, 75, 80, 85, 85, 80, 75, 70, 65, 60],
  };
  
  const defaultSeasonality: Record<string, number[]> = {
    'equity': [70, 70, 65, 75, 85, 70, 70, 70, 60, 75, 85, 90],
    'commodity': [60, 65, 70, 75, 80, 85, 85, 80, 75, 70, 65, 60],
    'bond': [80, 75, 70, 65, 60, 65, 70, 75, 80, 80, 75, 80],
    'crypto': [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    'currency': [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  };
  
  return seasonality[asset.ticker]?.[month] || defaultSeasonality[asset.category][month];
}

// =====================================
// SCORE ÉMERGENT (10 Piliers - part of 13 total pillars in v2.1)
// =====================================

function calculateContrarianScore(data: PriceData[], momentum: number): number {
  const rsi = calculateRSI(data);
  
  if (rsi < 30 && momentum < 50) return 85;
  if (rsi > 70 && momentum > 70) return 30;
  if (rsi < 40 && momentum < 60) return 70;
  if (rsi > 60 && momentum > 60) return 40;
  
  return 50;
}

function calculateCatalystsScore(data: PriceData[]): number {
  if (data.length < 100) return 50;
  
  const currentPrice = data[data.length - 1].close;
  const ma50 = calculateMA(data, 50);
  const ma200 = calculateMA(data, 200);
  
  const distanceToMA50 = ((currentPrice - ma50) / ma50) * 100;
  const distanceToMA200 = ((currentPrice - ma200) / ma200) * 100;
  
  let score = 50;
  
  if (Math.abs(distanceToMA50) < 3 && currentPrice < ma50) score += 20;
  if (Math.abs(distanceToMA200) < 5 && currentPrice < ma200) score += 15;
  
  const recentVol = data.slice(-20);
  const olderVol = data.slice(-60, -20);
  const recentRange = Math.max(...recentVol.map(d => d.close)) - Math.min(...recentVol.map(d => d.close));
  const olderRange = Math.max(...olderVol.map(d => d.close)) - Math.min(...olderVol.map(d => d.close));
  
  if (recentRange < olderRange * 0.6) score += 15;
  
  return Math.min(score, 100);
}

function calculateTechnicalEarlyScore(data: PriceData[], momentum: number): number {
  const rsi = calculateRSI(data);
  const trend = calculateTrendScore(data);
  
  if (momentum < 50 && rsi > 50 && trend < 40) return 80;
  if (momentum > 70 && rsi < 55) return 25;
  if (momentum > 45 && momentum < 65 && rsi > 50) return 70;
  
  return 50;
}

function calculateRotationScore(asset: Asset, regime: string): number {
  const rotationMatrix: Record<string, Record<string, number>> = {
    'goldilocks': { 'equity': 85, 'commodity': 60, 'bond': 40, 'crypto': 75, 'currency': 50 },
    'reflation': { 'equity': 70, 'commodity': 90, 'bond': 35, 'crypto': 80, 'currency': 60 },
    'stagflation': { 'equity': 40, 'commodity': 85, 'bond': 70, 'crypto': 50, 'currency': 65 },
    'recession': { 'equity': 30, 'commodity': 40, 'bond': 90, 'crypto': 35, 'currency': 75 },
    'unknown': { 'equity': 50, 'commodity': 50, 'bond': 50, 'crypto': 50, 'currency': 50 },
  };
  
  return rotationMatrix[regime]?.[asset.category] || 50;
}

function calculateEarlySeasonalityScore(asset: Asset): number {
  const currentMonth = new Date().getMonth();
  const nextMonth = (currentMonth + 1) % 12;
  
  const seasonality: Record<string, number[]> = {
    'GLD': [85, 75, 65, 55, 50, 50, 60, 70, 75, 80, 85, 90],
    'SPY': [70, 70, 65, 75, 85, 70, 70, 70, 60, 75, 85, 90],
    'TLT': [80, 75, 70, 65, 60, 65, 70, 75, 80, 80, 75, 80],
  };
  
  const defaultSeasonality: Record<string, number[]> = {
    'equity': [70, 70, 65, 75, 85, 70, 70, 70, 60, 75, 85, 90],
    'commodity': [60, 65, 70, 75, 80, 85, 85, 80, 75, 70, 65, 60],
    'bond': [80, 75, 70, 65, 60, 65, 70, 75, 80, 80, 75, 80],
    'crypto': [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    'currency': [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  };
  
  return seasonality[asset.ticker]?.[nextMonth] || defaultSeasonality[asset.category][nextMonth];
}

async function calculateEmergentScore(
  data: PriceData[], 
  asset: Asset, 
  momentum: number,
  regime: string
): Promise<{ score: number; details: any }> {
  const contrarian = calculateContrarianScore(data, momentum);
  const catalysts = calculateCatalystsScore(data);
  const technicalEarly = calculateTechnicalEarlyScore(data, momentum);
  const rotation = calculateRotationScore(asset, regime);
  const seasonality = calculateEarlySeasonalityScore(asset);
  
  const positioning = getPositioningScore(asset.ticker);
  const positioningScore = positioning ? positioning.score : 50;
  
  const rsData = await calculateRelativeStrengthAuto(data);
  const relativeStrength = rsData.score;
  
  const ddData = calculateDrawdown(data, 252);
  const drawdownScore = ddData.score;
  
  const valuationData = await calculateValuationScoreV2(asset.ticker, asset.category);
  const valuationScore = valuationData.score;
  
  const macroData = calculateMacroRegionalScore(asset.ticker);
  const macroScore = macroData.score;
  
  const emergentScore = 
    (contrarian * 0.12) +
    (catalysts * 0.16) +
    (technicalEarly * 0.10) +
    (rotation * 0.08) +
    (seasonality * 0.05) +
    (positioningScore * 0.12) +
    (relativeStrength * 0.10) +
    (drawdownScore * 0.09) +
    (valuationScore * 0.10) +
    (macroScore * 0.08);
  
  return {
    score: Math.round(emergentScore),
    details: {
      contrarian: Math.round(contrarian),
      catalysts: Math.round(catalysts),
      technicalEarly: Math.round(technicalEarly),
      rotation: Math.round(rotation),
      seasonality: Math.round(seasonality),
      positioning: Math.round(positioningScore),
      relativeStrength: Math.round(relativeStrength),
      drawdown: Math.round(drawdownScore),
      valuation: Math.round(valuationScore),
      macroRegional: Math.round(macroScore),
    }
  };
}

// =====================================
// SCORE COMPOSITE V2.1
// =====================================

async function calculateV2Extension(
  data: PriceData[],
  technicalScore: number,
  emergentScore: number,
  ticker: string  // ✅ Ajout ticker pour fetch 13F
) {
  // Import dynamique des modules
  const { calculateInstitutionalFlows } = await import('./institutionalFlows');
  const { calculateFOMOAlert } = await import('./fomoAlert');
  const { calculateEntryTiming } = await import('./entryTiming');
  const { fetchInstitutionalFlowsCached, convertToInstitutionalScore, getMockInstitutionalFlows } = await import('./sec13fAPI');
  
  // 🔥 NOUVEAU: Fetch REAL institutional flows via API 13F
  let institutionalFlows: any;
  
  try {
    console.log(`🔍 Fetching real institutional flows for ${ticker}...`);
    const real13FData = await fetchInstitutionalFlowsCached(ticker);
    
    if (real13FData) {
      // ✅ Données 13F réelles disponibles
      institutionalFlows = convertToInstitutionalScore(real13FData);
      console.log(`✅ Using REAL 13F data for ${ticker}: ${institutionalFlows.score}/100`);
    } else {
      // ⚠️ Pas de données 13F, utiliser analyse volume
      console.log(`⚠️ No 13F data for ${ticker}, using volume analysis`);
      institutionalFlows = calculateInstitutionalFlows(data);
    }
  } catch (error) {
    // ❌ Erreur API, fallback sur analyse volume
    console.warn(`⚠️ 13F fetch error for ${ticker}, using volume analysis`);
    institutionalFlows = calculateInstitutionalFlows(data);
  }
  
  // Calcul des autres piliers v2.1
  const fomoAlert = calculateFOMOAlert(data);
  const entryTiming = calculateEntryTiming(data);
  
  // Breakdown de la nouvelle formule v2.1
  const breakdown = {
    technical: technicalScore * 0.30,      // 30%
    emergent: emergentScore * 0.40,        // 40%
    flows: institutionalFlows.score * 0.15, // 15% ✅ Maintenant avec vraies données 13F
    fomo: fomoAlert.score * 0.10,          // 10%
    timing: entryTiming.score * 0.05       // 5%
  };
  
  // Score composite v2.1
  const compositeV2 = 
    breakdown.technical +
    breakdown.emergent +
    breakdown.flows +
    breakdown.fomo +
    breakdown.timing;
  
  return {
    institutionalFlows,
    fomoAlert,
    entryTiming,
    compositeV2: Math.round(compositeV2 * 10) / 10,
    breakdownV2: breakdown
  };
}

// =====================================
// RECOMMENDATION
// =====================================

function getRecommendation(composite: number): 'ACCUMULATE' | 'WATCH' | 'HOLD' | 'TRIM' | 'AVOID' {
  if (composite >= 80) return 'ACCUMULATE';
  if (composite >= 65) return 'WATCH';
  if (composite >= 45) return 'HOLD';
  if (composite >= 30) return 'TRIM';
  return 'AVOID';
}

// =====================================
// MAIN SCORING FUNCTION
// =====================================

export async function calculateAssetScore(
  asset: Asset, 
  regime: string = 'unknown',
  liquidity?: LiquidityIndicators
): Promise<AssetScore> {
  const data = await fetchPriceData(asset);
  
  if (data.length === 0) {
    console.log(`⚠️ No data for ${asset.ticker}, returning zero score`);
    return {
      ticker: asset.ticker,
      name: asset.name,
      category: asset.category,
      score: 0,
      emergentScore: 0,
      momentum: 0,
      volatility: 0,
      trend: 0,
      lastPrice: 0,
      change1M: 0,
      change3M: 0,
      change6M: 0,
      recommendation: 'AVOID',
      confidence: 0,
      emergentDetails: {
        contrarian: 0,
        catalysts: 0,
        technicalEarly: 0,
        rotation: 0,
        seasonality: 0,
        positioning: 0,
      }
    };
  }
  
  const momentum = calculateMomentumScore(data);
  const volatility = calculateVolatilityScore(data);
  const trend = calculateTrendScore(data);
  const seasonality = calculateSeasonalityScore(asset);
  
  const technicalScore =
    (momentum * 0.50) + 
    (volatility * 0.25) + 
    (trend * 0.15) + 
    (seasonality * 0.10);
  
  let scoreActuel = technicalScore;
  
  if (liquidity) {
    scoreActuel = blendWithLiquidity(technicalScore, liquidity.liquidityScore);
  }
  
  const emergent = await calculateEmergentScore(data, asset, momentum, regime);
  
  // 🔥 OPTION 2 - NOUVELLE FORMULE V2.1
  const v2Extension = await calculateV2Extension(data, technicalScore, emergent.score, asset.ticker);
  
  // Préparer valuationInfo (async)
  const valData = await calculateValuationScoreV2(asset.ticker, asset.category);
  const valuationInfo = {
    score: valData.score,
    relativeValuation: valData.relativeValuation,
    currentPE: valData.metrics.currentPE,
    marketPE: valData.metrics.marketPE,
    explanation: valData.explanation,
  };
  
  // Score Composite v2.1
  const composite = v2Extension.compositeV2!;
  
  return {
    ticker: asset.ticker,
    name: asset.name,
    category: asset.category,
    score: v2Extension.compositeV2!,  // 🔥 NOUVEAU SCORE
    technicalScore: Math.round(technicalScore * 10) / 10,
    emergentScore: emergent.score,
    momentum: Math.round(momentum * 10) / 10,
    volatility: Math.round(volatility * 10) / 10,
    trend: Math.round(trend * 10) / 10,
    lastPrice: data[data.length - 1].close,
    change1M: calculatePerformance(data, 21),
    change3M: calculatePerformance(data, 63),
    change6M: calculatePerformance(data, 126),
    recommendation: getRecommendation(composite),
    confidence: Math.round(composite),
    emergentDetails: emergent.details,
    liquidityInfo: liquidity ? {
      score: liquidity.liquidityScore,
      regime: liquidity.regime,
      contribution: liquidity.liquidityScore * 0.35,
    } : undefined,
    positioningInfo: hasPositioningData(asset.ticker) ? (() => {
      const pos = getPositioningScore(asset.ticker);
      return pos ? {
        score: pos.score,
        signal: pos.signal,
        explanation: pos.explanation,
        confidence: pos.confidence,
        hasData: true,
      } : undefined;
    })() : undefined,
    relativeStrengthInfo: (() => {
      const rs = emergent.details.relativeStrength || 50;
      let signal = 'neutral';
      if (rs > 80) signal = 'very_strong';
      else if (rs > 65) signal = 'strong';
      else if (rs < 35) signal = 'weak';
      else if (rs < 20) signal = 'very_weak';
      return {
        score: rs,
        signal,
      };
    })(),
    drawdownInfo: (() => {
      const ddData = calculateDrawdown(data, 252);
      return {
        currentDrawdown: ddData.currentDrawdown,
        score: ddData.score,
        signal: ddData.signal,
        explanation: ddData.explanation,
      };
    })(),
    valuationInfo,  // ✅ Déjà calculé avec await avant le return
    macroRegionalInfo: (() => {
      const macroData = calculateMacroRegionalScore(asset.ticker);
      return {
        score: macroData.score,
        region: macroData.region,
        indicators: macroData.indicators,
        explanation: macroData.explanation,
      };
    })(),
    // 🔥 OPTION 2 - NOUVEAUX PILIERS + BREAKDOWN
    institutionalFlows: v2Extension.institutionalFlows,
    fomoAlert: v2Extension.fomoAlert,
    entryTiming: v2Extension.entryTiming,
    breakdownV2: v2Extension.breakdownV2,
  };
}

export async function calculateAllScores(): Promise<AssetScore[]> {
  console.log(`🚀 Starting calculation for ${ASSETS.length} assets...`);
  
  const { detectMacroRegime } = await import('./advancedScoring');
  const macroRegime = await detectMacroRegime();
  const regime = macroRegime.type;
  
  console.log(`📊 Macro Regime: ${regime}`);
  
  console.log('💰 Fetching global liquidity...');
  const liquidity = await calculateGlobalLiquidity();
  console.log(`💰 Liquidity: ${liquidity.regime} (${liquidity.liquidityScore}/100)`);
  
  const scores = await Promise.all(
    ASSETS.map(asset => calculateAssetScore(asset, regime, liquidity))
  );
  
  console.log(`✅ Calculation complete! ${scores.filter(s => s.score > 0).length} assets with data`);
  
  return scores.sort((a, b) => {
    // 🔥 OPTION 2 - TRI PAR NOUVEAU SCORE
    return b.score - a.score;
  });
}