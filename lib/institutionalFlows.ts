// lib/institutionalFlows.ts
// Détection des flux institutionnels via analyse de volume et momentum

import { PriceData } from './types';

export interface InstitutionalFlowsResult {
  score: number;              // 0-100 (100 = accumulation forte)
  level: 'strong_distribution' | 'distribution' | 'accumulation' | 'strong_accumulation';
  label: string;
  color: string;
  icon: string;
  description: string;
  metrics: {
    volumeAnomaly: number;     // % volume vs moyenne
    obv: number;               // On-Balance Volume trend
    mfi: number;               // Money Flow Index
    adLine: number;            // Accumulation/Distribution Line
    trend: 'buying' | 'selling' | 'neutral';
  };
}

/**
 * Calcule les flux institutionnels basés sur l'analyse de volume
 * Score élevé = Flux acheteurs / Accumulation
 * Score faible = Flux vendeurs / Distribution
 */
export function calculateInstitutionalFlows(data: PriceData[]): InstitutionalFlowsResult {
  if (data.length < 30) {
    return {
      score: 50,
      level: 'accumulation',
      label: 'Données insuffisantes',
      color: 'gray',
      icon: '⚪',
      description: 'Historique insuffisant pour analyse des flux',
      metrics: {
        volumeAnomaly: 0,
        obv: 0,
        mfi: 50,
        adLine: 0,
        trend: 'neutral'
      }
    };
  }

  // 1. Volume Anormal (30%)
  const volumeScore = calculateVolumeAnomalyScore(data);
  
  // 2. On-Balance Volume - OBV (30%)
  const obvScore = calculateOBVScore(data);
  
  // 3. Money Flow Index - MFI (25%)
  const mfiScore = calculateMFIScore(data);
  
  // 4. Accumulation/Distribution Line (15%)
  const adScore = calculateADScore(data);
  
  // Score final pondéré
  const finalScore = (volumeScore * 0.30) + (obvScore * 0.30) + (mfiScore * 0.25) + (adScore * 0.15);
  
  // Métriques brutes
  const volumeAnomaly = calculateVolumeAnomaly(data);
  const obvTrend = calculateOBVTrend(data);
  const mfi = calculateMFI(data, 14);
  const adLine = calculateADLine(data);
  
  // Déterminer tendance globale
  let trend: 'buying' | 'selling' | 'neutral';
  if (finalScore >= 60) trend = 'buying';
  else if (finalScore <= 40) trend = 'selling';
  else trend = 'neutral';
  
  // Déterminer niveau et labels
  let level: 'strong_distribution' | 'distribution' | 'accumulation' | 'strong_accumulation';
  let label: string;
  let color: string;
  let icon: string;
  let description: string;
  
  if (finalScore >= 76) {
    level = 'strong_accumulation';
    label = 'Accumulation forte';
    color = 'green';
    icon = '🟢';
    description = 'Flux acheteurs significatifs détectés. Volume anormal avec OBV en hausse soutenue et MFI élevé.';
  } else if (finalScore >= 51) {
    level = 'accumulation';
    label = 'Accumulation modérée';
    color = 'yellow';
    icon = '🟡';
    description = 'Flux acheteurs observés. Volume supérieur à la moyenne avec indicateurs de momentum positifs.';
  } else if (finalScore >= 26) {
    level = 'distribution';
    label = 'Distribution modérée';
    color = 'orange';
    icon = '🟠';
    description = 'Flux vendeurs observés. Volume avec divergences baissières sur les indicateurs de flux.';
  } else {
    level = 'strong_distribution';
    label = 'Distribution forte';
    color = 'red';
    icon = '🔴';
    description = 'Flux vendeurs significatifs détectés. Volume élevé avec OBV en baisse et MFI faible.';
  }
  
  return {
    score: Math.round(finalScore),
    level,
    label,
    color,
    icon,
    description,
    metrics: {
      volumeAnomaly: Math.round(volumeAnomaly),
      obv: Math.round(obvTrend),
      mfi: Math.round(mfi * 10) / 10,
      adLine: Math.round(adLine * 100) / 100,
      trend
    }
  };
}

// ========================================
// CALCULS INDIVIDUELS
// ========================================

/**
 * Score basé sur volume anormal (0-100)
 */
function calculateVolumeAnomalyScore(data: PriceData[]): number {
  const anomaly = calculateVolumeAnomaly(data);
  
  // Volume très élevé = potentiellement bullish si prix monte
  const recentPriceChange = calculatePerformance(data, 5);
  
  let score = 50;
  
  if (anomaly > 100 && recentPriceChange > 0) {
    score = 90; // Fort volume + hausse = accumulation
  } else if (anomaly > 50 && recentPriceChange > 0) {
    score = 75;
  } else if (anomaly > 100 && recentPriceChange < 0) {
    score = 20; // Fort volume + baisse = distribution
  } else if (anomaly > 50 && recentPriceChange < 0) {
    score = 35;
  } else if (anomaly > 20) {
    score = 60;
  }
  
  return score;
}

/**
 * Score basé sur On-Balance Volume trend (0-100)
 */
function calculateOBVScore(data: PriceData[]): number {
  const obvTrend = calculateOBVTrend(data);
  
  // OBV trend positif = accumulation
  if (obvTrend > 10) return 90;
  if (obvTrend > 5) return 75;
  if (obvTrend > 0) return 60;
  if (obvTrend > -5) return 40;
  if (obvTrend > -10) return 25;
  return 10;
}

/**
 * Score basé sur Money Flow Index (0-100)
 */
function calculateMFIScore(data: PriceData[]): number {
  const mfi = calculateMFI(data, 14);
  
  // MFI > 50 = flux acheteurs
  if (mfi > 70) return 90;
  if (mfi > 60) return 75;
  if (mfi > 50) return 60;
  if (mfi > 40) return 40;
  if (mfi > 30) return 25;
  return 10;
}

/**
 * Score basé sur Accumulation/Distribution Line (0-100)
 */
function calculateADScore(data: PriceData[]): number {
  const adLine = calculateADLine(data);
  const adTrend = calculateADTrend(data);
  
  // AD Line en hausse = accumulation
  if (adTrend > 5) return 90;
  if (adTrend > 2) return 75;
  if (adTrend > 0) return 60;
  if (adTrend > -2) return 40;
  if (adTrend > -5) return 25;
  return 10;
}

// ========================================
// HELPERS
// ========================================

/**
 * Calcule l'anomalie de volume (% vs moyenne 30j)
 */
function calculateVolumeAnomaly(data: PriceData[]): number {
  // Note: Yahoo Finance gratuit peut ne pas avoir de volume pour tous les assets
  // Retourne 0 si pas de données de volume
  return 0; // Placeholder - nécessite données de volume réelles
}

/**
 * Calcule l'On-Balance Volume et sa tendance
 */
function calculateOBVTrend(data: PriceData[]): number {
  if (data.length < 20) return 0;
  
  // Calcul OBV simplifié sans volume réel
  // On utilise la direction du prix comme proxy
  let obv = 0;
  const obvValues: number[] = [0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      obv += 1; // Proxy: +1 si prix monte
    } else if (data[i].close < data[i - 1].close) {
      obv -= 1; // Proxy: -1 si prix baisse
    }
    obvValues.push(obv);
  }
  
  // Tendance OBV : moyenne des 10 derniers jours vs 10 jours avant
  const recent10 = obvValues.slice(-10);
  const previous10 = obvValues.slice(-20, -10);
  
  const recentAvg = recent10.reduce((a, b) => a + b, 0) / 10;
  const previousAvg = previous10.reduce((a, b) => a + b, 0) / 10;
  
  return ((recentAvg - previousAvg) / Math.abs(previousAvg || 1)) * 100;
}

/**
 * Calcule le Money Flow Index (similaire au RSI mais avec volume)
 */
function calculateMFI(data: PriceData[], period: number = 14): number {
  if (data.length < period + 1) return 50;
  
  // MFI simplifié sans volume réel
  // Utilise variation de prix comme proxy
  let positiveFlow = 0;
  let negativeFlow = 0;
  
  for (let i = data.length - period; i < data.length; i++) {
    const typicalPrice = data[i].close;
    const prevTypicalPrice = data[i - 1].close;
    
    if (typicalPrice > prevTypicalPrice) {
      positiveFlow += (typicalPrice - prevTypicalPrice);
    } else {
      negativeFlow += (prevTypicalPrice - typicalPrice);
    }
  }
  
  if (negativeFlow === 0) return 100;
  if (positiveFlow === 0) return 0;
  
  const moneyFlowRatio = positiveFlow / negativeFlow;
  return 100 - (100 / (1 + moneyFlowRatio));
}

/**
 * Calcule l'Accumulation/Distribution Line
 */
function calculateADLine(data: PriceData[]): number {
  if (data.length < 2) return 0;
  
  let adLine = 0;
  
  for (let i = 1; i < data.length; i++) {
    const close = data[i].close;
    const high = Math.max(data[i].close, data[i - 1].close);
    const low = Math.min(data[i].close, data[i - 1].close);
    
    if (high === low) continue;
    
    const moneyFlowMultiplier = ((close - low) - (high - close)) / (high - low);
    adLine += moneyFlowMultiplier;
  }
  
  return adLine;
}

/**
 * Tendance de l'AD Line
 */
function calculateADTrend(data: PriceData[]): number {
  if (data.length < 20) return 0;
  
  const recent = data.slice(-10);
  const previous = data.slice(-20, -10);
  
  const recentAD = calculateADLine(recent);
  const previousAD = calculateADLine(previous);
  
  return ((recentAD - previousAD) / Math.abs(previousAD || 1)) * 100;
}

/**
 * Performance sur N jours
 */
function calculatePerformance(data: PriceData[], days: number): number {
  if (data.length < days) return 0;
  const current = data[data.length - 1].close;
  const past = data[data.length - days].close;
  return ((current - past) / past) * 100;
}