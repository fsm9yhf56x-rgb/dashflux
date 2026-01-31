'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Zap, Target, BarChart3, ArrowRight, Sun, Moon, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('darkMode') !== 'false';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${
      darkMode 
        ? 'bg-gradient-to-br from-[#0f1419] via-[#1a1f27] to-[#0f1419]' 
        : 'bg-gradient-to-br from-sky-200 via-blue-100 to-orange-100'
    }`}>
      
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 p-2.5 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md"
        style={{
          backgroundColor: darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.6)',
          border: darkMode ? '2px solid rgba(255,107,53,0.3)' : '2px solid rgba(0,0,0,0.1)'
        }}
      >
        {darkMode ? (
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff6b35]" />
        ) : (
          <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0f1419]" />
        )}
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* DARK MODE - Particles */}
        {darkMode && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-twinkle"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  background: i % 3 === 0 ? '#ff6b35' : i % 3 === 1 ? '#ff8c5f' : '#ffffff',
                  animationDelay: Math.random() * 5 + 's',
                  animationDuration: Math.random() * 3 + 2 + 's',
                  opacity: Math.random() * 0.6 + 0.2,
                }}
              />
            ))}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6b35] rounded-full blur-3xl opacity-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff8c5f] rounded-full blur-3xl opacity-10"></div>
          </div>
        )}

        {/* LIGHT MODE - Clouds */}
        {!darkMode && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={`cloud-${i}`}
                className="absolute bg-white rounded-full blur-3xl animate-float-slow opacity-70"
                style={{
                  width: Math.random() * 500 + 300 + 'px',
                  height: Math.random() * 200 + 150 + 'px',
                  left: Math.random() * 120 - 10 + '%',
                  top: Math.random() * 80 + '%',
                  animationDelay: Math.random() * 10 + 's',
                  animationDuration: Math.random() * 40 + 60 + 's',
                }}
              />
            ))}
            <div className="absolute top-10 right-10 w-64 h-64 bg-orange-300 rounded-full blur-3xl opacity-40" />
          </div>
        )}

        {/* Main Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6">
          
          {/* Logo */}
          <div
            className={`transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-20 scale-50'
            }`}
          >
            <h1 
              className={`text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black mb-4 sm:mb-8 text-center ${
                darkMode ? 'text-[#ff6b35]' : 'text-[#0f1419]'
              }`}
              style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontStyle: 'italic',
                transform: 'skewX(-8deg)',
                letterSpacing: '-0.02em',
                lineHeight: '1',
                textShadow: darkMode ? '0 0 60px rgba(255,107,53,0.4)' : 'none'
              }}
            >
              DashFlux
            </h1>

            {/* Tagline */}
            <p
              className={`text-xl sm:text-2xl md:text-3xl text-center font-light mb-3 sm:mb-4 transition-all duration-1000 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'}`}
            >
              Être là où l'action se passe
            </p>

            <p
              className={`text-sm sm:text-base lg:text-lg text-center mb-8 sm:mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'}`}
            >
              Dashboard intelligent multi-assets avec scoring émergent en temps réel
            </p>
          </div>

          {/* Feature Pills */}
          <div
            className={`flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-2 transition-all duration-1000 delay-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              { icon: Zap, label: 'Score Émergent' },
              { icon: Target, label: '13 Piliers Prédictifs' },
              { icon: BarChart3, label: 'Régime Macro' },
              { icon: TrendingUp, label: '65 Assets' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm rounded-full border ${
                darkMode 
                  ? 'bg-[#ff6b35]/10 border-[#ff6b35]' 
                  : 'bg-white/70 border-orange-400 shadow-lg'
              }`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-[#ff6b35]' : 'text-orange-600'}`} />
                <span className={`text-sm sm:text-base font-medium ${darkMode ? 'text-[#f5f5f5]' : 'text-gray-800'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-1000 delay-1000 w-full sm:w-auto px-4 sm:px-0 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <button
              onClick={() => router.push('/dashboard')}
              className={`group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-[#ff6b35] text-white shadow-lg hover:shadow-xl'
                  : 'bg-[#0f1419] text-white shadow-xl hover:shadow-2xl'
              }`}
            >
              Accéder au Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/methodologie"
              className={`w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-md ${
                darkMode
                  ? 'bg-[#1a1f2e] text-white border-2 border-gray-600 hover:border-[#ff6b35]'
                  : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-orange-400'
              }`}
            >
              Découvrir la Méthodologie
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div
            className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-[#71717a]' : 'text-gray-600'}`}>
                Découvrir
              </span>
              <div className={`w-5 h-9 sm:w-6 sm:h-10 border-2 rounded-full flex items-start justify-center p-1.5 sm:p-2 ${
                darkMode ? 'border-[#3d424d]' : 'border-gray-600'
              }`}>
                <div className={`w-1 h-2.5 sm:h-3 rounded-full animate-bounce ${
                  darkMode ? 'bg-[#ff6b35]' : 'bg-orange-600'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { value: '65', label: 'Assets Analysés' },
            { value: '13', label: 'Piliers Émergents' },
            { value: '11/13', label: 'Piliers Live' },
            { value: '3-6', label: 'Mois d\'Anticipation' },
          ].map(({ value, label }) => (
            <div key={label} className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center shadow-lg border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'} hover:scale-105 transition-transform`}>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ff6b35] mb-1 sm:mb-2">{value}</p>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} font-medium`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Pourquoi DashFlux ?
        </h2>
        <p className={`text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base ${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
          Un système de scoring complet qui combine analyse technique et facteurs émergents
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[
            {
              icon: Zap,
              color: 'from-[#ff6b35] to-[#e55a2b]',
              iconColor: 'text-white',
              title: 'Score Émergent Unique',
              desc: 'Détecte les opportunités 1 à 6 mois avant le marché grâce à 13 piliers prédictifs avancés.'
            },
            {
              icon: Target,
              color: 'from-[#ffd93d] to-[#f9ca24]',
              iconColor: 'text-gray-900',
              title: 'Flux Institutionnels',
              desc: 'Détection des flux acheteurs et vendeurs via OBV, MFI, et ligne A/D pour identifier l\'accumulation vs distribution.'
            },
            {
              icon: BarChart3,
              color: 'from-blue-500 to-blue-600',
              iconColor: 'text-white',
              title: 'Multi-Assets Complet',
              desc: 'Actions, crypto, commodités, obligations, devises — tous analysés avec la même rigueur.'
            },
            {
              icon: TrendingUp,
              color: 'from-green-500 to-green-600',
              iconColor: 'text-white',
              title: 'Temps Réel',
              desc: 'Données actualisées en continu pour des décisions basées sur les conditions de marché actuelles.'
            },
            {
              icon: Shield,
              color: 'from-purple-500 to-purple-600',
              iconColor: 'text-white',
              title: 'Transparent & Éducatif',
              desc: 'Méthodologie complètement documentée pour comprendre chaque score et décision.'
            },
            {
              icon: Clock,
              color: 'from-[#ff6b35] to-[#ffd93d]',
              iconColor: 'text-white',
              title: 'Calendrier Économique',
              desc: 'Ne ratez aucun événement macro important avec notre calendrier intégré et alertes.'
            },
          ].map(({ icon: Icon, color, iconColor, title, desc }) => (
            <div key={title} className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-5 sm:p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'}`}>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4 sm:mb-6`}>
                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} />
              </div>
              <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-[#d4d4d8]' : 'text-gray-600'}`}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={`${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} backdrop-blur-sm border-2 ${darkMode ? 'border-yellow-800/30' : 'border-yellow-200'} rounded-xl p-5 sm:p-8`}>
          <h3 className={`text-base sm:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Shield className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            Avertissement Important
          </h3>
          <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} leading-relaxed text-xs sm:text-sm`}>
            DashFlux est un outil d'analyse technique et quantitative à visée éducative. Les scores et informations 
            présentés ne constituent en aucun cas un conseil en investissement personnalisé. Consultez un conseiller 
            financier agréé avant toute décision d'investissement.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${darkMode ? 'border-[#3d424d]' : 'border-gray-300'} mt-8 sm:mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Logo & Description */}
            <div className="text-center md:text-left">
              <h3 
                className={`text-2xl sm:text-3xl font-bold mb-3 ${darkMode ? 'text-[#ff6b35]' : 'text-[#0f1419]'}`}
                style={{
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontStyle: 'italic',
                  transform: 'skewX(-8deg)',
                }}
              >
                DashFlux
              </h3>
              <p className={`${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'} text-sm`}>
                Dashboard intelligent multi-assets avec scoring émergent pour anticiper les mouvements de marché 3 à 6 mois à l'avance.
              </p>
            </div>

            {/* Navigation */}
            <div className="text-center md:text-left">
              <h4 className={`font-bold mb-3 text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>Navigation</h4>
              <nav className="space-y-2">
                {[
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/methodologie', label: 'Méthodologie' },
                  { href: '/calendrier', label: 'Calendrier Économique' },
                  { href: '/parametres', label: 'Paramètres' },
                ].map(({ href, label }) => (
                  <Link key={label} href={href} className={`block text-sm transition-colors ${darkMode ? 'text-[#a1a1aa] hover:text-[#ff6b35]' : 'text-gray-600 hover:text-orange-600'}`}>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Informations */}
            <div className="text-center md:text-left">
              <h4 className={`font-bold mb-3 text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>Informations</h4>
              <div className={`space-y-2 text-sm ${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
                <p>📊 <strong className={darkMode ? 'text-white' : 'text-gray-900'}>13 Piliers</strong> prédictifs</p>
                <p>📈 <strong className={darkMode ? 'text-white' : 'text-gray-900'}>65 Assets</strong> analysés</p>
                <p>⚡ <strong className={darkMode ? 'text-white' : 'text-gray-900'}>Temps réel</strong></p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className={`border-t ${darkMode ? 'border-[#3d424d]' : 'border-gray-300'} pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm`}>
            <p className={darkMode ? 'text-[#71717a]' : 'text-gray-600'}>
              © 2026 DashFlux. Tous droits réservés.
            </p>
            <p className={`text-center sm:text-right ${darkMode ? 'text-[#71717a]' : 'text-gray-500'}`}>
              Outil éducatif uniquement • Pas de conseil en investissement
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-15px); }
        }
        
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow linear infinite;
        }
      `}</style>
    </div>
  );
}