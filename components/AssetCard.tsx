'use client';

import { AssetScore } from '@/lib/types';
import { Star, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  asset: AssetScore;
  isFavorite: boolean;
  onToggleFavorite: (ticker: string) => void;
}

export default function AssetCard({ asset, isFavorite, onToggleFavorite }: Props) {
  const router = useRouter();
  
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'ACCUMULATE': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'WATCH': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'HOLD': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'TRIM': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'AVOID': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div 
      className="bg-white dark:bg-[#27272a] rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-[#ff6b35] dark:hover:border-[#ff6b35] transition-all cursor-pointer active:scale-[0.98]"
      onClick={() => router.push(`/asset/${asset.ticker}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {asset.ticker}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRecommendationColor(asset.recommendation)}`}>
              {asset.recommendation}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {asset.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(asset.ticker);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Star 
              className={`w-5 h-5 ${isFavorite ? 'fill-[#ff6b35] text-[#ff6b35]' : 'text-gray-400'}`}
            />
          </button>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(asset.score)}`}>
            {asset.score}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Score Global
          </div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(asset.score)}`}>
            {asset.score}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Actuel
          </div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(asset.emergentScore)}`}>
            {asset.emergentScore}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Émergent
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            {getTrendIcon(asset.change1M)}
            <span className={asset.change1M > 0 ? 'text-green-600' : asset.change1M < 0 ? 'text-red-600' : 'text-gray-500'}>
              {asset.change1M > 0 ? '+' : ''}{asset.change1M.toFixed(1)}%
            </span>
            <span className="text-gray-400 text-xs">1M</span>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(asset.change3M)}
            <span className={asset.change3M > 0 ? 'text-green-600' : asset.change3M < 0 ? 'text-red-600' : 'text-gray-500'}>
              {asset.change3M > 0 ? '+' : ''}{asset.change3M.toFixed(1)}%
            </span>
            <span className="text-gray-400 text-xs">3M</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Conf: {asset.confidence}/100
        </div>
      </div>
    </div>
  );
}