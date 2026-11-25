import React from 'react';
import Icon from './Icon';
import { Button } from '@/components/ui/button';

/**
 * AnalyzeButton: triggers automated scrape & synthesis run.
 * Uses primary dark brown styling with strong contrast.
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
      className="min-h-[40px] px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs transition-colors"
    >
      {loading ? (
        <>
          <Icon name="progress_activity" size={16} className="animate-spin mr-1.5 shrink-0" />
          <span>{loadingText || 'Synthesizing...'}</span>
        </>
      ) : (
        <>
          <Icon name="bolt" size={16} className="mr-1.5 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
