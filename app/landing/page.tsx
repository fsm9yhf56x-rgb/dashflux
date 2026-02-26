'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, TrendingUp, TrendingDown, CheckCircle, XCircle, Trophy, Target, Menu, X } from 'lucide-react';
import IntroAnimation from './IntroAnimation';

export default function Page() {
  const [showIntro, setShowIntro] = useState(true);
  const [landingVisible, setLandingVisible] = useState(false);

  const handleIntroComplete = () => {
    setLandingVisible(true);
    setTimeout(() => setShowIntro(false), 600);
  };

  useEffect(() => {
    const t = setTimeout(() => { setLandingVisible(true); setShowIntro(false); }, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div style={{ opacity: landingVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <LandingPage />
      </div>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
    </>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, duration = 1200, started = false) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!started) return;
    setDone(false);
    let startTime = 0;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else { setValue(target); setDone(true); }
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return { value, done };
}

const CARD_BASE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid #d4d6e2',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};
const CARD_SUBTLE: React.CSSProperties = { ...CARD_BASE, background: 'rgba(255,255,255,0.72)' };

function TiltCard({ children, className, style, subtle }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; subtle?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px) scale(1.01)`;
      el.style.borderColor = '#a89fd4';
      el.style.boxShadow = `${-x * 14}px ${Math.abs(y) * 8 + 8}px 36px rgba(102,126,234,0.15)`;
    });
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = '';
    el.style.borderColor = '#d4d6e2';
    el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ ...(subtle ? CARD_SUBTLE : CARD_BASE), ...style, willChange: 'transform' }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function MagneticLink({ children, href, className, style }: {
  children: React.ReactNode; href: string; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.28;
    const y = (e.clientY - r.top  - r.height / 2) * 0.28;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  return (
    <Link ref={ref} href={href} className={className}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)', ...style }}>
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LandingNav — réduction hauteur par padding uniquement
// Logo 2.8rem / 1.6rem : INCHANGÉ
// py-4 → py-2 / mb-3 → mb-1 / p-4 → p-3 / spacer h-20 → h-[70px]
// ─────────────────────────────────────────────────────────────────────────────

function MagneticNavItem({ href, label, isActive, onClick }: {
  href: string; label: string; isActive: boolean; onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.22;
    const y = (e.clientY - r.top  - r.height / 2) * 0.22;
    el.style.transform = `translate(${x}px,${y}px)`;
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = '';
    setHovered(false);
  }, []);

  return (
    <Link ref={ref} href={href} onClick={onClick}
      onMouseMove={onMove} onMouseEnter={() => setHovered(true)} onMouseLeave={onLeave}
      className="relative px-5 py-2 rounded-full text-sm font-medium select-none"
      style={{
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), color 0.2s ease',
        color: isActive ? '#7c3aed' : hovered ? '#4f46e5' : '#6b7280',
        fontWeight: isActive || hovered ? 600 : 500,
        willChange: 'transform',
      }}
    >
      <span className="absolute inset-0 rounded-full" style={{
        background: isActive ? 'rgba(124,58,237,0.08)' : hovered ? 'rgba(79,70,229,0.06)' : 'transparent',
        transition: 'background 0.25s ease',
      }} />
      <span className="relative z-10" style={{
        background: hovered || isActive ? 'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#a78bfa 100%)' : 'none',
        WebkitBackgroundClip: hovered || isActive ? 'text' : 'unset',
        WebkitTextFillColor: hovered || isActive ? 'transparent' : 'inherit',
        backgroundClip: hovered || isActive ? 'text' : 'unset',
        backgroundSize: '200% auto',
        animation: hovered || isActive ? 'navShimmer 3s linear infinite' : 'none',
        transition: 'all 0.2s ease',
      }}>
        {label}
      </span>
      {isActive && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
          style={{ width: '60%', background: 'linear-gradient(90deg,#667eea,#a78bfa)' }} />
      )}
    </Link>
  );
}

function CtaButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href="/dashboard"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-2 px-6 py-2 text-white rounded-full font-semibold text-sm overflow-hidden"
      style={{
        background: '#111827',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.12)',
        transform: hovered ? 'translateY(-1px) scale(1.02)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      <span className="absolute inset-0" style={{
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
        transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.7s ease',
      }} />
      <span className="relative z-10">Accéder à l'app</span>
      <ArrowRight className="w-3.5 h-3.5 relative z-10"
        style={{ transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)', transform: hovered ? 'translateX(3px)' : 'none' }} />
    </Link>
  );
}

const LANDING_NAV_LINKS = [
  { href: '/methodologie',      label: 'Méthodologie' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
];

function LandingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    !href.startsWith('#') && (pathname === href || pathname?.startsWith(href + '/'));

  return (
    <>
      <style>{`
        @keyframes navShimmer {
          0%   { background-position: 0%   center }
          100% { background-position: 200% center }
        }
      `}</style>

      {/* ── MOBILE — p-4 → p-3 ─────────────────────────────────── */}
      <div className="lg:hidden fixed top-[33px] left-0 right-0 z-50" style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(212,214,226,0.6)',
      }}>
        <div className="flex items-center justify-between p-3">
          <Link href="/" className="flex flex-col">
            <span style={{
              fontFamily: 'Impact,"Arial Black",sans-serif',
              fontStyle: 'italic',
              fontSize: '1.6rem',          /* inchangé */
              lineHeight: 1,
              padding: '0 0.25em',
              background: 'linear-gradient(135deg,#667eea 0%,#764ba2 40%,#a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
              transform: 'skewX(-8deg)',
            }}>DashFlux</span>
            <span className="text-xs text-gray-400 font-medium ml-0.5">Dashboard Multi-Assets</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="py-3 px-4 space-y-1" style={{ borderTop: '1px solid rgba(212,214,226,0.6)' }}>
            {LANDING_NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={isActive(href)
                  ? { background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontWeight: 600 }
                  : { color: '#6b7280' }}>
                {label}
              </Link>
            ))}
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-full text-sm font-semibold"
              style={{ background: '#111827' }}>
              <span>Accéder à l'app</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Mobile spacer ajusté */}
      <div className="lg:hidden h-[70px]" />

      {/* ── DESKTOP — py-4 → py-2 / mb-3 → mb-1 ──────────────────── */}
      <div className="hidden lg:block fixed top-[33px] left-0 right-0 z-50" style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(212,214,226,0.6)',
      }}>
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-1">

              {/* Logo — 2.8rem inchangé */}
              <div>
                <span style={{
                  fontFamily: 'Impact,"Arial Black",sans-serif',
                  fontStyle: 'italic',
                  fontSize: '2.8rem',          /* inchangé */
                  lineHeight: 1,
                  padding: '0 0.3em',
                  background: 'linear-gradient(135deg,#667eea 0%,#764ba2 40%,#a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                  transform: 'skewX(-8deg)',
                }}>DashFlux</span>
                <p className="text-sm text-gray-400 font-medium mt-1 pl-1">Dashboard Multi-Assets</p>
              </div>

              <nav className="flex items-center gap-0.5">
                {LANDING_NAV_LINKS.map(({ href, label }) => (
                  <MagneticNavItem key={href} href={href} label={label} isActive={isActive(href)} />
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <CtaButton />
              </div>
            </div>

            <div className="flex justify-end">
              <p className="text-xs text-gray-400 invisible">placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ScoreBar
// ─────────────────────────────────────────────────────────────────────────────
function ScoreBar({ score, inView }: { score: number; inView: boolean }) {
  const { value: count, done } = useCountUp(score, 1200, inView);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Score</span>
        <span className={`font-bold tabular-nums ${done ? 'count-pulse' : ''}`}>{count}<span className="text-gray-400">/100</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full ${done ? 'bar-glow' : ''}`}
          style={{ width: inView ? `${score}%` : '0%', transition: 'width 1.4s cubic-bezier(0.34,1.10,0.64,1)' }} />
      </div>
    </div>
  );
}

const TICKER = [
  { name: 'BTC/USD', val: '+42%', up: true }, { name: 'OR', val: '+15%', up: true },
  { name: 'S&P 500', val: '+18%', up: true }, { name: 'ETH/USD', val: '+28%', up: true },
  { name: 'QQQ', val: '−22%', up: false },    { name: 'DXY', val: '+3%', up: true },
  { name: 'PÉTROLE', val: '+11%', up: true },  { name: 'TLT', val: '−8%', up: false },
  { name: 'NASDAQ', val: '+24%', up: true },   { name: 'EUR/USD', val: '−2%', up: false },
];
function Ticker() {
  return (
    <div className="overflow-hidden border-b border-gray-100 bg-white/90 backdrop-blur-sm py-2 px-4">
      <div className="ticker-track flex gap-10 whitespace-nowrap">
        {[...TICKER,...TICKER,...TICKER].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-400 font-medium">{item.name}</span>
            <span className={item.up ? 'text-emerald-500 font-bold' : 'text-red-400 font-bold'}>{item.val}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TRACK_ITEMS = [
  { asset:'Or (GLD)',     date:'Oct 2023',  score:82, signal:'Acheter', num:15, period:'3 mois', up:true  },
  { asset:'Bitcoin',      date:'Jan 2024',  score:78, signal:'Acheter', num:42, period:'5 mois', up:true  },
  { asset:'Tech (QQQ)',   date:'Août 2024', score:35, signal:'Éviter',  num:22, period:'Évité',  up:false },
  { asset:'Crypto (ETH)', date:'Déc 2023',  score:75, signal:'Acheter', num:28, period:'4 mois', up:true  },
];
function TrackCard({ item, inView }: { item: typeof TRACK_ITEMS[0]; inView: boolean }) {
  const { value: count, done } = useCountUp(item.num, 1000, inView);
  return (
    <TiltCard className="p-6 rounded-3xl h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">{item.asset}</h3>
        <span className="text-xs text-gray-500">{item.date}</span>
      </div>
      <div className="space-y-3 mb-6">
        <ScoreBar score={item.score} inView={inView} />
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Signal</span>
          <span className="font-bold gradient-text">{item.signal}</span>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-100">
        <p className={`text-4xl font-bold mb-1 tabular-nums ${item.up ? 'gradient-text' : 'text-gray-400'} ${done ? 'count-pulse' : ''}`}>
          {item.up ? '+' : '−'}{count}%
        </p>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.period}</p>
      </div>
    </TiltCard>
  );
}

function HeroScore({ inView }: { inView: boolean }) {
  const { value } = useCountUp(78, 1000, inView);
  return <span className="gradient-text tabular-nums">{value}/100</span>;
}
function StatNum({ target, inView }: { target: number; inView: boolean }) {
  const { value, done } = useCountUp(target, 1200, inView);
  return <span className={done ? 'count-pulse inline-block' : 'inline-block'}>{value}</span>;
}
function Divider() {
  return (
    <div className="relative h-px max-w-7xl mx-auto my-20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}

function LandingPage() {
  const { ref: heroScoreRef, inView: heroScoreInView } = useInView(0.2);
  const { ref: statsRef,     inView: statsInView }     = useInView(0.3);
  const { ref: problemRef,   inView: problemInView }   = useInView(0.1);
  const { ref: trackRef,     inView: trackInView }     = useInView(0.05);
  const { ref: howRef,       inView: howInView }       = useInView(0.1);
  const { ref: pilliersRef,  inView: pilliersInView }  = useInView(0.05);
  const { ref: ctaRef,       inView: ctaInView }       = useInView(0.2);

  useEffect(() => {
    const el = document.getElementById('cursor-glow');
    if (!el) return;
    let cx = -400, cy = -400, tx = -400, ty = -400, raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      cx = lerp(cx, tx, 0.07); cy = lerp(cy, ty, 0.07);
      el.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    const onScroll = () => {
      if (!bar) return;
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      bar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden" style={{ fontFamily: 'Inter,-apple-system,sans-serif' }}>
      <div id="cursor-glow" className="fixed top-0 left-0 w-[400px] h-[400px] pointer-events-none z-[100]"
        style={{ borderRadius: '50%', background: 'radial-gradient(circle, rgba(118,75,162,0.08) 0%, transparent 70%)', willChange: 'transform' }} />
      <div id="scroll-progress" className="fixed top-0 left-0 h-[2px] z-[200] w-0"
        style={{ background: 'linear-gradient(90deg, #667eea, #764ba2, #a78bfa)', transition: 'width 0.1s ease' }} />
      <div className="fixed inset-0 pointer-events-none z-[1] grain-overlay" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.5"><animate attributeName="stopOpacity" values="0.3;0.6;0.3" dur="3.1s" repeatCount="indefinite"/></stop>
              <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.3"><animate attributeName="stopOpacity" values="0.2;0.5;0.2" dur="3.9s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fae8ff" stopOpacity="0.4"><animate attributeName="stopOpacity" values="0.2;0.5;0.2" dur="3.6s" repeatCount="indefinite"/></stop>
              <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.3"><animate attributeName="stopOpacity" values="0.15;0.4;0.15" dur="4.3s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <filter id="gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -12" result="goo"/><feComposite in="SourceGraphic" in2="goo" operator="atop"/></filter>
          </defs>
          <g filter="url(#gooey)">
            <ellipse cx="200" cy="150" fill="url(#lg1)"><animate attributeName="rx" values="180;240;180" dur="6.2s" repeatCount="indefinite"/><animate attributeName="ry" values="240;180;240" dur="6.2s" repeatCount="indefinite"/><animate attributeName="cx" values="200;300;200" dur="7.5s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="1100" cy="200" fill="url(#lg2)"><animate attributeName="rx" values="220;280;220" dur="6.9s" repeatCount="indefinite"/><animate attributeName="ry" values="280;220;280" dur="6.9s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="700" cy="400" fill="url(#lg1)"><animate attributeName="rx" values="250;200;250" dur="7.5s" repeatCount="indefinite"/><animate attributeName="ry" values="200;250;200" dur="7.5s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="300" cy="700" fill="url(#lg2)"><animate attributeName="rx" values="200;260;200" dur="7.2s" repeatCount="indefinite"/><animate attributeName="ry" values="260;200;260" dur="7.2s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="1050" cy="750" fill="url(#lg1)"><animate attributeName="rx" values="240;190;240" dur="6.5s" repeatCount="indefinite"/><animate attributeName="ry" values="190;240;190" dur="6.5s" repeatCount="indefinite"/></ellipse>
          </g>
        </svg>
      </div>

      <div className="fixed top-0 left-0 right-0 z-[60]"><Ticker /></div>
      <LandingNav />

      <section className="relative pt-56 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="hero-elem" style={{'--d':'0ms'} as React.CSSProperties}>
                <span className="inline-flex px-4 py-2 rounded-full glass-badge text-sm font-medium tracking-wide mb-6"
                  style={{background:'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
                  Dashboard Prédictif Multi-Assets
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                {'Anticipe les mouvements'.split(' ').map((w,i)=>(
                  <span key={i} className="word-reveal inline-block mr-[0.22em]" style={{'--d':`${i*110}ms`} as React.CSSProperties}>{w}</span>
                ))}
                <span className="block mt-2">
                  {'1 à 6 mois'.split(' ').map((w,i)=>(
                    <span key={i} className="word-reveal inline-block mr-[0.22em]" style={{'--d':`${(i+3)*110}ms`} as React.CSSProperties}>
                      <span style={{background:'linear-gradient(135deg,#667eea 0%,#764ba2 40%,#a78bfa 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'inline'}}>{w}</span>
                    </span>
                  ))}
                </span>
                <span className="block">
                  {"à l'avance".split(' ').map((w,i)=>(
                    <span key={i} className="word-reveal inline-block mr-[0.22em]" style={{'--d':`${(i+6)*110}ms`} as React.CSSProperties}>{w}</span>
                  ))}
                </span>
              </h1>
              <p className="hero-elem text-xl text-gray-600 leading-relaxed mb-10 max-w-xl" style={{'--d':'850ms'} as React.CSSProperties}>
                Identifie les opportunités avec analyse multi-factorielle automatisée.
              </p>
              <div className="hero-elem flex flex-col sm:flex-row gap-4" style={{'--d':'1000ms'} as React.CSSProperties}>
                <MagneticLink href="/dashboard"
                  className="liquid-button-primary group px-10 py-4 text-white rounded-full font-semibold text-lg inline-flex items-center justify-center gap-3 relative overflow-hidden"
                  style={{ background: '#111827' }}>
                  <span className="relative z-10">Voir le Dashboard</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"/>
                  <div className="liquid-shine"/>
                </MagneticLink>
                <Link href="#comment-ca-marche" className="liquid-button-secondary px-10 py-4 glass-card text-gray-900 rounded-full font-semibold text-lg inline-flex items-center justify-center">
                  Comment ça marche ?
                </Link>
              </div>
              <div ref={statsRef} className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-200">
                {[
                  { target:65, label:'Assets',    raw:null,  delay:0   },
                  { target:13, label:'Piliers',   raw:null,  delay:120 },
                  { target:0,  label:'Temps réel',raw:'24/7',delay:240 },
                ].map((s,i)=>(
                  <div key={i} className={`stat-reveal ${statsInView?'in-view':''}`} style={{transitionDelay:`${s.delay}ms`}}>
                    <p className="text-4xl font-bold gradient-text mb-1 tabular-nums">
                      {s.raw ?? <StatNum target={s.target} inView={statsInView}/>}
                    </p>
                    <p className="text-sm text-gray-600">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div ref={heroScoreRef} className="hero-elem" style={{'--d':'300ms'} as React.CSSProperties}>
              <TiltCard className="p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Exemple : Bitcoin</p>
                    <p className="text-3xl font-bold">Score : <HeroScore inView={heroScoreInView}/></p>
                  </div>
                  <div className="floating">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-badge badge-breathe">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"/>
                      <span className="text-sm font-medium text-gray-700">Validé</span>
                    </div>
                  </div>
                </div>
                <div className="h-72">
                  <svg viewBox="0 0 700 250" className="w-full h-full">
                    <defs>
                      <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#667eea" stopOpacity="0.3"/><stop offset="50%" stopColor="#764ba2" stopOpacity="1"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3"/>
                      </linearGradient>
                      <linearGradient id="cf" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#764ba2" stopOpacity="0.15"/><stop offset="100%" stopColor="#764ba2" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="200" x2="700" y2="200" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4"/>
                    <line x1="0" y1="125" x2="700" y2="125" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4"/>
                    <line x1="0" y1="50"  x2="700" y2="50"  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4"/>
                    <path d="M 30,200 Q 180,185 260,75 T 520,60 L 670,30 L 670,225 L 30,225 Z" fill="url(#cf)" className="chart-fill"/>
                    <path d="M 30,200 Q 180,185 260,75 T 520,60 L 670,30" fill="none" stroke="url(#cg)" strokeWidth="3" strokeLinecap="round" className="draw-line"/>
                    <g style={{opacity:heroScoreInView?1:0,transition:'opacity 0.4s 1.2s'}}>
                      <circle cx="260" cy="75" r="8" fill="#764ba2"/><circle cx="260" cy="75" r="4" fill="white"/>
                      <text x="260" y="105" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">BUY</text>
                    </g>
                    <g style={{opacity:heroScoreInView?1:0,transition:'opacity 0.4s 1.5s'}}>
                      <circle cx="520" cy="60" r="8" fill="#764ba2"/><circle cx="520" cy="60" r="4" fill="white"/>
                      <text x="520" y="45" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">SELL</text>
                    </g>
                    <text x="350" y="70" fontSize="22" fontWeight="700" fill="#7c3aed" style={{opacity:heroScoreInView?1:0,transition:'opacity 0.5s 1.8s'}}>+42%</text>
                  </svg>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <span>Jan 2024</span><span className="font-semibold gradient-text">+42% gain</span><span>Juin 2024</span>
                </div>
              </TiltCard>
              <div className="mt-6 p-6 rounded-2xl" style={CARD_BASE}>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-purple-500"/>
                  <p className="text-sm font-bold text-gray-700">Derniers signaux validés</p>
                </div>
                <div className="space-y-3">
                  {[{name:'Or (Oct 2023)',result:'+15%'},{name:'Tech (Évité crash)',result:'−22%'},{name:'Crypto (Déc 2023)',result:'+28%'}].map((item,i)=>(
                    <div key={i} className="flex items-center justify-between signal-row"
                      style={{opacity:heroScoreInView?1:0,transform:heroScoreInView?'none':'translateX(12px)',transition:`all 0.4s ${0.3+i*0.12}s`}}>
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-bold gradient-text">{item.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider/>

      <section ref={problemRef} className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 section-reveal ${problemInView?'in-view':''}`}>
            <h2 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Le problème classique</h2>
            <p className="text-xl text-gray-600">Acheter au sommet, vendre au creux</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <TiltCard subtle className={`p-10 rounded-3xl section-reveal ${problemInView?'in-view':''}`} style={{transitionDelay:'0ms'}}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><XCircle className="w-6 h-6 text-gray-500"/></div>
                <h3 className="text-3xl font-bold">Trading Émotionnel</h3>
              </div>
              <div className="h-48 mb-8">
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  <path d="M 20,100 L 100,50 L 200,40 L 300,120 L 380,130" fill="none" stroke="#9ca3af" strokeWidth="3" className="draw-line"/>
                  <circle cx="200" cy="40" r="8" fill="#9ca3af"/><text x="200" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6b7280">BUY</text>
                  <circle cx="300" cy="120" r="8" fill="#9ca3af"/><text x="300" y="145" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6b7280">SELL</text>
                  <text x="255" y="70" fontSize="15" fontWeight="700" fill="#6b7280">−35%</text>
                </svg>
              </div>
              <ul className="space-y-4">
                {['Acheter sur le FOMO','Vendre paniqué','Pas de méthode'].map((t,i)=>(
                  <li key={i} className="flex items-start gap-3 text-gray-600"><TrendingDown className="w-5 h-5 mt-1 flex-shrink-0 text-gray-400"/><span>{t}</span></li>
                ))}
              </ul>
            </TiltCard>
            <TiltCard className={`p-10 rounded-3xl section-reveal ${problemInView?'in-view':''}`} style={{transitionDelay:'140ms'}}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-purple-500"/></div>
                <h3 className="text-3xl font-bold">Avec DashFlux</h3>
              </div>
              <div className="h-48 mb-8">
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#667eea" stopOpacity="0.5"/><stop offset="50%" stopColor="#764ba2" stopOpacity="1"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5"/></linearGradient></defs>
                  <path d="M 20,100 L 100,50 L 200,40 L 300,120 L 380,130" fill="none" stroke="url(#sg)" strokeWidth="3" className="draw-line"/>
                  <circle cx="100" cy="50" r="8" fill="#764ba2"/><text x="100" y="70" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c3aed">BUY</text>
                  <circle cx="200" cy="40" r="8" fill="#764ba2"/><text x="200" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c3aed">SELL</text>
                  <text x="125" y="30" fontSize="15" fontWeight="700" fill="#7c3aed">+38%</text>
                </svg>
              </div>
              <ul className="space-y-4">
                {['Signaux objectifs','Vendre au bon moment','Scoring 13 facteurs'].map((t,i)=>(
                  <li key={i} className="flex items-start gap-3 text-gray-700"><TrendingUp className="w-5 h-5 mt-1 flex-shrink-0 text-purple-500"/><span>{t}</span></li>
                ))}
              </ul>
            </TiltCard>
          </div>
        </div>
      </section>

      <Divider/>

      <section ref={trackRef} className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 section-reveal ${trackInView?'in-view':''}`}>
            <div className="inline-flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-purple-500"/>
              <span className="text-sm font-semibold gradient-text uppercase tracking-wide">Validation</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Track Record</h2>
            <p className="text-xl text-gray-600">Exemples récents de positions identifiées</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRACK_ITEMS.map((item,i)=>(
              <div key={i} className={`section-reveal ${trackInView?'in-view':''}`} style={{transitionDelay:`${i*90}ms`}}>
                <TrackCard item={item} inView={trackInView}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider/>

      <section id="comment-ca-marche" ref={howRef} className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 section-reveal ${howInView?'in-view':''}`}>
            <h2 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Comment ça marche</h2>
            <p className="text-xl text-gray-600">Analyse automatisée en 3 étapes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {num:'01',title:'Collecte',desc:'Récupération automatique des données de prix, volumes, indicateurs macro pour 65 actifs'},
              {num:'02',title:'Analyse',desc:'Analyse multi-factorielle combinant momentum, macro, positionnement et 10 autres piliers'},
              {num:'03',title:'Signaux',desc:'Scores de 0 à 100. >75 = Acheter fort. <40 = Éviter. Simple et actionnable'},
            ].map((step,i)=>(
              <TiltCard key={i} className={`text-center p-8 rounded-3xl section-reveal ${howInView?'in-view':''}`} style={{transitionDelay:`${i*110}ms`}}>
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center step-num-glow" style={CARD_BASE}>
                    <span className="text-4xl font-black gradient-text">{step.num}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <Divider/>

      <section ref={pilliersRef} className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 section-reveal ${pilliersInView?'in-view':''}`}>
            <h2 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Les 13 Piliers Prédictifs</h2>
            <p className="text-xl text-gray-600">Une analyse complète pour identifier les opportunités</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {name:'Momentum Technique',desc:'Tendances et force'},{name:'Régime Macro',desc:'Croissance, inflation'},
              {name:'Positionnement',desc:'Flux institutionnels'},{name:'Sentiment',desc:'Fear & Greed, VIX'},
              {name:'Saisonnalité',desc:'Patterns temporels'},{name:'Corrélations',desc:'Relations inter-actifs'},
              {name:'Valorisation',desc:'Prix vs fondamentaux'},{name:'Liquidité Globale',desc:'M2, bilan Fed/BCE'},
              {name:'Catalyseurs',desc:'Events macro à venir'},{name:'Volatilité',desc:'Risque et opportunité'},
              {name:'Volume',desc:'Confirmation mouvements'},{name:'Divergences',desc:'Signaux contrarian'},
              {name:'Cycles',desc:'Position dans le cycle'},
            ].map((p,i)=>(
              <div key={i} className={`p-6 rounded-2xl pilier-card section-reveal ${pilliersInView?'in-view':''}`} style={{...CARD_BASE, transitionDelay:`${i*45}ms`}}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0 pilier-num">
                    <span className="text-sm font-bold gradient-text">{String(i+1).padStart(2,'0')}</span>
                  </div>
                  <div><h3 className="font-bold text-gray-900">{p.name}</h3><p className="text-sm text-gray-500">{p.desc}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/methodologie" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold nav-link transition-colors">
              En savoir plus sur la méthodologie <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <TiltCard className={`p-16 rounded-3xl section-reveal ${ctaInView?'in-view':''}`}>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Prêt à anticiper ?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">Accède au dashboard complet et commence à analyser 65 actifs en temps réel</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <MagneticLink href="/dashboard"
                className="liquid-button-primary group px-12 py-5 text-white rounded-full font-bold text-lg inline-flex items-center justify-center gap-3 relative overflow-hidden"
                style={{ background: '#111827' }}>
                <span className="relative z-10">Accéder au Dashboard</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"/>
                <div className="liquid-shine"/>
              </MagneticLink>
              <Link href="/methodologie" className="liquid-button-secondary px-12 py-5 glass-card text-gray-900 rounded-full font-bold text-lg inline-flex items-center justify-center">
                Lire la Méthodologie
              </Link>
            </div>
            <p className="mt-12 text-sm text-gray-500">Outil éducatif uniquement • Pas de conseil en investissement</p>
          </TiltCard>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">© 2025 DashFlux. Tous droits réservés.</p>
          <div className="flex items-center gap-8">
            <Link href="/mentions-legales" className="text-sm text-gray-500 hover:text-gray-900 nav-link transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="text-sm text-gray-500 hover:text-gray-900 nav-link transition-colors">Confidentialité</Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 nav-link transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .ticker-track { animation: ticker 32s linear infinite; width: max-content; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes wordUp { from{opacity:0;transform:translateY(28px);filter:blur(4px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
        .word-reveal { opacity:0; animation:wordUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards; animation-delay:var(--d); }
        .hero-elem   { opacity:0; animation:wordUp 0.6s  cubic-bezier(0.16,1,0.3,1) forwards; animation-delay:var(--d); }
        .section-reveal { opacity:0; transform:translateY(36px); transition:opacity 0.65s cubic-bezier(0.16,1,0.3,1),transform 0.65s cubic-bezier(0.16,1,0.3,1); }
        .section-reveal.in-view { opacity:1; transform:translateY(0); }
        .stat-reveal { opacity:0; transform:translateY(20px); transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1),transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .stat-reveal.in-view { opacity:1; transform:translateY(0); }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        .gradient-text { background:linear-gradient(135deg,#667eea 0%,#764ba2 40%,#a78bfa 60%,#667eea 100%); background-size:200% auto; animation:shimmer 6s linear infinite; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:linear-gradient(90deg,#667eea,#764ba2); transition:width 0.35s cubic-bezier(0.16,1,0.3,1); }
        .nav-link:hover::after { width:100%; }
        .grain-overlay { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E"); opacity:0.018; mix-blend-mode:multiply; }
        @keyframes breathe { 0%,100%{box-shadow:0 0 0 0 rgba(118,75,162,0)} 50%{box-shadow:0 0 16px 2px rgba(118,75,162,0.12)} }
        .badge-breathe { animation:breathe 3s ease-in-out infinite; }
        @keyframes countPulse { 0%{transform:scale(1)} 40%{transform:scale(1.10)} 100%{transform:scale(1)} }
        .count-pulse { animation:countPulse 0.45s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes barGlow { 0%{box-shadow:none} 50%{box-shadow:0 0 10px rgba(118,75,162,0.5)} 100%{box-shadow:0 0 4px rgba(118,75,162,0.2)} }
        .bar-glow { animation:barGlow 0.8s ease forwards; }
        .step-num-glow:hover { box-shadow:0 0 20px rgba(118,75,162,0.15); }
        .pilier-card { transition:all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .pilier-card:hover { border-color:rgba(118,75,162,0.2); transform:translateX(4px); }
        .pilier-num { transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .pilier-card:hover .pilier-num { transform:scale(1.15) rotate(5deg); }
        .signal-row { transition:transform 0.25s ease; }
        .signal-row:hover { transform:translateX(4px); }
        .glass-card { background:rgba(255,255,255,0.82); backdrop-filter:blur(20px) saturate(180%); border:none; outline:1.5px solid #b8bac8; box-shadow:0 4px 20px rgba(0,0,0,0.07); transition:outline-color 0.3s ease,box-shadow 0.3s ease; }
        .glass-card:hover { outline-color:#8b7fb8; box-shadow:0 12px 36px rgba(102,126,234,0.15); }
        .glass-badge { background:rgba(255,255,255,0.80); backdrop-filter:blur(10px); outline:1px solid #b8bac8; }
        .liquid-button-primary,.liquid-button-secondary { transition:all 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .liquid-button-primary:hover { box-shadow:0 20px 40px rgba(0,0,0,0.15); }
        .liquid-button-secondary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 32px rgba(0,0,0,0.08); }
        .liquid-shine { position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent); transition:left 0.8s cubic-bezier(0.34,1.56,0.64,1); }
        .liquid-button-primary:hover .liquid-shine { left:100%; }
        .draw-line { stroke-dasharray:2000; stroke-dashoffset:2000; animation:drawLine 2.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards; }
        .chart-fill { opacity:0; animation:fadeIn 0.8s ease 2.2s forwards; }
        @keyframes drawLine { to{stroke-dashoffset:0} }
        @keyframes fadeIn   { to{opacity:1} }
        .floating { animation:float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}