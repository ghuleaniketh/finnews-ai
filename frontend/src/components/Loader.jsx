import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loader: Minimal formal light spinner indicator with optional descriptive label.
 */
export default function Loader({ message = 'Loading financial intelligence...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 space-y-3 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
      {message && (
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}
