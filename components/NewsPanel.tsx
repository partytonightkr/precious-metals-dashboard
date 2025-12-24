'use client';

import { NewsItem } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsPanelProps {
  news: NewsItem[];
}

export default function NewsPanel({ news }: NewsPanelProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest News</h3>

      <div className="space-y-4">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No news available
        </div>
      )}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const sentimentConfig = {
    bullish: {
      icon: TrendingUp,
      label: 'Bullish',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    neutral: {
      icon: Minus,
      label: 'Neutral',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    bearish: {
      icon: TrendingDown,
      label: 'Bearish',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  };

  const sentiment = sentimentConfig[item.sentiment];
  const SentimentIcon = sentiment.icon;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {item.title}
            </h4>

            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-gray-500">{item.source}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">{formatRelativeTime(item.publishedAt)}</span>
            </div>

            {/* Metal tags */}
            <div className="flex gap-1 mt-2">
              {item.relevantMetals.map((metal) => (
                <span
                  key={metal}
                  className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded"
                >
                  {metal.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Sentiment badge */}
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', sentiment.bg, sentiment.color)}>
            <SentimentIcon className="w-3 h-3" />
            <span>{sentiment.label}</span>
          </div>
        </div>

        {/* External link indicator */}
        <div className="flex justify-end mt-2">
          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>
    </a>
  );
}
