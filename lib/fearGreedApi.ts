// Fear & Greed Index - CNN Money
// API alternative gratuite

export interface FearGreedData {
  value: number; // 0-100
  rating: string; // Extreme Fear, Fear, Neutral, Greed, Extreme Greed
  previousClose: number;
  oneWeekAgo: number;
  oneMonthAgo: number;
  oneYearAgo: number;
  timestamp: number;
}

export async function getFearGreedIndex(): Promise<number> {
  try {
    // Alternative.me API (gratuite, pas de clé requise)
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      const value = parseInt(data.data[0].value);
      console.log('Fear & Greed Index:', value, data.data[0].value_classification);
      return value;
    }
    
    return 50; // Neutre par défaut
  } catch (error) {
    console.error('Error fetching Fear & Greed:', error);
    return 50;
  }
}

// Pour crypto spécifiquement
export async function getCryptoFearGreed(): Promise<number> {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      return parseInt(data.data[0].value);
    }
    
    return 50;
  } catch (error) {
    console.error('Error fetching Crypto Fear & Greed:', error);
    return 50;
  }
}