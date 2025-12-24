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

  if (metals.length === 0 && (lowerText.includes('metal') || lowerText.includes('commodity'))) {
    return ['gold', 'silver', 'platinum'];
  }

  return metals.length > 0 ? metals : ['gold'];
}

/**
 * Fetch Reddit posts from precious metals subreddits
 */
async function fetchRedditSentiment(): Promise<{ score: number; posts: any[] }> {
  const subreddits = ['Gold', 'Silverbugs', 'WallStreetSilver', 'commodities'];
  const posts: any[] = [];
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
        const postData = post?.data;
        if (!postData) continue;

        const title = postData.title || '';
        const selftext = postData.selftext || '';
        const fullText = `${title} ${selftext}`;
        const permalink = postData.permalink || '';
        const created = postData.created_utc || Date.now() / 1000;

        if (fullText.length > 10) {
          const { score } = analyzeText(fullText);
          totalScore += score;
          postCount++;

          posts.push({
            title,
            url: `https://www.reddit.com${permalink}`,
            source: `r/${subreddit}`,
            created: new Date(created * 1000).toISOString(),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch r/${subreddit}:`, error);
    }
  }

  const avgScore = postCount > 0 ? Math.round(totalScore / postCount) : 0;
  return { score: avgScore, posts: posts.slice(0, 10) };
}

/**
 * Fetch news from NewsAPI
 */
async function fetchNewsAPI(): Promise<NewsItem[]> {
  if (!NEWS_API_KEY) {
    return [];
  }

  try {
    const query = encodeURIComponent('gold OR silver OR platinum OR copper price');
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      return [];
    }

    return data.articles.map((article: any, index: number) => {
      const { sentiment } = analyzeText(article.title + ' ' + (article.description || ''));
      return {
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        source: article.source?.name || 'News',
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment,
        relevantMetals: detectMetals(article.title + ' ' + (article.description || '')),
      };
    });
  } catch (error) {
    console.error('NewsAPI fetch failed:', error);
    return [];
  }
}

/**
 * Convert Reddit posts to NewsItem format
 */
function redditPostsToNews(posts: any[]): NewsItem[] {
  return posts.map((post, index) => {
    const { sentiment } = analyzeText(post.title);
    return {
      id: `reddit-${index}-${Date.now()}`,
      title: post.title,
      source: post.source,
      url: post.url,
      publishedAt: post.created,
      sentiment,
      relevantMetals: detectMetals(post.title),
    };
  });
}

/**
 * Calculate overall sentiment from Reddit + News
 */
export async function calculateSentiment(): Promise<{
  sentiment: SentimentData;
  news: NewsItem[];
}> {
  // Fetch from both sources in parallel
  const [redditData, newsApiItems] = await Promise.all([
    fetchRedditSentiment(),
    fetchNewsAPI(),
  ]);

  // Convert Reddit posts to news format
  const redditNews = redditPostsToNews(redditData.posts);

  // Combine news sources (NewsAPI first if available, then Reddit)
  const allNews = [...newsApiItems, ...redditNews].slice(0, 8);

  // Calculate news sentiment score
  let newsScore = 0;
  allNews.forEach((item) => {
    if (item.sentiment === 'bullish') newsScore += 15;
    else if (item.sentiment === 'bearish') newsScore -= 15;
  });
  newsScore = Math.max(-100, Math.min(100, newsScore));

  // Reddit social score (from post analysis)
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
    news: allNews,
  };
}
