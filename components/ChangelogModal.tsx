'use client';

import { X, Calendar, CheckCircle, Bug, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: Zap,
    title: 'Nouvelles Fonctionnalités',
    color: '#16a34a',
    bg: 'rgba(34,197,94,0.06)',
    border: 'rgba(34,197,94,0.18)',
    items: [
      { title: 'Score Émergent 13 Piliers', body: 'Système prédictif avec 13 piliers d\'analyse : Contrarian, Catalysts, Technical Early, Rotation, Seasonality, Positioning, Relative Strength, Drawdown, Valuation, Macro Regional, Flux Institutionnels, Analyse Vélocité, Timing Entrée.' },
      { title: 'Page Asset Détaillée', body: 'Nouvelle page individuelle par asset avec affichage des 13 piliers, analyse technique complète, et conditions de marché détaillées.' },
      { title: 'Relative Strength vs SPY', body: 'Calcul automatique de la force relative de chaque asset vs S&P 500 avec cache optimisé.' },
      { title: 'Analyse Drawdown', body: 'Distance depuis l\'ATH pour identifier les zones de valorisation attractives (>20% historiquement favorable).' },
      { title: 'Liste d\'Assets Élargie (65)', body: 'Indices, stocks individuels (7 Magnifiques, AI semis), secteurs, métaux précieux, agriculture, cryptos, obligations, devises, international.' },
    ],
  },
  {
    icon: TrendingUp,
    title: 'Améliorations',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.18)',
    items: [
      { title: 'Cache Optimisé (1h → 5 min)', body: 'Données plus fraîches. Cache intelligent du SPY benchmark.' },
      { title: 'Libellé "Dernière Clôture"', body: 'Reflète honnêtement la nature des données Yahoo Finance — prix de clôture, non temps réel.' },
      { title: 'Navigation Améliorée', body: 'Bouton "Retour au Dashboard" redirige correctement depuis les pages assets.' },
    ],
  },
  {
    icon: Bug,
    title: 'Corrections de Bugs',
    color: '#dc2626',
    bg: 'rgba(239,68,68,0.05)',
    border: 'rgba(239,68,68,0.15)',
    items: [
      { title: 'Score Technique affichait 0.0', body: 'Le technicalScore n\'était pas retourné dans l\'objet AssetScore. Corrigé.' },
      { title: 'Piliers à 50 (valeurs par défaut)', body: 'Implémentation des fonctions de calcul pour tous les piliers avec algorithmes appropriés.' },
      { title: 'Next.js 15 — Params asynchrones', body: 'Correction de l\'erreur "params is a Promise" dans les routes dynamiques.' },
    ],
  },
];

// ── Close button ──────────────────────────────────────────────────────────────
function CloseBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hov ? 'scale(1.1) rotate(90deg)' : 'scale(1)',
        flexShrink: 0,
      }}>
      <X style={{ width: 16, height: 16, color: '#fff' }}/>
    </button>
  );
}

// ── Changelog item ────────────────────────────────────────────────────────────
function Item({ title, body, color, bg, border, delay }: {
  title: string; body: string; color: string; bg: string; border: string; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12,
      background: bg, border: `1px solid ${border}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-10px)',
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      <CheckCircle style={{ width: 15, height: 15, color, flexShrink: 0, marginTop: 1 }}/>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{body}</p>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ChangelogModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setMounted(true), 20);
    } else {
      document.body.style.overflow = 'unset';
      setMounted(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Global item delay counter
  let itemIndex = 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      background: `rgba(0,0,0,${mounted ? 0.45 : 0})`,
      backdropFilter: mounted ? 'blur(8px)' : 'blur(0px)',
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1.5px solid var(--border-card)',
        borderRadius: 24,
        boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        maxWidth: 720, width: '100%',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a78bfa 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(8px)',
              borderRadius: 10, padding: '6px 14px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                v2.0.0
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                Nouveautés DashFlux
              </h2>
              <p style={{ fontSize: 12, color: 'var(--glass-hover)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar style={{ width: 12, height: 12 }}/>
                23 janvier 2026
              </p>
            </div>
          </div>
          <CloseBtn onClick={onClose}/>
        </div>

        {/* ── Content ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Intro */}
          <div style={{
            padding: '16px 18px', borderRadius: 14,
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.18)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(8px)',
            transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Refonte Majeure — Score Émergent 13 Piliers
            </h3>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
              DashFlux passe à la version 2.0 avec un système de scoring repensé.
              Le nouveau <strong style={{ color: '#7c3aed' }}>Score Émergent</strong> analyse 13 piliers
              pour anticiper les mouvements <strong>3 à 6 mois à l'avance</strong> selon la méthode.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map(section => (
            <div key={section.title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <section.icon style={{ width: 15, height: 15, color: section.color }}/>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {section.title}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.items.map(item => {
                  const delay = 150 + (itemIndex++) * 60;
                  return (
                    <Item key={item.title}
                      title={item.title} body={item.body}
                      color={section.color} bg={section.bg} border={section.border}
                      delay={delay}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Info note */}
          <div style={{
            padding: '12px 14px', borderRadius: 12,
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#d97706' }}>Info :</strong> 13 piliers opérationnels avec calculs en temps réel.
              Positioning (COT limité), Valuation optimisée pour actions.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-subtle)',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
            Consultez la page Méthodologie pour le détail du scoring
          </p>
          <button onClick={onClose}
            style={{
              padding: '9px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', fontSize: 13, fontWeight: 700,
              transition: 'background 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-dark, #111827)'; e.currentTarget.style.transform = ''; }}
          >
            Compris !
          </button>
        </div>
      </div>
    </div>
  );
}