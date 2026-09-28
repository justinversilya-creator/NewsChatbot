import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

export default function EmptyState({ searchQuery, category, onReset }) {
  return (
    <div className="state-container empty-state" role="status">
      <div className="state-icon-wrapper empty-icon">
        <SearchX size={36} strokeWidth={1.5} />
      </div>
      <h3 className="state-title">No news articles found</h3>
      <p className="state-description">
        {searchQuery ? (
          <>
            No matches found for <strong className="state-highlight">"{searchQuery}"</strong>
            {category && category !== 'all' ? ` in the ${category} category.` : '.'}
          </>
        ) : (
          `There are currently no active stories available in the selected category.`
        )}
      </p>
      <div className="state-actions">
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          <RotateCcw size={16} />
          <span>Reset Filters & View All</span>
        </button>
      </div>
    </div>
  );
}
