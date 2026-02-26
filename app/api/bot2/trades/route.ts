// app/api/bot2/trades/route.ts
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

    const trades = db.prepare(`
      SELECT * FROM trades ORDER BY close_time DESC LIMIT 50
    `).all() as any[];

    db.close();

    return NextResponse.json(trades.map(row => ({
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
    })));

  } catch (error) {
    console.error('Error in bot2/trades:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';