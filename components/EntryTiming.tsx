'use client';

import { Info } from 'lucide-react';
import { EntryTimingResult } from '@/lib/entryTiming';

interface EntryTimingProps {
  timing: EntryTimingResult;
  compact?: boolean;
}

export default function EntryTiming({ timing, compact = false }: EntryTimingProps) {
  const bgColors = {
    poor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    fair: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    good: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    excellent: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  };

  const textColors = {
    poor: 'text-orange-700 dark:text-orange-400',
    fair: 'text-yellow-700 dark:text-yellow-400',
    good: 'text-blue-700 dark:text-blue-400',
    excellent: 'text-green-700 dark:text-green-400'
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColors[timing.level]}`}>
        <span className="text-lg">{timing.icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${textColors[timing.level]}`}>
            {timing.label}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Score : {timing.score}/100
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-6 ${bgColors[timing.level]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{timing.icon}</span>
          <div>
            <h3 className={`text-xl font-bold ${textColors[timing.level]}`}>
              {timing.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Score : {timing.score}/100
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg ${bgColors[timing.level]} border ${textColors[timing.level]} text-sm font-semibold`}>
          TIMING TECHNIQUE
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-[#d4d4d8] mb-4">
        {timing.description}
      </p>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distance MA50</p>
          <p className={`text-lg font-bold ${textColors[timing.level]}`}>
            {timing.metrics.distanceToMA50 > 0 ? '+' : ''}{timing.metrics.distanceToMA50}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {Math.abs(timing.metrics.distanceToMA50) < 5 ? 'Proche support' : 'Éloigné'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distance MA200</p>
          <p className={`text-lg font-bold ${textColors[timing.level]}`}>
            {timing.metrics.distanceToMA200 > 0 ? '+' : ''}{timing.metrics.distanceToMA200}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {Math.abs(timing.metrics.distanceToMA200) < 8 ? 'Proche support' : 'Éloigné'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">RSI</p>
          <p className={`text-lg font-bold ${textColors[timing.level]}`}>
            {timing.metrics.rsiLevel}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {timing.metrics.rsiLevel < 30 ? 'Oversold' : 
             timing.metrics.rsiLevel > 70 ? 'Overbought' : 
             'Zone neutre'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Support proche</p>
          <p className={`text-lg font-bold ${textColors[timing.level]}`}>
            {timing.metrics.nearSupport ? 'Oui' : 'Non'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {timing.metrics.nearSupport ? 'Conditions favorables' : 'Attendre pullback'}
          </p>
        </div>
      </div>

      {/* Interprétation */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="mb-2">
              <strong>Interprétation :</strong> Ce score analyse le timing technique d'entrée en mesurant 
              la distance aux supports clés (MA50, MA200) et l'état du RSI. Un score élevé indique que 
              le prix se trouve près de niveaux techniques favorables.
            </p>
            <p className="text-xs">
              • <strong>Score &gt; 80</strong> : Timing excellent (près des supports, RSI reset)
              <br />
              • <strong>Score 60-80</strong> : Timing favorable (proximité raisonnable)
              <br />
              • <strong>Score 40-60</strong> : Timing neutre (considérer d'attendre)
              <br />
              • <strong>Score &lt; 40</strong> : Timing défavorable (attendre pullback)
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Note : Cette analyse est basée sur des indicateurs techniques historiques et ne constitue 
          pas un conseil d'entrée personnalisé. Les conditions de marché peuvent évoluer rapidement.
        </p>
      </div>
    </div>
  );
}