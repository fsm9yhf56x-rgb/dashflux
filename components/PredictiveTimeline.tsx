'use client';

import { AssetScore } from '@/lib/types';
import { Calendar, Target, TrendingUp } from 'lucide-react';

interface Props {
  asset: AssetScore;
}

export default function PredictiveTimeline({ asset }: Props) {
  // Vérification sécurisée
  if (!asset) {
    return (
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-navy-800">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  const getTimelineEvents = () => {
    const events = [];
    
    // Vérification sécurisée des propriétés
    const recommendation = asset?.recommendation || 'HOLD';
    const emergentScore = asset?.emergentScore || 0;
    const catalysts = asset?.emergentDetails?.catalysts || 0;
    
    // Aujourd'hui
    events.push({
      date: 'Aujourd\'hui',
      label: recommendation === 'ACCUMULATE' ? 'Zone d\'accumulation' : 'Surveillance',
      description: `Score Émergent: ${emergentScore}/100`,
      type: 'current',
      icon: '📍',
    });

    // Dans 2 semaines
    if (catalysts >= 70) {
      events.push({
        date: 'Dans 2 semaines',
        label: 'Confirmation des signaux',
        description: 'Vérifier volume et catalyseurs macro',
        type: 'watch',
        icon: '👀',
      });
    }

    // Dans 1 mois
    if (emergentScore >= 70) {
      events.push({
        date: 'Dans 1 mois',
        label: 'Catalyseur majeur attendu',
        description: 'Fed meeting / Event macro important',
        type: 'catalyst',
        icon: '⚡',
      });
    }

    // Dans 3 mois
    events.push({
      date: 'Dans 3 mois',
      label: 'Objectif anticipé',
      description: `Potentiel: ${emergentScore >= 70 ? '+10-15%' : '+5-8%'}`,
      type: 'target',
      icon: '🎯',
    });

    return events;
  };

  const events = getTimelineEvents();

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-navy-800">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-navy-700 dark:text-neon-yellow-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📅 Timeline Prédictive
        </h2>
      </div>

      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-navy-700"></div>

        {/* Events */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="relative flex items-start gap-4 pl-14">
              {/* Icône */}
              <div className="absolute left-0 w-12 h-12 bg-navy-100 dark:bg-neon-yellow-400 dark:bg-opacity-10 rounded-full flex items-center justify-center border-4 border-white dark:border-navy-900 text-2xl">
                {event.icon}
              </div>

              {/* Contenu */}
              <div className="flex-1 bg-gray-50 dark:bg-navy-800 rounded-lg p-4 border border-gray-200 dark:border-navy-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-navy-700 dark:text-neon-yellow-400">
                      {event.date}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {event.label}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    event.type === 'current' ? 'bg-blue-500 text-white' :
                    event.type === 'catalyst' ? 'bg-orange-500 text-white' :
                    event.type === 'target' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {event.type === 'current' ? 'NOW' : 
                     event.type === 'catalyst' ? 'KEY' : 
                     event.type === 'target' ? 'TARGET' : 'WATCH'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-navy-100 dark:bg-navy-800 rounded-lg border border-navy-700 dark:border-navy-600">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-navy-700 dark:text-neon-yellow-400 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-navy-700 dark:text-neon-yellow-400 mb-1">
              💡 Comment utiliser cette timeline ?
            </p>
            <p className="text-xs">
              Cette timeline anticipe les moments clés basés sur les signaux émergents actuels. 
              Les dates sont indicatives et peuvent évoluer selon les catalyseurs macro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}