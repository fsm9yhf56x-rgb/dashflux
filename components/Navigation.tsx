'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center gap-6">
      <Link
        href="/dashboard"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isActive('/dashboard')
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Dashboard
      </Link>

      <Link
        href="/methodologie"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isActive('/methodologie')
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Méthodologie
      </Link>

      <Link
        href="/calendrier"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isActive('/calendrier')
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Calendrier
      </Link>

      <Link
        href="/parametres"
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isActive('/parametres')
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Paramètres
      </Link>
    </nav>
  );
}