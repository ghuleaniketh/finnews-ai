import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Plus } from 'lucide-react';

/**
 * AddCompanyForm: Form to add a company/topic to watchlist with name and optional ticker.
 * Styled with shadcn/ui components for light minimal formal theme.
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
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="company-name" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          Company or Topic <span className="text-rose-500">*</span>
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
          className="h-10 text-sm bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company-ticker" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          Ticker / Symbol <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </Label>
        <Input
          id="company-ticker"
          type="text"
          placeholder="e.g. AAPL, HDFCBANK.NS"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          disabled={submitting}
          className="h-10 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans bg-white"
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
          className="h-10 min-w-[120px] bg-blue-700 hover:bg-blue-800 text-white font-medium"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Add to Watchlist</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
