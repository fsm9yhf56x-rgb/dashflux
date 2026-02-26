/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Surfaces ──────────────────────────────────────────
        surface: {
          light: '#f4f5fa',   // fond clair légèrement bleuté
          dark:  '#0d0a1a',   // fond sombre profond violet-noir
        },

        // ── Violet / Indigo — palette principale DA ───────────
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        // ── Indigo accent ──────────────────────────────────────
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },

        // ── Dark UI layers ─────────────────────────────────────
        dark: {
          50:  '#1a1030',   // card layer 1
          100: '#150d26',   // card layer 2
          200: '#0d0a1a',   // base background
          border: 'rgba(139,92,246,0.2)',  // border subtil violet
        },
      },

      // ── Glassmorphism box-shadows ────────────────────────────
      boxShadow: {
        glass:      '0 8px 32px rgba(102,126,234,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'glass-dark': '0 8px 32px rgba(139,92,246,0.15), 0 2px 8px rgba(0,0,0,0.4)',
        violet:     '0 4px 24px rgba(124,58,237,0.25)',
        card:       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(102,126,234,0.08)',
      },

      // ── Backdrop blur ────────────────────────────────────────
      backdropBlur: {
        glass: '24px',
      },

      // ── Animations ───────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        fadeIn:  'fadeIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}