// app/api/bot2/status/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const DB_PATH = './bot2-data.db';

export async function GET() {
  try {
    if (!existsSync(DB_PATH)) {
      return NextResponse.json({
        running: false,
        lastUpdate: null,
        capital: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        winRate: 0,
        openPositions: 0,
        totalTrades: 0,
        error: 'Bot database not found'
      });
    }

    const db = new Database(DB_PATH);

    // Get latest performance data
    const perfData = db.prepare(`
      SELECT * FROM performance ORDER BY timestamp DESC LIMIT 1
    `).get() as any;

    // Count open positions
    const positionsCount = db.prepare(`
      SELECT COUNT(*) as count FROM positions
    `).get() as any;

    // Count total trades
    const tradesCount = db.prepare(`
      SELECT COUNT(*) as count FROM trades
    `).get() as any;

    db.close();

    return NextResponse.json({
      running: true, // Assume running if DB exists
      lastUpdate: perfData?.timestamp || null,
      capital: perfData?.capital || 0,
      totalPnL: perfData?.total_pnl || 0,
      totalPnLPercent: perfData?.pnl_percent || 0,
      winRate: perfData?.win_rate || 0,
      openPositions: positionsCount?.count || 0,
      totalTrades: tradesCount?.count || 0
    });

  } catch (error) {
    console.error('Error in bot2/status:', error);
    return NextResponse.json({
      running: false,
      error: String(error)
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';