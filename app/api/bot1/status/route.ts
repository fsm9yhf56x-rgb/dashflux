// app/api/bot1/status/route.ts
import { NextResponse } from 'next/server';
import { Bot1Database } from '../../../../bot1/shared/utils/db';

export async function GET() {
  try {
    const db = new Bot1Database();
    const control = db.getControl();
    const positions = db.getPositions();
    const performance = db.getPerformance();
    db.close();

    return NextResponse.json({
      control,
      positions,
      performance,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';