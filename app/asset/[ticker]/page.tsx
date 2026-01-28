'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssetScore } from '@/lib/types';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Activity, 
  Target, AlertTriangle, DollarSign,
  BarChart3, LineChart, Zap, RefreshCw
} from 'lucide-react';
// 🔥 COMPOSANTS DÉTAILLÉS v2.1
import InstitutionalFlows from '@/components/InstitutionalFlows';
import FOMOAlert from '@/components/FOMOAlert';
import EntryTiming from '@/components/EntryTiming';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;
  
  const [assetData, setAssetData] = useState<AssetScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/asset/${ticker}`);
      
      if (!response.ok) {
        throw new Error(`Asset non trouvé (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Asset data received:', data);
      setAssetData(data);
    } catch (error) {
      console.error('Error fetching asset:', error);
      setError(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd93d] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-[#d4d4d8]">Chargement de {ticker}...</p>
        </div>
      </div>
    );
  }

  if (error || !assetData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-[#d4d4d8] hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              ❌ Erreur de chargement
            </p>
            <p className="text-gray-700 dark:text-[#d4d4d8]">
              {error || `L'asset ${ticker} n'a pas pu être chargé.`}
            </p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-[#ffd93d]';
    return 'text-red-600 dark:text-red-400';
  };

  const getRecommendationBg = (rec: string) => {
    switch(rec) {
      case 'STRONG_BUY': return 'bg-green-600 dark:bg-[#22c55e]';
      case 'ACCUMULATE': return 'bg-blue-500 dark:bg-[#3b82f6]';
      case 'WATCH': return 'bg-yellow-500 dark:bg-[#ffd93d]';
      default: return 'bg-gray-500 dark:bg-[#6b7280]';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-[#d4d4d8]';
  };

  const getValue = (value: number | undefined, defaultValue: number = 0): number => {
    return value !== undefined && !isNaN(value) ? value : defaultValue;
  };

  // Piliers émergents avec palette cohérente (13 piliers)
  const emergentPillars = [
    {
      name: 'Contrarian',
      score: getValue(assetData.emergentDetails?.contrarian),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Catalysts',
      score: getValue(assetData.emergentDetails?.catalysts),
      icon: <Zap className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      name: 'Technical Early',
      score: getValue(assetData.emergentDetails?.technicalEarly),
      icon: <Activity className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Rotation',
      score: getValue(assetData.emergentDetails?.rotation),
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Seasonality',
      score: getValue(assetData.emergentDetails?.seasonality),
      icon: <LineChart className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      name: 'Positioning',
      score: getValue(assetData.emergentDetails?.positioning),
      icon: <Target className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Relative Strength',
      score: getValue(assetData.relativeStrengthInfo?.score),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Drawdown',
      score: getValue(assetData.drawdownInfo?.score),
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Valuation',
      score: getValue(assetData.valuationInfo?.score),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Macro Regional',
      score: getValue(assetData.macroRegionalInfo?.score),
      icon: <Activity className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    // 🔥 NOUVEAUX PILIERS v2.1 (intégrés)
    {
      name: 'Flux Institutionnels',
      score: getValue(assetData.institutionalFlows?.score),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      name: 'Analyse Vélocité',
      score: getValue(assetData.fomoAlert?.score),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/20'
    },
    {
      name: 'Timing Entrée',
      score: getValue(assetData.entryTiming?.score),
      icon: <Activity className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const hasNoData = getValue(assetData.score) === 0 && 
                     getValue(assetData.technicalScore) === 0 && 
                     getValue(assetData.emergentScore) === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec retour */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-[#d4d4d8] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </button>
          
          <button
            onClick={fetchAssetData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Warning si pas de données */}
        {hasNoData && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6">
            <p className="text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Les données de cet asset sont en cours de calcul. Cliquez sur "Actualiser" dans quelques secondes.
            </p>
          </div>
        )}

        {/* En-tête de l'actif - Compact avec fond orange */}
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {assetData.name || ticker}
              </h1>
              <p className="text-sm text-gray-600 dark:text-[#d4d4d8]">
                {assetData.ticker}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1.5 rounded ${getRecommendationBg(assetData.recommendation || 'WATCH')} text-white text-sm font-bold`}>
                {assetData.recommendation || 'WATCH'}
              </div>
            </div>
          </div>

          {/* Scores principaux */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#1a1f2e] rounded p-2.5">
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">Score Global</p>
              <p className={`text-xl font-bold ${getScoreColor(getValue(assetData.score))}`}>
                {getValue(assetData.score).toFixed(1)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f2e] rounded p-2.5">
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">Score Technique</p>
              <p className={`text-xl font-bold ${getScoreColor(getValue(assetData.technicalScore))}`}>
                {getValue(assetData.technicalScore).toFixed(1)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f2e] rounded p-2.5">
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">Score Émergent</p>
              <p className={`text-xl font-bold ${getScoreColor(getValue(assetData.emergentScore))}`}>
                {getValue(assetData.emergentScore).toFixed(1)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f2e] rounded p-2.5">
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">Dernière Clôture</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${getValue(assetData.lastPrice).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Performances */}
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-orange-200 dark:border-orange-900/30">
            <div>
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">1 Mois</p>
              <p className={`text-base font-bold ${getChangeColor(getValue(assetData.change1M))}`}>
                {getValue(assetData.change1M) > 0 ? '+' : ''}
                {getValue(assetData.change1M).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">3 Mois</p>
              <p className={`text-base font-bold ${getChangeColor(getValue(assetData.change3M))}`}>
                {getValue(assetData.change3M) > 0 ? '+' : ''}
                {getValue(assetData.change3M).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-1">6 Mois</p>
              <p className={`text-base font-bold ${getChangeColor(getValue(assetData.change6M))}`}>
                {getValue(assetData.change6M) > 0 ? '+' : ''}
                {getValue(assetData.change6M).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* 13 Piliers Émergents */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ffd93d]" />
            13 Piliers Émergents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {emergentPillars.map((pillar, index) => (
              <div 
                key={index}
                className={`${pillar.bg} rounded-lg p-3 border border-gray-200 dark:border-[#2f3542]`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={pillar.color}>
                    {pillar.icon}
                  </div>
                  <h3 className="font-semibold text-xs text-gray-900 dark:text-white">
                    {pillar.name}
                  </h3>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(pillar.score)}`}>
                  {pillar.score.toFixed(0)}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-[#0f1419] rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        pillar.score >= 75 ? 'bg-green-500' :
                        pillar.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(pillar.score, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 DÉTAILS DES PILIERS v2.1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Institutional Flows */}
          {assetData.institutionalFlows && (
            <InstitutionalFlows flows={assetData.institutionalFlows} />
          )}
          
          {/* FOMO Alert */}
          {assetData.fomoAlert && (
            <FOMOAlert alert={assetData.fomoAlert} />
          )}
        </div>
        
        {/* Entry Timing (pleine largeur) */}
        {assetData.entryTiming && (
          <div className="mb-6">
            <EntryTiming timing={assetData.entryTiming} />
          </div>
        )}

        {/* Analyse Technique */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Détails Techniques */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Analyse Technique
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-[#9ca3af]">Momentum</span>
                <span className={`font-bold ${getScoreColor(getValue(assetData.momentum))}`}>
                  {getValue(assetData.momentum).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-[#9ca3af]">Volatilité</span>
                <span className={`font-bold ${getScoreColor(getValue(assetData.volatility))}`}>
                  {getValue(assetData.volatility).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-[#9ca3af]">Trend</span>
                <span className={`font-bold ${getScoreColor(getValue(assetData.trend))}`}>
                  {getValue(assetData.trend).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Informations Complémentaires */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Informations Complémentaires
            </h3>
            <div className="space-y-3">
              {assetData.relativeStrengthInfo && assetData.relativeStrengthInfo.rsRatio !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-[#9ca3af]">Force Relative vs SPY</span>
                  <span className={`font-bold ${getScoreColor(assetData.relativeStrengthInfo.score || 0)}`}>
                    {getValue(assetData.relativeStrengthInfo.rsRatio, 1).toFixed(2)}
                  </span>
                </div>
              )}
              {assetData.drawdownInfo && assetData.drawdownInfo.currentDrawdown !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-[#9ca3af]">Drawdown depuis ATH</span>
                  <span className={`font-bold ${getChangeColor(assetData.drawdownInfo.currentDrawdown)}`}>
                    {assetData.drawdownInfo.currentDrawdown.toFixed(1)}%
                  </span>
                </div>
              )}
              {assetData.valuationInfo && assetData.valuationInfo.relativeValuation && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-[#9ca3af]">Valuation</span>
                  <span className="font-bold text-gray-900 dark:text-white capitalize">
                    {assetData.valuationInfo.relativeValuation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explication détaillée */}
        {assetData.explanation && (
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ffd93d]" />
              Analyse Contextuelle
            </h3>
            <p className="text-gray-700 dark:text-[#d4d4d8] leading-relaxed">
              {assetData.explanation}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6">
          <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
            ⚠️ <strong>Disclaimer:</strong> Cette analyse est fournie à titre éducatif uniquement. 
            Les scores sont basés sur des données historiques et des modèles quantitatifs. 
            Ce n'est pas un conseil en investissement personnalisé. Consultez un conseiller financier 
            agréé avant toute décision d'investissement.
          </p>
        </div>
      </div>
    </div>
  );
}