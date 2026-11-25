import React from 'react';
import SentimentBadge from './SentimentBadge';
import Icon from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RiskBadge({ riskLevel = 'medium', className = '' }) {
  const norm = String(riskLevel).toLowerCase();
  const styles = {
    low: 'bg-[#E4EFDF] text-[#3F6B35] border-[#C9DEC2]',
    medium: 'bg-[#EFE6D2] text-[#6B5B45] border-[#DFD3B9]',
    high: 'bg-[#F5E0DB] text-[#9B3B2E] border-[#E8C6BE]',
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium capitalize rounded-full ${
        styles[norm] || styles.medium
      } ${className}`}
    >
      <Icon name="shield" size={13} />
      <span>{riskLevel} Risk</span>
    </Badge>
  );
}

/**
 * SummaryCard: Core headline, executive summary, badges, timestamp, and recognized entity tags.
 */
export default function SummaryCard({
  headline,
  summary,
  sentiment = 'neutral',
  riskLevel = 'medium',
  entities = [],
  createdAt,
}) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
            {headline || 'Executive Analysis Summary'}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <SentimentBadge sentiment={sentiment} />
            <RiskBadge riskLevel={riskLevel} />
          </div>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono pt-1">
            <Icon name="calendar_today" size={13} className="text-muted-foreground" />
            <span>Synthesized {formattedDate}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed font-normal">
          {summary}
        </p>

        {entities && entities.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Recognized Entities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entities.map((entity, idx) => (
                <span
                  key={`${entity}-${idx}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground border border-border"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
