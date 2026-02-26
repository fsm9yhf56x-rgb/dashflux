import { NextRequest, NextResponse } from 'next/server';
import { getNewsForAsset } from '@/lib/newsAnalysis';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ ticker: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { ticker: rawTicker } = await context.params;
    const ticker = rawTicker.toUpperCase();
    const data = await getNewsForAsset(ticker);

    return NextResponse.json({
      success: true,
      ticker,
      sentiment: data.sentiment,
      articles: data.articles,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`News API error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch news',
      },
      { status: 500 }
    );
  }
}