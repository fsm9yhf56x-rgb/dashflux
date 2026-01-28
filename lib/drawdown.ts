// =====================================================
// DRAWDOWN MODULE - Méthode Steffan
// =====================================================
// Analyse la distance au plus haut historique

import { PriceData } from './types';

/**
 * MÉTHODE STEFFAN:
 * "Achète quand c'est loin du plus haut (drawdown > 20%)"
 * "Méfie-toi quand c'est proche des ATH (drawdown < 5%)"
 * 
 * Drawdown = (Prix Actuel - Plus Haut) / Plus Haut × 100
 * 
 * Scoring CONTRARIAN:
 * Drawdown < -5% = Proche ATH = Prudence (score 45)
 * Drawdown -5% à -10% = Léger recul = Neutre (score 55)
 * Drawdown -10% à -15% = Correction = Intéressant (score 65)
 * Drawdown -15% à -20% = Forte correction = Opportunité (score 75)
 * Drawdown -20% à -30% = Bear market = Forte opportunité (score 85)
 * Drawdown > -30% = Crash = Opportunité extrême (score 90)
 */

export interface DrawdownData {
  currentDrawdown: number;      // % depuis ATH (négatif)
  ath: number;                  // Prix plus haut
  athDate: string;              // Date du ATH
  daysSinceATH: number;         // Jours depuis ATH
  currentPrice: number;         // Prix actuel
  score: number;                // 0-100 (contrarian)
  signal: 'extreme_opportunity' | 'strong_opportunity' | 'opportunity' | 'interesting' | 'neutral' | 'caution';
  explanation: string;
}

// =====================================================
// CALCULATE DRAWDOWN
// =====================================================

export function calculateDrawdown(
  data: PriceData[],
  period: number = 252  // 1 an par défaut
): DrawdownData {
  // Valeurs par défaut si pas assez de données
  if (data.length < 21) {
    const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;
    return {
      currentDrawdown: 0,
      ath: currentPrice,
      athDate: data.length > 0 ? data[data.length - 1].date : '',
      daysSinceATH: 0,
      currentPrice,
      score: 50,
      signal: 'neutral',
      explanation: 'Pas assez de données historiques'
    };
  }
  
  // Prendre période demandée (max 1 an ou disponible)
  const lookbackData = data.slice(-Math.min(period, data.length));
  
  // Trouver le plus haut
  let ath = lookbackData[0].close;
  let athIndex = 0;
  
  lookbackData.forEach((d, i) => {
    if (d.close > ath) {
      ath = d.close;
      athIndex = i;
    }
  });
  
  const athDate = lookbackData[athIndex].date;
  const daysSinceATH = lookbackData.length - athIndex - 1;
  
  // Prix actuel
  const currentPrice = data[data.length - 1].close;
  
  // Drawdown en %
  const drawdown = ((currentPrice - ath) / ath) * 100;
  
  // Scoring CONTRARIAN (grand drawdown = opportunité)
  let score = 50;
  let signal: DrawdownData['signal'] = 'neutral';
  let explanation = '';
  
  if (drawdown > -5) {
    score = 45;
    signal = 'caution';
    explanation = `Proche du plus haut (${drawdown.toFixed(1)}%) - Prudence`;
  } else if (drawdown > -10) {
    score = 55;
    signal = 'neutral';
    explanation = `Léger recul depuis ATH (${drawdown.toFixed(1)}%)`;
  } else if (drawdown > -15) {
    score = 65;
    signal = 'interesting';
    explanation = `Correction ${Math.abs(drawdown).toFixed(1)}% - Intéressant`;
  } else if (drawdown > -20) {
    score = 75;
    signal = 'opportunity';
    explanation = `Correction ${Math.abs(drawdown).toFixed(1)}% - Opportunité`;
  } else if (drawdown > -30) {
    score = 85;
    signal = 'strong_opportunity';
    explanation = `Bear market ${Math.abs(drawdown).toFixed(1)}% - Forte opportunité`;
  } else {
    score = 90;
    signal = 'extreme_opportunity';
    explanation = `Crash ${Math.abs(drawdown).toFixed(1)}% - Opportunité extrême`;
  }
  
  return {
    currentDrawdown: Math.round(drawdown * 100) / 100,
    ath: Math.round(ath * 100) / 100,
    athDate,
    daysSinceATH,
    currentPrice: Math.round(currentPrice * 100) / 100,
    score,
    signal,
    explanation
  };
}

// =====================================================
// CALCULATE MULTIPLE PERIODS
// =====================================================

export interface MultiPeriodDrawdown {
  drawdown3M: DrawdownData;   // 3 mois
  drawdown6M: DrawdownData;   // 6 mois
  drawdown1Y: DrawdownData;   // 1 an
  drawdown2Y: DrawdownData;   // 2 ans
  worstDrawdown: DrawdownData; // Le pire
  averageScore: number;        // Score moyen
}

export function calculateMultiPeriodDrawdown(
  data: PriceData[]
): MultiPeriodDrawdown {
  const drawdown3M = calculateDrawdown(data, 63);
  const drawdown6M = calculateDrawdown(data, 126);
  const drawdown1Y = calculateDrawdown(data, 252);
  const drawdown2Y = calculateDrawdown(data, 504);
  
  // Identifier le pire drawdown
  const drawdowns = [drawdown3M, drawdown6M, drawdown1Y, drawdown2Y];
  const worstDrawdown = drawdowns.reduce((worst, current) => 
    current.currentDrawdown < worst.currentDrawdown ? current : worst
  );
  
  // Score moyen pondéré (1Y a plus de poids)
  const averageScore = (
    (drawdown3M.score * 0.15) +
    (drawdown6M.score * 0.25) +
    (drawdown1Y.score * 0.40) +
    (drawdown2Y.score * 0.20)
  );
  
  return {
    drawdown3M,
    drawdown6M,
    drawdown1Y,
    drawdown2Y,
    worstDrawdown,
    averageScore: Math.round(averageScore)
  };
}

// =====================================================
// HELPER: Drawdown simplifié (1Y par défaut)
// =====================================================

export function getDrawdownScore(data: PriceData[]): number {
  const dd = calculateDrawdown(data, 252); // 1 an
  return dd.score;
}

export function getDrawdownExplanation(data: PriceData[]): string {
  const dd = calculateDrawdown(data, 252);
  return dd.explanation;
}
