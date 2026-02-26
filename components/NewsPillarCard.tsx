'use client';

import { TrendingUp, TrendingDown, Minus, Newspaper } from 'lucide-react';

interface NewsPillarProps {
  score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  explanation?: string;
}

const sc = (s: number) => s >= 70 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626';

const SENTIMENT = {
  bullish: {
    bg:     'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    color:  '#16a34a',
    label:  'Bullish',
    icon:   <TrendingUp  style={{ width: 14, height: 14 }}/>,
  },
  bearish: {
    bg:     'rgba(220,38,38,0.08)',
    border: 'rgba(220,38,38,0.2)',
    color:  '#dc2626',
    label:  'Bearish',
    icon:   <TrendingDown style={{ width: 14, height: 14 }}/>,
  },
  neutral: {
    bg:     'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.18)',
    color:  '#6b7280',
    label:  'Neutre',
    icon:   <Minus style={{ width: 14, height: 14 }}/>,
  },
};

export default function NewsPillarCard({ score, sentiment, explanation }: NewsPillarProps) {
  const s = SENTIMENT[sentiment] ?? SENTIMENT.neutral;

  return (
    <div style={{ padding: '16px 18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(249,115,22,0.10)',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Newspaper style={{ width: 15, height: 15, color: '#f97316' }}/>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              News Sentiment
            </p>
            <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
              Analyse IA Quotidienne
            </p>
          </div>
        </div>
        <span style={{ fontSize: 22, fontWeight: 900, color: sc(score), letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
          {score}
        </span>
      </div>

      {/* Sentiment badge */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20,
          background: s.bg, border: `1px solid ${s.border}`, color: s.color,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
        }}>
          {s.icon}
          {s.label}
        </span>
      </div>

      {/* Explanation */}
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        {explanation || 'Aucune actualité disponible'}
      </p>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Pondération Score Émergent</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>10%</span>
      </div>
    </div>
  );
}