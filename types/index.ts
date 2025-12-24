// Metal types
export type MetalType = 'gold' | 'silver' | 'copper' | 'platinum';

export interface MetalInfo {
  id: MetalType;
  name: string;
  symbol: string;
  unit: string;
  color: string;
  bgColor: string;
}

export const METALS: Record<MetalType, MetalInfo> = {
  gold: {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    unit: 'oz',
    color: '#FFD700',
    bgColor: 'bg-yellow-500/10',
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    symbol: 'XAG',
    unit: 'oz',
    color: '#C0C0C0',
    bgColor: 'bg-gray-400/10',
  },
  copper: {
    id: 'copper',
    name: 'Copper',
    symbol: 'XCU',
    unit: 'lb',
    color: '#B87333',
    bgColor: 'bg-orange-500/10',
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    symbol: 'XPT',
    unit: 'oz',
    color: '#E5E4E2',
    bgColor: 'bg-slate-300/10',
  },
};

// Price data
export interface MetalPrice {
  metal: MetalType;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
  sparkline?: number[];
}

// Historical data point
export interface PriceDataPoint {
  timestamp: number;
  date: string;
  price: number;
}

export interface HistoricalData {
  metal: MetalType;
  timeframe: Timeframe;
  data: PriceDataPoint[];
}

// Timeframes
export type Timeframe = '24h' | '7d' | '30d' | '1y';

export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
];

// Sentiment
export type SentimentLevel = 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';

export interface SentimentData {
  score: number; // -100 to +100
  level: SentimentLevel;
  label: string;
  sources: {
    news: number;
    social: number;
    momentum: number;
  };
  lastUpdated: string;
}

// News
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  relevantMetals: MetalType[];
}

// API responses
export interface PricesResponse {
  success: boolean;
  prices: MetalPrice[];
  timestamp: string;
}

export interface SentimentResponse {
  success: boolean;
  sentiment: SentimentData;
  news: NewsItem[];
  timestamp: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoricalData;
  timestamp: string;
}
