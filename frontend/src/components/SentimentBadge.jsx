import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * SentimentBadge: Warm cream minimal formal sentiment indicator.
 * Palette:
 * - Positive: soft green (#E4EFDF on #3F6B35 text)
 * - Neutral: tan (#EFE6D2 on #6B5B45 text)
 * - Negative: soft red (#F5E0DB on #9B3B2E text)
 * Values: 'positive' | 'neutral' | 'negative'
 */
export default function SentimentBadge({ sentiment = 'neutral', className = '' }) {
  const norm = String(sentiment).toLowerCase();

  const config = {
    positive: {
      label: 'Bullish / Positive',
      dotColor: 'bg-[#3F6B35]',
      classes: 'bg-[#E4EFDF] text-[#3F6B35] border-[#C9DEC2]',
    },
    neutral: {
      label: 'Neutral',
      dotColor: 'bg-[#6B5B45]',
      classes: 'bg-[#EFE6D2] text-[#6B5B45] border-[#DFD3B9]',
    },
    negative: {
      label: 'Bearish / Caution',
      dotColor: 'bg-[#9B3B2E]',
      classes: 'bg-[#F5E0DB] text-[#9B3B2E] border-[#E8C6BE]',
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
