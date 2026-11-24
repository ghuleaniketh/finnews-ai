import React from 'react';
import { GitCompare, Sparkles } from 'lucide-react';

/**
 * WhatChanged: prominent card highlighting the intelligence diff
 * between current scrape and the system's retained memory.
 */
export default function WhatChanged({ whatChanged, previousDate }) {
  if (!whatChanged) return null;

  return (
    <div className="what-changed-card">
      <div className="what-changed-header">
        <div className="what-changed-title-row">
          <GitCompare size={18} style={{ color: '#818cf8' }} />
          <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f8fafc' }}>
            What Changed Since Last Run
          </span>
        </div>
        <div className="what-changed-tag">
          <Sparkles size={12} />
          <span>Evolving Memory Diff</span>
        </div>
      </div>
      <p className="what-changed-text">{whatChanged}</p>
    </div>
  );
}
