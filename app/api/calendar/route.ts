import { NextResponse } from 'next/server';
import { getEconomicCalendar } from '@/lib/economicCalendar';

export async function GET() {
  try {
    const events = await getEconomicCalendar(60);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Erreur API calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache 1h
