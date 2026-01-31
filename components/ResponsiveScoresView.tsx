'use client';

import { useState, useEffect } from 'react';
import { AssetScore } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import AssetCard from './AssetCard';

interface Props {
  scores: AssetScore[];
}

export default function ResponsiveScoresView({ scores }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [minEmergentScore, setMinEmergentScore] = useState(0);
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

  const categories = [
    { id: 'all', label: 'Tous', emoji: '🌐' },
    { id: 'equity', label: 'Actions', emoji: '📈' },
    { id: 'crypto', label: 'Crypto', emoji: '₿' },
    { id: 'commodity', label: 'Commodités', emoji: '🥇' },
    { id: 'bond', label: 'Obligations', emoji: '📊' },
    { id: 'currency', label: 'Devises', emoji: '💱' },
  ];

  let filteredScores = scores.filter(score => {
    const matchesSearch = searchTerm === '' || 
      score.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || score.category === activeCategory;
    const matchesScore = score.score >= minScore;
    const matchesEmergent = score.emergentScore >= minEmergentScore;
    
    return matchesSearch && matchesCategory && matchesScore && matchesEmergent;
  });

  filteredScores = filteredScores.sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-base"
        />
      </div>

      {/* Catégories inline */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-[#ff6b35] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filtres avancés */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span>Filtres avancés</span>
        {(minScore > 0 || minEmergentScore > 0) && (
          <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs rounded-full">
            {(minScore > 0 ? 1 : 0) + (minEmergentScore > 0 ? 1 : 0)}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtres</h3>
            <button
              onClick={() => { setMinScore(0); setMinEmergentScore(0); }}
              className="text-sm text-[#ff6b35] hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Score Min: {minScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-[#ff6b35]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Score Émergent Min: {minEmergentScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minEmergentScore}
              onChange={(e) => setMinEmergentScore(Number(e.target.value))}
              className="w-full accent-[#ff6b35]"
            />
          </div>
        </div>
      )}

      {/* Résultats */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredScores.length} actif{filteredScores.length > 1 ? 's' : ''}
        </p>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-sm text-[#ff6b35] hover:underline flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filteredScores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Aucun actif trouvé
            </p>
          </div>
        ) : (
          filteredScores.map((asset) => (
            <AssetCard
              key={asset.ticker}
              asset={asset}
              isFavorite={favorites.includes(asset.ticker)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
}