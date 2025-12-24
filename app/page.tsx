'use client';

import { useState, useEffect } from 'react';
import PriceCard from '@/components/PriceCard';
import SentimentGauge from '@/components/SentimentGauge';
import PriceChart from '@/components/PriceChart';
import NewsPanel from '@/components/NewsPanel';
import { MetalPrice, MetalType, SentimentData, NewsItem } from '@/types';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [prices, setPrices] = useState<MetalPrice[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('gold');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch prices and sentiment in parallel
      const [pricesRes, sentimentRes] = await Promise.all([
        fetch('/api/prices'),
        fetch('/api/sentiment'),
      ]);

      const pricesData = await pricesRes.json();
      const sentimentData = await sentimentRes.json();

      if (pricesData.success) {
        setPrices(pricesData.prices);
      }

      if (sentimentData.success) {
        setSentiment(sentimentData.sentiment);
        setNews(sentimentData.news);
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
      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <div>
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

      {/* Price cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {prices.map((price) => (
          <PriceCard
            key={price.metal}
            data={price}
            isSelected={price.metal === selectedMetal}
            onClick={() => setSelectedMetal(price.metal)}
          />
        ))}

        {/* Loading skeletons */}
        {isLoading && prices.length === 0 && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-white rounded-xl border border-gray-100 animate-pulse"
              />
            ))}
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment gauge */}
        <div className="lg:col-span-1">
          {sentiment ? (
            <SentimentGauge data={sentiment} />
          ) : (
            <div className="h-96 bg-white rounded-xl border border-gray-100 animate-pulse" />
          )}
        </div>

        {/* Price chart */}
        <div className="lg:col-span-2">
          <PriceChart selectedMetal={selectedMetal} />
        </div>
      </div>

      {/* News panel */}
      <NewsPanel news={news} />
    </div>
  );
}
