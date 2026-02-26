'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AssetScore } from '@/lib/types';
import { ArrowUpDown, Search, SlidersHorizontal, Star, X, MousePointerClick, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FilterTabs from './FilterTabs';
import Tooltip from './Tooltip';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  scores: AssetScore[];
}

const GLASS = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: 20,
  boxShadow: 'var(--glass-shadow)',
} as const;

const RECO_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  ACCUMULATE: { bg: 'rgba(124,58,237,0.09)',  color: '#7c3aed', border: 'rgba(124,58,237,0.25)' },
  WATCH:      { bg: 'rgba(99,102,241,0.08)',  color: '#6366f1', border: 'rgba(99,102,241,0.22)' },
  HOLD:       { bg: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)', border: 'rgba(107,114,128,0.18)' },
  TRIM:       { bg: 'rgba(249,115,22,0.08)',  color: '#f97316', border: 'rgba(249,115,22,0.22)' },
  AVOID:      { bg: 'rgba(239,68,68,0.07)',   color: '#ef4444', border: 'rgba(239,68,68,0.2)'   },
};

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  equity:    { bg: 'rgba(59,130,246,0.08)',  color: '#3b82f6' },
  commodity: { bg: 'rgba(245,158,11,0.09)',  color: '#d97706' },
  crypto:    { bg: 'rgba(124,58,237,0.09)',  color: '#7c3aed' },
  bond:      { bg: 'rgba(34,197,94,0.08)',   color: '#16a34a' },
};

function ScoreBadge({ value, composite = false }: { value: number; composite?: boolean }) {
  const color  = value >= 75 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626';
  const bg     = value >= 75 ? 'rgba(34,197,94,0.09)'   : value >= 50 ? 'rgba(245,158,11,0.09)'   : 'rgba(239,68,68,0.09)';
  const border = value >= 75 ? 'rgba(34,197,94,0.22)'   : value >= 50 ? 'rgba(245,158,11,0.22)'   : 'rgba(239,68,68,0.22)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 52, padding: '3px 10px',
      background: bg, color, fontWeight: 700, fontSize: 13,
      borderRadius: 10,
      border: composite ? `1.5px solid rgba(124,58,237,0.4)` : `1px solid ${border}`,
      boxShadow: composite ? '0 0 0 3px rgba(124,58,237,0.06)' : 'none',
    }}>
      {value.toFixed(1)}
    </span>
  );
}

function AnimatedScore({ value, composite = false }: { value: number; composite?: boolean }) {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el || startedRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || startedRef.current) return;
      startedRef.current = true;
      const duration = 900;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(eased * value * 10) / 10);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  const color  = display >= 75 ? '#16a34a' : display >= 50 ? '#d97706' : '#dc2626';
  const bg     = display >= 75 ? 'rgba(34,197,94,0.09)'   : display >= 50 ? 'rgba(245,158,11,0.09)'   : 'rgba(239,68,68,0.09)';
  const border = display >= 75 ? 'rgba(34,197,94,0.22)'   : display >= 50 ? 'rgba(245,158,11,0.22)'   : 'rgba(239,68,68,0.22)';

  return (
    <span ref={ref} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 52, padding: '3px 10px',
      background: bg, color, fontWeight: 700, fontSize: 13,
      borderRadius: 10,
      border: composite ? '1.5px solid rgba(124,58,237,0.4)' : `1px solid ${border}`,
      boxShadow: composite ? '0 0 0 3px rgba(124,58,237,0.06), 0 0 12px rgba(124,58,237,0.12)' : 'none',
      transition: 'background 0.3s, color 0.3s',
    }}>
      {display.toFixed(1)}
    </span>
  );
}

function TableRow({
  score, rank, isFavorite, onToggleFav, onClick,
}: {
  score: AssetScore; rank: number; isFavorite: boolean;
  onToggleFav: () => void; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLTableRowElement>(null);
  const frame = useRef<number>(0);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      el.style.backgroundImage = `radial-gradient(ellipse 55% 100% at ${50 + x * 22}% 50%, rgba(124,58,237,0.05), transparent)`;
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.backgroundImage = '';
    setHovered(false);
  }, []);

  const composite = (score.score * 0.4) + (score.emergentScore * 0.6);
  const reco = RECO_STYLE[score.recommendation] ?? RECO_STYLE.HOLD;
  const cat  = CAT_STYLE[score.category] ?? { bg: 'rgba(107,114,128,0.07)', color: 'var(--text-muted)' };
  const changeColor = (v: number) => v > 0 ? '#16a34a' : v < 0 ? '#dc2626' : 'var(--text-muted)';
  const delay = (rank % 20) * 35;

  return (
    <tr ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-12px)',
        transition: `opacity 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms, background 0.2s ease`,
        background: hovered ? 'rgba(124,58,237,0.03)' : 'transparent',
        borderBottom: '1px solid var(--border)',
      }}
      className="group"
    >
      <td className="px-4 py-3.5 whitespace-nowrap">
        <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25) rotate(-8deg)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}>
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
            style={{ transition: 'color 0.2s, fill 0.2s' }} />
        </button>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-bold flex items-center gap-1.5"
              style={{ color: hovered ? '#7c3aed' : 'var(--text-primary)', transition: 'color 0.2s ease' }}>
              {score.ticker}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100"
                style={{ transition: 'opacity 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: hovered ? 'translateX(2px) translateY(-1px)' : 'none' }} />
            </div>
            <div className="text-xs" style={{ color: "var(--text-faint)" }}>{score.name}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <span style={{
          display: 'inline-flex', padding: '2px 10px', fontSize: 11, fontWeight: 600,
          borderRadius: 20, background: cat.bg, color: cat.color,
          border: `1px solid ${cat.color}30`,
        }}>
          {score.category}
        </span>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap text-center"><AnimatedScore value={score.score} /></td>
      <td className="px-4 py-3.5 whitespace-nowrap text-center"><AnimatedScore value={score.emergentScore} /></td>
      <td className="px-4 py-3.5 whitespace-nowrap text-center"><AnimatedScore value={composite} composite /></td>

      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <Tooltip content={
          score.recommendation === 'ACCUMULATE' ? "Opportunité forte détectée, fenêtre d'accumulation ouverte" :
          score.recommendation === 'WATCH'      ? 'Signaux émergents positifs, surveiller pour timing d\'entrée' :
          score.recommendation === 'HOLD'       ? 'Position neutre, maintenir si en position' :
          score.recommendation === 'TRIM'       ? 'Signaux de faiblesse, considérer réduction' :
          'Éviter ou sortir de position'
        }>
          <span style={{
            display: 'inline-flex', padding: '3px 12px', fontSize: 11, fontWeight: 700,
            borderRadius: 20, background: reco.bg, color: reco.color,
            border: `1px solid ${reco.border}`, cursor: 'help',
          }}>
            {score.recommendation}
          </span>
        </Tooltip>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
        ${score.lastPrice.toFixed(2)}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm font-semibold"
        style={{ color: changeColor(score.change1M) }}>
        {score.change1M > 0 ? '+' : ''}{score.change1M.toFixed(1)}%
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm font-semibold"
        style={{ color: changeColor(score.change3M) }}>
        {score.change3M > 0 ? '+' : ''}{score.change3M.toFixed(1)}%
      </td>
    </tr>
  );
}

function SortTh({ field, label, tooltip, active, onClick }: {
  field: string; label: string; tooltip: string; active: boolean; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <th className="px-4 py-3.5 text-center" style={{ userSelect: 'none' }}>
      <div className="flex items-center justify-center gap-1">
        <span onClick={onClick}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: active ? '#7c3aed' : hov ? '#4f46e5' : 'var(--text-faint)',
            transition: 'color 0.2s',
          }}>
          <Tooltip content={tooltip}>
            <span className="cursor-help">{label}</span>
          </Tooltip>
          {active && <ArrowUpDown className="w-3 h-3" style={{ color: '#7c3aed' }} />}
        </span>
      </div>
    </th>
  );
}

export default function ScoresTable({ scores }: Props) {
  const router = useRouter();
  const { settings } = useSettings();

  const [sortField,   setSortField]   = useState<'score' | 'emergentScore' | 'composite' | 'recommendation'>('composite');
  const [sortOrder,   setSortOrder]   = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [searchTerm,              setSearchTerm]              = useState('');
  const [searchFocused,           setSearchFocused]           = useState(false);
  const [activeCategory,          setActiveCategory]          = useState<string>('all');
  const [showFilters,             setShowFilters]             = useState(false);
  const [minActuelScore,          setMinActuelScore]          = useState(0);
  const [minEmergentScore,        setMinEmergentScore]        = useState(0);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [favorites,               setFavorites]               = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('dashflux-favorites');
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  const toggleFavorite = (ticker: string) => {
    const next = favorites.includes(ticker)
      ? favorites.filter(t => t !== ticker)
      : [...favorites, ticker];
    setFavorites(next);
    localStorage.setItem('dashflux-favorites', JSON.stringify(next));
  };

  const toggleRecommendation = (rec: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(rec) ? prev.filter(r => r !== rec) : [...prev, rec]
    );
  };

  const resetFilters = () => {
    setSearchTerm(''); setMinActuelScore(0);
    setMinEmergentScore(0); setSelectedRecommendations([]);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
    setCurrentPage(1);
  };

  const filteredScores = scores.filter(s => {
    const matchSearch = searchTerm === '' ||
      s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat  = activeCategory === 'all' || s.category === activeCategory;
    const matchAct  = s.score >= minActuelScore;
    const matchEmg  = s.emergentScore >= minEmergentScore;
    const matchReco = selectedRecommendations.length === 0 || selectedRecommendations.includes(s.recommendation);
    return matchSearch && matchCat && matchAct && matchEmg && matchReco;
  });

  const sortedScores = [...filteredScores].sort((a, b) => {
    let av: number, bv: number;
    if (sortField === 'recommendation') {
      const o: Record<string, number> = { ACCUMULATE: 5, WATCH: 4, HOLD: 3, TRIM: 2, AVOID: 1 };
      av = o[a.recommendation] || 0; bv = o[b.recommendation] || 0;
    } else if (sortField === 'composite') {
      av = a.score * 0.4 + a.emergentScore * 0.6;
      bv = b.score * 0.4 + b.emergentScore * 0.6;
    } else {
      av = a[sortField]; bv = b[sortField];
    }
    return sortOrder === 'asc' ? av - bv : bv - av;
  });

  const totalPages      = Math.ceil(sortedScores.length / itemsPerPage);
  const startIndex      = (currentPage - 1) * itemsPerPage;
  const paginatedScores = sortedScores.slice(startIndex, startIndex + itemsPerPage);
  const activeFiltersCount = [minActuelScore > 0, minEmergentScore > 0, selectedRecommendations.length > 0].filter(Boolean).length;

  return (
    <div style={GLASS}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>

        <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>Tableau des Scores</h3>

        <div className="flex items-start gap-2.5 rounded-xl p-3 mb-5"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }} />
          <p className="text-sm" style={{ color: '#6366f1' }}>
            <strong>Cliquez sur une ligne</strong> pour voir l'analyse détaillée avec les 13 piliers et recommandations personnalisées
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <div className="flex-1 min-w-0">
            <FilterTabs
              activeFilter={activeCategory}
              onFilterChange={cat => { setActiveCategory(cat); setCurrentPage(1); }}
            />
          </div>

          {/* Search — style fusionné en un seul attribut ✅ */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un actif..."
              value={searchTerm}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none w-52"
              style={{
                color: 'var(--text-primary)',
                background: 'var(--glass-bg)',
                border: `1px solid ${searchFocused ? 'rgba(124,58,237,0.45)' : '#d4d6e2'}`,
                borderRadius: 12,
                boxShadow: searchFocused ? '0 0 0 3px rgba(124,58,237,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
              }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showFilters || activeFiltersCount > 0
                ? 'rgba(124,58,237,0.09)' : 'var(--bg-subtle)',
              border: `1px solid ${showFilters || activeFiltersCount > 0 ? 'rgba(124,58,237,0.3)' : '#d4d6e2'}`,
              color: showFilters || activeFiltersCount > 0 ? '#7c3aed' : 'var(--text-muted)',
            }}>
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span style={{
                background: '#7c3aed', color: '#fff', fontSize: 10,
                fontWeight: 800, padding: '1px 6px', borderRadius: 20,
              }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 rounded-2xl space-y-4"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Score Actuel Min : <span style={{ color: '#7c3aed' }}>{minActuelScore}</span>
                </label>
                <input type="range" min="0" max="100" step="5" value={minActuelScore}
                  onChange={e => { setMinActuelScore(+e.target.value); setCurrentPage(1); }}
                  className="w-full accent-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Score Émergent Min : <span style={{ color: '#7c3aed' }}>{minEmergentScore}</span>
                </label>
                <input type="range" min="0" max="100" step="5" value={minEmergentScore}
                  onChange={e => { setMinEmergentScore(+e.target.value); setCurrentPage(1); }}
                  className="w-full accent-purple-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Recommandations</label>
              <div className="flex flex-wrap gap-2">
                {['ACCUMULATE', 'WATCH', 'HOLD', 'TRIM', 'AVOID'].map(rec => {
                  const active = selectedRecommendations.includes(rec);
                  const rs = RECO_STYLE[rec] ?? RECO_STYLE.HOLD;
                  return (
                    <button key={rec}
                      onClick={() => { toggleRecommendation(rec); setCurrentPage(1); }}
                      style={{
                        padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: active ? rs.bg : 'var(--bg-subtle)',
                        color: active ? rs.color : 'var(--text-muted)',
                        border: `1px solid ${active ? rs.border : '#d4d6e2'}`,
                        transition: 'all 0.2s ease',
                      }}>
                      {rec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={resetFilters}
                className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-colors">
                <X className="w-3.5 h-3.5" />Réinitialiser
              </button>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs font-medium" style={{ color: "var(--text-faint)" }}>
          {filteredScores.length} résultat{filteredScores.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-3.5 text-left" style={{ width: 40 }}>
                <span className="text-xs font-semibold" style={{ color: "var(--text-faint)" }}>⭐</span>
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Actif</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Catégorie</th>
              <SortTh field="score" label="Score Actuel" active={sortField === 'score'} onClick={() => handleSort('score')}
                tooltip="Score basé sur le momentum actuel, la volatilité, le trend et les indicateurs techniques." />
              <SortTh field="emergentScore" label="Score Émergent" active={sortField === 'emergentScore'} onClick={() => handleSort('emergentScore')}
                tooltip="Score prédictif basé sur les signaux précoces : positionnement contrarian, catalyseurs macro, divergences techniques, rotation sectorielle. Indique où l'action VA se passer dans 1-6 mois." />
              <SortTh field="composite" label="⚡ Composite" active={sortField === 'composite'} onClick={() => handleSort('composite')}
                tooltip="Score combiné pondéré : 40% Score Actuel + 60% Score Émergent. Représente la meilleure opportunité globale." />
              <SortTh field="recommendation" label="Recommandation" active={sortField === 'recommendation'} onClick={() => handleSort('recommendation')}
                tooltip={`ACCUMULATE (${settings.accumulateThreshold}+) | WATCH (${settings.watchThreshold}+) | HOLD (${settings.holdThreshold}+) | TRIM (${settings.trimThreshold}+) | AVOID`} />
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Prix</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Perf 1M</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Perf 3M</th>
            </tr>
          </thead>
          <tbody>
            {paginatedScores.map((score, i) => (
              <TableRow
                key={score.ticker}
                score={score}
                rank={startIndex + i + 1}
                isFavorite={favorites.includes(score.ticker)}
                onToggleFav={() => toggleFavorite(score.ticker)}
                onClick={() => router.push(`/asset/${score.ticker}`)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedScores.length)} sur {sortedScores.length}
          </p>
          <div className="flex gap-1.5">
            <PagBtn label="Précédent" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
            {paginationPages(currentPage, totalPages).map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} className="px-2 py-1 text-sm" style={{ color: "var(--text-faint)" }}>…</span>
                : <PagBtn key={p} label={String(p)} active={p === currentPage} onClick={() => setCurrentPage(p as number)} />
            )}
            <PagBtn label="Suivant" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({ label, onClick, disabled, active }: {
  label: string; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '4px 12px', borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 500,
        background: active ? 'rgba(124,58,237,0.1)' : hov ? 'rgba(124,58,237,0.05)' : 'transparent',
        color: active ? '#7c3aed' : hov ? '#7c3aed' : 'var(--text-muted)',
        border: `1px solid ${active ? 'rgba(124,58,237,0.3)' : hov ? 'rgba(124,58,237,0.15)' : '#d4d6e2'}`,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}>
      {label}
    </button>
  );
}

function paginationPages(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}