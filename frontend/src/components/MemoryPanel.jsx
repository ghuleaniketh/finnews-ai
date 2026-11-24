import React from 'react';
import { Brain, Cpu } from 'lucide-react';

/**
 * MemoryPanel: displays the contextual memory nodes recalled and applied
 * during this intelligence synthesis (the system's evolving memory).
 */
export default function MemoryPanel({ memoryItems = [] }) {
  if (!memoryItems || memoryItems.length === 0) {
    return null;
  }

  return (
    <div className="glass-card section-container memory-panel-card">
      <div className="section-header">
        <div className="section-title" style={{ color: '#c084fc' }}>
          <Brain size={18} style={{ color: '#c084fc' }} />
          <span>Memory Recalled & Applied</span>
        </div>
        <span className="memory-badge">
          <Cpu size={12} />
          <span>Context Graph</span>
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px' }}>
        The synthesis engine integrated the following historical findings and analyst notes:
      </p>

      <div className="memory-items-list">
        {memoryItems.map((item, idx) => (
          <div key={idx} className="memory-item">
            <div className="memory-item-icon">
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc' }} />
            </div>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
