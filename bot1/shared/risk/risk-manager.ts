// bot2/shared/risk/risk-manager.ts
import { RiskConfig, Portfolio, Signal, Trade, Position } from '../types';

export class RiskManager {
  private config: RiskConfig;

  constructor(config: RiskConfig) {
    this.config = config;
  }

  canOpenPosition(portfolio: Portfolio): boolean {
    // Check max positions
    if (portfolio.positions.length >= this.config.maxPositions) {
      return false;
    }

    // Check available capital
    if (portfolio.availableCapital < portfolio.capital * 0.1) {
      return false;
    }

    return true;
  }

  calculatePositionSize(signal: Signal, price: number, indicators: any, portfolio: Portfolio): any {
    // Calculate ATR-based stop loss
    const atr = indicators.atr;
    const stopLossDistance = atr * this.config.stopLossMultiplier;
    
    const stopLoss = signal.type === 'buy'
      ? price - stopLossDistance
      : price + stopLossDistance;

    // Calculate take profit
    const takeProfitDistance = atr * this.config.takeProfitMultiplier;
    const takeProfit = signal.type === 'buy'
      ? price + takeProfitDistance
      : price - takeProfitDistance;

    // Risk amount per trade
    const riskAmount = portfolio.capital * this.config.maxRiskPerTrade;

    // Position size based on risk
    const quantity = riskAmount / stopLossDistance;

    // Limit position size to max percentage of capital
    const maxUsdValue = portfolio.capital * this.config.maxPositionSize;
    const usdValue = Math.min(quantity * price, maxUsdValue);
    const finalQuantity = usdValue / price;

    return {
      quantity: finalQuantity,
      usdValue,
      stopLoss,
      takeProfit,
      riskAmount
    };
  }

  updateTrailingStop(position: Position, currentPrice: number): number | null {
    if (!position.trailingStop) {
      // Initialize trailing stop
      const distance = position.entryPrice * (this.config.trailingStopDistance / 100);
      
      if (position.side === 'long') {
        const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (profitPercent >= this.config.trailingStopDistance) {
          return currentPrice - distance;
        }
      } else {
        const profitPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (profitPercent >= this.config.trailingStopDistance) {
          return currentPrice + distance;
        }
      }
      return null;
    }

    // Update existing trailing stop
    const distance = currentPrice * (this.config.trailingStopDistance / 100);
    
    if (position.side === 'long') {
      const newTrailingStop = currentPrice - distance;
      if (newTrailingStop > position.trailingStop) {
        return newTrailingStop;
      }
    } else {
      const newTrailingStop = currentPrice + distance;
      if (newTrailingStop < position.trailingStop) {
        return newTrailingStop;
      }
    }

    return position.trailingStop;
  }

  calculateSharpeRatio(trades: Trade[], riskFreeRate: number = 0): number {
    if (trades.length === 0) return 0;

    const returns = trades.map(t => t.pnlPercent / 100);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    const variance = returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    return (avgReturn - riskFreeRate) / stdDev;
  }

  calculateMaxDrawdown(equityCurve: number[]): number {
    if (equityCurve.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = equityCurve[0];

    for (const value of equityCurve) {
      if (value > peak) {
        peak = value;
      }

      const drawdown = ((peak - value) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  validateTrade(signal: Signal, position: any, portfolio: Portfolio): boolean {
    // Don't exceed max risk per trade
    if (position.riskAmount > portfolio.capital * this.config.maxRiskPerTrade) {
      return false;
    }

    // Don't exceed max position size
    if (position.usdValue > portfolio.capital * this.config.maxPositionSize) {
      return false;
    }

    // Ensure stop loss is reasonable
    const slDistance = Math.abs(signal.price - position.stopLoss) / signal.price;
    if (slDistance > 0.1) { // Max 10% stop loss
      return false;
    }

    return true;
  }

  getPositionHealth(position: Position, currentPrice: number): {
    status: 'healthy' | 'warning' | 'critical';
    pnlPercent: number;
  } {
    const pnlPercent = position.side === 'long'
      ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
      : ((position.entryPrice - currentPrice) / position.entryPrice) * 100;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (pnlPercent < -1.5) {
      status = 'critical';
    } else if (pnlPercent < -0.5) {
      status = 'warning';
    }

    return { status, pnlPercent };
  }
}