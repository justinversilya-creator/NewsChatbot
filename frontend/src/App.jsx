import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import NewsFeed from './components/NewsFeed';
import ChatbotView from './components/ChatbotView';
import Footer from './components/Footer';
import { getNewsArticles, getNewsCategories } from './services/newsService';
import './App.css';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Active article selected for Chatbot mode
  const [activeChatArticle, setActiveChatArticle] = useState(null);

  // Preview simulator state: 'normal' | 'loading' | 'empty' | 'error'
  const [simState, setSimState] = useState('normal');

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      const cats = await getNewsCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // Fetch articles initially and on category/search change
  useEffect(() => {
    let ignore = false;

    async function fetchFeed() {
      setIsLoading(true);
      setError(null);
      try {
        const { articles: data, lastUpdated: lu } = await getNewsArticles({
          category: activeCategory,
          searchQuery,
          simulateDelay: 0
        });
        if (!ignore) {
          setArticles(data);
          setLastUpdated(lu);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || 'Failed to retrieve news feed.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchFeed();

    return () => {
      ignore = true;
    };
  }, [activeCategory, searchQuery]);

  // Manual refresh trigger
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent duplicate simultaneous requests
    setIsRefreshing(true);
    setError(null);
    try {
      const { articles: data, lastUpdated: lu } = await getNewsArticles({
        category: activeCategory,
        searchQuery,
        simulateDelay: 0
      });
      setArticles(data);
      setLastUpdated(lu);
    } catch (err) {
      setError(err?.message || 'Failed to refresh news feed.');
    } finally {
      setIsRefreshing(false);
    }
  }, [activeCategory, searchQuery, isRefreshing]);

  // 15-Minute Automatic Refresh Polling
  useEffect(() => {
    const timer = setInterval(() => {
      handleRefresh();
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(timer);
  }, [handleRefresh]);

  // Compute category counts for category badges
  const articleCounts = useMemo(() => {
    const counts = { all: articles.length };
    categories.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = articles.filter((a) => a.category === cat.id).length;
      }
    });
    return counts;
  }, [articles, categories]);

  // Handlers
  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    if (activeChatArticle) {
      setActiveChatArticle(null);
    }
  };

  const handleReadAndChat = (article) => {
    setActiveChatArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setActiveChatArticle(null);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSimState('normal');
  };

  const currentCategoryLabel = useMemo(() => {
    const found = categories.find((c) => c.id === activeCategory);
    return found ? found.label : 'All News';
  }, [categories, activeCategory]);

  // Evaluate simulated state overrides
  const effectiveIsLoading = simState === 'loading' || isLoading;
  const effectiveError = simState === 'error' ? 'Connection timeout simulation: Failed to connect to wire server.' : error;
  const effectiveArticles = simState === 'empty' ? [] : articles;

  return (
    <div className="app-shell">
      {/* 1. Header & Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        activeChatArticle={activeChatArticle}
        onOpenChat={() => activeChatArticle && window.scrollTo({ top: 0, behavior: 'smooth' })}
        onCloseChat={handleBackToFeed}
        currentSimState={simState}
        onSimStateChange={setSimState}
        lastUpdated={lastUpdated}
      />

      {/* 3. Category Navigation */}
      {!activeChatArticle && (
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
          articleCounts={articleCounts}
        />
      )}

      {/* Main Content */}
      {activeChatArticle ? (
        <ChatbotView
          article={activeChatArticle}
          onBackToFeed={handleBackToFeed}
        />
      ) : (
        <NewsFeed
          articles={effectiveArticles}
          isLoading={effectiveIsLoading}
          error={effectiveError}
          activeCategory={activeCategory}
          categoryLabel={currentCategoryLabel}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
          onRetry={() => {
            setSimState('normal');
            handleRefresh();
          }}
          onReadAndChat={handleReadAndChat}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
