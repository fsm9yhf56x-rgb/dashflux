'use client';

import { useState } from 'react';
import { MacroRegime } from '@/lib/types';
import { TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MacroTransitionProbs from './MacroTransitionProbs';
import MacroHistoryCompact from './MacroHistoryCompact';

interface Props {
  regime: MacroRegime | null;
}

export default function MacroRegimeCard({ regime }: Props) {
  const [showProbs, setShowProbs] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!regime) {
    return (
      <div className="bg-gray-100 dark:bg-[#1a1f27] rounded-lg p-4 lg:p-6 border border-gray-200 dark:border-[#3d424d]">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 dark:text-[#71717a]" />
          <div>
            <h3 className="font-semibold text-sm lg:text-base text-gray-600 dark:text-[#a1a1aa]">Chargement...</h3>
          </div>
        </div>
      </div>
    );
  }

  const regimeType = regime.type || 'unknown';
  const label = regime.label || regimeType || 'Unknown';
  const description = regime.description || 'Aucune description disponible';
  const favoredAssets = regime.favoredAssets || [];

  // Goldilocks (Croissance + faible inflation) - ORANGE en dark, VERT en light
  if (regimeType === 'goldilocks') {
    return (
      <div className="bg-green-50 dark:bg-[#1a1f27] rounded-lg p-3 lg:p-4 shadow-lg border-2 border-green-300 dark:border-[#ff6b35] relative overflow-hidden">
        {/* Effet glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 dark:from-[#ff6b35]/10 to-transparent pointer-events-none"></div>
        
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-3 mb-2">
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500 dark:bg-[#ff6b35] animate-pulse"></div>
              <h3 className="text-base lg:text-lg font-bold text-green-700 dark:text-[#ff6b35]">
                {label}
              </h3>
            </div>
            <p className="text-xs lg:text-sm mb-1.5 text-gray-700 dark:text-[#d4d4d8]">
              {description}
            </p>
            {favoredAssets.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-600 dark:text-[#ff8c5f]" />
                <span className="font-medium text-gray-700 dark:text-[#d4d4d8]">
                  Actifs: {favoredAssets.join(', ')}
                </span>
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex gap-1.5 w-full lg:w-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-green-600 hover:bg-green-700 dark:bg-[#ff6b35] dark:hover:bg-[#e55a2b] text-white rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">📅</span>
              <span className="text-[10px] lg:text-xs">Historique</span>
              {showHistory ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
            <button
              onClick={() => setShowProbs(!showProbs)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#2f3542] dark:hover:bg-[#3d424d] text-gray-700 dark:text-[#d4d4d8] border border-gray-300 dark:border-[#3d424d] rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">🔄</span>
              <span className="text-[10px] lg:text-xs">Probas</span>
              {showProbs ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
          </div>
        </div>
        
        {/* Historique (collapsible) */}
        {showHistory && <MacroHistoryCompact currentRegime={regime} />}
        
        {/* Probabilités (collapsible) */}
        {showProbs && <MacroTransitionProbs currentRegime={regimeType} regimeScores={(regime as any).scores} />}
      </div>
    );
  }

  // Reflation (Croissance + inflation) - ORANGE
  if (regimeType === 'reflation') {
    return (
      <div className="bg-orange-50 dark:bg-[#1a1f27] rounded-lg p-3 lg:p-4 shadow-lg border-2 border-orange-300 dark:border-[#e55a2b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 dark:from-[#e55a2b]/10 to-transparent pointer-events-none"></div>
        
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-3 mb-2">
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-orange-500 dark:bg-[#e55a2b] animate-pulse"></div>
              <h3 className="text-base lg:text-lg font-bold text-orange-700 dark:text-[#e55a2b]">
                {label}
              </h3>
            </div>
            <p className="text-xs lg:text-sm mb-1.5 text-gray-700 dark:text-[#d4d4d8]">
              {description}
            </p>
            {favoredAssets.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-orange-600 dark:text-[#ff6b35]" />
                <span className="font-medium text-gray-700 dark:text-[#d4d4d8]">
                  Actifs: {favoredAssets.join(', ')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-1.5 w-full lg:w-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-orange-600 hover:bg-orange-700 dark:bg-[#e55a2b] dark:hover:bg-[#d14d22] text-white rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">📅</span>
              <span className="text-[10px] lg:text-xs">Historique</span>
              {showHistory ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
            <button
              onClick={() => setShowProbs(!showProbs)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#2f3542] dark:hover:bg-[#3d424d] text-gray-700 dark:text-[#d4d4d8] border border-gray-300 dark:border-[#3d424d] rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">🔄</span>
              <span className="text-[10px] lg:text-xs">Probas</span>
              {showProbs ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
          </div>
        </div>
        
        {showHistory && <MacroHistoryCompact currentRegime={regime} />}
        {showProbs && <MacroTransitionProbs currentRegime={regimeType} regimeScores={(regime as any).scores} />}
      </div>
    );
  }

  // Stagflation (Faible croissance + inflation) - ROUGE en light, GRIS en dark
  if (regimeType === 'stagflation') {
    return (
      <div className="bg-red-50 dark:bg-[#1a1f27] rounded-lg p-3 lg:p-4 shadow-lg border-2 border-red-300 dark:border-[#71717a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 dark:from-[#71717a]/10 to-transparent pointer-events-none"></div>
        
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-3 mb-2">
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500 dark:bg-[#71717a] animate-pulse"></div>
              <h3 className="text-base lg:text-lg font-bold text-red-700 dark:text-[#a1a1aa]">
                {label}
              </h3>
            </div>
            <p className="text-xs lg:text-sm mb-1.5 text-gray-700 dark:text-[#d4d4d8]">
              {description}
            </p>
            {favoredAssets.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-red-600 dark:text-[#a1a1aa]" />
                <span className="font-medium text-gray-700 dark:text-[#d4d4d8]">
                  Actifs: {favoredAssets.join(', ')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-1.5 w-full lg:w-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-red-600 hover:bg-red-700 dark:bg-[#71717a] dark:hover:bg-[#5f5f67] text-white rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">📅</span>
              <span className="text-[10px] lg:text-xs">Historique</span>
              {showHistory ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
            <button
              onClick={() => setShowProbs(!showProbs)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#2f3542] dark:hover:bg-[#3d424d] text-gray-700 dark:text-[#d4d4d8] border border-gray-300 dark:border-[#3d424d] rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">🔄</span>
              <span className="text-[10px] lg:text-xs">Probas</span>
              {showProbs ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
          </div>
        </div>
        
        {showHistory && <MacroHistoryCompact currentRegime={regime} />}
        {showProbs && <MacroTransitionProbs currentRegime={regimeType} regimeScores={(regime as any).scores} />}
      </div>
    );
  }

  // Récession (Faible croissance + faible inflation) - BLEU en light, GRIS en dark
  if (regimeType === 'recession') {
    return (
      <div className="bg-blue-50 dark:bg-[#1a1f27] rounded-lg p-3 lg:p-4 shadow-lg border-2 border-blue-300 dark:border-[#3d424d] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 dark:from-[#3d424d]/10 to-transparent pointer-events-none"></div>
        
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-3 mb-2">
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-blue-500 dark:bg-[#71717a] animate-pulse"></div>
              <h3 className="text-base lg:text-lg font-bold text-blue-700 dark:text-[#a1a1aa]">
                {label}
              </h3>
            </div>
            <p className="text-xs lg:text-sm mb-1.5 text-gray-700 dark:text-[#d4d4d8]">
              {description}
            </p>
            {favoredAssets.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-blue-600 dark:text-[#a1a1aa]" />
                <span className="font-medium text-gray-700 dark:text-[#d4d4d8]">
                  Actifs: {favoredAssets.join(', ')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-1.5 w-full lg:w-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-[#3d424d] dark:hover:bg-[#4a515c] text-white dark:text-[#d4d4d8] rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">📅</span>
              <span className="text-[10px] lg:text-xs">Historique</span>
              {showHistory ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
            <button
              onClick={() => setShowProbs(!showProbs)}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 lg:py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#2f3542] dark:hover:bg-[#3d424d] text-gray-700 dark:text-[#d4d4d8] border border-gray-300 dark:border-[#3d424d] rounded-lg transition-all text-xs font-medium"
            >
              <span className="hidden sm:inline">🔄</span>
              <span className="text-[10px] lg:text-xs">Probas</span>
              {showProbs ? <ChevronUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> : <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            </button>
          </div>
        </div>
        
        {showHistory && <MacroHistoryCompact currentRegime={regime} />}
        {showProbs && <MacroTransitionProbs currentRegime={regimeType} regimeScores={(regime as any).scores} />}
      </div>
    );
  }

  // Unknown / Default
  return (
    <div className="bg-gray-100 dark:bg-[#1a1f27] rounded-lg p-3 lg:p-4 shadow-lg border-2 border-gray-300 dark:border-[#3d424d]">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500 dark:text-[#71717a]" />
        <div>
          <h3 className="font-semibold text-sm lg:text-base text-gray-700 dark:text-[#a1a1aa]">{label}</h3>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-[#71717a]">{description}</p>
        </div>
      </div>
    </div>
  );
}