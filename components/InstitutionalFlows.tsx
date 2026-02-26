'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { InstitutionalFlowsResult } from '@/lib/institutionalFlows';

interface InstitutionalFlowsProps {
  flows: InstitutionalFlowsResult;
  compact?: boolean;
}

// ── Tokens ──────────────────────────────────────────────────────────────────
const LEVEL: Record<string, { color: string; bg: string; border: string }> = {
  strong_distribution: { color: '#dc2626', bg: 'rgba(220,38,38,0.07)',  border: 'rgba(220,38,38,0.2)'  },
  distribution:        { color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)' },
  accumulation:        { color: '#d97706', bg: 'rgba(217,119,6,0.07)',  border: 'rgba(217,119,6,0.2)'  },
  strong_accumulation: { color: '#16a34a', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)'  },
};

// ── Count-up ─────────────────────────────────────────────────────────────────
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

// ── Stat cell ────────────────────────────────────────────────────────────────
function StatCell({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
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
      <p style={{ margin: '0 0 5px', fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
      {children}
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

// ══════════════════════════════════════════════════════════════════════════════
export default function InstitutionalFlows({ flows, compact = false }: InstitutionalFlowsProps) {
  const lv = LEVEL[flows.level] ?? LEVEL.distribution;
  const cardRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [go, setGo] = useState(false);
  const scoreDisplay = useCountUp(flows.score, go);

  useEffect(() => { const t = setTimeout(() => setGo(true), 100); return () => clearTimeout(t); }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current; if (!el) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.backgroundImage = `radial-gradient(circle 160px at ${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%, rgba(124,58,237,0.05), transparent 70%)`;
    });
  }, []);

  const getTrendIcon = (sz = 14) => {
    const s = { width: sz, height: sz };
    return flows.metrics.trend === 'buying'  ? <TrendingUp  style={{ ...s, color: '#16a34a' }}/> :
           flows.metrics.trend === 'selling' ? <TrendingDown style={{ ...s, color: '#dc2626' }}/> :
                                               <Minus       style={{ ...s, color: 'var(--text-muted)' }}/>;
  };

  const getTrendLabel = () =>
    flows.metrics.trend === 'buying'  ? 'Flux acheteurs' :
    flows.metrics.trend === 'selling' ? 'Flux vendeurs'  : 'Flux neutres';

  const HeaderIcon = () => (
    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: lv.bg, border: `1.5px solid ${lv.border}` }}>
      {flows.metrics.trend === 'buying'
        ? <TrendingUp  style={{ width: 16, height: 16, color: lv.color }}/>
        : flows.metrics.trend === 'selling'
          ? <TrendingDown style={{ width: 16, height: 16, color: lv.color }}/>
          : <Minus style={{ width: 16, height: 16, color: lv.color }}/>}
    </div>
  );

  // ── Compact ───────────────────────────────────────────────────────────────
  if (compact) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, background: lv.bg, border: `1px solid ${lv.border}` }}>
      <HeaderIcon />
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: lv.color }}>{flows.label}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Score : {flows.score}/100</p>
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
      {/* ── Header ── */}
      <div style={{
        padding: '16px 18px 14px',
        background: `linear-gradient(135deg, ${lv.bg}, transparent)`,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HeaderIcon />
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{flows.label}</p>
            <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-faint)', marginTop: 1 }}>Score : {flows.score}/100</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: lv.bg, border: `1px solid ${lv.border}` }}>
            {getTrendIcon(12)}
            <span style={{ fontSize: 11, fontWeight: 700, color: lv.color }}>{getTrendLabel()}</span>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 12, background: lv.bg, border: `1.5px solid ${lv.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: lv.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{scoreDisplay.toFixed(0)}</div>
            <div style={{ fontSize: 8.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>/100</div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {flows.description && (
        <div style={{ padding: '11px 18px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{flows.description}</p>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
        <StatCell label="On-Balance Volume" delay={80}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: flows.metrics.obv > 0 ? '#16a34a' : '#dc2626', letterSpacing: '-0.02em' }}>
              {flows.metrics.obv > 0 ? '+' : ''}{flows.metrics.obv}%
            </p>
            {flows.metrics.obv > 0
              ? <TrendingUp  style={{ width: 13, height: 13, color: '#16a34a' }}/>
              : <TrendingDown style={{ width: 13, height: 13, color: '#dc2626' }}/>}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-faint)' }}>Tendance du volume cumulé</p>
        </StatCell>

        <StatCell label="Money Flow Index" delay={140}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: flows.metrics.mfi > 50 ? '#16a34a' : '#dc2626', letterSpacing: '-0.02em' }}>
            {flows.metrics.mfi}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-faint)' }}>
            {flows.metrics.mfi > 50 ? 'Pression acheteuse' : 'Pression vendeuse'}
          </p>
        </StatCell>

        <StatCell label="A/D Line" delay={200}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: flows.metrics.adLine > 0 ? '#16a34a' : '#dc2626', letterSpacing: '-0.02em' }}>
            {flows.metrics.adLine > 0 ? '+' : ''}{flows.metrics.adLine}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-faint)' }}>Ligne Accumulation/Distribution</p>
        </StatCell>

        <StatCell label="Tendance globale" delay={260}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            {getTrendIcon(14)}
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: lv.color }}>{getTrendLabel()}</p>
          </div>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-faint)' }}>Basée sur 3 indicateurs</p>
        </StatCell>
      </div>

      {/* ── Gauge ── */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribution</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accumulation</span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', background: 'linear-gradient(90deg, rgba(220,38,38,0.22), rgba(220,38,38,0.04))' }}/>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: 'linear-gradient(90deg, rgba(34,197,94,0.04), rgba(34,197,94,0.22))' }}/>
          <div style={{
            height: '100%', borderRight: `3px solid ${lv.color}`,
            background: `linear-gradient(90deg, transparent, ${lv.color}aa)`,
            width: go ? `${Math.min(flows.score, 100)}%` : '0%',
            transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)',
          }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {['0', '50', '100'].map(v => <span key={v} style={{ fontSize: 9, color: 'var(--text-faint)' }}>{v}</span>)}
        </div>
      </div>

      {/* ── Accordion ── */}
      <Accordion>
        <p style={{ margin: '0 0 10px', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Ce score analyse les flux de volume et le momentum pour détecter l'accumulation ou la distribution.
          Les indicateurs OBV, MFI et A/D Line permettent d'identifier les phases où les acheteurs ou vendeurs dominent le marché.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {[
            { range: 'Score > 75',  label: 'Accumulation forte',   desc: 'flux acheteurs significatifs', color: '#16a34a' },
            { range: 'Score 51–75', label: 'Accumulation modérée', desc: 'flux acheteurs observés',      color: '#84cc16' },
            { range: 'Score 26–50', label: 'Distribution modérée', desc: 'flux vendeurs observés',       color: '#f97316' },
            { range: 'Score < 26',  label: 'Distribution forte',   desc: 'flux vendeurs significatifs',  color: '#dc2626' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 82 }}>{item.range}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label} — {item.desc}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-faint)', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          Ces analyses sont basées sur des indicateurs techniques calculés à partir de données historiques.
          Elles ne constituent pas un conseil en investissement et ne garantissent pas les résultats futurs.
        </p>
      </Accordion>
    </div>
  );
}