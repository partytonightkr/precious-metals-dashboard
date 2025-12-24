import { NextResponse } from 'next/server';
import { calculateSentiment } from '@/lib/sentiment';
import { SentimentResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { sentiment, news } = await calculateSentiment();

    const response: SentimentResponse = {
      success: true,
      sentiment,
      news,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating sentiment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate sentiment' },
      { status: 500 }
    );
  }
}
