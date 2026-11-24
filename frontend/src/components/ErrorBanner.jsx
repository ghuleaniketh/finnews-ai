import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

/**
 * ErrorBanner: notifies user of API or network errors with dismiss/retry options
 */
export default function ErrorBanner({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-content">
        <AlertTriangle size={18} />
        <span>{errorMessage}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onRetry && (
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.74rem' }}
            onClick={onRetry}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
