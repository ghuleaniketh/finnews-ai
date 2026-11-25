import React from 'react';
import Icon from './Icon';

/**
 * Loader: Minimal formal warm cream spinner indicator with optional descriptive label.
 */
export default function Loader({ message = 'Loading financial intelligence...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 space-y-3 text-center">
      <Icon name="progress_activity" size={26} className="animate-spin text-primary" />
      {message && (
        <p className="text-xs font-medium text-muted-foreground tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}
