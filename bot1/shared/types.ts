// bot1/shared/types.ts

// ─── Exchange Client ───────────────────────────────────────────────────────────

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ExchangeClient {
  connect(): Promise<void>;
  getPrice(symbol: string): Promise<number>;
  getCandles(symbol: string, timeframe: string, limit: number): Promise<Candle[]>;
  placeMarketOrder(symbol: string, side: 'buy' | 'sell', quantity: number): Promise<string>;
  closePosition(positionId: string): Promise<void>;
}

// ─── Risk Manager ─────────────────────────────────────────────────────────────

export interface RiskConfig {
  maxPositions: number;
  maxRiskPerTrade: number;      // ex: 0.01 = 1% du capital
  maxPositionSize: number;      // ex: 0.10 = 10% du capital
  stopLossMultiplier: number;
  takeProfitMultiplier: number;
  trailingStopDistance: number; // en %
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  usdValue: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: number;
  openedAt: number;
}

export interface Portfolio {
  capital: number;
  availableCapital: number;
  positions: Position[];
  equity: number;
}

export interface Signal {
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
  reason?: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  openedAt: number;
  closedAt: number;
}

// ─── Logger ───────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
}