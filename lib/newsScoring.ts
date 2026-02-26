import { getNewsSentiments, AssetNewsSentiment } from './newsAnalysis';

// ============================================================
// INTÉGRATION DANS LE SCORING EXISTANT
// ============================================================

/**
 * Ajoute le pilier "News Sentiment" au scoring d'un asset
 * 
 * Pondération recommandée : 10-15% du score émergent
 * Car les news sont court-terme mais peuvent créer momentum
 */
export async function addNewsSentimentToScore(
  ticker: string,
  currentEmergentScore: number
): Promise<{
  newEmergentScore: number;
  newsSentiment: AssetNewsSentiment;
  contribution: number;
}> {
  try {
    const sentiments = await getNewsSentiments();
    const sentiment = sentiments.find(s => s.ticker === ticker);

    if (!sentiment) {
      // Pas de données → score neutre, pas d'impact
      return {
        newEmergentScore: currentEmergentScore,
        newsSentiment: {
          ticker,
          score: 50,
          sentiment: 'neutral',
          summary: 'Aucune donnée',
          relevantNews: [],
          lastAnalyzed: new Date().toISOString(),
        },
        contribution: 0,
      };
    }

    // Pondération : 12% du score émergent
    const WEIGHT = 0.12;
    const contribution = sentiment.score * WEIGHT;
    
    // Recalculer le score émergent
    // On assume que currentEmergentScore était sur 88% (13 piliers actuels)
    // On répartit : 88% anciens piliers + 12% news
    const adjustedOldScore = currentEmergentScore * 0.88;
    const newEmergentScore = adjustedOldScore + contribution;

    return {
      newEmergentScore: Math.round(newEmergentScore * 10) / 10,
      newsSentiment: sentiment,
      contribution: Math.round(contribution * 10) / 10,
    };

  } catch (error) {
    console.error('Error adding news sentiment:', error);
    return {
      newEmergentScore: currentEmergentScore,
      newsSentiment: {
        ticker,
        score: 50,
        sentiment: 'neutral',
        summary: 'Erreur analyse',
        relevantNews: [],
        lastAnalyzed: new Date().toISOString(),
      },
      contribution: 0,
    };
  }
}

/**
 * Récupère le détail complet du pilier News pour affichage UI
 */
export async function getNewsPillarDetail(ticker: string): Promise<{
  score: number;
  label: string;
  description: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  relevantNews: string[];
  color: string;
}> {
  try {
    const sentiments = await getNewsSentiments();
    const sentiment = sentiments.find(s => s.ticker === ticker);

    if (!sentiment) {
      return {
        score: 50,
        label: 'News Sentiment',
        description: 'Analyse IA de l\'actualité économique et géopolitique',
        sentiment: 'neutral',
        summary: 'Aucune actualité pertinente disponible',
        relevantNews: [],
        color: '#94a3b8',
      };
    }

    // Déterminer la couleur selon sentiment
    const colorMap = {
      bullish: '#22c55e',
      bearish: '#ef4444',
      neutral: '#94a3b8',
    };

    return {
      score: sentiment.score,
      label: 'News Sentiment',
      description: 'Analyse IA de l\'actualité économique et géopolitique',
      sentiment: sentiment.sentiment,
      summary: sentiment.summary,
      relevantNews: sentiment.relevantNews,
      color: colorMap[sentiment.sentiment],
    };

  } catch (error) {
    console.error('Error getting news pillar detail:', error);
    return {
      score: 50,
      label: 'News Sentiment',
      description: 'Analyse IA de l\'actualité économique et géopolitique',
      sentiment: 'neutral',
      summary: 'Erreur lors du chargement',
      relevantNews: [],
      color: '#94a3b8',
    };
  }
}

/**
 * Batch update : ajoute news sentiment à tous les assets
 */
export async function addNewsSentimentToAllScores(
  scores: Array<{ ticker: string; emergentScore: number }>
): Promise<Array<{ 
  ticker: string; 
  originalEmergentScore: number;
  newEmergentScore: number;
  newsContribution: number;
}>> {
  const sentiments = await getNewsSentiments();

  return scores.map(({ ticker, emergentScore }) => {
    const sentiment = sentiments.find(s => s.ticker === ticker);
    
    if (!sentiment) {
      return {
        ticker,
        originalEmergentScore: emergentScore,
        newEmergentScore: emergentScore,
        newsContribution: 0,
      };
    }

    const WEIGHT = 0.12;
    const contribution = sentiment.score * WEIGHT;
    const adjustedOldScore = emergentScore * 0.88;
    const newEmergentScore = Math.round((adjustedOldScore + contribution) * 10) / 10;

    return {
      ticker,
      originalEmergentScore: emergentScore,
      newEmergentScore,
      newsContribution: Math.round(contribution * 10) / 10,
    };
  });
}