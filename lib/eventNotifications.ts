interface EconomicEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  country: string;
  assets: string[];
}

const BASE_EVENTS = [
  {
    time: '14:00 EST',
    title: 'Réunion FOMC - Décision Taux',
    description: 'Annonce de la décision sur les taux directeurs par la Fed. Conférence de presse de Jerome Powell à suivre.',
    impact: 'high' as const,
    category: 'fed',
    country: 'US',
    assets: ['SPY', 'TLT', 'GLD', 'DXY']
  },
  {
    time: '08:30 EST',
    title: 'Emplois Non-Agricoles (NFP)',
    description: 'Publication du rapport mensuel sur l\'emploi US - indicateur clé de la santé économique.',
    impact: 'high' as const,
    category: 'data',
    country: 'US',
    assets: ['SPY', 'DXY', 'GLD']
  },
  {
    time: '08:30 EST',
    title: 'Inflation CPI',
    description: 'Indice des prix à la consommation - mesure de l\'inflation core et headline.',
    impact: 'high' as const,
    category: 'data',
    country: 'US',
    assets: ['TLT', 'GLD', 'TIP']
  },
  {
    time: '07:45 CET',
    title: 'Réunion BCE - Décision Taux',
    description: 'Banque Centrale Européenne annonce sa décision de politique monétaire.',
    impact: 'high' as const,
    category: 'ecb',
    country: 'EU',
    assets: ['EFA', 'FXE', 'EWG']
  },
  {
    time: '10:00 EST',
    title: 'Indice ISM Manufacturing',
    description: 'Sentiment manufacturier US - indicateur avancé de l\'activité économique.',
    impact: 'medium' as const,
    category: 'data',
    country: 'US',
    assets: ['SPY', 'XLI', 'DBC']
  }
];

function generateEvents(): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const today = new Date();
  
  const eventDates = [
    { day: 0, events: [0, 1] },
    { day: 3, events: [2] },
    { day: 7, events: [3] },
    { day: 14, events: [4] }
  ];

  eventDates.forEach(({ day, events: eventIndices }) => {
    eventIndices.forEach(idx => {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + day);
      eventDate.setHours(0, 0, 0, 0);
      
      events.push({
        id: `${day}-${idx}`,
        date: eventDate,
        ...BASE_EVENTS[idx]
      });
    });
  });

  return events;
}

function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  return today.getTime() === eventDate.getTime();
}

// ✅ BIEN EXPORTER ICI
export function getTodayEvents(): EconomicEvent[] {
  const allEvents = generateEvents();
  return allEvents.filter(event => isToday(event.date));
}

export function hasSeenNotificationToday(eventId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const today = new Date().toISOString().split('T')[0];
  const key = `notification-seen-${eventId}-${today}`;
  return localStorage.getItem(key) === 'true';
}

export function markNotificationAsSeen(eventId: string): void {
  if (typeof window === 'undefined') return;
  
  const today = new Date().toISOString().split('T')[0];
  const key = `notification-seen-${eventId}-${today}`;
  localStorage.setItem(key, 'true');
}

export function cleanOldNotifications(): void {
  if (typeof window === 'undefined') return;
  
  const today = new Date().toISOString().split('T')[0];
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('notification-seen-') && !key.includes(today)) {
      localStorage.removeItem(key);
    }
  });
}