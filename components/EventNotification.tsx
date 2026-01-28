'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

interface EconomicEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  assets: string[];
}

interface NotificationProps {
  event: EconomicEvent;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number; // en ms
}

function EventNotificationToast({ event, onClose, autoClose = true, autoCloseDelay = 10000 }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Auto-fermeture
  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoCloseDelay) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getImpactColor = () => {
    switch (event.impact) {
      case 'high': return 'border-red-500 bg-white dark:bg-gray-800';
      case 'medium': return 'border-orange-500 bg-white dark:bg-gray-800';
      case 'low': return 'border-green-500 bg-white dark:bg-gray-800';
      default: return 'border-blue-500 bg-white dark:bg-gray-800';
    }
  };

  const getImpactIcon = () => {
    if (event.impact === 'high') {
      return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    return <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  };

  const impactLabel = event.impact === 'high' ? 'Événement Majeur' : 'Événement';

  return (
    <div 
      className={`fixed right-4 z-50 w-96 shadow-2xl rounded-lg border-l-4 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${getImpactColor()}`}
      style={{ opacity: 0.95 }}
    >
      {/* Progress bar */}
      {autoClose && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getImpactIcon()}
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {impactLabel}
            </h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
          {event.title}
        </h4>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {event.time}
        </p>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {event.description}
        </p>

        {event.assets && event.assets.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Actifs impactés:
            </span>
            {event.assets.slice(0, 4).map((asset) => (
              <span key={asset} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-mono">
                {asset}
              </span>
            ))}
            {event.assets.length > 4 && (
              <span className="text-xs text-gray-500">
                +{event.assets.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <a href="/calendrier" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1" onClick={handleClose}>
            <span>Voir tous les événements</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default EventNotificationToast;