import React from 'react';
import { Link2, ExternalLink } from 'lucide-react';

/**
 * SourcesList: scraped articles and primary financial reporting sources
 */
export default function SourcesList({ sources = [] }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="glass-card section-container">
        <div className="section-header">
          <div className="section-title">
            <Link2 size={18} className="section-title-icon" />
            <span>Scraped Sources</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
          No primary sources linked for this entry.
        </p>
      </div>
    );
  }

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'external';
    }
  };

  return (
    <div className="glass-card section-container sources-card">
      <div className="section-header">
        <div className="section-title">
          <Link2 size={18} className="section-title-icon" />
          <span>Scraped Sources ({sources.length})</span>
        </div>
      </div>

      <div className="sources-grid">
        {sources.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-item"
            title={item.title}
          >
            <div className="source-title">
              <ExternalLink size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <span>{item.title}</span>
            </div>
            <span className="source-domain">{getDomain(item.url)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
