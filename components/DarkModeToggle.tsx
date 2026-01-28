'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage or system preference
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode ? savedMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setDarkMode(isDark);
    
    // Apply immediately
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-gray-200 dark:bg-navy-800 w-9 h-9" />
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-navy-800 hover:bg-gray-300 dark:hover:bg-navy-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-neon-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}