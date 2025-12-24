import { NextResponse } from 'next/server';
import { fetchMetalPrices } from '@/lib/metals-api';
import { PricesResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const prices = await fetchMetalPrices();

    const response: PricesResponse = {
      success: true,
      prices,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
