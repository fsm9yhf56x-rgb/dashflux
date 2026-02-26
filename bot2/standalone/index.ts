// bot2/standalone/index.ts
// Main Bot 2 - Standalone Adaptive Trading Bot

import * as cron from 'node-cron';
import { BOT2_CONFIG, validateConfig, printConfig } from './config';
import { Logger } from '../shared/utils/logger';
import { BotDatabase } from '../shared/utils/db';
import { TechnicalIndicators } from '../shared/utils/indicators';
import { HyperliquidClient, PaperHyperliquidClient } from '../shared/clients/hyperliquid';
import { RiskManager } from '../shared/risk/risk-manager';
import { RegimeDetector } from './regime-detector';
import { StrategyFactory } from './strategies';
import { RLAgent } from './rl-agent';
import { PortfolioManager } from './portfolio-manager';
import { MarketData, Signal, StrategyName } from '../shared/types';

class StandaloneAdaptiveBot {
  private logger: Logger;
  private db: BotDatabase;
  private client: HyperliquidClient | PaperHyperliquidClient;
  private riskManager: RiskManager;
  private regimeDetector: RegimeDetector;
  private strategyFactory: StrategyFactory;
  private rlAgent: RLAgent;
  private portfolioManager: PortfolioManager;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.logger = new Logger('Bot2', (process.env.BOT2_LOG_LEVEL as any) || 'info');
    this.db = new BotDatabase();
    
    this.client = BOT2_CONFIG.mode === 'paper'
      ? new PaperHyperliquidClient()
      : new HyperliquidClient(process.env.HYPERLIQUID_API_KEY, BOT2_CONFIG.network);
    
    this.riskManager = new RiskManager(BOT2_CONFIG.riskConfig);
    this.regimeDetector = new RegimeDetector();
    this.strategyFactory = new StrategyFactory();
    this.rlAgent = new RLAgent(BOT2_CONFIG.rlConfig, this.db);
    this.portfolioManager = new PortfolioManager(BOT2_CONFIG.initialCapital, this.db);

    this.logger.info('Bot2', 'Bot initialized');
  }

  async start() {
    // Validate config
    if (!validateConfig()) {
      this.logger.error('Bot2', 'Invalid configuration');
      process.exit(1);
    }

    printConfig();

    // Connect to exchange
    await this.client.connect();

    // Print Q-table
    this.rlAgent.printQTable();

    // Print portfolio summary
    this.portfolioManager.printSummary();

    // Initial run
    this.logger.separator();
    this.logger.header('🤖 Bot 2 Started');
    this.logger.separator();

    // Start the control loop
    this.startControlLoop();
  }

  private startControlLoop() {
    // Check bot_control every 5 seconds
    setInterval(async () => {
      try {
        const control = this.db.getBotControl();

        // Check if bot should be running
        if (!control.is_running) {
          if (this.intervalId) {
            this.logger.info('Bot2', '⏸ Bot stopped by user');
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
          return;
        }

        // Check if should run now (forced cycle)
        if (control.should_run_now === 1) {
          this.logger.info('Bot2', '🔄 Forced cycle triggered by user');
          await this.run();
          this.db.setShouldRunNow(false);
        }

        // Update risk config from bot_control
        this.riskManager = new RiskManager({
          maxRiskPerTrade: control.max_risk_per_trade,
          maxPositionSize: BOT2_CONFIG.riskConfig.maxPositionSize,
          maxPositions: control.max_positions,
          stopLossMultiplier: BOT2_CONFIG.riskConfig.stopLossMultiplier,
          takeProfitMultiplier: BOT2_CONFIG.riskConfig.takeProfitMultiplier,
          trailingStopDistance: BOT2_CONFIG.riskConfig.trailingStopDistance
        });

        // Update portfolio capital if changed
        if (this.portfolioManager.getPortfolio(new Map()).capital !== control.capital) {
          this.portfolioManager = new PortfolioManager(control.capital, this.db);
        }

        // Update interval if changed
        const currentInterval = control.check_interval;
        if (!this.intervalId) {
          // Start new interval
          const intervalMinutes = Math.floor(currentInterval / 60000);
          this.logger.info('Bot2', `✓ Started with ${intervalMinutes} minute interval`);
          
          // Run immediately
          await this.run();

          // Schedule periodic runs
          this.intervalId = setInterval(() => this.run(), currentInterval);
        }

      } catch (error) {
        this.logger.error('Bot2', `Error in control loop: ${error}`);
      }
    }, 5000); // Check every 5 seconds
  }

  private async run() {
    const control = this.db.getBotControl();
    
    // Double-check if bot should run
    if (!control.is_running) {
      return;
    }

    this.logger.separator();
    this.logger.info('Bot2', `🔄 Running cycle - ${new Date().toLocaleString()}`);

    try {
      // Update existing positions
      await this.updatePositions();

      // Process each trading pair
      for (const symbol of BOT2_CONFIG.tradingPairs) {
        await this.processSymbol(symbol);
      }

      // Save performance metrics
      await this.savePerformance();

      // Print summary
      this.portfolioManager.printSummary();

    } catch (error) {
      this.logger.error('Bot2', `Error in run cycle: ${error}`);
    }
  }

  private async updatePositions() {
    const currentPrices = new Map<string, number>();
    
    for (const symbol of BOT2_CONFIG.tradingPairs) {
      const price = await this.client.getPrice(symbol);
      currentPrices.set(symbol, price);
    }

    const portfolio = this.portfolioManager.getPortfolio(currentPrices);

    for (const position of portfolio.positions) {
      const currentPrice = currentPrices.get(position.symbol);
      if (!currentPrice) continue;

      // Check stop-loss
      if (
        (position.side === 'long' && currentPrice <= position.stopLoss) ||
        (position.side === 'short' && currentPrice >= position.stopLoss)
      ) {
        const trade = this.portfolioManager.closePosition(position.id, currentPrice, 'stop_loss');
        if (trade) {
          this.logger.info('Bot2', `Stop loss hit for ${position.symbol}`);
          const reward = this.rlAgent.calculateReward(trade);
          this.rlAgent.update(position.regime, position.strategy, reward);
        }
        continue;
      }

      // Check take-profit
      if (
        (position.side === 'long' && currentPrice >= position.takeProfit) ||
        (position.side === 'short' && currentPrice <= position.takeProfit)
      ) {
        const trade = this.portfolioManager.closePosition(position.id, currentPrice, 'take_profit');
        if (trade) {
          this.logger.info('Bot2', `Take profit hit for ${position.symbol}`);
          const reward = this.rlAgent.calculateReward(trade);
          this.rlAgent.update(position.regime, position.strategy, reward);
        }
        continue;
      }

      // Update trailing stop
      const newTrailingStop = this.riskManager.updateTrailingStop(position, currentPrice);
      if (newTrailingStop && newTrailingStop !== position.trailingStop) {
        this.portfolioManager.updatePosition(position.id, { trailingStop: newTrailingStop });
        this.logger.info('Bot2', `Trailing stop updated for ${position.symbol}: $${newTrailingStop.toFixed(2)}`);
      }

      // Check trailing stop
      if (position.trailingStop) {
        if (
          (position.side === 'long' && currentPrice <= position.trailingStop) ||
          (position.side === 'short' && currentPrice >= position.trailingStop)
        ) {
          const trade = this.portfolioManager.closePosition(position.id, currentPrice, 'trailing_stop');
          if (trade) {
            this.logger.info('Bot2', `Trailing stop hit for ${position.symbol}`);
            const reward = this.rlAgent.calculateReward(trade);
            this.rlAgent.update(position.regime, position.strategy, reward);
          }
        }
      }
    }
  }

  private async processSymbol(symbol: string) {
    try {
      // Fetch market data
      const price = await this.client.getPrice(symbol);
      const candles = await this.client.getCandles(symbol, BOT2_CONFIG.timeframe, 250);

      const marketData: MarketData = {
        symbol,
        price,
        candles,
        timestamp: Date.now()
      };

      // Calculate indicators
      const indicators = TechnicalIndicators.calculate(candles);

      // Detect market regime
      const regime = this.regimeDetector.detect(marketData, indicators);
      this.logger.info('Bot2', `[${symbol}] Regime: ${regime.regime} (${regime.confidence.toFixed(1)}%)`);

      // Select strategy using RL
      const availableStrategies: StrategyName[] = ['trend_following', 'mean_reversion', 'breakout'];
      const selectedStrategy = this.rlAgent.selectStrategy(regime.regime, availableStrategies);

      // Generate signal
      const strategy = this.strategyFactory.getStrategy(selectedStrategy);
      if (!strategy) return;

      const signal = strategy.analyze(marketData, indicators, regime);
      this.logger.signal(symbol, signal);

      // Execute signal
      if (signal.type !== 'hold') {
        await this.executeSignal(symbol, signal, price, indicators);
      }

    } catch (error) {
      this.logger.error('Bot2', `Error processing ${symbol}: ${error}`);
    }
  }

  private async executeSignal(symbol: string, signal: Signal, price: number, indicators: any) {
    const currentPrices = new Map<string, number>();
    for (const sym of BOT2_CONFIG.tradingPairs) {
      currentPrices.set(sym, await this.client.getPrice(sym));
    }

    const portfolio = this.portfolioManager.getPortfolio(currentPrices);

    // Check if we can open a new position
    if (!this.riskManager.canOpenPosition(portfolio)) {
      this.logger.warn('Bot2', 'Cannot open position: max positions reached or insufficient capital');
      return;
    }

    // Calculate position sizing
    const sizing = this.riskManager.calculatePositionSize(signal, price, indicators, portfolio);

    // Place order
    const side = signal.type === 'buy' ? 'buy' : 'sell';
    const orderId = await this.client.placeMarketOrder(symbol, side, sizing.quantity);

    // Add position to portfolio
    const position = this.portfolioManager.addPosition(
      symbol,
      signal.type === 'buy' ? 'long' : 'short',
      sizing,
      signal.strategy,
      signal.regime
    );

    this.logger.trade('Added', position);
  }

  private async savePerformance() {
    const currentPrices = new Map<string, number>();
    for (const symbol of BOT2_CONFIG.tradingPairs) {
      currentPrices.set(symbol, await this.client.getPrice(symbol));
    }

    const portfolio = this.portfolioManager.getPortfolio(currentPrices);
    const metrics = this.portfolioManager.getPerformanceMetrics();

    const trades = this.db.getTrades();
    const sharpeRatio = this.riskManager.calculateSharpeRatio(trades);
    
    const control = this.db.getBotControl();
    const equityCurve = [control.capital, portfolio.capital];
    const maxDrawdown = this.riskManager.calculateMaxDrawdown(equityCurve);

    this.db.savePerformance(
      Date.now(),
      portfolio.capital,
      portfolio.totalPnL,
      portfolio.totalPnLPercent,
      metrics.winRate,
      sharpeRatio,
      maxDrawdown,
      metrics.totalTrades
    );
  }
}

// Start bot
const bot = new StandaloneAdaptiveBot();
bot.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});