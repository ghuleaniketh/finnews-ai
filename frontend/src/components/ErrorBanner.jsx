import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * ErrorBanner: Clean minimal light notification for network or API errors.
 */
export default function ErrorBanner({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';

  return (
    <Alert className="mb-4 bg-rose-50 border-rose-200 text-rose-900 flex items-center justify-between p-3.5 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
        <AlertDescription className="text-xs font-medium text-rose-800 truncate">
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
            className="h-8 px-2.5 text-xs bg-white text-rose-800 border-rose-300 hover:bg-rose-100 hover:text-rose-900 min-h-[36px]"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
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
            className="h-8 w-8 text-rose-600 hover:bg-rose-100 hover:text-rose-800 min-h-[36px] min-w-[36px]"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
