'use client';

import { X, Calendar, CheckCircle, Bug, TrendingUp, Zap } from 'lucide-react';
import { useEffect } from 'react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff6b35] to-[#e55a2b] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-white">v2.0.0</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🚀 Nouveautés DashFlux</h2>
              <p className="text-white/80 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                23 janvier 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Introduction */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              🎉 Refonte Majeure - Score Émergent 10 Piliers
            </h3>
            <p className="text-gray-700 dark:text-[#d4d4d8] text-sm leading-relaxed">
              DashFlux passe à la version 2.0 avec un système de scoring ! 
              Le nouveau <strong>Score Émergent</strong> analyse 10 piliers pour anticiper les mouvements 
              <strong> 3 à 6 mois à l'avance</strong>. Cette mise à jour marque un tournant dans l'analyse 
              technique et macro-quantitative.
            </p>
          </div>

          {/* Nouvelles Fonctionnalités */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              Nouvelles Fonctionnalités
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Score Émergent 10 Piliers
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Système prédictif avec 10 piliers d'analyse : Contrarian, Catalysts, Technical Early, 
                    Rotation, Seasonality, Positioning, Relative Strength, Drawdown, Valuation, Macro Regional
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Page Asset Détaillée
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Nouvelle page individuelle par asset avec affichage des 10 piliers, analyse technique complète, 
                    et informations détaillées sur les conditions de marché
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Relative Strength vs SPY
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Calcul automatique de la force relative de chaque asset vs S&P 500 (benchmark) 
                    avec système de cache optimisé
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Analyse Drawdown
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Calcul de la distance depuis l'ATH pour identifier les zones de valorisation attractives 
                    (drawdown &gt; 20% historiquement favorable)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Liste d'Assets Élargie (65)
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Couverture complète : indices, stocks individuels (7 Magnifiques, AI semis), secteurs, 
                    métaux précieux, agriculture (8), cryptos (8), obligations, devises, international
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Améliorations */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Améliorations
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Cache Optimisé (1h → 5 min)
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Réduction du cache pour des données plus fraîches. Cache intelligent du SPY benchmark.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Libellé "Dernière Clôture"
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Changement de "Prix Actuel" en "Dernière Clôture" pour refléter honnêtement 
                    la nature des données Yahoo Finance (prix de clôture, non temps réel).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Navigation Améliorée
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Bouton "Retour au Dashboard" redirige correctement depuis les pages assets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Corrections de bugs */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-500" />
              Corrections de Bugs
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Score Technique affichait 0.0
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Le technicalScore n'était pas retourné dans l'objet AssetScore. Corrigé.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Piliers à 50 (valeurs par défaut)
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Implémentation des fonctions de calcul pour tous les piliers avec algorithmes appropriés.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    Next.js 15 - Params asynchrones
                  </p>
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d8] mt-1">
                    Correction de l'erreur "params is a Promise" dans les routes dynamiques.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Note sur les données */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4">
            <p className="text-xs text-gray-700 dark:text-[#d4d4d8]">
              <strong>ℹ️ Information :</strong> <strong>13 piliers</strong> sont maintenant opérationnels avec calculs en temps réel. 
              Piliers actifs : Contrarian, Catalysts, Technical Early, Rotation, Seasonality, Relative Strength, Drawdown, Macro Regional, Valuation, Positioning, Flux Institutionnels, Analyse Vélocité, Timing Entrée. 
              Note : Positioning (COT limité), Valuation (optimisée pour actions).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-[#0f1419]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
              Consultez la page Méthodologie pour comprendre le système de scoring
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-all font-medium"
            >
              Compris !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}