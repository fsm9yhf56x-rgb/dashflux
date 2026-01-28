// lib/fomoAlert.ts
// Calcul du niveau de vélocité et momentum pour détecter les mouvements paraboliques

import { PriceData } from './types';

export interface FOMOAlertResult {
  score: number;              // 0-100 (100 = vélocité maximale)
  level: 'moderate' | 'elevated' | 'high' | 'extreme';
  label: string;
  color: string;
  icon: string;
  description: string;
  metrics: {
    velocity7d: number;       // % gain sur 7 jours
    velocity30d: number;      // % gain sur 30 jours
    rsiProlonged: boolean;    // RSI > 80 pendant 5+ jours
    volumeClimax: boolean;    // Volume 5x supérieur
    distanceBreakout: number; // Jours depuis breakout
  };
}

/**
 * Calcule le niveau de vélocité et momentum d'un asset
 * Score élevé = mouvement rapide et potentiellement parabolique
 */
export function calculateFOMOAlert(data: PriceData[]): FOMOAlertResult {
  if (data.length < 30) {
    return {
      score: 50,
      level: 'moderate',
      label: 'Données insuffisantes',
      color: 'gray',
      icon: '⚪',
      description: 'Historique de prix insuffisant pour analyse',
      metrics: {
        velocity7d: 0,
        velocity30d: 0,
        rsiProlonged: false,
        volumeClimax: false,
        distanceBreakout: 0
      }
    };
  }

  const currentPrice = data[data.length - 1].close;
  
  // 1. Vélocité de hausse (40%) - ✅ Seuils ajustés pour Steffan
  const velocity7d = calculatePerformance(data, 7);
  const velocity30d = calculatePerformance(data, 30);
  
  let velocityScore = 0;
  // 7 jours - seuils réalistes
  if (velocity7d > 15) velocityScore += 25;        // Très fort
  else if (velocity7d > 8) velocityScore += 20;    // Fort
  else if (velocity7d > 5) velocityScore += 15;    // Bon
  else if (velocity7d > 2) velocityScore += 8;     // Modéré
  else if (velocity7d > 0) velocityScore += 3;     // Faible positif
  
  // 30 jours - momentum moyen terme
  if (velocity30d > 50) velocityScore += 15;       // Très fort
  else if (velocity30d > 30) velocityScore += 12;  // Fort  
  else if (velocity30d > 15) velocityScore += 8;   // Bon
  else if (velocity30d > 5) velocityScore += 4;    // Modéré
  
  velocityScore = Math.min(velocityScore, 40);
  
  // 2. RSI prolongé (30%) - ✅ Seuils ajustés
  const rsi = calculateRSI(data, 14);
  const rsiHigh = checkRSIProlonged(data, 70, 5); // RSI > 70 pendant 5 jours
  
  let rsiScore = 0;
  if (rsiHigh) rsiScore = 30;           // RSI prolongé > 70
  else if (rsi > 65) rsiScore = 20;     // RSI très élevé
  else if (rsi > 60) rsiScore = 15;     // RSI élevé
  else if (rsi > 55) rsiScore = 10;     // RSI bon
  else if (rsi > 50) rsiScore = 5;      // RSI neutre positif
  
  // 3. Distance depuis breakout (20%) - ✅ Plus permissif
  const breakoutDistance = detectBreakoutDistance(data);
  let breakoutScore = 0;
  if (breakoutDistance > 0 && breakoutDistance < 20) {
    const percentGainSinceBreakout = calculatePerformance(data, breakoutDistance);
    if (percentGainSinceBreakout > 30) breakoutScore = 20;      // Très fort
    else if (percentGainSinceBreakout > 15) breakoutScore = 15; // Fort
    else if (percentGainSinceBreakout > 8) breakoutScore = 10;  // Bon
    else if (percentGainSinceBreakout > 3) breakoutScore = 5;   // Modéré
  }
  
  // 4. Volume climax (10%)
  const volumeClimax = detectVolumeClimax(data);
  const volumeScore = volumeClimax ? 10 : 0;
  
  // Score final avec plancher (marché calme = 15-20, pas 0)
  const rawScore = velocityScore + rsiScore + breakoutScore + volumeScore;
  const finalScore = Math.max(15, rawScore); // ✅ Plancher à 15 (marché pas mort)
  
  // Déterminer le niveau et les labels - ✅ Ajustés pour Steffan
  let level: 'moderate' | 'elevated' | 'high' | 'extreme';
  let label: string;
  let color: string;
  let icon: string;
  let description: string;
  
  if (finalScore >= 70) {
    level = 'extreme';
    label = 'Vélocité extrême';
    color = 'red';
    icon = '🔴';
    description = 'Mouvement parabolique détecté. Forte accélération avec momentum très élevé. L\'action se passe ICI.';
  } else if (finalScore >= 45) {
    level = 'high';
    label = 'Vélocité élevée';
    color = 'orange';
    icon = '🟠';
    description = 'Hausse soutenue avec momentum fort. L\'actif attire les flux. Zone d\'attention.';
  } else if (finalScore >= 30) {
    level = 'elevated';
    label = 'Momentum positif';
    color = 'yellow';
    icon = '🟡';
    description = 'Momentum positif détecté. Hausse régulière avec vélocité modérée.';
  } else {
    level = 'moderate';
    label = 'Calme';
    color = 'green';
    icon = '🟢';
    description = 'Marché calme. Vélocité faible, pas de signal d\'accélération majeur.';
  }
  
  return {
    score: Math.round(finalScore),
    level,
    label,
    color,
    icon,
    description,
    metrics: {
      velocity7d: Math.round(velocity7d * 10) / 10,
      velocity30d: Math.round(velocity30d * 10) / 10,
      rsiProlonged: rsiHigh,
      volumeClimax,
      distanceBreakout: breakoutDistance
    }
  };
}

// Helper functions
function calculatePerformance(data: PriceData[], days: number): number {
  if (data.length < days) return 0;
  const current = data[data.length - 1].close;
  const past = data[data.length - days].close;
  return ((current - past) / past) * 100;
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

function checkRSIProlonged(data: PriceData[], threshold: number, days: number): boolean {
  if (data.length < days + 14) return false;
  
  let consecutiveDays = 0;
  for (let i = data.length - days; i < data.length; i++) {
    const rsi = calculateRSI(data.slice(0, i + 1), 14);
    if (rsi > threshold) consecutiveDays++;
  }
  
  return consecutiveDays >= days;
}

function detectBreakoutDistance(data: PriceData[]): number {
  if (data.length < 50) return 0;
  
  const currentPrice = data[data.length - 1].close;
  const ma50 = data.slice(-50).reduce((sum, d) => sum + d.close, 0) / 50;
  
  // Cherche un breakout récent au-dessus de MA50
  for (let i = data.length - 1; i >= Math.max(0, data.length - 30); i--) {
    if (data[i].close <= ma50 && data[i + 1]?.close > ma50) {
      return data.length - 1 - i;
    }
  }
  
  return 0;
}

function detectVolumeClimax(data: PriceData[]): boolean {
  if (data.length < 30) return false;
  
  // Extraire les volumes des 30 derniers jours
  const recentData = data.slice(-30);
  const volumes = recentData.map(d => d.volume).filter((v): v is number => v !== undefined && v > 0);
  
  // Si pas assez de données de volume, retourner false
  if (volumes.length < 20) return false;
  
  // Volume moyen des 25 premiers jours
  const historicalVolumes = volumes.slice(0, -5);
  const avgHistoricalVolume = historicalVolumes.reduce((a, b) => a + b, 0) / historicalVolumes.length;
  
  // Volume moyen des 5 derniers jours
  const recentVolumes = volumes.slice(-5);
  const avgRecentVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  
  // Climax = volume récent 5x supérieur à la moyenne historique
  return avgRecentVolume > (avgHistoricalVolume * 5);
}