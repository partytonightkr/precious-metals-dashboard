'use client';

import { MetalPrice, METALS } from '@/types';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceCardProps {
  data: MetalPrice;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function PriceCard({ data, isSelected, onClick }: PriceCardProps) {
  const metal = METALS[data.metal];
  const isPositive = data.changePercent24h >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-200',
        'bg-white border-2 hover:shadow-lg',
        isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
      )}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: metal.color }}
      />

      {/* Metal name and symbol */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{metal.name}</h3>
          <span className="text-xs text-gray-500">{metal.symbol}/{metal.unit}</span>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${metal.color}20` }}
        >
          {metal.id === 'gold' && '🥇'}
          {metal.id === 'silver' && '🥈'}
          {metal.id === 'copper' && '🟤'}
          {metal.id === 'platinum' && '⬜'}
        </div>
      </div>

      {/* Price */}
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(data.price, data.metal === 'copper' ? 2 : 2)}
        </span>
      </div>

      {/* Change */}
      <div className={cn(
        'flex items-center gap-1 text-sm font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{formatPercent(data.changePercent24h)}</span>
        <span className="text-gray-400 text-xs ml-1">24h</span>
      </div>

      {/* Mini sparkline */}
      {data.sparkline && data.sparkline.length > 0 && (
        <div className="mt-3 h-8">
          <Sparkline data={data.sparkline} isPositive={isPositive} />
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
