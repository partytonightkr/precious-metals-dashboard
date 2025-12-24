import { SentimentData, NewsItem, MetalType } from '@/types';
import { getSentimentLevel, getSentimentLabel } from './utils';

// Bullish and bearish keywords for simple sentiment analysis
const BULLISH_KEYWORDS = [
  'rally', 'surge', 'soar', 'climb', 'gain', 'rise', 'bullish', 'demand',
  'record', 'high', 'buy', 'investment', 'safe haven', 'inflation hedge',
  'outperform', 'breakout', 'momentum', 'upside', 'growth', 'positive',
];

const BEARISH_KEYWORDS = [
  'drop', 'fall', 'decline', 'plunge', 'crash', 'bearish', 'sell',
  'weak', 'low', 'slump', 'pullback', 'correction', 'downside', 'risk',
  'negative', 'concern', 'fear', 'uncertainty', 'pressure', 'retreat',
];

/**
 * Analyze sentiment of a text
 */
function analyzeText(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;

  BULLISH_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) score += 10;
  });

  BEARISH_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) score -= 10;
  });

  // Clamp between -100 and 100
  return Math.max(-100, Math.min(100, score));
}

/**
 * Generate mock news items
 * In production, this would fetch from NewsAPI or similar
 */
function generateMockNews(): NewsItem[] {
  const mockHeadlines = [
    {
      title: 'Gold prices rally as investors seek safe haven amid market volatility',
      sentiment: 'bullish' as const,
      metals: ['gold'] as MetalType[],
    },
    {
      title: 'Silver demand hits record high from industrial applications',
      sentiment: 'bullish' as const,
      metals: ['silver'] as MetalType[],
    },
    {
      title: 'Copper prices stabilize after recent correction',
      sentiment: 'neutral' as const,
      metals: ['copper'] as MetalType[],
    },
    {
      title: 'Platinum gains momentum on automotive sector recovery',
      sentiment: 'bullish' as const,
      metals: ['platinum'] as MetalType[],
    },
    {
      title: 'Precious metals face headwinds from strong dollar',
      sentiment: 'bearish' as const,
      metals: ['gold', 'silver', 'platinum'] as MetalType[],
    },
    {
      title: 'Central bank gold purchases continue at record pace',
      sentiment: 'bullish' as const,
      metals: ['gold'] as MetalType[],
    },
  ];

  const sources = ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Kitco News'];
  const now = Date.now();

  return mockHeadlines.map((headline, index) => ({
    id: `news-${index}`,
    title: headline.title,
    source: sources[index % sources.length],
    url: '#',
    publishedAt: new Date(now - index * 3600000).toISOString(), // 1 hour apart
    sentiment: headline.sentiment,
    relevantMetals: headline.metals,
  }));
}

/**
 * Calculate overall sentiment from multiple sources
 */
export async function calculateSentiment(): Promise<{
  sentiment: SentimentData;
  news: NewsItem[];
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  const news = generateMockNews();

  // Calculate sentiment from news headlines
  let newsScore = 0;
  news.forEach((item) => {
    if (item.sentiment === 'bullish') newsScore += 15;
    else if (item.sentiment === 'bearish') newsScore -= 15;
  });
  newsScore = Math.max(-100, Math.min(100, newsScore));

  // Mock social sentiment (would come from Reddit/Twitter API)
  const socialScore = Math.floor(Math.random() * 60) - 10; // Slightly bullish bias

  // Momentum score based on recent price action (simplified)
  const momentumScore = Math.floor(Math.random() * 40) + 10; // Positive momentum

  // Weighted average
  const overallScore = Math.round(
    newsScore * 0.4 + socialScore * 0.3 + momentumScore * 0.3
  );

  const level = getSentimentLevel(overallScore);

  return {
    sentiment: {
      score: overallScore,
      level,
      label: getSentimentLabel(level),
      sources: {
        news: newsScore,
        social: socialScore,
        momentum: momentumScore,
      },
      lastUpdated: new Date().toISOString(),
    },
    news,
  };
}

/**
 * Real NewsAPI implementation example (commented out)
 */
/*
const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function fetchRealNews(): Promise<NewsItem[]> {
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=gold+silver+platinum+copper+price&apiKey=${NEWS_API_KEY}&sortBy=publishedAt&pageSize=10`
  );

  const data = await response.json();

  return data.articles.map((article: any) => ({
    id: article.url,
    title: article.title,
    source: article.source.name,
    url: article.url,
    publishedAt: article.publishedAt,
    sentiment: determineSentiment(article.title),
    relevantMetals: detectMetals(article.title),
  }));
}
*/
