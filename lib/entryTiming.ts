// lib/entryTiming.ts
// Calcul du timing d'entrée optimal basé sur distance aux supports techniques

import { PriceData } from './types';

export interface EntryTimingResult {
  score: number;              // 0-100 (100 = timing parfait)
  level: 'poor' | 'fair' | 'good' | 'excellent';
  label: string;
  color: string;
  icon: string;
  description: string;
  metrics: {
    distanceToMA50: number;     // % distance à MA50
    distanceToMA200: number;    // % distance à MA200
    rsiLevel: number;           // RSI actuel
    nearSupport: boolean;       // Proche d'un support
  };
}

/**
 * Calcule le timing d'entrée optimal
 * Score élevé = bon moment pour entrer (proche support, RSI reset)
 */
export function calculateEntryTiming(data: PriceData[]): EntryTimingResult {
  if (data.length < 200) {
    return {
      score: 50,
      level: 'fair',
      label: 'Données insuffisantes',
      color: 'gray',
      icon: '⚪',
      description: 'Historique insuffisant pour analyse timing',
      metrics: {
        distanceToMA50: 0,
        distanceToMA200: 0,
        rsiLevel: 50,
        nearSupport: false
      }
    };
  }

  const currentPrice = data[data.length - 1].close;
  
  // 1. Distance aux moyennes mobiles (50%)
  const ma50 = calculateMA(data, 50);
  const ma200 = calculateMA(data, 200);
  const distanceMA50 = ((currentPrice - ma50) / ma50) * 100;
  const distanceMA200 = ((currentPrice - ma200) / ma200) * 100;
  
  let maScore = 0;
  
  // Proche MA50 = bon timing
  if (Math.abs(distanceMA50) < 2) maScore = 50;
  else if (Math.abs(distanceMA50) < 5) maScore = 40;
  else if (Math.abs(distanceMA50) < 10) maScore = 25;
  else maScore = 10;
  
  // Proche MA200 = très bon timing
  if (Math.abs(distanceMA200) < 3) maScore += 50;
  else if (Math.abs(distanceMA200) < 8) maScore += 30;
  else if (Math.abs(distanceMA200) < 15) maScore += 15;
  else maScore += 5;
  
  maScore = Math.min(maScore, 50);
  
  // 2. RSI Reset (30%)
  const rsi = calculateRSI(data, 14);
  let rsiScore = 0;
  
  // RSI entre 40-60 = optimal (reset)
  if (rsi >= 40 && rsi <= 60) rsiScore = 30;
  else if (rsi >= 30 && rsi <= 70) rsiScore = 20;
  else if (rsi < 30) rsiScore = 25; // Oversold = opportunity
  else rsiScore = 5; // Overbought = mauvais timing
  
  // 3. Pullback récent (20%)
  const pullbackScore = detectPullback(data);
  
  // Score final
  const finalScore = maScore + rsiScore + pullbackScore;
  
  // Déterminer si proche support
  const nearSupport = Math.abs(distanceMA50) < 5 || Math.abs(distanceMA200) < 8;
  
  // Déterminer niveau et labels
  let level: 'poor' | 'fair' | 'good' | 'excellent';
  let label: string;
  let color: string;
  let icon: string;
  let description: string;
  
  if (finalScore >= 80) {
    level = 'excellent';
    label = 'Timing excellent';
    color = 'green';
    icon = '🟢';
    description = 'Conditions techniques très favorables. Prix proche de supports clés avec RSI reset.';
  } else if (finalScore >= 60) {
    level = 'good';
    label = 'Timing favorable';
    color = 'blue';
    icon = '🔵';
    description = 'Conditions techniques favorables. Proximité raisonnable aux supports importants.';
  } else if (finalScore >= 40) {
    level = 'fair';
    label = 'Timing neutre';
    color = 'yellow';
    icon = '🟡';
    description = 'Conditions techniques neutres. Considérer d\'attendre un meilleur point d\'entrée.';
  } else {
    level = 'poor';
    label = 'Timing défavorable';
    color = 'orange';
    icon = '🟠';
    description = 'Conditions techniques défavorables. Prix éloigné des supports, attendre pullback recommandé.';
  }
  
  return {
    score: Math.round(finalScore),
    level,
    label,
    color,
    icon,
    description,
    metrics: {
      distanceToMA50: Math.round(distanceMA50 * 10) / 10,
      distanceToMA200: Math.round(distanceMA200 * 10) / 10,
      rsiLevel: Math.round(rsi * 10) / 10,
      nearSupport
    }
  };
}

// ========================================
// HELPERS
// ========================================

function calculateMA(data: PriceData[], period: number): number {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, d) => acc + d.close, 0);
  return sum / period;
}

function calculateRSI(data: PriceData[], period: number = 14): number {
  if (data.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = data.length - period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function detectPullback(data: PriceData[]): number {
  if (data.length < 30) return 10;
  
  // Cherche un pullback récent (baisse de 3-10% dans les 10 derniers jours)
  const currentPrice = data[data.length - 1].close;
  let maxPrice = currentPrice;
  
  for (let i = data.length - 10; i < data.length; i++) {
    if (data[i].close > maxPrice) maxPrice = data[i].close;
  }
  
  const pullback = ((maxPrice - currentPrice) / maxPrice) * 100;
  
  // Pullback optimal : 3-10%
  if (pullback >= 3 && pullback <= 10) return 20;
  if (pullback >= 2 && pullback <= 12) return 15;
  if (pullback >= 1 && pullback <= 15) return 10;
  return 5;
}