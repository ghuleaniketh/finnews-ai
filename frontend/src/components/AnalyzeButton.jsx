import React from 'react';
import { Zap } from 'lucide-react';

/**
 * AnalyzeButton: triggers automated scrape & synthesis run.
 * Disabled while running (which can take 20-90s on backend).
 * Accepts dynamic loadingText to display staged progress ("Searching news…", etc.)
 */
export default function AnalyzeButton({
  onAnalyze,
  loading = false,
  label = 'Analyze now',
  loadingText,
}) {
  return (
    <button
      type="button"
      className="analyze-btn"
      onClick={onAnalyze}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <div className="pulse-spinner" />
          <span>{loadingText || 'Synthesizing Intelligence...'}</span>
        </>
      ) : (
        <>
          <Zap size={16} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
