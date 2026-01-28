// lib/sec13fAPI.ts
// Fetch real institutional holdings from Financial Modeling Prep API

/**
 * INSTITUTIONAL FLOWS - REAL DATA
 * 
 * Source: Financial Modeling Prep API (gratuit)
 * https://financialmodelingprep.com/
 * 
 * Données 13F (holdings institutionnels):
 * - Gratuit: 250 requêtes/jour
 * - Mise à jour: Trimestrielle (45j après fin trimestre)
 * - Données officielles SEC
 */

export interface InstitutionalFlowData {
  ticker: string;
  totalInstitutions: number;
  totalShares: number;
  totalValue: number;           // USD
  netFlow: number;              // -100 to +100 (positive = accumulation)
  quarterlyChange: number;      // % change vs previous quarter
  topHolders: Array<{
    name: string;
    shares: number;
    value: number;
    change: number;             // % change
  }>;
  lastUpdate: string;
  confidence: number;           // 0-100
}

/**
 * Fetch institutional ownership from Financial Modeling Prep
 * API: /v3/institutional-holder/{ticker}
 * 
 * Gratuit avec clé demo (limité à 250 req/jour)
 */
export async function fetchInstitutionalOwnership(ticker: string): Promise<InstitutionalFlowData | null> {
  try {
    // Clé FMP gratuite (250 req/jour)
    const apiKey = 'Bxby2zWIGMFpuWdpPilrvTGsVuO7zZuh';
    
    const url = `https://financialmodelingprep.com/api/v3/institutional-holder/${ticker}?apikey=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ FMP API ${response.status} for ${ticker}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`⚠️ No institutional data for ${ticker}`);
      return null;
    }
    
    // Agréger les données
    let totalShares = 0;
    let totalValue = 0;
    let previousTotalShares = 0;
    
    const topHolders = data.slice(0, 10).map((h: any) => {
      const shares = h.shares || 0;
      const previousShares = h.previousShares || shares;
      const value = h.marketValue || 0;
      const change = previousShares > 0 ? ((shares - previousShares) / previousShares) * 100 : 0;
      
      totalShares += shares;
      totalValue += value;
      previousTotalShares += previousShares;
      
      return {
        name: h.holder || 'Unknown',
        shares,
        value,
        change
      };
    });
    
    // Calculer le changement global
    const quarterlyChange = previousTotalShares > 0 
      ? ((totalShares - previousTotalShares) / previousTotalShares) * 100 
      : 0;
    
    // Calculer netFlow (-100 à +100)
    let netFlow = 0;
    if (quarterlyChange > 15) netFlow = 90;
    else if (quarterlyChange > 10) netFlow = 75;
    else if (quarterlyChange > 5) netFlow = 60;
    else if (quarterlyChange > 2) netFlow = 45;
    else if (quarterlyChange > 0) netFlow = 30;
    else if (quarterlyChange > -2) netFlow = -30;
    else if (quarterlyChange > -5) netFlow = -45;
    else if (quarterlyChange > -10) netFlow = -60;
    else if (quarterlyChange > -15) netFlow = -75;
    else netFlow = -90;
    
    console.log(`✅ Fetched institutional data for ${ticker}: ${quarterlyChange.toFixed(1)}% quarterly change`);
    
    return {
      ticker,
      totalInstitutions: data.length,
      totalShares,
      totalValue,
      netFlow,
      quarterlyChange,
      topHolders: topHolders.slice(0, 5), // Top 5 pour affichage
      lastUpdate: data[0]?.dateReported || new Date().toISOString().split('T')[0],
      confidence: 85 // Haute confiance (données officielles SEC)
    };
    
  } catch (error) {
    console.error(`❌ Error fetching institutional ownership for ${ticker}:`, error);
    return null;
  }
}

/**
 * Cache pour éviter rate limiting
 */
interface CachedInstitutional {
  data: InstitutionalFlowData | null;
  timestamp: number;
}

const institutionalCache: Record<string, CachedInstitutional> = {};
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours (13F = quarterly)

export async function fetchInstitutionalFlowsCached(ticker: string): Promise<InstitutionalFlowData | null> {
  const now = Date.now();
  const cached = institutionalCache[ticker];
  
  // Retourner cache si valide
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`📦 Cache hit for ${ticker} institutional flows`);
    return cached.data;
  }
  
  // Fetch fresh data
  const data = await fetchInstitutionalOwnership(ticker);
  
  // Mettre en cache
  institutionalCache[ticker] = {
    data,
    timestamp: now
  };
  
  return data;
}

/**
 * Convertir en format scoring DashFlux
 */
export function convertToInstitutionalScore(flows: InstitutionalFlowData | null): any {
  if (!flows) {
    return {
      score: 50,
      confidence: 0,
      sentiment: 'neutral',
      explanation: 'Données institutionnelles non disponibles',
      topHolders: [],
      quarterlyChange: 0
    };
  }
  
  const { netFlow, quarterlyChange, topHolders, totalInstitutions } = flows;
  
  // Score basé sur netFlow (-100 à +100 → 0 à 100)
  const score = Math.max(0, Math.min(100, 50 + (netFlow / 2)));
  
  let sentiment: 'strong_distribution' | 'distribution' | 'neutral' | 'accumulation' | 'strong_accumulation';
  let explanation = '';
  
  if (netFlow > 60) {
    sentiment = 'strong_accumulation';
    explanation = `Forte accumulation institutionnelle (+${quarterlyChange.toFixed(1)}% Q/Q, ${totalInstitutions} institutionnels)`;
  } else if (netFlow > 20) {
    sentiment = 'accumulation';
    explanation = `Accumulation institutionnelle (+${quarterlyChange.toFixed(1)}% Q/Q, ${totalInstitutions} institutionnels)`;
  } else if (netFlow > -20) {
    sentiment = 'neutral';
    explanation = `Flux institutionnels neutres (${quarterlyChange > 0 ? '+' : ''}${quarterlyChange.toFixed(1)}% Q/Q)`;
  } else if (netFlow > -60) {
    sentiment = 'distribution';
    explanation = `Distribution institutionnelle (${quarterlyChange.toFixed(1)}% Q/Q, ${totalInstitutions} institutionnels)`;
  } else {
    sentiment = 'strong_distribution';
    explanation = `Forte distribution institutionnelle (${quarterlyChange.toFixed(1)}% Q/Q, ${totalInstitutions} institutionnels)`;
  }
  
  return {
    score: Math.round(score),
    confidence: flows.confidence,
    sentiment,
    netFlow,
    quarterlyChange,
    totalInstitutions,
    topHolders: topHolders.map(h => h.name),
    explanation: `[Real 13F] ${explanation}`,
    lastUpdate: flows.lastUpdate
  };
}

/**
 * Fallback mock data si API échoue
 * Basé sur tendances réelles connues (Q4 2025 / Q1 2026)
 */
export function getMockInstitutionalFlows(ticker: string): any {
  const mockTrends: Record<string, { netFlow: number; change: number }> = {
    // Tech accumulation forte
    'NVDA': { netFlow: 80, change: 15.5 },
    'MSFT': { netFlow: 65, change: 8.2 },
    'AAPL': { netFlow: 50, change: 5.1 },
    'META': { netFlow: 70, change: 12.3 },
    'GOOGL': { netFlow: 55, change: 6.7 },
    'AMZN': { netFlow: 60, change: 7.8 },
    
    // China accumulation (rotation)
    'BABA': { netFlow: 75, change: 18.9 },
    'PDD': { netFlow: 85, change: 22.4 },
    'JD': { netFlow: 60, change: 9.1 },
    
    // Distribution
    'TSLA': { netFlow: -30, change: -8.5 },
    'NFLX': { netFlow: -20, change: -5.2 },
    
    // Neutre
    'SPY': { netFlow: 5, change: 1.2 },
  };
  
  const trend = mockTrends[ticker] || { netFlow: 0, change: 0 };
  
  return {
    score: 50 + (trend.netFlow / 2),
    confidence: 40, // Confidence faible (mock)
    sentiment: trend.netFlow > 20 ? 'accumulation' : trend.netFlow < -20 ? 'distribution' : 'neutral',
    netFlow: trend.netFlow,
    quarterlyChange: trend.change,
    totalInstitutions: 800,
    topHolders: ['Vanguard', 'BlackRock', 'State Street', 'Fidelity', 'Capital Group'],
    explanation: `[Mock] Estimation basée sur tendances (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}% Q/Q)`,
    lastUpdate: new Date().toISOString().split('T')[0]
  };
}