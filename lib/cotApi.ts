// COT Reports - CFTC (Commodity Futures Trading Commission)
// API officielle gratuite

export interface COTReport {
  asOfDate: string;
  contractMarketName: string;
  openInterestAll: number;
  nonCommLongAll: number;
  nonCommShortAll: number;
  commercialLongAll: number;
  commercialShortAll: number;
  netPositioning: number;
}

// Mapping des tickers vers les contrats CFTC
const CFTC_CONTRACTS: Record<string, string> = {
  'GLD': 'GOLD',
  'SLV': 'SILVER',
  'USO': 'CRUDE OIL',
  'UNG': 'NATURAL GAS',
  'COPX': 'COPPER',
  'WEAT': 'WHEAT',
  'TLT': '10-YEAR U.S. TREASURY NOTES',
  'UUP': 'U.S. DOLLAR INDEX',
};

export async function getCOTData(ticker: string): Promise<number> {
  const contractName = CFTC_CONTRACTS[ticker];
  
  if (!contractName) {
    console.log(`No COT data available for ${ticker}`);
    return 50; // Neutre
  }
  
  try {
    // CFTC API - Disaggregated Futures Only Reports
    const year = new Date().getFullYear();
    const url = `https://publicreporting.cftc.gov/resource/jun7-fc8e.json?contract_market_name=${encodeURIComponent(contractName)}&$order=report_date_as_yyyy_mm_dd DESC&$limit=1`;
    
    console.log('Fetching COT for:', contractName);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const report = data[0];
      
      // Calculer le positionnement net des non-commercials (speculators)
      const nonCommLong = parseFloat(report.noncomm_positions_long_all || 0);
      const nonCommShort = parseFloat(report.noncomm_positions_short_all || 0);
      const openInterest = parseFloat(report.open_interest_all || 1);
      
      // Net positioning en pourcentage
      const netPositioning = ((nonCommLong - nonCommShort) / openInterest) * 100;
      
      console.log(`COT ${ticker}: Net positioning = ${netPositioning.toFixed(2)}%`);
      
      // Convertir en score contrarian (plus négatif = meilleur score)
      if (netPositioning < -10) {
        // Très bearish = opportunité
        return Math.min(90, 70 + Math.abs(netPositioning));
      } else if (netPositioning < -5) {
        return 65;
      } else if (netPositioning > 10) {
        // Très bullish = prudence
        return 35;
      } else if (netPositioning > 5) {
        return 45;
      }
      
      return 50; // Neutre
    }
    
    console.log('No COT data found for', contractName);
    return 50;
    
  } catch (error) {
    console.error(`Error fetching COT for ${ticker}:`, error);
    return 50;
  }
}

// Cache pour éviter trop de requêtes
const cotCache: Record<string, { score: number; timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export async function getCOTScore(ticker: string): Promise<number> {
  const now = Date.now();
  
  // Vérifier le cache
  if (cotCache[ticker] && (now - cotCache[ticker].timestamp) < CACHE_DURATION) {
    console.log(`Using cached COT for ${ticker}:`, cotCache[ticker].score);
    return cotCache[ticker].score;
  }
  
  // Fetch nouvelle donnée
  const score = await getCOTData(ticker);
  
  // Mettre en cache
  cotCache[ticker] = { score, timestamp: now };
  
  return score;
}