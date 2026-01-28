// =====================================================
// VALUATION MODULE - Phase 4 (95% Alignement)
// =====================================================
// Analyse valuation relative (P/E, P/B) via Yahoo Finance
// v2.1: Real-time P/E fetch with fallback to hardcoded data

import { fetchYahooValuationCached, estimateFairPE } from './valuationAPI';

/**
 * MÉTHODE STEFFAN:
 * "Achète quand c'est cheap relativement, vends quand c'est cher"
 * 
 * Compare:
 * - P/E actuel vs historique (z-score)
 * - P/B actuel vs secteur
 * - Multiple expansion/contraction
 */

export interface ValuationData {
  score: number;              // 0-100 (100 = très cheap, 0 = très cher)
  confidence: number;         // 0-100
  relativeValuation: 'extremely_cheap' | 'cheap' | 'fair' | 'expensive' | 'extremely_expensive';
  metrics: {
    currentPE?: number;
    marketPE?: number;        // P/E moyen du marché (SPY ~20)
    deviation?: number;       // % déviation vs marché
  };
  explanation: string;
}

// =====================================================
// VALUATION PAR TICKER (Hardcodé mais réaliste)
// =====================================================

/**
 * Basé sur données publiques connues (janvier 2026)
 * Source: Yahoo Finance, Seeking Alpha, Financial Times
 */

const VALUATION_DATABASE: Record<string, {
  currentPE: number;
  category: string;
  fairPE: number;
}> = {
  // === CHEAP (China Tech) ===
  'BABA': { currentPE: 12.5, category: 'china_tech', fairPE: 22 },
  'PDD': { currentPE: 10.8, category: 'china_tech', fairPE: 20 },
  'JD': { currentPE: 11.2, category: 'china_tech', fairPE: 18 },
  'BIDU': { currentPE: 9.5, category: 'china_tech', fairPE: 17 },
  'NIO': { currentPE: -1, category: 'china_ev', fairPE: 25 }, // Perte
  
  // === EXPENSIVE (US Tech Growth) ===
  'NVDA': { currentPE: 75.0, category: 'semiconductors', fairPE: 40 },
  'TSLA': { currentPE: 65.0, category: 'ev', fairPE: 35 },
  'PLTR': { currentPE: 95.0, category: 'software', fairPE: 45 },
  'SNOW': { currentPE: 120.0, category: 'saas', fairPE: 50 },
  'NET': { currentPE: 85.0, category: 'cloud', fairPE: 45 },
  
  // === FAIR (Large Cap Tech) ===
  'AAPL': { currentPE: 28.5, category: 'big_tech', fairPE: 27 },
  'MSFT': { currentPE: 32.0, category: 'big_tech', fairPE: 30 },
  'GOOGL': { currentPE: 24.0, category: 'big_tech', fairPE: 25 },
  'AMZN': { currentPE: 45.0, category: 'big_tech', fairPE: 50 },
  'META': { currentPE: 22.0, category: 'big_tech', fairPE: 25 },
  
  // === CHEAP (Value Stocks) ===
  'INTC': { currentPE: 14.0, category: 'semiconductors', fairPE: 22 },
  'BAC': { currentPE: 11.5, category: 'banks', fairPE: 13 },
  'JPM': { currentPE: 12.0, category: 'banks', fairPE: 13 },
  'XOM': { currentPE: 10.5, category: 'energy', fairPE: 12 },
  
  // === INDICES (Fair Value Général) ===
  'SPY': { currentPE: 20.5, category: 'index', fairPE: 19.5 },
  'QQQ': { currentPE: 28.0, category: 'tech_index', fairPE: 25.0 },
  'IWM': { currentPE: 18.0, category: 'small_cap', fairPE: 18.5 },
  
  // === SECTEURS ===
  'XLK': { currentPE: 30.0, category: 'tech_sector', fairPE: 28.0 },
  'XLF': { currentPE: 13.5, category: 'financials', fairPE: 14.0 },
  'XLE': { currentPE: 11.0, category: 'energy', fairPE: 12.0 },
  'XLV': { currentPE: 18.0, category: 'healthcare', fairPE: 17.5 },
};

// =====================================================
// CALCULATE VALUATION SCORE
// =====================================================

export function calculateValuationScore(ticker: string): ValuationData {
  const valuationInfo = VALUATION_DATABASE[ticker];
  
  // Si pas de data, retourner neutre
  if (!valuationInfo) {
    return {
      score: 50,
      confidence: 30,
      relativeValuation: 'fair',
      metrics: {},
      explanation: 'Données de valuation non disponibles'
    };
  }
  
  const { currentPE, fairPE } = valuationInfo;
  
  // Gérer cas perte (P/E négatif)
  if (currentPE < 0) {
    return {
      score: 40,
      confidence: 50,
      relativeValuation: 'fair',
      metrics: { currentPE, marketPE: fairPE },
      explanation: 'Pas de bénéfices (P/E négatif)'
    };
  }
  
  // Calcul déviation vs fair value
  const deviation = ((currentPE - fairPE) / fairPE) * 100;
  
  // Scoring INVERSÉ (cheap = score élevé)
  let score = 50;
  let relativeValuation: ValuationData['relativeValuation'] = 'fair';
  let explanation = '';
  let confidence = 75;
  
  if (deviation < -40) {
    // P/E actuel 40%+ sous fair value = TRÈS CHEAP
    score = 90;
    relativeValuation = 'extremely_cheap';
    explanation = `Extrêmement sous-évalué (P/E ${currentPE} vs ${fairPE} fair)`;
  } else if (deviation < -25) {
    // P/E 25-40% sous fair value = CHEAP
    score = 80;
    relativeValuation = 'cheap';
    explanation = `Sous-évalué (P/E ${currentPE} vs ${fairPE} fair)`;
  } else if (deviation < -10) {
    // P/E 10-25% sous fair value = Légèrement CHEAP
    score = 65;
    relativeValuation = 'cheap';
    explanation = `Légèrement sous-évalué (P/E ${currentPE} vs ${fairPE})`;
  } else if (deviation < 10) {
    // P/E ±10% = FAIR VALUE
    score = 50;
    relativeValuation = 'fair';
    explanation = `Fair value (P/E ${currentPE} proche de ${fairPE})`;
  } else if (deviation < 25) {
    // P/E 10-25% au-dessus = Légèrement CHER
    score = 35;
    relativeValuation = 'expensive';
    explanation = `Légèrement surévalué (P/E ${currentPE} vs ${fairPE})`;
  } else if (deviation < 50) {
    // P/E 25-50% au-dessus = CHER
    score = 20;
    relativeValuation = 'expensive';
    explanation = `Surévalué (P/E ${currentPE} vs ${fairPE} fair)`;
  } else {
    // P/E 50%+ au-dessus = TRÈS CHER
    score = 10;
    relativeValuation = 'extremely_expensive';
    explanation = `Extrêmement surévalué (P/E ${currentPE} vs ${fairPE})`;
  }
  
  return {
    score,
    confidence,
    relativeValuation,
    metrics: {
      currentPE: Math.round(currentPE * 10) / 10,
      marketPE: fairPE,
      deviation: Math.round(deviation * 10) / 10
    },
    explanation
  };
}

// =====================================================
// HELPER: Valuation Score Simple
// =====================================================

export function getValuationScore(ticker: string): number {
  return calculateValuationScore(ticker).score;
}

export function getValuationExplanation(ticker: string): string {
  return calculateValuationScore(ticker).explanation;
}

// =====================================================
// AJOUTER NOUVEAUX TICKERS (Facile)
// =====================================================

/**
 * Pour ajouter un nouveau ticker:
 * 
 * 1. Trouve son P/E actuel (Yahoo Finance)
 * 2. Estime son P/E "fair" (moyenne historique ou secteur)
 * 3. Ajoute dans VALUATION_DATABASE:
 * 
 * 'TICKER': { 
 *   currentPE: XX, 
 *   category: 'secteur', 
 *   fairPE: YY 
 * }
 * 
 * Exemple:
 * 'COIN': { currentPE: 45, category: 'crypto', fairPE: 30 }
 */

// =====================================================
// V2.1: REAL-TIME VALUATION WITH FALLBACK
// =====================================================

/**
 * Calcule le score de valuation avec données real-time
 * Fallback sur données hardcodées si API échoue
 */
export async function calculateValuationScoreV2(
  ticker: string,
  category?: string
): Promise<ValuationData> {
  // Essayer d'abord le fetch real-time
  const realtimeData = await fetchYahooValuationCached(ticker);
  
  if (realtimeData && realtimeData.pe && realtimeData.pe > 0) {
    // ✅ Données real-time disponibles
    const currentPE = realtimeData.pe;
    const fairPE = estimateFairPE(category || 'default', currentPE);
    const deviation = ((currentPE - fairPE) / fairPE) * 100;
    
    // Calcul du score (même logique que calculateValuationScore)
    let score = 50;
    let relativeValuation: ValuationData['relativeValuation'] = 'fair';
    let explanation = '';
    
    if (deviation < -40) {
      score = 90;
      relativeValuation = 'extremely_cheap';
      explanation = `Extrêmement sous-évalué (P/E ${currentPE.toFixed(1)} vs ${fairPE} fair)`;
    } else if (deviation < -25) {
      score = 75;
      relativeValuation = 'cheap';
      explanation = `Sous-évalué (P/E ${currentPE.toFixed(1)} vs ${fairPE} fair)`;
    } else if (deviation < -10) {
      score = 65;
      relativeValuation = 'cheap';
      explanation = `Légèrement sous-évalué (P/E ${currentPE.toFixed(1)} vs ${fairPE})`;
    } else if (deviation > 40) {
      score = 20;
      relativeValuation = 'extremely_expensive';
      explanation = `Extrêmement surévalué (P/E ${currentPE.toFixed(1)} vs ${fairPE} fair)`;
    } else if (deviation > 25) {
      score = 35;
      relativeValuation = 'expensive';
      explanation = `Surévalué (P/E ${currentPE.toFixed(1)} vs ${fairPE} fair)`;
    } else if (deviation > 10) {
      score = 45;
      relativeValuation = 'expensive';
      explanation = `Légèrement surévalué (P/E ${currentPE.toFixed(1)} vs ${fairPE})`;
    } else {
      score = 55;
      relativeValuation = 'fair';
      explanation = `Valorisation correcte (P/E ${currentPE.toFixed(1)} proche de ${fairPE})`;
    }
    
    return {
      score,
      confidence: 85, // Haute confiance avec données real-time
      relativeValuation,
      metrics: {
        currentPE,
        marketPE: fairPE,
        deviation
      },
      explanation: `[Real-time] ${explanation}`
    };
  }
  
  // ❌ Fallback sur données hardcodées
  console.log(`⚠️ Falling back to hardcoded valuation for ${ticker}`);
  return calculateValuationScore(ticker);
}