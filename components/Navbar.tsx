'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, Moon, Sun, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard',    label: 'Dashboard' },
  { href: '/portfolio',    label: 'Portfolio', soon: true },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/calendrier',   label: 'Calendrier' },
];

// Bot links kept for future use
// const BOT_LINKS = [
//   { href: '/bot1', label: 'Bot Executor',    sub: 'Trade selon scores DashFlux' },
//   { href: '/bot2', label: 'Bot RL-Adaptive', sub: 'Q-Learning autonome' },
// ];

function MagneticNavItem({ href, label, isActive, onClick, soon }: {
  href: string; label: string; isActive: boolean; onClick?: () => void; soon?: boolean;
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
        color: isActive ? '#7c3aed' : hovered ? '#4f46e5' : 'var(--text-muted)',
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

function RefreshButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-2 px-6 py-2 text-white rounded-full font-semibold text-sm overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
        boxShadow: hovered ? '0 8px 24px rgba(124,58,237,0.35)' : '0 2px 12px rgba(124,58,237,0.2)',
        transform: hovered ? 'translateY(-1px) scale(1.02)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      <span className="absolute inset-0" style={{
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
        transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.7s ease',
      }} />
      <RefreshCw className="w-3.5 h-3.5 relative z-10" style={{ transition: 'transform 0.5s ease', transform: hovered ? 'rotate(180deg)' : 'none' }} />
      <span className="relative z-10">Actualiser</span>
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <style>{`
        @keyframes navShimmer {
          0%   { background-position: 0%   center }
          100% { background-position: 200% center }
        }
      `}</style>

      {/* ── MOBILE ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="flex items-center justify-between p-3">
          <Link href="/dashboard" className="flex flex-col">
            <span style={{
              fontFamily: 'Impact,"Arial Black",sans-serif',
              fontStyle: 'italic',
              fontSize: '1.6rem',
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
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              {mounted && darkMode ? <Sun className="w-4 h-4 text-gray-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="py-3 px-4 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
            {NAV_LINKS.map(({ href, label, soon }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={isActive(href) ? { background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontWeight: 600 } : { color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  {soon && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, letterSpacing: '0.06em',
                      padding: '1px 5px', borderRadius: 20,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.12))',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#7c3aed', textTransform: 'uppercase',
                    }}>Soon</span>
                  )}
                </span>
              </Link>
            ))}
            {/* Bots section hidden */}
            <Link href="/parametres" onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium"
              style={isActive('/parametres') ? { background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontWeight: 600 } : { color: 'var(--text-muted)' }}>
              Paramètres
            </Link>
            <button onClick={() => { window.location.reload(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-full text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <RefreshCw className="w-3.5 h-3.5" />Actualiser
            </button>
          </div>
        )}
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-[70px]" />

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block sticky top-0 z-50" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-1">

              {/* Logo */}
              <div>
                <span style={{
                  fontFamily: 'Impact,"Arial Black",sans-serif',
                  fontStyle: 'italic',
                  fontSize: '2.8rem',
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
                {NAV_LINKS.map(({ href, label, soon }) => (
                  <MagneticNavItem key={href} href={href} label={label} isActive={isActive(href)} soon={soon} />
                ))}
                {/* <BotsDropdown isActive={isBotActive} /> — hidden for now */}
                <MagneticNavItem href="/parametres" label="Paramètres" isActive={isActive('/parametres')} />
              </nav>

              <div className="flex items-center gap-3">
                <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Toggle dark mode">
                  {mounted && darkMode ? <Sun className="w-4 h-4 text-gray-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
                </button>
                <RefreshButton onClick={() => window.location.reload()} />
              </div>
            </div>

            {mounted && lastUpdate && (
              <div className="flex justify-end">
                <p className="text-xs text-gray-400">
                  Dernière MAJ: {lastUpdate.toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}