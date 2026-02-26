'use client';

import { useState, useEffect, useRef } from 'react';
import { AssetScore } from '@/lib/types';
import { Calendar, Target } from 'lucide-react';

interface Props {
  asset: AssetScore;
}

const GLASS: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: 20,
  boxShadow: 'var(--glass-shadow)',
};

const TYPE_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  current:  { bg: 'rgba(99,102,241,0.09)',  color: '#6366f1', border: 'rgba(99,102,241,0.25)',  label: 'NOW'    },
  watch:    { bg: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)', border: 'rgba(107,114,128,0.2)',  label: 'WATCH'  },
  catalyst: { bg: 'rgba(245,158,11,0.09)',  color: '#d97706', border: 'rgba(245,158,11,0.25)',  label: 'KEY'    },
  target:   { bg: 'rgba(34,197,94,0.09)',   color: '#16a34a', border: 'rgba(34,197,94,0.25)',   label: 'TARGET' },
};

function TimelineEvent({
  event, index, total,
}: {
  event: ReturnType<typeof getTimelineEvents>[0];
  index: number;
  total: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const ts = TYPE_STYLE[event.type] ?? TYPE_STYLE.watch;
  const isLast = index === total - 1;

  return (
    <div
      ref={ref}
      className="relative flex gap-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-16px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 100}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 100}ms`,
      }}
    >
      {/* Ligne + point */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
        {/* Dot */}
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: ts.bg,
          border: `2px solid ${ts.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
          boxShadow: `0 0 0 4px ${ts.bg}`,
          zIndex: 1,
        }}>
          {event.icon}
        </div>
        {/* Connector */}
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 24, marginTop: 4,
            background: `linear-gradient(to bottom, ${ts.border}, var(--border))`,
          }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-6" style={{ paddingTop: 4 }}>
        <div
          className="p-4 rounded-2xl"
          style={{
            background: 'var(--bg-subtle)',
            border: `1px solid var(--border)`,
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = ts.border;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${ts.bg}`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: ts.color }}>
                {event.date}
              </p>
              <h3 className="text-sm font-bold text-gray-900">{event.label}</h3>
            </div>
            <span style={{
              display: 'inline-flex', padding: '2px 10px', fontSize: 10,
              fontWeight: 800, letterSpacing: '0.06em',
              borderRadius: 20, background: ts.bg, color: ts.color,
              border: `1px solid ${ts.border}`, flexShrink: 0,
            }}>
              {ts.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{event.description}</p>
        </div>
      </div>
    </div>
  );
}

function getTimelineEvents(asset: AssetScore) {
  const recommendation = asset?.recommendation || 'HOLD';
  const emergentScore  = asset?.emergentScore  || 0;
  const catalysts      = asset?.emergentDetails?.catalysts || 0;

  const events = [];

  events.push({
    date: 'Aujourd\'hui',
    label: recommendation === 'ACCUMULATE' ? 'Zone d\'accumulation' : 'Surveillance active',
    description: `Score Émergent: ${emergentScore}/100 — ${recommendation === 'ACCUMULATE' ? 'Fenêtre d\'entrée ouverte' : 'Signaux à confirmer'}`,
    type: 'current',
    icon: '📍',
  });

  if (catalysts >= 70) {
    events.push({
      date: 'Dans 2 semaines',
      label: 'Confirmation des signaux',
      description: 'Surveiller volume, catalyseurs macro et positionnement institutionnel',
      type: 'watch',
      icon: '👀',
    });
  }

  if (emergentScore >= 70) {
    events.push({
      date: 'Dans 1 mois',
      label: 'Catalyseur majeur attendu',
      description: 'Fed meeting / Event macro important — point de bascule potentiel',
      type: 'catalyst',
      icon: '⚡',
    });
  }

  events.push({
    date: 'Dans 3 mois',
    label: 'Objectif anticipé',
    description: `Potentiel estimé : ${emergentScore >= 70 ? '+10–15%' : '+5–8%'} selon les conditions macro`,
    type: 'target',
    icon: '🎯',
  });

  return events;
}

export default function PredictiveTimeline({ asset }: Props) {
  if (!asset) {
    return (
      <div className="p-6 rounded-2xl animate-pulse"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)' }}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  const events = getTimelineEvents(asset);

  return (
    <div style={GLASS} className="p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'rgba(99,102,241,0.09)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Calendar className="w-4 h-4" style={{ color: '#6366f1' }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Timeline Prédictive</h2>
          <p className="text-xs text-gray-400">Projections basées sur les signaux émergents</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-2">
        {events.map((event, i) => (
          <TimelineEvent key={i} event={event} index={i} total={events.length} />
        ))}
      </div>

      {/* Footer tip */}
      <div className="mt-2 p-4 rounded-2xl flex items-start gap-3"
        style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <Target className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }} />
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: '#6366f1' }}>
            Comment utiliser cette timeline ?
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Les dates sont indicatives et basées sur les signaux émergents actuels.
            Elles peuvent évoluer selon les catalyseurs macro et le positionnement institutionnel.
          </p>
        </div>
      </div>
    </div>
  );
}