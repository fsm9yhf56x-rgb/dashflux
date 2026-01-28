'use client';

import { Info } from 'lucide-react';
import { FOMOAlertResult } from '@/lib/fomoAlert';

interface FOMOAlertProps {
  alert: FOMOAlertResult;
  compact?: boolean;
}

export default function FOMOAlert({ alert, compact = false }: FOMOAlertProps) {
  const bgColors = {
    moderate: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    elevated: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    high: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    extreme: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  };

  const textColors = {
    moderate: 'text-green-700 dark:text-green-400',
    elevated: 'text-yellow-700 dark:text-yellow-400',
    high: 'text-orange-700 dark:text-orange-400',
    extreme: 'text-red-700 dark:text-red-400'
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColors[alert.level]}`}>
        <span className="text-lg">{alert.icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${textColors[alert.level]}`}>
            {alert.label}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Vélocité : {alert.metrics.velocity7d > 0 ? '+' : ''}{alert.metrics.velocity7d}% (7j)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-6 ${bgColors[alert.level]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{alert.icon}</span>
          <div>
            <h3 className={`text-xl font-bold ${textColors[alert.level]}`}>
              {alert.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Score : {alert.score}/100
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg ${bgColors[alert.level]} border ${textColors[alert.level]} text-sm font-semibold`}>
          ANALYSE MOMENTUM
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-[#d4d4d8] mb-4">
        {alert.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vélocité 7 jours</p>
          <p className={`text-lg font-bold ${textColors[alert.level]}`}>
            {alert.metrics.velocity7d > 0 ? '+' : ''}{alert.metrics.velocity7d}%
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vélocité 30 jours</p>
          <p className={`text-lg font-bold ${textColors[alert.level]}`}>
            {alert.metrics.velocity30d > 0 ? '+' : ''}{alert.metrics.velocity30d}%
          </p>
        </div>
      </div>

      {/* Indicateurs additionnels */}
      <div className="space-y-2">
        {alert.metrics.rsiProlonged && (
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#d4d4d8]">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>RSI en zone extrême prolongée détecté</span>
          </div>
        )}
        {alert.metrics.volumeClimax && (
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#d4d4d8]">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Volume climax observé</span>
          </div>
        )}
        {alert.metrics.distanceBreakout > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#d4d4d8]">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Breakout récent ({alert.metrics.distanceBreakout} jours)</span>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Interprétation :</strong> Ce score mesure la vélocité de hausse et le momentum. 
            Un score élevé indique un mouvement rapide qui, historiquement, peut être suivi de consolidations. 
            Les données sont factuelles et ne constituent pas un conseil d'investissement.
          </p>
        </div>
      </div>
    </div>
  );
}