/**
 * styleTokens.ts
 * Shared design tokens using CSS custom properties.
 * Import these instead of defining GLASS/CARD locally in each page.
 * Automatically adapts to dark mode via html.dark CSS variables.
 *
 * Usage:
 *   import { GLASS, CARD, SUBTLE, text, border } from '@/lib/styleTokens';
 */

import type { CSSProperties } from 'react';

// ── Glass panel ──────────────────────────────────────────────────────────────
export const GLASS: CSSProperties = {
  background:           'var(--glass-bg)',
  backdropFilter:       'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border:               '1px solid var(--glass-border)',
  borderRadius:         20,
  boxShadow:            'var(--glass-shadow)',
};

// ── Card (slightly more opaque than glass) ───────────────────────────────────
export const CARD: CSSProperties = {
  background:           'var(--bg-card)',
  backdropFilter:       'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border:               '1.5px solid var(--border-card)',
  borderRadius:         18,
  overflow:             'hidden',
  boxShadow:            '0 2px 16px rgba(0,0,0,0.04)',
};

// ── Subtle background (rows, inset areas) ────────────────────────────────────
export const SUBTLE: CSSProperties = {
  background: 'var(--bg-subtle)',
  border:     '1px solid var(--border-subtle)',
  borderRadius: 12,
};

// ── Input / Select ───────────────────────────────────────────────────────────
export const INPUT: CSSProperties = {
  background:   'var(--bg-input)',
  border:       '1px solid var(--border)',
  borderRadius: 11,
  color:        'var(--text-primary)',
};

// ── Page root ────────────────────────────────────────────────────────────────
export const PAGE: CSSProperties = {
  minHeight:  '100vh',
  background: 'var(--bg-page)',
};

// ── Text helpers ─────────────────────────────────────────────────────────────
export const text = {
  primary:   { color: 'var(--text-primary)'   } as CSSProperties,
  secondary: { color: 'var(--text-secondary)' } as CSSProperties,
  muted:     { color: 'var(--text-muted)'     } as CSSProperties,
  faint:     { color: 'var(--text-faint)'     } as CSSProperties,
};

// ── Border helpers ───────────────────────────────────────────────────────────
export const border = {
  default: { borderColor: 'var(--border)'        } as CSSProperties,
  subtle:  { borderColor: 'var(--border-subtle)' } as CSSProperties,
  card:    { borderColor: 'var(--border-card)'   } as CSSProperties,
};

// ── Divider ──────────────────────────────────────────────────────────────────
export const DIVIDER: CSSProperties = {
  height:     1,
  background: 'var(--border)',
  border:     'none',
};

// ── Brand colours (static, same in light/dark) ───────────────────────────────
export const V = '#7c3aed'; // violet
export const I = '#6366f1'; // indigo