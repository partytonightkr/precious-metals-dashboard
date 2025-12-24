'use client';

import { useState, useEffect } from 'react';
import SentimentGauge from '@/components/SentimentGauge';
import NewsPanel from '@/components/NewsPanel';
import { SentimentData, NewsItem } from '@/types';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sentiment');
      const data = await response.json();

      if (data.success) {
        setSentiment(data.sentiment);
        setNews(data.news);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Sentiment</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment gauge */}
        <div className="lg:col-span-1">
          {sentiment ? (
            <SentimentGauge data={sentiment} />
          ) : (
            <div className="h-96 bg-white rounded-xl border border-gray-100 animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Loading sentiment...</span>
            </div>
          )}
        </div>

        {/* News panel */}
        <div className="lg:col-span-2">
          <NewsPanel news={news} />
        </div>
      </div>
    </div>
  );
}
