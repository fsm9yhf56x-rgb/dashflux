'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RegimeHistory {
  date: string;
  regime: string;
  confidence: number;
}

interface Props {
  currentRegime: string;
  regimeScores?: {
    goldilocks: number;
    reflation: number;
    stagflation: number;
    recession: number;
  };
}

export default function MacroTransitionProbs({ currentRegime, regimeScores }: Props) {
  const [transitionProbs, setTransitionProbs] = useState<Record<string, number>>({});

  useEffect(() => {
    calculateTransitionProbs(currentRegime);
  }, [currentRegime, regimeScores]);

  const calculateTransitionProbs = (current: string) => {
    // 🆕 OPTION 1: Si on a les scores du régime, les utiliser directement
    if (regimeScores) {
      // Normaliser les scores en probabilités (somme = 100%)
      const total = Object.values(regimeScores).reduce((a, b) => a + b, 0);
      
      const probs = {
        goldilocks: Math.round((regimeScores.goldilocks / total) * 100),
        reflation: Math.round((regimeScores.reflation / total) * 100),
        stagflation: Math.round((regimeScores.stagflation / total) * 100),
        recession: Math.round((regimeScores.recession / total) * 100)
      };
      
      // Ajuster pour que la somme = 100% exactement
      const sum = Object.values(probs).reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        probs[current] += (100 - sum);
      }
      
      setTransitionProbs(probs);
      return;
    }

    // 🆕 OPTION 2: Utiliser l'historique localStorage (si disponible)
    const stored = localStorage.getItem('dashflux-regime-history');
    const hist: RegimeHistory[] = stored ? JSON.parse(stored) : [];

    // Si pas assez d'historique, utiliser un modèle par défaut intelligent
    if (hist.length < 7) {
      // Au lieu de 25% partout, on donne plus de poids au régime actuel
      const probs: Record<string, number> = {
        goldilocks: 15,
        reflation: 15,
        stagflation: 15,
        recession: 15
      };
      
      // 🆕 Le régime actuel a 55% de probabilité de rester stable
      probs[current] = 55;
      
      setTransitionProbs(probs);
      return;
    }

    // Count transitions from current regime in last 60 days
    const recent = hist.slice(-60);
    const transitions: Record<string, number> = {
      goldilocks: 0,
      reflation: 0,
      stagflation: 0,
      recession: 0
    };

    let totalTransitions = 0;

    for (let i = 0; i < recent.length - 1; i++) {
      if (recent[i].regime === current && recent[i + 1].regime !== current) {
        transitions[recent[i + 1].regime]++;
        totalTransitions++;
      }
    }

    // If current regime is stable (no transitions recently)
    if (totalTransitions === 0) {
      const probs: Record<string, number> = {
        goldilocks: 15,
        reflation: 15,
        stagflation: 15,
        recession: 15
      };
      probs[current] = 55; // High probability to stay
      setTransitionProbs(probs);
      return;
    }

    // Calculate probabilities
    const probs: Record<string, number> = {
      goldilocks: 0,
      reflation: 0,
      stagflation: 0,
      recession: 0
    };

    Object.keys(transitions).forEach(regime => {
      probs[regime] = Math.round((transitions[regime] / totalTransitions) * 100);
    });

    // Adjust current regime probability (tendency to stay)
    const othersSum = Object.entries(probs)
      .filter(([r]) => r !== current)
      .reduce((sum, [, p]) => sum + p, 0);
    
    probs[current] = Math.max(30, 100 - othersSum);

    setTransitionProbs(probs);
  };

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'goldilocks': return '#22c55e';
      case 'reflation': return '#f97316';
      case 'stagflation': return '#ef4444';
      case 'recession': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRegimeLabel = (regime: string) => {
    switch (regime) {
      case 'goldilocks': return '🟢 Goldilocks';
      case 'reflation': return '🟠 Reflation';
      case 'stagflation': return '🔴 Stagflation';
      case 'recession': return '🔵 Récession';
      default: return '⚪ Unknown';
    }
  };

  const getTrendIcon = (prob: number) => {
    if (prob >= 40) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (prob <= 20) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
      <h4 className="text-md font-bold mb-3 text-gray-900 dark:text-white">
        🔄 Probabilités de Transition
      </h4>

      <div className="space-y-3">
        {Object.entries(transitionProbs).map(([regime, prob]) => {
          const isCurrent = currentRegime === regime;
          return (
            <div
              key={regime}
              className={`p-3 rounded-lg border ${
                isCurrent 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon(prob)}
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {getRegimeLabel(regime)}
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      Actuel
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {prob}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${prob}%`,
                    backgroundColor: getRegimeColor(regime)
                  }}
                />
              </div>

              {/* Interpretation */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {isCurrent && prob >= 50 && "Forte probabilité de stabilité"}
                {isCurrent && prob < 50 && "Risque de transition"}
                {!isCurrent && prob >= 30 && "Probabilité élevée"}
                {!isCurrent && prob < 30 && prob >= 15 && "Probabilité modérée"}
                {!isCurrent && prob < 15 && "Faible probabilité"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-gray-700 dark:text-gray-300">
          <strong>💡 Interprétation :</strong> Probabilités calculées à partir des transitions historiques 
          sur 60 jours. Un régime stable (50%+) indique peu de volatilité macro.
        </p>
      </div>
    </div>
  );
}