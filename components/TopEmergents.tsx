'use client';

import { AssetScore } from '@/lib/types';
import { ChevronDown, ChevronUp, ExternalLink, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  scores: AssetScore[];
}

export default function TopEmergentAssets({ scores }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  // Trier par score émergent
  const topEmergent = [...scores]
    .sort((a, b) => b.emergentScore - a.emergentScore)
    .slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-orange-600 dark:text-[#ff6b35]';
    if (score >= 65) return 'text-orange-500 dark:text-[#ff8c5f]';
    return 'text-gray-600 dark:text-[#a1a1aa]';
  };

  const getRecommendationStyle = (rec?: string) => {
    switch (rec) {
      case 'ACCUMULATE': return 'bg-orange-600 hover:bg-orange-700 dark:bg-[#ff6b35] dark:hover:bg-[#e55a2b] text-white';
      case 'WATCH': return 'bg-orange-400 hover:bg-orange-500 dark:bg-[#ff8c5f] dark:hover:bg-[#ff6b35] text-white';
      case 'HOLD': return 'bg-gray-400 hover:bg-gray-500 dark:bg-[#71717a] dark:hover:bg-[#5f5f67] text-white';
      case 'TRIM': return 'bg-gray-300 hover:bg-gray-400 dark:bg-[#3d424d] dark:hover:bg-[#4a515c] text-gray-700 dark:text-[#d4d4d8]';
      default: return 'bg-gray-300 hover:bg-gray-400 dark:bg-[#3d424d] dark:hover:bg-[#4a515c] text-gray-600 dark:text-[#a1a1aa]';
    }
  };

  const getRankEmoji = (index: number) => {
    return ['🥇', '🥈', '🥉'][index];
  };

  const getTopPillar = (asset: AssetScore) => {
    if (!asset.emergentDetails) {
      return { name: 'Momentum', value: asset.momentum };
    }
    
    const pillars = [
      { name: 'Contrarian', value: asset.emergentDetails.contrarian },
      { name: 'Catalyseurs', value: asset.emergentDetails.catalysts },
      { name: 'Technique', value: asset.emergentDetails.technicalEarly },
      { name: 'Rotation', value: asset.emergentDetails.rotation },
    ];

    return pillars.sort((a, b) => b.value - a.value)[0];
  };

  const handleViewDetails = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/asset/${ticker}`);
  };

  return (
    <div className="bg-white dark:bg-[#1a1f27] rounded-lg shadow-lg p-4 lg:p-6 border-2 border-orange-200 dark:border-[#ff6b35] relative overflow-hidden">
      {/* Effet glow orange */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 dark:from-[#ff6b35]/5 to-transparent pointer-events-none"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-orange-500 dark:bg-[#ff6b35] animate-pulse"></div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-[#f5f5f5]">
              Top 3 Émergents
            </h2>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-[#71717a]">
            Anticipation 1-3 mois
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {topEmergent.map((asset, index) => {
            const isExpanded = expanded === index;
            const topPillar = getTopPillar(asset);

            return (
              <div
                key={asset.ticker}
                onClick={() => setExpanded(isExpanded ? null : index)}
                className="bg-gray-50 dark:bg-[#252b36] rounded-lg p-3 lg:p-4 border border-gray-200 dark:border-[#3d424d] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-200 group"
              >
                {/* Ligne principale */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4">
                  {/* Gauche : Rank + Asset */}
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0 w-full lg:w-auto">
                    <span className="text-2xl lg:text-3xl flex-shrink-0">{getRankEmoji(index)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm lg:text-base font-bold text-gray-900 dark:text-[#f5f5f5] truncate">
                        {asset.name}
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-[#a1a1aa] truncate">
                        {asset.ticker} • {topPillar.name}: {topPillar.value}
                      </p>
                    </div>
                  </div>

                  {/* Centre : Scores */}
                  <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 w-full lg:w-auto">
                    <div className="text-center min-w-[50px] lg:min-w-[60px]">
                      <p className="text-[10px] lg:text-xs text-gray-500 dark:text-[#71717a] mb-1">Actuel</p>
                      <p className="text-lg lg:text-xl font-bold text-gray-700 dark:text-[#d4d4d8]">
                        {asset.score}
                      </p>
                    </div>
                    <div className="text-center flex-1 lg:min-w-[80px] px-2 lg:px-3 py-1.5 lg:py-2 bg-orange-100 dark:bg-[#ff6b35]/10 rounded-lg border-2 border-orange-400 dark:border-[#ff6b35]">
                      <p className="text-[10px] lg:text-xs text-orange-700 dark:text-[#ff6b35] font-semibold mb-1">Émergent</p>
                      <p className={`text-lg lg:text-xl font-bold ${getScoreColor(asset.emergentScore)}`}>
                        {asset.emergentScore}
                      </p>
                    </div>
                  </div>

                  {/* Droite : Recommandation + Boutons */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-full lg:w-auto">
                    <span className={`text-[10px] lg:text-xs font-bold px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg whitespace-nowrap ${getRecommendationStyle(asset.recommendation)} flex-1 lg:flex-initial text-center`}>
                      {asset.recommendation}
                    </span>
                    
                    {/* Bouton Voir Détails - Cache label sur très petit écran */}
                    <button
                      onClick={(e) => handleViewDetails(asset.ticker, e)}
                      className="flex items-center justify-center gap-1 px-2 lg:px-3 py-2 lg:py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 min-w-[40px] lg:min-w-auto"
                      title="Voir l'analyse complète"
                    >
                      <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline text-[10px] lg:text-xs">Détails</span>
                    </button>
                    
                    {/* Chevron Expand */}
                    <div className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 dark:text-[#a1a1aa] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 dark:text-[#a1a1aa] flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails dépliables */}
                {isExpanded && asset.emergentDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#3d424d]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                      <div className="text-center p-2 lg:p-3 bg-white dark:bg-[#1a1f27] rounded-lg border border-gray-200 dark:border-[#3d424d]">
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-[#71717a] mb-1">Contrarian</p>
                        <p className={`text-base lg:text-lg font-bold ${getScoreColor(asset.emergentDetails.contrarian)}`}>
                          {asset.emergentDetails.contrarian}
                        </p>
                      </div>
                      <div className="text-center p-2 lg:p-3 bg-white dark:bg-[#1a1f27] rounded-lg border border-gray-200 dark:border-[#3d424d]">
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-[#71717a] mb-1">Catalyseurs</p>
                        <p className={`text-base lg:text-lg font-bold ${getScoreColor(asset.emergentDetails.catalysts)}`}>
                          {asset.emergentDetails.catalysts}
                        </p>
                      </div>
                      <div className="text-center p-2 lg:p-3 bg-white dark:bg-[#1a1f27] rounded-lg border border-gray-200 dark:border-[#3d424d]">
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-[#71717a] mb-1">Technique</p>
                        <p className={`text-base lg:text-lg font-bold ${getScoreColor(asset.emergentDetails.technicalEarly)}`}>
                          {asset.emergentDetails.technicalEarly}
                        </p>
                      </div>
                      <div className="text-center p-2 lg:p-3 bg-white dark:bg-[#1a1f27] rounded-lg border border-gray-200 dark:border-[#3d424d]">
                        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-[#71717a] mb-1">Rotation</p>
                        <p className={`text-base lg:text-lg font-bold ${getScoreColor(asset.emergentDetails.rotation)}`}>
                          {asset.emergentDetails.rotation}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-2 lg:p-3 bg-orange-50 dark:bg-[#2f3542] rounded-lg border border-orange-200 dark:border-[#3d424d]">
                      <span className="text-orange-700 dark:text-[#ff8c5f] font-bold text-sm lg:text-base">
                        🎯 {asset.recommendation}
                      </span>
                      <span className="text-gray-700 dark:text-[#d4d4d8] text-xs lg:text-sm"> - {
                        asset.recommendation === 'ACCUMULATE' 
                          ? 'Fenêtre d\'opportunité 1-2 mois'
                          : asset.recommendation === 'WATCH'
                          ? 'Signal d\'entrée imminent'
                          : 'Surveiller les catalyseurs'
                      }</span>
                    </div>
                    
                    {/* Bouton Voir Analyse Complète (version expanded) */}
                    <button
                      onClick={(e) => handleViewDetails(asset.ticker, e)}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm lg:text-base font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="truncate">Voir l'analyse complète de {asset.ticker}</span>
                      <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#3d424d] text-xs lg:text-sm text-gray-500 dark:text-[#71717a] text-center">
          💡 <span className="hidden sm:inline">Cliquez sur une carte pour déplier • </span>Bouton <ExternalLink className="w-3 h-3 inline" /> pour l'analyse complète
        </div>
      </div>
    </div>
  );
}