/**
 * News Service Layer
 * 
 * Fetches real news from the FastAPI backend.
 */

import { NEWS_CATEGORIES } from '../data/mockNews';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Fetch news articles with optional category and search filtering
 */
export async function getNewsArticles({ category = 'all', searchQuery = '', simulateDelay = 0 } = {}) {
  // Construct the URL with category query if needed
  let url = `${API_BASE_URL}/api/news`;
  if (category && category !== 'all') {
    url += `?category=${encodeURIComponent(category)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch news from backend');
  }

  const data = await response.json();
  let results = data.news || [];

  // Filter by search query on the frontend
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
    );
  }

  // Map backend fields to frontend expectations
  const mappedResults = results.map((item) => {
    const wordCount = item.summary ? item.summary.split(/\s+/).length : 0;
    const readTimeMins = Math.max(1, Math.ceil(wordCount / 200));

    // Format ISO date to local string
    let publishedAt = 'Just now';
    if (item.published) {
      try {
        const date = new Date(item.published);
        publishedAt = date.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        // Fallback
      }
    }

    return {
      id: item.id || Math.random().toString(),
      title: item.title,
      summary: item.summary,
      category: item.category,
      categoryLabel: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'News',
      source: {
        name: item.source || 'Unknown',
        verified: true, // Assuming trusted RSS feeds
      },
      publishedAt,
      readTime: `${readTimeMins} min read`,
      wordCount,
      imageUrl: null, // Relying on fallback icon for now
      sourceUrl: item.url,
      suggestedQuestions: [] // Disable suggested questions for now
    };
  });

  return {
    articles: mappedResults,
    lastUpdated: data.last_updated
  };
}

/**
 * Fetch available categories
 */
export async function getNewsCategories() {
  return NEWS_CATEGORIES;
}

/**
 * Fetch single article details by ID
 * Note: Since backend doesn't have a single article endpoint yet,
 * we would typically fetch all and filter, or this function might not be used.
 */
export async function getArticleById(id) {
  const { articles } = await getNewsArticles();
  const article = articles.find((a) => a.id === id);
  if (!article) {
    throw new Error(`Article with id "${id}" not found.`);
  }
  return article;
}
