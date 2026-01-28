import { NextRequest, NextResponse } from 'next/server';
import { calculateAssetScore, ASSETS } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    // Next.js 15: params est une Promise
    const params = await context.params;
    const ticker = params.ticker;
    
    console.log(`🔍 Fetching asset: ${ticker}`);
    
    const asset = ASSETS.find(a => a.ticker === ticker);
    
    if (!asset) {
      console.error(`❌ Asset ${ticker} not found`);
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Asset found: ${asset.name}`);
    
    const assetScore = await calculateAssetScore(asset);
    
    console.log(`📊 Score: ${assetScore.score}`);

    return NextResponse.json(assetScore);
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 300;