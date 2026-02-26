'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Navbar from '@/components/Navbar';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

const NAV_LINKS = [
  { href: '/dashboard',    label: 'Dashboard' },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/calendrier',   label: 'Calendrier Économique' },
  { href: '/parametres',   label: 'Paramètres' },
];

const STATS = [
  { num: '13',   label: 'Piliers prédictifs' },
  { num: '65',   label: 'Assets analysés' },
  { num: '24/7', label: 'Temps réel' },
  { num: '6M',   label: 'Horizon prédictif' },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block text-sm transition-all duration-200"
      style={{
        color: hovered ? '#a78bfa' : 'var(--text-muted)',
        transform: hovered ? 'translateX(4px)' : 'none',
      }}>
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing';

  return (
    <html lang="fr">
      <body className={inter.className}>
        <SettingsProvider>
          {!isLandingPage && <Navbar />}

          <main>{children}</main>

          {!isLandingPage && (
            <footer className="mt-12 lg:mt-16 relative overflow-hidden"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                borderTop: '1px solid var(--border)',
              }}>

              {/* Subtle gradient blob behind footer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20"
                style={{ zIndex: 0 }}>
                <div style={{
                  position: 'absolute', bottom: -80, left: '10%',
                  width: 400, height: 300, borderRadius: '50%',
                  background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}/>
                <div style={{
                  position: 'absolute', bottom: -60, right: '15%',
                  width: 300, height: 250, borderRadius: '50%',
                  background: 'radial-gradient(circle, #a5b4fc 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}/>
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

                  {/* Brand */}
                  <div>
                    <span style={{
                      fontFamily: 'Impact,"Arial Black",sans-serif',
                      fontStyle: 'italic',
                      fontSize: '2rem',
                      lineHeight: 1,
                      padding: '0 0.25em',
                      background: 'linear-gradient(135deg,#667eea 0%,#764ba2 40%,#a78bfa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      display: 'inline-block',
                      transform: 'skewX(-8deg)',
                      marginBottom: 10,
                    }}>DashFlux</span>
                    <p className="text-sm text-gray-500 leading-relaxed mt-2 max-w-xs">
                      Dashboard intelligent multi-assets avec scoring émergent pour anticiper les mouvements de marché 1 à 6 mois à l'avance.
                    </p>
                  </div>

                  {/* Navigation */}
                  <div>
                    <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Navigation</h4>
                    <nav className="space-y-2.5">
                      {NAV_LINKS.map(({ href, label }) => (
                        <FooterLink key={href} href={href} label={label} />
                      ))}
                    </nav>
                  </div>

                  {/* Stats */}
                  <div>
                    <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Informations</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {STATS.map(({ num, label }) => (
                        <div key={label} className="rounded-xl p-3"
                          style={{
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border)',
                          }}>
                          <p className="text-lg font-bold" style={{
                            background: 'linear-gradient(135deg,#667eea,#a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}>{num}</p>
                          <p className="text-xs text-gray-500 leading-tight">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative h-px mb-6">
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.4),transparent)',
                  }}/>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
                  <p>© {new Date().getFullYear()} DashFlux. Tous droits réservés.</p>
                  <p className="text-center sm:text-right">
                    Outil éducatif uniquement · Pas de conseil en investissement
                  </p>
                </div>
              </div>
            </footer>
          )}
        </SettingsProvider>
      </body>
    </html>
  );
}