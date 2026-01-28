// COT Reports - Commitment of Traders
// Données mises à jour manuellement chaque semaine (CFTC publie le vendredi)
// En production : utiliser API CFTC ou scraping

export interface COTData {
  ticker: string;
  commercialLong: number;  // Hedgers (smart money)
  commercialShort: number;
  nonCommercialLong: number; // Speculators
  nonCommercialShort: number;
  netPositioning: number; // -100 (très bearish) à +100 (très bullish)
  extremeLevel: boolean; // true si positionnement extrême
}

// Données simulées - en production, fetch depuis CFTC API
export const COT_DATA: Record<string, COTData> = {
  'GLD': {
    ticker: 'GLD',
    commercialLong: 250000,
    commercialShort: 180000,
    nonCommercialLong: 120000,
    nonCommercialShort: 200000,
    netPositioning: -35, // Speculators très bearish = opportunité contrarian
    extremeLevel: true,
  },
  'USO': {
    ticker: 'USO',
    commercialLong: 400000,
    commercialShort: 350000,
    nonCommercialLong: 280000,
    nonCommercialShort: 220000,
    netPositioning: 20, // Légèrement bullish
    extremeLevel: false,
  },
  'TLT': {
    ticker: 'TLT',
    commercialLong: 180000,
    commercialShort: 220000,
    nonCommercialLong: 90000,
    nonCommercialShort: 150000,
    netPositioning: -40, // Très bearish = opportunité
    extremeLevel: true,
  },
  'BTC-USD': {
    ticker: 'BTC-USD',
    commercialLong: 0,
    commercialShort: 0,
    nonCommercialLong: 0,
    nonCommercialShort: 0,
    netPositioning: 0, // Pas de COT pour crypto
    extremeLevel: false,
  },
};

export function getCOTData(ticker: string): COTData | null {
  return COT_DATA[ticker] || null;
}

export function calculateCOTScore(ticker: string): number {
  const cot = getCOTData(ticker);
  
  if (!cot) return 50; // Neutre si pas de données
  
  // Logique contrarian : plus le positionnement est extrême négatif, plus le score est élevé
  const positioning = cot.netPositioning;
  
  // Si très bearish (< -30) = opportunité d'achat (score élevé)
  if (positioning < -30 && cot.extremeLevel) {
    return 85 + Math.abs(positioning + 30) * 0.3; // Max 90-95
  }
  
  // Si bearish modéré (-15 à -30)
  if (positioning < -15) {
    return 65 + Math.abs(positioning + 15) * 0.5;
  }
  
  // Si neutre (-15 à +15)
  if (positioning >= -15 && positioning <= 15) {
    return 50;
  }
  
  // Si bullish (> +15) = prudence (score bas)
  if (positioning > 15) {
    return 40 - (positioning - 15) * 0.5; // Score diminue
  }
  
  return 50;
}