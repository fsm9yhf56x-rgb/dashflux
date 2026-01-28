'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Zap, Target, BarChart3, ArrowRight, Sun, Moon, Shield } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('darkMode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
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
        className="fixed top-8 right-8 z-50 p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-md"
        style={{
          backgroundColor: darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.6)',
          border: darkMode ? '2px solid rgba(255,107,53,0.3)' : '2px solid rgba(0,0,0,0.1)'
        }}
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-[#ff6b35]" />
        ) : (
          <Moon className="w-6 h-6 text-[#0f1419]" />
        )}
      </button>

      {/* Hero Section avec animations */}
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
            {/* Orange glow effects */}
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
            {/* Sun glow */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-orange-300 rounded-full blur-3xl opacity-40" />
          </div>
        )}

        {/* Main Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          
          {/* Logo Section */}
          <div
            className={`transition-all duration-1000 ${
              mounted
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-20 scale-50'
            }`}
          >
            <h1 
              className={`text-9xl md:text-[11rem] font-black mb-8 text-center ${
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
              className={`text-2xl md:text-3xl text-center font-light mb-4 transition-all duration-1000 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'}`}
            >
              Être là où l'action se passe
            </p>

            <p
              className={`text-lg text-center mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'}`}
            >
              Dashboard intelligent multi-assets avec scoring émergent en temps réel
            </p>
          </div>

          {/* Features Pills */}
          <div
            className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 delay-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full border ${
              darkMode 
                ? 'bg-[#ff6b35]/10 border-[#ff6b35]' 
                : 'bg-white/70 border-orange-400 shadow-lg'
            }`}>
              <Zap className={`w-5 h-5 ${darkMode ? 'text-[#ff6b35]' : 'text-orange-600'}`} />
              <span className={`font-medium ${darkMode ? 'text-[#f5f5f5]' : 'text-gray-800'}`}>
                Score Émergent
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full border ${
              darkMode 
                ? 'bg-[#ff6b35]/10 border-[#ff6b35]' 
                : 'bg-white/70 border-orange-400 shadow-lg'
            }`}>
              <Target className={`w-5 h-5 ${darkMode ? 'text-[#ff6b35]' : 'text-orange-600'}`} />
              <span className={`font-medium ${darkMode ? 'text-[#f5f5f5]' : 'text-gray-800'}`}>
                13 Piliers Prédictifs
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full border ${
              darkMode 
                ? 'bg-[#ff6b35]/10 border-[#ff6b35]' 
                : 'bg-white/70 border-orange-400 shadow-lg'
            }`}>
              <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-[#ff6b35]' : 'text-orange-600'}`} />
              <span className={`font-medium ${darkMode ? 'text-[#f5f5f5]' : 'text-gray-800'}`}>
                Régime Macro
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full border ${
              darkMode 
                ? 'bg-[#ff6b35]/10 border-[#ff6b35]' 
                : 'bg-white/70 border-orange-400 shadow-lg'
            }`}>
              <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-[#ff6b35]' : 'text-orange-600'}`} />
              <span className={`font-medium ${darkMode ? 'text-[#f5f5f5]' : 'text-gray-800'}`}>
                65 Assets
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className={`group px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${
              darkMode
                ? 'bg-[#ff6b35] text-white shadow-lg hover:shadow-xl'
                : 'bg-[#0f1419] text-white shadow-xl hover:shadow-2xl'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <span className="flex items-center gap-2">
              Accéder au Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Scroll Indicator */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className={`text-sm ${darkMode ? 'text-[#71717a]' : 'text-gray-600'}`}>
                Découvrir
              </span>
              <div className={`w-6 h-10 border-2 rounded-full flex items-start justify-center p-2 ${
                darkMode ? 'border-[#3d424d]' : 'border-gray-600'
              }`}>
                <div className={`w-1 h-3 rounded-full animate-bounce ${
                  darkMode ? 'bg-[#ff6b35]' : 'bg-orange-600'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'} hover:scale-105 transition-transform`}>
            <p className="text-4xl font-bold text-[#ff6b35] mb-2">65</p>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} font-medium`}>Assets Analysés</p>
          </div>
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'} hover:scale-105 transition-transform`}>
            <p className="text-4xl font-bold text-[#ff6b35] mb-2">13</p>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} font-medium`}>Piliers Émergents</p>
          </div>
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'} hover:scale-105 transition-transform`}>
            <p className="text-4xl font-bold text-[#ff6b35] mb-2">11/13</p>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} font-medium`}>Piliers Live</p>
          </div>
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'} hover:scale-105 transition-transform`}>
            <p className="text-4xl font-bold text-[#ff6b35] mb-2">1-6</p>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} font-medium`}>Mois d'Anticipation</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className={`text-4xl font-bold text-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Fonctionnalités
        </h2>
        <p className={`text-center mb-12 max-w-2xl mx-auto ${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
          Un système de scoring complet qui combine analyse technique et facteurs émergents
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Score Émergent
            </h3>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-600'} text-sm`}>
              13 piliers analysant : Contrarian, Catalysts, Technical Early, Rotation, Seasonality, 
              Positioning, Relative Strength, Drawdown, Valuation, Macro Regional, Flux Institutionnels, 
              Analyse Vélocité, et Timing Entrée.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ffd93d] to-[#f9ca24] rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Flux Institutionnels
            </h3>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-600'} text-sm`}>
              Détection des flux acheteurs et vendeurs via OBV, MFI, et ligne A/D 
              pour identifier l'accumulation vs distribution.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`${darkMode ? 'bg-[#1a1f2e]/50' : 'bg-white/70'} backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all border ${darkMode ? 'border-[#ff6b35]/20' : 'border-orange-200'}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Analyse Momentum
            </h3>
            <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-600'} text-sm`}>
              Détection de la vélocité et des mouvements paraboliques pour identifier 
              les conditions de marché en temps réel.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} backdrop-blur-sm border-2 ${darkMode ? 'border-yellow-800/30' : 'border-yellow-200'} rounded-xl p-8`}>
          <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Shield className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            Avertissement Important
          </h3>
          <p className={`${darkMode ? 'text-[#d4d4d8]' : 'text-gray-700'} leading-relaxed text-sm`}>
            DashFlux est un outil d'analyse technique et quantitative à visée éducative. Les scores et informations 
            présentés ne constituent en aucun cas un conseil en investissement personnalisé. Consultez un conseiller 
            financier agréé avant toute décision d'investissement.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${darkMode ? 'border-[#3d424d]' : 'border-gray-300'} mt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 
                className="text-3xl font-bold mb-4 text-[#ff6b35]"
                style={{
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontStyle: 'italic',
                  transform: 'skewX(-8deg)',
                }}
              >
                DashFlux
              </h3>
              <p className={`${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'} text-sm`}>
                Analyse multi-assets intelligente avec scoring émergents
              </p>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className={`${darkMode ? 'text-[#a1a1aa] hover:text-[#ff6b35]' : 'text-gray-600 hover:text-orange-600'} transition-colors text-sm`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/methodologie" className={`${darkMode ? 'text-[#a1a1aa] hover:text-[#ff6b35]' : 'text-gray-600 hover:text-orange-600'} transition-colors text-sm`}>
                    Méthodologie
                  </Link>
                </li>
                <li>
                  <Link href="/calendrier" className={`${darkMode ? 'text-[#a1a1aa] hover:text-[#ff6b35]' : 'text-gray-600 hover:text-orange-600'} transition-colors text-sm`}>
                    Calendrier
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Informations</h4>
              <ul className={`space-y-2 ${darkMode ? 'text-[#a1a1aa]' : 'text-gray-600'} text-sm`}>
                <li>65 assets analysés</li>
                <li>13 piliers d'analyse</li>
                <li>Mise à jour : 5 minutes</li>
              </ul>
            </div>
          </div>
          <div className={`border-t ${darkMode ? 'border-[#3d424d]' : 'border-gray-300'} pt-8 text-center`}>
            <p className={`${darkMode ? 'text-[#71717a]' : 'text-gray-600'} text-sm`}>
              © 2026 DashFlux. Outil d'analyse éducative.
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