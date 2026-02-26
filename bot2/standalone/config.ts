// bot2/standalone/config.ts
import { BotConfig, RiskConfig, RLConfig } from '../shared/types';
import * as dotenv from 'dotenv';

dotenv.config();

export const RISK_CONFIG: RiskConfig = {
  maxRiskPerTrade: 0.02,        // 2% per trade
  maxPositionSize: 0.30,        // 30% of capital max
  maxPositions: 3,              // Max 3 concurrent positions
  stopLossMultiplier: 2,        // 2x ATR for stop-loss
  takeProfitMultiplier: 4,      // 4x ATR for take-profit (R:R 1:2)
  trailingStopDistance: 2       // 2% trailing stop
};

export const RL_CONFIG: RLConfig = {
  epsilon: 0.3,                 // 30% exploration
  epsilonDecay: 0.9995,         // Decay rate
  epsilonMin: 0.05,             // Min 5% exploration
  alpha: 0.1,                   // Learning rate
  gamma: 0.95                   // Discount factor
};

export const BOT2_CONFIG: BotConfig = {
  mode: (process.env.BOT2_MODE as 'paper' | 'live') || 'paper',
  exchange: 'hyperliquid',
  network: 'arbitrum',
  tradingPairs: ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA'],
  timeframe: '4h',
  checkInterval: parseInt(process.env.BOT2_CHECK_INTERVAL || '14400000'), // 4 hours
  initialCapital: parseInt(process.env.BOT2_INITIAL_CAPITAL || '100'),
  riskConfig: RISK_CONFIG,
  rlConfig: RL_CONFIG
};

export function validateConfig(): boolean {
  if (BOT2_CONFIG.initialCapital <= 0) {
    console.error('[Config] Initial capital must be positive');
    return false;
  }

  if (RISK_CONFIG.maxRiskPerTrade <= 0 || RISK_CONFIG.maxRiskPerTrade > 1) {
    console.error('[Config] Max risk per trade must be between 0 and 1');
    return false;
  }

  if (RISK_CONFIG.maxPositions <= 0) {
    console.error('[Config] Max positions must be positive');
    return false;
  }

  return true;
}

export function printConfig() {
  console.log('[Config] Configuration validated ✓');
  console.log('='.repeat(80));
  console.log('BOT 2 CONFIGURATION - Standalone Adaptive Bot');
  console.log('='.repeat(80));
  console.log(`Mode:              ${BOT2_CONFIG.mode.toUpperCase()}`);
  console.log(`Exchange:          ${BOT2_CONFIG.exchange}`);
  console.log(`Network:           ${BOT2_CONFIG.network}`);
  console.log(`Initial Capital:   $${BOT2_CONFIG.initialCapital}`);
  console.log(`Timeframe:         ${BOT2_CONFIG.timeframe}`);
  console.log('='.repeat(80));
}