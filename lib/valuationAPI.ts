// lib/valuationAPI.ts
// Fetch real-time valuation data (P/E, P/B) from Yahoo Finance

export interface YahooValuationData {
  pe?: number;
  forwardPE?: number;
  pb?: number;
  pegRatio?: number;
  priceToSales?: number;
  enterpriseToRevenue?: number;
  enterpriseToEbitda?: number;
}

/**
 * Fetch valuation metrics from Yahoo Finance
 * API: /v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics
 */
export async function fetchYahooValuation(ticker: string): Promise<YahooValuationData | null> {
  // Yahoo Finance ne supporte pas les tickers avec = (futures)
  // Convertir CL=F → CL-F pour l'API
  const apiTicker = ticker.replace('=', '-');
  
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${apiTicker}?modules=defaultKeyStatistics,financialData`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DashFlux/1.0)',
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Yahoo Valuation API ${response.status} for ${ticker}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.quoteSummary?.result?.[0]) {
      console.warn(`⚠️ No valuation data for ${ticker}`);
      return null;
    }
    
    const stats = data.quoteSummary.result[0].defaultKeyStatistics || {};
    const financial = data.quoteSummary.result[0].financialData || {};
    
    // Extraire les métriques
    const valuation: YahooValuationData = {
      pe: stats.trailingPE?.raw,
      forwardPE: stats.forwardPE?.raw || financial.currentPrice?.raw / financial.targetMeanPrice?.raw,
      pb: stats.priceToBook?.raw,
      pegRatio: stats.pegRatio?.raw,
      priceToSales: stats.priceToSalesTrailing12Months?.raw,
      enterpriseToRevenue: stats.enterpriseToRevenue?.raw,
      enterpriseToEbitda: stats.enterpriseToEbitda?.raw,
    };
    
    // Filtrer les valeurs undefined
    Object.keys(valuation).forEach(key => {
      if (valuation[key as keyof YahooValuationData] === undefined) {
        delete valuation[key as keyof YahooValuationData];
      }
    });
    
    console.log(`✅ Fetched valuation for ${ticker}: P/E ${valuation.pe?.toFixed(1)}`);
    return valuation;
    
  } catch (error) {
    console.error(`❌ Error fetching valuation for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch valuation pour plusieurs tickers avec rate limiting
 * Rate limit: 2000/jour = ~83/heure = ~1.4/min
 */
export async function fetchBatchValuation(
  tickers: string[],
  delayMs: number = 1000  // 1 seconde entre chaque requête
): Promise<Record<string, YahooValuationData | null>> {
  const results: Record<string, YahooValuationData | null> = {};
  
  for (const ticker of tickers) {
    results[ticker] = await fetchYahooValuation(ticker);
    
    // Rate limiting: attendre avant la prochaine requête
    if (tickers.indexOf(ticker) < tickers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Estimer un P/E "fair" basé sur la catégorie d'asset
 */
export function estimateFairPE(category: string, currentPE?: number): number {
  const fairPEByCategory: Record<string, number> = {
    // Tech
    'big_tech': 28,
    'semiconductors': 35,
    'software': 45,
    'saas': 50,
    'cloud': 45,
    'ai': 50,
    
    // China
    'china_tech': 20,
    'china_ev': 25,
    
    // Other
    'banks': 13,
    'energy': 12,
    'healthcare': 18,
    'consumer': 22,
    'industrials': 20,
    'utilities': 16,
    
    // Indices
    'index': 19,
    'tech_index': 26,
    'small_cap': 18,
    
    // EV
    'ev': 35,
  };
  
  // Si on a un P/E actuel positif, estimer fair value = P/E actuel * 0.85
  // (assume légère surévaluation moyenne du marché)
  if (currentPE && currentPE > 0 && currentPE < 200) {
    return Math.round(currentPE * 0.85);
  }
  
  return fairPEByCategory[category] || 20; // Default = 20 (marché général)
}

/**
 * Cache simple pour éviter de refetch trop souvent
 */
interface CachedValuation {
  data: YahooValuationData | null;
  timestamp: number;
}

const valuationCache: Record<string, CachedValuation> = {};
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 heures

export async function fetchYahooValuationCached(ticker: string): Promise<YahooValuationData | null> {
  const now = Date.now();
  const cached = valuationCache[ticker];
  
  // Retourner cache si valide
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`📦 Cache hit for ${ticker} valuation`);
    return cached.data;
  }
  
  // Sinon, fetch fresh data
  const data = await fetchYahooValuation(ticker);
  
  // Mettre en cache
  valuationCache[ticker] = {
    data,
    timestamp: now
  };
  
  return data;
}