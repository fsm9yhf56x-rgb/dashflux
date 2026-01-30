import { MacroRegime } from './types';

// Helper: Fetch data from Yahoo Finance
async function fetchYahooData(ticker: string, days: number = 60) {
  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - (days * 24 * 60 * 60);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${start}&period2=${end}&interval=1d`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error('No data');
    }
    
    const closes = data.chart.result[0].indicators.quote[0].close.filter((c: number) => c !== null);
    return closes;
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return null;
  }
}

// Calculate trend (positive or negative)
function calculateTrend(prices: number[]): 'up' | 'down' | 'neutral' {
  if (!prices || prices.length < 2) return 'neutral';
  
  const recent = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const older = prices.slice(-20, -5).reduce((a, b) => a + b, 0) / 15;
  
  if (recent > older * 1.03) return 'up';
  if (recent < older * 0.97) return 'down';
  return 'neutral';
}

// Calculate ratio between two assets
function calculateRatio(prices1: number[], prices2: number[]): number {
  if (!prices1 || !prices2 || prices1.length === 0 || prices2.length === 0) return 1;
  const p1 = prices1[prices1.length - 1];
  const p2 = prices2[prices2.length - 1];
  return p1 / p2;
}

// Detect macro regime based on REAL market data
export async function detectMacroRegime(): Promise<MacroRegime> {
  try {
    console.log('🔍 Detecting macro regime with enhanced indicators...');
    
    // ========================================
    // FETCH ALL INDICATORS
    // ========================================
    
    // 1. VIX (Fear Index)
    const vixPrices = await fetchYahooData('^VIX', 30);
    const currentVIX = vixPrices ? vixPrices[vixPrices.length - 1] : null;
    
    // 2. DXY (Dollar Index)
    const dxyPrices = await fetchYahooData('DX-Y.NYB', 60);
    const dxyTrend = dxyPrices ? calculateTrend(dxyPrices) : 'neutral';
    
    // 3. SPY (Stocks)
    const spyPrices = await fetchYahooData('SPY', 60);
    const spyTrend = spyPrices ? calculateTrend(spyPrices) : 'neutral';
    
    // 4. TLT (Bonds)
    const tltPrices = await fetchYahooData('TLT', 60);
    const tltTrend = tltPrices ? calculateTrend(tltPrices) : 'neutral';
    
    // 5. GLD (Gold)
    const gldPrices = await fetchYahooData('GLD', 60);
    const gldTrend = gldPrices ? calculateTrend(gldPrices) : 'neutral';
    
    // 6. TLT/SPY Ratio (Bonds vs Stocks) - Risk On/Off indicator
    const tltSpyRatio = (tltPrices && spyPrices) ? calculateRatio(tltPrices, spyPrices) : 1;
    const tltSpyTrend = (tltPrices && spyPrices) ? calculateTrend(
      tltPrices.map((tlt: number, i: number) => tlt / (spyPrices[i] || 1))
    ) : 'neutral';
    
    // 7. HYG/LQD Ratio (High Yield vs Investment Grade) - Risk Appetite
    const hygPrices = await fetchYahooData('HYG', 60);
    const lqdPrices = await fetchYahooData('LQD', 60);
    const hygLqdTrend = (hygPrices && lqdPrices) ? calculateTrend(
      hygPrices.map((hyg: number, i: number) => hyg / (lqdPrices[i] || 1))
    ) : 'neutral';
    
    // 8. Copper/Gold Ratio (Economic Growth proxy)
    const copperPrices = await fetchYahooData('COPX', 60); // Copper ETF
    const copperGoldTrend = (copperPrices && gldPrices) ? calculateTrend(
      copperPrices.map((cop: number, i: number) => cop / (gldPrices[i] || 1))
    ) : 'neutral';
    
    // 9. Yield Spread (10Y - 3M) - Recession indicator
    const tnxPrices = await fetchYahooData('^TNX', 60); // 10Y Treasury Yield
    const irxPrices = await fetchYahooData('^IRX', 60); // 3M Treasury Yield
    let yieldSpread = null;
    if (tnxPrices && irxPrices) {
      const tnx = tnxPrices[tnxPrices.length - 1];
      const irx = irxPrices[irxPrices.length - 1];
      yieldSpread = tnx - irx; // Si négatif = inversion = récession probable
    }
    
    console.log(`📊 VIX: ${currentVIX?.toFixed(2)}`);
    console.log(`📊 DXY: ${dxyTrend}, SPY: ${spyTrend}, TLT: ${tltTrend}, GLD: ${gldTrend}`);
    console.log(`📊 TLT/SPY trend: ${tltSpyTrend} (${tltSpyRatio.toFixed(3)})`);
    console.log(`📊 HYG/LQD trend: ${hygLqdTrend} (risk appetite)`);
    console.log(`📊 Copper/Gold: ${copperGoldTrend} (growth proxy)`);
    console.log(`📊 Yield Spread: ${yieldSpread?.toFixed(2)}%`);
    
    // ========================================
    // SCORING SYSTEM (0-100 for each regime)
    // ========================================
    
    let goldilocks = 50;
    let reflation = 50;
    let stagflation = 50;
    let recession = 50;
    
    // === VIX SCORING ===
    if (currentVIX) {
      if (currentVIX < 15) {
        goldilocks += 20;
        reflation += 10;
      } else if (currentVIX < 20) {
        goldilocks += 10;
        reflation += 15;
      } else if (currentVIX < 30) {
        stagflation += 10;
        recession += 10;
      } else {
        stagflation += 15;
        recession += 20;
      }
    }
    
    // === STOCKS TREND ===
    if (spyTrend === 'up') {
      goldilocks += 15;
      reflation += 10;
    } else if (spyTrend === 'down') {
      stagflation += 10;
      recession += 15;
    }
    
    // === BONDS TREND ===
    if (tltTrend === 'up') {
      recession += 20;
      stagflation += 5;
    } else if (tltTrend === 'down') {
      goldilocks += 10;
      reflation += 10;
    }
    
    // === GOLD TREND ===
    if (gldTrend === 'up') {
      stagflation += 15;
      reflation += 10;
      recession += 5;
    } else if (gldTrend === 'down') {
      goldilocks += 10;
    }
    
    // === DOLLAR TREND ===
    if (dxyTrend === 'up') {
      recession += 10;
      stagflation += 5;
    } else if (dxyTrend === 'down') {
      goldilocks += 10;
      reflation += 10;
    }
    
    // === TLT/SPY RATIO (Risk On/Off) ===
    if (tltSpyTrend === 'up') {
      // Flight to safety (bonds outperform stocks)
      recession += 15;
      stagflation += 10;
    } else if (tltSpyTrend === 'down') {
      // Risk on (stocks outperform bonds)
      goldilocks += 15;
      reflation += 10;
    }
    
    // === HYG/LQD RATIO (Risk Appetite) ===
    if (hygLqdTrend === 'up') {
      // High risk appetite
      goldilocks += 10;
      reflation += 10;
    } else if (hygLqdTrend === 'down') {
      // Low risk appetite
      stagflation += 10;
      recession += 10;
    }
    
    // === COPPER/GOLD RATIO (Growth Proxy) ===
    if (copperGoldTrend === 'up') {
      // Economic growth strong
      goldilocks += 10;
      reflation += 15;
    } else if (copperGoldTrend === 'down') {
      // Economic growth weak
      stagflation += 10;
      recession += 15;
    }
    
    // === YIELD SPREAD (Recession Indicator) ===
    if (yieldSpread !== null) {
      if (yieldSpread < 0) {
        // Inverted yield curve = recession warning
        recession += 25;
        stagflation += 5;
      } else if (yieldSpread > 2) {
        // Steep curve = growth expectations
        goldilocks += 15;
        reflation += 10;
      } else if (yieldSpread > 0.5) {
        // Normal curve
        goldilocks += 10;
      }
    }
    
    // ========================================
    // DETERMINE WINNER
    // ========================================
    
    const scores = {
      goldilocks,
      reflation,
      stagflation,
      recession
    };
    
    console.log('📊 Regime Scores:', scores);
    
    const maxScore = Math.max(goldilocks, reflation, stagflation, recession);
    const confidence = Math.round((maxScore / 150) * 100); // Normalize to 0-100
    
    // Determine winning regime
    let type: 'goldilocks' | 'reflation' | 'stagflation' | 'recession' = 'goldilocks';
    if (reflation === maxScore) type = 'reflation';
    else if (stagflation === maxScore) type = 'stagflation';
    else if (recession === maxScore) type = 'recession';
    
    // ========================================
    // RETURN REGIME
    // ========================================
    
    const regimes = {
      goldilocks: {
        type: 'goldilocks' as const,
        label: 'Goldilocks',
        description: 'VIX bas, actions en hausse, obligations faibles - Environnement Risk-On optimal',
        favoredAssets: ['SPY', 'QQQ', 'XLK'],
        color: 'green',
        confidence,
        indicators: {
          growth: 'positive',
          inflation: 'moderate',
          liquidity: 'expansion',
          vix: currentVIX || 0
        },
        scores: {
          goldilocks,
          reflation,
          stagflation,
          recession
        }
      },
      reflation: {
        type: 'reflation' as const,
        label: 'Reflation',
        description: 'Croissance forte, inflation montante - Commodités et matières premières favorisées',
        favoredAssets: ['GLD', 'DBC', 'USO', 'XLE'],
        color: 'orange',
        confidence,
        indicators: {
          growth: 'positive',
          inflation: 'rising',
          liquidity: 'expansion',
          vix: currentVIX || 0
        },
        scores: {
          goldilocks,
          reflation,
          stagflation,
          recession
        }
      },
      stagflation: {
        type: 'stagflation' as const,
        label: 'Stagflation',
        description: 'Croissance faible, inflation élevée - Or et actifs réels protecteurs',
        favoredAssets: ['GLD', 'TIP', 'DBA'],
        color: 'red',
        confidence,
        indicators: {
          growth: 'negative',
          inflation: 'high',
          liquidity: 'contraction',
          vix: currentVIX || 0
        },
        scores: {
          goldilocks,
          reflation,
          stagflation,
          recession
        }
      },
      recession: {
        type: 'recession' as const,
        label: 'Récession',
        description: 'VIX élevé, fuite vers la sécurité - Obligations et cash favorisés',
        favoredAssets: ['TLT', 'SHY', 'GLD'],
        color: 'blue',
        confidence,
        indicators: {
          growth: 'negative',
          inflation: 'low',
          liquidity: 'contraction',
          vix: currentVIX || 0
        },
        scores: {
          goldilocks,
          reflation,
          stagflation,
          recession
        }
      }
    };
    
    console.log(`✅ Detected: ${type.toUpperCase()} (confidence: ${confidence}%)`);
    
    return regimes[type] as MacroRegime;
    
  } catch (error) {
    console.error('❌ Error detecting macro regime:', error);
    return {
      type: 'unknown',
      label: '⚪ Indéterminé',
      description: 'Erreur lors de la récupération des données macro',
      favoredAssets: [],
      color: 'gray',
      confidence: 0,
      indicators: {
        growth: 'unknown',
        inflation: 'unknown',
        liquidity: 'unknown',
        vix: 0
      },
      scores: {
        goldilocks: 25,
        reflation: 25,
        stagflation: 25,
        recession: 25
      }
    } as MacroRegime;
  }
}

// Get dynamic weights based on regime and volatility
export function getDynamicWeights(regime: string, volatility: number): {
  momentum: number;
  volatility: number;
  trend: number;
  seasonality: number;
} {
  let weights = {
    momentum: 0.50,
    volatility: 0.25,
    trend: 0.15,
    seasonality: 0.10
  };

  if (regime === 'recession') {
    weights = {
      momentum: 0.30,
      volatility: 0.40,
      trend: 0.20,
      seasonality: 0.10
    };
  } else if (regime === 'goldilocks') {
    weights = {
      momentum: 0.60,
      volatility: 0.15,
      trend: 0.15,
      seasonality: 0.10
    };
  } else if (regime === 'stagflation') {
    weights = {
      momentum: 0.35,
      volatility: 0.35,
      trend: 0.20,
      seasonality: 0.10
    };
  }

  // Adjust based on market volatility
  if (volatility < 50) {
    weights.momentum += 0.05;
    weights.volatility -= 0.05;
  } else if (volatility > 70) {
    weights.volatility += 0.10;
    weights.momentum -= 0.10;
  }

  return weights;
}