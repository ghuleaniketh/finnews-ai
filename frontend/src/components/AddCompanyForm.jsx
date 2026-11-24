import React, { useState } from 'react';
import { PlusCircle, X, Check } from 'lucide-react';

/**
 * AddCompanyForm: form to add a company/topic to watchlist with name and optional ticker
 */
export default function AddCompanyForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onAdd({ name: name.trim(), ticker: ticker.trim() });
      setName('');
      setTicker('');
      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message || 'Failed to add to watchlist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-company-container">
      <form onSubmit={handleSubmit} className="add-company-form">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Add to Watchlist
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ color: 'var(--text-muted)', padding: '2px' }}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {error && (
          <div style={{ color: 'var(--sentiment-neg-text)', fontSize: '0.74rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="company-name">Company / Topic *</label>
          <input
            id="company-name"
            className="form-input"
            type="text"
            placeholder="e.g. HDFC Bank, Tesla, AI Chips"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="company-ticker">Ticker / Symbol (optional)</label>
          <input
            id="company-ticker"
            className="form-input"
            type="text"
            placeholder="e.g. HDFCBANK.NS, TSLA"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-actions-row">
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem' }}
            disabled={!name.trim() || submitting}
          >
            <Check size={13} />
            <span>{submitting ? 'Adding...' : 'Add Watchlist'}</span>
          </button>
          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '7px 10px', fontSize: '0.8rem' }}
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
