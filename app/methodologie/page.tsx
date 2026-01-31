'use client';

import { Shield, TrendingUp, Activity, Zap, Target, LineChart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Bouton Retour */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Dashboard
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Méthodologie DashFlux
          </h1>
          <p className="text-xl text-gray-600 dark:text-[#d4d4d8]">
            Système de scoring multi-assets
          </p>
        </div>

        {/* Notice développement */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Développement en cours
              </h3>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                <strong>13 piliers opérationnels</strong> avec calculs en temps réel. 
                Les 13 piliers incluent : <strong>Contrarian, Catalysts, Technical Early, Rotation, Seasonality, Relative Strength, Drawdown, Macro Regional, Valuation, Positioning, Flux Institutionnels, Analyse Vélocité, et Timing Entrée</strong>. 
                Note : <strong>Positioning</strong> utilise COT limité et <strong>Valuation</strong> est optimisée pour les actions.
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#ffd93d]" />
            Vue d'ensemble
          </h2>
          <p className="text-gray-700 dark:text-[#d4d4d8] mb-4 leading-relaxed">
            DashFlux utilise un <strong>système de scoring v2.1 multi-composantes</strong> pour évaluer les opportunités sur les marchés financiers, avec <strong>13 piliers d'analyse</strong> :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                📈 Score Technique (30%)
              </h3>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Analyse le <strong>momentum actuel</strong> : ce qui se passe maintenant sur les marchés.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                ⚡ Score Émergent (40%)
              </h3>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Anticipe <strong>3-6 mois à l'avance</strong> via 13 piliers prédictifs.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">
                💰 Flux Institutionnels (15%)
              </h3>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Suit les <strong>mouvements institutionnels</strong> et la pression acheteuse/vendeuse.
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-2">
                🎯 Timing & Vélocité (15%)
              </h3>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Analyse <strong>Vélocité (10%)</strong> et <strong>Timing Entrée (5%)</strong> pour optimiser les points d'entrée.
              </p>
            </div>
          </div>
        </div>

        {/* Score Technique */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Score Technique (30%)
          </h2>
          
          <p className="text-gray-700 dark:text-[#d4d4d8] mb-6">
            Évalue la <strong>force du momentum actuel</strong> en analysant les performances passées et les tendances techniques.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Momentum (50%)
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                Performances sur 1M, 3M, 6M, 12M + position vs moyennes mobiles (MA50, MA200)
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Volatilité (25%)
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                Volatilité annualisée - Une volatilité faible améliore le score (risque maîtrisé)
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Trend (15%)
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                Position du prix par rapport aux MA20 et MA50 (golden cross, death cross)
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Saisonnalité (10%)
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                Patterns saisonniers historiques (ex: Or meilleur en janvier, actions en novembre-décembre)
              </p>
            </div>
          </div>
        </div>

        {/* Score Émergent - 10 Piliers (sur 13 totaux) */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#ffd93d]" />
            Score Émergent (40%) - 10 Piliers
          </h2>
          
          <p className="text-gray-700 dark:text-[#d4d4d8] mb-6">
            Le score émergent anticipe les opportunités <strong>3 à 6 mois à l'avance</strong> en combinant 10 signaux prédictifs. Ces 10 piliers représentent 40% du score final v2.1, complétés par 3 nouveaux piliers (Flux Institutionnels 15%, Analyse Vélocité 10%, Timing Entrée 5%).
          </p>

          <div className="space-y-6">
            {/* Pilier 1 */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Contrarian (12%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Achète quand tout le monde a peur, vends quand tout le monde est euphorique"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Analyse le RSI et le sentiment pour détecter les extrêmes : oversold (RSI &lt; 30) = opportunité d'achat, 
                overbought (RSI &gt; 70) = prudence.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-2 border-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Catalysts (16%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Anticipe les breakouts avant qu'ils n'arrivent"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Détecte les compressions de volatilité et les approches de niveaux clés (MA50, MA200) 
                qui précèdent souvent des mouvements violents.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-2 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Technical Early (10%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Détecte les divergences entre prix et indicateurs"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Divergences haussières (prix baisse mais RSI monte) = signal d'achat précoce. 
                Divergences baissières = warning avant une correction.
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Rotation Sectorielle (8%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Chaque régime macro favorise certains actifs"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Goldilocks → Actions tech | Reflation → Commodités | Stagflation → Or | Récession → Obligations. 
                S'adapte au régime macro détecté.
              </p>
            </div>

            {/* Pilier 5 */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-2 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  5
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Seasonality Early (5%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Anticipe les patterns saisonniers du mois suivant"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Certains actifs performent mieux à certaines périodes (Or en janvier, Actions en octobre-décembre). 
                Prend position AVANT que le pattern ne se matérialise.
              </p>
            </div>

            {/* Pilier 6 */}
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                  6
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Positioning (12%)
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Suis l'argent intelligent, pas la foule"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Analyse les rapports COT (Commitment of Traders) pour détecter quand les institutionnels 
                se positionnent massivement. Suit les "mains fortes", pas les retailers.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                🚧 En cours : Données COT limitées aux commodités majeures
              </p>
            </div>

            {/* Pilier 7 */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-6 border-2 border-cyan-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                  7
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Relative Strength (10%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Achète ce qui surperforme, évite ce qui sous-performe"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Compare la performance de chaque asset vs SPY (benchmark). Un asset qui bat le marché 
                montre une force relative = momentum durable.
              </p>
            </div>

            {/* Pilier 8 */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                  8
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Drawdown (9%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Achète quand c'est loin du plus haut"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Approche contrarian : plus un asset est loin de son ATH (All-Time High), 
                plus l'opportunité est grande. Drawdown &gt; 20% = zone d'achat potentielle.
              </p>
            </div>

            {/* Pilier 9 */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  9
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Valuation (10%)
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "N'achète pas trop cher, même si ça monte"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Compare les valorisations (P/E, P/B) aux moyennes historiques. 
                Une action chère (P/E &gt; moyenne +20%) = risque de correction.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                🚧 En cours : Valorisations limitées aux actions (pas commodités/crypto)
              </p>
            </div>

            {/* Pilier 10 */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border-2 border-indigo-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                  10
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Macro Regional (8%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Suit les stimulus régionaux et les politiques monétaires"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Analyse les politiques des banques centrales par région (Fed, ECB, PBoC). 
                Stimulus = bullish pour les actifs de cette région. Resserrement = bearish.
              </p>
            </div>
          </div>
        </div>

        {/* Nouveaux Piliers v2.1 */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#ff6b35]" />
            Piliers v2.1 (30%) - 3 Nouveaux Piliers
          </h2>
          
          <p className="text-gray-700 dark:text-[#d4d4d8] mb-6">
            La version 2.1 ajoute <strong>3 piliers complémentaires</strong> pour affiner l'analyse avec les flux institutionnels, la vélocité des mouvements, et le timing optimal d'entrée.
          </p>

          <div className="space-y-6">
            {/* Pilier 11 */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  11
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Flux Institutionnels (15%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Suivre l'argent intelligent - les institutionnels ont accès à plus d'info"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Analyse les flux institutionnels via les formulaires SEC 13F (hedge funds, fonds d'investissement). 
                Accumulation forte = signal haussier. Distribution = signal baissier. Détecte les mouvements avant qu'ils ne soient visibles sur les prix.
              </p>
            </div>

            {/* Pilier 12 */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border-2 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  12
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Analyse Vélocité / FOMO (10%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "La vitesse du mouvement indique la force de la tendance"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Mesure l'accélération des prix et le momentum à court terme. 
                Vélocité élevée + volume croissant = signal de momentum fort (FOMO possible). 
                Alerte si le mouvement s'accélère de manière anormale (risque de surchauffe ou opportunité explosive).
              </p>
            </div>

            {/* Pilier 13 */}
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-6 border-2 border-sky-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">
                  13
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Timing Entrée (5%)
                </h3>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                <strong>Principe :</strong> "Le bon actif au mauvais moment = mauvais trade"
              </p>
              <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                Évalue le timing optimal d'entrée en combinant plusieurs signaux : 
                pullbacks sur support, rebonds après correction, breakouts confirmés. 
                Score élevé = point d'entrée favorable maintenant. Score faible = attendre un meilleur timing.
              </p>
            </div>
          </div>
        </div>

        {/* Score Composite */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#ffd93d]" />
            Score Composite Final
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <p className="text-lg font-bold text-center text-gray-900 dark:text-white mb-4">
              Score Final v2.1 = Technique (30%) + Émergent (40%) + Flux Instit. (15%) + Vélocité (10%) + Timing (5%)
            </p>
            <p className="text-sm text-gray-700 dark:text-[#d4d4d8] text-center">
              Structure optimisée avec <strong>13 piliers</strong> : 30% momentum actuel, 40% anticipation (10 piliers), 30% flux & timing (3 piliers v2.1).
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 dark:text-green-400 mb-1">≥80</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">TRÈS FAVORABLE</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">65-79</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">FAVORABLE</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-700 dark:text-[#ffd93d] mb-1">45-64</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">NEUTRE</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700 dark:text-orange-400 mb-1">30-44</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">DÉFAVORABLE</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-700 dark:text-red-400 mb-1">&lt;30</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">TRÈS DÉFAVORABLE</p>
            </div>
          </div>
        </div>

        {/* Bouton Retour en bas */}
        <div className="text-center mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au Dashboard
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6">
          <p className="text-sm text-gray-700 dark:text-[#d4d4d8]">
            ⚠️ <strong>Disclaimer :</strong> Cette méthodologie est fournie à titre éducatif uniquement. 
            Les scores sont basés sur des données historiques et des modèles quantitatifs. 
            Ce n'est pas un conseil en investissement personnalisé. Les performances passées ne garantissent 
            pas les résultats futurs. Consultez un conseiller financier agréé avant toute décision d'investissement.
          </p>
        </div>
      </div>
    </div>
  );
}