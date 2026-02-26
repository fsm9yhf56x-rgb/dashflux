// app/api/bot2/qtable/route.ts
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

    const qValues = db.prepare(`
      SELECT * FROM q_values
    `).all() as any[];

    db.close();

    return NextResponse.json(qValues.map(row => ({
      state: row.state,
      qValue: row.q_value
    })));

  } catch (error) {
    console.error('Error in bot2/qtable:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';