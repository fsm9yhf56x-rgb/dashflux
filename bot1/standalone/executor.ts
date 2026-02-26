// bot1/standalone/executor.ts
import { Bot1Database } from '../shared/utils/db';
import { BOT1_CONFIG } from './config';

interface DashFluxScore {
  symbol: string;
  score: number;
  technicalScore?: number;
  category?: string;
  price?: number;
  change24h?: number;
}

export class DashFluxExecutor {
  private db: Bot1Database;
  private config = BOT1_CONFIG;

  constructor() {
    this.db = new Bot1Database();
  }

  /**
   * Récupère les scores depuis DashFlux API
   */
  async fetchScores(): Promise<DashFluxScore[]> {
    try {
      const response = await fetch(`${this.config.dashfluxApiUrl}/api/scores`);
      const data = await response.json();
      return data.scores || [];
    } catch (error) {
      console.error('[Bot1] Error fetching scores:', error);
      return [];
    }
  }

  /**
   * Identifie les opportunités d'achat (score > threshold)
   */
  identifyBuySignals(scores: DashFluxScore[]): DashFluxScore[] {
    const control = this.db.getControl();
    return scores
      .filter(s => s.score >= control.buy_score_threshold)
      .sort((a, b) => b.score - a.score); // Meilleurs scores en premier
  }

  /**
   * Identifie les positions à fermer (score < threshold)
   */
  identifySellSignals(scores: DashFluxScore[]): string[] {
    const control = this.db.getControl();
    const positions = this.db.getPositions();
    const sellSymbols: string[] = [];

    for (const position of positions) {
      const currentScore = scores.find(s => s.symbol === position.symbol);
      
      if (!currentScore) {
        // Score pas trouvé = ferme position
        sellSymbols.push(position.symbol);
        continue;
      }

      // Score tombé sous threshold
      if (currentScore.score < control.sell_score_threshold) {
        sellSymbols.push(position.symbol);
        continue;
      }

      // Update current score
      this.db.updatePosition(position.id, {
        current_score: currentScore.score
      });
    }

    return sellSymbols;
  }

  /**
   * Calcule la taille de position
   */
  calculatePositionSize(price: number): number {
    const control = this.db.getControl();
    const positionValue = control.capital * this.config.capitalPerTrade;
    return positionValue / price;
  }

  /**
   * Calcule stop-loss et take-profit
   */
  calculateRiskLevels(entryPrice: number): { stopLoss: number; takeProfit: number } {
    const control = this.db.getControl();
    
    const stopLoss = entryPrice * (1 - control.stop_loss_percent / 100);
    const takeProfit = entryPrice * (1 + control.take_profit_percent / 100);
    
    return { stopLoss, takeProfit };
  }

  /**
   * Ouvre une position
   */
  async openPosition(asset: DashFluxScore) {
    const control = this.db.getControl();
    const positions = this.db.getPositions();

    // Vérifie max positions
    if (positions.length >= control.max_positions) {
      console.log(`[Bot1] Max positions (${control.max_positions}) reached`);
      return;
    }

    // Vérifie si position déjà ouverte
    if (positions.find(p => p.symbol === asset.symbol)) {
      console.log(`[Bot1] Position already open for ${asset.symbol}`);
      return;
    }

    // Prix (simulé pour l'instant)
    const price = asset.price || 100; // Placeholder
    const quantity = this.calculatePositionSize(price);
    const { stopLoss, takeProfit } = this.calculateRiskLevels(price);

    // Ajoute position
    this.db.addPosition({
      symbol: asset.symbol,
      side: 'long',
      entry_price: price,
      quantity,
      entry_score: asset.score,
      current_score: asset.score,
      unrealized_pnl: 0,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      opened_at: Date.now()
    });

    // Enregistre trade
    this.db.addTrade({
      symbol: asset.symbol,
      side: 'long',
      action: 'open',
      entry_price: price,
      exit_price: null,
      quantity,
      entry_score: asset.score,
      exit_score: null,
      pnl: 0,
      reason: `Score: ${asset.score} > ${control.buy_score_threshold}`,
      opened_at: Date.now(),
      closed_at: null
    });

    console.log(`[Bot1] 🟢 OPENED ${asset.symbol} @ $${price.toFixed(2)} | Score: ${asset.score}`);
  }

  /**
   * Ferme une position
   */
  async closePosition(symbol: string, reason: string) {
    const positions = this.db.getPositions();
    const position = positions.find(p => p.symbol === symbol);

    if (!position) {
      console.log(`[Bot1] No position found for ${symbol}`);
      return;
    }

    // Prix (simulé pour l'instant)
    const exitPrice = position.entry_price * 1.02; // +2% simulé
    const pnl = (exitPrice - position.entry_price) * position.quantity;

    // Ferme position
    this.db.closePosition(position.id);

    // Enregistre trade
    this.db.addTrade({
      symbol: position.symbol,
      side: position.side,
      action: 'close',
      entry_price: position.entry_price,
      exit_price: exitPrice,
      quantity: position.quantity,
      entry_score: position.entry_score,
      exit_score: position.current_score,
      pnl,
      reason,
      opened_at: position.opened_at,
      closed_at: Date.now()
    });

    console.log(`[Bot1] 🔴 CLOSED ${symbol} @ $${exitPrice.toFixed(2)} | PnL: $${pnl.toFixed(2)} | Reason: ${reason}`);
  }

  /**
   * Check stop-loss et take-profit
   */
  async checkRiskLevels(scores: DashFluxScore[]) {
    const positions = this.db.getPositions();

    for (const position of positions) {
      const currentScore = scores.find(s => s.symbol === position.symbol);
      if (!currentScore) continue;

      const currentPrice = currentScore.price || position.entry_price;

      // Stop-loss
      if (currentPrice <= position.stop_loss) {
        await this.closePosition(position.symbol, 'Stop-loss hit');
        continue;
      }

      // Take-profit
      if (currentPrice >= position.take_profit) {
        await this.closePosition(position.symbol, 'Take-profit hit');
        continue;
      }

      // Update PnL
      const unrealizedPnl = (currentPrice - position.entry_price) * position.quantity;
      this.db.updatePosition(position.id, {
        unrealized_pnl: unrealizedPnl
      });
    }
  }

  /**
   * Cycle principal d'exécution
   */
  async run() {
    console.log('[Bot1] 🔄 Running cycle...');

    try {
      // 1. Récupère scores DashFlux
      const scores = await this.fetchScores();
      console.log(`[Bot1] 📊 Fetched ${scores.length} scores from DashFlux`);

      // 2. Check risk levels (stop-loss, take-profit)
      await this.checkRiskLevels(scores);

      // 3. Identifie positions à fermer
      const sellSignals = this.identifySellSignals(scores);
      for (const symbol of sellSignals) {
        const score = scores.find(s => s.symbol === symbol);
        await this.closePosition(
          symbol,
          `Score dropped to ${score?.score || 'N/A'}`
        );
      }

      // 4. Identifie opportunités d'achat
      const buySignals = this.identifyBuySignals(scores);
      const positions = this.db.getPositions();
      const availableSlots = this.config.maxPositions - positions.length;

      // 5. Ouvre nouvelles positions
      for (let i = 0; i < Math.min(availableSlots, buySignals.length); i++) {
        await this.openPosition(buySignals[i]);
      }

      // 6. Affiche résumé
      const perf = this.db.getPerformance();
      console.log(`[Bot1] 📈 Positions: ${positions.length}/${this.config.maxPositions}`);
      console.log(`[Bot1] 💰 Capital: $${perf.current_capital.toFixed(2)} | ROI: ${perf.roi.toFixed(2)}%`);

    } catch (error) {
      console.error('[Bot1] Error in run cycle:', error);
    }
  }

  close() {
    this.db.close();
  }
}