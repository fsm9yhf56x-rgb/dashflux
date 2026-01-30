'use client';

import { useEffect, useState } from 'react';
import { AssetScore, MacroRegime } from '@/lib/types';
import MacroRegimeCard from '@/components/MacroRegime';
import TopEmergents from '@/components/TopEmergents';
import ScoresTable from '@/components/ScoresTable';
import Link from 'next/link';
import ScoreChart from '@/components/ScoreChart';
import ChangelogModal from '@/components/ChangelogModal';
import ChangelogButton from '@/components/ChangelogButton';
import { hasSeenChangelog, markChangelogAsSeen } from '@/lib/changelogVersion';
import EmergentScoreComparison from '@/components/EmergentScoreComparison';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import DashboardStats from '@/components/DashboardStats';
import EventNotificationManager from '@/components/EventNotificationManager';
import { useSettings } from '@/contexts/SettingsContext';
import { RefreshCw, Moon, Sun, AlertTriangle, X } from 'lucide-react';
import MobileNav from '@/components/MobileNav';
import ResponsiveScoresView from '@/components/ResponsiveScoresView';

// ✅ Composant Bannière d'Avertissement
function DataWarningBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
      <div className="flex items-start gap-2 lg:gap-3">
        <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm lg:text-base text-gray-900 dark:text-white mb-1">
            Données en Développement
          </h3>
          <p className="text-xs lg:text-sm text-gray-700 dark:text-[#d4d4d8]">
            <strong>13 piliers opérationnels</strong> avec calculs en temps réel. 
            <strong> Live :</strong> Contrarian, Catalysts, Technical Early, Rotation, Seasonality, Relative Strength, Drawdown, Macro Regional, Valuation, Positioning, Flux Institutionnels, Analyse Vélocité, Timing Entrée. 
            <strong> Note :</strong> COT limité pour Positioning, valorisation actions uniquement.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { settings, getRecommendation } = useSettings();
  
  const [scores, setScores] = useState<AssetScore[]>([]);
  const [regime, setRegime] = useState<MacroRegime | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    
    if (!hasSeenChangelog()) {
      setShowChangelog(true);
    }
  }, []);

  const handleCloseChangelog = () => {
    setShowChangelog(false);
    markChangelogAsSeen();
  };

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scoresRes, regimeRes] = await Promise.all([
        fetch('/api/scores'),
        fetch('/api/macro')
      ]);
      
      const scoresData = await scoresRes.json();
      const regimeData = await regimeRes.json();
      
      const scoresWithCustomThresholds = scoresData.map((score: AssetScore) => ({
        ...score,
        recommendation: getRecommendation(score.score)
      }));
      
      const sortedScores = settings.showEmergentFirst
        ? [...scoresWithCustomThresholds].sort((a, b) => b.emergentScore - a.emergentScore)
        : [...scoresWithCustomThresholds].sort((a, b) => b.score - a.score);
      
      setScores(sortedScores);
      setRegime(regimeData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    settings.accumulateThreshold,
    settings.watchThreshold,
    settings.holdThreshold,
    settings.trimThreshold,
    settings.showEmergentFirst
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors duration-200">
      <EventNotificationManager />
      
      {/* 🆕 Mobile Navigation */}
      <MobileNav onRefresh={fetchData} isRefreshing={loading} />
      
      {/* Header Desktop - Caché sur mobile */}
      <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 
                className="text-6xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2"
                style={{
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontStyle: 'italic',
                  transform: 'skewX(-8deg)',
                  letterSpacing: '-0.02em'
                }}
              >
                DashFlux
              </h1>
              <p className="text-gray-600 dark:text-[#a1a1aa]">Dashboard Multi-Assets</p>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg font-medium transition-all bg-[#ff6b35] text-white hover:bg-[#e55a2b]"
              >
                Dashboard
              </Link>

              <Link
                href="/methodologie"
                className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-700 dark:text-[#d4d4d8] hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#ff6b35]"
              >
                Méthodologie
              </Link>

              <Link
                href="/calendrier"
                className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-700 dark:text-[#d4d4d8] hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#ff6b35]"
              >
                Calendrier
              </Link>

              <Link
                href="/parametres"
                className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-700 dark:text-[#d4d4d8] hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#ff6b35]"
              >
                Paramètres
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ChangelogButton onClick={() => setShowChangelog(true)} />
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-[#ff6b35]" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 hover:text-[#ff6b35]" />
                )}
              </button>
              
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Last Update */}
          {mounted && lastUpdate && (
            <div className="text-right mb-6">
              <p className="text-sm text-gray-500 dark:text-[#71717a]">
                Dernière MAJ: {lastUpdate.toLocaleString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu Principal - Responsive */}
      <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Last Update Mobile */}
        {mounted && lastUpdate && (
          <div className="lg:hidden text-right">
            <p className="text-xs text-gray-500 dark:text-[#71717a]">
              MAJ: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        )}

        {/* Bannière d'Avertissement */}
        <DataWarningBanner />

        {/* Macro Regime */}
        <div>
          <MacroRegimeCard regime={regime} />
        </div>

        {/* Content */}
        {loading && scores.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            {scores.length > 0 && (
              <div>
                <TopEmergents scores={scores} />
              </div>
            )}

            {scores.length > 0 && (
              <div>
                <DashboardStats scores={scores} {...(regime && { regime })} />
              </div>
            )}

            {scores.length > 0 && (
              <>
                {/* Table Desktop */}
                <div className="hidden lg:block">
                  <ScoresTable scores={scores} />
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden">
                  <ResponsiveScoresView scores={scores} />
                </div>
              </>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-8 lg:mt-12 p-4 lg:p-6 bg-yellow-50 dark:bg-[#2f3542] border border-yellow-200 dark:border-[#ff6b35] rounded-lg">
          <p className="text-xs lg:text-sm text-gray-700 dark:text-[#d4d4d8]">
            ⚠️ <strong className="text-[#ff6b35]">Avertissement:</strong> Cet outil est fourni à titre éducatif uniquement. Ce n'est pas un conseil en investissement. Les scores sont basés sur des données historiques et ne garantissent pas les performances futures. Consultez un conseiller financier agréé avant toute décision d'investissement.
          </p>
        </div>
      </div>
      
      {/* Modal Changelog */}
      <ChangelogModal isOpen={showChangelog} onClose={handleCloseChangelog} />
    </main>
  );
}