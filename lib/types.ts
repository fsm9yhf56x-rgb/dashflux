export interface Asset {
  ticker: string;
  name: string;
  category: 'equity' | 'commodity' | 'crypto' | 'bond' | 'currency';
  subcategory?: string;
}

export interface PriceData {
  date: string;
  close: number;
  volume?: number;  // ✅ Volume ajouté (optionnel car pas tous les assets)
}

export interface AssetScore {
  ticker: string;
  name: string;
  category: 'equity' | 'commodity' | 'crypto' | 'bond' | 'currency';
  score: number;
  emergentScore: number;
  momentum: number;
  volatility: number;
  trend: number;
  lastPrice: number;
  change1M: number;
  change3M: number;
  change6M: number;
  recommendation: 'ACCUMULATE' | 'WATCH' | 'HOLD' | 'TRIM' | 'AVOID';
  confidence: number;
  emergentDetails: {
    contrarian: number;
    catalysts: number;
    technicalEarly: number;
    rotation: number;
    seasonality: number;
    positioning: number;
    relativeStrength?: number;  // 🆕 Phase 3
    drawdown?: number;          // 🆕 Phase 3
    valuation?: number;         // 🆕 Phase 4
    macroRegional?: number;     // 🆕 Phase 4
  };
  // 🆕 INFO LIQUIDITÉ (Phase 2)
  liquidityInfo?: {
    score: number;
    regime: 'expansion' | 'contraction' | 'neutral';
    contribution: number;
  };
  // 🆕 INFO POSITIONNEMENT (Phase 2)
  positioningInfo?: {
    score: number;
    signal: 'extreme_bullish' | 'extreme_bearish' | 'bullish' | 'bearish' | 'neutral';
    explanation: string;
    confidence: number;
    hasData: boolean;
  };
  // 🆕 INFO RELATIVE STRENGTH (Phase 3)
  relativeStrengthInfo?: {
    score: number;
    signal: string;
  };
  // 🆕 INFO DRAWDOWN (Phase 3)
  drawdownInfo?: {
    currentDrawdown: number;
    score: number;
    signal: string;
    explanation: string;
  };
  // 🆕 INFO VALUATION (Phase 4)
  valuationInfo?: {
    score: number;
    relativeValuation: string;
    currentPE?: number;
    marketPE?: number;
    explanation: string;
  };
  // 🆕 INFO MACRO REGIONAL (Phase 4)
  macroRegionalInfo?: {
    score: number;
    region: string;
    indicators: {
      growth: number;
      monetary: number;
      demand: number;
    };
    explanation: string;
  };
  // 🔥 V2.1 - NOUVEAUX PILIERS + BREAKDOWN
  institutionalFlows?: any;
  fomoAlert?: any;
  entryTiming?: any;
  breakdownV2?: {
    technical: number;
    emergent: number;
    flows: number;
    fomo: number;
    timing: number;
  };
}

export interface MacroRegime {
  type: 'goldilocks' | 'reflation' | 'stagflation' | 'recession' | 'unknown';
  label: string;
  description: string;
  favoredAssets: string[];
  color: string;
  confidence?: number;
  indicators?: {
    growth: string;
    inflation: string;
    liquidity: string;
    vix: number;
  };
}