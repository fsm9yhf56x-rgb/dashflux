'use client';

import { AssetScore } from '@/lib/types';
import { Star, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  asset: AssetScore;
  isFavorite: boolean;
  onToggleFavorite: (ticker: string) => void;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const RECO: Record<string, { bg: string; color: string; border: string }> = {
  ACCUMULATE: { bg: 'rgba(124,58,237,0.09)',  color: '#7c3aed', border: 'rgba(124,58,237,0.25)' },
  WATCH:      { bg: 'rgba(99,102,241,0.08)',  color: '#6366f1', border: 'rgba(99,102,241,0.2)'  },
  HOLD:       { bg: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)', border: 'rgba(107,114,128,0.18)'},
  TRIM:       { bg: 'rgba(249,115,22,0.08)',  color: '#f97316', border: 'rgba(249,115,22,0.2)'  },
  AVOID:      { bg: 'rgba(239,68,68,0.07)',   color: '#ef4444', border: 'rgba(239,68,68,0.18)'  },
};

const scoreColor = (v: number) => v >= 75 ? '#16a34a' : v >= 50 ? '#d97706' : '#dc2626';
const changeColor = (v: number) => v > 0 ? '#16a34a' : v < 0 ? '#dc2626' : 'var(--text-muted)';

// ── Count-up ──────────────────────────────────────────────────────────────────
function useCountUp(target: number, started: boolean) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!started || done.current) return;
    done.current = true;
    const s = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - s) / 800, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [target, started]);
  return val;
}

// ── Score cell ────────────────────────────────────────────────────────────────
function ScoreCell({ value, label, highlighted, started }: {
  value: number; label: string; highlighted?: boolean; started: boolean;
}) {
  const display = useCountUp(value, started);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: highlighted ? 26 : 22,
        fontWeight: 800,
        color: highlighted ? '#7c3aed' : scoreColor(value),
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        transition: 'color 0.3s',
      }}>
        {display}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600, color: 'var(--text-faint)',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function AssetCard({ asset, isFavorite, onToggleFavorite }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref   = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Spotlight
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      el.style.backgroundImage = `radial-gradient(circle 100px at ${x}% ${y}%, rgba(124,58,237,0.05), transparent)`;
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current; if (el) el.style.backgroundImage = '';
    setHovered(false);
  }, []);

  const reco = RECO[asset.recommendation] ?? RECO.HOLD;
  const composite = (asset.score * 0.4 + asset.emergentScore * 0.6);

  return (
    <div
      ref={ref}
      onClick={() => router.push(`/asset/${asset.ticker}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1.5px solid ${hovered ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '16px',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)'
          : 'translateY(10px)',
        boxShadow: hovered
          ? '0 10px 28px rgba(124,58,237,0.09), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'opacity 0.4s ease, transform 0.3s cubic-bezier(0.34,1.2,0.64,1), border-color 0.2s ease, box-shadow 0.25s ease',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <h3 style={{
              fontSize: 17, fontWeight: 800,
              color: hovered ? '#7c3aed' : 'var(--text-primary)',
              transition: 'color 0.2s ease',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {asset.ticker}
            </h3>
            <span style={{
              padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: reco.bg, color: reco.color, border: `1px solid ${reco.border}`,
              flexShrink: 0,
            }}>
              {asset.recommendation}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {asset.name}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, flexShrink: 0 }}>
          {/* Star */}
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(asset.ticker); }}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: isFavorite ? 'rgba(251,191,36,0.1)' : 'rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2) rotate(-8deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
          >
            <Star style={{
              width: 15, height: 15,
              fill: isFavorite ? '#fbbf24' : 'none',
              color: isFavorite ? '#fbbf24' : '#d1d5db',
              transition: 'fill 0.2s, color 0.2s',
            }}/>
          </button>

          {/* Chevron */}
          <ChevronRight style={{
            width: 16, height: 16,
            color: hovered ? '#7c3aed' : '#d1d5db',
            transform: hovered ? 'translateX(2px)' : 'translateX(0)',
            transition: 'color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}/>
        </div>
      </div>

      {/* ── Scores ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
        marginBottom: 14,
        padding: '12px',
        background: 'var(--bg-subtle)',
        borderRadius: 10,
        border: '1px solid var(--glass-border)',
      }}>
        <ScoreCell value={composite}          label="Composite" highlighted started={visible} />
        <ScoreCell value={asset.score}        label="Actuel"              started={visible} />
        <ScoreCell value={asset.emergentScore} label="Émergent"           started={visible} />
      </div>

      {/* ── Performance ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ v: asset.change1M, label: '1M' }, { v: asset.change3M, label: '3M' }].map(({ v, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {v > 0
                ? <TrendingUp style={{ width: 13, height: 13, color: '#16a34a' }}/>
                : v < 0
                ? <TrendingDown style={{ width: 13, height: 13, color: '#dc2626' }}/>
                : <Minus style={{ width: 13, height: 13, color: 'var(--text-faint)' }}/>}
              <span style={{ fontSize: 12, fontWeight: 600, color: changeColor(v) }}>
                {v > 0 ? '+' : ''}{v.toFixed(1)}%
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
          Conf: {asset.confidence}/100
        </span>
      </div>
    </div>
  );
}