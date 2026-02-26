// bot1/standalone/config.ts

export const BOT1_CONFIG = {
  // Trading Parameters
  buyScoreThreshold: 75,        // Achète si score > 75
  sellScoreThreshold: 60,       // Vend si score < 60
  strongBuyThreshold: 80,       // Signal fort si score > 80
  
  // Position Management
  maxPositions: 5,              // Max 5 positions simultanées
  capitalPerTrade: 0.20,        // 20% du capital par trade
  
  // Risk Management
  stopLossPercent: 5,           // Stop-loss à -5%
  takeProfitPercent: 15,        // Take-profit à +15%
  trailingStopPercent: 3,       // Trailing stop à 3%
  
  // Timing
  checkIntervalMs: 60 * 60 * 1000,  // Check toutes les heures
  
  // API
  dashfluxApiUrl: 'http://localhost:3000',
  
  // Exchange
  exchangeType: 'hyperliquid' as const,
  testnet: true,
  
  // Initial Capital
  initialCapital: 1000,         // $1000 paper trading
};

export type Bot1Config = typeof BOT1_CONFIG;