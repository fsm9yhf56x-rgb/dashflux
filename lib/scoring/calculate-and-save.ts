// lib/scoring/calculate-and-save.ts
// Helper pour DashFlux : Calcule et sauvegarde les scores

import { AssetScore } from '@/lib/db/scores-db';

export interface DashFluxAsset {
  symbol: string;
  category: string;
  
  // Données pour calcul
  technicalIndicators?: {
    momentum1m?: number;
    momentum3m?: number;
    momentum6m?: number;
    volatility?: number;
    rsi?: number;
    macd?: number;
  };
  
  flows?: {
    etfFlows?: number;
    institutionalFlows?: number;
  };
  
  macro?: {
    regime?: string;
    correlation?: number;
  };
  
  valuation?: {
    pe?: number;
    pbv?: number;
  };
  
  sentiment?: {
    newsScore?: number;
    socialScore?: number;
  };
  
  seasonality?: {
    monthScore?: number;
  };
  
  price?: number;
  change24h?: number;
}

/**
 * Calcule le score technique (0-100)
 */
function calculateTechnicalScore(asset: DashFluxAsset): number {
  const indicators = asset.technicalIndicators;
  if (!indicators) return 50;

  let score = 50;

  // Momentum (40%)
  if (indicators.momentum1m !== undefined) {
    score += (indicators.momentum1m > 0 ? 10 : -10);
  }
  if (indicators.momentum3m !== undefined) {
    score += (indicators.momentum3m > 0 ? 15 : -15);
  }
  if (indicators.momentum6m !== undefined) {
    score += (indicators.momentum6m > 0 ? 15 : -15);
  }

  // RSI (30%)
  if (indicators.rsi !== undefined) {
    if (indicators.rsi < 30) score += 15; // Oversold = bon pour achat
    else if (indicators.rsi > 70) score -= 15; // Overbought = mauvais
    else score += 5; // Neutre
  }

  // Volatilité (30%)
  if (indicators.volatility !== undefined) {
    if (indicators.volatility < 15) score += 15; // Faible vol = bon
    else if (indicators.volatility > 40) score -= 10; // Haute vol = risque
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calcule le score flows (0-100)
 */
function calculateFlowsScore(asset: DashFluxAsset): number {
  const flows = asset.flows;
  if (!flows) return 50;

  let score = 50;

  // ETF flows (50%)
  if (flows.etfFlows !== undefined) {
    score += flows.etfFlows > 0 ? 25 : -25;
  }

  // Institutional flows (50%)
  if (flows.institutionalFlows !== undefined) {
    score += flows.institutionalFlows > 0 ? 25 : -25;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calcule le score macro (0-100)
 */
function calculateMacroScore(asset: DashFluxAsset): number {
  const macro = asset.macro;
  if (!macro) return 50;

  let score = 50;

  // Régime favorable selon catégorie
  if (macro.regime) {
    const favorableRegimes: Record<string, string[]> = {
      'crypto': ['goldilocks', 'reflation'],
      'tech': ['goldilocks'],
      'gold': ['stagflation', 'recession'],
      'bonds': ['recession']
    };

    const category = asset.category.toLowerCase();
    if (favorableRegimes[category]?.includes(macro.regime)) {
      score += 30;
    } else {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calcule le score final (pondéré)
 */
function calculateFinalScore(
  technical: number,
  flows: number,
  macro: number,
  valuation: number,
  sentiment: number,
  seasonality: number
): number {
  // Pondérations selon méthodologie Steffan
  const weights = {
    technical: 0.25,
    flows: 0.20,
    macro: 0.30,
    valuation: 0.10,
    sentiment: 0.10,
    seasonality: 0.05
  };

  return (
    technical * weights.technical +
    flows * weights.flows +
    macro * weights.macro +
    valuation * weights.valuation +
    sentiment * weights.sentiment +
    seasonality * weights.seasonality
  );
}

/**
 * Calcule les scores pour tous les actifs
 */
export function calculateScores(assets: DashFluxAsset[]): AssetScore[] {
  const timestamp = Date.now();

  return assets.map(asset => {
    // Calcul des scores par pilier
    const technicalScore = calculateTechnicalScore(asset);
    const flowsScore = calculateFlowsScore(asset);
    const macroScore = calculateMacroScore(asset);
    const valuationScore = 50; // À implémenter
    const sentimentScore = asset.sentiment?.newsScore || 50;
    const seasonalityScore = asset.seasonality?.monthScore || 50;

    // Score final
    const finalScore = calculateFinalScore(
      technicalScore,
      flowsScore,
      macroScore,
      valuationScore,
      sentimentScore,
      seasonalityScore
    );

    return {
      symbol: asset.symbol,
      score: Math.round(finalScore * 10) / 10,
      
      technicalScore: Math.round(technicalScore * 10) / 10,
      flowsScore: Math.round(flowsScore * 10) / 10,
      macroScore: Math.round(macroScore * 10) / 10,
      valuationScore: Math.round(valuationScore * 10) / 10,
      sentimentScore: Math.round(sentimentScore * 10) / 10,
      seasonalityScore: Math.round(seasonalityScore * 10) / 10,
      
      momentum1m: asset.technicalIndicators?.momentum1m,
      momentum3m: asset.technicalIndicators?.momentum3m,
      momentum6m: asset.technicalIndicators?.momentum6m,
      volatility: asset.technicalIndicators?.volatility,
      
      regime: asset.macro?.regime,
      category: asset.category,
      
      lastUpdated: timestamp,
      price: asset.price,
      change24h: asset.change24h
    };
  });
}

/**
 * Sauvegarde les scores via API
 */
export async function saveScoresToAPI(scores: AssetScore[]): Promise<boolean> {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores })
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving scores:', error);
    return false;
  }
}

/**
 * Fonction principale : Calcule ET sauvegarde
 */
export async function calculateAndSaveScores(assets: DashFluxAsset[]): Promise<{
  success: boolean;
  count: number;
  topScores: AssetScore[];
}> {
  // Calcul
  const scores = calculateScores(assets);

  // Sauvegarde
  const success = await saveScoresToAPI(scores);

  // Top 10
  const topScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    success,
    count: scores.length,
    topScores
  };
}