// bot2/standalone/rl-agent.ts
import { RLConfig, RegimeType, StrategyName, Trade, QTable } from '../shared/types';
import { BotDatabase } from '../shared/utils/db';

export class RLAgent {
  private config: RLConfig;
  private qTable: QTable;
  private db: BotDatabase;
  private epsilon: number;

  constructor(config: RLConfig, db: BotDatabase) {
    this.config = config;
    this.db = db;
    this.epsilon = config.epsilon;
    
    this.qTable = db.getQTable();
    
    console.log(`[RL] Agent initialized`);
    console.log(`[RL] Loaded ${Object.keys(this.qTable).length} Q-values from database`);
  }

  selectStrategy(regime: RegimeType, availableStrategies: StrategyName[]): StrategyName {
    if (Math.random() < this.epsilon) {
      const randomIndex = Math.floor(Math.random() * availableStrategies.length);
      return availableStrategies[randomIndex];
    }

    let bestStrategy = availableStrategies[0];
    let bestQValue = this.getQValue(regime, bestStrategy);

    for (const strategy of availableStrategies) {
      const qValue = this.getQValue(regime, strategy);
      if (qValue > bestQValue) {
        bestQValue = qValue;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  getQValue(regime: RegimeType, strategy: StrategyName): number {
    const state = `${regime}_${strategy}`;
    return this.qTable[state] || 0;
  }

  update(regime: RegimeType, strategy: StrategyName, reward: number) {
    const state = `${regime}_${strategy}`;
    const oldQValue = this.getQValue(regime, strategy);
    
    // Q-learning update rule: Q(s,a) = Q(s,a) + α * (r - Q(s,a))
    const newQValue = oldQValue + this.config.alpha * (reward - oldQValue);
    
    this.qTable[state] = newQValue;
    this.db.saveQValue(state, newQValue);

    this.epsilon = Math.max(this.config.epsilonMin, this.epsilon * this.config.epsilonDecay);
  }

  calculateReward(trade: Trade): number {
    const pnlPercent = trade.pnlPercent;
    
    let reward = pnlPercent / 100;

    const hoursDuration = trade.duration / (1000 * 60 * 60);
    if (pnlPercent > 0 && hoursDuration < 24) {
      reward *= 1.2;
    }

    if (pnlPercent < 0 && hoursDuration > 48) {
      reward *= 1.5;
    }

    return Math.max(-0.1, Math.min(0.1, reward));
  }

  printQTable() {
    const regimes: RegimeType[] = ['trending_up', 'trending_down', 'ranging', 'high_volatility'];
    const strategies: StrategyName[] = ['trend_following', 'mean_reversion', 'breakout'];

    console.log('='.repeat(80));
    console.log('                           Q-Table');
    console.log('='.repeat(80));
    
    let header = 'Regime              ';
    for (const strategy of strategies) {
      header += strategy.padEnd(18) + '  ';
    }
    console.log(header);
    console.log('='.repeat(80));

    for (const regime of regimes) {
      let row = regime.padEnd(20);
      for (const strategy of strategies) {
        const qValue = this.getQValue(regime, strategy);
        row += qValue.toFixed(4).padEnd(18) + '  ';
      }
      console.log(row);
    }

    console.log('='.repeat(80));
    console.log(`Epsilon: ${this.epsilon.toFixed(4)}`);
    console.log('='.repeat(80));
  }

  getEpsilon(): number {
    return this.epsilon;
  }
}