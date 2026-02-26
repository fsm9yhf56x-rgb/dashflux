'use client';

import { useState, useEffect, useRef } from 'react';
import { MacroRegime } from '@/lib/types';
import { TrendingUp, AlertCircle, ChevronDown, ChevronUp, History, BarChart2 } from 'lucide-react';
import MacroTransitionProbs from './MacroTransitionProbs';
import MacroHistoryCompact from './MacroHistoryCompact';

interface Props {
  regime: MacroRegime | null;
}

// ── Regime visual config ──────────────────────────────────────────────────────
type RegimeCfg = {
  dot: string; label_color: string; border: string;
  bg_light: string; bg_dark: string; glow: string; btn_bg: string; btn_color: string;
};

const REGIME_CONFIG: Record<string, RegimeCfg> = {
  goldilocks: {
    dot:         '#22c55e',
    label_color: '#16a34a',
    border:      'rgba(34,197,94,0.35)',
    bg_light:    'rgba(240,253,244,0.9)',
    bg_dark:     'rgba(34,197,94,0.07)',
    glow:        'rgba(34,197,94,0.08)',
    btn_bg:      'rgba(34,197,94,0.1)',
    btn_color:   '#16a34a',
  },
  reflation: {
    dot:         '#f59e0b',
    label_color: '#d97706',
    border:      'rgba(245,158,11,0.35)',
    bg_light:    'rgba(255,251,235,0.9)',
    bg_dark:     'rgba(245,158,11,0.07)',
    glow:        'rgba(245,158,11,0.08)',
    btn_bg:      'rgba(245,158,11,0.1)',
    btn_color:   '#d97706',
  },
  stagflation: {
    dot:         '#ef4444',
    label_color: '#dc2626',
    border:      'rgba(239,68,68,0.35)',
    bg_light:    'rgba(254,242,242,0.9)',
    bg_dark:     'rgba(239,68,68,0.07)',
    glow:        'rgba(239,68,68,0.08)',
    btn_bg:      'rgba(239,68,68,0.08)',
    btn_color:   '#dc2626',
  },
  recession: {
    dot:         '#3b82f6',
    label_color: '#2563eb',
    border:      'rgba(59,130,246,0.35)',
    bg_light:    'rgba(239,246,255,0.9)',
    bg_dark:     'rgba(59,130,246,0.07)',
    glow:        'rgba(59,130,246,0.08)',
    btn_bg:      'rgba(59,130,246,0.08)',
    btn_color:   '#2563eb',
  },
  unknown: {
    dot:         'var(--text-faint)',
    label_color: 'var(--text-muted)',
    border:      'rgba(156,163,175,0.3)',
    bg_light:    'rgba(249,250,251,0.9)',
    bg_dark:     'rgba(156,163,175,0.06)',
    glow:        'rgba(156,163,175,0.04)',
    btn_bg:      'rgba(156,163,175,0.08)',
    btn_color:   'var(--text-muted)',
  },
};

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ── Pulsing dot ───────────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.35,
        animation: 'macroPing 1.8s cubic-bezier(0,0,0.2,1) infinite',
      }}/>
      <span style={{ position: 'relative', borderRadius: '50%', width: 10, height: 10, background: color }}/>
    </span>
  );
}

// ── Toggle button ─────────────────────────────────────────────────────────────
function ToggleBtn({
  active, onClick, icon: Icon, label, cfg,
}: {
  active: boolean; onClick: () => void;
  icon: React.ElementType; label: string;
  cfg: typeof REGIME_CONFIG[string];
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '7px 14px',
        borderRadius: 22,
        background: active || hov ? cfg.btn_bg : 'var(--glass-hover)',
        border: `1px solid ${active ? cfg.border : 'var(--border)'}`,
        color: active || hov ? cfg.btn_color : 'var(--text-muted)',
        fontSize: 12, fontWeight: 600,
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        transform: hov && !active ? 'translateY(-1px)' : 'none',
        boxShadow: active ? `0 2px 12px ${cfg.btn_bg}` : 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>
      <Icon style={{
        width: 13, height: 13,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hov ? 'scale(1.2)' : 'none',
      }}/>
      {label}
      {active
        ? <ChevronUp style={{ width: 12, height: 12 }}/>
        : <ChevronDown style={{ width: 12, height: 12, opacity: 0.6 }}/>}
    </button>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function MacroRegimeCard({ regime }: Props) {
  const [showProbs,   setShowProbs]   = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [visible,     setVisible]     = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
  const dark = useDark();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (!regime) {
    return (
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 18,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <AlertCircle style={{ width: 18, height: 18, color: '#d4d6e2', flexShrink: 0 }}/>
        <span style={{ fontSize: 14, color: 'var(--text-faint)', fontWeight: 500 }}>Chargement du régime macro…</span>
      </div>
    );
  }

  const regimeType    = regime.type || 'unknown';
  const label         = regime.label || regimeType;
  const description   = regime.description || 'Aucune description disponible';
  const favoredAssets = regime.favoredAssets || [];
  const cfg           = REGIME_CONFIG[regimeType] ?? REGIME_CONFIG.unknown;

  return (
    <>
      <style>{`
        @keyframes macroPing {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes macroIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div ref={ref} style={{
        background: dark ? cfg.bg_dark : cfg.bg_light,
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 18,
        padding: '14px 18px',
        boxShadow: `0 4px 24px ${cfg.glow}, 0 1px 6px rgba(0,0,0,0.04)`,
        position: 'relative', overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Ambient glow top-left */}
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.dot}22, transparent 70%)`,
          pointerEvents: 'none',
        }}/>

        {/* Content */}
        <div style={{
          position: 'relative',
          display: 'flex', flexDirection: 'row',
          alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
          marginBottom: showHistory || showProbs ? 14 : 0,
        }}>
          {/* Left: info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <PulseDot color={cfg.dot}/>
              <span style={{
                fontSize: 16, fontWeight: 800, color: cfg.label_color,
                animation: visible ? 'macroIn 0.45s cubic-bezier(0.16,1,0.3,1) 0.1s both' : 'none',
              }}>
                {label}
              </span>
            </div>

            <p style={{
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6,
              animation: visible ? 'macroIn 0.45s cubic-bezier(0.16,1,0.3,1) 0.18s both' : 'none',
            }}>
              {description}
            </p>

            {favoredAssets.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                animation: visible ? 'macroIn 0.45s cubic-bezier(0.16,1,0.3,1) 0.26s both' : 'none',
              }}>
                <TrendingUp style={{ width: 12, height: 12, color: cfg.label_color, flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Actifs favorisés :
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {favoredAssets.map(a => (
                    <span key={a} style={{
                      fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20,
                      background: cfg.btn_bg, color: cfg.label_color,
                      border: `1px solid ${cfg.border}`,
                    }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: buttons */}
          <div style={{
            display: 'flex', gap: 6, flexShrink: 0, alignSelf: 'flex-start',
            animation: visible ? 'macroIn 0.45s cubic-bezier(0.16,1,0.3,1) 0.32s both' : 'none',
          }}>
            <ToggleBtn
              active={showHistory} onClick={() => setShowHistory(v => !v)}
              icon={History} label="Historique" cfg={cfg}
            />
            <ToggleBtn
              active={showProbs} onClick={() => setShowProbs(v => !v)}
              icon={BarChart2} label="Probas" cfg={cfg}
            />
          </div>
        </div>

        {/* Collapsibles */}
        <div style={{
          overflow: 'hidden',
          maxHeight: showHistory ? 600 : 0,
          opacity: showHistory ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        }}>
          {showHistory && <MacroHistoryCompact currentRegime={regime}/>}
        </div>

        <div style={{
          overflow: 'hidden',
          maxHeight: showProbs ? 600 : 0,
          opacity: showProbs ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        }}>
          {showProbs && <MacroTransitionProbs currentRegime={regimeType} regimeScores={(regime as any).scores}/>}
        </div>
      </div>
    </>
  );
}