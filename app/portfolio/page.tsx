'use client';

import { useEffect, useState } from 'react';
import { PieChart, TrendingUp, BarChart3, Bell, ArrowRight } from 'lucide-react';

const CSS = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes shimmer  { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes spin-slow { to { transform: rotate(360deg); } }
`;

const FEATURES = [
  { icon: <PieChart    style={{ width: 20, height: 20 }}/>, label: 'Allocation visuelle',  desc: 'Répartition par actif, secteur et classe' },
  { icon: <TrendingUp  style={{ width: 20, height: 20 }}/>, label: 'P&L en temps réel',   desc: 'Performance journalière, hebdo et totale' },
  { icon: <BarChart3   style={{ width: 20, height: 20 }}/>, label: 'Score de portefeuille', desc: 'Score DashFlux agrégé de vos positions' },
  { icon: <Bell        style={{ width: 20, height: 20 }}/>, label: 'Alertes de rééquilibrage', desc: 'Notifications quand un seuil est atteint' },
];

function FeatureCard({ icon, label, desc, delay }: { icon: React.ReactNode; label: string; desc: string; delay: number }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 18px', borderRadius: 16,
      background: 'var(--glass-bg)',
      border: '1px solid var(--border)',
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(12px)',
      transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.2)',
        color: '#7c3aed',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 60); }, []);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

        {/* Ambient blobs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '20%', left: '15%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', bottom: '20%', right: '10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)', animation: 'float 10s ease-in-out infinite 2s',
          }}/>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, width: '100%', textAlign: 'center' }}>

          {/* Animated icon */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: 24, marginBottom: 28,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))',
            border: '1.5px solid rgba(124,58,237,0.25)',
            animation: 'fadeUp 0.6s ease both',
            position: 'relative',
          }}>
            {/* Spinning ring */}
            <div style={{
              position: 'absolute', inset: -6, borderRadius: 30,
              border: '1.5px dashed rgba(124,58,237,0.2)',
              animation: 'spin-slow 12s linear infinite',
            }}/>
            <PieChart style={{ width: 34, height: 34, color: '#7c3aed' }}/>
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 20, marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))',
            border: '1px solid rgba(124,58,237,0.25)',
            animation: 'fadeUp 0.6s ease 0.1s both',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#7c3aed',
              animation: 'pulse 2s ease-in-out infinite',
            }}/>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Bientôt disponible
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.03em', lineHeight: 1.1,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, var(--text-primary) 30%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}>
            Portfolio Tracker
          </h1>

          <p style={{
            fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
            margin: '0 0 36px',
            animation: 'fadeUp 0.6s ease 0.3s both',
          }}>
            Suivez vos investissements en temps réel, visualisez votre allocation et recevez des alertes basées sur les scores DashFlux.
          </p>

          {/* Feature cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            marginBottom: 36, textAlign: 'left',
            animation: 'fadeUp 0.6s ease 0.35s both',
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.label} {...f} delay={400 + i * 70}/>
            ))}
          </div>

          {/* CTA */}
          <div style={{ animation: 'fadeUp 0.6s ease 0.7s both' }}>
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 14, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                color: '#fff', border: 'none', cursor: 'not-allowed',
                opacity: 0.6,
                boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
              }}
            >
              <Bell style={{ width: 14, height: 14 }}/>
              Me notifier au lancement
              <ArrowRight style={{ width: 13, height: 13 }}/>
            </button>
            <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-faint)' }}>
              Phase 4 du roadmap DashFlux · ETA Q3 2026
            </p>
          </div>

        </div>
      </div>
    </>
  );
}