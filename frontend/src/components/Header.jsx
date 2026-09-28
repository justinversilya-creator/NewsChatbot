import React from 'react';
import { 
  Radio, 
  Search, 
  X, 
  RotateCw, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function Header({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  activeChatArticle,
  onOpenChat,
  onCloseChat,
  currentSimState,
  onSimStateChange,
  lastUpdated,
}) {
  const formatTime = (isoString) => {
    if (!isoString) return 'Checking...';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <header className="site-header">
      <div className="header-top-bar">
        <div className="container header-top-content">
          <div className="live-status-pill">
            <span className="live-dot" aria-hidden="true" />
            <span className="live-text">LIVE COVERAGE</span>
            <span className="divider">•</span>
            <span className="live-subtext">Verified English-Only Wire</span>
          </div>

          <div className="header-right-meta">
            <div className="refresh-countdown" title="Automatic news refresh every 15 minutes">
              <Clock size={13} className="countdown-icon" />
              <span>Last updated: <strong>{formatTime(lastUpdated)}</strong></span>
            </div>

            <button
              type="button"
              className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Manually trigger news refresh"
            >
              <RotateCw size={13} />
              <span>Refresh</span>
            </button>

            {/* Quick State Preview Switcher for Reviewing all required UI states */}
            <div className="state-switcher-menu" title="Developer state preview to inspect UI states">
              <Layers size={13} />
              <label htmlFor="state-select" className="visually-hidden">Preview UI State</label>
              <select
                id="state-select"
                value={currentSimState}
                onChange={(e) => onSimStateChange(e.target.value)}
                className="state-select"
              >
                <option value="normal">State: Live Feed</option>
                <option value="loading">State: Loading</option>
                <option value="empty">State: Empty</option>
                <option value="error">State: Error</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="header-main-bar">
        <div className="container header-main-content">
          {/* Brand Logo & Name */}
          <div className="brand" onClick={onCloseChat} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onCloseChat()}>
            <div className="brand-logo-icon">
              <Radio size={22} strokeWidth={2.5} />
            </div>
            <div className="brand-text-group">
              <div className="brand-title">
                News<span className="brand-accent">Pulse</span>
                <span className="brand-badge">AI Chat Ready</span>
              </div>
              <p className="brand-tagline">15-Min Live Highlights & Contextual Analysis</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search news, topics, organizations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
              aria-label="Search news articles"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Active Story Chat Indicator (if a story is currently focused) */}
          <div className="header-actions">
            {activeChatArticle ? (
              <button 
                type="button" 
                className="btn btn-chat-active"
                onClick={onOpenChat}
              >
                <Sparkles size={15} />
                <span className="chat-btn-text">Active Chat</span>
                <span className="chat-indicator-dot" />
              </button>
            ) : (
              <div className="edition-badge">
                <span>FastAPI + RAG Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
