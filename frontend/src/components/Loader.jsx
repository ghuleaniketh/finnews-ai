import React from 'react';

/**
 * Loader: stylized futuristic spinner with an optional progress message
 */
export default function Loader({ message = 'Loading financial intelligence...' }) {
  return (
    <div className="loader-container">
      <div className="cyber-spinner" />
      {message && <div className="loader-label">{message}</div>}
    </div>
  );
}
