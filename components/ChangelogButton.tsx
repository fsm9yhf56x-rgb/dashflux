'use client';

import { HelpCircle } from 'lucide-react';

interface ChangelogButtonProps {
  onClick: () => void;
}

export default function ChangelogButton({ onClick }: ChangelogButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Voir les nouveautés"
      title="Nouveautés et changelog"
    >
      <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </button>
  );
}