// bot2/standalone/portfolio-manager.ts
import { v4 as uuidv4 } from 'uuid';
import { Portfolio, Position, Trade, StrategyName, RegimeType } from '../shared/types';
import { BotDatabase } from '../shared/utils/db';

export class PortfolioManager {
  private initialCapital: number;
  private db: BotDatabase;

  constructor(initialCapital: number, db: BotDatabase) {
    this.initialCapital = initialCapital;
    this.db = db;
  }

  getPortfolio(currentPrices: Map<string, number>): Portfolio {
    const positions = this.db.getPositions();
    
    let totalValue = this.initialCapital;
    let totalPnL = 0;

    for (const position of positions) {
      const currentPrice = currentPrices.get(position.symbol);
      if (!currentPrice) continue;

      const unrealizedPnL = position.side === 'long'
        ? (currentPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - currentPrice) * position.quantity;

      totalPnL += unrealizedPnL;
    }

    const trades = this.db.getTrades();
    const realizedPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    totalPnL += realizedPnL;

    totalValue = this.initialCapital + totalPnL;

    return {
      capital: totalValue,
      availableCapital: totalValue - positions.reduce((sum, p) => sum + p.usdValue, 0),
      positions,
      totalPnL,
      totalPnLPercent: (totalPnL / this.initialCapital) * 100
    };
  }

  addPosition(
    symbol: string,
    side: 'long' | 'short',
    sizing: any,
    strategy: StrategyName,
    regime: RegimeType
  ): Position {
    const position: Position = {
      id: uuidv4(),
      symbol,
      side,
      entryPrice: sizing.quantity > 0 ? sizing.usdValue / sizing.quantity : 0,
      quantity: sizing.quantity,
      usdValue: sizing.usdValue,
      stopLoss: sizing.stopLoss,
      takeProfit: sizing.takeProfit,
      strategy,
      regime,
      openTime: Date.now()
    };

    this.db.savePosition(position);
    return position;
  }

  updatePosition(positionId: string, updates: Partial<Position>) {
    const positions = this.db.getPositions();
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const updatedPosition = { ...position, ...updates };
    this.db.savePosition(updatedPosition);
  }

  // ✅ exitReason typé strictement au lieu de string
  closePosition(
    positionId: string,
    exitPrice: number,
    exitReason: Trade['exitReason']
  ): Trade | null {
    const positions = this.db.getPositions();
    const position = positions.find(p => p.id === positionId);
    if (!position) return null;

    const closeTime = Date.now();
    const duration = closeTime - position.openTime;

    const pnl = position.side === 'long'
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;

    const pnlPercent = (pnl / position.usdValue) * 100;

    const trade: Trade = {
      id: uuidv4(),
      symbol: position.symbol,
      side: position.side,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      pnl,
      pnlPercent,
      strategy: position.strategy,
      regime: position.regime,
      openTime: position.openTime,
      closeTime,
      duration,
      exitReason
    };

    this.db.saveTrade(trade);
    this.db.deletePosition(positionId);

    return trade;
  }

  getPerformanceMetrics() {
    const trades = this.db.getTrades();
    
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0
      };
    }

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);

    const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

    return {
      totalTrades: trades.length,
      winRate: wins.length / trades.length,
      avgWin: wins.length > 0 ? totalWins / wins.length : 0,
      avgLoss: losses.length > 0 ? totalLosses / losses.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0
    };
  }

  printSummary() {
    const currentPrices = new Map<string, number>();
    const portfolio = this.getPortfolio(currentPrices);
    const metrics = this.getPerformanceMetrics();

    console.log('='.repeat(80));
    console.log('PORTFOLIO SUMMARY');
    console.log('='.repeat(80));
    console.log(`Initial Capital:    $${this.initialCapital.toFixed(2)}`);
    console.log(`Current Capital:    $${portfolio.capital.toFixed(2)}`);
    console.log(`Total PnL:          $${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPercent.toFixed(2)}%)`);
    console.log(`Win Rate:           ${(metrics.winRate * 100).toFixed(2)}%`);
    console.log(`Total Trades:       ${metrics.totalTrades}`);
    console.log(`Open Positions:     ${portfolio.positions.length}`);
    console.log('='.repeat(80));
  }
}