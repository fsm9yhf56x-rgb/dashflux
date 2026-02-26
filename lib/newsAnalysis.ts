import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================
// 1. FETCH NEWS (NewsAPI gratuit 100/jour)
// ============================================================
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export async function fetchRelevantNews(): Promise<NewsArticle[]> {
  const keywords = [
    'stocks', 'gold', 'bitcoin', 'commodities', 'fed', 'inflation',
    'economy', 'interest rates', 'bonds', 'oil', 'crypto', 'dollar'
  ];
  
  const query = keywords.join(' OR ');
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${process.env.NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('NewsAPI error: ' + data.message);
    }

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

// ============================================================
// 2. ANALYSE IA PAR ASSET
// ============================================================
export interface AssetNewsSentiment {
  ticker: string;
  score: number; // 0-100
  sentiment: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  relevantNews: string[]; // titres pertinents
  lastAnalyzed: string;
}

const ASSET_TICKERS = [
  'SPY', 'QQQ', 'GLD', 'TLT', 'BTC', 'ETH', 'OIL', 'DXY', 
  'EEM', 'IWM', 'DIA', 'SLV', 'USO', 'TIP', 'HYG'
]; // Ajoute tes 65 tickers ici

export async function analyzeNewsSentiment(
  articles: NewsArticle[]
): Promise<AssetNewsSentiment[]> {
  if (articles.length === 0) {
    return ASSET_TICKERS.map(ticker => ({
      ticker,
      score: 50,
      sentiment: 'neutral' as const,
      summary: 'Aucune actualité disponible',
      relevantNews: [],
      lastAnalyzed: new Date().toISOString(),
    }));
  }

  // Construire le contexte pour Claude
  const newsContext = articles
    .slice(0, 20) // Top 20 news récentes
    .map((a, i) => `${i + 1}. ${a.title} - ${a.description}`)
    .join('\n\n');

  const prompt = `Tu es un analyste financier expert. Analyse ces actualités récentes et détermine leur impact sur chaque actif financier.

ACTUALITÉS DU JOUR :
${newsContext}

ACTIFS À ANALYSER :
${ASSET_TICKERS.join(', ')}

Pour chaque actif, détermine :
1. Score de sentiment (0-100) où :
   - 0-35 = très bearish
   - 36-45 = bearish
   - 46-54 = neutre
   - 55-65 = bullish
   - 66-100 = très bullish

2. Sentiment général : bullish, bearish, ou neutral

3. Résumé court (1 phrase) de l'impact des news sur cet actif

4. Liste des titres d'actualité pertinents (max 3)

IMPORTANT : Réponds UNIQUEMENT en JSON array avec ce format exact :
[
  {
    "ticker": "SPY",
    "score": 65,
    "sentiment": "bullish",
    "summary": "Fed signale pause des hausses de taux, positif pour actions",
    "relevantNews": ["Fed pauses rate hikes", "S&P reaches new high"]
  },
  ...
]

JSON uniquement, aucun texte avant ou après.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as Array<{
      ticker: string;
      score: number;
      sentiment: 'bullish' | 'bearish' | 'neutral';
      summary: string;
      relevantNews: string[];
    }>;

    // Ajouter lastAnalyzed
    return analysis.map(item => ({
      ...item,
      lastAnalyzed: new Date().toISOString(),
    }));

  } catch (error) {
    console.error('Error analyzing news with Claude:', error);
    
    // Fallback : retourner neutral pour tous
    return ASSET_TICKERS.map(ticker => ({
      ticker,
      score: 50,
      sentiment: 'neutral' as const,
      summary: 'Analyse indisponible',
      relevantNews: [],
      lastAnalyzed: new Date().toISOString(),
    }));
  }
}

// ============================================================
// 3. CACHE SYSTÈME (1x par jour)
// ============================================================
interface CachedNewsData {
  date: string; // YYYY-MM-DD
  sentiments: AssetNewsSentiment[];
  articles: NewsArticle[];
}

let cachedData: CachedNewsData | null = null;

export async function getNewsSentiments(): Promise<AssetNewsSentiment[]> {
  const today = new Date().toISOString().split('T')[0];

  // Si cache existe et est du jour même → retour immédiat
  if (cachedData && cachedData.date === today) {
    console.log('✅ Using cached news sentiments');
    return cachedData.sentiments;
  }

  console.log('🔄 Fetching fresh news and analyzing...');

  // Fetch news
  const articles = await fetchRelevantNews();
  
  // Analyser avec IA
  const sentiments = await analyzeNewsSentiment(articles);

  // Mettre en cache
  cachedData = {
    date: today,
    sentiments,
    articles,
  };

  return sentiments;
}

export async function getNewsForAsset(ticker: string): Promise<{
  sentiment: AssetNewsSentiment;
  articles: NewsArticle[];
}> {
  const sentiments = await getNewsSentiments();
  const sentiment = sentiments.find(s => s.ticker === ticker);

  if (!sentiment) {
    return {
      sentiment: {
        ticker,
        score: 50,
        sentiment: 'neutral',
        summary: 'Aucune donnée disponible',
        relevantNews: [],
        lastAnalyzed: new Date().toISOString(),
      },
      articles: [],
    };
  }

  // Filtrer les articles pertinents
  const relevantArticles = cachedData?.articles.filter(article => {
    const text = (article.title + ' ' + article.description).toLowerCase();
    return sentiment.relevantNews.some(newsTitle => 
      text.includes(newsTitle.toLowerCase().slice(0, 20))
    );
  }) || [];

  return {
    sentiment,
    articles: relevantArticles.slice(0, 5), // Top 5
  };
}