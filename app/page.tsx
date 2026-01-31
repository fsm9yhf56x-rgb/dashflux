'use client';

import Link from 'next/link';
import { TrendingUp, Zap, Target, BarChart3, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f1419] dark:to-[#1a1f2e]">
      {/* Hero Section - OPTIMISÉ MOBILE */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6"
              style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontStyle: 'italic',
                transform: 'skewX(-8deg)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ff6b35 0%, #ffd93d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              DashFlux
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 font-semibold px-4">
              Être là où l'action se passe
            </p>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Dashboard intelligent multi-assets avec scoring émergent en temps réel
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#ff6b35] text-white rounded-xl hover:bg-[#e55a2b] transition-all text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Accéder au Dashboard →
              </Link>
              <Link
                href="/methodologie"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-[#2f3542] transition-all text-base sm:text-lg font-semibold shadow-md border-2 border-gray-200 dark:border-gray-700"
              >
                Découvrir la Méthodologie
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid - OPTIMISÉ MOBILE */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-4 sm:p-6 text-center border border-orange-200 dark:border-orange-900/30">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ff6b35] mb-1 sm:mb-2">⚡</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">Score Émergent</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Anticipe 3-6 mois</div>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-4 sm:p-6 text-center border border-orange-200 dark:border-orange-900/30">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ff6b35] mb-1 sm:mb-2">🎯</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">13 Piliers</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Prédictifs</div>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-4 sm:p-6 text-center border border-orange-200 dark:border-orange-900/30">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ff6b35] mb-1 sm:mb-2">📊</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">Régime Macro</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Analyse contextuelle</div>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-4 sm:p-6 text-center border border-orange-200 dark:border-orange-900/30">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ff6b35] mb-1 sm:mb-2">📈</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">65 Assets</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Multi-classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - OPTIMISÉ MOBILE */}
      <div className="bg-white dark:bg-[#1a1f2e] py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900 dark:text-white">
            Pourquoi DashFlux ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 sm:p-8 border-2 border-transparent hover:border-[#ff6b35] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                Score Émergent Unique
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Détecte les opportunités 3 à 6 mois avant le marché grâce à 10 piliers prédictifs avancés.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 sm:p-8 border-2 border-transparent hover:border-[#ff6b35] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                Méthodologie Steffan
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Basé sur l'approche macro top-down de Rodolphe Steffan pour identifier où l'action se passe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 sm:p-8 border-2 border-transparent hover:border-[#ff6b35] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                Multi-Assets Complet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Actions, crypto, commodités, obligations, devises - tous analysés avec la même rigueur.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 sm:p-8 border-2 border-transparent hover:border-[#ff6b35] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                Temps Réel
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Données actualisées en continu pour des décisions basées sur les conditions de marché actuelles.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 sm:p-8 border-2 border-transparent hover:border-[#ff6b35] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                Transparent & Éducatif
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Méthodologie complètement documentée pour comprendre chaque score et décision.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 sm:p-8 border-2 border-transparent hover:border-[#ff6b35] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                Calendrier Économique
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Ne ratez aucun événement macro important avec notre calendrier intégré et alertes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - OPTIMISÉ MOBILE */}
      <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffd93d] py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Prêt à anticiper les marchés ?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8">
            Rejoignez DashFlux et découvrez où l'action va se passer avant les autres.
          </p>
          <Link
            href="/dashboard"
            className="inline-block w-full sm:w-auto px-8 sm:px-10 py-4 bg-white text-[#ff6b35] rounded-xl hover:bg-gray-100 transition-all text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Commencer Maintenant →
          </Link>
        </div>
      </div>

      {/* Footer - OPTIMISÉ MOBILE */}
      <div className="bg-gray-900 dark:bg-[#0a0a0a] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 
              className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
              style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontStyle: 'italic',
                transform: 'skewX(-8deg)',
                letterSpacing: '-0.02em'
              }}
            >
              DashFlux
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-4">
              Dashboard intelligent multi-assets avec scoring émergent
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-sm">
              <Link href="/dashboard" className="hover:text-[#ff6b35] transition-colors">
                Dashboard
              </Link>
              <Link href="/methodologie" className="hover:text-[#ff6b35] transition-colors">
                Méthodologie
              </Link>
              <Link href="/calendrier" className="hover:text-[#ff6b35] transition-colors">
                Calendrier
              </Link>
              <Link href="/parametres" className="hover:text-[#ff6b35] transition-colors">
                Paramètres
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              © 2026 DashFlux. Outil éducatif uniquement. Pas de conseil en investissement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}