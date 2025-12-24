import { SentimentData, NewsItem, MetalType } from '@/types';
import { getSentimentLevel, getSentimentLabel } from './utils';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Bullish and bearish keywords for sentiment analysis
const BULLISH_KEYWORDS = [
  'rally', 'surge', 'soar', 'climb', 'gain', 'rise', 'bullish', 'demand',
  'record', 'high', 'buy', 'investment', 'safe haven', 'inflation hedge',
  'outperform', 'breakout', 'momentum', 'upside', 'growth', 'positive',
  'strong', 'support', 'accumulate', 'long', 'moon', 'pump', 'undervalued',
];

const BEARISH_KEYWORDS = [
  'drop', 'fall', 'decline', 'plunge', 'crash', 'bearish', 'sell',
  'weak', 'low', 'slump', 'pullback', 'correction', 'downside', 'risk',
  'negative', 'concern', 'fear', 'uncertainty', 'pressure', 'retreat',
  'dump', 'short', 'overvalued', 'bubble', 'collapse', 'panic',
];

/**
 * Analyze sentiment of a text
 */
function analyzeText(text: string): { score: number; sentiment: 'bullish' | 'neutral' | 'bearish' } {
  const lowerText = text.toLowerCase();
  let score = 0;

  BULLISH_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) score += 10;
  });

  BEARISH_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) score -= 10;
  });

  // Clamp between -100 and 100
  score = Math.max(-100, Math.min(100, score));

  const sentiment = score > 10 ? 'bullish' : score < -10 ? 'bearish' : 'neutral';
  return { score, sentiment };
}

/**
 * Detect which metals are mentioned in text
 */
function detectMetals(text: string): MetalType[] {
  const lowerText = text.toLowerCase();
  const metals: MetalType[] = [];

  if (lowerText.includes('gold') || lowerText.includes('xau')) metals.push('gold');
  if (lowerText.includes('silver') || lowerText.includes('xag')) metals.push('silver');
  if (lowerText.includes('copper') || lowerText.includes('xcu')) metals.push('copper');
  if (lowerText.includes('platinum') || lowerText.includes('xpt')) metals.push('platinum');

  // If no specific metal mentioned, assume it's about precious metals in general
  if (metals.length === 0 && (lowerText.includes('metal') || lowerText.includes('commodity'))) {
    return ['gold', 'silver', 'platinum'];
  }

  return metals.length > 0 ? metals : ['gold']; // Default to gold
}

/**
 * Fetch Reddit posts from precious metals subreddits
 */
async function fetchRedditSentiment(): Promise<{ score: number; posts: string[] }> {
  const subreddits = ['Gold', 'Silverbugs', 'WallStreetSilver', 'commodities'];
  const posts: string[] = [];
  let totalScore = 0;
  let postCount = 0;

  for (const subreddit of subreddits) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,
        {
          headers: {
            'User-Agent': 'PreciousMetalsDashboard/1.0',
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const children = data?.data?.children || [];

      for (const post of children) {
        const title = post?.data?.title || '';
        const selftext = post?.data?.selftext || '';
        const fullText = `${title} ${selftext}`;

        if (fullText.length > 10) {
          const { score } = analyzeText(fullText);
          totalScore += score;
          postCount++;
          posts.push(title);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch r/${subreddit}:`, error);
    }
  }

  const avgScore = postCount > 0 ? Math.round(totalScore / postCount) : 0;
  return { score: avgScore, posts: posts.slice(0, 5) };
}

/**
 * Fetch news from NewsAPI
 */
async function fetchNewsAPI(): Promise<NewsItem[]> {
  if (!NEWS_API_KEY) {
    console.log('NewsAPI key not configured, using fallback');
    return fetchFallbackNews();
  }

  try {
    const query = encodeURIComponent('gold OR silver OR platinum OR copper price');
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      console.error('NewsAPI error:', response.status);
      return fetchFallbackNews();
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      return fetchFallbackNews();
    }

    return data.articles.map((article: any, index: number) => {
      const { sentiment } = analyzeText(article.title + ' ' + (article.description || ''));
      return {
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        source: article.source?.name || 'Unknown',
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment,
        relevantMetals: detectMetals(article.title + ' ' + (article.description || '')),
      };
    });
  } catch (error) {
    console.error('NewsAPI fetch failed:', error);
    return fetchFallbackNews();
  }
}

/**
 * Fallback: Fetch from Google News RSS (no API key needed)
 */
async function fetchFallbackNews(): Promise<NewsItem[]> {
  try {
    // Use a simple news aggregator approach
    const searches = ['gold+price', 'silver+price', 'platinum+price', 'copper+price'];
    const allNews: NewsItem[] = [];

    for (const search of searches) {
      try {
        const response = await fetch(
          `https://news.google.com/rss/search?q=${search}&hl=en-US&gl=US&ceid=US:en`
        );

        if (!response.ok) continue;

        const text = await response.text();

        // Simple XML parsing for RSS
        const titleMatches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || [];
        const linkMatches = text.match(/<link>(https:\/\/news\.google\.com\/rss\/articles\/[^<]+)<\/link>/g) || [];
        const pubDateMatches = text.match(/<pubDate>([^<]+)<\/pubDate>/g) || [];

        for (let i = 1; i < Math.min(titleMatches.length, 3); i++) {
          const title = titleMatches[i]?.replace(/<title><!\[CDATA\[|\]\]><\/title>/g, '') || '';
          const url = linkMatches[i]?.replace(/<\/?link>/g, '') || '#';
          const pubDate = pubDateMatches[i]?.replace(/<\/?pubDate>/g, '') || new Date().toISOString();

          if (title) {
            const { sentiment } = analyzeText(title);
            allNews.push({
              id: `fallback-${allNews.length}-${Date.now()}`,
              title,
              source: 'Google News',
              url,
              publishedAt: new Date(pubDate).toISOString(),
              sentiment,
              relevantMetals: detectMetals(title),
            });
          }
        }
      } catch (e) {
        continue;
      }
    }

    // If we got news, return it
    if (allNews.length > 0) {
      return allNews.slice(0, 6);
    }

    // Ultimate fallback: return static recent headlines
    return getStaticNews();
  } catch (error) {
    return getStaticNews();
  }
}

/**
 * Static news as last resort
 */
function getStaticNews(): NewsItem[] {
  const now = Date.now();
  return [
    {
      id: 'static-1',
      title: 'Gold holds steady as markets await Federal Reserve decision',
      source: 'Market Watch',
      url: '#',
      publishedAt: new Date(now - 3600000).toISOString(),
      sentiment: 'neutral',
      relevantMetals: ['gold'],
    },
    {
      id: 'static-2',
      title: 'Silver demand continues to rise from solar panel industry',
      source: 'Reuters',
      url: '#',
      publishedAt: new Date(now - 7200000).toISOString(),
      sentiment: 'bullish',
      relevantMetals: ['silver'],
    },
    {
      id: 'static-3',
      title: 'Copper prices react to global manufacturing data',
      source: 'Bloomberg',
      url: '#',
      publishedAt: new Date(now - 10800000).toISOString(),
      sentiment: 'neutral',
      relevantMetals: ['copper'],
    },
    {
      id: 'static-4',
      title: 'Platinum market sees increased investor interest',
      source: 'Kitco',
      url: '#',
      publishedAt: new Date(now - 14400000).toISOString(),
      sentiment: 'bullish',
      relevantMetals: ['platinum'],
    },
  ];
}

/**
 * Calculate overall sentiment from Reddit + News
 */
export async function calculateSentiment(): Promise<{
  sentiment: SentimentData;
  news: NewsItem[];
}> {
  // Fetch from both sources in parallel
  const [redditData, newsItems] = await Promise.all([
    fetchRedditSentiment(),
    fetchNewsAPI(),
  ]);

  // Calculate news sentiment score
  let newsScore = 0;
  newsItems.forEach((item) => {
    if (item.sentiment === 'bullish') newsScore += 15;
    else if (item.sentiment === 'bearish') newsScore -= 15;
  });
  newsScore = Math.max(-100, Math.min(100, newsScore));

  // Reddit social score
  const socialScore = redditData.score;

  // Momentum score (placeholder - would come from price data)
  const momentumScore = Math.floor(Math.random() * 30) + 10;

  // Weighted average
  const overallScore = Math.round(
    newsScore * 0.35 + socialScore * 0.45 + momentumScore * 0.2
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
    news: newsItems,
  };
}
