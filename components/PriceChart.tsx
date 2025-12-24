'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MetalType, Timeframe, TIMEFRAMES, METALS, PriceDataPoint } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface PriceChartProps {
  selectedMetal: MetalType;
}

export default function PriceChart({ selectedMetal }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [data, setData] = useState<PriceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const metal = METALS[selectedMetal];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/history?metal=${selectedMetal}&timeframe=${timeframe}`
        );
        const result = await response.json();
        if (result.success) {
          setData(result.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
      setIsLoading(false);
    }

    fetchData();
  }, [selectedMetal, timeframe]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (timeframe === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceChange = data.length > 1 ? data[data.length - 1].price - data[0].price : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {metal.name} Price Chart
          </h3>
          <p className="text-sm text-gray-500">{metal.symbol}/USD</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                timeframe === tf.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice * 0.995, maxPrice * 1.005]}
                tickFormatter={(value) => formatCurrency(value, 0)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as PriceDataPoint;
                    return (
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
                        <div className="text-sm text-gray-400">
                          {new Date(point.timestamp).toLocaleString()}
                        </div>
                        <div className="text-lg font-bold">
                          {formatCurrency(point.price)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div>
          <div className="text-sm text-gray-500">Period Low</div>
          <div className="font-semibold text-gray-900">{formatCurrency(minPrice)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Period High</div>
          <div className="font-semibold text-gray-900">{formatCurrency(maxPrice)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Change</div>
          <div className={cn('font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
            {isPositive ? '+' : ''}{formatCurrency(priceChange)}
          </div>
        </div>
      </div>
    </div>
  );
}
