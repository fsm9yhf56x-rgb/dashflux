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
        // Bleu marine saturé (comme votre image)
        navy: {
          950: '#00204a', // Bleu marine saturé principal
          900: '#001a3d',
          800: '#002855',
          700: '#003366',
        },
        // Jaune fluo vrai
        'neon-yellow': {
          400: '#DFFF00', // Jaune fluo chartreuse
          500: '#CCFF00',
          600: '#BFFF00',
        }
      },
    },
  },
  plugins: [],
}