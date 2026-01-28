// Trading Economics API (optionnel, pour enrichir le calendrier prédictif)

import { EconomicEvent } from './economicCalendarPatterns';

interface TradingEconomicsEvent {
  CalendarId: string;
  Date: string;
  Country: string;
  Category: string;
  Event: string;
  Importance: number;
  Actual: string | null;
  Forecast: string | null;
  Previous: string | null;
  TEForecast: string | null;
}

// Mapping des catégories TE vers nos catégories
function mapCategory(teCategory: string, event: string): EconomicEvent['category'] {
  const eventLower = event.toLowerCase();
  
  if (eventLower.includes('fed') || eventLower.includes('fomc') || eventLower.includes('interest rate decision')) {
    return 'fed';
  }
  if (eventLower.includes('ecb') || eventLower.includes('european central bank')) {
    return 'ecb';
  }
  if (eventLower.includes('boj') || eventLower.includes('bank of japan')) {
    return 'boj';
  }
  if (eventLower.includes('earnings') || eventLower.includes('results')) {
    return 'earnings';
  }
  if (eventLower.includes('election') || eventLower.includes('referendum')) {
    return 'geopolitical';
  }
  
  return 'data';
}

// Mapping de l'importance (1-3) vers notre impact
function mapImpact(importance: number): EconomicEvent['impact'] {
  if (importance === 3) return 'high';
  if (importance === 2) return 'medium';
  return 'low';
}

// Déterminer les actifs impactés
function getImpactedAssets(category: EconomicEvent['category'], country: string, event: string): string[] {
  const eventLower = event.toLowerCase();
  
  // Fed events
  if (category === 'fed') {
    return ['SPY', 'TLT', 'GLD', 'DXY'];
  }
  
  // ECB events
  if (category === 'ecb') {
    return ['EFA', 'FXE', 'EWG'];
  }
  
  // BOJ events
  if (category === 'boj') {
    return ['EWJ', 'FXY'];
  }
  
  // CPI / Inflation
  if (eventLower.includes('cpi') || eventLower.includes('inflation')) {
    return ['TLT', 'GLD', 'TIP'];
  }
  
  // Emploi
  if (eventLower.includes('employment') || eventLower.includes('nfp') || eventLower.includes('payroll')) {
    return ['SPY', 'DXY', 'GLD'];
  }
  
  // Manufacturing / PMI
  if (eventLower.includes('pmi') || eventLower.includes('manufacturing')) {
    return ['SPY', 'XLI', 'DBC'];
  }
  
  // Oil / Energy
  if (eventLower.includes('oil') || eventLower.includes('crude') || eventLower.includes('petroleum')) {
    return ['USO', 'XLE'];
  }
  
  // Retail
  if (eventLower.includes('retail') || eventLower.includes('sales')) {
    return ['SPY', 'XLY', 'XLP'];
  }
  
  // Default par pays
  if (country === 'United States') return ['SPY', 'DXY'];
  if (country === 'Euro Area' || country === 'Germany') return ['EFA', 'FXE'];
  if (country === 'Japan') return ['EWJ', 'FXY'];
  if (country === 'China') return ['FXI', 'EEM'];
  
  return ['SPY'];
}

// Générer une description enrichie
function generateDescription(event: TradingEconomicsEvent): string {
  const eventLower = event.Event.toLowerCase();
  
  // Descriptions spécifiques
  if (eventLower.includes('cpi')) {
    return 'Indice des prix à la consommation - Mesure clé de l\'inflation. Impact direct sur les décisions de politique monétaire.';
  }
  if (eventLower.includes('nfp') || eventLower.includes('payroll')) {
    return 'Emplois non-agricoles US - Indicateur majeur de la santé du marché du travail américain.';
  }
  if (eventLower.includes('fomc') || eventLower.includes('interest rate')) {
    return 'Décision sur les taux directeurs. Conférence de presse du président de la Fed à suivre.';
  }
  if (eventLower.includes('gdp')) {
    return 'Produit Intérieur Brut - Mesure la croissance économique globale.';
  }
  if (eventLower.includes('pmi')) {
    return 'Indice des directeurs d\'achat - Indicateur avancé de l\'activité économique.';
  }
  if (eventLower.includes('retail')) {
    return 'Ventes au détail - Mesure des dépenses de consommation, moteur de la croissance.';
  }
  
  // Description générique
  return `${event.Category} - ${event.Country}`;
}

export async function fetchTradingEconomicsCalendar(daysAhead: number = 30): Promise<EconomicEvent[]> {
  const apiKey = process.env.TRADING_ECONOMICS_API_KEY;
  
  if (!apiKey) {
    console.log('Trading Economics API key non configurée');
    return [];
  }

  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysAhead);
    
    const startStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const url = `https://api.tradingeconomics.com/calendar/country/all/${startStr}/${endStr}?c=${apiKey}`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache 1h
    });
    
    if (!response.ok) {
      console.error('Erreur Trading Economics:', response.status);
      return [];
    }
    
    const data: TradingEconomicsEvent[] = await response.json();
    
    // Filtrer et transformer
    const events: EconomicEvent[] = data
      .filter(e => e.Importance >= 2) // Seulement medium et high
      .map(e => {
        const date = new Date(e.Date);
        const category = mapCategory(e.Category, e.Event);
        
        return {
          id: `te-${e.CalendarId}`,
          date,
          time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          title: e.Event,
          description: generateDescription(e),
          impact: mapImpact(e.Importance),
          category,
          country: e.Country,
          assets: getImpactedAssets(category, e.Country, e.Event),
          actual: e.Actual || undefined,
          forecast: e.Forecast || e.TEForecast || undefined,
          previous: e.Previous || undefined,
          source: 'api' as const
        };
      })
      .filter(e => 
        // Filtrer les événements pertinents
        ['United States', 'Euro Area', 'Germany', 'Japan', 'China', 'United Kingdom'].includes(e.country)
      );
    
    console.log(`Trading Economics: ${events.length} événements récupérés`);
    return events;
    
  } catch (error) {
    console.error('Erreur fetch Trading Economics:', error);
    return [];
  }
}
