'use client';

import { AssetScore } from '@/lib/types';
import { ChevronDown, ChevronUp, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  scores: AssetScore[];
}

// ── Rank medals ───────────────────────────────────────────────────────────────
const RANK_CONFIG = [
  { gradient: 'linear-gradient(135deg,#fbbf24,#f59e0b)', shadow: 'rgba(251,191,36,0.35)', label: '#92400e' },
  { gradient: 'linear-gradient(135deg,#c0c8d4,#8896a4)', shadow: 'rgba(156,163,175,0.35)', label: '#ffffff' },
  { gradient: 'linear-gradient(135deg,#fb923c,#ea580c)', shadow: 'rgba(251,146,60,0.3)',  label: '#ffffff' },
];

// ── Score color ───────────────────────────────────────────────────────────────
const scoreColor = (v: number) => v >= 75 ? '#16a34a' : v >= 50 ? '#d97706' : '#dc2626';
const scoreBg    = (v: number) => v >= 75 ? 'rgba(34,197,94,0.09)' : v >= 50 ? 'rgba(245,158,11,0.09)' : 'rgba(239,68,68,0.09)';

// ── Recommendation style ──────────────────────────────────────────────────────
const RECO: Record<string, { bg: string; color: string; border: string }> = {
  ACCUMULATE: { bg: 'rgba(124,58,237,0.09)',  color: '#7c3aed', border: 'rgba(124,58,237,0.25)' },
  WATCH:      { bg: 'rgba(99,102,241,0.08)',  color: '#6366f1', border: 'rgba(99,102,241,0.2)'  },
  HOLD:       { bg: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)', border: 'rgba(107,114,128,0.18)'},
  TRIM:       { bg: 'rgba(249,115,22,0.08)',  color: '#f97316', border: 'rgba(249,115,22,0.2)'  },
  AVOID:      { bg: 'rgba(239,68,68,0.07)',   color: '#ef4444', border: 'rgba(239,68,68,0.18)'  },
};

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, started: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    const dur = 800, s = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - s) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
  }, [target, started]);
  return value;
}

// ── Score circle with count-up ────────────────────────────────────────────────
function ScoreCircle({ value, label, highlighted, started }: {
  value: number; label: string; highlighted?: boolean; started: boolean;
}) {
  const display = useCountUp(value, started);
  const r = RECO.ACCUMULATE;
  return (
    <div style={{ textAlign: 'center', minWidth: 60 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: highlighted ? 52 : 44, height: highlighted ? 52 : 44, borderRadius: '50%',
        background: highlighted ? 'rgba(124,58,237,0.08)' : scoreBg(value),
        border: highlighted ? '2px solid rgba(124,58,237,0.35)' : `1.5px solid ${scoreColor(value)}30`,
        boxShadow: highlighted ? '0 0 0 4px rgba(124,58,237,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <span style={{
          fontSize: highlighted ? 16 : 14,
          fontWeight: 800,
          color: highlighted ? '#7c3aed' : scoreColor(value),
          fontVariantNumeric: 'tabular-nums',
        }}>
          {display}
        </span>
      </div>
    </div>
  );
}

// ── Emergent card ─────────────────────────────────────────────────────────────
function EmergentCard({ asset, index, onNavigate }: {
  asset: AssetScore; index: number; onNavigate: (ticker: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const ref   = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const rank  = RANK_CONFIG[index] ?? RANK_CONFIG[2];
  const reco  = RECO[asset.recommendation] ?? RECO.HOLD;

  // Stagger entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120 + 60);
    return () => clearTimeout(t);
  }, [index]);

  // Spotlight
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.backgroundImage = `radial-gradient(circle 120px at ${x}% ${y}%, rgba(124,58,237,0.05), transparent)`;
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current; if (el) el.style.backgroundImage = '';
    setHovered(false);
  }, []);

  const getTopPillar = () => {
    if (!asset.emergentDetails) return { name: 'Momentum', value: asset.momentum };
    const pillars = [
      { name: 'Contrarian',  value: asset.emergentDetails.contrarian },
      { name: 'Catalyseurs', value: asset.emergentDetails.catalysts },
      { name: 'Technique',   value: asset.emergentDetails.technicalEarly },
      { name: 'Rotation',    value: asset.emergentDetails.rotation },
    ];
    return pillars.sort((a, b) => b.value - a.value)[0];
  };
  const topPillar = getTopPillar();

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        background: hovered ? 'var(--glass-bg)' : 'var(--glass-hover)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1.5px solid ${hovered ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: hovered
          ? '0 8px 24px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 2px 8px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms,
                     transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms,
                     border-color 0.25s ease, box-shadow 0.25s ease, background 0.2s ease`,
      }}
      onClick={() => setExpanded(v => !v)}
    >
      {/* ── Main row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

        {/* Rank medal */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: rank.gradient,
          boxShadow: `0 4px 12px ${rank.shadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: rank.label,
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.12) rotate(-5deg)' : 'scale(1)',
        }}>
          {index + 1}
        </div>

        {/* Name + top pillar */}
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: hovered ? '#7c3aed' : 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'color 0.2s ease',
          }}>
            {asset.name}
            <ExternalLink style={{
              width: 11, height: 11,
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translate(2px,-1px)' : 'none',
              transition: 'opacity 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              color: '#7c3aed',
            }}/>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
            {asset.ticker}
            <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
            <span style={{ color: 'var(--text-muted)' }}>Top pilier: </span>
            <span style={{ fontWeight: 600, color: '#4b5563' }}>{topPillar.name} ({topPillar.value})</span>
          </div>
        </div>

        {/* Score circles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <ScoreCircle value={asset.score}         label="Actuel"  started={visible} />
          <ScoreCircle value={asset.emergentScore} label="Émergent" highlighted started={visible} />
        </div>

        {/* Reco pill */}
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: reco.bg, color: reco.color, border: `1px solid ${reco.border}`,
          flexShrink: 0,
        }}>
          {asset.recommendation}
        </span>

        {/* Expand icon */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hovered ? 'rgba(124,58,237,0.07)' : 'rgba(0,0,0,0.03)',
          transition: 'background 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <ChevronDown style={{ width: 14, height: 14, color: hovered ? '#7c3aed' : 'var(--text-faint)' }}/>
        </div>
      </div>

      {/* ── Expanded details ── */}
      <div style={{
        overflow: 'hidden',
        maxHeight: expanded ? 400 : 0,
        opacity: expanded ? 1 : 0,
        transition: 'max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
      }}>
        {asset.emergentDetails && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {/* Pillar mini-bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { name: 'Contrarian',  v: asset.emergentDetails.contrarian },
                { name: 'Catalyseurs', v: asset.emergentDetails.catalysts },
                { name: 'Technique',   v: asset.emergentDetails.technicalEarly },
                { name: 'Rotation',    v: asset.emergentDetails.rotation },
              ].map(p => (
                <div key={p.name} style={{
                  background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 8px',
                  border: '1px solid var(--glass-border)', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: scoreColor(p.v) }}>
                    {p.v}
                  </p>
                  {/* Mini progress bar */}
                  <div style={{ marginTop: 4, height: 3, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${p.v}%`, borderRadius: 99,
                      background: scoreColor(p.v),
                      transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                    }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA insight */}
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 10,
              background: 'rgba(124,58,237,0.05)',
              border: '1px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Zap style={{ width: 13, height: 13, color: '#7c3aed', flexShrink: 0 }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>
                {asset.recommendation === 'ACCUMULATE' ? 'Fenêtre d\'opportunité 1-2 mois' :
                 asset.recommendation === 'WATCH'      ? 'Signal d\'entrée imminent' :
                 'Surveiller les catalyseurs'}
              </span>
            </div>

            {/* Navigate button */}
            <button
              onClick={e => { e.stopPropagation(); onNavigate(asset.ticker); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '10px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-dark, #111827)'; e.currentTarget.style.transform = ''; }}
            >
              <ExternalLink style={{ width: 13, height: 13 }}/>
              Analyse complète de {asset.ticker}
              <ArrowRight style={{ width: 13, height: 13 }}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TopEmergentAssets({ scores }: Props) {
  const router = useRouter();
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const topEmergent = [...scores]
    .sort((a, b) => b.emergentScore - a.emergentScore)
    .slice(0, 3);

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1.5px solid var(--border-card)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
        opacity: headerVisible ? 1 : 0,
        transform: headerVisible ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Animated violet dot */}
          <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#7c3aed', opacity: 0.3,
              animation: 'topEmgPing 2s cubic-bezier(0,0,0.2,1) infinite',
            }}/>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }}/>
          </span>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Top 3 Émergents
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
            border: '1px solid rgba(124,58,237,0.2)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Anticipation 1–3 mois
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topEmergent.map((asset, i) => (
          <EmergentCard
            key={asset.ticker}
            asset={asset}
            index={i}
            onNavigate={t => router.push(`/asset/${t}`)}
          />
        ))}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 14, paddingTop: 12,
        borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--text-faint)', textAlign: 'center',
      }}>
        Cliquez sur une carte pour déplier les piliers · Bouton analyse complète pour le détail
      </p>

      <style>{`
        @keyframes topEmgPing {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}