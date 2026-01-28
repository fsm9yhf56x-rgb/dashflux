'use client';

import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { InstitutionalFlowsResult } from '@/lib/institutionalFlows';

interface InstitutionalFlowsProps {
  flows: InstitutionalFlowsResult;
  compact?: boolean;
}

export default function InstitutionalFlows({ flows, compact = false }: InstitutionalFlowsProps) {
  const bgColors = {
    strong_distribution: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    distribution: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    accumulation: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    strong_accumulation: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  };

  const textColors = {
    strong_distribution: 'text-red-700 dark:text-red-400',
    distribution: 'text-orange-700 dark:text-orange-400',
    accumulation: 'text-yellow-700 dark:text-yellow-400',
    strong_accumulation: 'text-green-700 dark:text-green-400'
  };

  const getTrendIcon = () => {
    if (flows.metrics.trend === 'buying') return <TrendingUp className="w-5 h-5" />;
    if (flows.metrics.trend === 'selling') return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const getTrendLabel = () => {
    if (flows.metrics.trend === 'buying') return 'Flux acheteurs';
    if (flows.metrics.trend === 'selling') return 'Flux vendeurs';
    return 'Flux neutres';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColors[flows.level]}`}>
        <span className="text-lg">{flows.icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${textColors[flows.level]}`}>
            {flows.label}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Score : {flows.score}/100
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-6 ${bgColors[flows.level]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{flows.icon}</span>
          <div>
            <h3 className={`text-xl font-bold ${textColors[flows.level]}`}>
              {flows.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Score : {flows.score}/100
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${bgColors[flows.level]} border ${textColors[flows.level]}`}>
          {getTrendIcon()}
          <span className="text-sm font-semibold">{getTrendLabel()}</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-[#d4d4d8] mb-4">
        {flows.description}
      </p>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">On-Balance Volume</p>
          <div className="flex items-center gap-2">
            <p className={`text-lg font-bold ${textColors[flows.level]}`}>
              {flows.metrics.obv > 0 ? '+' : ''}{flows.metrics.obv}%
            </p>
            {flows.metrics.obv > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Tendance du volume cumulé
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Money Flow Index</p>
          <p className={`text-lg font-bold ${textColors[flows.level]}`}>
            {flows.metrics.mfi}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {flows.metrics.mfi > 50 ? 'Pression acheteuse' : 'Pression vendeuse'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">A/D Line</p>
          <p className={`text-lg font-bold ${textColors[flows.level]}`}>
            {flows.metrics.adLine > 0 ? '+' : ''}{flows.metrics.adLine}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Ligne Accumulation/Distribution
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tendance globale</p>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <p className={`text-sm font-bold ${textColors[flows.level]}`}>
              {getTrendLabel()}
            </p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Basée sur 3 indicateurs
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span>Distribution</span>
          <span>Accumulation</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              flows.score >= 76 ? 'bg-green-500' :
              flows.score >= 51 ? 'bg-yellow-500' :
              flows.score >= 26 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${flows.score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Interprétation */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="mb-2">
              <strong>Interprétation :</strong> Ce score analyse les flux de volume et le momentum pour détecter 
              l'accumulation ou la distribution. Les indicateurs OBV, MFI et A/D Line permettent d'identifier 
              les phases où les acheteurs ou vendeurs dominent le marché.
            </p>
            <p className="text-xs">
              • <strong>Score &gt; 75</strong> : Accumulation forte (flux acheteurs significatifs)
              <br />
              • <strong>Score 51-75</strong> : Accumulation modérée (flux acheteurs observés)
              <br />
              • <strong>Score 26-50</strong> : Distribution modérée (flux vendeurs observés)
              <br />
              • <strong>Score &lt; 26</strong> : Distribution forte (flux vendeurs significatifs)
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Note : Ces analyses sont basées sur des indicateurs techniques calculés à partir de données historiques. 
          Elles ne constituent pas un conseil en investissement et ne garantissent pas les résultats futurs.
        </p>
      </div>
    </div>
  );
}