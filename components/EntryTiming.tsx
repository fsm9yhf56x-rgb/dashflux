'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Target, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { EntryTimingResult } from '@/lib/entryTiming';

interface EntryTimingProps {
  timing: EntryTimingResult;
  compact?: boolean;
}

// ── Tokens ────────────────────────────────────────────────────────────────────
const LEVEL: Record<string, { color: string; bg: string; border: string }> = {
  poor:      { color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)' },
  fair:      { color: '#d97706', bg: 'rgba(217,119,6,0.07)',  border: 'rgba(217,119,6,0.2)'  },
  good:      { color: '#6366f1', bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)' },
  excellent: { color: '#16a34a', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)'  },
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

// ── Metric cell ───────────────────────────────────────────────────────────────
function MetricCell({ label, value, sub, color, delay }: { label: string; value: string; sub: string; color: string; delay: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
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
      <p style={{ margin: '0 0 3px', fontSize: 20, fontWeight: 900, color, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-faint)' }}>{sub}</p>
    </div>
  );
}

// ── RSI gauge ─────────────────────────────────────────────────────────────────
function RsiGauge({ rsi, go }: { rsi: number; go: boolean }) {
  const display = useCountUp(rsi, go, 800);
  const isOverbought = rsi > 70;
  const isOversold   = rsi < 30;
  const rsiColor = isOverbought ? '#dc2626' : isOversold ? '#16a34a' : '#7c3aed';
  const rsiLabel = isOverbought ? 'Overbought' : isOversold ? 'Oversold' : 'Zone neutre';

  return (
    <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>RSI</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: rsiColor, padding: '2px 8px', borderRadius: 20, background: `${rsiColor}15`, border: `1px solid ${rsiColor}33` }}>
            {rsiLabel}
          </span>
          <span style={{ fontSize: 20, fontWeight: 900, color: rsiColor, fontVariantNumeric: 'tabular-nums' }}>
            {display.toFixed(1)}
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 6, background: 'var(--border)' }}>
        <div style={{ position: 'absolute', left: '0%',  top: 0, bottom: 0, width: '30%', background: 'rgba(34,197,94,0.15)',  borderRadius: '6px 0 0 6px' }}/>
        <div style={{ position: 'absolute', left: '70%', top: 0, bottom: 0, width: '30%', background: 'rgba(220,38,38,0.15)', borderRadius: '0 6px 6px 0' }}/>
        <div style={{ position: 'absolute', left: '30%', top: -2, bottom: -2, width: 1, background: 'rgba(34,197,94,0.4)' }}/>
        <div style={{ position: 'absolute', left: '70%', top: -2, bottom: -2, width: 1, background: 'rgba(220,38,38,0.4)' }}/>
        <div style={{
          position: 'absolute', top: '50%',
          left: go ? `${Math.min(Math.max(rsi, 0), 100)}%` : '50%',
          transform: 'translate(-50%, -50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: rsiColor, border: '2px solid #fff',
          boxShadow: `0 0 8px ${rsiColor}66`,
          transition: 'left 1s cubic-bezier(0.16,1,0.3,1)',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 8.5, color: '#16a34a', fontWeight: 700 }}>Oversold 30</span>
        <span style={{ fontSize: 8.5, color: 'var(--text-faint)' }}>50</span>
        <span style={{ fontSize: 8.5, color: '#dc2626', fontWeight: 700 }}>Overbought 70</span>
      </div>
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
  if (level === 'excellent') return <Target       style={s}/>;
  if (level === 'good')      return <TrendingUp   style={s}/>;
  if (level === 'fair')      return <Clock        style={s}/>;
  return                            <AlertCircle  style={s}/>;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function EntryTiming({ timing, compact = false }: EntryTimingProps) {
  const lv = LEVEL[timing.level] ?? LEVEL.fair;
  const cardRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [go, setGo] = useState(false);
  const scoreDisplay = useCountUp(timing.score, go);

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
        <LevelIcon level={timing.level} color={lv.color} size={15}/>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: lv.color }}>{timing.label}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Score : {timing.score}/100</p>
      </div>
    </div>
  );

  const ma50Color  = Math.abs(timing.metrics.distanceToMA50)  < 5  ? '#16a34a' : lv.color;
  const ma200Color = Math.abs(timing.metrics.distanceToMA200) < 8  ? '#16a34a' : lv.color;

  // ── Full ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={() => { if (cardRef.current) cardRef.current.style.backgroundImage = ''; }}
      style={{ borderRadius: 18, overflow: 'hidden' }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: '16px 18px 14px',
        background: `linear-gradient(135deg, ${lv.bg}, transparent)`,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: lv.bg, border: `1.5px solid ${lv.border}` }}>
            <LevelIcon level={timing.level} color={lv.color}/>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{timing.label}</p>
            <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-faint)', marginTop: 1 }}>Score : {timing.score}/100</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: '4px 10px', borderRadius: 20, background: lv.bg, border: `1px solid ${lv.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: lv.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>TIMING TECHNIQUE</span>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 12, background: lv.bg, border: `1.5px solid ${lv.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: lv.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{scoreDisplay.toFixed(0)}</div>
            <div style={{ fontSize: 8.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>/100</div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {timing.description && (
        <div style={{ padding: '11px 18px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{timing.description}</p>
        </div>
      )}

      {/* ── Metric grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
        <MetricCell
          label="Distance MA50"
          value={`${timing.metrics.distanceToMA50 > 0 ? '+' : ''}${timing.metrics.distanceToMA50}%`}
          sub={Math.abs(timing.metrics.distanceToMA50) < 5 ? 'Proche support' : 'Éloigné'}
          color={ma50Color}
          delay={80}
        />
        <MetricCell
          label="Distance MA200"
          value={`${timing.metrics.distanceToMA200 > 0 ? '+' : ''}${timing.metrics.distanceToMA200}%`}
          sub={Math.abs(timing.metrics.distanceToMA200) < 8 ? 'Proche support' : 'Éloigné'}
          color={ma200Color}
          delay={140}
        />
        <MetricCell
          label="Support proche"
          value={timing.metrics.nearSupport ? 'Oui' : 'Non'}
          sub={timing.metrics.nearSupport ? 'Conditions favorables' : 'Attendre pullback'}
          color={timing.metrics.nearSupport ? '#16a34a' : '#dc2626'}
          delay={200}
        />
        <MetricCell
          label="RSI"
          value={`${timing.metrics.rsiLevel}`}
          sub={timing.metrics.rsiLevel < 30 ? 'Oversold' : timing.metrics.rsiLevel > 70 ? 'Overbought' : 'Zone neutre'}
          color={timing.metrics.rsiLevel > 70 ? '#dc2626' : timing.metrics.rsiLevel < 30 ? '#16a34a' : '#7c3aed'}
          delay={260}
        />
      </div>

      {/* ── RSI gauge interactive ── */}
      <RsiGauge rsi={timing.metrics.rsiLevel} go={go} />

      {/* ── Accordion ── */}
      <Accordion>
        <p style={{ margin: '0 0 10px', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Ce score analyse le timing technique d'entrée en mesurant la distance aux supports clés (MA50, MA200)
          et l'état du RSI. Un score élevé indique que le prix se trouve près de niveaux techniques favorables.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {[
            { range: 'Score > 80',  label: 'Timing excellent',   desc: 'près des supports, RSI reset',  color: '#16a34a' },
            { range: 'Score 60–80', label: 'Timing favorable',   desc: 'proximité raisonnable',         color: '#84cc16' },
            { range: 'Score 40–60', label: 'Timing neutre',      desc: "considérer d'attendre",         color: '#d97706' },
            { range: 'Score < 40',  label: 'Timing défavorable', desc: 'attendre un pullback',          color: '#dc2626' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 82 }}>{item.range}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label} — {item.desc}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-faint)', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          Cette analyse est basée sur des indicateurs techniques historiques et ne constitue pas un conseil
          d'entrée personnalisé. Les conditions de marché peuvent évoluer rapidement.
        </p>
      </Accordion>
    </div>
  );
}