// lib/cotAPIReal.ts
// Fetch real COT (Commitment of Traders) data from CFTC

/**
 * CFTC Commitment of Traders Reports
 * Source: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
 * 
 * API Options:
 * 1. CFTC API (JSON) - https://publicreporting.cftc.gov/
 * 2. Quandl CFTC Data - https://www.quandl.com/data/CFTC
 * 3. Web scraping (dernière option)
 */

export interface CFTCData {
  reportDate: string;
  commercialLong: number;      // Hedgers (smart money)
  commercialShort: number;
  nonCommercialLong: number;   // Speculators (dumb money)
  nonCommercialShort: number;
  openInterest: number;
  netPositioning: number;      // -100 à +100
}

/**
 * Mapping des tickers vers les codes CFTC
 * Les codes CFTC sont trouvés ici: https://www.cftc.gov/MarketReports/CommitmentsofTraders/ExplanatoryNotes/index.htm
 */
const TICKER_TO_CFTC_CODE: Record<string, string> = {
  // Métaux précieux
  'GC=F': '088691',  // Gold
  'SI=F': '084691',  // Silver
  'HG=F': '085692',  // Copper
  'PL=F': '076651',  // Platinum
  
  // Énergie
  'CL=F': '067651',  // Crude Oil WTI
  'NG=F': '023651',  // Natural Gas
  'HO=F': '022651',  // Heating Oil
  'RB=F': '111659',  // RBOB Gasoline
  
  // Agriculture
  'ZC=F': '002602',  // Corn
  'ZW=F': '001602',  // Wheat
  'ZS=F': '005602',  // Soybeans
  'KC=F': '083731',  // Coffee
  'SB=F': '080732',  // Sugar
  'CC=F': '073732',  // Cocoa
  
  // Devises
  'DX=F': '098662',  // US Dollar Index
  '6E=F': '099741',  // Euro FX
  '6J=F': '097741',  // Japanese Yen
  '6B=F': '096742',  // British Pound
  '6C=F': '090741',  // Canadian Dollar
  '6A=F': '232741',  // Australian Dollar
  
  // Indices (financiers)
  'ES=F': '13874+',  // E-mini S&P 500
  'NQ=F': '209742',  // E-mini Nasdaq
  'YM=F': '124603',  // E-mini Dow
};

/**
 * Fetch COT data from CFTC API
 * API doc: https://publicreporting.cftc.gov/resource/jun7-fc8e.json
 */
export async function fetchCFTCData(ticker: string): Promise<CFTCData | null> {
  const cftcCode = TICKER_TO_CFTC_CODE[ticker];
  
  if (!cftcCode) {
    console.warn(`⚠️ No CFTC code for ticker ${ticker}`);
    return null;
  }
  
  try {
    // CFTC API endpoint - Legacy Reports
    // Format: https://publicreporting.cftc.gov/resource/jun7-fc8e.json?cftc_contract_market_code=${cftcCode}
    const url = `https://publicreporting.cftc.gov/resource/jun7-fc8e.json?cftc_contract_market_code=${cftcCode}&$order=report_date_as_yyyy_mm_dd DESC&$limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ CFTC API ${response.status} for ${ticker}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`⚠️ No COT data for ${ticker}`);
      return null;
    }
    
    const latest = data[0];
    
    // Parser les données
    const commercialLong = parseFloat(latest.comm_positions_long_all) || 0;
    const commercialShort = parseFloat(latest.comm_positions_short_all) || 0;
    const nonCommercialLong = parseFloat(latest.noncomm_positions_long_all) || 0;
    const nonCommercialShort = parseFloat(latest.noncomm_positions_short_all) || 0;
    const openInterest = parseFloat(latest.open_interest_all) || 1;
    
    // Calculer net positioning (-100 à +100)
    // Commercial = smart money (hedgers)
    // Non-commercial = dumb money (speculators)
    
    const commercialNet = ((commercialLong - commercialShort) / openInterest) * 100;
    const nonCommercialNet = ((nonCommercialLong - nonCommercialShort) / openInterest) * 100;
    
    // Score final = position des commerciaux (smart money)
    // Si commerciaux sont long → positif (bullish)
    // Si commerciaux sont short → négatif (bearish)
    const netPositioning = Math.max(-100, Math.min(100, commercialNet));
    
    console.log(`✅ Fetched COT for ${ticker}: net positioning ${netPositioning.toFixed(1)}`);
    
    return {
      reportDate: latest.report_date_as_yyyy_mm_dd,
      commercialLong,
      commercialShort,
      nonCommercialLong,
      nonCommercialShort,
      openInterest,
      netPositioning
    };
    
  } catch (error) {
    console.error(`❌ Error fetching COT for ${ticker}:`, error);
    return null;
  }
}

/**
 * Alternative: Quandl API (requires API key)
 * Plus fiable mais nécessite inscription
 */
export async function fetchQuandlCOT(ticker: string, apiKey: string): Promise<CFTCData | null> {
  const cftcCode = TICKER_TO_CFTC_CODE[ticker];
  
  if (!cftcCode) return null;
  
  // Quandl dataset: CFTC/[CODE]_F_ALL
  const dataset = `CFTC/${cftcCode}_F_ALL`;
  const url = `https://www.quandl.com/api/v3/datasets/${dataset}/data.json?api_key=${apiKey}&rows=1`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.dataset_data || !data.dataset_data.data || data.dataset_data.data.length === 0) {
      return null;
    }
    
    const latest = data.dataset_data.data[0];
    
    // Quandl format: [date, open_interest, noncomm_long, noncomm_short, comm_long, comm_short, ...]
    const [date, openInterest, , , nonCommLong, nonCommShort, , , commLong, commShort] = latest;
    
    const commercialNet = ((commLong - commShort) / openInterest) * 100;
    const netPositioning = Math.max(-100, Math.min(100, commercialNet));
    
    return {
      reportDate: date,
      commercialLong: commLong,
      commercialShort: commShort,
      nonCommercialLong: nonCommLong,
      nonCommercialShort: nonCommShort,
      openInterest,
      netPositioning
    };
    
  } catch (error) {
    console.error(`❌ Error fetching Quandl COT for ${ticker}:`, error);
    return null;
  }
}

/**
 * Cache COT data (updated weekly on Friday)
 */
interface CachedCOT {
  data: CFTCData | null;
  timestamp: number;
}

const cotCache: Record<string, CachedCOT> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures (COT update hebdomadaire)

export async function fetchCFTCDataCached(ticker: string): Promise<CFTCData | null> {
  const now = Date.now();
  const cached = cotCache[ticker];
  
  // Retourner cache si valide
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`📦 Cache hit for ${ticker} COT`);
    return cached.data;
  }
  
  // Fetch fresh data
  const data = await fetchCFTCData(ticker);
  
  // Mettre en cache
  cotCache[ticker] = {
    data,
    timestamp: now
  };
  
  return data;
}

/**
 * Batch fetch avec rate limiting
 */
export async function fetchBatchCOT(
  tickers: string[],
  delayMs: number = 2000  // 2 secondes entre requêtes
): Promise<Record<string, CFTCData | null>> {
  const results: Record<string, CFTCData | null> = {};
  
  for (const ticker of tickers) {
    results[ticker] = await fetchCFTCDataCached(ticker);
    
    // Rate limiting
    if (tickers.indexOf(ticker) < tickers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Convertir CFTCData en PositioningData (format DashFlux)
 */
export function convertCFTCToPositioning(cftc: CFTCData): any {
  const netPos = cftc.netPositioning;
  
  // Score basé sur positioning des commerciaux (smart money)
  let score = 50;
  let sentiment: 'extreme_short' | 'short' | 'neutral' | 'long' | 'extreme_long' = 'neutral';
  let explanation = '';
  
  if (netPos > 60) {
    score = 85;
    sentiment = 'extreme_long';
    explanation = `Commerciaux très long (${netPos.toFixed(0)}%) - Signal haussier fort`;
  } else if (netPos > 30) {
    score = 70;
    sentiment = 'long';
    explanation = `Commerciaux long (${netPos.toFixed(0)}%) - Signal haussier`;
  } else if (netPos < -60) {
    score = 15;
    sentiment = 'extreme_short';
    explanation = `Commerciaux très short (${netPos.toFixed(0)}%) - Signal baissier fort`;
  } else if (netPos < -30) {
    score = 30;
    sentiment = 'short';
    explanation = `Commerciaux short (${netPos.toFixed(0)}%) - Signal baissier`;
  } else {
    score = 50;
    sentiment = 'neutral';
    explanation = `Positioning neutre (${netPos.toFixed(0)}%)`;
  }
  
  return {
    score,
    confidence: 80,
    sentiment,
    netPositioning: netPos,
    commercialLong: cftc.commercialLong,
    commercialShort: cftc.commercialShort,
    explanation: `[Real COT] ${explanation}`,
    reportDate: cftc.reportDate
  };
}