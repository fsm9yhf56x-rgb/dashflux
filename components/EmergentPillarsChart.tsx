'use client';

import { AssetScore } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface Props {
  asset: AssetScore;
}

export default function EmergentPillarsChart({ asset }: Props) {
  if (!asset.emergentDetails) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          🔮 Analyse des 5 Piliers Émergents
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Données non disponibles</p>
      </div>
    );
  }

  const pillarsData = [
    { 
      name: 'Contrarian', 
      value: asset.emergentDetails.contrarian,
      description: 'Positionnement extrême des investisseurs',
      fullName: 'Positionnement Contrarian'
    },
    { 
      name: 'Catalyseurs', 
      value: asset.emergentDetails.catalysts,
      description: 'Événements macro à venir et breakouts',
      fullName: 'Catalyseurs Macro'
    },
    { 
      name: 'Technique', 
      value: asset.emergentDetails.technicalEarly,
      description: 'Divergences et signaux précoces',
      fullName: 'Signaux Techniques Précoces'
    },
    { 
      name: 'Rotation', 
      value: asset.emergentDetails.rotation,
      description: 'Favorable selon régime macro actuel',
      fullName: 'Rotation Sectorielle'
    },
    { 
      name: 'Saison', 
      value: asset.emergentDetails.seasonality,
      description: 'Patterns saisonniers historiques',
      fullName: 'Saisonnalité Précoce'
    },
  ];

  const radarData = pillarsData.map(p => ({
    pillar: p.name,
    score: p.value
  }));

  const getColor = (value: number) => {
    if (value >= 75) return '#22c55e';
    if (value >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        🔮 Analyse des 5 Piliers Émergents
      </h3>
      
      {/* Score Émergent Global */}
      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Score Émergent Global</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {asset.emergentScore.toFixed(1)}/100
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pondération</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Contrarian 25% • Catalyseurs 30%<br/>
              Technique 20% • Rotation 15% • Saison 10%
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#666" />
            <PolarAngleAxis 
              dataKey="pillar" 
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar 
              name="Score" 
              dataKey="score" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart with Details */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pillarsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <YAxis domain={[0, 100]} tick={{ fill: '#888' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {pillarsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Explanations */}
      <div className="space-y-3">
        {pillarsData.map((pillar, index) => (
          <div 
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(pillar.value) }}
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pillar.fullName}
                </span>
              </div>
              <span className={`text-lg font-bold ${
                pillar.value >= 75 ? 'text-green-600 dark:text-green-400' :
                pillar.value >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {pillar.value}/100
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pillar.description}
            </p>
            
            {/* Interpretation */}
            <div className="mt-2 text-xs">
              {pillar.value >= 75 && (
                <p className="text-green-700 dark:text-green-300">
                  ✅ <strong>Signal fort :</strong> Ce pilier indique une opportunité émergente
                </p>
              )}
              {pillar.value >= 50 && pillar.value < 75 && (
                <p className="text-yellow-700 dark:text-yellow-300">
                  ⚠️ <strong>Signal modéré :</strong> Surveiller l'évolution de ce pilier
                </p>
              )}
              {pillar.value < 50 && (
                <p className="text-red-700 dark:text-red-300">
                  ❌ <strong>Signal faible :</strong> Pas d'opportunité détectée sur ce pilier
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Méthode Reference */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>📚 Méthodologie :</strong> L'analyse des 5 piliers émergents permet d'identifier 
          les opportunités <em>avant</em> qu'elles ne deviennent évidentes dans le momentum actuel. 
          Un score émergent élevé (75+) suggère qu'un actif est en train de "se positionner" pour une performance future.
        </p>
      </div>
    </div>
  );
}