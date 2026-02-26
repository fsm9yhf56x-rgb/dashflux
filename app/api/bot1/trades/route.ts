// app/api/bot1/trades/route.ts
import { NextResponse } from 'next/server';
import { Bot1Database } from '../../../../bot1/shared/utils/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const db = new Bot1Database();
    const trades = db.getTrades(limit);
    db.close();

    return NextResponse.json({ trades, timestamp: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';