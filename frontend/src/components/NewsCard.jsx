import React, { useState } from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Bookmark, 
  Share2,
  FileText
} from 'lucide-react';

export default function NewsCard({ 
  article, 
  onReadAndChat, 
  isFeatured = false,
  isSelected = false 
}) {
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const {
    id,
    title,
    categoryLabel,
    source,
    publishedAt,
    readTime,
    wordCount,
    imageUrl,
    summary,
    sourceUrl,
    suggestedQuestions = []
  } = article;

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <article 
      className={`news-card ${isFeatured ? 'featured-card' : ''} ${isSelected ? 'selected-card' : ''}`}
      aria-labelledby={`headline-${id}`}
    >
      {/* Thumbnail image container with fallback */}
      <div className="card-media-wrapper">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="card-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="card-image-fallback">
            <FileText size={40} strokeWidth={1.2} />
            <span>{categoryLabel} Wire</span>
          </div>
        )}
        <div className="card-media-overlay">
          <span className="category-tag">{categoryLabel}</span>
          {isFeatured && <span className="featured-badge">Lead Story</span>}
        </div>
      </div>

      <div className="card-body">
        {/* Source attribution and published time */}
        <div className="card-meta-header">
          <div className="source-info">
            <span className="source-name" title={`Verified Source: ${source.name}`}>
              {source.name}
            </span>
            {source.verified && (
              <CheckCircle2 size={13} className="verified-icon" title="Verified News Wire" />
            )}
          </div>
          <span className="meta-separator">•</span>
          <div className="published-time">
            <Clock size={12} className="time-icon" />
            <span>{publishedAt}</span>
          </div>
          <span className="meta-separator">•</span>
          <span className="read-time-badge">{readTime}</span>
        </div>

        {/* News Headline */}
        <h3 id={`headline-${id}`} className="card-headline">
          {title}
        </h3>

        {/* 30-60 Word News Highlight Container */}
        <div className="highlight-box">
          <div className="highlight-header">
            <span className="highlight-label">30–60 WORD HIGHLIGHT</span>
            <span className="word-count-badge" title="Concise news summary count">
              {wordCount} words
            </span>
          </div>
          <p className="highlight-text">{summary}</p>
        </div>

        {/* Preview of 1 suggested question chip to tease chatbot */}
        {suggestedQuestions.length > 0 && (
          <div className="suggested-chip-preview" onClick={() => onReadAndChat(article)}>
            <Sparkles size={12} className="chip-sparkle" />
            <span className="chip-text">Ask AI: "{suggestedQuestions[0]}"</span>
          </div>
        )}

        {/* Card Footer with Read & Chat CTA & Source Links */}
        <div className="card-footer">
          <button
            type="button"
            className="btn btn-primary btn-read-chat"
            onClick={() => onReadAndChat(article)}
            aria-label={`Read and chat about: ${title}`}
          >
            <MessageSquare size={15} />
            <span>Read & Chat</span>
          </button>

          <div className="card-secondary-actions">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              title="Open original source article"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={15} />
            </a>

            <button
              type="button"
              className={`btn-icon ${isBookmarked ? 'active-bookmark' : ''}`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
              onClick={handleBookmark}
            >
              <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              className="btn-icon"
              title="Share story link"
              onClick={handleShare}
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="copied-toast">Link copied to clipboard!</div>
        )}
      </div>
    </article>
  );
}
