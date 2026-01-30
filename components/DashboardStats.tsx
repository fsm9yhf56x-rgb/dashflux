'use client';

import { AssetScore } from '@/lib/types';
import { TrendingUp, Eye, Hand, Scissors, AlertCircle, Target } from 'lucide-react';

interface Props {
  scores: AssetScore[];
}

export default function DashboardStats({ scores }: Props) {
  if (scores.length === 0) return null;

  // Compter les recommandations
  const counts = scores.reduce((acc, score) => {
    acc[score.recommendation] = (acc[score.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculer score moyen
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  const avgEmergent = Math.round(scores.reduce((sum, s) => sum + s.emergentScore, 0) / scores.length);

  const stats = [
    {
      label: 'ACCUMULATE',
      value: counts['ACCUMULATE'] || 0,
      icon: TrendingUp,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-500',
    },
    {
      label: 'WATCH',
      value: counts['WATCH'] || 0,
      icon: Eye,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-500',
    },
    {
      label: 'HOLD',
      value: counts['HOLD'] || 0,
      icon: Hand,
      color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-500',
    },
    {
      label: 'TRIM',
      value: counts['TRIM'] || 0,
      icon: Scissors,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-500',
    },
    {
      label: 'Score Actuel Moyen',
      value: avgScore,
      icon: Target,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-500',
      suffix: '/100',
    },
    {
      label: 'Score Émergent Moyen',
      value: avgEmergent,
      icon: AlertCircle,
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600',
      suffix: '/100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3 mb-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-lg p-2 lg:p-3 border-2 transition-transform hover:scale-105`}
        >
          <div className="flex items-center gap-1 lg:gap-1.5 mb-1">
            <stat.icon className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
            <p className="text-[9px] lg:text-[10px] font-medium uppercase tracking-wide truncate">
              {stat.label}
            </p>
          </div>
          <p className="text-xl lg:text-2xl font-bold">
            {stat.value}{stat.suffix || ''}
          </p>
        </div>
      ))}
    </div>
  );
}