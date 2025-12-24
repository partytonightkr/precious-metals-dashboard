'use client';

import { SentimentData } from '@/types';
import { getSentimentEmoji, getSentimentColor, cn } from '@/lib/utils';

interface SentimentGaugeProps {
  data: SentimentData;
}

export default function SentimentGauge({ data }: SentimentGaugeProps) {
  const { score, level, label, sources } = data;

  // Calculate gauge rotation (-90 to 90 degrees, mapping -100 to 100)
  const rotation = (score / 100) * 90;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Sentiment</h3>

      {/* Gauge */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Gauge background */}
          <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-20" />

          {/* Gauge segments */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Colored arc based on sentiment */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="url(#sentimentGradient)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="75%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Needle */}
          <div
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-gray-800 rounded-full origin-bottom transition-transform duration-500"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full" />
          </div>

          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full" />
        </div>

        {/* Score and label */}
        <div className="mt-4 text-center">
          <div className="text-4xl mb-1">{getSentimentEmoji(level)}</div>
          <div className={cn('text-xl font-bold', getSentimentColor(level))}>
            {label}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {score > 0 ? '+' : ''}{score}
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500">Signal Sources</h4>

        <SourceBar label="News" value={sources.news} />
        <SourceBar label="Social" value={sources.social} />
        <SourceBar label="Momentum" value={sources.momentum} />
      </div>
    </div>
  );
}

function SourceBar({ label, value }: { label: string; value: number }) {
  const percentage = ((value + 100) / 200) * 100; // Map -100..100 to 0..100
  const isPositive = value >= 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={cn('font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
          {value > 0 ? '+' : ''}{value}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isPositive ? 'bg-green-500' : 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
