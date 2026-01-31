'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface EconomicEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'fed' | 'ecb' | 'boj' | 'data' | 'earnings' | 'geopolitical';
  country: string;
  assets: string[];
  actual?: string;
  forecast?: string;
  previous?: string;
  source: 'predictive' | 'api';
}

export default function CalendrierPage() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar');
      const data = await response.json();
      
      const eventsWithDates = data.map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
      
      setEvents(eventsWithDates);
    } catch (error) {
      console.error('Erreur chargement calendrier:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    if (selectedImpact !== 'all' && event.impact !== selectedImpact) return false;
    return true;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'medium': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fed': return '🏦';
      case 'ecb': return '🇪🇺';
      case 'boj': return '🇯🇵';
      case 'data': return '📊';
      case 'earnings': return '💰';
      case 'geopolitical': return '🌍';
      default: return '📅';
    }
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Demain';
    if (diff < 7) return `Dans ${diff} jours`;
    if (diff < 14) return 'Cette semaine';
    return `Dans ${diff} jours`;
  };

  const apiEventsCount = events.filter(e => e.source === 'api').length;
  const predictiveEventsCount = events.filter(e => e.source === 'predictive').length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Calendrier Économique
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Événements majeurs à surveiller pour vos décisions d'investissement
              </p>
            </div>
            
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {!loading && events.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
              {apiEventsCount > 0 ? (
                <>
                  <span className="font-bold">✅ Trading Economics connecté</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    • {apiEventsCount} événements avec données réelles
                    • {predictiveEventsCount} événements prédictifs
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold">Mode prédictif</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    • Calendrier basé sur les dates officielles Fed/BCE/BOJ
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type d'événement
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="fed">🏦 Fed (FOMC)</option>
                <option value="ecb">🇪🇺 BCE</option>
                <option value="boj">🇯🇵 BOJ</option>
                <option value="data">📊 Données économiques</option>
                <option value="earnings">💰 Résultats entreprises</option>
                <option value="geopolitical">🌍 Géopolitique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impact sur les marchés
              </label>
              <select
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les impacts</option>
                <option value="high">🔴 Impact élevé</option>
                <option value="medium">🟠 Impact moyen</option>
                <option value="low">🟢 Impact faible</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement du calendrier...</p>
          </div>
        )}

        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{filteredEvents.length}</strong> événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 relative"
              >
                {event.source === 'api' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                      ✓ Données réelles
                    </span>
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl sm:text-3xl lg:text-4xl">{getCategoryIcon(event.category)}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getImpactColor(event.impact)}`}>
                          {event.impact === 'high' && '🔴 Impact Élevé'}
                          {event.impact === 'medium' && '🟠 Impact Moyen'}
                          {event.impact === 'low' && '🟢 Impact Faible'}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="font-medium">
                            {event.date.toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>

                        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                          {event.country}
                        </div>
                      </div>

                      {(event.forecast || event.actual || event.previous) && (
                        <div className="mt-3 flex gap-4 text-sm">
                          {event.previous && (
                            <div>
                              <span className="text-gray-500">Précédent: </span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{event.previous}</span>
                            </div>
                          )}
                          {event.forecast && (
                            <div>
                              <span className="text-gray-500">Prévision: </span>
                              <span className="font-medium text-blue-600 dark:text-blue-400">{event.forecast}</span>
                            </div>
                          )}
                          {event.actual && (
                            <div>
                              <span className="text-gray-500">Réel: </span>
                              <span className="font-bold text-green-600 dark:text-green-400">{event.actual}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Actifs impactés:
                          </span>
                          {event.assets.map((asset) => (
                            <span
                              key={asset}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-mono"
                            >
                              {asset}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Dans</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {getDaysUntil(event.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aucun événement ne correspond à vos filtres
            </p>
          </div>
        )}

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Comment utiliser ce calendrier
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>• <strong>Impact Élevé</strong> : Peut créer des mouvements de marché de 1-3%+ en une journée</li>
            <li>• <strong>Impact Moyen</strong> : Influence graduelle sur le sentiment et les tendances</li>
            <li>• <strong>Impact Faible</strong> : Information utile mais effet limité sur les prix</li>
            <li>• Préparez vos positions <strong>avant</strong> l'événement pour éviter la volatilité</li>
            <li>• Les données sont mises à jour toutes les heures</li>
            {apiEventsCount > 0 && (
              <li>• Les événements marqués <strong>"✓ Données réelles"</strong> incluent forecast/actual/previous</li>
            )}
          </ul>
        </div>

        {predictiveEventsCount > 0 && apiEventsCount === 0 && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">
      
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
            
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
             <a href="https://tradingeconomics.com/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline"></a> 
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
