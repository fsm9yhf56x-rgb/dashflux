// app/api/bot1/positions/route.ts
import { NextResponse } from 'next/server';
import { Bot1Database } from '../../../../bot1/shared/utils/db';

export async function GET() {
  try {
    const db = new Bot1Database();
    const positions = db.getPositions();
    db.close();

    return NextResponse.json({ positions, timestamp: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';