import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AnalyzeButton: triggers automated scrape & synthesis run.
 * Disabled while running (staged progress displayed via loadingText).
 */
export default function AnalyzeButton({
  onAnalyze,
  loading = false,
  label = 'Analyze now',
  loadingText,
}) {
  return (
    <Button
      type="button"
      onClick={onAnalyze}
      disabled={loading}
      aria-busy={loading}
      className="min-h-[40px] px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-xs transition-colors"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
          <span>{loadingText || 'Synthesizing...'}</span>
        </>
      ) : (
        <>
          <Zap className="mr-1.5 h-4 w-4 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
