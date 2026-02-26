import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const DB_PATH = './bot2-data.db';

export async function GET() {
  try {
    if (!existsSync(DB_PATH)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const db = new Database(DB_PATH);
    const control = db.prepare('SELECT * FROM bot_control WHERE id = 1').get() as any;
    db.close();

    return NextResponse.json({
      isRunning: control.is_running === 1,
      capital: control.capital,
      maxRiskPerTrade: control.max_risk_per_trade,
      maxPositions: control.max_positions,
      checkInterval: control.check_interval
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!existsSync(DB_PATH)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const db = new Database(DB_PATH);

    switch (action) {
      case 'start':
        db.prepare('UPDATE bot_control SET is_running = 1 WHERE id = 1').run();
        break;

      case 'stop':
        db.prepare('UPDATE bot_control SET is_running = 0 WHERE id = 1').run();
        break;

      case 'run_now':
        db.prepare('UPDATE bot_control SET should_run_now = 1, last_command_time = ? WHERE id = 1').run(Date.now());
        break;

      case 'update_config':
        const updates: string[] = [];
        const values: any[] = [];

        if (params.capital !== undefined) {
          updates.push('capital = ?');
          values.push(params.capital);
        }
        if (params.maxRiskPerTrade !== undefined) {
          updates.push('max_risk_per_trade = ?');
          values.push(params.maxRiskPerTrade);
        }
        if (params.maxPositions !== undefined) {
          updates.push('max_positions = ?');
          values.push(params.maxPositions);
        }
        if (params.checkInterval !== undefined) {
          updates.push('check_interval = ?');
          values.push(params.checkInterval);
        }

        if (updates.length > 0) {
          db.prepare(`UPDATE bot_control SET ${updates.join(', ')} WHERE id = 1`).run(...values);
        }
        break;

      case 'reset':
        db.prepare('DELETE FROM trades').run();
        db.prepare('DELETE FROM positions').run();
        db.prepare('DELETE FROM q_values').run();
        db.prepare('DELETE FROM performance').run();
        db.prepare('UPDATE bot_control SET capital = 100, max_risk_per_trade = 0.02, max_positions = 3 WHERE id = 1').run();
        break;

      default:
        db.close();
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    db.close();
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';