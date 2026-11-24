import React from 'react';

/**
 * SentimentBadge: displays sentiment status with glowing dot indicator
 * Values: 'positive' | 'neutral' | 'negative'
 */
export default function SentimentBadge({ sentiment = 'neutral' }) {
  const norm = String(sentiment).toLowerCase();

  const labels = {
    positive: 'Bullish / Positive',
    neutral: 'Neutral',
    negative: 'Bearish / Caution',
  };

  const label = labels[norm] || sentiment;

  return (
    <span className={`sentiment-badge ${norm}`}>
      <span className="sentiment-dot" />
      {label}
    </span>
  );
}
