// =====================================================
// LIQUIDITY MODULE - Méthode Steffan
// =====================================================
// Mesure la liquidité globale Fed pour scorer les actifs

interface FREDResponse {
  observations: Array<{
    date: string;
    value: string;
  }>;
}

interface LiquidityIndicators {
  m2Growth: number;           // Croissance M2 (% YoY)
  fedBalanceGrowth: number;   // Croissance bilan Fed (% 3M)
  reverseRepoLevel: number;   // Niveau Reverse Repo (Mds $)
  liquidityScore: number;     // Score final 0-100
  regime: 'expansion' | 'contraction' | 'neutral';
  lastUpdate: string;
}

// =====================================================
// CONFIGURATION
// =====================================================

const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY || '';

// Cache pour éviter trop d'appels API (1h)
let liquidityCache: LiquidityIndicators | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

// =====================================================
// FETCH FRED DATA
// =====================================================

async function fetchFREDData(
  seriesId: string,
  limit: number = 100
): Promise<number[]> {
  if (!FRED_API_KEY) {
    console.warn('⚠️ FRED_API_KEY manquante - liquidité désactivée');
    return [];
  }

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data: FREDResponse = await response.json();
    
    return data.observations
      .filter(obs => obs.value !== '.')
      .map(obs => parseFloat(obs.value))
      .reverse(); // Chronologique
      
  } catch (error) {
    console.error(`❌ FRED error for ${seriesId}:`, error);
    return [];
  }
}

// =====================================================
// CALCUL LIQUIDITÉ GLOBALE
// =====================================================

export async function calculateGlobalLiquidity(): Promise<LiquidityIndicators> {
  // Vérifier le cache
  const now = Date.now();
  if (liquidityCache && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('💰 Using cached liquidity data');
    return liquidityCache;
  }

  console.log('💰 Calculating Global Liquidity...');
  
  try {
    // Fetch en parallèle
    const [m2Data, fedBalanceData, reverseRepoData] = await Promise.all([
      fetchFREDData('M2SL', 100),        // M2 Money Supply
      fetchFREDData('WALCL', 100),       // Fed Total Assets
      fetchFREDData('RRPONTSYD', 100),   // Reverse Repo
    ]);
    
    // Si pas de données, retourner neutre
    if (m2Data.length === 0 || fedBalanceData.length === 0) {
      return {
        m2Growth: 0,
        fedBalanceGrowth: 0,
        reverseRepoLevel: 0,
        liquidityScore: 50,
        regime: 'neutral',
        lastUpdate: new Date().toISOString(),
      };
    }
    
    // 1. M2 Growth (Year-over-Year)
    const currentM2 = m2Data[m2Data.length - 1];
    const m2OneYearAgo = m2Data.length > 52 ? m2Data[m2Data.length - 52] : m2Data[0];
    const m2Growth = ((currentM2 - m2OneYearAgo) / m2OneYearAgo) * 100;
    
    // 2. Fed Balance Sheet Growth (3 mois)
    const currentFedBalance = fedBalanceData[fedBalanceData.length - 1];
    const fedBalance3MAgo = fedBalanceData.length > 13 ? fedBalanceData[fedBalanceData.length - 13] : fedBalanceData[0];
    const fedBalanceGrowth = ((currentFedBalance - fedBalance3MAgo) / fedBalance3MAgo) * 100;
    
    // 3. Reverse Repo Level (en milliards)
    const reverseRepoLevel = reverseRepoData.length > 0 ? reverseRepoData[reverseRepoData.length - 1] / 1000 : 0;
    
    // =====================================================
    // SCORING ALGORITHM (0-100)
    // =====================================================
    
    let liquidityScore = 50; // Base neutre
    
    // M2 Growth impact (30%)
    if (m2Growth > 10) liquidityScore += 30;
    else if (m2Growth > 5) liquidityScore += 20;
    else if (m2Growth > 2) liquidityScore += 10;
    else if (m2Growth < -5) liquidityScore -= 30;
    else if (m2Growth < 0) liquidityScore -= 20;
    
    // Fed Balance Growth impact (40%)
    if (fedBalanceGrowth > 5) liquidityScore += 40;
    else if (fedBalanceGrowth > 2) liquidityScore += 25;
    else if (fedBalanceGrowth > 0) liquidityScore += 10;
    else if (fedBalanceGrowth < -3) liquidityScore -= 40;
    else if (fedBalanceGrowth < 0) liquidityScore -= 25;
    
    // Reverse Repo impact (30%)
    if (reverseRepoLevel > 2000) liquidityScore -= 30;
    else if (reverseRepoLevel > 1500) liquidityScore -= 20;
    else if (reverseRepoLevel > 1000) liquidityScore -= 10;
    else if (reverseRepoLevel < 500) liquidityScore += 30;
    else if (reverseRepoLevel < 800) liquidityScore += 15;
    
    // Cap entre 0-100
    liquidityScore = Math.max(0, Math.min(100, liquidityScore));
    
    // Déterminer le régime
    let regime: 'expansion' | 'contraction' | 'neutral';
    if (liquidityScore > 65) regime = 'expansion';
    else if (liquidityScore < 35) regime = 'contraction';
    else regime = 'neutral';
    
    const result: LiquidityIndicators = {
      m2Growth,
      fedBalanceGrowth,
      reverseRepoLevel,
      liquidityScore,
      regime,
      lastUpdate: new Date().toISOString(),
    };
    
    // Logger les résultats
    console.log(`💰 Liquidity Score: ${liquidityScore}/100 (${regime})`);
    console.log(`   - M2 Growth: ${m2Growth.toFixed(2)}% YoY`);
    console.log(`   - Fed Balance Growth: ${fedBalanceGrowth.toFixed(2)}% (3M)`);
    console.log(`   - Reverse Repo: $${reverseRepoLevel.toFixed(0)}B`);
    
    // Mettre en cache
    liquidityCache = result;
    lastFetchTime = now;
    
    return result;
    
  } catch (error) {
    console.error('❌ Liquidity calculation error:', error);
    
    // Retourner neutre en cas d'erreur
    return {
      m2Growth: 0,
      fedBalanceGrowth: 0,
      reverseRepoLevel: 0,
      liquidityScore: 50,
      regime: 'neutral',
      lastUpdate: new Date().toISOString(),
    };
  }
}

// =====================================================
// AJUSTEMENT SCORES PAR LIQUIDITÉ
// =====================================================

export function applyLiquidityAdjustment(
  baseScore: number,
  assetCategory: 'equity' | 'commodity' | 'bond' | 'crypto' | 'currency',
  liquidity: LiquidityIndicators
): number {
  const { liquidityScore, regime } = liquidity;
  
  // Multiplicateurs selon catégorie et régime
  const multipliers: Record<string, Record<string, number>> = {
    'expansion': {
      'equity': 1.25,
      'crypto': 1.35,
      'commodity': 1.15,
      'bond': 0.75,
      'currency': 1.0,
    },
    'contraction': {
      'equity': 0.7,
      'crypto': 0.6,
      'commodity': 0.75,
      'bond': 1.25,
      'currency': 1.1,
    },
    'neutral': {
      'equity': 1.0,
      'crypto': 1.0,
      'commodity': 1.0,
      'bond': 1.0,
      'currency': 1.0,
    },
  };
  
  const multiplier = multipliers[regime][assetCategory];
  
  // Appliquer multiplicateur
  let adjustedScore = baseScore * multiplier;
  
  // Ajustement fin
  const liquidityDeviation = (liquidityScore - 50) / 50;
  adjustedScore += liquidityDeviation * 8;
  
  // Cap 0-100
  return Math.max(0, Math.min(100, adjustedScore));
}

// =====================================================
// PONDÉRATION STEFFAN (35% liquidité)
// =====================================================

export function blendWithLiquidity(
  technicalScore: number,
  liquidityScore: number
): number {
  // Méthode Steffan : 65% technique + 35% liquidité
  return (technicalScore * 0.65) + (liquidityScore * 0.35);
}

export type { LiquidityIndicators };
