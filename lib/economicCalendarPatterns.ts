// Patterns des événements économiques récurrents

export interface EconomicEvent {
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

interface CalendarPattern {
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'fed' | 'ecb' | 'boj' | 'data' | 'earnings' | 'geopolitical';
  country: string;
  assets: string[];
  frequency: 'monthly' | 'quarterly' | 'irregular';
  typicalDayOfMonth?: number;
  typicalTime: string;
}

// Patterns des événements récurrents
const ECONOMIC_PATTERNS: CalendarPattern[] = [
  // === FED ===
  {
    name: 'Réunion FOMC - Décision Taux',
    description: 'Federal Reserve annonce sa décision sur les taux directeurs. Conférence de presse du président à suivre.',
    impact: 'high',
    category: 'fed',
    country: 'United States',
    assets: ['SPY', 'TLT', 'GLD', 'DXY'],
    frequency: 'irregular',
    typicalTime: '14:00 EST'
  },
  {
    name: 'Minutes FOMC',
    description: 'Publication des minutes détaillées de la dernière réunion Fed.',
    impact: 'medium',
    category: 'fed',
    country: 'United States',
    assets: ['TLT', 'SPY'],
    frequency: 'irregular',
    typicalTime: '14:00 EST'
  },
  
  // === US DATA ===
  {
    name: 'Emplois Non-Agricoles (NFP)',
    description: 'Rapport mensuel sur l\'emploi US - indicateur clé de la santé économique.',
    impact: 'high',
    category: 'data',
    country: 'United States',
    assets: ['SPY', 'DXY', 'GLD'],
    frequency: 'monthly',
    typicalDayOfMonth: 1, // Premier vendredi du mois
    typicalTime: '08:30 EST'
  },
  {
    name: 'Inflation CPI',
    description: 'Indice des prix à la consommation - mesure de l\'inflation core et headline.',
    impact: 'high',
    category: 'data',
    country: 'United States',
    assets: ['TLT', 'GLD', 'TIP'],
    frequency: 'monthly',
    typicalDayOfMonth: 12,
    typicalTime: '08:30 EST'
  },
  {
    name: 'Indice PCE',
    description: 'Indice des dépenses de consommation personnelles - indicateur d\'inflation préféré de la Fed.',
    impact: 'high',
    category: 'data',
    country: 'United States',
    assets: ['TLT', 'SPY'],
    frequency: 'monthly',
    typicalDayOfMonth: 28,
    typicalTime: '08:30 EST'
  },
  {
    name: 'Indice ISM Manufacturing',
    description: 'Sentiment manufacturier US - indicateur avancé de l\'activité économique.',
    impact: 'medium',
    category: 'data',
    country: 'United States',
    assets: ['SPY', 'XLI', 'DBC'],
    frequency: 'monthly',
    typicalDayOfMonth: 1,
    typicalTime: '10:00 EST'
  },
  {
    name: 'Ventes Détail',
    description: 'Retail Sales - mesure des dépenses de consommation US.',
    impact: 'medium',
    category: 'data',
    country: 'United States',
    assets: ['SPY', 'XLY', 'XLP'],
    frequency: 'monthly',
    typicalDayOfMonth: 15,
    typicalTime: '08:30 EST'
  },
  {
    name: 'PIB Américain (prelim)',
    description: 'Produit Intérieur Brut - première estimation trimestrielle.',
    impact: 'high',
    category: 'data',
    country: 'United States',
    assets: ['SPY', 'DXY'],
    frequency: 'quarterly',
    typicalTime: '08:30 EST'
  },
  {
    name: 'Confiance Consommateur',
    description: 'University of Michigan Consumer Sentiment - indicateur de la consommation future.',
    impact: 'medium',
    category: 'data',
    country: 'United States',
    assets: ['SPY', 'XLY'],
    frequency: 'monthly',
    typicalDayOfMonth: 10,
    typicalTime: '10:00 EST'
  },
  {
    name: 'Production Industrielle',
    description: 'Mesure de la production des usines, mines et services publics US.',
    impact: 'low',
    category: 'data',
    country: 'United States',
    assets: ['SPY', 'XLI'],
    frequency: 'monthly',
    typicalDayOfMonth: 16,
    typicalTime: '09:15 EST'
  },
  
  // === BCE ===
  {
    name: 'Réunion BCE - Décision Taux',
    description: 'Banque Centrale Européenne annonce sa décision de politique monétaire.',
    impact: 'high',
    category: 'ecb',
    country: 'Euro Area',
    assets: ['EFA', 'FXE', 'EWG'],
    frequency: 'irregular',
    typicalTime: '13:45 CET'
  },
  {
    name: 'Inflation Zone Euro',
    description: 'Indice des prix à la consommation harmonisé (IPCH) - inflation de la zone euro.',
    impact: 'high',
    category: 'data',
    country: 'Euro Area',
    assets: ['FXE', 'EFA'],
    frequency: 'monthly',
    typicalDayOfMonth: 1,
    typicalTime: '11:00 CET'
  },
  {
    name: 'PMI Zone Euro',
    description: 'Indice composite PMI - indicateur d\'activité économique européenne.',
    impact: 'medium',
    category: 'data',
    country: 'Euro Area',
    assets: ['EFA', 'FXE'],
    frequency: 'monthly',
    typicalDayOfMonth: 23,
    typicalTime: '10:00 CET'
  },
  
  // === BOJ ===
  {
    name: 'Réunion BOJ',
    description: 'Bank of Japan - Décision de politique monétaire et Yield Curve Control.',
    impact: 'high',
    category: 'boj',
    country: 'Japan',
    assets: ['EWJ', 'FXY'],
    frequency: 'irregular',
    typicalTime: '12:00 JST'
  },
  
  // === ENERGIE ===
  {
    name: 'Stocks Pétrole EIA',
    description: 'Inventaires hebdomadaires de pétrole brut US - impact direct sur prix énergie.',
    impact: 'low',
    category: 'data',
    country: 'United States',
    assets: ['USO', 'XLE'],
    frequency: 'monthly',
    typicalTime: '10:30 EST'
  }
];

// ========================================
// DATES OFFICIELLES 2025
// ========================================

// Sources officielles des banques centrales
const FOMC_MEETINGS_2025 = [
  new Date('2025-01-29T14:00:00'),
  new Date('2025-03-19T14:00:00'),
  new Date('2025-05-07T14:00:00'),
  new Date('2025-06-18T14:00:00'),
  new Date('2025-07-30T14:00:00'),
  new Date('2025-09-17T14:00:00'),
  new Date('2025-11-05T14:00:00'),
  new Date('2025-12-17T14:00:00')
];

const ECB_MEETINGS_2025 = [
  new Date('2025-01-30T13:45:00'),
  new Date('2025-03-06T13:45:00'),
  new Date('2025-04-17T13:45:00'),
  new Date('2025-06-05T13:45:00'),
  new Date('2025-07-24T13:45:00'),
  new Date('2025-09-11T13:45:00'),
  new Date('2025-10-30T13:45:00'),
  new Date('2025-12-18T13:45:00')
];

const BOJ_MEETINGS_2025 = [
  new Date('2025-01-24T12:00:00'),
  new Date('2025-03-19T12:00:00'),
  new Date('2025-04-25T12:00:00'),
  new Date('2025-06-13T12:00:00'),
  new Date('2025-07-31T12:00:00'),
  new Date('2025-09-19T12:00:00'),
  new Date('2025-10-31T12:00:00'),
  new Date('2025-12-19T12:00:00')
];

// ========================================
// HELPER FUNCTIONS
// ========================================

function getFirstFridayOfMonth(date: Date): Date {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const firstFriday = new Date(firstDay);
  firstFriday.setDate(1 + daysUntilFriday);
  firstFriday.setHours(8, 30, 0, 0); // 8:30 EST
  return firstFriday;
}

function getNthBusinessDay(date: Date, n: number): Date {
  let count = 0;
  let current = new Date(date.getFullYear(), date.getMonth(), 1);
  
  while (count < n) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Pas weekend
      count++;
    }
    if (count < n) {
      current.setDate(current.getDate() + 1);
    }
  }
  
  return current;
}

function getLastFridayOfMonth(date: Date): Date {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const dayOfWeek = lastDay.getDay();
  const daysToSubtract = (dayOfWeek + 2) % 7;
  const lastFriday = new Date(lastDay);
  lastFriday.setDate(lastDay.getDate() - daysToSubtract);
  return lastFriday;
}

// ========================================
// MAIN FUNCTION
// ========================================

export function generatePredictiveCalendar(daysAhead: number = 60): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(today.getDate() + daysAhead);
  
  // 1. AJOUTER LES RÉUNIONS FOMC (dates officielles)
  FOMC_MEETINGS_2025.forEach(date => {
    if (date >= today && date <= endDate) {
      const pattern = ECONOMIC_PATTERNS.find(p => p.name.includes('FOMC') && p.name.includes('Décision'));
      if (pattern) {
        events.push({
          id: `fomc-${date.toISOString()}`,
          date,
          time: pattern.typicalTime,
          title: pattern.name,
          description: pattern.description,
          impact: pattern.impact,
          category: pattern.category,
          country: pattern.country,
          assets: pattern.assets,
          source: 'predictive'
        });
        
        // Ajouter les Minutes FOMC (3 semaines après)
        const minutesDate = new Date(date);
        minutesDate.setDate(date.getDate() + 21);
        if (minutesDate <= endDate) {
          const minutesPattern = ECONOMIC_PATTERNS.find(p => p.name.includes('Minutes'));
          if (minutesPattern) {
            events.push({
              id: `fomc-minutes-${minutesDate.toISOString()}`,
              date: minutesDate,
              time: minutesPattern.typicalTime,
              title: minutesPattern.name,
              description: minutesPattern.description,
              impact: minutesPattern.impact,
              category: minutesPattern.category,
              country: minutesPattern.country,
              assets: minutesPattern.assets,
              source: 'predictive'
            });
          }
        }
      }
    }
  });
  
  // 2. AJOUTER LES RÉUNIONS BCE (dates officielles)
  ECB_MEETINGS_2025.forEach(date => {
    if (date >= today && date <= endDate) {
      const pattern = ECONOMIC_PATTERNS.find(p => p.category === 'ecb');
      if (pattern) {
        events.push({
          id: `ecb-${date.toISOString()}`,
          date,
          time: pattern.typicalTime,
          title: pattern.name,
          description: pattern.description,
          impact: pattern.impact,
          category: pattern.category,
          country: pattern.country,
          assets: pattern.assets,
          source: 'predictive'
        });
      }
    }
  });
  
  // 3. AJOUTER LES RÉUNIONS BOJ (dates officielles)
  BOJ_MEETINGS_2025.forEach(date => {
    if (date >= today && date <= endDate) {
      const pattern = ECONOMIC_PATTERNS.find(p => p.category === 'boj');
      if (pattern) {
        events.push({
          id: `boj-${date.toISOString()}`,
          date,
          time: pattern.typicalTime,
          title: pattern.name,
          description: pattern.description,
          impact: pattern.impact,
          category: pattern.category,
          country: pattern.country,
          assets: pattern.assets,
          source: 'predictive'
        });
      }
    }
  });
  
  // 4. AJOUTER LES ÉVÉNEMENTS MENSUELS (CPI, NFP, etc.)
  const monthlyEvents = ECONOMIC_PATTERNS.filter(p => p.frequency === 'monthly');
  
  for (let month = 0; month < 3; month++) {
    const targetDate = new Date(today);
    targetDate.setMonth(today.getMonth() + month);
    
    monthlyEvents.forEach(pattern => {
      let eventDate: Date;
      
      if (pattern.name.includes('NFP') || pattern.name.includes('Emplois')) {
        // Premier vendredi du mois
        eventDate = getFirstFridayOfMonth(targetDate);
      } else if (pattern.name.includes('ISM')) {
        // Premier jour ouvrable du mois
        eventDate = getNthBusinessDay(targetDate, 1);
        eventDate.setHours(10, 0, 0, 0);
      } else if (pattern.typicalDayOfMonth) {
        eventDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), pattern.typicalDayOfMonth);
        const [hours, minutes] = pattern.typicalTime.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes.split(' ')[0]), 0, 0);
      } else {
        return;
      }
      
      if (eventDate >= today && eventDate <= endDate) {
        events.push({
          id: `${pattern.name.toLowerCase().replace(/\s+/g, '-')}-${eventDate.toISOString()}`,
          date: eventDate,
          time: pattern.typicalTime,
          title: pattern.name,
          description: pattern.description,
          impact: pattern.impact,
          category: pattern.category,
          country: pattern.country,
          assets: pattern.assets,
          source: 'predictive'
        });
      }
    });
  }
  
  // 5. AJOUTER LES ÉVÉNEMENTS TRIMESTRIELS (PIB)
  const quarterlyEvents = ECONOMIC_PATTERNS.filter(p => p.frequency === 'quarterly');
  const quarters = [
    { month: 0, day: 26 },  // Q4 2024 - fin janvier
    { month: 3, day: 25 },  // Q1 2025 - fin avril
    { month: 6, day: 24 },  // Q2 2025 - fin juillet
    { month: 9, day: 30 }   // Q3 2025 - fin octobre
  ];
  
  quarters.forEach(({ month, day }) => {
    const eventDate = new Date(today.getFullYear(), month, day);
    eventDate.setHours(8, 30, 0, 0);
    
    if (eventDate >= today && eventDate <= endDate) {
      quarterlyEvents.forEach(pattern => {
        events.push({
          id: `${pattern.name.toLowerCase().replace(/\s+/g, '-')}-${eventDate.toISOString()}`,
          date: eventDate,
          time: pattern.typicalTime,
          title: pattern.name,
          description: pattern.description,
          impact: pattern.impact,
          category: pattern.category,
          country: pattern.country,
          assets: pattern.assets,
          source: 'predictive'
        });
      });
    }
  });
  
  // Trier par date
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Export des patterns pour utilisation externe
export { ECONOMIC_PATTERNS };
