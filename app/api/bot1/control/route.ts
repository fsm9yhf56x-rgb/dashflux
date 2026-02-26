// app/api/bot1/control/route.ts
import { NextResponse } from 'next/server';
import { Bot1Database } from '../../../../bot1/shared/utils/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, settings } = body;

    const db = new Bot1Database();

    if (action === 'start') {
      db.updateControl({ is_running: true });
      db.close();
      return NextResponse.json({ success: true, message: 'Bot started' });
    }

    if (action === 'stop') {
      db.updateControl({ is_running: false });
      db.close();
      return NextResponse.json({ success: true, message: 'Bot stopped' });
    }

    if (action === 'run_now') {
      db.updateControl({ should_run_now: true });
      db.close();
      return NextResponse.json({ success: true, message: 'Manual run triggered' });
    }

    if (action === 'update_settings' && settings) {
      db.updateControl(settings);
      db.close();
      return NextResponse.json({ success: true, message: 'Settings updated' });
    }

    if (action === 'reset') {
      // Close all positions
      const positions = db.getPositions();
      positions.forEach(p => db.closePosition(p.id));
      
      // Reset capital
      db.updateControl({ capital: 1000 });
      db.close();
      
      return NextResponse.json({ success: true, message: 'Bot reset' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';