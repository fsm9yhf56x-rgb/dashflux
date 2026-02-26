// bot2/shared/utils/db.ts
import Database from 'better-sqlite3';
import { Trade, Position, QTable } from '../types';

const DB_PATH = './bot2-data.db';

export class BotDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        entry_price REAL NOT NULL,
        exit_price REAL NOT NULL,
        quantity REAL NOT NULL,
        pnl REAL NOT NULL,
        pnl_percent REAL NOT NULL,
        strategy TEXT NOT NULL,
        regime TEXT NOT NULL,
        open_time INTEGER NOT NULL,
        close_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        exit_reason TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        entry_price REAL NOT NULL,
        quantity REAL NOT NULL,
        usd_value REAL NOT NULL,
        stop_loss REAL NOT NULL,
        take_profit REAL NOT NULL,
        trailing_stop REAL,
        strategy TEXT NOT NULL,
        regime TEXT NOT NULL,
        open_time INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS q_values (
        state TEXT PRIMARY KEY,
        q_value REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS performance (
        timestamp INTEGER PRIMARY KEY,
        capital REAL NOT NULL,
        total_pnl REAL NOT NULL,
        pnl_percent REAL NOT NULL,
        win_rate REAL NOT NULL,
        sharpe_ratio REAL,
        max_drawdown REAL,
        total_trades INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bot_control (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        is_running INTEGER DEFAULT 1,
        should_run_now INTEGER DEFAULT 0,
        capital REAL DEFAULT 100,
        max_risk_per_trade REAL DEFAULT 0.02,
        max_positions INTEGER DEFAULT 3,
        check_interval INTEGER DEFAULT 14400000,
        last_command_time INTEGER DEFAULT 0
      );

      INSERT OR IGNORE INTO bot_control (id, is_running, capital) VALUES (1, 1, 100);
    `);
  }

  // Bot Control Methods
  getBotControl() {
    return this.db.prepare('SELECT * FROM bot_control WHERE id = 1').get() as any;
  }

  updateBotControl(updates: any) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    this.db.prepare(`UPDATE bot_control SET ${fields} WHERE id = 1`).run(...values);
  }

  setBotRunning(isRunning: boolean) {
    this.db.prepare('UPDATE bot_control SET is_running = ? WHERE id = 1').run(isRunning ? 1 : 0);
  }

  setShouldRunNow(shouldRun: boolean) {
    this.db.prepare('UPDATE bot_control SET should_run_now = ?, last_command_time = ? WHERE id = 1')
      .run(shouldRun ? 1 : 0, Date.now());
  }

  saveTrade(trade: Trade) {
    this.db.prepare(`
      INSERT INTO trades (id, symbol, side, entry_price, exit_price, quantity, pnl, pnl_percent, strategy, regime, open_time, close_time, duration, exit_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trade.id,
      trade.symbol,
      trade.side,
      trade.entryPrice,
      trade.exitPrice,
      trade.quantity,
      trade.pnl,
      trade.pnlPercent,
      trade.strategy,
      trade.regime,
      trade.openTime,
      trade.closeTime,
      trade.duration,
      trade.exitReason
    );
  }

  getTrades(limit: number = 100): Trade[] {
    const rows = this.db.prepare(`
      SELECT * FROM trades ORDER BY close_time DESC LIMIT ?
    `).all(limit) as any[];

    return rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      side: row.side,
      entryPrice: row.entry_price,
      exitPrice: row.exit_price,
      quantity: row.quantity,
      pnl: row.pnl,
      pnlPercent: row.pnl_percent,
      strategy: row.strategy,
      regime: row.regime,
      openTime: row.open_time,
      closeTime: row.close_time,
      duration: row.duration,
      exitReason: row.exit_reason
    }));
  }

  savePosition(position: Position) {
    this.db.prepare(`
      INSERT OR REPLACE INTO positions (id, symbol, side, entry_price, quantity, usd_value, stop_loss, take_profit, trailing_stop, strategy, regime, open_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      position.id,
      position.symbol,
      position.side,
      position.entryPrice,
      position.quantity,
      position.usdValue,
      position.stopLoss,
      position.takeProfit,
      position.trailingStop || null,
      position.strategy,
      position.regime,
      position.openTime
    );
  }

  getPositions(): Position[] {
    const rows = this.db.prepare('SELECT * FROM positions').all() as any[];

    return rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      side: row.side,
      entryPrice: row.entry_price,
      quantity: row.quantity,
      usdValue: row.usd_value,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      trailingStop: row.trailing_stop,
      strategy: row.strategy,
      regime: row.regime,
      openTime: row.open_time
    }));
  }

  deletePosition(positionId: string) {
    this.db.prepare('DELETE FROM positions WHERE id = ?').run(positionId);
  }

  saveQValue(state: string, qValue: number) {
    this.db.prepare(`
      INSERT OR REPLACE INTO q_values (state, q_value) VALUES (?, ?)
    `).run(state, qValue);
  }

  getQTable(): QTable {
    const rows = this.db.prepare('SELECT * FROM q_values').all() as any[];
    const qTable: QTable = {};
    
    for (const row of rows) {
      qTable[row.state] = row.q_value;
    }
    
    return qTable;
  }

  savePerformance(timestamp: number, capital: number, totalPnL: number, pnlPercent: number, winRate: number, sharpeRatio: number, maxDrawdown: number, totalTrades: number) {
    this.db.prepare(`
      INSERT INTO performance (timestamp, capital, total_pnl, pnl_percent, win_rate, sharpe_ratio, max_drawdown, total_trades)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(timestamp, capital, totalPnL, pnlPercent, winRate, sharpeRatio, maxDrawdown, totalTrades);
  }

  resetDatabase() {
    this.db.exec(`
      DELETE FROM trades;
      DELETE FROM positions;
      DELETE FROM q_values;
      DELETE FROM performance;
      UPDATE bot_control SET capital = 100, max_risk_per_trade = 0.02, max_positions = 3 WHERE id = 1;
    `);
  }

  close() {
    this.db.close();
  }
}