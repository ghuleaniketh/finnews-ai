import React from 'react';
import { Repeat } from 'lucide-react';

/**
 * ThemesList: recurring market narratives and strategic themes tracked over time
 */
export default function ThemesList({ themes = [] }) {
  if (!themes || themes.length === 0) {
    return null;
  }

  return (
    <div className="glass-card section-container">
      <div className="section-header">
        <div className="section-title">
          <Repeat size={18} className="section-title-icon" />
          <span>Recurring Themes ({themes.length})</span>
        </div>
      </div>

      <div className="themes-grid">
        {themes.map((item, idx) => (
          <div key={idx} className="theme-card">
            <div className="theme-name">
              <span className="theme-name-dot" />
              <span>{item.theme}</span>
            </div>
            {item.note && <p className="theme-note">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
