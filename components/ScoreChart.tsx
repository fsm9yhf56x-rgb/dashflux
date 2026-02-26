'use client';

import { useState } from 'react';
import { AssetScore } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown } from 'lucide-react';

interface Props {
  scores: AssetScore[];
}

const getColor = (score: number) => score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';

export default function ScoreChart({ scores }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hov, setHov] = useState(false);

  const data = scores.map(s => ({ name: s.ticker, score: s.score, fullName: s.name }));

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1.5px solid var(--border-card)',
      borderRadius: 20,
      boxShadow: 'var(--glass-shadow)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
          background: hov ? 'rgba(124,58,237,0.03)' : 'transparent',
          transition: 'background 0.2s ease',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: hov ? '#7c3aed' : 'var(--text-primary)', transition: 'color 0.2s' }}>
          Scores Comparatifs
        </span>
        <ChevronDown style={{
          width: 16, height: 16,
          color: hov ? '#7c3aed' : 'var(--text-faint)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.35s cubic-bezier(0.34,1.2,0.64,1), color 0.2s',
        }}/>
      </div>

      {/* Chart */}
      <div style={{
        overflow: 'hidden',
        maxHeight: expanded ? 360 : 0,
        opacity: expanded ? 1 : 0,
        transition: 'max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
      }}>
        <div style={{ padding: '16px 20px 20px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--text-faint)', fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'var(--text-faint)' }}
                axisLine={false} tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: 'rgba(124,58,237,0.04)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const v = payload[0].value as number;
                  return (
                    <div style={{
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 10, padding: '8px 12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {payload[0].payload.fullName}
                      </p>
                      <p style={{ fontSize: 12, color: getColor(v), fontWeight: 600 }}>
                        Score : {v}/100
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={getColor(entry.score)} fillOpacity={0.85}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}