import React from 'react';
import { History, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

/**
 * HistoryTimeline: displays chronological analysis runs, clickable to inspect
 * any run, plus a mini sentiment-over-time trend chart via recharts.
 */
export default function HistoryTimeline({
  analyses = [],
  selectedId,
  onSelectAnalysis,
}) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="glass-card history-card">
        <div className="section-header">
          <div className="section-title">
            <History size={18} className="section-title-icon" />
            <span>Analysis History</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
          No prior analysis history yet. Click "Analyze now" to generate the baseline.
        </p>
      </div>
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
        <div
          style={{
            background: 'rgba(10, 14, 25, 0.95)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: 'var(--shadow-glass)',
            maxWidth: '240px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {data.fullDate}
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
            Sentiment: <span style={{ textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>{data.sentiment}</span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {data.headline}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card history-card">
      <div className="section-header">
        <div className="section-title">
          <History size={18} className="section-title-icon" />
          <span>Analysis History ({analyses.length})</span>
        </div>
      </div>

      {chartData.length > 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <TrendingUp size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span>Sentiment Trend Over Time</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dateStr"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  domain={[-1, 1]}
                  ticks={[-1, 0, 1]}
                  stroke="#475569"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val === 1 ? 'Bull' : val === -1 ? 'Bear' : 'Neu')}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#sentimentGradient)"
                  dot={{ r: 3, fill: '#818cf8' }}
                  activeDot={{ r: 5, fill: '#38bdf8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="timeline-list">
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
              className={`timeline-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectAnalysis && onSelectAnalysis(item)}
              role="button"
              tabIndex={0}
            >
              <div className="timeline-dot" />
              <div className="timeline-date-row">
                <span className="timeline-date">{dateStr}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color:
                      item.sentiment === 'positive'
                        ? 'var(--sentiment-pos-text)'
                        : item.sentiment === 'negative'
                        ? 'var(--sentiment-neg-text)'
                        : 'var(--sentiment-neu-text)',
                  }}
                >
                  {item.sentiment}
                </span>
              </div>
              <p className="timeline-headline">{item.headline}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
