import { NextResponse } from 'next/server';
import { calculateAllScores } from '@/lib/scoring';

// Cache global
let cachedScores: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // ✅ 5 minutes au lieu de 1 heure

export async function GET() {
  try {
    const now = Date.now();
    
    // Vérifier si le cache est valide
    if (cachedScores && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached scores');
      return NextResponse.json(cachedScores, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Age': Math.floor((now - cacheTimestamp) / 1000).toString(),
        }
      });
    }
    
    // Calculer nouveaux scores
    console.log('Calculating fresh scores...');
    const scores = await calculateAllScores();
    
    // Mettre en cache
    cachedScores = scores;
    cacheTimestamp = now;
    
    return NextResponse.json(scores, {
      headers: {
        'X-Cache': 'MISS',
      }
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
    return NextResponse.json(
      { error: 'Failed to calculate scores' },
      { status: 500 }
    );
  }
}

// Force refresh endpoint
export async function POST() {
  try {
    console.log('Force refresh - clearing cache');
    cachedScores = null;
    cacheTimestamp = 0;
    
    const scores = await calculateAllScores();
    cachedScores = scores;
    cacheTimestamp = Date.now();
    
    return NextResponse.json({ message: 'Cache cleared and refreshed', scores });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh scores' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';