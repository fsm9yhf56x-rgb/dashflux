import { NextResponse } from 'next/server';
import { detectMacroRegime } from '@/lib/advancedScoring';

export async function GET() {
  try {
    const regime = await detectMacroRegime();
    return NextResponse.json(regime);
  } catch (error) {
    console.error('Error in /api/macro:', error);
    return NextResponse.json(
      { error: 'Failed to get macro regime' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;