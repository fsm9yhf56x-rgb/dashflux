'use client';

import { useEffect, useState } from 'react';
import { AssetScore, MacroRegime } from '@/lib/types';
import MacroRegimeCard from '@/components/MacroRegime';
import TopEmergents from '@/components/TopEmergents';
import ScoresTable from '@/components/ScoresTable';
import Link from 'next/link';
import ChangelogModal from '@/components/ChangelogModal';
import ChangelogButton from '@/components/ChangelogButton';
import { hasSeenChangelog, markChangelogAsSeen } from '@/lib/changelogVersion';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import DashboardStats from '@/components/DashboardStats';
import EventNotificationManager from '@/components/EventNotificationManager';
import { useSettings } from '@/contexts/SettingsContext';
import { RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Recommendation badge config ──────────────────────────────────────────────
const RECO_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  ACCUMULATE: { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed', border: 'rgba(124,58,237,0.3)' },
  WATCH:      { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' },
  HOLD:       { bg: 'rgba(107,114,128,0.08)',color: 'var(--text-muted)', border: 'rgba(107,114,128,0.2)' },
  TRIM:       { bg: 'rgba(239,68,68,0.07)',  color: '#ef4444', border: 'rgba(239,68,68,0.2)'  },
};



// ── Mobile asset card ────────────────────────────────────────────────────────
function MobileAssetCard({ asset, onClick }: { asset: AssetScore; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const reco = RECO_STYLE[asset.recommendation] ?? RECO_STYLE.HOLD;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? 'rgba(124,58,237,0.3)' : '#d4d6e2'}`,
        borderRadius: 16,
        padding: 16,
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 28px rgba(102,126,234,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{asset.name}</h3>
          <p className="text-sm text-gray-400">{asset.ticker}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2"
          style={{ background: reco.bg, color: reco.color, border: `1px solid ${reco.border}` }}>
          {asset.recommendation}
        </span>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid #eef0f8' }}>
          <p className="text-xs text-gray-400 mb-1">Global</p>
          <p className="text-lg font-bold text-gray-900">{asset.score}</p>
        </div>
        <div className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid #eef0f8' }}>
          <p className="text-xs text-gray-400 mb-1">Actuel</p>
          <p className="text-lg font-bold text-gray-900">{asset.technicalScore}</p>
        </div>
        <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <p className="text-xs mb-1" style={{ color: '#7c3aed' }}>Émergent</p>
          <p className="text-lg font-bold" style={{ color: '#7c3aed' }}>{asset.emergentScore}</p>
        </div>
      </div>

      {/* Performances */}
      <div className="mt-3 flex gap-2">
        {[
          { label: '1M', val: asset.change1M },
          { label: '3M', val: asset.change3M },
          { label: '6M', val: asset.change6M },
        ].map(({ label, val }) => {
          const v = val || 0;
          const pos = v > 0;
          return (
            <div key={label} className="flex-1 text-center py-1 px-2 rounded-lg text-xs font-medium"
              style={{
                background: pos ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
                color: pos ? '#16a34a' : '#dc2626',
                border: `1px solid ${pos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
              {label}: {pos ? '+' : ''}{v.toFixed(1)}%
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Home() {
  const { settings, getRecommendation } = useSettings();
  const router = useRouter();

  const [scores, setScores] = useState<AssetScore[]>([]);
  const [regime, setRegime] = useState<MacroRegime | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.documentElement.classList.add('dark');
    if (!hasSeenChangelog()) setShowChangelog(true);
  }, []);

  const handleCloseChangelog = () => {
    setShowChangelog(false);
    markChangelogAsSeen();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scoresRes, regimeRes] = await Promise.all([
        fetch('/api/scores'),
        fetch('/api/macro'),
      ]);
      const scoresData = await scoresRes.json();
      const regimeData = await regimeRes.json();

      const scoresWithCustomThresholds = scoresData.map((score: AssetScore) => ({
        ...score,
        recommendation: getRecommendation(score.score),
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
    settings.showEmergentFirst,
  ]);

  const filteredScores = searchTerm
    ? scores.filter(s =>
        s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : scores;

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f1419] transition-colors duration-200">
      <EventNotificationManager />

      <div className="px-4 lg:px-8 py-3 lg:py-4 max-w-7xl mx-auto space-y-4 lg:space-y-6">


        <div>
          <MacroRegimeCard regime={regime} />
        </div>

        {loading && scores.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            {scores.length > 0 && (
              <div><TopEmergents scores={scores} /></div>
            )}

            {scores.length > 0 && (
              <div><DashboardStats scores={scores} {...(regime && { regime })} /></div>
            )}

            {scores.length > 0 && (
              <>
                {/* Table Desktop */}
                <div className="hidden lg:block">
                  <ScoresTable scores={scores} />
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden space-y-4">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un actif..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                      style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${searchFocused ? 'rgba(124,58,237,0.4)' : '#d4d6e2'}`,
                        borderRadius: 14,
                        boxShadow: searchFocused ? '0 0 0 3px rgba(124,58,237,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.25s ease',
                      }}
                    />
                  </div>

                  {/* Count */}
                  <p className="text-xs text-gray-400 px-1 font-medium">
                    {filteredScores.length} actif{filteredScores.length > 1 ? 's' : ''}
                  </p>

                  {/* Cards */}
                  <div className="space-y-3">
                    {filteredScores.map((asset) => (
                      <MobileAssetCard
                        key={asset.ticker}
                        asset={asset}
                        onClick={() => router.push(`/asset/${asset.ticker}`)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-8 lg:mt-12 p-4 lg:p-6 rounded-2xl"
          style={{
            background: 'rgba(254,252,232,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(253,230,138,0.8)',
          }}>
          <p className="text-xs lg:text-sm text-gray-600">
            ⚠️ <strong className="text-gray-900">Avertissement :</strong> Cet outil est fourni à titre éducatif uniquement. Ce n'est pas un conseil en investissement. Les scores sont basés sur des données historiques et ne garantissent pas les performances futures. Consultez un conseiller financier agréé avant toute décision d'investissement.
          </p>
        </div>
      </div>

      <ChangelogModal isOpen={showChangelog} onClose={handleCloseChangelog} />
    </main>
  );
}