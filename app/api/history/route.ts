import { NextRequest, NextResponse } from 'next/server';
import { fetchHistoricalData } from '@/lib/metals-api';
import { MetalType, Timeframe, HistoryResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metal = (searchParams.get('metal') || 'gold') as MetalType;
    const timeframe = (searchParams.get('timeframe') || '7d') as Timeframe;

    // Validate inputs
    const validMetals: MetalType[] = ['gold', 'silver', 'copper', 'platinum'];
    const validTimeframes: Timeframe[] = ['24h', '7d', '30d', '1y'];

    if (!validMetals.includes(metal)) {
      return NextResponse.json(
        { success: false, error: 'Invalid metal' },
        { status: 400 }
      );
    }

    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timeframe' },
        { status: 400 }
      );
    }

    const data = await fetchHistoricalData(metal, timeframe);

    const response: HistoryResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
