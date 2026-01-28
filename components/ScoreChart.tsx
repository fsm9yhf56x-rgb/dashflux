'use client';

import { useState } from 'react';
import { AssetScore } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  scores: AssetScore[];
}

export default function ScoreChart({ scores }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const data = scores.map(s => ({
    name: s.ticker,
    score: s.score,
    fullName: s.name
  }));

  const getColor = (score: number) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Scores Comparatifs
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow">
                        <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Score: {payload[0].value}/100</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}