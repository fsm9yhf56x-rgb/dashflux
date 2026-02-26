'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const CATEGORIES = [
  { id: 'all',       label: 'Tous'        },
  { id: 'equity',    label: 'Actions'     },
  { id: 'commodity', label: 'Commodités'  },
  { id: 'crypto',    label: 'Crypto'      },
  { id: 'bond',      label: 'Obligations' },
  { id: 'currency',  label: 'Devises'     },
];

export default function FilterTabs({ activeFilter, onFilterChange }: Props) {
  const [hov,       setHov]       = useState<string | null>(null);
  const [pressed,   setPressed]   = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ left: 4, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs      = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el        = btnRefs.current[activeFilter];
    const container = containerRef.current;
    if (!el || !container) return;
    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setIndicator({ left: er.left - cr.left, width: er.width });
  }, [activeFilter]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-flex', flexWrap: 'nowrap', gap: 2,
        padding: '4px',
        background: 'var(--bg-subtle)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 14,
        marginBottom: 4,
      }}
    >
      {/* Sliding pill indicator */}
      <div style={{
        position: 'absolute',
        top: 4, bottom: 4,
        left: indicator.left,
        width: indicator.width,
        background: 'rgba(124,58,237,0.1)',
        border: '1.5px solid rgba(124,58,237,0.28)',
        borderRadius: 10,
        boxShadow: '0 2px 14px rgba(124,58,237,0.13)',
        transition: 'left 0.32s cubic-bezier(0.34,1.2,0.64,1), width 0.32s cubic-bezier(0.34,1.2,0.64,1)',
        pointerEvents: 'none',
        zIndex: 0,
      }}/>

      {CATEGORIES.map(cat => {
        const isActive  = activeFilter === cat.id;
        const isHov     = hov === cat.id && !isActive;
        const isPressed = pressed === cat.id;

        return (
          <button
            key={cat.id}
            ref={el => { btnRefs.current[cat.id] = el; }}
            onClick={() => onFilterChange(cat.id)}
            onMouseEnter={() => setHov(cat.id)}
            onMouseLeave={() => { setHov(null); setPressed(null); }}
            onMouseDown={() => setPressed(cat.id)}
            onMouseUp={() => setPressed(null)}
            style={{
              position: 'relative', zIndex: 1,
              padding: '7px 18px',
              borderRadius: 10,
              fontSize: 13.8,
              fontWeight: isActive ? 700 : 500,
              background: 'transparent',
              border: 'none',
              color: isActive ? '#7c3aed' : isHov ? '#4f46e5' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transform: isPressed
                ? 'scale(0.93)'
                : isHov && !isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'color 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}