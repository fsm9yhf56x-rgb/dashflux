'use client';

import {
  Settings, Bell, Palette, Database, Shield, Save, RefreshCw,
  ArrowLeft, CheckCircle, Clock, Sun, Moon, Monitor, Zap, ToggleLeft, Sliders,
  ChevronRight, Info, Volume2, VolumeX,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:none} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes savedPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0.15)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes thumbSlide { from{left:2px} to{left:22px} }

  .toggle-track { transition: background 0.25s ease; }
  .toggle-thumb { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
    background: #7c3aed; cursor: pointer; border: 2px solid white;
    box-shadow: 0 2px 6px rgba(124,58,237,0.35);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
  input[type=range]::-webkit-slider-runnable-track {
    height: 5px; border-radius: 4px;
    background: linear-gradient(to right, #7c3aed var(--pct,0%), var(--border) var(--pct,0%));
  }
  input[type=range]::-moz-range-thumb {
    width: 18px; height: 18px; border-radius: 50%;
    background: #7c3aed; cursor: pointer; border: 2px solid white;
    box-shadow: 0 2px 6px rgba(124,58,237,0.35);
  }
  input[type=range]::-moz-range-track { height: 5px; border-radius: 4px; background: var(--border); }
  input[type=range]::-moz-range-progress { height: 5px; border-radius: 4px; background: #7c3aed; }

  select:focus { outline: none; }
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
const V = '#7c3aed';
const I = '#6366f1';

// ── Spotlight wrapper ─────────────────────────────────────────────────────────
function Spot({ children, style, color = 'rgba(124,58,237,0.06)' }: {
  children: React.ReactNode; style?: React.CSSProperties; color?: string;
}) {
  const ref   = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  * 100;
      const y = (e.clientY - r.top)  / r.height * 100;
      el.style.backgroundImage = `radial-gradient(ellipse 55% 60% at ${x}% ${y}%, ${color}, transparent 70%)`;
    });
  }, [color]);
  const onLeave = useCallback(() => { const el = ref.current; if (el) el.style.backgroundImage = ''; }, []);
  return <div ref={ref} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>;
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({
  checked, onChange, color = V,
}: { checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: checked ? color : 'var(--border)',
        border: `1.5px solid ${checked ? color + 'aa' : 'var(--border)'}`,
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.25s ease, border-color 0.25s',
        boxShadow: checked ? `0 0 0 3px ${color}20` : 'none',
      }}
    >
      <div style={{
        width: 17, height: 17, borderRadius: '50%',
        background: 'white', position: 'absolute', top: 2,
        left: checked ? 22 : 3,
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}/>
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Card({ icon, title, iconColor, children, index }: {
  icon: React.ReactNode; title: string; iconColor: string;
  children: React.ReactNode; index: number;
}) {
  return (
    <Spot style={{
      ...GLASS, marginBottom: 20, overflow: 'hidden',
      animation: `scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both`,
    }}>
      {/* Card header */}
      <div style={{
        padding: '18px 22px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: `${iconColor}0f`, border: `1.5px solid ${iconColor}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor,
        }}>{icon}</div>
        <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h2>
      </div>

      <div style={{ padding: '16px 22px 20px' }}>
        {children}
      </div>
    </Spot>
  );
}

// ── Setting row (toggle) ──────────────────────────────────────────────────────
function ToggleRow({ label, desc, checked, onChange, color = V }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; color?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 14, gap: 16,
        background: hov ? `${color}06` : 'var(--bg-subtle)',
        border: `1px solid ${hov ? color + '20' : 'var(--border)'}`,
        transition: 'background 0.2s, border-color 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => onChange(!checked)}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: 0, lineHeight: 1.55 }}>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} color={color} />
    </div>
  );
}

// ── Range slider ──────────────────────────────────────────────────────────────
function RangeRow({ label, desc, value, min, max, color, badge, onChange }: {
  label: string; desc: string; value: number; min: number; max: number;
  color: string; badge: string; onChange: (v: number) => void;
}) {
  const [hov, setHov] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '16px', borderRadius: 14,
        background: hov ? `${color}07` : 'var(--bg-subtle)',
        border: `1.5px solid ${hov ? color + '28' : 'var(--border)'}`,
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.25s',
        boxShadow: hov ? `0 6px 20px ${color}12` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>{label}</p>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: 0 }}>{desc}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 24, fontWeight: 900, color,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em',
            lineHeight: 1,
            transform: hov ? 'scale(1.06)' : 'none',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            display: 'inline-block',
          }}>
            ≥{value}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{badge}</p>
        </div>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ width: '100%', '--pct': `${pct}%` } as any}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ── Theme button ──────────────────────────────────────────────────────────────
function ThemeBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: '12px 8px', borderRadius: 12,
        background: active ? `${V}0f` : (hov ? 'var(--bg-subtle)' : 'var(--bg-subtle)'),
        border: `1.5px solid ${active ? V + '40' : (hov ? V + '20' : 'var(--border)')}`,
        color: active ? V : 'var(--text-muted)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        cursor: 'pointer',
        transform: active ? 'translateY(-1px)' : (hov ? 'translateY(-1px)' : 'none'),
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: active ? `0 4px 14px ${V}18` : 'none',
      }}
    >
      <div style={{ transform: hov ? 'scale(1.15) rotate(-8deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: active ? 800 : 600, letterSpacing: '0.02em' }}>{label}</span>
      {active && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%', background: V,
          animation: 'checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}/>
      )}
    </button>
  );
}

// ── GlassSelect ───────────────────────────────────────────────────────────────
function GlassSelect({ value, onChange, children }: {
  value: string | number; onChange: (v: string) => void; children: React.ReactNode;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 12,
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        background: 'var(--glass-bg)',
        border: `1px solid ${foc ? `${V}55` : 'var(--border)'}`,
        boxShadow: foc ? `0 0 0 3px ${V}12` : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        cursor: 'pointer',
      }}
    >
      {children}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router   = useRouter();
  const { settings, updateSettings, resetSettings, saveSettings } = useSettings();
  const [saved,    setSaved]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    if (!confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) return;
    setResetting(true);
    setTimeout(() => {
      resetSettings();
      setSaved(false);
      setResetting(false);
    }, 500);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="gblur"><feGaussianBlur stdDeviation="65"/></filter>
          </defs>
          <g filter="url(#gblur)">
            <ellipse cx="150" cy="150" rx="220" ry="260" fill="#e0e7ff">
              <animate attributeName="cx" values="150;260;150" dur="12s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="1050" cy="600" rx="260" ry="200" fill="#f3e8ff" fillOpacity="0.5">
              <animate attributeName="ry" values="200;260;200" dur="10s" repeatCount="indefinite"/>
            </ellipse>
          </g>
        </svg>
      </div>

      <main style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative', zIndex: 1, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* ── Back ──────────────────────────────────────────── */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--text-faint)',
              padding: 0, marginBottom: 24,
              transition: 'color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = V; e.currentTarget.style.transform = 'translateX(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.transform = ''; }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }}/> Dashboard
          </button>

          {/* ── Header ────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: `${V}0f`, border: `1.5px solid ${V}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 16px ${V}14`,
              }}>
                <Settings style={{ width: 22, height: 22, color: V }}/>
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
                  Paramètres
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '3px 0 0', fontWeight: 500 }}>
                  Personnalisez DashFlux selon votre profil
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleReset}
                disabled={resetting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(107,114,128,0.4)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
              >
                <RefreshCw style={{ width: 12, height: 12, animation: resetting ? 'spin 0.6s linear infinite' : 'none' }}/>
                Réinitialiser
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 20px', borderRadius: 12, border: 'none',
                  background: saved ? '#22c55e' : V,
                  color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  transition: 'background 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  animation: saved ? 'savedPulse 1s ease' : 'none',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {saved
                  ? <><CheckCircle style={{ width: 12, height: 12, animation: 'checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}/> Sauvegardé !</>
                  : <><Save style={{ width: 12, height: 12, animation: saving ? 'spin 0.6s linear infinite' : 'none' }}/> Sauvegarder</>
                }
              </button>
            </div>
          </div>

          {/* ══ NOTIFICATIONS ══════════════════════════════════ */}
          <Card icon={<Bell style={{ width: 16, height: 16 }}/>} title="Notifications" iconColor="#6366f1" index={0}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ToggleRow
                label="Notifications par email"
                desc="Alertes importantes pour les événements macro et signaux forts"
                checked={settings.emailNotifications}
                onChange={v => updateSettings({ emailNotifications: v })}
                color={I}
              />
              <ToggleRow
                label="Alertes de scores"
                desc={`M'alerter quand un asset atteint le seuil ACCUMULATE (≥${settings.accumulateThreshold})`}
                checked={settings.scoreAlerts}
                onChange={v => updateSettings({ scoreAlerts: v })}
                color={V}
              />
              <ToggleRow
                label="Digest hebdomadaire"
                desc="Résumé des meilleures opportunités chaque lundi matin"
                checked={settings.weeklyDigest}
                onChange={v => updateSettings({ weeklyDigest: v })}
                color={I}
              />

              {/* Notification tone toggle */}
              <ToggleRow
                label="Son de notification"
                desc="Jouer un son lors des alertes de score importantes"
                checked={(settings as any).notifSound ?? true}
                onChange={v => updateSettings({ notifSound: v } as any)}
                color="#0ea5e9"
              />
            </div>
          </Card>

          {/* ══ AFFICHAGE ══════════════════════════════════════ */}
          <Card icon={<Palette style={{ width: 16, height: 16 }}/>} title="Affichage" iconColor="#f59e0b" index={1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Theme picker */}
              <div style={{
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 10px' }}>Thème</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ThemeBtn icon={<Monitor style={{ width: 16, height: 16 }}/>} label="Auto" active={settings.theme === 'auto'}   onClick={() => updateSettings({ theme: 'auto' })}  />
                  <ThemeBtn icon={<Sun     style={{ width: 16, height: 16 }}/>} label="Clair"  active={settings.theme === 'light'} onClick={() => updateSettings({ theme: 'light' })} />
                  <ThemeBtn icon={<Moon    style={{ width: 16, height: 16 }}/>} label="Sombre" active={settings.theme === 'dark'}  onClick={() => updateSettings({ theme: 'dark' })}  />
                </div>
              </div>

              <ToggleRow
                label="Priorité au score émergent"
                desc="Trier par score émergent par défaut (recommandé)"
                checked={settings.showEmergentFirst}
                onChange={v => updateSettings({ showEmergentFirst: v })}
                color="#f59e0b"
              />
            </div>
          </Card>

          {/* ══ DONNÉES ════════════════════════════════════════ */}
          <Card icon={<Database style={{ width: 16, height: 16 }}/>} title="Données" iconColor="#22c55e" index={2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Refresh interval */}
              <div style={{
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 2px' }}>Intervalle de rafraîchissement</p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: 0 }}>
                      Scores recalculés toutes les <strong style={{ color: '#22c55e' }}>{settings.refreshInterval / 60} min</strong>
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                    background: 'rgba(34,197,94,0.09)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.22)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'dotBlink 2s ease-in-out infinite' }}/>
                    Live
                  </div>
                </div>
                <GlassSelect value={settings.refreshInterval} onChange={v => updateSettings({ refreshInterval: parseInt(v) })}>
                  <option value={1800}>30 minutes</option>
                  <option value={3600}>1 heure (recommandé)</option>
                  <option value={7200}>2 heures</option>
                  <option value={14400}>4 heures</option>
                </GlassSelect>
              </div>

              <ToggleRow
                label="Cache activé"
                desc="Améliore les performances en mettant les données en cache"
                checked={settings.cacheEnabled}
                onChange={v => updateSettings({ cacheEnabled: v })}
                color="#22c55e"
              />
            </div>
          </Card>

          {/* ══ SEUILS ═════════════════════════════════════════ */}
          <Card icon={<Sliders style={{ width: 16, height: 16 }}/>} title="Seuils personnalisés" iconColor={V} index={3}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Threshold visual guide */}
              <div style={{
                padding: '10px 14px', borderRadius: 12, marginBottom: 4,
                background: `${V}06`, border: `1px solid ${V}18`,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <Info style={{ width: 13, height: 13, color: V, flexShrink: 0, marginTop: 1 }}/>
                <p style={{ fontSize: 11.5, color: '#4c1d95', margin: 0, lineHeight: 1.65 }}>
                  Les seuils par défaut <strong>(80 / 65 / 45 / 30)</strong> sont optimisés selon la méthodologie Steffan.
                  Ajustez selon votre profil de risque.
                </p>
              </div>

              {/* Visual score spectrum */}
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)',
                marginBottom: 4,
              }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                  Aperçu des zones
                </p>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                  {[
                    { label: 'AVOID',      w: settings.trimThreshold,                                     color: '#ef4444' },
                    { label: 'TRIM',       w: settings.holdThreshold - settings.trimThreshold,             color: '#f97316' },
                    { label: 'HOLD',       w: settings.watchThreshold - settings.holdThreshold,            color: 'var(--text-muted)' },
                    { label: 'WATCH',      w: settings.accumulateThreshold - settings.watchThreshold,      color: I         },
                    { label: 'ACCUMULATE', w: 100 - settings.accumulateThreshold,                          color: V         },
                  ].map(seg => (
                    <div key={seg.label} style={{
                      flex: Math.max(seg.w, 1),
                      background: seg.color, borderRadius: 4,
                      transition: 'flex 0.4s cubic-bezier(0.16,1,0.3,1)',
                    }}/>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 9.5, color: '#ef4444', fontWeight: 700 }}>0</span>
                  <span style={{ fontSize: 9.5, color: '#f97316', fontWeight: 700 }}>{settings.trimThreshold}</span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700 }}>{settings.holdThreshold}</span>
                  <span style={{ fontSize: 9.5, color: I, fontWeight: 700 }}>{settings.watchThreshold}</span>
                  <span style={{ fontSize: 9.5, color: V, fontWeight: 700 }}>{settings.accumulateThreshold}</span>
                  <span style={{ fontSize: 9.5, color: V, fontWeight: 700 }}>100</span>
                </div>
              </div>

              <RangeRow
                label="Seuil ACCUMULATE"
                desc="Fenêtre d'entrée ouverte — tous les signaux alignés"
                value={settings.accumulateThreshold}
                min={70} max={90} color={V}
                badge="ACCUMULATE"
                onChange={v => updateSettings({ accumulateThreshold: v })}
              />
              <RangeRow
                label="Seuil WATCH"
                desc="Surveiller pour le timing — initier une position partielle"
                value={settings.watchThreshold}
                min={55} max={79} color={I}
                badge="WATCH"
                onChange={v => updateSettings({ watchThreshold: v })}
              />
              <RangeRow
                label="Seuil HOLD"
                desc="Maintenir si en position — ne pas initier"
                value={settings.holdThreshold}
                min={35} max={64} color="var(--text-muted)"
                badge="HOLD"
                onChange={v => updateSettings({ holdThreshold: v })}
              />
              <RangeRow
                label="Seuil TRIM"
                desc="Réduire l'exposition — attendre un retournement"
                value={settings.trimThreshold}
                min={20} max={44} color="#f97316"
                badge="TRIM"
                onChange={v => updateSettings({ trimThreshold: v })}
              />
            </div>
          </Card>

          {/* ══ BOTTOM ACTIONS ═════════════════════════════════ */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            animation: 'fadeUp 0.5s ease 0.4s both',
          }}>
            <button
              onClick={handleReset}
              disabled={resetting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '11px 20px', borderRadius: 13,
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <RefreshCw style={{ width: 13, height: 13, animation: resetting ? 'spin 0.6s linear infinite' : 'none' }}/>
              Réinitialiser
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '11px 28px', borderRadius: 13, border: 'none',
                background: saved ? '#22c55e' : `linear-gradient(135deg, ${V}, ${I})`,
                color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                boxShadow: saved ? '0 4px 16px rgba(34,197,94,0.3)' : `0 4px 16px ${V}30`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {saved
                ? <><CheckCircle style={{ width: 14, height: 14, animation: 'checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}/> Sauvegardé !</>
                : <><Save style={{ width: 14, height: 14 }}/> Sauvegarder les paramètres</>
              }
            </button>
          </div>

        </div>
      </main>
    </>
  );
}