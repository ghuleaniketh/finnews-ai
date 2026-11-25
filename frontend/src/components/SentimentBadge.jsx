import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * SentimentBadge: Soft, formal sentiment indicator.
 * Soft green / neutral gray / soft red badges. No loud colors.
 * Values: 'positive' | 'neutral' | 'negative'
 */
export default function SentimentBadge({ sentiment = 'neutral', className = '' }) {
  const norm = String(sentiment).toLowerCase();

  const config = {
    positive: {
      label: 'Bullish / Positive',
      dotColor: 'bg-emerald-600',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50',
    },
    neutral: {
      label: 'Neutral',
      dotColor: 'bg-slate-500',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100',
    },
    negative: {
      label: 'Bearish / Caution',
      dotColor: 'bg-rose-600',
      classes: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-50',
    },
  };

  const current = config[norm] || config.neutral;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium tracking-tight rounded-full border shadow-2xs ${current.classes} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${current.dotColor}`} />
      <span>{current.label}</span>
    </Badge>
  );
}
