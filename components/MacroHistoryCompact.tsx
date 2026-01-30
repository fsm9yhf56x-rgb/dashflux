'use client';

import { useEffect, useState } from 'react';
import { MacroRegime } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RegimeHistory {
  date: string;
  regime: string;
  confidence: number;
}

interface Props {
  currentRegime: MacroRegime | null;
}

export default function MacroHistoryCompact({ currentRegime }: Props) {
  const [history, setHistory] = useState<RegimeHistory[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const stored = localStorage.getItem('dashflux-regime-history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }

    // Save current regime to history
    if (currentRegime) {
      const newEntry: RegimeHistory = {
        date: new Date().toISOString().split('T')[0],
        regime: currentRegime.type,
        confidence: currentRegime.confidence || 0
      };

      const updated = stored ? JSON.parse(stored) : [];
      
      // Check if today already exists
      const todayExists = updated.some((entry: RegimeHistory) => entry.date === newEntry.date);
      
      if (!todayExists) {
        updated.push(newEntry);
        
        // Keep only last 90 days
        const filtered = updated.slice(-90);
        
        localStorage.setItem('dashflux-regime-history', JSON.stringify(filtered));
        setHistory(filtered);
      }
    }
  }, [currentRegime]);

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

  // Prepare chart data
  const chartData = history.slice(-30).map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    confidence: entry.confidence,
    regime: entry.regime
  }));

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
      <h4 className="text-md font-bold mb-3 text-gray-900 dark:text-white">
        📅 Historique du Régime Macro (30 derniers jours)
      </h4>

      {history.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          L'historique se construira au fur et à mesure. Revenez demain pour voir l'évolution !
        </p>
      )}

      {history.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#888', fontSize: 10 }}
              />
              <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
 formatter={((value: any, name: string, props: any) => [
  `${value}% confiance`,
  getRegimeLabel(props?.payload?.regime || 'unknown')
]) as any}
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Timeline visuelle */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {history.slice(-14).map((entry, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                title={`${entry.date}: ${getRegimeLabel(entry.regime)} (${entry.confidence}%)`}
              >
                <div
                  className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: getRegimeColor(entry.regime) }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(entry.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}