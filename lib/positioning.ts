// =====================================================
// POSITIONING MODULE - Méthode Steffan
// =====================================================
// Analyse le positionnement des investisseurs via COT Reports

/**
 * POURQUOI C'EST CRITIQUE ?
 * 
 * Rodolphe Steffan : "Quand tout le monde est positionné dans le même sens,
 *                     c'est souvent le moment de faire l'inverse"
 * 
 * Positionnement extrême = Signal de retournement
 */

export interface PositioningData {
  ticker: string;
  commercialNet: number;    // Position nette hedgers (smart money)
  speculatorNet: number;    // Position nette speculators (dumb money)
  commercialLong: number;
  commercialShort: number;
  speculatorLong: number;
  speculatorShort: number;
  lastUpdate: string;
}

export interface PositioningAnalysis {
  score: number;            // Score 0-100
  signal: 'extreme_bullish' | 'extreme_bearish' | 'bullish' | 'bearish' | 'neutral';
  explanation: string;
  confidence: number;       // 0-100
  details: {
    commercialPosition: 'long' | 'short' | 'neutral';
    speculatorPosition: 'long' | 'short' | 'neutral';
    contrarian: boolean;
  };
}

// =====================================================
// MAPPING ASSETS → COT CODES
// =====================================================

const ASSET_TO_COT: Record<string, { code: string; name: string }> = {
  // Métaux précieux
  'GLD': { code: '088691', name: 'Gold' },
  'SLV': { code: '084691', name: 'Silver' },
  
  // Énergie
  'USO': { code: '067651', name: 'Crude Oil WTI' },
  'BNO': { code: '067651', name: 'Crude Oil Brent' },
  'UNG': { code: '023651', name: 'Natural Gas' },
  
  // Indices (E-mini futures)
  'SPY': { code: '13874A', name: 'E-mini S&P 500' },
  'QQQ': { code: '209742', name: 'E-mini Nasdaq' },
  
  // Devises
  'UUP': { code: '098662', name: 'US Dollar Index' },
  'FXE': { code: '099741', name: 'Euro FX' },
  'FXY': { code: '097741', name: 'Japanese Yen' },
  'FXB': { code: '096742', name: 'British Pound' },
  
  // Commodités
  'DBC': { code: '001612', name: 'Corn' }, // Proxy commodities
  'DBA': { code: '002602', name: 'Wheat' }, // Proxy agriculture
};

// =====================================================
// COT DATA MOCK (À REMPLACER PAR VRAIE API)
// =====================================================

/**
 * En production, fetcher depuis :
 * https://www.cftc.gov/dea/futures/deacmxsf.htm
 * 
 * Pour l'instant, données simulées basées sur patterns réels
 */
function getMockCOTData(ticker: string): PositioningData | null {
  const cotInfo = ASSET_TO_COT[ticker];
  if (!cotInfo) return null;
  
  // Données simulées réalistes
  const mockData: Record<string, Partial<PositioningData>> = {
    'GLD': {
      commercialLong: 250000,
      commercialShort: 150000,
      speculatorLong: 120000,
      speculatorShort: 180000,
    },
    'SPY': {
      commercialLong: 180000,
      commercialShort: 220000,
      speculatorLong: 350000,
      speculatorShort: 280000,
    },
    'USO': {
      commercialLong: 420000,
      commercialShort: 380000,
      speculatorLong: 180000,
      speculatorShort: 220000,
    },
  };
  
  const base = mockData[ticker] || {
    commercialLong: 200000,
    commercialShort: 180000,
    speculatorLong: 150000,
    speculatorShort: 160000,
  };
  
  return {
    ticker,
    commercialLong: base.commercialLong!,
    commercialShort: base.commercialShort!,
    speculatorLong: base.speculatorLong!,
    speculatorShort: base.speculatorShort!,
    commercialNet: base.commercialLong! - base.commercialShort!,
    speculatorNet: base.speculatorLong! - base.speculatorShort!,
    lastUpdate: new Date().toISOString(),
  };
}

// =====================================================
// ANALYSE POSITIONNEMENT
// =====================================================

export function analyzePositioning(data: PositioningData): PositioningAnalysis {
  const { commercialNet, speculatorNet } = data;
  
  // Calcul positions relatives (simplifié)
  const totalCommercial = data.commercialLong + data.commercialShort;
  const totalSpeculator = data.speculatorLong + data.speculatorShort;
  
  const commercialNetPct = (commercialNet / totalCommercial) * 100;
  const speculatorNetPct = (speculatorNet / totalSpeculator) * 100;
  
  // Déterminer positions
  let commercialPosition: 'long' | 'short' | 'neutral' = 'neutral';
  if (commercialNetPct > 15) commercialPosition = 'long';
  else if (commercialNetPct < -15) commercialPosition = 'short';
  
  let speculatorPosition: 'long' | 'short' | 'neutral' = 'neutral';
  if (speculatorNetPct > 15) speculatorPosition = 'long';
  else if (speculatorNetPct < -15) speculatorPosition = 'short';
  
  // =====================================================
  // SCORING ALGORITHM (Méthode Steffan)
  // =====================================================
  
  let score = 50; // Base neutre
  let signal: PositioningAnalysis['signal'] = 'neutral';
  let explanation = '';
  let confidence = 50;
  
  // Règle 1 : Smart money (hedgers) fortement long = BULLISH
  if (commercialPosition === 'long' && Math.abs(commercialNetPct) > 20) {
    score += 30;
    signal = 'extreme_bullish';
    explanation = 'Smart money accumule (très bullish)';
    confidence = 85;
  }
  // Règle 2 : Smart money fortement short = BEARISH
  else if (commercialPosition === 'short' && Math.abs(commercialNetPct) > 20) {
    score -= 30;
    signal = 'extreme_bearish';
    explanation = 'Smart money distribue (très bearish)';
    confidence = 85;
  }
  
  // Règle 3 : CONTRARIAN - Speculators trop long = BEARISH
  if (speculatorPosition === 'long' && Math.abs(speculatorNetPct) > 25) {
    score -= 25;
    signal = signal === 'extreme_bullish' ? 'neutral' : 'extreme_bearish';
    explanation = 'Speculators trop optimistes (contrarian bearish)';
    confidence = 75;
  }
  // Règle 4 : CONTRARIAN - Speculators trop short = BULLISH
  else if (speculatorPosition === 'short' && Math.abs(speculatorNetPct) > 25) {
    score += 25;
    signal = signal === 'extreme_bearish' ? 'neutral' : 'extreme_bullish';
    explanation = 'Speculators trop pessimistes (contrarian bullish)';
    confidence = 75;
  }
  
  // Règle 5 : Divergence smart money vs speculators (FORT SIGNAL)
  const contrarian = (commercialPosition === 'long' && speculatorPosition === 'short') ||
                     (commercialPosition === 'short' && speculatorPosition === 'long');
  
  if (contrarian) {
    if (commercialPosition === 'long') {
      score += 20;
      signal = 'extreme_bullish';
      explanation = 'Divergence: Smart money long, Speculators short (très bullish)';
      confidence = 90;
    } else {
      score -= 20;
      signal = 'extreme_bearish';
      explanation = 'Divergence: Smart money short, Speculators long (très bearish)';
      confidence = 90;
    }
  }
  
  // Cap score 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Ajuster signal selon score final
  if (!contrarian) {
    if (score > 70) signal = 'bullish';
    else if (score > 55) signal = 'neutral';
    else if (score > 35) signal = 'bearish';
  }
  
  return {
    score,
    signal,
    explanation: explanation || 'Positionnement neutre',
    confidence,
    details: {
      commercialPosition,
      speculatorPosition,
      contrarian,
    },
  };
}

// =====================================================
// FONCTION PRINCIPALE
// =====================================================

export function getPositioningScore(ticker: string): PositioningAnalysis | null {
  // Vérifier si l'actif a des COT data
  if (!ASSET_TO_COT[ticker]) {
    return null; // Pas de données COT pour cet actif
  }
  
  // Fetch COT data (mock pour l'instant)
  const data = getMockCOTData(ticker);
  
  if (!data) return null;
  
  // Analyser
  return analyzePositioning(data);
}

// =====================================================
// AJUSTEMENT SCORE ÉMERGENT
// =====================================================

export function applyPositioningAdjustment(
  baseEmergentScore: number,
  positioning: PositioningAnalysis
): number {
  // Positionnement influence le score émergent (25% selon Steffan)
  const adjustedScore = (baseEmergentScore * 0.75) + (positioning.score * 0.25);
  
  return Math.max(0, Math.min(100, adjustedScore));
}

// =====================================================
// HELPERS
// =====================================================

export function hasPositioningData(ticker: string): boolean {
  return ticker in ASSET_TO_COT;
}

export function getAvailablePositioningAssets(): string[] {
  return Object.keys(ASSET_TO_COT);
}

// =====================================================
// INTÉGRATION REAL COT API v2.1
// =====================================================

import { fetchCFTCDataCached, convertCFTCToPositioning } from './cotAPIReal';

/**
 * Fetch real COT data from CFTC API
 * Fallback to mock data if API fails
 */
export async function fetchRealCOTData(ticker: string): Promise<PositioningData | null> {
  // Essayer d'abord l'API CFTC
  try {
    const cftcData = await fetchCFTCDataCached(ticker);
    
    if (cftcData) {
      // ✅ Données real-time disponibles
      console.log(`✅ Using real COT data for ${ticker}`);
      return convertCFTCToPositioning(cftcData);
    }
  } catch (error) {
    console.warn(`⚠️ CFTC fetch failed for ${ticker}:`, error);
  }
  
  // ❌ Fallback sur données mock
  console.log(`⚠️ Using mock COT data for ${ticker}`);
  return getMockCOTData(ticker);
}