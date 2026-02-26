import { NextResponse } from 'next/server';
import { getNewsSentiments } from '@/lib/newsAnalysis';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache 24h

export async function GET() {
  try {
    const sentiments = await getNewsSentiments();
    
    return NextResponse.json({
      success: true,
      data: sentiments,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('News sentiment API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch news sentiments' 
      },
      { status: 500 }
    );
  }
}