'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface DashFluxSettings {
  // Notifications
  emailNotifications: boolean;
  scoreAlerts: boolean;
  weeklyDigest: boolean;
  
  // Affichage
  theme: 'auto' | 'light' | 'dark';
  showEmergentFirst: boolean;
  
  // Données
  refreshInterval: number; // en secondes
  cacheEnabled: boolean;
  
  // Seuils personnalisés
  accumulateThreshold: number;
  watchThreshold: number;
  holdThreshold: number;
  trimThreshold: number;
}

// Valeurs par défaut (méthodologie Steffan)
export const DEFAULT_SETTINGS: DashFluxSettings = {
  emailNotifications: true,
  scoreAlerts: false,
  weeklyDigest: true,
  
  theme: 'auto',
  showEmergentFirst: true,
  
  refreshInterval: 3600, // 1 heure
  cacheEnabled: true,
  
  accumulateThreshold: 80,
  watchThreshold: 65,
  holdThreshold: 45,
  trimThreshold: 30,
};

// Context
interface SettingsContextType {
  settings: DashFluxSettings;
  updateSettings: (newSettings: Partial<DashFluxSettings>) => void;
  resetSettings: () => void;
  saveSettings: () => Promise<void>;
  getRecommendation: (score: number) => 'ACCUMULATE' | 'WATCH' | 'HOLD' | 'TRIM' | 'AVOID';
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DashFluxSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les settings au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  // Charger depuis localStorage
  const loadSettings = () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoaded(true);
        return;
      }

      const stored = localStorage.getItem('dashflux_settings');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoaded(true);
    }
  };

  // Mettre à jour les settings
  const updateSettings = (newSettings: Partial<DashFluxSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Sauvegarde immédiate dans localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('dashflux_settings', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      
      return updated;
    });
  };

  // Reset aux valeurs par défaut
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashflux_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  // Sauvegarder (pour compatibilité future avec API)
  const saveSettings = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashflux_settings', JSON.stringify(settings));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving settings:', error);
      return Promise.reject(error);
    }
  };

  // Calculer la recommandation selon les seuils personnalisés
  const getRecommendation = (score: number): 'ACCUMULATE' | 'WATCH' | 'HOLD' | 'TRIM' | 'AVOID' => {
    if (score >= settings.accumulateThreshold) return 'ACCUMULATE';
    if (score >= settings.watchThreshold) return 'WATCH';
    if (score >= settings.holdThreshold) return 'HOLD';
    if (score >= settings.trimThreshold) return 'TRIM';
    return 'AVOID';
  };

  // Ne pas render avant le chargement pour éviter le flash
  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        saveSettings,
        getRecommendation,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook pour utiliser les settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook pour avoir juste les seuils (optimisation)
export function useThresholds() {
  const { settings } = useSettings();
  return {
    accumulate: settings.accumulateThreshold,
    watch: settings.watchThreshold,
    hold: settings.holdThreshold,
    trim: settings.trimThreshold,
  };
}

// Hook pour la recommandation
export function useRecommendation(score: number) {
  const { getRecommendation } = useSettings();
  return getRecommendation(score);
}