import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ errorMessage, onRetry }) {
  return (
    <div className="state-container error-state" role="alert">
      <div className="state-icon-wrapper error-icon">
        <AlertTriangle size={36} strokeWidth={1.5} />
      </div>
      <h3 className="state-title">Unable to load live news feed</h3>
      <p className="state-description">
        {errorMessage || 'A connection timeout occurred while communicating with the news service. Please verify your connection or try again.'}
      </p>
      <div className="state-actions">
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
