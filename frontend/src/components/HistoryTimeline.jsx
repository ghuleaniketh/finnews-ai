import React from 'react';
import { History, TrendingUp, Calendar } from 'lucide-react';
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
 * Clicking any run allows the user to inspect historical synthesis details.
 */
export default function HistoryTimeline({
  analyses = [],
  selectedId,
  onSelectAnalysis,
}) {
  if (!analyses || analyses.length === 0) {
    return (
      <Card className="bg-white border border-border shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
              Analysis History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-2">
          <p className="text-xs text-slate-500 italic">
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
        <div className="bg-white border border-border shadow-md rounded-md p-2.5 max-w-xs text-xs space-y-1">
          <div className="text-[11px] font-mono text-slate-500">
            {data.fullDate}
          </div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span>Sentiment:</span>
            <span className="capitalize text-blue-700">{data.sentiment}</span>
          </div>
          <p className="text-slate-600 line-clamp-2 text-[11px]">
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
        <Card className="bg-white border border-border shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-700" />
              <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
                Sentiment Trajectory Over Time
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Chronological market sentiment derived from news synthesis runs
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-2">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentimentGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dateStr"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    ticks={[-1, 0, 1]}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val === 1 ? 'Bullish' : val === -1 ? 'Bearish' : 'Neutral')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sentimentGradientLight)"
                    dot={{ r: 3, fill: '#1d4ed8' }}
                    activeDot={{ r: 5, fill: '#1e40af' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline List Card */}
      <Card className="bg-white border border-border shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
                Historical Runs ({analyses.length})
              </CardTitle>
            </div>
            <span className="text-xs text-slate-500">
              Click run to inspect
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-2">
          <div className="divide-y divide-border/60">
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
                      ? 'bg-blue-50/80 border-l-2 border-l-blue-700 pl-3'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {dateStr}
                    </span>
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                  <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">
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
