'use client';

import { History, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  ticker: string;
}

export default function SignalHistory({ ticker }: Props) {
  // Données simulées - en production, fetch depuis DB
  const historicalSignals = [
    {
      date: '2025-11-15',
      type: 'ACCUMULATE',
      emergentScore: 85,
      actualScore: 52,
      outcome: 'success',
      performance: '+12.5%',
      duration: '45 jours',
    },
    {
      date: '2025-09-20',
      type: 'WATCH',
      emergentScore: 68,
      actualScore: 48,
      outcome: 'neutral',
      performance: '+3.2%',
      duration: '30 jours',
    },
    {
      date: '2025-07-10',
      type: 'ACCUMULATE',
      emergentScore: 82,
      actualScore: 45,
      outcome: 'success',
      performance: '+15.8%',
      duration: '60 jours',
    },
  ];

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-navy-800">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-navy-700 dark:text-neon-yellow-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📊 Historique des Signaux
        </h2>
      </div>

      <div className="space-y-4">
        {historicalSignals.map((signal, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-navy-800 rounded-lg p-4 border border-gray-200 dark:border-navy-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    signal.type === 'ACCUMULATE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {signal.type}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(signal.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Score Émergent: {signal.emergentScore} | Score Actuel: {signal.actualScore}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {signal.outcome === 'success' ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className={`text-lg font-bold ${
                    signal.outcome === 'success' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {signal.performance}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {signal.duration}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded p-2 text-xs text-gray-600 dark:text-gray-400">
              {signal.outcome === 'success' 
                ? '✅ Signal validé - Objectif atteint'
                : '⚠️ Signal neutre - Performance modeste'}
            </div>
          </div>
        ))}
      </div>

      {/* Stats globales */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">73%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Taux de succès</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+10.5%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Performance moyenne</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">45j</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Durée moyenne</p>
        </div>
      </div>
    </div>
  );
}