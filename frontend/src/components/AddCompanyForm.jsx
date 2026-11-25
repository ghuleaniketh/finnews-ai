import React, { useState } from 'react';
import Icon from './Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * AddCompanyForm: Form to add a company/topic to watchlist with name and optional ticker.
 * Styled with warm cream palette tokens and Material Symbols.
 */
export default function AddCompanyForm({ onAdd, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company or topic name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onAdd({ name: name.trim(), ticker: ticker.trim() });
      setName('');
      setTicker('');
      if (onSuccess) {
        onSuccess();
      } else if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError(err.message || 'Failed to add entity to watchlist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-[#9B3B2E] bg-[#F5E0DB] border border-[#E8C6BE] rounded-md">
          <Icon name="error" size={16} className="shrink-0 text-[#9B3B2E]" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="company-name" className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Company or Topic <span className="text-[#9B3B2E]">*</span>
        </Label>
        <Input
          id="company-name"
          type="text"
          placeholder="e.g. Apple, HDFC Bank, Quantum Computing"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          disabled={submitting}
          autoFocus
          className="h-10 text-sm bg-card border-border"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company-ticker" className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Ticker / Symbol <span className="text-muted-foreground font-normal lowercase">(optional)</span>
        </Label>
        <Input
          id="company-ticker"
          type="text"
          placeholder="e.g. AAPL, HDFCBANK.NS"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          disabled={submitting}
          className="h-10 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans bg-card border-border"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="h-10 min-w-[80px]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!name.trim() || submitting}
          className="h-10 min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {submitting ? (
            <>
              <Icon name="progress_activity" size={16} className="animate-spin mr-1.5" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Icon name="add" size={16} className="mr-1.5" />
              <span>Add to Watchlist</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
