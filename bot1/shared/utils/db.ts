// bot1/shared/utils/db.ts
import Database from 'better-sqlite3';

const DB_PATH = './bot1-data.db';

export interface Bot1Control {
  id: number;
  is_running: boolean;
  should_run_now: boolean;
  capital: number;
  buy_score_threshold: number;
  sell_score_threshold: number;
  max_positions: number;
  stop_loss_percent: number;
  take_profit_percent: number;
  check_interval_ms: number;
  last_updated: number;
}

export interface Bot1Position {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  entry_price: number;
  quantity: number;
  entry_score: number;
  current_score: number;
  unrealized_pnl: number;
  stop_loss: number;
  take_profit: number;
  opened_at: number;
}

export interface Bot1Trade {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  action: 'open' | 'close';
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_score: number;
  exit_score: number | null;
  pnl: number;
  reason: string;
  opened_at: number;
  closed_at: number | null;
}

export interface Bot1Performance {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  profit_factor: number;
  current_capital: number;
  roi: number;
}

export class Bot1Database {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.init();
  }

  private init() {
    // Control table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bot_control (
        id INTEGER PRIMARY KEY,
        is_running INTEGER NOT NULL DEFAULT 0,
        should_run_now INTEGER NOT NULL DEFAULT 0,
        capital REAL NOT NULL DEFAULT 1000,
        buy_score_threshold REAL NOT NULL DEFAULT 75,
        sell_score_threshold REAL NOT NULL DEFAULT 60,
        max_positions INTEGER NOT NULL DEFAULT 5,
        stop_loss_percent REAL NOT NULL DEFAULT 5,
        take_profit_percent REAL NOT NULL DEFAULT 15,
        check_interval_ms INTEGER NOT NULL DEFAULT 3600000,
        last_updated INTEGER NOT NULL
      );

      INSERT OR IGNORE INTO bot_control (id, capital, last_updated)
      VALUES (1, 1000, ${Date.now()});
    `);

    // Positions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        entry_price REAL NOT NULL,
        quantity REAL NOT NULL,
        entry_score REAL NOT NULL,
        current_score REAL NOT NULL,
        unrealized_pnl REAL NOT NULL DEFAULT 0,
        stop_loss REAL NOT NULL,
        take_profit REAL NOT NULL,
        opened_at INTEGER NOT NULL
      );
    `);

    // Trades table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        action TEXT NOT NULL,
        entry_price REAL NOT NULL,
        exit_price REAL,
        quantity REAL NOT NULL,
        entry_score REAL NOT NULL,
        exit_score REAL,
        pnl REAL NOT NULL DEFAULT 0,
        reason TEXT NOT NULL,
        opened_at INTEGER NOT NULL,
        closed_at INTEGER
      );
    `);
  }

  // Control
  getControl(): Bot1Control {
    const row = this.db.prepare('SELECT * FROM bot_control WHERE id = 1').get() as any;
    return {
      id: row.id,
      is_running: Boolean(row.is_running),
      should_run_now: Boolean(row.should_run_now),
      capital: row.capital,
      buy_score_threshold: row.buy_score_threshold,
      sell_score_threshold: row.sell_score_threshold,
      max_positions: row.max_positions,
      stop_loss_percent: row.stop_loss_percent,
      take_profit_percent: row.take_profit_percent,
      check_interval_ms: row.check_interval_ms,
      last_updated: row.last_updated
    };
  }

  updateControl(updates: Partial<Bot1Control>) {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`);
    
    const values = Object.entries(updates)
      .filter(([k]) => k !== 'id')
      .map(([, v]) => typeof v === 'boolean' ? (v ? 1 : 0) : v);

    this.db.prepare(`
      UPDATE bot_control SET ${fields.join(', ')}, last_updated = ? WHERE id = 1
    `).run(...values, Date.now());
  }

  // Positions
  getPositions(): Bot1Position[] {
    const rows = this.db.prepare('SELECT * FROM positions').all() as any[];
    return rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      side: row.side,
      entry_price: row.entry_price,
      quantity: row.quantity,
      entry_score: row.entry_score,
      current_score: row.current_score,
      unrealized_pnl: row.unrealized_pnl,
      stop_loss: row.stop_loss,
      take_profit: row.take_profit,
      opened_at: row.opened_at
    }));
  }

  addPosition(position: Omit<Bot1Position, 'id'>) {
    this.db.prepare(`
      INSERT INTO positions (symbol, side, entry_price, quantity, entry_score, 
        current_score, unrealized_pnl, stop_loss, take_profit, opened_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      position.symbol,
      position.side,
      position.entry_price,
      position.quantity,
      position.entry_score,
      position.current_score,
      position.unrealized_pnl,
      position.stop_loss,
      position.take_profit,
      position.opened_at
    );
  }

  updatePosition(id: number, updates: Partial<Bot1Position>) {
    const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = ?`);
    const values = Object.values(updates).filter((_, i) => Object.keys(updates)[i] !== 'id');
    
    this.db.prepare(`UPDATE positions SET ${fields.join(', ')} WHERE id = ?`)
      .run(...values, id);
  }

  closePosition(id: number) {
    this.db.prepare('DELETE FROM positions WHERE id = ?').run(id);
  }

  // Trades
  getTrades(limit: number = 100): Bot1Trade[] {
    const rows = this.db.prepare(`
      SELECT * FROM trades ORDER BY opened_at DESC LIMIT ?
    `).all(limit) as any[];
    
    return rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      side: row.side,
      action: row.action,
      entry_price: row.entry_price,
      exit_price: row.exit_price,
      quantity: row.quantity,
      entry_score: row.entry_score,
      exit_score: row.exit_score,
      pnl: row.pnl,
      reason: row.reason,
      opened_at: row.opened_at,
      closed_at: row.closed_at
    }));
  }

  addTrade(trade: Omit<Bot1Trade, 'id'>) {
    this.db.prepare(`
      INSERT INTO trades (symbol, side, action, entry_price, exit_price, 
        quantity, entry_score, exit_score, pnl, reason, opened_at, closed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trade.symbol,
      trade.side,
      trade.action,
      trade.entry_price,
      trade.exit_price,
      trade.quantity,
      trade.entry_score,
      trade.exit_score,
      trade.pnl,
      trade.reason,
      trade.opened_at,
      trade.closed_at
    );
  }

  // Performance
  getPerformance(): Bot1Performance {
    const trades = this.getTrades(1000);
    const closedTrades = trades.filter(t => t.action === 'close');
    
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
    const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
    
    const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const wins = closedTrades.filter(t => t.pnl > 0);
    const losses = closedTrades.filter(t => t.pnl < 0);
    
    const avgWin = wins.length > 0 
      ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length 
      : 0;
    
    const avgLoss = losses.length > 0
      ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
      : 0;
    
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    const control = this.getControl();
    const currentCapital = control.capital + totalPnl;
    const roi = ((currentCapital - control.capital) / control.capital) * 100;

    return {
      total_trades: totalTrades,
      winning_trades: winningTrades,
      losing_trades: losingTrades,
      total_pnl: totalPnl,
      win_rate: winRate,
      avg_win: avgWin,
      avg_loss: avgLoss,
      profit_factor: profitFactor,
      current_capital: currentCapital,
      roi
    };
  }

  close() {
    this.db.close();
  }
}