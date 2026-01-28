// =====================================================
// MACRO REGIONAL MODULE - Phase 4 (95% Alignement)
// =====================================================
// Analyse macro régionale (focus China pour BABA, PDD, etc.)

/**
 * MÉTHODE STEFFAN:
 * "La macro régionale impacte différemment chaque actif"
 * 
 * Pour China stocks (BABA, PDD, NIO):
 * - Stimulus China (taux, liquidité)
 * - PMI Manufacturing
 * - Sentiment géopolitique
 * 
 * Pour US stocks:
 * - Fed policy
 * - Economic growth
 * 
 * Pour commodities:
 * - Global demand
 */

export interface MacroRegionalData {
  score: number;              // 0-100
  confidence: number;         // 0-100
  region: 'us' | 'china' | 'europe' | 'japan' | 'global';
  indicators: {
    growth: number;           // Score croissance régionale (0-100)
    monetary: number;         // Score politique monétaire (0-100)
    demand: number;           // Score demande secteur (0-100)
  };
  explanation: string;
}

// =====================================================
// CHINA STOCKS IDENTIFICATION
// =====================================================

const CHINA_STOCKS = [
  'BABA', 'PDD', 'JD', 'BIDU', 'NIO', 'LI', 'XPEV',
  'BILI', 'BEKE', 'TME', 'FXI', 'KWEB', 'MCHI', 'YINN'
];

const CHINA_INDEXES = [
  'FXI',   // iShares China Large-Cap
  'MCHI',  // iShares MSCI China
  'KWEB',  // KraneShares CSI China Internet
  'YINN'   // Direxion Daily FTSE China Bull 3X
];

// =====================================================
// MACRO STATE (Janvier 2026 - À mettre à jour)
// =====================================================

/**
 * État macro actuel basé sur données publiques
 * SOURCE: Bloomberg, Reuters, Trading Economics
 * DATE: Janvier 2026
 */

const CURRENT_MACRO_STATE = {
  china: {
    // Stimulus récent (Q4 2025 - Q1 2026)
    stimulus: true,
    stimulusStrength: 75, // Fort stimulus immobilier + consommation
    
    // PMI Manufacturing (50+ = expansion)
    pmi: 51.2, // Légère expansion
    
    // Sentiment géopolitique US-China
    geopoliticalTension: 60, // Modérée (baisse vs 2024)
    
    // Yuan vs USD (strong yuan = bon pour China stocks)
    yuanStrength: 55, // Stable/légère appréciation
    
    // Credit growth (TSF Total Social Financing)
    creditGrowth: 70, // Accélération
    
    // Consumer confidence
    consumerConfidence: 60, // Amélioration progressive
  },
  
  us: {
    // Fed policy (0 = très dovish, 100 = très hawkish)
    fedPolicy: 45, // Légèrement dovish (pause taux)
    
    // GDP growth
    gdpGrowth: 60, // Croissance modérée 2-2.5%
    
    // Inflation
    inflation: 50, // Cible 2% atteinte
    
    // Consumer spending
    consumerSpending: 65, // Robuste
  },
  
  global: {
    // Global manufacturing PMI
    pmi: 52.0, // Expansion légère
    
    // Commodity demand
    commodityDemand: 58, // Modérée
    
    // Risk appetite (VIX inverse)
    riskAppetite: 60, // Modérée
  }
};

// =====================================================
// CALCULATE MACRO REGIONAL SCORE
// =====================================================

export function calculateMacroRegionalScore(ticker: string): MacroRegionalData {
  // ========================================
  // CHINA STOCKS
  // ========================================
  
  if (CHINA_STOCKS.includes(ticker)) {
    const china = CURRENT_MACRO_STATE.china;
    
    // Calcul des 3 indicateurs
    const growth = (
      (china.pmi - 50) * 10 +  // PMI au-dessus de 50 = bon
      (china.creditGrowth * 0.3) +
      (china.consumerConfidence * 0.2)
    ) / 1.5;
    
    const monetary = (
      (china.stimulusStrength * 0.6) +
      (china.yuanStrength * 0.4)
    );
    
    const demand = (
      (china.consumerConfidence * 0.5) +
      ((100 - china.geopoliticalTension) * 0.5) // Moins de tension = mieux
    );
    
    const score = (growth + monetary + demand) / 3;
    
    // Bonus si stimulus actif
    const finalScore = china.stimulus ? Math.min(score + 10, 100) : score;
    
    return {
      score: Math.round(finalScore),
      confidence: 70, // Bonne confiance (données publiques China)
      region: 'china',
      indicators: {
        growth: Math.round(growth),
        monetary: Math.round(monetary),
        demand: Math.round(demand)
      },
      explanation: `China macro en amélioration (PMI ${china.pmi}, stimulus actif, crédit +${china.creditGrowth})`
    };
  }
  
  // ========================================
  // US TECH STOCKS
  // ========================================
  
  if (ticker.match(/^(AAPL|MSFT|GOOGL|AMZN|META|NVDA|AMD|INTC|TSLA|QQQ|XLK)$/)) {
    const us = CURRENT_MACRO_STATE.us;
    
    const growth = us.gdpGrowth;
    const monetary = 100 - us.fedPolicy; // Moins hawkish = mieux pour tech
    const demand = us.consumerSpending;
    
    const score = (
      (growth * 0.3) +
      (monetary * 0.4) +  // Tech sensible aux taux
      (demand * 0.3)
    );
    
    return {
      score: Math.round(score),
      confidence: 75,
      region: 'us',
      indicators: {
        growth: Math.round(growth),
        monetary: Math.round(monetary),
        demand: Math.round(demand)
      },
      explanation: 'US tech soutenu par demande IA et Fed pause'
    };
  }
  
  // ========================================
  // COMMODITIES (Global Demand)
  // ========================================
  
  if (ticker.match(/^(GLD|SLV|USO|DBC|CPER|XLE|DBA)$/)) {
    const global = CURRENT_MACRO_STATE.global;
    const china = CURRENT_MACRO_STATE.china;
    
    const growth = (global.pmi - 50) * 10 + 50; // PMI indicateur clé
    const monetary = 50; // Neutre pour commodités
    const demand = (
      (global.commodityDemand * 0.6) +
      (china.pmi - 50) * 8 + 50 * 0.4  // China = gros consommateur
    );
    
    const score = (growth + monetary + demand) / 3;
    
    return {
      score: Math.round(score),
      confidence: 65,
      region: 'global',
      indicators: {
        growth: Math.round(growth),
        monetary: Math.round(monetary),
        demand: Math.round(demand)
      },
      explanation: 'Demande commodités stable, China amélioration'
    };
  }
  
  // ========================================
  // BONDS (US Monetary Policy Dominant)
  // ========================================
  
  if (ticker.match(/^(TLT|IEF|AGG|LQD|HYG|TIP)$/)) {
    const us = CURRENT_MACRO_STATE.us;
    
    const growth = 100 - us.gdpGrowth; // Croissance faible = bon pour bonds
    const monetary = 100 - us.fedPolicy; // Fed dovish = bon pour bonds
    const demand = 50 + ((100 - CURRENT_MACRO_STATE.global.riskAppetite) / 2); // Flight to quality
    
    const score = (
      (growth * 0.3) +
      (monetary * 0.5) +  // Très important pour bonds
      (demand * 0.2)
    );
    
    return {
      score: Math.round(score),
      confidence: 70,
      region: 'us',
      indicators: {
        growth: Math.round(growth),
        monetary: Math.round(monetary),
        demand: Math.round(demand)
      },
      explanation: 'Fed pause favorable aux bonds long terme'
    };
  }
  
  // ========================================
  // DEFAULT (US Broad Market)
  // ========================================
  
  const us = CURRENT_MACRO_STATE.us;
  
  return {
    score: 58,
    confidence: 60,
    region: 'us',
    indicators: {
      growth: us.gdpGrowth,
      monetary: 100 - us.fedPolicy,
      demand: us.consumerSpending
    },
    explanation: 'Macro US globalement neutre à légèrement positive'
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getMacroScore(ticker: string): number {
  return calculateMacroRegionalScore(ticker).score;
}

export function getMacroExplanation(ticker: string): string {
  return calculateMacroRegionalScore(ticker).explanation;
}

export function isChinaStock(ticker: string): boolean {
  return CHINA_STOCKS.includes(ticker);
}

// =====================================================
// UPDATE MACRO STATE (Admin Function)
// =====================================================

/**
 * Pour mettre à jour l'état macro:
 * 
 * 1. Lis les dernières données (Bloomberg, Trading Economics, PBOC)
 * 2. Modifie CURRENT_MACRO_STATE ci-dessus
 * 3. Rebuild l'app
 * 
 * Fréquence recommandée: Mensuelle
 * 
 * Exemple update:
 * 
 * CURRENT_MACRO_STATE.china.pmi = 52.5; // Nouvelle valeur
 * CURRENT_MACRO_STATE.china.stimulus = true; // Nouveau stimulus annoncé
 * CURRENT_MACRO_STATE.us.fedPolicy = 50; // Fed neutre
 */
