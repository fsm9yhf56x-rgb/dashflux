'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, TrendingUp, AlertCircle,
  RefreshCw, SlidersHorizontal, Zap, Landmark, Globe, BarChart3,
  DollarSign, Newspaper, Activity, BookOpen, Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EconomicEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'fed' | 'ecb' | 'boj' | 'data' | 'earnings' | 'geopolitical';
  country: string;
  assets: string[];
  actual?: string;
  forecast?: string;
  previous?: string;
  source: 'predictive' | 'api';
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keytml fadeUp      { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:none; } }
  @keyframes shimmer  { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  @keyframes dotPulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.6); opacity:0.5; } }
`;

// ── Tokens ────────────────────────────────────────────────────────────────────
const GLASS: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: 20,
  boxShadow: 'var(--glass-shadow)',
};

const IMPACT = {
  high:   { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.28)', color: '#7c3aed', label: 'Impact Élevé',  glow: 'rgba(124,58,237,0.12)' },
  medium: { bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.22)', color: '#6366f1', label: 'Impact Moyen',  glow: 'rgba(99,102,241,0.1)'  },
  low:    { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)',   color: '#16a34a', label: 'Impact Faible', glow: 'rgba(34,197,94,0.08)'  },
};

const CAT_ICON: Record<string, React.ReactNode> = {
  fed:         <Landmark  style={{ width: 18, height: 18 }}/>,
  ecb:         <Globe     style={{ width: 18, height: 18 }}/>,
  boj:         <Globe     style={{ width: 18, height: 18 }}/>,
  data:        <BarChart3 style={{ width: 18, height: 18 }}/>,
  earnings:    <DollarSign style={{ width: 18, height: 18 }}/>,
  geopolitical:<Newspaper style={{ width: 18, height: 18 }}/>,
};

function getDaysUntil(date: Date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0)   return { label: 'Passé',         color: 'var(--text-faint)', bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.2)'  };
  if (diff === 0) return { label: "Aujourd'hui",   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.3)'   };
  if (diff === 1) return { label: 'Demain',         color: '#6366f1', bg: 'rgba(99,102,241,0.09)', border: 'rgba(99,102,241,0.25)'  };
  if (diff < 7)  return  { label: `J-${diff}`,     color: '#16a34a', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.22)'   };
  return          { label: `J-${diff}`,             color: 'var(--text-muted)', bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.18)' };
}

// ── Count-up ──────────────────────────────────────────────────────────────────
function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
  const [v, setV] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const s = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - s) / duration, 1);
      setV(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) requestAnimationFrame(tick);
      else setV(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{v}</>;
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ value, label, color }: { value: number; label: string; color: string }) {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      padding: '8px 16px', borderRadius: 12,
      background: `${color}10`, border: `1px solid ${color}30`,
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(8px)',
      transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
        {vis ? <CountUp target={value}/> : 0}
      </p>
      <p style={{ fontSize: 10, color: 'var(--text-faint)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ ...GLASS, padding: '18px 20px', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
      }}/>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--border)', flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, borderRadius: 6, background: 'var(--border)', width: '60%', marginBottom: 8 }}/>
          <div style={{ height: 11, borderRadius: 6, background: 'var(--border)', width: '85%', marginBottom: 6 }}/>
          <div style={{ height: 11, borderRadius: 6, background: 'var(--border)', width: '45%' }}/>
        </div>
      </div>
    </div>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────
function EventCard({ event, index }: { event: EconomicEvent; index: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const ref   = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const is    = IMPACT[event.impact] ?? IMPACT.low;
  const dc    = getDaysUntil(event.date);
  const isToday = dc.label === "Aujourd'hui";

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      el.style.backgroundImage = `radial-gradient(ellipse 60% 80% at ${x}% ${y}%, ${is.glow}, transparent 70%)`;
    });
  }, [is.glow]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.backgroundImage = '';
    setHov(false);
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        ...GLASS,
        padding: '16px 18px',
        position: 'relative', overflow: 'hidden',
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : `translateX(${index % 2 === 0 ? '-' : ''}14px)`,
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${Math.min(index * 50, 400)}ms,
                     transform 0.5s cubic-bezier(0.16,1,0.3,1) ${Math.min(index * 50, 400)}ms,
                     border-color 0.25s, box-shadow 0.3s`,
        borderColor: hov ? is.border : 'var(--border)',
        boxShadow: hov ? `0 8px 32px ${is.glow}, 0 2px 8px rgba(0,0,0,0.04)` : '0 2px 16px rgba(0,0,0,0.05)',
      }}
    >
      {/* Today accent line */}
      {isToday && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(to bottom, ${is.color}, transparent)`,
          borderRadius: '20px 0 0 20px',
        }}/>
      )}

      {/* Real data badge */}
      {event.source === 'api' && (
        <div style={{ position: 'absolute', top: 12, right: 14 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 800,
            background: 'rgba(34,197,94,0.08)', color: '#16a34a',
            border: '1px solid rgba(34,197,94,0.22)',
          }}>
            Données réelles
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', paddingLeft: isToday ? 6 : 0 }}>

        {/* Category icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: is.bg, border: `1.5px solid ${is.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: is.color,
          transform: hov ? 'scale(1.1) rotate(-5deg)' : 'none',
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {CAT_ICON[event.category] ?? <Activity style={{ width: 18, height: 18 }}/>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{
              fontSize: 13, fontWeight: 800, color: hov ? is.color : 'var(--text-primary)',
              margin: 0, letterSpacing: '-0.01em', transition: 'color 0.2s',
            }}>
              {event.title}
            </h3>

            {isToday && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: is.color, display: 'inline-block',
                  animation: 'dotPulse 1.5s ease-in-out infinite',
                }}/>
                <span style={{ fontSize: 9, fontWeight: 800, color: is.color, letterSpacing: '0.06em' }}>LIVE</span>
              </span>
            )}

            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: is.bg, color: is.color, border: `1px solid ${is.border}`, flexShrink: 0,
            }}>
              {is.label}
            </span>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '0 0 9px', lineHeight: 1.65 }}>
            {event.description}
          </p>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarIcon style={{ width: 10, height: 10, color: 'var(--text-faint)' }}/>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {event.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 10, height: 10, color: 'var(--text-faint)' }}/>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{event.time}</span>
            </div>
            <span style={{
              padding: '1px 7px', borderRadius: 7, fontSize: 10, fontWeight: 700,
              background: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)',
              border: '1px solid rgba(107,114,128,0.14)',
            }}>
              {event.country}
            </span>
          </div>

          {/* Forecast / Actual / Previous */}
          {(event.forecast || event.actual || event.previous) && (
            <div style={{ display: 'flex', gap: 14, marginBottom: 9, flexWrap: 'wrap' }}>
              {event.previous && (
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>Précédent </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{event.previous}</span>
                </div>
              )}
              {event.forecast && (
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>Prévision </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>{event.forecast}</span>
                </div>
              )}
              {event.actual && (
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>Réel </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a' }}>{event.actual}</span>
                </div>
              )}
            </div>
          )}

          {/* Assets */}
          {event.assets.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <TrendingUp style={{ width: 10, height: 10, color: 'var(--text-faint)' }}/>
              {event.assets.map((a, i) => (
                <span key={a} style={{
                  padding: '1px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: hov ? is.bg : 'rgba(124,58,237,0.06)',
                  color: hov ? is.color : '#7c3aed',
                  border: `1px solid ${hov ? is.border : 'rgba(124,58,237,0.14)'}`,
                  fontFamily: 'monospace',
                  transform: hov ? 'translateY(-1px)' : 'none',
                  transition: `all 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms`,
                }}>
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{
          flexShrink: 0, padding: '7px 12px', borderRadius: 11,
          textAlign: 'center', minWidth: 62,
          background: dc.bg, border: `1.5px solid ${dc.border}`,
          transform: hov ? 'scale(1.06) translateY(-2px)' : 'none',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <p style={{ fontSize: 13, fontWeight: 900, color: dc.color, margin: 0, letterSpacing: '-0.02em' }}>
            {dc.label}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── GlassSelect ───────────────────────────────────────────────────────────────
function GlassSelect({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{
        padding: '7px 12px', borderRadius: 11, fontSize: 12, fontWeight: 600,
        background: 'var(--glass-bg)',
        border: `1px solid ${foc ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
        color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
        boxShadow: foc ? '0 0 0 3px rgba(124,58,237,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}>
      {children}
    </select>
  );
}

// ── Legend (sticky sidebar) ───────────────────────────────────────────────────
function LegendCard({ apiCount }: { apiCount: number }) {
  const ITEMS = [
    { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.22)', label: 'Impact Élevé',  desc: 'Mouvements de 1–3%+ en une journée' },
    { color: '#6366f1', bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.18)', label: 'Impact Moyen',  desc: 'Influence graduelle sur le sentiment' },
    { color: '#16a34a', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.18)',  label: 'Impact Faible', desc: 'Effet limité sur les prix' },
  ];

  const TIPS = [
    { icon: <CalendarIcon style={{ width: 12, height: 12 }}/>, text: 'Positionnez-vous avant l\'événement' },
    { icon: <Clock        style={{ width: 12, height: 12 }}/>, text: 'Données mises à jour toutes les heures' },
    { icon: <BarChart3    style={{ width: 12, height: 12 }}/>, text: 'Vérifiez le consensus avant / après' },
  ];

  return (
    <div style={{ ...GLASS, padding: '16px', animation: 'slideIn 0.5s ease 0.2s both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(99,102,241,0.09)', border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen style={{ width: 13, height: 13, color: '#6366f1' }}/>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>Guide de lecture</span>
      </div>

      {/* Impact levels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {ITEMS.map(item => (
          <div key={item.label} style={{
            padding: '8px 10px', borderRadius: 10,
            background: item.bg, border: `1px solid ${item.border}`,
          }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 800, color: item.color }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }}/>

      {/* Tips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {TIPS.map((tip, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <span style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
            <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{tip.text}</p>
          </div>
        ))}
      </div>

      {/* API status */}
      {apiCount > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#16a34a', display: 'inline-block',
              animation: 'dotPulse 2s ease-in-out infinite',
            }}/>
            <span style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 700 }}>
              {apiCount} données réelles connectées
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CalendrierPage() {
  const router = useRouter();
  const [events,           setEvents]           = useState<EconomicEvent[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact,   setSelectedImpact]   = useState('all');

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res  = await fetch('/api/calendar');
      const data = await res.json();
      setEvents(data.map((e: any) => ({ ...e, date: new Date(e.date) })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = events.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (selectedImpact   !== 'all' && e.impact   !== selectedImpact)   return false;
    return true;
  });

  const apiCount      = events.filter(e => e.source === 'api').length;
  const todayCount    = events.filter(e => getDaysUntil(e.date).label === "Aujourd'hui").length;
  const thisWeekCount = events.filter(e => getDaysUntil(e.date).label !== 'Passé').length;

  return (
    <>
      <style>{CSS}</style>
      <main style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '24px 20px 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Back ─────────────────────────────────────────── */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--text-faint)',
              padding: 0, marginBottom: 22, transition: 'color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.transform = 'translateX(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.transform = ''; }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }}/> Dashboard
          </button>

          {/* ── Header ───────────────────────────────────────── */}
          <div style={{ marginBottom: 24, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 15,
                  background: 'rgba(124,58,237,0.09)', border: '1.5px solid rgba(124,58,237,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.1)',
                }}>
                  <CalendarIcon style={{ width: 20, height: 20, color: '#7c3aed' }}/>
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
                    Calendrier Économique
                  </h1>
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '3px 0 0', fontWeight: 500 }}>
                    Événements majeurs pour vos décisions d'investissement
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchEvents(true)}
                disabled={refreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  opacity: refreshing ? 0.7 : 1,
                  boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                  transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onMouseEnter={e => { if (!refreshing) e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <RefreshCw style={{ width: 12, height: 12, animation: refreshing ? 'spin 0.75s linear infinite' : 'none' }}/>
                Actualiser
              </button>
            </div>

            {/* Stats chips */}
            {!loading && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatChip value={events.length}    label="Total"         color="#7c3aed"/>
                <StatChip value={todayCount}       label="Aujourd'hui"   color="#6366f1"/>
                <StatChip value={thisWeekCount}    label="À venir"       color="#16a34a"/>
                {apiCount > 0 && <StatChip value={apiCount} label="Données réelles" color="#d97706"/>}
              </div>
            )}
          </div>

          {/* ── Filters ──────────────────────────────────────── */}
          <div style={{
            ...GLASS, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            animation: 'slideIn 0.4s ease 0.1s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <SlidersHorizontal style={{ width: 12, height: 12, color: '#7c3aed' }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Filtres</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <GlassSelect value={selectedCategory} onChange={setSelectedCategory}>
                <option value="all">Tous les types</option>
                <option value="fed">Fed (FOMC)</option>
                <option value="ecb">BCE</option>
                <option value="boj">BOJ</option>
                <option value="data">Données économiques</option>
                <option value="earnings">Résultats entreprises</option>
                <option value="geopolitical">Géopolitique</option>
              </GlassSelect>
              <GlassSelect value={selectedImpact} onChange={setSelectedImpact}>
                <option value="all">Tous les impacts</option>
                <option value="high">Impact élevé</option>
                <option value="medium">Impact moyen</option>
                <option value="low">Impact faible</option>
              </GlassSelect>
            </div>
            {!loading && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
                {filtered.length} événement{filtered.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ── 2-col layout ──────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>

            {/* Events column */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(5)].map((_, i) => <SkeletonCard key={i}/>)}
                </div>
              )}

              {!loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filtered.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i}/>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ ...GLASS, padding: '56px 24px', textAlign: 'center' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'rgba(107,114,128,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}>
                        <AlertCircle style={{ width: 22, height: 22, color: '#d1d5db' }}/>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0, fontWeight: 600 }}>
                        Aucun événement ne correspond à vos filtres
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky legend */}
            <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 130 }}>
              <LegendCard apiCount={apiCount}/>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}