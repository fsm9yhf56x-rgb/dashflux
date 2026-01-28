'use client';

import { AssetScore } from '@/lib/types';
import { BarChart2, Zap, TrendingUp, RefreshCcw, Calendar } from 'lucide-react';

interface Props {
  score: AssetScore;
}

export default function EmergentPillarsDetail({ score }: Props) {
  // Valeurs par défaut si emergentDetails n'existe pas
  const details = score.emergentDetails || {
    contrarian: 50,
    catalysts: 50,
    technicalEarly: 50,
    rotation: 50,
    seasonality: 50
  };

  const pillars = [
    {
      name: 'Contrarian (25%)',
      score: details.contrarian,
      icon: <BarChart2 className="w-5 h-5" />,
      description: 'Positionnement institutionnel et sentiment extrême',
      details: details.contrarian >= 70 
        ? 'Positionnement extrême détecté - Signal contrarian fort'
        : 'Positionnement modéré - Pas de signal contrarian majeur'
    },
    {
      name: 'Catalyseurs (30%)',
      score: details.catalysts,
      icon: <Zap className="w-5 h-5" />,
      description: 'Événements macro à venir dans les 1-3 prochains mois',
      details: details.catalysts >= 70
        ? 'Catalyseurs majeurs identifiés - Probabilité de mouvement élevée'
        : 'Peu de catalyseurs immédiats - Mouvement graduel attendu'
    },
    {
      name: 'Technique Précoce (20%)',
      score: details.technicalEarly,
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Divergences, consolidations et signaux techniques précoces',
      details: details.technicalEarly >= 70
        ? 'Divergence haussière ou setup technique fort détecté'
        : 'Pas de signal technique précoce majeur'
    },
    {
      name: 'Rotation Sectorielle (15%)',
      score: details.rotation,
      icon: <RefreshCcw className="w-5 h-5" />,
      description: 'Position dans le cycle de rotation macro',
      details: details.rotation >= 70
        ? 'Classe d\'actif favorable dans le cycle macro actuel'
        : 'Position neutre dans le cycle de rotation'
    },
    {
      name: 'Saisonnalité (10%)',
      score: details.seasonality,
      icon: <Calendar className="w-5 h-5" />,
      description: 'Patterns saisonniers historiques',
      details: details.seasonality >= 70
        ? 'Période saisonnière historiquement favorable'
        : 'Saisonnalité neutre ou défavorable'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🔮 Détail du Score Émergent
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyse des 5 piliers qui anticipent où l'action VA se passer dans les 3-6 prochains mois
        </p>
      </div>

      <div className="space-y-4">
        {pillars.map((pillar, index) => (
          <div 
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getScoreBg(pillar.score)}`}>
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {pillar.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pillar.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(pillar.score)}`}>
                  {pillar.score}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  /100
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    pillar.score >= 75 ? 'bg-green-500' :
                    pillar.score >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              {pillar.details}
            </p>
          </div>
        ))}
      </div>

      {/* Score Final */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#00204a] to-[#003366] rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Score Émergent Final
            </h3>
            <p className="text-sm text-gray-300">
              Moyenne pondérée des 5 piliers
            </p>
          </div>
          <div className="text-4xl font-bold text-[#DFFF00]">
            {score.emergentScore.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}