import { MetalPrice, MetalType, HistoricalData, Timeframe, PriceDataPoint } from '@/types';
import { generateSparkline } from './utils';

// Mock data for development (replace with real API calls)
const MOCK_PRICES: Record<MetalType, { price: number; change: number }> = {
  gold: { price: 2634.50, change: 1.2 },
  silver: { price: 31.42, change: -0.8 },
  copper: { price: 4.21, change: 0.3 },
  platinum: { price: 982.00, change: 0.5 },
};

/**
 * Fetch current metal prices
 * In production, this would call a real API like metals.dev or metalpriceapi.com
 */
export async function fetchMetalPrices(): Promise<MetalPrice[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const now = new Date().toISOString();

  return Object.entries(MOCK_PRICES).map(([metal, data]) => {
    const basePrice = data.price;
    const changePercent = data.change + (Math.random() - 0.5) * 0.5; // Add some variation
    const priceChange = (basePrice * changePercent) / 100;

    return {
      metal: metal as MetalType,
      price: basePrice + (Math.random() - 0.5) * basePrice * 0.01, // Small variation
      change24h: priceChange,
      changePercent24h: changePercent,
      high24h: basePrice * 1.015,
      low24h: basePrice * 0.985,
      lastUpdated: now,
      sparkline: generateSparkline(basePrice, 0.015),
    };
  });
}

/**
 * Fetch historical price data
 */
export async function fetchHistoricalData(
  metal: MetalType,
  timeframe: Timeframe
): Promise<HistoricalData> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const basePrice = MOCK_PRICES[metal].price;
  const now = Date.now();
  const data: PriceDataPoint[] = [];

  // Determine number of points and interval based on timeframe
  let points: number;
  let intervalMs: number;

  switch (timeframe) {
    case '24h':
      points = 24;
      intervalMs = 3600000; // 1 hour
      break;
    case '7d':
      points = 7 * 24;
      intervalMs = 3600000; // 1 hour
      break;
    case '30d':
      points = 30;
      intervalMs = 86400000; // 1 day
      break;
    case '1y':
      points = 365;
      intervalMs = 86400000; // 1 day
      break;
  }

  // Generate mock historical data with realistic movement
  let price = basePrice * 0.95; // Start slightly lower
  const volatility = timeframe === '1y' ? 0.02 : 0.01;

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const change = (Math.random() - 0.48) * volatility * basePrice; // Slight upward bias
    price = Math.max(price + change, basePrice * 0.8);
    price = Math.min(price, basePrice * 1.2);

    data.push({
      timestamp,
      date: new Date(timestamp).toISOString(),
      price: i === 0 ? basePrice : price, // Ensure last point matches current price
    });
  }

  return {
    metal,
    timeframe,
    data,
  };
}

/**
 * Real API implementation example (commented out)
 * Uncomment and configure when you have an API key
 */
/*
const METALS_API_KEY = process.env.METALS_API_KEY;
const METALS_API_URL = 'https://api.metals.dev/v1';

export async function fetchRealMetalPrices(): Promise<MetalPrice[]> {
  const response = await fetch(`${METALS_API_URL}/latest?api_key=${METALS_API_KEY}&currency=USD&unit=oz`);

  if (!response.ok) {
    throw new Error('Failed to fetch metal prices');
  }

  const data = await response.json();

  // Transform API response to our format
  return [
    { metal: 'gold', price: data.metals.gold, ... },
    { metal: 'silver', price: data.metals.silver, ... },
    // etc.
  ];
}
*/
