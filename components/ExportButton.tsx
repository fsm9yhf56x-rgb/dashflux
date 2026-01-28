'use client';

import { LayoutGrid, List } from 'lucide-react';

interface Props {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export default function ViewToggle({ view, onViewChange }: Props) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-navy-900 rounded-lg shadow p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all
          ${view === 'grid'
            ? 'bg-blue-500 dark:bg-neon-yellow-400 text-white dark:text-navy-950 shadow'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800'
          }
        `}
      >
        <LayoutGrid className="w-4 h-4" />
        Grille
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all
          ${view === 'table'
            ? 'bg-blue-500 dark:bg-neon-yellow-400 text-white dark:text-navy-950 shadow'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800'
          }
        `}
      >
        <List className="w-4 h-4" />
        Tableau
      </button>
    </div>
  );
}