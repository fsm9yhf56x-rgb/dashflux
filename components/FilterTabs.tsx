'use client';

import { useState } from 'react';

interface Props {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Tous', emoji: '🌐' },
  { id: 'equity', label: 'Actions', emoji: '📈' },
  { id: 'commodity', label: 'Commodités', emoji: '🥇' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' },
  { id: 'bond', label: 'Obligations', emoji: '📜' },
  { id: 'currency', label: 'Devises', emoji: '💱' },
];

export default function FilterTabs({ activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onFilterChange(cat.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeFilter === cat.id
              ? 'bg-blue-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg hover:scale-105 active:scale-95'
          }`}
        >
          <span className="mr-2">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}