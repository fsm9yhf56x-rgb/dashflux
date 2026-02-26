'use client';

import {
  TrendingUp, TrendingDown, Zap, Target, Shield, Clock, CheckCircle,
  BarChart3, DollarSign, Globe, Compass, GitBranch, Activity,
  Landmark, Cpu, Timer, Eye, PieChart, Layers, Info,
  BookOpen, ArrowRight, Calendar, Database, RefreshCw,
  ChevronRight, AlertTriangle, Sparkles,
} from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

const CSS = `
  @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes slideR    { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes dotBlink  { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes shimmer   { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes lineGrow  { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1)} }
  @keyframes blobPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }

  html { scroll-behavior: smooth; }

  .mnav-link {
    display:flex; align-items:center; gap:8px;
    padding:7px 12px; border-radius:10px; text-decoration:none;
    font-size:12px; font-weight:500; color:var(--text-muted);
    border-left:2.5px solid transparent;
    transition: all 0.2s ease; white-space: nowrap;
  }
  .mnav-link:hover { color:#7c3aed; background:rgba(124,58,237,0.05); }
  .mnav-link.active { color:#7c3aed; font-weight:700; background:rgba(124,58,237,0.08); border-left-color:#7c3aed; }

  .pilier-card { cursor:default; }
  .pilier-card:hover .pill-icon { transform: scale(1.15) rotate(-7deg) !important; }
  .pilier-card:hover .pill-num  { opacity:0.12 !important; }

  @media (max-width: 960px) {
    .page-layout { flex-direction:column !important; }
    .sticky-nav  { display:none !important; }
  }
`;

const GLASS: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: 20,
  boxShadow: 'var(--glass-shadow)',
};

const V = '#7c3aed';
const I = '#6366f1';

function useInView(threshold = 0.06) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, inView: v };
}

function CountUp({ to, suffix = '', go, duration = 1100 }: { to: number; suffix?: string; go: boolean; duration?: number }) {
  const [v, setV] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!go || ran.current) return;
    ran.current = true;
    const s = performance.now();
    const tick = (n: number) => {
      const p = Math.min((n - s) / duration, 1);
      setV(Math.round((1 - (1 - p) ** 4) * to));
      if (p < 1) requestAnimationFrame(tick); else setV(to);
    };
    requestAnimationFrame(tick);
  }, [go, to, duration]);
  return <>{v}{suffix}</>;
}

function AnimBar({ pct, color, delay = 0, go }: { pct: number; color: string; delay?: number; go: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!go) return;
    const t = setTimeout(() => {
      const s = performance.now();
      const tick = (n: number) => {
        const p = Math.min((n - s) / 700, 1);
        setW(Math.round((1 - (1 - p) ** 3) * pct));
        if (p < 1) requestAnimationFrame(tick); else setW(pct);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [go, pct, delay]);
  return (
    <div style={{ height: 5, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', flex: 1, minWidth: 0 }}>
      <div style={{
        height: '100%', borderRadius: 4,
        background: `linear-gradient(90deg, ${color}, ${color}bb)`,
        width: `${w}%`, transition: 'width 0.04s linear',
        boxShadow: `0 0 6px ${color}50`,
      }}/>
    </div>
  );
}

function Spot({ children, color = 'rgba(124,58,237,0.08)', style, className }: {
  children: React.ReactNode; color?: string; style?: React.CSSProperties; className?: string;
}) {
  const ref   = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  * 100;
      const y = (e.clientY - r.top)  / r.height * 100;
      el.style.backgroundImage = `radial-gradient(ellipse 55% 60% at ${x}% ${y}%, ${color}, transparent 70%)`;
    });
  }, [color]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.backgroundImage = '';
  }, []);
  return (
    <div ref={ref} className={className} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function Sec({ id, children }: { id: string; children: React.ReactNode }) {
  const { ref, inView } = useInView(0.04);
  return (
    <div id={id} ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : 'translateY(30px)',
      transition: 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)',
      marginBottom: 28,
    }}>
      {children}
    </div>
  );
}

function SecHead({ icon, title, sub, badge, badgeColor = V }: {
  icon: React.ReactNode; title: string; sub?: string; badge?: string; badgeColor?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: `${badgeColor}0f`, border: `1.5px solid ${badgeColor}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: badgeColor, boxShadow: `0 4px 14px ${badgeColor}14`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 19, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>{title}</h2>
          {badge && (
            <span style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 800,
              background: `${badgeColor}0f`, color: badgeColor, border: `1px solid ${badgeColor}28`,
              letterSpacing: '0.02em',
            }}>{badge}</span>
          )}
        </div>
        {sub && <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '5px 0 0', lineHeight: 1.65 }}>{sub}</p>}
      </div>
    </div>
  );
}

const FORMULA_SEGS = [
  { label: 'Technique',  pct: 30, color: '#3b82f6' },
  { label: 'Émergent',   pct: 40, color: '#7c3aed' },
  { label: 'Flux Inst.', pct: 15, color: '#22c55e' },
  { label: 'Vélocité',   pct: 10, color: '#f59e0b' },
  { label: 'Timing',     pct:  5, color: '#0ea5e9' },
];
function FormulaBar({ go }: { go: boolean }) {
  const [done, setDone] = useState(false);
  useEffect(() => { if (go) { const t = setTimeout(() => setDone(true), 120); return () => clearTimeout(t); } }, [go]);
  return (
    <div>
      <div style={{ display: 'flex', height: 30, borderRadius: 12, overflow: 'hidden', gap: 2, marginBottom: 12 }}>
        {FORMULA_SEGS.map((s, i) => (
          <div key={s.label} style={{
            flex: done ? s.pct : 0,
            background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', minWidth: 0,
            transition: `flex 1s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: 'white', whiteSpace: 'nowrap',
              padding: '0 6px', opacity: done ? 1 : 0,
              transition: `opacity 0.3s ease ${i * 90 + 500}ms`,
            }}>{s.pct}%</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {FORMULA_SEGS.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label} <strong style={{ color: s.color }}>{s.pct}%</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PilierData {
  num: number;
  name: string;
  pct: string;
  pctNum: number;
  color: string;
  icon: React.ReactNode;
  live: boolean;
  desc: string;
  horizon: string;
  source: string;
  signal?: string;
}

function PilierCard({ d, index, go }: { d: PilierData; index: number; go: boolean }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const ref   = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.04 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 100;
      const y = (e.clientY - r.top) / r.height * 100;
      el.style.backgroundImage = `radial-gradient(ellipse 55% 65% at ${x}% ${y}%, ${d.color}10, transparent 70%)`;
    });
  }, [d.color]);

  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.backgroundImage = '';
    setHov(false);
  }, []);

  return (
    <div
      ref={ref}
      className="pilier-card"
      onMouseEnter={() => setHov(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${hov ? d.color + '40' : 'var(--border)'}`,
        borderRadius: 16, padding: '16px',
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(22px)',
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${Math.min(index * 55, 450)}ms,
                     transform 0.55s cubic-bezier(0.16,1,0.3,1) ${Math.min(index * 55, 450)}ms,
                     border-color 0.25s, box-shadow 0.3s`,
        boxShadow: hov ? `0 10px 32px ${d.color}1a` : '0 2px 8px rgba(0,0,0,0.03)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div className="pill-num" style={{
        position: 'absolute', right: -4, top: -6,
        fontSize: 52, fontWeight: 900, color: d.color,
        opacity: 0.06, lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.05em', transition: 'opacity 0.3s',
      }}>{d.num}</div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <div className="pill-icon" style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: `${d.color}12`, border: `1.5px solid ${d.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: d.color, transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
          }}>{d.icon}</div>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hov ? d.color : 'var(--text-primary)', transition: 'color 0.2s', lineHeight: 1.3 }}>
            {d.name}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800,
            background: `${d.color}12`, color: d.color, border: `1px solid ${d.color}28`,
          }}>{d.pct}</span>
          {d.live
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 700, color: '#16a34a' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'dotBlink 1.8s ease-in-out infinite' }}/>
                Live
              </span>
            : <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 700, color: '#d97706' }}>
                <Clock style={{ width: 9, height: 9 }}/> Partiel
              </span>
          }
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <AnimBar pct={d.pctNum} color={d.color} delay={Math.min(index * 55, 450)} go={go && vis} />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {d.pctNum}%
        </span>
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.68, margin: '0 0 10px' }}>{d.desc}</p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
          background: 'rgba(99,102,241,0.07)', color: '#6366f1',
          border: '1px solid rgba(99,102,241,0.18)',
        }}>
          <Calendar style={{ width: 9, height: 9 }}/>{d.horizon}
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
          background: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)',
          border: '1px solid rgba(107,114,128,0.18)',
        }}>
          <Database style={{ width: 9, height: 9 }}/>{d.source}
        </span>
      </div>
    </div>
  );
}

function TechRow({ label, pct, pctNum, color, desc, index, go }: {
  label: string; pct: string; pctNum: number; color: string; desc: string; index: number; go: boolean;
}) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '112px 1fr', gap: 14,
        padding: '13px 14px', borderRadius: 14,
        background: hov ? `${color}06` : 'transparent',
        border: `1px solid ${hov ? color + '22' : 'transparent'}`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateX(-14px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 85}ms,
                     transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 85}ms,
                     background 0.25s, border-color 0.25s`,
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <div style={{
            width: 3, height: 28, borderRadius: 3, background: color, flexShrink: 0,
            transform: hov ? 'scaleY(1.2)' : 'none',
            transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}/>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 12.5 }}>{label}</span>
        </div>
        <span style={{
          padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800,
          background: `${color}12`, color, border: `1px solid ${color}28`, marginLeft: 9,
        }}>{pct}</span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <AnimBar pct={pctNum} color={color} delay={index * 85 + 200} go={vis} />
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── SCORECARD : transform dupliqué corrigé ──
function ScoreCard({ range, label, reco, sub, color, index, go }: {
  range: string; label: string; reco: string; sub: string; color: string; index: number; go: boolean;
}) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const getTransform = () => {
    if (!vis) return 'translateY(18px) scale(0.97)';
    if (hov)  return 'translateY(-2px)';
    return 'none';
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '16px 14px', borderRadius: 16, textAlign: 'center',
        background: hov ? `${color}0a` : 'var(--bg-subtle)',
        border: `1.5px solid ${hov ? color + '35' : 'var(--border)'}`,
        opacity: vis ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 75}ms,
                     transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${index * 75}ms,
                     background 0.25s, border-color 0.25s, box-shadow 0.3s`,
        boxShadow: hov ? `0 10px 28px ${color}20` : '0 2px 6px rgba(0,0,0,0.03)',
        cursor: 'default',
      }}
    >
      <div style={{
        fontSize: 26, fontWeight: 900, color, marginBottom: 4,
        letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
        transform: hov ? 'scale(1.06)' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'inline-block',
      }}>{range}</div>
      <p style={{ fontSize: 10.5, fontWeight: 800, color, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.4 }}>{reco}</p>
      <p style={{ fontSize: 10, color: 'var(--text-faint)', margin: 0, lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}

const REGIMES = [
  { q: 'Q1', name: 'Goldilocks',   grow: '↑', inf: '↓', color: '#22c55e', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.25)',  assets: ['Tech', 'S&P 500', 'Croissance'],    desc: 'Le meilleur des mondes. Économie forte, inflation basse. Actions de croissance surperforment.' },
  { q: 'Q2', name: 'Reflation',    grow: '↑', inf: '↑', color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', assets: ['Pétrole', 'Commodités', 'Energie'],  desc: 'Croissance forte accompagnée d\'inflation. Actifs réels et cycliques dominent.' },
  { q: 'Q3', name: 'Stagflation',  grow: '↓', inf: '↑', color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.25)',  assets: ['Or', 'TIPS', 'USD', 'Energie'],      desc: 'Pire environnement. Économie faible + inflation persistante. L\'or brille.' },
  { q: 'Q4', name: 'Récession',    grow: '↓', inf: '↓', color: '#3b82f6', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.25)', assets: ['Oblig. 20Y', 'USD', 'Cash', 'TIPS'], desc: 'Contraction économique. Les obligations d\'État s\'apprécient fortement.' },
];

function RegimeMatrix({ go }: { go: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {REGIMES.map((r, i) => {
        const [hov, setHov] = useState(false);
        const [vis, setVis] = useState(false);
        const ref = useRef<HTMLDivElement>(null);
        useEffect(() => {
          const el = ref.current; if (!el) return;
          const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.1 });
          o.observe(el);
          return () => o.disconnect();
        }, []);
        return (
          <div
            key={r.q}
            ref={ref}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              padding: '16px', borderRadius: 16,
              background: hov ? r.bg : 'var(--bg-subtle)',
              border: `1.5px solid ${hov ? r.border : 'var(--border)'}`,
              opacity: vis ? 1 : 0,
              transform: vis ? 'none' : 'scale(0.96)',
              transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms,
                           transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms,
                           background 0.25s, border-color 0.25s, box-shadow 0.3s`,
              boxShadow: hov ? `0 8px 24px ${r.color}18` : '0 2px 6px rgba(0,0,0,0.03)',
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: r.color }}>{r.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: `${r.color}12`, color: r.color }}>
                    Croissance {r.grow}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: `${r.color}12`, color: r.color }}>
                    Inflation {r.inf}
                  </span>
                </div>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `${r.color}12`, border: `1.5px solid ${r.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, color: r.color,
                transform: hov ? 'scale(1.1) rotate(-5deg)' : 'none',
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                {r.q}
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 8px' }}>{r.desc}</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {r.assets.map(a => (
                <span key={a} style={{
                  padding: '1px 6px', borderRadius: 6, fontSize: 9.5, fontWeight: 700,
                  background: `${r.color}10`, color: r.color,
                  border: `1px solid ${r.color}20`, fontFamily: 'monospace',
                }}>{a}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const NAV = [
  { id: 'intro',     label: 'Introduction'       },
  { id: 'overview',  label: 'Vue d\'ensemble'     },
  { id: 'regime',    label: 'Régimes Macro'       },
  { id: 'technique', label: 'Score Technique'     },
  { id: 'emergent',  label: 'Score Émergent'      },
  { id: 'v21',       label: 'Piliers v2.1'        },
  { id: 'composite', label: 'Score Composite'     },
  { id: 'interp',    label: 'Interprétation'      },
  { id: 'usage',     label: 'Comment utiliser'    },
];

function StickyNav({ active, progress }: { active: string; progress: number }) {
  return (
    <nav className="sticky-nav" style={{
      width: 192, flexShrink: 0, position: 'sticky', top: 130,
    }}>
      <div style={{ marginBottom: 12, paddingLeft: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progression</span>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: V }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${V}, ${I})`, borderRadius: 2, transition: 'width 0.3s ease' }}/>
        </div>
      </div>
      <p style={{ fontSize: 10, fontWeight: 800, color: '#c4c6d3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 12, margin: '0 0 6px 0' }}>
        Sur cette page
      </p>
      {NAV.map(item => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`mnav-link ${active === item.id ? 'active' : ''}`}
          onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
        >
          <span style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: active === item.id ? V : 'var(--border)',
            transition: 'background 0.2s',
          }}/>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

const TECH_ROWS = [
  { label: 'Momentum',     pct: '50%', pctNum: 50, color: '#3b82f6', desc: 'Performances sur 1M / 3M / 6M / 12M pondérées. Position vs MA50 et MA200. Golden cross (MA50 dépasse MA200) = signal fort de tendance haussière structurelle.' },
  { label: 'Volatilité',   pct: '25%', pctNum: 25, color: '#22c55e', desc: 'Volatilité annualisée sur 252 jours de trading. Score inversement proportionnel : vol faible = score élevé. Un actif stable offre un meilleur rapport risque/rendement.' },
  { label: 'Trend',        pct: '15%', pctNum: 15, color: '#f59e0b', desc: 'Force du trend via position du prix vs MA20 et MA50. Uptrend confirmé : prix > MA20 > MA50. Complète le momentum long terme avec une lecture court terme.' },
  { label: 'Saisonnalité', pct: '10%', pctNum: 10, color: '#f97316', desc: 'Patterns historiques sur 15+ ans. Or fort en janvier (safe-haven Q1), actions en novembre-décembre (Santa Rally), pétrole faible en Q1. Faible poids = contexte, non décisionnel.' },
];

const EMERGENT_PILIERS: PilierData[] = [
  { num: 1,  name: 'Contrarian',           pct: '12%', pctNum: 12, color: '#8b5cf6', live: true,  horizon: '1–3 mois',  source: 'Yahoo Finance', icon: <TrendingDown style={{ width: 14, height: 14 }}/>, desc: 'Détecte les extrêmes de sentiment. RSI < 30 (oversold) déclenche un signal d\'achat anticipé — la foule capitule, les mains fortes accumulent. RSI > 70 (overbought) : prudence. Signal contrarian = entrée avant le rebond.', signal: 'RSI 14j + Sentiment Index + Put/Call ratio' },
  { num: 2,  name: 'Catalysts',            pct: '16%', pctNum: 16, color: '#f59e0b', live: true,  horizon: '2–6 semaines', source: 'Yahoo Finance', icon: <Zap style={{ width: 14, height: 14 }}/>, desc: 'Compression de volatilité (BB Width < 5e percentile) = breakout imminent. Approche de MA50/MA200 = zone de décision. Ces compressions précèdent les mouvements les plus explosifs — le calme avant la tempête.', signal: 'Bollinger Bands Width + proximité niveaux clés' },
  { num: 3,  name: 'Technical Early',      pct: '10%', pctNum: 10, color: '#3b82f6', live: true,  horizon: '2–8 semaines', source: 'Yahoo Finance', icon: <Activity style={{ width: 14, height: 14 }}/>, desc: 'Divergences haussières : le prix baisse mais RSI remonte = force cachée, inversion probable. Divergences baissières : avertissement avant correction. Signal précoce avant que le prix ne confirme.', signal: 'Divergences RSI/Prix + MACD histogram' },
  { num: 4,  name: 'Rotation Sectorielle', pct: '8%',  pctNum: 8,  color: '#10b981', live: true,  horizon: '1–3 mois',  source: 'FRED + Yahoo', icon: <GitBranch style={{ width: 14, height: 14 }}/>, desc: 'Goldilocks → Tech & Croissance. Reflation → Commodités & Énergie. Stagflation → Or & TIPS. Récession → Obligations & USD. Anticipe les rotations avant qu\'elles soient évidentes sur les prix.', signal: 'Régime macro calculé via CPI + PMI' },
  { num: 5,  name: 'Seasonality Early',    pct: '5%',  pctNum: 5,  color: '#f97316', live: true,  horizon: '1–2 mois',  source: 'Historique 15 ans', icon: <Timer style={{ width: 14, height: 14 }}/>, desc: 'Prend position un mois AVANT que le pattern saisonnier ne se matérialise. L\'avantage est dans l\'anticipation. Un signal de janvier détecté en décembre vaut bien plus qu\'en janvier.', signal: 'Performances mensuelles historiques pondérées' },
  { num: 6,  name: 'Positioning (COT)',    pct: '12%', pctNum: 12, color: '#ec4899', live: false, horizon: '4–12 semaines', source: 'CFTC / Quandl', icon: <Compass style={{ width: 14, height: 14 }}/>, desc: 'Rapports COT (Commitment of Traders) hebdomadaires. Détecte quand les "smart money" institutionnels accumulent contre les spéculateurs retail. Donnée hebdomadaire, décalage 3j. Limité aux commodités et devises.', signal: 'Positions nettes Non-Commercials vs Commercials' },
  { num: 7,  name: 'Relative Strength',    pct: '10%', pctNum: 10, color: '#06b6d4', live: true,  horizon: '2–4 mois',  source: 'Yahoo Finance', icon: <BarChart3 style={{ width: 14, height: 14 }}/>, desc: 'Ratio RS = performance asset / performance SPY sur 63 jours. Un actif qui bat systématiquement le marché démontre une force institutionnelle sous-jacente. Les gagnants continuent à gagner — principe de momentum relatif.', signal: 'Performance relative 63j vs SPY (benchmark)' },
  { num: 8,  name: 'Drawdown Recovery',    pct: '9%',  pctNum: 9,  color: '#ef4444', live: true,  horizon: '1–6 mois',  source: 'Yahoo Finance', icon: <TrendingDown style={{ width: 14, height: 14 }}/>, desc: 'Distance depuis l\'ATH (All-Time High). Drawdown > 20% = zone historiquement favorable pour l\'accumulation à long terme. Score élevé = potentiel de récupération important. Méfiance en cas de drawdown > 60% (actifs structurellement cassés).', signal: 'Distance % depuis ATH sur fenêtre 2 ans' },
  { num: 9,  name: 'Valuation',            pct: '10%', pctNum: 10, color: '#22d3ee', live: false, horizon: '3–12 mois', source: 'FMP API', icon: <DollarSign style={{ width: 14, height: 14 }}/>, desc: 'Compare P/E, P/B, EV/EBITDA aux moyennes sectorielles et historiques. P/E > +20% au-dessus de la moyenne = risque de mean reversion. Optimisé pour les actions. Limité pour crypto, commodités, obligations.', signal: 'P/E ratio + P/B vs moyennes sectorielles 10 ans' },
  { num: 10, name: 'Macro Régional',       pct: '8%',  pctNum: 8,  color: '#6366f1', live: true,  horizon: '2–6 mois',  source: 'FRED API', icon: <Globe style={{ width: 14, height: 14 }}/>, desc: 'Analyse les politiques monétaires (Fed, ECB, PBoC) et les PMI régionaux. Stimulus = bullish pour les actifs locaux. Anticipe les divergences : stimulus chinois → émergents, BCE dovish → actions européennes.', signal: 'Fed Funds Rate + PMI composite + M2 money supply' },
];

const V21_PILIERS: PilierData[] = [
  { num: 11, name: 'Flux Institutionnels',    pct: '15%', pctNum: 15, color: '#22c55e', live: true,  horizon: '2–8 semaines', source: 'Volume analysis', icon: <Landmark style={{ width: 14, height: 14 }}/>, desc: 'Analyse volume × direction × momentum pour détecter l\'accumulation ou la distribution institutionnelle silencieuse. Le smart money se positionne avant les prix. Flux entrants forts + prix stable = accumulation = signal haussier précurseur.', signal: 'OBV (On-Balance Volume) + Volume relatif 20j' },
  { num: 12, name: 'Vélocité / FOMO',         pct: '10%', pctNum: 10, color: '#f59e0b', live: true,  horizon: '1–3 semaines', source: 'Yahoo Finance', icon: <Cpu style={{ width: 14, height: 14 }}/>, desc: 'Mesure l\'accélération des prix : variation quotidienne vs moyenne sur 20j. Vélocité élevée + volume en hausse = momentum FOMO institutionnel. Permets d\'identifier les breakouts avant leur confirmation graphique.', signal: 'Rate of Change (ROC) + Volume acceleration 20j' },
  { num: 13, name: 'Timing d\'Entrée',         pct: '5%',  pctNum: 5,  color: '#0ea5e9', live: true,  horizon: 'Court terme',  source: 'Yahoo Finance', icon: <Target style={{ width: 14, height: 14 }}/>, desc: 'Évalue le timing optimal selon 3 configurations : pullback sur support (RSI rebondit + volume diminue), breakout confirmé (clôture > résistance + volume élevé), dip dans uptrend (MA20 tient). Score = qualité du setup actuel.', signal: 'RSI + support/résistance + volume pattern' },
];

const SCORE_CARDS = [
  { range: '≥ 80', label: 'Très Favorable', reco: 'ACCUMULATE',   sub: 'Fenêtre d\'entrée ouverte. Tous les signaux alignés.',            color: '#7c3aed' },
  { range: '65–79', label: 'Favorable',     reco: 'WATCH / BUY',  sub: 'Surveiller pour le timing. Initier une position partielle.',     color: '#6366f1' },
  { range: '45–64', label: 'Neutre',        reco: 'HOLD',          sub: 'Maintenir si en position. Ne pas initier.',                      color: 'var(--text-muted)' },
  { range: '30–44', label: 'Défavorable',   reco: 'TRIM / REDUCE', sub: 'Réduire l\'exposition. Attendre un retournement.',               color: '#f97316' },
  { range: '< 30',  label: 'Très Défavorable', reco: 'AVOID / EXIT', sub: 'Ne pas entrer. Sortir si en position.',                       color: '#ef4444' },
];

export default function MethodologyPage() {
  const [activeNav,  setActiveNav]  = useState('intro');
  const [progress,   setProgress]   = useState(0);

  const { ref: overRef,    inView: overView }    = useInView(0.3);
  const { ref: regRef,     inView: regView }     = useInView(0.1);
  const { ref: techRef,    inView: techView }    = useInView(0.05);
  const { ref: emgRef,     inView: emgView }     = useInView(0.03);
  const { ref: v21Ref,     inView: v21View }     = useInView(0.05);
  const { ref: compRef,    inView: compView }    = useInView(0.2);
  const { ref: scoreRef,   inView: scoreView }   = useInView(0.2);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min((scrollTop / docH) * 100, 100) : 0);
      const offset = 220;
      for (let i = NAV.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV[i].id);
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveNav(NAV[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.18 }} viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.4"/>
            </linearGradient>
            <filter id="gblur"><feGaussianBlur stdDeviation="60"/></filter>
          </defs>
          <g filter="url(#gblur)">
            <ellipse cx="180" cy="160" rx="230" ry="280" fill="url(#bg1)">
              <animate attributeName="cx" values="180;290;180" dur="14s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="280;220;280" dur="10s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="1150" cy="200" rx="260" ry="200" fill="#f3e8ff" fillOpacity="0.45">
              <animate attributeName="rx" values="260;320;260" dur="11s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="650" cy="650" rx="300" ry="230" fill="#ede9fe" fillOpacity="0.3">
              <animate attributeName="ry" values="230;290;230" dur="12s" repeatCount="indefinite"/>
            </ellipse>
          </g>
        </svg>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.022, mixBlendMode: 'multiply',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}/>
      </div>

      <main style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative', zIndex: 1, paddingBottom: 80 }}>
        <div className="page-layout" style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 20px 0', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          <StickyNav active={activeNav} progress={progress} />

          <div style={{ flex: 1, minWidth: 0 }}>

            <div id="intro" style={{ marginBottom: 32, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: `${V}0f`, color: V, border: `1px solid ${V}28`, letterSpacing: '0.03em' }}>Version 2.1 — 13 Piliers</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'dotBlink 2s ease-in-out infinite' }}/>
                  Système opérationnel
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)' }}>
                  <RefreshCw style={{ width: 10, height: 10 }}/> Mis à jour en temps réel
                </span>
              </div>

              <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.08 }}>
                Méthodologie{' '}
                <span style={{ background: `linear-gradient(135deg, ${V}, ${I})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  DashFlux
                </span>
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.75, maxWidth: 640 }}>
                Système de scoring multi-assets inspiré de la méthode Rodolphe Steffan.
                Combine <strong style={{ color: 'var(--text-secondary)' }}>13 piliers d'analyse</strong> pour identifier les actifs
                à fort potentiel <strong style={{ color: V }}>1 à 6 mois à l'avance</strong>,
                sur une univers de <strong style={{ color: 'var(--text-secondary)' }}>180+ assets</strong> couvrant actions, crypto, commodités, obligations et devises.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { n: 13,  s: '',  label: 'Piliers actifs',       c: V       },
                  { n: 180, s: '+', label: 'Assets analysés',      c: I       },
                  { n: 95,  s: '%', label: 'Alignement Steffan',   c: '#16a34a' },
                  { n: 4,   s: '',  label: 'Sources de données',   c: '#f59e0b' },
                ].map(({ n, s, label, c }, i) => {
                  const { ref, inView } = useInView(0.2);
                  return (
                    <div key={label} ref={ref} style={{
                      padding: '10px 18px', borderRadius: 14,
                      background: `${c}09`, border: `1px solid ${c}25`,
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'none' : 'translateY(10px)',
                      transition: `opacity 0.5s ease ${200 + i * 100}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${200 + i * 100}ms`,
                    }}>
                      <p style={{ fontSize: 28, fontWeight: 900, color: c, margin: '0 0 2px', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                        <CountUp to={n} suffix={s} go={inView} />
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Sec id="overview">
              <Spot style={GLASS} color="rgba(124,58,237,0.07)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<Layers style={{ width: 18, height: 18 }}/>} title="Vue d'ensemble" sub="DashFlux combine 4 composantes majeures pour un scoring exhaustif — du momentum actuel à l'anticipation avancée." />
                  <div style={{ marginBottom: 22 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                      Composition du Score Composite Final
                    </p>
                    <div ref={overRef}><FormulaBar go={overView} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {[
                      { icon: <TrendingUp style={{ width: 15, height: 15 }}/>, title: 'Score Technique',      pct: '30%', color: '#3b82f6', desc: 'Analyse le momentum actuel via performances 1M–12M, position vs MA50/MA200, volatilité et saisonnalité. Répond à : <em>que se passe-t-il maintenant ?</em>' },
                      { icon: <Zap        style={{ width: 15, height: 15 }}/>, title: 'Score Émergent',       pct: '40%', color: V,       desc: '10 piliers prédictifs qui anticipent les mouvements 1 à 6 mois à l\'avance. Le cœur de la méthode Steffan. Répond à : <em>où va-t-on aller ?</em>' },
                      { icon: <Eye        style={{ width: 15, height: 15 }}/>, title: 'Flux Institutionnels', pct: '15%', color: '#22c55e', desc: 'Suit les mouvements du "smart money" via analyse de volume. L\'accumulation institutionnelle précède systématiquement les hausses de prix.' },
                      { icon: <Target     style={{ width: 15, height: 15 }}/>, title: 'Timing & Vélocité',    pct: '15%', color: '#f97316', desc: 'Vélocité (10%) mesure l\'accélération du prix. Timing Entrée (5%) qualifie le setup : pullback, breakout ou dip en uptrend.' },
                    ].map(({ icon, title, pct, color, desc }, i) => {
                      const [hov, setHov] = useState(false);
                      return (
                        <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
                          padding: '16px', borderRadius: 16,
                          background: hov ? `${color}08` : 'var(--bg-subtle)',
                          border: `1.5px solid ${hov ? color + '30' : 'var(--border)'}`,
                          transition: 'all 0.25s ease',
                          boxShadow: hov ? `0 8px 24px ${color}15` : '0 2px 6px rgba(0,0,0,0.03)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                              background: `${color}12`, border: `1.5px solid ${color}28`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                              transform: hov ? 'scale(1.1) rotate(-5deg)' : 'none',
                              transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                            }}>{icon}</div>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: hov ? color : 'var(--text-primary)', transition: 'color 0.2s' }}>{title}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, padding: '1px 8px', borderRadius: 20, background: `${color}12`, color, border: `1px solid ${color}25`, flexShrink: 0 }}>{pct}</span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: desc }}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="regime">
              <Spot style={GLASS} color="rgba(99,102,241,0.07)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<Globe style={{ width: 18, height: 18 }}/>} title="Régimes Macro" sub="La Rotation Sectorielle (Pilier 4) s'appuie sur ce modèle pour orienter les actifs selon le cycle économique en cours." badge="Pilier 4 — 8%" badgeColor={I} />
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>← Inflation →</span>
                    </div>
                  </div>
                  <div ref={regRef}><RegimeMatrix go={regView} /></div>
                  <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p style={{ fontSize: 11.5, color: '#4338ca', margin: 0, lineHeight: 1.7 }}>
                      <strong>Comment DashFlux détecte le régime :</strong> CPI YoY pour l'inflation (seuil 3%), PMI composite pour la croissance (seuil 50). Transition de régime = signal de rotation sectorielle imminent.
                    </p>
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="technique">
              <Spot style={GLASS} color="rgba(59,130,246,0.06)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<TrendingUp style={{ width: 18, height: 18 }}/>} title="Score Technique" badge="30% du score final" badgeColor="#3b82f6" sub="Évalue la force du momentum actuel. Ce score répond à la question : que se passe-t-il en ce moment sur cet asset ? 4 sous-composantes pondérées." />
                  <div ref={techRef} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {TECH_ROWS.map((r, i) => <TechRow key={r.label} {...r} index={i} go={techView} />)}
                  </div>
                  <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <p style={{ fontSize: 11.5, color: '#1d4ed8', margin: 0, lineHeight: 1.65 }}>
                      <strong>Formule :</strong> Score Technique = Momentum (50%) + Volatilité (25%) + Trend (15%) + Saisonnalité (10%)
                    </p>
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="emergent">
              <Spot style={GLASS} color="rgba(124,58,237,0.07)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<Zap style={{ width: 18, height: 18 }}/>} title="Score Émergent" badge="40% du score final — 10 Piliers" sub="Le pilier le plus important. Anticipe les opportunités 1 à 6 mois à l'avance en combinant 10 signaux prédictifs complémentaires." />
                  <div style={{ padding: '12px 14px', borderRadius: 13, marginBottom: 18, background: `${V}06`, border: `1px solid ${V}18`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Info style={{ width: 13, height: 13, color: V, flexShrink: 0, marginTop: 1 }}/>
                    <p style={{ fontSize: 12, color: '#4c1d95', margin: 0, lineHeight: 1.65 }}>
                      Les 10 piliers émergents couvrent <strong>40% du score composite final</strong>. Chaque pilier est conçu pour capter une dimension différente du marché, avec des horizons allant de <strong>2 semaines à 6 mois</strong>.
                    </p>
                  </div>
                  <div ref={emgRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {EMERGENT_PILIERS.map((p, i) => <PilierCard key={p.num} d={p} index={i} go={emgView} />)}
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="v21">
              <Spot style={GLASS} color="rgba(34,197,94,0.06)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<Sparkles style={{ width: 18, height: 18 }}/>} title="Piliers v2.1" badge="30% du score final — 3 Piliers" badgeColor="#22c55e" sub="Trois piliers ajoutés en v2.1 pour affiner l'analyse avec les flux institutionnels silencieux, l'accélération du momentum et l'optimisation du timing d'entrée." />
                  <div ref={v21Ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {V21_PILIERS.map((p, i) => <PilierCard key={p.num} d={p} index={i} go={v21View} />)}
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="composite">
              <Spot style={GLASS} color="rgba(99,102,241,0.07)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<PieChart style={{ width: 18, height: 18 }}/>} title="Score Composite Final" sub="La formule qui synthétise les 4 composantes en un score unique entre 0 et 100." />
                  <div style={{ padding: '20px', borderRadius: 16, marginBottom: 20, background: `linear-gradient(135deg, ${I}07, ${V}06)`, border: `1.5px solid ${V}18` }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Formule v2.1</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {FORMULA_SEGS.map((s, i, arr) => (
                        <>
                          <div key={s.label} style={{ padding: '8px 14px', borderRadius: 12, textAlign: 'center', background: `${s.color}10`, border: `1.5px solid ${s.color}30` }}>
                            <p style={{ fontSize: 10, color: 'var(--text-faint)', margin: '0 0 2px', fontWeight: 600 }}>{s.label}</p>
                            <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>{s.pct}%</p>
                          </div>
                          {i < arr.length - 1 && <span key={`op${i}`} style={{ fontSize: 20, fontWeight: 300, color: '#d1d5db' }}>+</span>}
                        </>
                      ))}
                      <span style={{ fontSize: 20, fontWeight: 300, color: '#d1d5db' }}>=</span>
                      <div style={{ padding: '8px 16px', borderRadius: 12, textAlign: 'center', background: `${V}10`, border: `2px solid ${V}35`, boxShadow: `0 0 0 4px ${V}07` }}>
                        <p style={{ fontSize: 10, color: V, margin: '0 0 2px', fontWeight: 700 }}>Score Final</p>
                        <p style={{ fontSize: 20, fontWeight: 900, color: V, margin: 0 }}>0–100</p>
                      </div>
                    </div>
                  </div>
                  <div ref={compRef} style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Représentation visuelle des poids</p>
                    <FormulaBar go={compView} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Score Actuel',    c: '#3b82f6', desc: 'Ce qui se passe maintenant. Utile pour le timing de sortie et l\'évaluation du risque immédiat sur une position ouverte.' },
                      { label: 'Score Émergent',  c: V,         desc: 'Où l\'asset va aller dans 1–6 mois. La métrique la plus importante pour décider d\'accumuler une nouvelle position.' },
                      { label: 'Score Composite', c: I,         desc: 'Synthèse pondérée des deux (40%/60%). La meilleure vue globale. Utilisez ce score en priorité pour comparer les assets.' },
                    ].map(({ label, c, desc }) => (
                      <div key={label} style={{ padding: '12px', borderRadius: 12, background: `${c}07`, border: `1px solid ${c}22` }}>
                        <p style={{ fontSize: 11.5, fontWeight: 800, color: c, margin: '0 0 5px' }}>{label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="interp">
              <Spot style={GLASS} color="rgba(124,58,237,0.07)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<Eye style={{ width: 18, height: 18 }}/>} title="Interprétation des Scores" sub="Comment lire et agir sur les scores générés par DashFlux. Chaque plage correspond à une posture d'investissement précise." />
                  <div ref={scoreRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 18 }}>
                    {SCORE_CARDS.map((s, i) => <ScoreCard key={i} {...s} index={i} go={scoreView} />)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)' }}>
                    {[
                      { icon: <CheckCircle style={{ width: 12, height: 12, color: '#16a34a' }}/>, label: 'Live', c: '#16a34a', desc: 'Calcul en temps réel avec données Yahoo Finance / FRED' },
                      { icon: <Clock style={{ width: 12, height: 12, color: '#d97706' }}/>, label: 'Partiel', c: '#d97706', desc: 'Données limitées (COT hebdo pour Positioning, P/E pour Valuation)' },
                    ].map(({ icon, label, c, desc }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {icon}
                        <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{label}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>— {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Spot>
            </Sec>

            <Sec id="usage">
              <Spot style={GLASS} color="rgba(99,102,241,0.06)">
                <div style={{ padding: '24px' }}>
                  <SecHead icon={<BookOpen style={{ width: 18, height: 18 }}/>} title="Comment utiliser DashFlux" sub="Processus en 4 étapes pour intégrer les scores dans votre prise de décision." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { n: '01', title: 'Identifier le régime macro', color: '#3b82f6', desc: 'Vérifiez d\'abord la section Régimes Macro. Le régime actuel conditionne quels types d\'actifs ont la meilleure probabilité de surperformance structurelle. Un score élevé dans un mauvais régime est moins fiable.' },
                      { n: '02', title: 'Scanner le tableau de bord', color: V, desc: 'Filtrez par Score Composite > 65. Identifiez les actifs avec les scores les plus élevés dans leur catégorie. Portez une attention particulière au Score Émergent — c\'est le signal le plus prédictif.' },
                      { n: '03', title: 'Valider la thèse par pilier', color: '#22c55e', desc: 'Cliquez sur un asset pour voir le détail de ses 13 piliers. Cherchez la convergence : si Contrarian + Catalysts + Flux Institutionnels sont tous élevés simultanément, la probabilité de mouvement est très forte.' },
                      { n: '04', title: 'Définir le timing d\'entrée', color: '#f59e0b', desc: 'Utilisez le Pilier 13 (Timing Entrée) et les signaux Catalysts (Pilier 2). Attendez un pullback sur support, un rebond du RSI, ou un breakout confirmé par le volume. Ne montez jamais après un spike de volatilité.' },
                    ].map(({ n, title, color, desc }) => {
                      const [hov, setHov] = useState(false);
                      return (
                        <div key={n} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
                          display: 'flex', gap: 16, padding: '16px', borderRadius: 14, alignItems: 'flex-start',
                          background: hov ? `${color}07` : 'var(--bg-subtle)',
                          border: `1px solid ${hov ? color + '25' : 'var(--border)'}`,
                          transition: 'all 0.25s ease',
                          boxShadow: hov ? `0 6px 20px ${color}12` : 'none',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                            background: `${color}12`, border: `1.5px solid ${color}28`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 900, color,
                            transform: hov ? 'scale(1.1) rotate(-5deg)' : 'none',
                            transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                          }}>{n}</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: hov ? color : 'var(--text-primary)', margin: '0 0 5px', transition: 'color 0.2s' }}>{title}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Spot>
            </Sec>

            <div style={{ ...GLASS, padding: '14px 18px', background: 'rgba(254,252,232,0.92)', borderColor: 'rgba(245,158,11,0.28)' }}>
              <p style={{ fontSize: 11.5, color: '#78350f', margin: 0, lineHeight: 1.75 }}>
                <strong style={{ color: '#d97706' }}>Disclaimer :</strong> Cette méthodologie est fournie à titre éducatif et informatif uniquement.
                Les scores sont basés sur des données historiques et des modèles quantitatifs qui ne garantissent pas les résultats futurs.
                Ce n'est pas un conseil en investissement personnalisé. Consultez un conseiller financier agréé avant toute décision.
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}