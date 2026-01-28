'use client';

import { useState } from 'react';
import { AssetScore } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  scores: AssetScore[];
}

export default function EmergentScoreComparison({ scores }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const top10 = scores.slice(0, 10);

  const data = top10.map(s => ({
    name: s.ticker,
    'Score Actuel': s.score,
    'Score Émergent': s.emergentScore,
    fullName: s.name
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Comparaison Actuel vs Émergent (Top 10)
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Score Actuel: {payload[0].value}</p>
                        <p className="text-sm text-[#00204a] dark:text-[#DFFF00]">Score Émergent: {payload[1].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="Score Actuel" fill="#9333ea" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Score Émergent" fill="#00204a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}