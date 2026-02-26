'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Zap, TrendingUp, Calendar } from 'lucide-react';
import { getTodayEvents, hasSeenNotificationToday, markNotificationAsSeen } from '@/lib/eventNotifications';

interface EconomicEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  assets: string[];
}

const IMPACT_STYLE = {
  high:   { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.28)', color: '#7c3aed', dot: '#7c3aed', label: 'HIGH'   },
  medium: { bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.22)', color: '#6366f1', dot: '#6366f1', label: 'MEDIUM' },
  low:    { bg: 'rgba(107,114,128,0.06)',border: 'rgba(107,114,128,0.18)',color: 'var(--text-muted)', dot: 'var(--text-faint)', label: 'LOW'    },
};

function Toast({
  event, index, onClose, autoCloseDelay = 10000,
}: {
  event: EconomicEvent; index: number; onClose: () => void; autoCloseDelay?: number;
}) {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef  = useRef<ReturnType<typeof setTimeout>>(undefined);  // ✅ undefined explicite
  const rafRef    = useRef<number>(0);                                  // ✅ 0 comme valeur initiale
  const startRef  = useRef<number>(0);
  const is = IMPACT_STYLE[event.impact] ?? IMPACT_STYLE.medium;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / autoCloseDelay) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
      else { setVisible(false); timerRef.current = setTimeout(onClose, 350); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [autoCloseDelay, onClose]);

  const handleClose = () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(onClose, 350);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 20 + index * 130,
      right: 20,
      width: 320,
      zIndex: 1000 + index,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(32px) scale(0.97)',
      transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${is.border}`,
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 3, background: 'var(--border)' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${is.color}, ${is.dot})`,
            transition: 'width 0.1s linear',
            borderRadius: 3,
          }}/>
        </div>

        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: is.bg, border: `1px solid ${is.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {event.impact === 'high'
                  ? <Zap style={{ width: 13, height: 13, color: is.color }}/>
                  : <TrendingUp style={{ width: 13, height: 13, color: is.color }}/>
                }
              </div>
              <div>
                <span style={{
                  display: 'inline-flex', padding: '1px 7px', fontSize: 9,
                  fontWeight: 800, letterSpacing: '0.07em',
                  borderRadius: 20, background: is.bg, color: is.color,
                  border: `1px solid ${is.border}`,
                }}>
                  {is.label}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 2, borderRadius: 6, color: 'var(--text-faint)',
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            >
              <X style={{ width: 13, height: 13 }}/>
            </button>
          </div>

          <p style={{
            margin: '0 0 4px',
            fontSize: 12.5, fontWeight: 800, color: 'var(--text-primary)',
            lineHeight: 1.4, letterSpacing: '-0.01em',
          }}>
            {event.title}
          </p>

          <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {event.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar style={{ width: 10, height: 10, color: 'var(--text-faint)' }}/>
              <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600 }}>{event.time}</span>
            </div>
            {event.assets.length > 0 && (
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {event.assets.slice(0, 3).map(a => (
                  <span key={a} style={{
                    padding: '1px 6px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                    background: 'rgba(124,58,237,0.07)', color: '#7c3aed',
                    border: '1px solid rgba(124,58,237,0.15)',
                  }}>
                    {a}
                  </span>
                ))}
                {event.assets.length > 3 && (
                  <span style={{ fontSize: 9, color: 'var(--text-faint)', padding: '1px 4px' }}>
                    +{event.assets.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventNotificationManager() {
  const [notifications, setNotifications] = useState<EconomicEvent[]>([]);

  useEffect(() => {
    const todayEvents = getTodayEvents();
    const unseen = todayEvents.filter(e =>
      e.impact !== 'low' && !hasSeenNotificationToday(e.id)
    );
    if (unseen.length > 0) {
      setNotifications(unseen.slice(0, 3));
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    }
  }, []);

  const handleClose = (id: string) => {
    markNotificationAsSeen(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map((event, i) => (
        <Toast
          key={event.id}
          event={event}
          index={i}
          onClose={() => handleClose(event.id)}
          autoCloseDelay={10000}
        />
      ))}
    </>
  );
}