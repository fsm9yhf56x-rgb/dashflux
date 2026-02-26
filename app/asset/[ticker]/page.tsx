'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssetScore } from '@/lib/types';
import {
  ArrowLeft, TrendingUp, TrendingDown, Activity, Target,
  AlertTriangle, DollarSign, BarChart3, LineChart, Zap,
  RefreshCw, Newspaper, Minus, ChevronDown, ArrowUp, ArrowDown
} from 'lucide-react';
import InstitutionalFlows from '@/components/InstitutionalFlows';
import FOMOAlert from '@/components/FOMOAlert';
import NewsPillarCard from '@/components/NewsPillarCard';
import NewsTimeline from '@/components/NewsTimeline';
import EntryTiming from '@/components/EntryTiming';

// ── Tokens ─────────────────────────────────────────────────────────────────
const sc  = (s: number) => s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626';
const sbg = (s: number) => s >= 75 ? 'rgba(34,197,94,0.08)'  : s >= 50 ? 'rgba(217,119,6,0.07)'  : 'rgba(220,38,38,0.06)';
const sbd = (s: number) => s >= 75 ? 'rgba(34,197,94,0.22)'  : s >= 50 ? 'rgba(217,119,6,0.2)'   : 'rgba(220,38,38,0.18)';
const cc  = (v: number) => v > 0 ? '#16a34a' : v < 0 ? '#dc2626' : '#6b7280';
const num = (v?: number, d = 0) => (v !== undefined && !isNaN(v) ? v : d);

const RECO: Record<string, { bg: string; color: string; border: string }> = {
  STRONG_BUY: { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', border: 'rgba(34,197,94,0.3)'   },
  ACCUMULATE: { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed', border: 'rgba(124,58,237,0.28)' },
  WATCH:      { bg: 'rgba(99,102,241,0.09)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' },
  HOLD:       { bg: 'rgba(107,114,128,0.08)',color: 'var(--text-muted)', border: 'rgba(107,114,128,0.22)'},
  TRIM:       { bg: 'rgba(249,115,22,0.09)', color: '#f97316', border: 'rgba(249,115,22,0.25)' },
  AVOID:      { bg: 'rgba(239,68,68,0.08)',  color: '#ef4444', border: 'rgba(239,68,68,0.22)'  },
};

const CSS = `
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:none; } }
`;

// ── Count-up ───────────────────────────────────────────────────────────────
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

// ── SVG Arc ────────────────────────────────────────────────────────────────
function ArcScore({ value, go, size = 140 }: { value: number; go: boolean; size?: number }) {
  const display = useCountUp(value, go, 1100);
  const [arc, setArc] = useState(0);
  const color = sc(value);
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const span = circ * 0.78;

  useEffect(() => {
    if (!go) return;
    const target = (value / 100) * span;
    const s0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - s0) / 1100, 1);
      setArc((1 - (1 - p) ** 3) * target);
      if (p < 1) requestAnimationFrame(tick);
      else setArc(target);
    };
    requestAnimationFrame(tick);
  }, [go, value, span]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(126deg)' }}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="var(--border-subtle)" strokeWidth={9}
          strokeDasharray={`${span} ${circ - span}`} strokeLinecap="round"
        />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 7px ${color}55)`, transition: 'stroke 0.3s' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
        <span style={{ fontSize: 34, fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {display.toFixed(0)}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>
          Score Global
        </span>
      </div>
    </div>
  );
}

// ── Sidebar score row ──────────────────────────────────────────────────────
function SideScore({ label, value, go }: { label: string; value: number; go: boolean }) {
  const d = useCountUp(value, go, 800);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 60, height: 4, borderRadius: 4, background: 'var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4, background: sc(value),
            width: go ? `${value}%` : '0%',
            transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
            opacity: 0.75,
          }}/>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: sc(value), fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right' }}>
          {d.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ── Perf cell ──────────────────────────────────────────────────────────────
function PerfCell({ v, label }: { v: number; label: string }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, marginBottom: 2 }}>
        {v > 0 ? <TrendingUp  style={{ width: 11, height: 11, color: '#16a34a' }}/>
                 : v < 0 ? <TrendingDown style={{ width: 11, height: 11, color: '#dc2626' }}/>
                 : <Minus style={{ width: 11, height: 11, color: '#9ca3af' }}/>}
        <span style={{ fontSize: 13, fontWeight: 800, color: cc(v), letterSpacing: '-0.01em' }}>
          {v > 0 ? '+' : ''}{v.toFixed(1)}%
        </span>
      </div>
      <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

// ── Glass card ─────────────────────────────────────────────────────────────
function Card({ children, delay = 0, style: sx = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1.5px solid var(--glass-border)',
      borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(10px)',
      transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1)',
      ...sx,
    }}>{children}</div>
  );
}

function CardHead({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ color: '#7c3aed', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: color ?? 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

// ── Pillar row (for top/bottom lists) ─────────────────────────────────────
function PillarRow({ name, score, icon, delay, go, dim }: {
  name: string; score: number; icon: React.ReactNode; delay: number; go: boolean; dim?: boolean;
}) {
  const d = useCountUp(score, go, 700);
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
        borderRadius: 10,
        background: hov ? sbg(score) : 'transparent',
        opacity: vis ? (dim ? 0.55 : 1) : 0,
        transform: vis ? 'none' : 'translateX(-8px)',
        transition: `opacity 0.35s ease ${delay}ms, transform 0.35s ease ${delay}ms, background 0.2s`,
        cursor: 'default',
      }}
    >
      <span style={{ color: sc(score), display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <div style={{ width: 80, height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          height: '100%', borderRadius: 4, background: sc(score), opacity: 0.75,
          width: vis ? `${score}%` : '0%',
          transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${delay + 200}ms`,
        }}/>
      </div>
      <span style={{ fontSize: 14, fontWeight: 900, color: sc(score), minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(d)}
      </span>
    </div>
  );
}

// ── Accordéon piliers ──────────────────────────────────────────────────────
function PillarAccordion({ pillars, go }: { pillars: { name: string; score: number; icon: React.ReactNode }[]; go: boolean }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);

  return (
    <Card delay={500}>
      <div
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
          background: hov ? 'rgba(124,58,237,0.03)' : 'transparent',
          transition: 'background 0.2s',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Zap style={{ width: 14, height: 14, color: '#7c3aed' }}/>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hov ? '#7c3aed' : 'var(--text-primary)', transition: 'color 0.2s', letterSpacing: '-0.01em' }}>
            Voir les {pillars.length} piliers détaillés
          </span>
        </div>
        <ChevronDown style={{
          width: 15, height: 15, color: hov ? '#7c3aed' : '#9ca3af',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.35s cubic-bezier(0.34,1.2,0.64,1), color 0.2s',
        }}/>
      </div>
      <div style={{
        maxHeight: open ? `${pillars.length * 44 + 24}px` : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ padding: '8px 6px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {pillars.map((p, i) => (
            <PillarRow key={p.name} name={p.name} score={p.score} icon={p.icon} delay={open ? i * 30 : 0} go={go && open}/>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function AssetDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const ticker   = params.ticker as string;
  const sideRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  const [asset,   setAsset]   = useState<AssetScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [go,      setGo]      = useState(false);

  const load = async () => {
    setLoading(true); setError(null); setGo(false);
    try {
      const res = await fetch(`/api/asset/${ticker}`);
      if (!res.ok) throw new Error(`Asset non trouvé (${res.status})`);
      setAsset(await res.json());
      setTimeout(() => setGo(true), 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ticker]);

  // Spotlight sidebar
  const onSideMove = useCallback((e: React.MouseEvent) => {
    const el = sideRef.current; if (!el) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      el.style.backgroundImage = `radial-gradient(circle 160px at ${x}% ${y}%, rgba(124,58,237,0.05), transparent 70%)`;
    });
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <style>{CSS}</style>
      <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid rgba(124,58,237,0.12)', borderTop: '3px solid #7c3aed', animation: 'spin 0.75s linear infinite' }}/>
      <p style={{ fontSize: 12, color: '#9ca3af' }}>Chargement de {ticker}…</p>
    </div>
  );

  if (error || !asset) return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <style>{CSS}</style>
      <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginBottom: 16, padding: 0 }}>
        <ArrowLeft style={{ width: 13, height: 13 }}/> Dashboard
      </button>
      <div style={{ padding: 20, borderRadius: 16, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
        <p style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, marginBottom: 4 }}>Erreur</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</p>
      </div>
    </div>
  );

  const reco   = RECO[asset.recommendation] ?? RECO.HOLD;
  const noData = num(asset.score) === 0 && num(asset.technicalScore) === 0 && num(asset.emergentScore) === 0;

  const allPillars = [
    { name: 'Contrarian',           score: num(asset.emergentDetails?.contrarian),      icon: <TrendingUp    style={{ width: 12, height: 12 }}/> },
    { name: 'Catalysts',            score: num(asset.emergentDetails?.catalysts),        icon: <Zap           style={{ width: 12, height: 12 }}/> },
    { name: 'Technical Early',      score: num(asset.emergentDetails?.technicalEarly),   icon: <Activity      style={{ width: 12, height: 12 }}/> },
    { name: 'Rotation',             score: num(asset.emergentDetails?.rotation),         icon: <BarChart3     style={{ width: 12, height: 12 }}/> },
    { name: 'Seasonality',          score: num(asset.emergentDetails?.seasonality),      icon: <LineChart     style={{ width: 12, height: 12 }}/> },
    { name: 'Positioning',          score: num(asset.emergentDetails?.positioning),      icon: <Target        style={{ width: 12, height: 12 }}/> },
    { name: 'Relative Strength',    score: num(asset.relativeStrengthInfo?.score),       icon: <TrendingUp    style={{ width: 12, height: 12 }}/> },
    { name: 'Drawdown',             score: num(asset.drawdownInfo?.score),               icon: <TrendingDown  style={{ width: 12, height: 12 }}/> },
    { name: 'Valuation',            score: num(asset.valuationInfo?.score),              icon: <DollarSign    style={{ width: 12, height: 12 }}/> },
    { name: 'Macro Regional',       score: num(asset.macroRegionalInfo?.score),          icon: <Activity      style={{ width: 12, height: 12 }}/> },
    { name: 'Flux Institutionnels', score: num(asset.institutionalFlows?.score),         icon: <DollarSign    style={{ width: 12, height: 12 }}/> },
    { name: 'Analyse Vélocité',     score: num(asset.fomoAlert?.score),                  icon: <AlertTriangle style={{ width: 12, height: 12 }}/> },
    { name: 'Timing Entrée',        score: num(asset.entryTiming?.score),                icon: <Activity      style={{ width: 12, height: 12 }}/> },
    ...(asset.newsInfo ? [{ name: 'News Sentiment', score: num(asset.newsInfo.score), icon: <Newspaper style={{ width: 12, height: 12 }}/> }] : []),
  ].sort((a, b) => b.score - a.score);

  const top3    = allPillars.slice(0, 3);
  const bottom3 = [...allPillars].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: '100vh', padding: '20px 20px 40px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Nav ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, animation: 'fadeUp 0.4s ease' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#9ca3af', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >
            <ArrowLeft style={{ width: 13, height: 13 }}/> Dashboard
          </button>
          <button onClick={load} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', fontSize: 11, fontWeight: 700 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.transition = '0.3s cubic-bezier(0.34,1.56,0.64,1)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <RefreshCw style={{ width: 11, height: 11, animation: loading ? 'spin 0.75s linear infinite' : 'none' }}/> Actualiser
          </button>
        </div>

        {noData && (
          <div style={{ marginBottom: 14, padding: '9px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertTriangle style={{ width: 13, height: 13, color: '#d97706', flexShrink: 0 }}/>
            <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>Données en cours de calcul — actualisez dans quelques secondes.</p>
          </div>
        )}

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* ╔═══════════════════════╗
              ║   SIDEBAR STICKY      ║
              ╚═══════════════════════╝ */}
          <div style={{ width: 270, flexShrink: 0, position: 'sticky', top: 140 }}>
            <div
              ref={sideRef}
              onMouseMove={onSideMove}
              onMouseLeave={() => { if (sideRef.current) sideRef.current.style.backgroundImage = ''; }}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(24px) saturate(200%)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                border: '1.5px solid var(--glass-border)',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                animation: 'scaleIn 0.45s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {/* Identity */}
              <div style={{
                padding: '18px 18px 14px',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.06), rgba(118,75,162,0.04))',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.025em' }}>
                      {asset.name || ticker}
                    </h1>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>{asset.ticker}</p>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.03em',
                    background: reco.bg, color: reco.color, border: `1.5px solid ${reco.border}`, flexShrink: 0,
                  }}>
                    {asset.recommendation}
                  </span>
                </div>

                {/* Arc score centré */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <ArcScore value={num(asset.score)} go={go} size={140} />
                </div>

                {/* Sub scores */}
                <SideScore label="Score Technique" value={num(asset.technicalScore)} go={go} />
                <SideScore label="Score Émergent"  value={num(asset.emergentScore)}  go={go} />
              </div>

              {/* Prix + perfs */}
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dernière clôture</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                    ${num(asset.lastPrice).toFixed(2)}
                  </span>
                </div>

                {/* Perfs */}
                <div style={{ display: 'flex', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                  <PerfCell v={num(asset.change1M)} label="1M" />
                  <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}/>
                  <PerfCell v={num(asset.change3M)} label="3M" />
                  <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}/>
                  <PerfCell v={num(asset.change6M)} label="6M" />
                </div>

                {/* Confiance */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Confiance</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 50, height: 3, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: sc(num(asset.confidence)), width: go ? `${num(asset.confidence)}%` : '0%', transition: 'width 1s cubic-bezier(0.16,1,0.3,1) 0.5s' }}/>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: sc(num(asset.confidence)) }}>{num(asset.confidence)}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ╔═══════════════════════════════════╗
              ║   MAIN CONTENT                    ║
              ╚═══════════════════════════════════╝ */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

            {/* 1 — SIGNAUX FORTS / FAIBLES */}
            <Card delay={80}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

                {/* Top 3 forts */}
                <div style={{ borderRight: '1px solid var(--border)' }}>
                  <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ArrowUp style={{ width: 13, height: 13, color: '#16a34a' }}/>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>Signaux forts</span>
                  </div>
                  <div style={{ padding: '4px 8px 8px' }}>
                    {top3.map((p, i) => (
                      <PillarRow key={p.name} name={p.name} score={p.score} icon={p.icon} delay={120 + i * 60} go={go} />
                    ))}
                  </div>
                </div>

                {/* Top 3 faibles */}
                <div>
                  <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ArrowDown style={{ width: 13, height: 13, color: '#dc2626' }}/>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>Points faibles</span>
                  </div>
                  <div style={{ padding: '4px 8px 8px' }}>
                    {bottom3.map((p, i) => (
                      <PillarRow key={p.name} name={p.name} score={p.score} icon={p.icon} delay={180 + i * 60} go={go} dim />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 2 — TECHNIQUE + MARCHÉ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'stretch' }}>
              <Card delay={160}>
                <CardHead icon={<Activity style={{ width: 13, height: 13 }}/>} title="Analyse Technique"/>
                <div style={{ padding: '6px 16px 14px' }}>
                  <Row label="Momentum"   value={`${num(asset.momentum).toFixed(1)}/100`}   color={sc(num(asset.momentum))}   />
                  <Row label="Volatilité" value={`${num(asset.volatility).toFixed(1)}/100`} color={sc(num(asset.volatility))} />
                  <Row label="Trend"      value={`${num(asset.trend).toFixed(1)}/100`}      color={sc(num(asset.trend))}      />
                </div>
              </Card>
              <Card delay={190}>
                <CardHead icon={<BarChart3 style={{ width: 13, height: 13 }}/>} title="Informations Marché"/>
                <div style={{ padding: '6px 16px 14px' }}>
                  {(asset.relativeStrengthInfo as any)?.rsRatio !== undefined && (
                    <Row label="Force rel. vs SPY" value={`${num((asset.relativeStrengthInfo as any).rsRatio, 1).toFixed(2)}`} color={sc(num(asset.relativeStrengthInfo?.score))}/>
                  )}
                  {asset.drawdownInfo?.currentDrawdown !== undefined && (
                    <Row label="Drawdown ATH" value={`${asset.drawdownInfo.currentDrawdown.toFixed(1)}%`} color={cc(asset.drawdownInfo.currentDrawdown)}/>
                  )}
                  {asset.valuationInfo?.relativeValuation && (
                    <Row label="Valuation" value={asset.valuationInfo.relativeValuation}/>
                  )}
                  <Row label="Macro Regional" value={`${num(asset.macroRegionalInfo?.score).toFixed(0)}/100`} color={sc(num(asset.macroRegionalInfo?.score))}/>
                </div>
              </Card>
            </div>

            {/* 3 — SIGNAUX AVANCÉS */}
            {asset.newsInfo && (
              <Card delay={260}>
                <NewsPillarCard score={asset.newsInfo.score} sentiment={asset.newsInfo.sentiment} explanation={asset.newsInfo.explanation}/>
              </Card>
            )}

            {(asset.institutionalFlows || asset.fomoAlert) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'stretch' }}>
                {asset.institutionalFlows && <Card delay={300} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><InstitutionalFlows flows={asset.institutionalFlows}/></Card>}
                {asset.fomoAlert          && <Card delay={320} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><FOMOAlert alert={asset.fomoAlert}/></Card>}
              </div>
            )}

            {asset.entryTiming && <Card delay={350}><EntryTiming timing={asset.entryTiming}/></Card>}

            {/* 4 — ACCORDÉON 14 PILIERS */}
            <PillarAccordion pillars={allPillars} go={go} />

            {/* 5 — CONTEXTE */}
            {asset.newsInfo && (
              <Card delay={520}>
                <CardHead icon={<Newspaper style={{ width: 13, height: 13 }}/>} title="Actualités Pertinentes"/>
                <div style={{ padding: '0 16px 16px' }}><NewsTimeline ticker={ticker}/></div>
              </Card>
            )}

            {asset.explanation && (
              <Card delay={540}>
                <CardHead icon={<AlertTriangle style={{ width: 13, height: 13 }}/>} title="Analyse Contextuelle"/>
                <p style={{ padding: '10px 16px 16px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                  {asset.explanation}
                </p>
              </Card>
            )}

            {/* Disclaimer */}
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.14)' }}>
              <p style={{ fontSize: 10.5, color: '#9ca3af', lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: '#d97706' }}>Disclaimer :</strong> Analyse fournie à titre éducatif. Scores basés sur données historiques et modèles quantitatifs. Pas un conseil en investissement.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}