'use client';

import { Settings, Bell, Palette, Database, Shield, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, saveSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await saveSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      resetSettings();
      setSaved(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Settings className="w-10 h-10 text-[#ff6b35]" />
              Paramètres
            </h1>
          </div>
          
          {/* Boutons Action */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
                saved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[#ff6b35] hover:bg-[#e55a2b] text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Section Notifications */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#ff6b35]" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Notifications par email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recevoir des notifications importantes par email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff6b35]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Alertes de scores
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  M'alerter quand un asset atteint le seuil ACCUMULATE
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scoreAlerts}
                  onChange={(e) => updateSettings({ scoreAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff6b35]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Digest hebdomadaire
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Résumé hebdomadaire des meilleures opportunités
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyDigest}
                  onChange={(e) => updateSettings({ weeklyDigest: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff6b35]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section Affichage */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#ffd93d]" />
            Affichage
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Thème
              </h3>
              <div className="flex gap-3">
                {(['auto', 'light', 'dark'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => updateSettings({ theme })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      settings.theme === theme
                        ? 'bg-[#ff6b35] text-white shadow-lg scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {theme === 'auto' ? 'Automatique' : theme === 'light' ? 'Clair' : 'Sombre'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Prioriser le score émergent
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trier par score émergent par défaut
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showEmergentFirst}
                  onChange={(e) => updateSettings({ showEmergentFirst: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ffd93d]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section Données */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-500" />
            Données
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Intervalle de rafraîchissement
              </h3>
              <select
                value={settings.refreshInterval}
                onChange={(e) => updateSettings({ refreshInterval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:border-[#ff6b35] focus:border-[#ff6b35] focus:ring-2 focus:ring-orange-300 transition-colors"
              >
                <option value={1800}>30 minutes</option>
                <option value={3600}>1 heure (recommandé)</option>
                <option value={7200}>2 heures</option>
                <option value={14400}>4 heures</option>
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Les scores sont recalculés toutes les {settings.refreshInterval / 60} minutes
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Cache activé
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Améliore les performances en mettant en cache les données
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cacheEnabled}
                  onChange={(e) => updateSettings({ cacheEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section Seuils */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#ff6b35]" />
            Seuils personnalisés
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Seuil ACCUMULATE
                </h3>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ≥{settings.accumulateThreshold}
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="90"
                value={settings.accumulateThreshold}
                onChange={(e) => updateSettings({ accumulateThreshold: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
              />
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-[#ff6b35] hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Seuil WATCH
                </h3>
                <span className="text-2xl font-bold text-[#ff6b35]">
                  ≥{settings.watchThreshold}
                </span>
              </div>
              <input
                type="range"
                min="55"
                max="79"
                value={settings.watchThreshold}
                onChange={(e) => updateSettings({ watchThreshold: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#ff6b35]"
              />
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-[#ffd93d] hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Seuil HOLD
                </h3>
                <span className="text-2xl font-bold text-[#ffd93d] dark:text-[#ffd93d]">
                  ≥{settings.holdThreshold}
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="64"
                value={settings.holdThreshold}
                onChange={(e) => updateSettings({ holdThreshold: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#ffd93d]"
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-gray-400 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Seuil TRIM
                </h3>
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  ≥{settings.trimThreshold}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="44"
                value={settings.trimThreshold}
                onChange={(e) => updateSettings({ trimThreshold: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-gray-500"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-[#ff6b35]">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>Astuce :</strong> Les seuils par défaut (80/65/45/30) sont optimisés selon la méthodologie. 
              Ajustez-les selon votre profil de risque.
            </p>
          </div>
        </div>

        {/* Bouton Sauvegarder Final */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            className={`px-8 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-[#ff6b35] hover:bg-[#e55a2b] text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            {saved ? 'Sauvegardé !' : 'Sauvegarder les paramètres'}
          </button>
        </div>
      </div>
    </div>
  );
}