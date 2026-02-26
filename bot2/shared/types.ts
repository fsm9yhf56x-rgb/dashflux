// bot2/shared/types.ts
// Types partagés pour Bot 2

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  candles: Candle[];
  timestamp: number;
}

export interface Indicators {
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  rsi: number;
  atr: number;
  adx: number;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;
  donchianUpper: number;
  donchianLower: number;
  volumeMA: number;
}

export type RegimeType = 'trending_up' | 'trending_down' | 'ranging' | 'high_volatility';

export interface RegimeDetection {
  regime: RegimeType;
  confidence: number;
  adx: number;
  trend: number;
}

export type StrategyName = 'trend_following' | 'mean_reversion' | 'breakout';

export type SignalType = 'buy' | 'sell' | 'hold';

export interface Signal {
  type: SignalType;
  symbol: string;       // 🆕
  price: number;
  confidence: number;   // 🆕
  strategy: StrategyName;
  regime: RegimeType;
  timestamp: number;
  strength?: number;    // optionnel pour compatibilité
  reason?: string;      // 🆕
}

export interface Strategy {
  name: StrategyName;
  analyze(data: MarketData, indicators: Indicators, regime: RegimeDetection): Signal;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  usdValue: number;
  stopLoss: number;
  takeProfit: number;
  trailingStop?: number;
  strategy: StrategyName;
  regime: RegimeType;
  openTime: number;
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
  strategy: StrategyName;
  regime: RegimeType;
  openTime: number;
  closeTime: number;
  duration: number;
  exitReason: 'signal' | 'stop_loss' | 'take_profit' | 'trailing_stop';
}

export interface Portfolio {
  capital: number;
  availableCapital: number;
  positions: Position[];
  totalPnL: number;
  totalPnLPercent: number;
}

export interface PositionSizing {
  quantity: number;
  usdValue: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
}

export interface QTable {
  [key: string]: number;
}

export interface QValue {
  state: string;
  qValue: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface ExchangeClient {
  connect(): Promise<void>;
  getPrice(symbol: string): Promise<number>;
  getCandles(symbol: string, timeframe: string, limit: number): Promise<Candle[]>;
  placeMarketOrder(symbol: string, side: 'buy' | 'sell', quantity: number): Promise<string>;
  closePosition(positionId: string): Promise<void>;
}

export interface RiskConfig {
  maxRiskPerTrade: number;
  maxPositionSize: number;
  maxPositions: number;
  stopLossMultiplier: number;
  takeProfitMultiplier: number;
  trailingStopDistance: number;
}

export interface RLConfig {
  epsilon: number;
  epsilonDecay: number;
  epsilonMin: number;
  alpha: number;
  gamma: number;
}

export interface BotConfig {
  mode: 'paper' | 'live';
  exchange: string;
  network?: string;
  tradingPairs: string[];
  timeframe: string;
  checkInterval: number;
  initialCapital: number;
  riskConfig: RiskConfig;
  rlConfig: RLConfig;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
}