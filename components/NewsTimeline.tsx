'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Newspaper, Loader2 } from 'lucide-react';

interface NewsSentiment {
  score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  relevantNews: string[];
  lastAnalyzed: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface Props {
  ticker: string;
}

export default function NewsTimeline({ ticker }: Props) {
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState<NewsSentiment | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNewsData();
  }, [ticker]);

  const loadNewsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/news/${ticker}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load news');
      }

      setSentiment(data.sentiment);
      setArticles(data.articles);
    } catch (err: any) {
      console.error('Error loading news:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Analyse des actualités en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!sentiment) {
    return null;
  }

  // Icône et couleur selon sentiment
  const getSentimentDisplay = () => {
    switch (sentiment.sentiment) {
      case 'bullish':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Bullish',
        };
      case 'bearish':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Bearish',
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          label: 'Neutre',
        };
    }
  };

  const display = getSentimentDisplay();
  const Icon = display.icon;

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${display.bgColor} ${display.borderColor} border flex items-center justify-center`}>
            <Newspaper className={`w-5 h-5 ${display.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Analyse Actualité IA
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mise à jour quotidienne • Analysé par Claude
            </p>
          </div>
        </div>

        {/* Score badge */}
        <div className={`px-4 py-2 rounded-lg ${display.bgColor} ${display.borderColor} border flex items-center gap-2`}>
          <Icon className={`w-5 h-5 ${display.color}`} />
          <div className="text-right">
            <p className={`text-xl font-bold ${display.color}`}>{sentiment.score}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{display.label}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-[#0f1419] rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {sentiment.summary}
        </p>
      </div>

      {/* Relevant Topics */}
      {sentiment.relevantNews.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Thèmes Clés Détectés
          </h4>
          <div className="flex flex-wrap gap-2">
            {sentiment.relevantNews.map((topic, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs border border-gray-200 dark:border-gray-700"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Articles Timeline */}
      {articles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Actualités Pertinentes
          </h4>
          <div className="space-y-3">
            {articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="p-4 bg-gray-50 dark:bg-[#0f1419] rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#ff6b35] dark:hover:border-[#ff6b35] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#ff6b35] transition-colors line-clamp-2">
                        {article.title}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#ff6b35] transition-colors flex-shrink-0" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Pas d'articles */}
      {articles.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune actualité spécifique trouvée pour {ticker}
          </p>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Analyse basée sur les actualités économiques, géopolitiques et sectorielles du jour. 
          Score intégré au pilier émergent avec une pondération de 12%.
        </p>
      </div>
    </div>
  );
}