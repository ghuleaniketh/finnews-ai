import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

/**
 * KeyEvents: list of critical financial events detected in current news scrape
 */
export default function KeyEvents({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-card section-container">
        <div className="section-header">
          <div className="section-title">
            <Newspaper size={18} className="section-title-icon" />
            <span>Key Events</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
          No specific events cataloged for this analysis run.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card section-container">
      <div className="section-header">
        <div className="section-title">
          <Newspaper size={18} className="section-title-icon" />
          <span>Key Events ({events.length})</span>
        </div>
      </div>

      <div className="events-list">
        {events.map((evt, idx) => (
          <div key={idx} className="event-card">
            <div className="event-title-row">
              <h4 className="event-title">{evt.title}</h4>
              {evt.source_url && (
                <a
                  href={evt.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-link"
                  title="Open source coverage"
                >
                  <span>Source</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            {evt.detail && <p className="event-detail">{evt.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
