import React from 'react';
import Icon from './Icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * ErrorBanner: Clean minimal light notification for network or API errors.
 * Soft red palette (#F5E0DB on #9B3B2E text).
 */
export default function ErrorBanner({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';

  return (
    <Alert className="mb-4 bg-[#F5E0DB] border-[#E8C6BE] text-[#9B3B2E] flex items-center justify-between p-3.5 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <Icon name="error" size={16} className="text-[#9B3B2E] shrink-0" />
        <AlertDescription className="text-xs font-medium text-[#9B3B2E] truncate">
          {errorMessage}
        </AlertDescription>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-8 px-2.5 text-xs bg-[#FFFDF8] text-[#9B3B2E] border-[#E8C6BE] hover:bg-[#F5E0DB] min-h-[36px]"
          >
            <Icon name="refresh" size={13} className="mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            aria-label="Dismiss error notice"
            className="h-8 w-8 text-[#9B3B2E] hover:bg-[#F5E0DB] min-h-[36px] min-w-[36px]"
          >
            <Icon name="close" size={16} />
          </Button>
        )}
      </div>
    </Alert>
  );
}
