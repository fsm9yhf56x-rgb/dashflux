'use client';

import { useState, useEffect } from 'react';
import { AssetScore } from '@/lib/types';
import { ArrowUpDown, Search, SlidersHorizontal, Star, X, MousePointerClick, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FilterTabs from './FilterTabs';
import Tooltip from './Tooltip';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  scores: AssetScore[];
}

export default function ScoresTable({ scores }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const [sortField, setSortField] = useState<'score' | 'emergentScore' | 'composite' | 'recommendation'>('composite');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [minActuelScore, setMinActuelScore] = useState(0);
  const [minEmergentScore, setMinEmergentScore] = useState(0);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('dashflux-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (ticker: string) => {
    const newFavorites = favorites.includes(ticker)
      ? favorites.filter(t => t !== ticker)
      : [...favorites, ticker];
    
    setFavorites(newFavorites);
    localStorage.setItem('dashflux-favorites', JSON.stringify(newFavorites));
  };

  const toggleRecommendation = (rec: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(rec) ? prev.filter(r => r !== rec) : [...prev, rec]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMinActuelScore(0);
    setMinEmergentScore(0);
    setSelectedRecommendations([]);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

 // Filter scores
let filteredScores = scores.filter(score => {
  const matchesSearch = searchTerm === '' || 
    score.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    score.name.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesCategory = activeCategory === 'all' || score.category === activeCategory;
  const matchesActuel = score.score >= minActuelScore;
  const matchesEmergent = score.emergentScore >= minEmergentScore;
  const matchesRecommendation = selectedRecommendations.length === 0 || 
    selectedRecommendations.includes(score.recommendation);
  
  return matchesSearch && matchesCategory && matchesActuel && matchesEmergent && matchesRecommendation;
});

  // Sort scores
  const sortedScores = [...filteredScores].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    if (sortField === 'recommendation') {
      const recOrder: Record<string, number> = {
        'ACCUMULATE': 5,
        'WATCH': 4,
        'HOLD': 3,
        'TRIM': 2,
        'AVOID': 1
      };
      aValue = recOrder[a.recommendation] || 0;
      bValue = recOrder[b.recommendation] || 0;
    } else if (sortField === 'composite') {
      aValue = (a.score * 0.4) + (a.emergentScore * 0.6);
      bValue = (b.score * 0.4) + (b.emergentScore * 0.6);
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Pagination
  const totalPages = Math.ceil(sortedScores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScores = sortedScores.slice(startIndex, endIndex);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
     {/* Header avec recherche et filtres */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {/* Titre + Note cliquable */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Tableau des Scores
          </h3>
          {/* 🔥 NOTE EXPLICATIVE CLIQUABLE */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
            <MousePointerClick className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Cliquez sur une ligne</strong> pour voir l'analyse détaillée complète avec les 13 piliers et recommandations personnalisées
            </p>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <FilterTabs 
          activeFilter={activeCategory} 
          onFilterChange={(cat) => {
            setActiveCategory(cat);
            setCurrentPage(1);
          }} 
        />
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4 mt-4">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un actif..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || minActuelScore > 0 || minEmergentScore > 0 || selectedRecommendations.length > 0
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {(minActuelScore > 0 || minEmergentScore > 0 || selectedRecommendations.length > 0) && (
                <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {[minActuelScore > 0, minEmergentScore > 0, selectedRecommendations.length > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Actuel Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Score Actuel Min: {minActuelScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minActuelScore}
                  onChange={(e) => {
                    setMinActuelScore(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Score Émergent Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Score Émergent Min: {minEmergentScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minEmergentScore}
                  onChange={(e) => {
                    setMinEmergentScore(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recommandations
              </label>
              <div className="flex flex-wrap gap-2">
                {['ACCUMULATE', 'WATCH', 'HOLD', 'TRIM', 'AVOID'].map(rec => (
                  <button
                    key={rec}
                    onClick={() => {
                      toggleRecommendation(rec);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                      selectedRecommendations.includes(rec)
                        ? rec === 'ACCUMULATE' ? 'bg-green-500 text-white' :
                          rec === 'WATCH' ? 'bg-blue-500 text-white' :
                          rec === 'HOLD' ? 'bg-gray-500 text-white' :
                          rec === 'TRIM' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset button */}
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredScores.length} résultat{filteredScores.length > 1 ? 's' : ''} trouvé{filteredScores.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ⭐
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actif
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Catégorie
              </th>
              
              {/* Score Actuel */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <span 
                    onClick={() => handleSort('score')}
                    className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                  >
                    <Tooltip content="Score basé sur le momentum actuel, la volatilité, le trend et les indicateurs techniques. Plus le score est élevé, plus l'actif performe actuellement.">
                      <span className="cursor-help">Score Actuel</span>
                    </Tooltip>
                    {sortField === 'score' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                  </span>
                </div>
              </th>
              
              {/* Score Émergent */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <span 
                    onClick={() => handleSort('emergentScore')}
                    className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                  >
                    <Tooltip content="Score prédictif basé sur les signaux précoces : positionnement contrarian, catalyseurs macro à venir, divergences techniques, rotation sectorielle. Indique où l'action VA se passer dans les 3-6 prochains mois.">
                      <span className="cursor-help">Score Émergent</span>
                    </Tooltip>
                    {sortField === 'emergentScore' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                  </span>
                </div>
              </th>
              
              {/* Score Composite */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <span 
                    onClick={() => handleSort('composite')}
                    className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                  >
                    <Tooltip content="Score combiné pondéré : 40% Score Actuel + 60% Score Émergent. Représente la meilleure opportunité globale en tenant compte à la fois de la performance actuelle et du potentiel futur.">
                      <span className="cursor-help">⚡ Composite</span>
                    </Tooltip>
                    {sortField === 'composite' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                  </span>
                </div>
              </th>
              
              {/* Recommendation */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <span 
                    onClick={() => handleSort('recommendation')}
                    className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                  >
                    <Tooltip content={`ACCUMULATE (${settings.accumulateThreshold}+): Opportunité forte, accumuler maintenant | WATCH (${settings.watchThreshold}-${settings.accumulateThreshold - 1}): Surveiller, prêt à entrer | HOLD (${settings.holdThreshold}-${settings.watchThreshold - 1}): Maintenir position | TRIM (${settings.trimThreshold}-${settings.holdThreshold - 1}): Réduire exposition | AVOID (<${settings.trimThreshold}): Éviter ou sortir`}>
                      <span className="cursor-help">Recommandation</span>
                    </Tooltip>
                    {sortField === 'recommendation' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                  </span>
                </div>
              </th>
              
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Perf 1M
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Perf 3M
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedScores.map((score) => {
              const composite = (score.score * 0.4) + (score.emergentScore * 0.6);
              return (
                <tr 
                  key={score.ticker}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.01] group"
                  onClick={() => router.push(`/asset/${score.ticker}`)}
                >
                  {/* Favorite */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(score.ticker);
                      }}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          favorites.includes(score.ticker) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Asset Name - 🔥 AVEC ICÔNE */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {score.ticker}
                          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {score.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      score.category === 'equity' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      score.category === 'commodity' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      score.category === 'crypto' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      score.category === 'bond' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {score.category}
                    </span>
                  </td>

                  {/* Score Actuel */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 text-sm font-bold rounded ${getScoreBg(score.score)} ${getScoreColor(score.score)}`}>
                      {score.score.toFixed(1)}
                    </span>
                  </td>

                  {/* Score Émergent */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 text-sm font-bold rounded ${getScoreBg(score.emergentScore)} ${getScoreColor(score.emergentScore)}`}>
                      {score.emergentScore.toFixed(1)}
                    </span>
                  </td>

                  {/* Score Composite */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 text-sm font-bold rounded border-2 border-purple-500 ${getScoreBg(composite)} ${getScoreColor(composite)}`}>
                      {composite.toFixed(1)}
                    </span>
                  </td>

                  {/* Recommendation */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <Tooltip 
                      content={
                        score.recommendation === 'ACCUMULATE' ? 'Opportunité forte détectée, fenêtre d\'accumulation ouverte' :
                        score.recommendation === 'WATCH' ? 'Signaux émergents positifs, surveiller pour timing d\'entrée' :
                        score.recommendation === 'HOLD' ? 'Position neutre, maintenir si en position' :
                        score.recommendation === 'TRIM' ? 'Signaux de faiblesse, considérer réduction' :
                        'Éviter ou sortir de position'
                      }
                    >
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-help ${
                        score.recommendation === 'ACCUMULATE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        score.recommendation === 'WATCH' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        score.recommendation === 'HOLD' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                        score.recommendation === 'TRIM' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {score.recommendation}
                      </span>
                    </Tooltip>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                    ${score.lastPrice.toFixed(2)}
                  </td>

                  {/* Perf 1M */}
                  <td className={`px-4 py-4 whitespace-nowrap text-center text-sm font-medium ${getChangeColor(score.change1M)}`}>
                    {score.change1M > 0 ? '+' : ''}{score.change1M.toFixed(1)}%
                  </td>

                  {/* Perf 3M */}
                  <td className={`px-4 py-4 whitespace-nowrap text-center text-sm font-medium ${getChangeColor(score.change3M)}`}>
                    {score.change3M > 0 ? '+' : ''}{score.change3M.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de {startIndex + 1} à {Math.min(endIndex, sortedScores.length)} sur {sortedScores.length} résultats
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Précédent
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {currentPage > 2 && (
                  <>
                    <button onClick={() => setCurrentPage(1)} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      1
                    </button>
                    {currentPage > 3 && <span className="px-2 py-1">...</span>}
                  </>
                )}
                
                {currentPage > 1 && (
                  <button onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    {currentPage - 1}
                  </button>
                )}
                
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium">
                  {currentPage}
                </button>
                
                {currentPage < totalPages && (
                  <button onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    {currentPage + 1}
                  </button>
                )}
                
                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <span className="px-2 py-1">...</span>}
                    <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}