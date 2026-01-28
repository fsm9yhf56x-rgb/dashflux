'use client';

import { AssetScore } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

interface Props {
  score: AssetScore;
  rank: number;
}

export default function ScoreCard({ score, rank }: Props) {
  const router = useRouter(); // ✅ CORRIGÉ : Déplacé ici

  const getScoreColor = (s: number) => {
    if (s >= 75) return 'bg-green-500';
    if (s >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getRecommendationIcon = (rec?: string) => {
    switch (rec) {
      case 'ACCUMULATE': return '🚀';
      case 'WATCH': return '👀';
      case 'HOLD': return '✋';
      case 'TRIM': return '✂️';
      case 'AVOID': return '⛔';
      default: return '❓';
    }
  };

  const getRecommendationColor = (rec?: string) => {
    switch (rec) {
      case 'ACCUMULATE': return 'text-green-600 dark:text-green-400';
      case 'WATCH': return 'text-blue-600 dark:text-blue-400';
      case 'HOLD': return 'text-gray-600 dark:text-gray-400';
      case 'TRIM': return 'text-orange-600 dark:text-orange-400';
      case 'AVOID': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div 
      onClick={() => router.push(`/asset/${score.ticker}`)}
      className="bg-white dark:bg-navy-900 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">#{rank}</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {score.name}
              <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{score.ticker}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score Actuel</p>
          <div className={`text-2xl font-bold ${getScoreColor(score.score)} bg-opacity-10 px-3 py-1 rounded text-center text-white`}>
            {score.score}
          </div>
        </div>
        <div>
          <p className="text-xs text-navy-700 dark:text-neon-yellow-400 mb-1">🔮 Score Émergent</p>
          <div className={`text-2xl font-bold ${getScoreColor(score.emergentScore)} bg-opacity-10 px-3 py-1 rounded text-center text-white border-2 border-navy-700 dark:border-neon-yellow-400`}>
            {score.emergentScore}
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 dark:bg-navy-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Recommandation:</span>
          <span className={`text-sm font-bold ${getRecommendationColor(score.recommendation)}`}>
            {getRecommendationIcon(score.recommendation)} {score.recommendation}
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-navy-100 dark:bg-neon-yellow-400 dark:bg-opacity-5 rounded-lg border border-navy-700 dark:border-neon-yellow-400">
        <p className="text-xs font-bold text-navy-700 dark:text-neon-yellow-400 mb-2">Piliers Émergents</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Contrarian:</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white">{score.emergentDetails.contrarian}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Catalyseurs:</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white">{score.emergentDetails.catalysts}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Technique:</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white">{score.emergentDetails.technicalEarly}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Rotation:</span>
            <span className="ml-1 font-semibold text-gray-900 dark:text-white">{score.emergentDetails.rotation}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-navy-800 pt-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">1M</p>
            <p className={`font-medium ${getChangeColor(score.change1M)}`}>
              {score.change1M > 0 ? '+' : ''}{score.change1M.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">3M</p>
            <p className={`font-medium ${getChangeColor(score.change3M)}`}>
              {score.change3M > 0 ? '+' : ''}{score.change3M.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">6M</p>
            <p className={`font-medium ${getChangeColor(score.change6M)}`}>
              {score.change6M > 0 ? '+' : ''}{score.change6M.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}