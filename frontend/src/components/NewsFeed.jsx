import React from 'react';
import NewsCard from './NewsCard';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { Newspaper, Filter } from 'lucide-react';

export default function NewsFeed({
  articles = [],
  isLoading,
  error,
  activeCategory,
  categoryLabel,
  searchQuery,
  onResetFilters,
  onRetry,
  onReadAndChat,
}) {
  if (isLoading) {
    return (
      <main className="container main-content-area" id="news-feed-main">
        <div className="feed-header-bar">
          <div className="feed-title-block">
            <h2 className="feed-heading">Loading Live Wires...</h2>
            <p className="feed-subheading">Syncing 15-minute English feed</p>
          </div>
        </div>
        <LoadingSkeleton count={6} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container main-content-area" id="news-feed-main">
        <ErrorState errorMessage={error} onRetry={onRetry} />
      </main>
    );
  }

  if (articles.length === 0) {
    return (
      <main className="container main-content-area" id="news-feed-main">
        <EmptyState
          searchQuery={searchQuery}
          category={activeCategory}
          onReset={onResetFilters}
        />
      </main>
    );
  }

  // Determine if first card should have featured treatment
  const hasFilter = searchQuery.trim() !== '' || activeCategory !== 'all';
  const featuredArticle = !hasFilter && articles.length > 0 ? articles[0] : null;
  const standardArticles = !hasFilter && articles.length > 0 ? articles.slice(1) : articles;

  return (
    <main className="container main-content-area" id="news-feed-main">
      {/* Feed Information Bar */}
      <section className="feed-header-bar">
        <div className="feed-title-block">
          <div className="feed-badge-row">
            <span className="feed-tag">
              <Newspaper size={13} />
              <span>{categoryLabel || 'All News'}</span>
            </span>
            {searchQuery && (
              <span className="search-filter-tag">
                <Filter size={12} />
                <span>Search: "{searchQuery}"</span>
              </span>
            )}
          </div>
          <h2 className="feed-heading">
            {hasFilter
              ? `Filtered Stories (${articles.length})`
              : 'Latest Verified Bulletins'}
          </h2>
          <p className="feed-subheading">
            Curated 30–60 word highlights from international wire services. Click <strong>Read & Chat</strong> to query any story.
          </p>
        </div>

        <div className="feed-meta-stats">
          <div className="stat-pill">
            <span className="stat-value">{articles.length}</span>
            <span className="stat-label">Active stories</span>
          </div>
          <div className="stat-pill">
            <span className="stat-value">15m</span>
            <span className="stat-label">Cycle rate</span>
          </div>
        </div>
      </section>

      {/* Featured Lead Story if viewing All News without search */}
      {featuredArticle && (
        <section className="featured-section" aria-label="Lead Story">
          <NewsCard
            article={featuredArticle}
            onReadAndChat={onReadAndChat}
            isFeatured={true}
          />
        </section>
      )}

      {/* Standard News Grid */}
      <section className="news-grid" aria-label="News articles grid">
        {standardArticles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onReadAndChat={onReadAndChat}
          />
        ))}
      </section>
    </main>
  );
}
