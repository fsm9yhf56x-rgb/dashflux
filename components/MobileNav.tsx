'use client';

import { useState } from 'react';
import { Menu, X, Home, Settings, Bell, Moon, Sun, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function MobileNav({ onRefresh, isRefreshing }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <>
      {/* Mobile Header - Visible uniquement sur mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-[#ff6b35]">Dash</span>
              <span className="text-gray-900 dark:text-white">Flux</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                aria-label="Actualiser"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Changer le thème"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800 shadow-lg">
            <nav className="px-4 py-2 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">
                  Dashboard
                </span>
              </Link>

              <Link
                href="/dashboard#notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">
                  Notifications
                </span>
              </Link>

              <Link
                href="/dashboard#settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">
                  Paramètres
                </span>
              </Link>
            </nav>

            {/* Version Info */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                DashFlux v2.1
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spacer pour compenser le header fixed */}
      <div className="lg:hidden h-[57px]" />
    </>
  );
}