// app/api/bot2/portfolio/route.ts
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

    const positions = db.prepare(`
      SELECT * FROM positions
    `).all() as any[];

    db.close();

    return NextResponse.json(positions.map(row => ({
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
    })));

  } catch (error) {
    console.error('Error in bot2/portfolio:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';