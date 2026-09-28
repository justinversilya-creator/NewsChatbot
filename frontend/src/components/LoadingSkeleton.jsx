import React from 'react';

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="news-grid-skeleton" aria-label="Loading news articles">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-image shimmer" />
          <div className="skeleton-content">
            <div className="skeleton-meta">
              <div className="skeleton-badge shimmer" />
              <div className="skeleton-pill shimmer" />
            </div>
            <div className="skeleton-title shimmer" />
            <div className="skeleton-title short shimmer" />
            <div className="skeleton-summary">
              <div className="skeleton-line shimmer" />
              <div className="skeleton-line shimmer" />
              <div className="skeleton-line short shimmer" />
            </div>
            <div className="skeleton-footer">
              <div className="skeleton-btn shimmer" />
              <div className="skeleton-icon shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
