'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Zap, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { FOMOAlertResult } from '@/lib/fomoAlert';

interface FOMOAlertProps {
  alert: FOMOAlertResult;
  compact?: boolean;
}

// ── Tokens ────────────────────────────────────────────────────────────────────
const LEVEL: Record<string, { color: string; bg: string; border: string }> = {
  moderate: { color: '#16a34a', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)'  },
  elevated: { color: '#d97706', bg: 'rgba(217,119,6,0.07)',  border: 'rgba(217,119,6,0.2)'  },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)' },
  extreme:  { color: '#dc2626', bg: 'rgba(220,38,38,0.07)',  border: 'rgba(220,38,38,0.2)'  },
};

// ── Count-up ──────────────────────────────────────────────────────────────────
function useCountUp(target: number, go: boolean, ms = 900) {
  const [v, setV] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!go || ran.current) return;
    ran.current = true;
    const s0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - s0) / ms, 1);
      setV(Math.round((1 - (1 - p) ** 3) * target * 10) / 10);
      if (p < 1) requestAnimationFrame(tick);
      else setV(target);
    };
    requestAnimationFrame(tick);
  }, [target, go, ms]);
  return v;
}

// ── Velocity cell ─────────────────────────────────────────────────────────────
function VeloCell({ label, value, go, delay }: { label: string; value: number; go: boolean; delay: number }) {
  const d = useCountUp(Math.abs(value), go, 800);
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  const color = value > 0 ? '#16a34a' : value < 0 ? '#dc2626' : 'var(--text-muted)';
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '11px 14px',
        background: hov ? 'rgba(124,58,237,0.03)' : 'var(--glass-bg)',
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(5px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease, background 0.2s',
      }}
    >
      <p style={{ margin: '0 0 5px', fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value > 0 ? '+' : value < 0 ? '-' : ''}{d.toFixed(1)}%
      </p>
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hov,  setHov]  = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px', background: hov ? 'rgba(124,58,237,0.03)' : 'transparent',
          border: 'none', cursor: 'pointer', transition: 'background 0.2s',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: hov ? '#7c3aed' : 'var(--text-faint)', transition: 'color 0.2s', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Interprétation détaillée
        </span>
        <ChevronDown style={{
          width: 14, height: 14, color: hov ? '#7c3aed' : 'var(--text-faint)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.35s cubic-bezier(0.34,1.2,0.64,1), color 0.2s',
        }}/>
      </button>
      <div style={{ maxHeight: open ? '600px' : '0px', overflow: 'hidden', transition: 'max-height 0.45s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ padding: '4px 18px 16px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Icon by level ─────────────────────────────────────────────────────────────
function LevelIcon({ level, color, size = 16 }: { level: string; color: string; size?: number }) {
  const s = { width: size, height: size, color };
  if (level === 'extreme')  return <AlertTriangle style={s}/>;
  if (level === 'high')     return <Zap           style={s}/>;
  if (level === 'elevated') return <Activity      style={s}/>;
  return                           <TrendingUp    style={s}/>;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function FOMOAlert({ alert, compact = false }: FOMOAlertProps) {
  const lv    = LEVEL[alert.level] ?? LEVEL.moderate;
  const isHot = alert.level === 'high' || alert.level === 'extreme';
  const cardRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [go, setGo] = useState(false);
  const scoreDisplay = useCountUp(alert.score, go);

  useEffect(() => { const t = setTimeout(() => setGo(true), 100); return () => clearTimeout(t); }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current; if (!el) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.backgroundImage = `radial-gradient(circle 150px at ${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%, rgba(124,58,237,0.05), transparent 70%)`;
    });
  }, []);

  // ── Compact ───────────────────────────────────────────────────────────────
  if (compact) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, background: lv.bg, border: `1px solid ${lv.border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: lv.bg, border: `1.5px solid ${lv.border}` }}>
        <LevelIcon level={alert.level} color={lv.color} size={15}/>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: lv.color }}>{alert.label}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          Vélocité : {alert.metrics.velocity7d > 0 ? '+' : ''}{alert.metrics.velocity7d}% (7j)
        </p>
      </div>
    </div>
  );

  // ── Full ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={() => { if (cardRef.current) cardRef.current.style.backgroundImage = ''; }}
      style={{ borderRadius: 18, overflow: 'hidden' }}
    >
      <style>{`@keyframes pulse-ring { 0% { transform:scale(1); opacity:0.45; } 100% { transform:scale(1.9); opacity:0; } }`}</style>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 18px 14px',
        background: `linear-gradient(135deg, ${lv.bg}, transparent)`,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon with pulse ring on high/extreme */}
          <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
            {isHot && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 10,
                background: lv.color, opacity: 0.15,
                animation: 'pulse-ring 1.6s ease-out infinite',
              }}/>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: 10, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: lv.bg, border: `1.5px solid ${lv.border}`,
            }}>
              <LevelIcon level={alert.level} color={lv.color}/>
            </div>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{alert.label}</p>
            <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-faint)', marginTop: 1 }}>Score : {alert.score}/100</p>
          </div>
        </div>

        {/* Badge + score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: '4px 10px', borderRadius: 20, background: lv.bg, border: `1px solid ${lv.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: lv.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              ANALYSE MOMENTUM
            </span>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 12, background: lv.bg, border: `1.5px solid ${lv.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: lv.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{scoreDisplay.toFixed(0)}</div>
            <div style={{ fontSize: 8.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>/100</div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {alert.description && (
        <div style={{ padding: '11px 18px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{alert.description}</p>
        </div>
      )}

      {/* ── Velocity cells ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
        <VeloCell label="Vélocité 7 jours"  value={alert.metrics.velocity7d}  go={go} delay={80}  />
        <VeloCell label="Vélocité 30 jours" value={alert.metrics.velocity30d} go={go} delay={160} />
      </div>

      {/* ── Indicateurs additionnels ── */}
      {(alert.metrics.rsiProlonged || alert.metrics.volumeClimax || alert.metrics.distanceBreakout > 0) && (
        <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid var(--border)' }}>
          {alert.metrics.rsiProlonged && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316', flexShrink: 0 }}/>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>RSI en zone extrême prolongée détecté</span>
            </div>
          )}
          {alert.metrics.volumeClimax && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }}/>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Volume climax observé</span>
            </div>
          )}
          {alert.metrics.distanceBreakout > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }}/>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Breakout récent ({alert.metrics.distanceBreakout} jours)</span>
            </div>
          )}
        </div>
      )}

      {/* ── Accordion ── */}
      <Accordion>
        <p style={{ margin: '0 0 10px', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Ce score mesure la vélocité de hausse et le momentum. Un score élevé indique un mouvement rapide qui,
          historiquement, peut être suivi de consolidations. Les données sont factuelles et ne constituent pas
          un conseil d'investissement.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {[
            { range: 'Score > 75',  label: 'Momentum fort',    desc: 'mouvement rapide, risque de consolidation', color: '#dc2626' },
            { range: 'Score 50–75', label: 'Momentum élevé',   desc: 'accélération en cours',                     color: '#f97316' },
            { range: 'Score 25–50', label: 'Momentum modéré',  desc: 'marché calme, peu de signal',               color: '#d97706' },
            { range: 'Score < 25',  label: 'Momentum négatif', desc: 'décélération ou retournement',              color: '#16a34a' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 82 }}>{item.range}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label} — {item.desc}</span>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}