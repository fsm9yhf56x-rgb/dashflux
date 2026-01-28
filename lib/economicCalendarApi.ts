// Calendrier économique via API gratuite

export interface EconomicEvent {
  date: string;
  country: string;
  event: string;
  actual: number | null;
  forecast: number | null;
  previous: number | null;
  impact: 'High' | 'Medium' | 'Low';
}

// Calendrier fallback (données manuelles)
function getFallbackCalendar(): EconomicEvent[] {
  return [
    {
      date: '2026-01-29',
      country: 'US',
      event: 'FOMC Meeting - Fed Decision',
      actual: null,
      forecast: null,
      previous: null,
      impact: 'High',
    },
    {
      date: '2026-02-05',
      country: 'US',
      event: 'Non-Farm Payrolls',
      actual: null,
      forecast: 180000,
      previous: 216000,
      impact: 'High',
    },
    {
      date: '2026-02-12',
      country: 'US',
      event: 'CPI m/m',
      actual: null,
      forecast: 0.3,
      previous: 0.4,
      impact: 'High',
    },
    {
      date: '2026-03-19',
      country: 'US',
      event: 'FOMC Meeting',
      actual: null,
      forecast: null,
      previous: null,
      impact: 'High',
    },
  ];
}

export async function getUpcomingEconomicEvents(): Promise<EconomicEvent[]> {
  try {
    // Option 1: Essayer Finnhub si clé API disponible
    const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
    
    if (!FINNHUB_KEY || FINNHUB_KEY === 'your_key_here') {
      console.log('No valid Finnhub API key - using fallback calendar');
      return getFallbackCalendar();
    }
    
    const from = new Date().toISOString().split('T')[0];
    const to = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`;
    
    console.log('Fetching economic calendar from Finnhub...');
    
    const response = await fetch(url);
    
    // Vérifier si la réponse est bien du JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Finnhub returned non-JSON response - using fallback');
      return getFallbackCalendar();
    }
    
    const data = await response.json();
    
    if (data.economicCalendar && Array.isArray(data.economicCalendar)) {
      console.log(`Loaded ${data.economicCalendar.length} economic events from Finnhub`);
      
      return data.economicCalendar
        .filter((event: any) => event.country === 'US' && event.impact)
        .map((event: any) => ({
          date: event.date,
          country: event.country,
          event: event.event,
          actual: event.actual,
          forecast: event.estimate,
          previous: event.previous,
          impact: event.impact === 'high' ? 'High' : event.impact === 'medium' ? 'Medium' : 'Low'
        }));
    }
    
    console.log('No economic calendar data from Finnhub - using fallback');
    return getFallbackCalendar();
    
  } catch (error) {
    console.log('Error fetching economic calendar, using fallback:', error instanceof Error ? error.message : 'Unknown error');
    return getFallbackCalendar();
  }
}

export async function calculateCatalystScoreFromCalendar(category: string): Promise<number> {
  const events = await getUpcomingEconomicEvents();
  
  let score = 50;
  
  // Impact par catégorie d'actif
  const categoryImpact: Record<string, string[]> = {
    'bond': ['FOMC', 'CPI', 'Inflation', 'Fed', 'Treasury', 'Rate'],
    'equity': ['NFP', 'GDP', 'Earnings', 'Payrolls', 'Unemployment', 'Employment'],
    'commodity': ['CPI', 'Inflation', 'Oil', 'OPEC', 'Dollar'],
    'currency': ['FOMC', 'Fed', 'GDP', 'Trade', 'Rate'],
    'crypto': ['Regulation', 'SEC', 'ETF', 'Bitcoin'],
  };
  
  const relevantKeywords = categoryImpact[category] || [];
  
  let relevantEventsCount = 0;
  
  events.forEach(event => {
    const daysUntil = Math.floor((new Date(event.date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    
    if (daysUntil < 0 || daysUntil > 90) return; // Événement passé ou trop loin
    
    // Vérifier si l'événement est pertinent
    const isRelevant = relevantKeywords.some(keyword => 
      event.event.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (!isRelevant) return;
    
    relevantEventsCount++;
    
    // Plus l'événement est proche, plus il compte
    const proximityMultiplier = daysUntil < 14 ? 1.5 : daysUntil < 30 ? 1.2 : 1.0;
    
    if (event.impact === 'High') {
      // Analyser si c'est positif ou négatif selon forecast vs previous
      if (event.forecast !== null && event.previous !== null) {
        // Pour bonds : inflation down = good
        if (category === 'bond') {
          if (event.event.toLowerCase().includes('cpi') || event.event.toLowerCase().includes('inflation')) {
            if (event.forecast < event.previous) {
              score += 10 * proximityMultiplier; // Baisse inflation = bon pour bonds
            } else {
              score -= 8 * proximityMultiplier;
            }
          } else if (event.event.toLowerCase().includes('fed') || event.event.toLowerCase().includes('fomc')) {
            score += 8 * proximityMultiplier; // Fed meeting = catalyseur
          }
        }
        // Pour equities : growth up = good
        else if (category === 'equity') {
          if (event.event.toLowerCase().includes('gdp') || event.event.toLowerCase().includes('payroll')) {
            if (event.forecast > event.previous) {
              score += 10 * proximityMultiplier; // Croissance = bon pour actions
            } else {
              score -= 8 * proximityMultiplier;
            }
          }
        }
        // Pour commodities : inflation up = good
        else if (category === 'commodity') {
          if (event.event.toLowerCase().includes('cpi') || event.event.toLowerCase().includes('inflation')) {
            if (event.forecast > event.previous) {
              score += 10 * proximityMultiplier; // Inflation = bon pour commodités
            }
          }
        }
      } else {
        // Pas de forecast, juste marquer comme catalyseur neutre
        score += 5 * proximityMultiplier;
      }
    } else if (event.impact === 'Medium') {
      score += 3 * proximityMultiplier;
    }
  });
  
  console.log(`Catalyst score for ${category}: ${Math.round(score)} (${relevantEventsCount} relevant events)`);
  
  return Math.min(Math.max(Math.round(score), 0), 100);
}