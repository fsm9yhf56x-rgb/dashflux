// Fusion intelligente du calendrier prédictif et Trading Economics

import { EconomicEvent, generatePredictiveCalendar } from './economicCalendarPatterns';
import { fetchTradingEconomicsCalendar } from './tradingEconomicsApi';

/**
 * Stratégie de fusion intelligente:
 * 
 * 1. Base: Calendrier prédictif (toujours disponible, gratuit)
 * 2. Enrichissement: Trading Economics API (si clé API disponible)
 * 
 * Fusion:
 * - Si API disponible: enrichir les événements prédictifs avec actual/forecast
 * - Conserver les événements prédictifs si pas de match API
 * - Ajouter les événements API uniquement s'ils sont nouveaux
 */

// Normaliser le titre pour le matching (ignorer la casse et ponctuation)
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Vérifier si deux événements sont similaires (même jour + même type général)
function areSimilarEvents(event1: EconomicEvent, event2: EconomicEvent): boolean {
  // Même jour
  const sameDay = 
    event1.date.getDate() === event2.date.getDate() &&
    event1.date.getMonth() === event2.date.getMonth() &&
    event1.date.getFullYear() === event2.date.getFullYear();
  
  if (!sameDay) return false;
  
  // Matching par mots-clés dans le titre
  const title1 = normalizeTitle(event1.title);
  const title2 = normalizeTitle(event2.title);
  
  // Cas évidents
  if (title1 === title2) return true;
  
  // Mots-clés importants
  const keywords = [
    'fomc', 'fed', 'interest rate',
    'ecb', 'european central bank',
    'boj', 'bank of japan',
    'nfp', 'payroll', 'employment',
    'cpi', 'inflation',
    'pce',
    'gdp',
    'ism', 'manufacturing',
    'retail sales'
  ];
  
  for (const keyword of keywords) {
    if (title1.includes(keyword) && title2.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

// Fusionner deux événements (prendre le meilleur de chaque)
function mergeEvents(predictive: EconomicEvent, api: EconomicEvent): EconomicEvent {
  return {
    ...predictive, // Base prédictive
    id: api.id, // ID de l'API
    date: api.date, // Date exacte de l'API
    time: api.time, // Heure exacte de l'API
    title: api.title, // Titre de l'API
    actual: api.actual, // Données réelles
    forecast: api.forecast, // Prévisions
    previous: api.previous, // Valeurs précédentes
    source: 'api' as const // Marquer comme enrichi
  };
}

// Fonction principale de fusion
export async function getEconomicCalendar(daysAhead: number = 60): Promise<EconomicEvent[]> {
  console.log('🗓️  Génération du calendrier économique...');
  
  // 1. Toujours générer le calendrier prédictif (gratuit, toujours dispo)
  const predictiveEvents = generatePredictiveCalendar(daysAhead);
  console.log(`✅ Calendrier prédictif: ${predictiveEvents.length} événements`);
  
  // 2. Tenter de récupérer Trading Economics (si API key existe)
  const apiKey = process.env.TRADING_ECONOMICS_API_KEY;
  
  if (!apiKey) {
    console.log('ℹ️  Trading Economics non configuré, utilisation du calendrier prédictif uniquement');
    return predictiveEvents;
  }
  
  try {
    const apiEvents = await fetchTradingEconomicsCalendar(daysAhead);
    
    if (apiEvents.length === 0) {
      console.log('⚠️  Trading Economics ne retourne aucun événement, utilisation du prédictif');
      return predictiveEvents;
    }
    
    console.log(`✅ Trading Economics: ${apiEvents.length} événements`);
    
    // 3. Fusion intelligente
    const mergedEvents: EconomicEvent[] = [];
    const usedApiIds = new Set<string>();
    
    // Pour chaque événement prédictif, chercher un match dans l'API
    for (const predictiveEvent of predictiveEvents) {
      const matchingApiEvent = apiEvents.find(apiEvent => 
        !usedApiIds.has(apiEvent.id) && 
        areSimilarEvents(predictiveEvent, apiEvent)
      );
      
      if (matchingApiEvent) {
        // Match trouvé: fusionner
        mergedEvents.push(mergeEvents(predictiveEvent, matchingApiEvent));
        usedApiIds.add(matchingApiEvent.id);
      } else {
        // Pas de match: garder le prédictif
        mergedEvents.push(predictiveEvent);
      }
    }
    
    // 4. Ajouter les événements API non matchés (nouveaux événements découverts)
    const newApiEvents = apiEvents.filter(apiEvent => !usedApiIds.has(apiEvent.id));
    mergedEvents.push(...newApiEvents);
    
    // 5. Trier par date
    const finalEvents = mergedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const enrichedCount = finalEvents.filter(e => e.source === 'api').length;
    console.log(`✅ Calendrier fusionné: ${finalEvents.length} événements (${enrichedCount} enrichis par API)`);
    
    return finalEvents;
    
  } catch (error) {
    console.error('❌ Erreur Trading Economics, fallback sur prédictif:', error);
    return predictiveEvents;
  }
}

// Export du type pour utilisation externe
export type { EconomicEvent };
