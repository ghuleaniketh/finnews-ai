import React from 'react';
import SentimentBadge from './SentimentBadge';
import { ShieldAlert, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RiskBadge({ riskLevel = 'medium', className = '' }) {
  const norm = String(riskLevel).toLowerCase();
  const styles = {
    low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    high: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium capitalize rounded-full ${
        styles[norm] || styles.medium
      } ${className}`}
    >
      <ShieldAlert className="h-3 w-3 shrink-0" />
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
    <Card className="bg-white border border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug">
            {headline || 'Executive Analysis Summary'}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <SentimentBadge sentiment={sentiment} />
            <RiskBadge riskLevel={riskLevel} />
          </div>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono pt-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Synthesized {formattedDate}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed font-normal">
          {summary}
        </p>

        {entities && entities.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Recognized Entities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entities.map((entity, idx) => (
                <span
                  key={`${entity}-${idx}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
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
