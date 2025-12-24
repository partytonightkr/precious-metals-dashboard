import { SentimentLevel } from '@/types';

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a price change with sign
 */
export function formatPriceChange(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCurrency(value, decimals)}`;
}

/**
 * Get sentiment level from score
 */
export function getSentimentLevel(score: number): SentimentLevel {
  if (score <= -50) return 'very_bearish';
  if (score <= -20) return 'bearish';
  if (score <= 20) return 'neutral';
  if (score <= 50) return 'bullish';
  return 'very_bullish';
}

/**
 * Get sentiment label from level
 */
export function getSentimentLabel(level: SentimentLevel): string {
  const labels: Record<SentimentLevel, string> = {
    very_bearish: 'Very Bearish',
    bearish: 'Bearish',
    neutral: 'Neutral',
    bullish: 'Bullish',
    very_bullish: 'Very Bullish',
  };
  return labels[level];
}

/**
 * Get sentiment emoji from level
 */
export function getSentimentEmoji(level: SentimentLevel): string {
  const emojis: Record<SentimentLevel, string> = {
    very_bearish: '😨',
    bearish: '😟',
    neutral: '😐',
    bullish: '😊',
    very_bullish: '🤩',
  };
  return emojis[level];
}

/**
 * Get sentiment color classes
 */
export function getSentimentColor(level: SentimentLevel): string {
  const colors: Record<SentimentLevel, string> = {
    very_bearish: 'text-red-600',
    bearish: 'text-orange-500',
    neutral: 'text-gray-500',
    bullish: 'text-green-500',
    very_bullish: 'text-emerald-600',
  };
  return colors[level];
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Generate mock sparkline data
 */
export function generateSparkline(basePrice: number, volatility: number = 0.02, points: number = 24): number[] {
  const data: number[] = [];
  let price = basePrice * (1 - volatility);

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    price = Math.max(price + change, basePrice * 0.9);
    price = Math.min(price, basePrice * 1.1);
    data.push(price);
  }

  // Make sure last point is close to current price
  data[data.length - 1] = basePrice;

  return data;
}

/**
 * Class name helper
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
