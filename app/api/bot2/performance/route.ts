// app/api/bot2/performance/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const DB_PATH = './bot2-data.db';

export async function GET() {
  try {
    if (!existsSync(DB_PATH)) {
      return NextResponse.json([]);
    }

    const db = new Database(DB_PATH);

    const performance = db.prepare(`
      SELECT * FROM performance ORDER BY timestamp DESC LIMIT 100
    `).all() as any[];

    db.close();

    return NextResponse.json(performance.map(row => ({
      timestamp: row.timestamp,
      capital: row.capital,
      totalPnL: row.total_pnl,
      pnlPercent: row.pnl_percent,
      winRate: row.win_rate,
      sharpeRatio: row.sharpe_ratio,
      maxDrawdown: row.max_drawdown,
      totalTrades: row.total_trades
    })));

  } catch (error) {
    console.error('Error in bot2/performance:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';