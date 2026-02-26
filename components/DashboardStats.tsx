'use client';

import { AssetScore } from '@/lib/types';
import { TrendingUp, Eye, Hand, Scissors, Target, Zap } from 'lucide-react';
import { useState } from 'react';

interface Props {
  scores: AssetScore[];
}

const STATS = [
  { key: 'ACCUMULATE', label: 'Accumulate', Icon: TrendingUp, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
  { key: 'WATCH',      label: 'Watch',      Icon: Eye,        color: '#6366f1', bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.18)' },
  { key: 'HOLD',       label: 'Hold',       Icon: Hand,       color: 'var(--text-muted)', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.15)' },
  { key: 'TRIM',       label: 'Trim',       Icon: Scissors,   color: '#f97316', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.18)' },
];

const AVERAGES = [
  { key: 'AVG_SCORE',    label: 'Actuel moy.',   Icon: Target, color: '#16a34a', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.18)' },
  { key: 'AVG_EMERGENT', label: 'Émergent moy.', Icon: Zap,    color: '#d97706', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)' },
];

export default function DashboardStats({ scores }: Props) {
  if (scores.length === 0) return null;

  const counts = scores.reduce((acc, s) => {
    acc[s.recommendation] = (acc[s.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgScore    = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  const avgEmergent = Math.round(scores.reduce((sum, s) => sum + s.emergentScore, 0) / scores.length);

  const VALUES: Record<string, number> = {
    ACCUMULATE: counts['ACCUMULATE'] || 0,
    WATCH:      counts['WATCH']      || 0,
    HOLD:       counts['HOLD']       || 0,
    TRIM:       counts['TRIM']       || 0,
    AVG_SCORE:    avgScore,
    AVG_EMERGENT: avgEmergent,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'stretch',
      gap: 0, marginBottom: 12,
      padding: '0',
      width: '100%', boxSizing: 'border-box' as const,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 12,
    }}>
      {/* Reco counts */}
      {STATS.map((s, i) => (
        <Pill key={s.key} cfg={s} value={VALUES[s.key]}
          isFirst={i === 0} />
      ))}

      {/* Averages */}
      {AVERAGES.map(s => (
        <Pill key={s.key} cfg={s} value={VALUES[s.key]} suffix="/100" />
      ))}

      {/* Total */}
      <div style={{
        padding: '7px 14px', fontSize: 11, color: 'var(--text-faint)',
        fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
        background: 'var(--bg-subtle)',
        border: '1.5px solid var(--border-card)',
        borderLeft: 'none',
        borderRadius: '0 12px 12px 0',
        alignSelf: 'stretch', display: 'flex', alignItems: 'center',
      }}>
        {scores.length} actifs
      </div>
    </div>
  );
}

function Pill({ cfg, value, suffix, isFirst }: {
  cfg: { Icon: React.ElementType; label: string; color: string; bg: string; border: string };
  value: number;
  suffix?: string;
  isFirst?: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '7px 10px',
        background: hov ? cfg.bg.replace('0.07', '0.14').replace('0.08', '0.15').replace('0.06', '0.12') : cfg.bg,
        borderTop: `1.5px solid ${cfg.border}`,
        borderBottom: `1.5px solid ${cfg.border}`,
        borderLeft: isFirst ? `1.5px solid ${cfg.border}` : 'none',
        borderRight: `1px solid var(--border)`,
        borderRadius: isFirst ? '12px 0 0 12px' : '0',
        fontSize: 12, fontWeight: 600,
        color: cfg.color,
        whiteSpace: 'nowrap',
        cursor: 'default',
        transition: 'background 0.22s ease, color 0.22s ease, border-color 0.22s ease',
      }}>
      <cfg.Icon style={{
        width: 11, height: 11, flexShrink: 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hov ? 'scale(1.15)' : 'scale(1)',
      }}/>
      <span style={{
        fontWeight: 500,
        color: 'var(--text-muted)',
        transition: 'color 0.22s ease',
      }}>
        {cfg.label}
      </span>
      <span style={{ fontWeight: 800 }}>{value}{suffix ?? ''}</span>
    </div>
  );
}