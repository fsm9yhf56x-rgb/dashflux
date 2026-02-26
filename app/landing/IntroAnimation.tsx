'use client';

import { useEffect, useRef, useState } from 'react';

interface Props { onComplete: () => void; }

export default function IntroAnimation({ onComplete }: Props) {
  const [phase, setPhase]     = useState<'enter'|'words'|'cta'|'exit'>('enter');
  const [fadeOut, setFadeOut] = useState(false);
  const onCompleteRef         = useRef(onComplete);
  onCompleteRef.current       = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('words'), 900);
    const t2 = setTimeout(() => setPhase('cta'),   2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    if (phase === 'exit') return;
    setPhase('exit');
    setFadeOut(true);
    setTimeout(() => onCompleteRef.current(), 900);
  };

  const words = ['Identifie', 'où', "l'action", 'se', 'passe'];

  return (
    <div className="fixed inset-0 z-50 bg-white">

      {/* Blobs — même palette que la landing */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <svg width="100%" height="100%" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ig1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.5"><animate attributeName="stopOpacity" values="0.3;0.7;0.3" dur="3.1s" repeatCount="indefinite"/></stop>
              <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.4"><animate attributeName="stopOpacity" values="0.2;0.6;0.2" dur="3.9s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <linearGradient id="ig2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fae8ff" stopOpacity="0.5"><animate attributeName="stopOpacity" values="0.3;0.6;0.3" dur="3.6s" repeatCount="indefinite"/></stop>
              <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.4"><animate attributeName="stopOpacity" values="0.2;0.5;0.2" dur="4.3s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <filter id="igooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur"/>
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -10" result="goo"/>
              <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
            </filter>
          </defs>
          <g filter="url(#igooey)">
            <ellipse cx="200" cy="150" fill="url(#ig1)">
              <animate attributeName="rx" values="200;280;200" dur="5.9s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="260;200;260" dur="5.9s" repeatCount="indefinite"/>
              <animate attributeName="cx" values="200;320;200" dur="7.4s" repeatCount="indefinite"/>
              <animate attributeName="cy" values="150;250;150" dur="6.7s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="1150" cy="180" fill="url(#ig2)">
              <animate attributeName="rx" values="240;310;240" dur="6.7s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="300;240;300" dur="6.7s" repeatCount="indefinite"/>
              <animate attributeName="cx" values="1150;1050;1150" dur="8.3s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="700" cy="500" fill="url(#ig1)">
              <animate attributeName="rx" values="280;220;280" dur="7.8s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="220;280;220" dur="7.8s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="250" cy="750" fill="url(#ig2)">
              <animate attributeName="rx" values="210;270;210" dur="7.1s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="270;210;270" dur="7.1s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="1100" cy="720" fill="url(#ig1)">
              <animate attributeName="rx" values="250;200;250" dur="6.3s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="200;260;200" dur="6.3s" repeatCount="indefinite"/>
            </ellipse>
          </g>
        </svg>
      </div>

      {/* Grain texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        opacity: 0.02,
        mixBlendMode: 'multiply',
      }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none" style={{overflow:'visible'}}>

        {/* DashFlux logo */}
        <div style={{
          opacity: 0,
          overflow: 'visible',
          animation: phase !== 'exit'
            ? 'iLogoIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards'
            : 'iLogoOut 0.45s ease forwards',
        }}>
          <h1 style={{
            fontFamily: 'Impact,"Arial Black",sans-serif',
            fontStyle: 'italic',
            fontSize: 'clamp(3.5rem,10vw,7rem)',
            fontWeight: 400,
            whiteSpace: 'nowrap',
            lineHeight: 1,
            margin: 0,
            padding: '0 0.4em',
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 40%,#a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            transform: 'skewX(-8deg)',
          }}>DashFlux</h1>
        </div>

        {/* Tagline */}
        <div className="mt-8 flex flex-wrap items-center justify-center" style={{ gap: '0.6rem' }}>
          {words.map((word, i) => (
            <span key={i} style={{
              display: 'inline-block',
              opacity: 0,
              fontSize: 'clamp(1rem,2.2vw,1.3rem)',
              color: 'var(--text-muted)',
              fontWeight: 500,
              animation: (phase === 'words' || phase === 'cta' || phase === 'exit')
                ? `iWordUp 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms forwards`
                : 'none',
            }}>{word}</span>
          ))}
        </div>



        {/* Subtitle */}
        <div style={{
          marginTop: '0.75rem',
          opacity: (phase === 'cta' || phase === 'exit') ? 1 : 0,
          transform: (phase === 'cta' || phase === 'exit') ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s 0.2s ease, transform 0.6s 0.2s ease',
        }}>
          <p style={{
            fontSize: 'clamp(0.72rem,1.3vw,0.88rem)',
            color: 'var(--text-faint)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>Dashboard Multi-Assets</p>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '3.5rem',
          opacity: (phase === 'cta') ? 1 : phase === 'exit' ? 0 : 0,
          transform: (phase === 'cta') ? 'translateY(0)' : phase === 'exit' ? 'translateY(-8px)' : 'translateY(18px)',
          transition: phase === 'exit'
            ? 'opacity 0.3s ease, transform 0.3s ease'
            : 'opacity 0.7s 0.1s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <button onClick={handleEnter} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px 38px',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '1.05rem',
            fontWeight: 600,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'inherit',
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05) translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 40px rgba(0,0,0,0.20)';
            const shine = e.currentTarget.querySelector('.i-shine') as HTMLElement;
            if (shine) shine.style.left = '100%';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = '';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.13)';
            const shine = e.currentTarget.querySelector('.i-shine') as HTMLElement;
            if (shine) { shine.style.transition = 'none'; shine.style.left = '-100%'; requestAnimationFrame(() => { shine.style.transition = 'left 0.7s cubic-bezier(0.34,1.56,0.64,1)'; }); }
          }}>
            <span style={{ position: 'relative', zIndex: 1 }}>Enter</span>
            <span style={{ position: 'relative', zIndex: 1, fontSize: '1.1rem', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>→</span>
            {/* shine */}
            <span className="i-shine" style={{
              position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
              background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
              transition: 'left 0.7s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </button>
        </div>

        {/* Pulsing dot */}
        <div style={{
          marginTop: '2.5rem',
          opacity: (phase === 'cta' || phase === 'exit') ? 1 : 0,
          transition: 'opacity 0.6s 0.6s ease',
        }}>
          <div style={{
            width: 6, height: 6,
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            borderRadius: '50%',
            animation: 'iPulseDot 2.2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Fade to white */}
      <div className="absolute inset-0 pointer-events-none bg-white" style={{
        opacity: fadeOut ? 1 : 0,
        transition: 'opacity 0.85s cubic-bezier(0.4,0,1,1)',
      }} />

      <style>{`
        @keyframes iLogoIn {
          0%   { opacity:0; transform:translateY(20px); filter:blur(8px); }
          100% { opacity:1; transform:translateY(0);    filter:blur(0); }
        }
        @keyframes iLogoOut {
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-12px) scale(0.97); }
        }
        @keyframes iWordUp {
          0%   { opacity:0; transform:translateY(16px); filter:blur(3px); }
          100% { opacity:1; transform:translateY(0);    filter:blur(0); }
        }
        @keyframes iPulseDot {
          0%,100% { transform:scale(1);   opacity:0.5; }
          50%     { transform:scale(1.7); opacity:1; }
        }
      `}</style>
    </div>
  );
}