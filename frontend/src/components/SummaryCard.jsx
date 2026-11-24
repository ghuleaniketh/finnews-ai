import React from 'react';
import SentimentBadge from './SentimentBadge';
import { ShieldAlert, Calendar } from 'lucide-react';

/**
 * SummaryCard: shows core headline, sentiment & risk badges,
 * synthesized executive summary, and recognized entity tags.
 */
export default function SummaryCard({
  headline,
  summary,
  sentiment = 'neutral',
  riskLevel = 'medium',
  entities = [],
  createdAt,
}) {
  const normRisk = String(riskLevel).toLowerCase();
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
    <div className="glass-card summary-card">
      <div className="summary-header-row">
        <h2 className="summary-headline">{headline || 'Analysis Summary'}</h2>
        <div className="summary-badge-group">
          <SentimentBadge sentiment={sentiment} />
          <span className={`risk-badge ${normRisk}`}>
            <ShieldAlert size={14} />
            {riskLevel} risk
          </span>
        </div>
      </div>

      {formattedDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
          <Calendar size={13} />
          <span>Synthesized on {formattedDate}</span>
        </div>
      )}

      <p className="summary-body">{summary}</p>

      {entities && entities.length > 0 && (
        <div className="entity-tags-row">
          <span className="entity-tag-label">Identified Entities:</span>
          {entities.map((entity, idx) => (
            <span key={`${entity}-${idx}`} className="entity-pill">
              {entity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
