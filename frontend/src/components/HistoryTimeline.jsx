import React from 'react';
import Icon from './Icon';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SentimentBadge from './SentimentBadge';

/**
 * HistoryTimeline: Sentiment trend chart over time + chronological list of historical runs.
 * Chart: line #3B2F24 (dark brown) with area fill #E8DCC2 (tan).
 */
export default function HistoryTimeline({
  analyses = [],
  selectedId,
  onSelectAnalysis,
}) {
  if (!analyses || analyses.length === 0) {
    return (
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center gap-2">
            <Icon name="history" size={16} className="text-foreground" />
            <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
              Analysis History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-2">
          <p className="text-xs text-muted-foreground italic">
            No prior analysis history yet. Click "Analyze now" to generate your first baseline report.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform analyses for chronological sentiment chart (oldest to newest)
  const sentimentScoreMap = {
    positive: 1,
    neutral: 0,
    negative: -1,
  };

  const chartData = [...analyses]
    .reverse()
    .map((item) => {
      const date = new Date(item.created_at);
      const score = sentimentScoreMap[String(item.sentiment).toLowerCase()] ?? 0;
      return {
        id: item.id,
        dateStr: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        score,
        sentiment: item.sentiment,
        headline: item.headline,
      };
    });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border shadow-md rounded-md p-2.5 max-w-xs text-xs space-y-1">
          <div className="text-[11px] font-mono text-muted-foreground">
            {data.fullDate}
          </div>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <span>Sentiment:</span>
            <span className="capitalize text-primary">{data.sentiment}</span>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-[11px]">
            {data.headline}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Sentiment Chart Card (when 2+ data points exist) */}
      {chartData.length > 1 && (
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2">
              <Icon name="trending_up" size={16} className="text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
                Sentiment Trajectory Over Time
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Chronological market sentiment derived from news synthesis runs
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-2">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentimentGradientWarm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8DCC2" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E8DCC2" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dateStr"
                    stroke="#7A6B58"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E3D9C4' }}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    ticks={[-1, 0, 1]}
                    stroke="#7A6B58"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val === 1 ? 'Bullish' : val === -1 ? 'Bearish' : 'Neutral')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3B2F24"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sentimentGradientWarm)"
                    dot={{ r: 3, fill: '#3B2F24' }}
                    activeDot={{ r: 5, fill: '#B89B6A' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline List Card */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="history" size={16} className="text-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
                Historical Runs ({analyses.length})
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              Click run to inspect
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-2">
          <div className="divide-y divide-border">
            {analyses.map((item) => {
              const isSelected = item.id === selectedId;
              const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAnalysis && onSelectAnalysis(item)}
                  role="button"
                  tabIndex={0}
                  className={`py-3 px-2 -mx-2 rounded-md transition-colors cursor-pointer flex flex-col gap-1 min-h-[44px] ${
                    isSelected
                      ? 'bg-accent border-l-2 border-l-[#B89B6A] pl-3 font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <Icon name="calendar_today" size={13} className="text-muted-foreground" />
                      {dateStr}
                    </span>
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                    {item.headline}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
