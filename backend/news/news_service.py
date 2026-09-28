"""
News Service with In-Memory Caching

Manages the in-memory cache for aggregated live news.
Ensures network requests are only made when the cache expires (every 15 minutes),
preventing unnecessary external calls when the frontend requests data.
Supports category filtering and thread-safe cache invalidation.
"""

import logging
from threading import Lock
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from news.rss_collector import collect_all_rss_news

logger = logging.getLogger("newschatbot.news_service")


class NewsService:
    def __init__(self, refresh_interval_minutes: int = 15):
        self._refresh_interval_minutes = refresh_interval_minutes
        self._cache: List[Dict[str, Any]] = []
        self._last_updated: Optional[datetime] = None
        self._lock = Lock()

    @property
    def refresh_interval_minutes(self) -> int:
        return self._refresh_interval_minutes

    @property
    def last_updated(self) -> Optional[datetime]:
        return self._last_updated

    def is_cache_valid(self) -> bool:
        """
        Checks whether the cached data is still fresh (younger than 15 minutes).
        """
        if self._last_updated is None or not self._cache:
            return False

        now = datetime.now(timezone.utc)
        age = now - self._last_updated
        return age < timedelta(minutes=self._refresh_interval_minutes)

    def refresh_cache(self, force: bool = False) -> None:
        """
        Refreshes the in-memory news cache from RSS sources if expired or forced.
        Uses a threading lock to prevent concurrent redundant external requests.
        """
        # Fast exit without acquiring lock if cache is still fresh
        if not force and self.is_cache_valid():
            return

        with self._lock:
            # Double-check inside lock
            if not force and self.is_cache_valid():
                return

            logger.info("Cache expired or missing. Fetching fresh RSS news...")
            try:
                fresh_items = collect_all_rss_news()
                if fresh_items:
                    self._cache = fresh_items
                    self._last_updated = datetime.now(timezone.utc)
                    logger.info("Cache refreshed successfully with %d news items.", len(fresh_items))
                else:
                    logger.warning("RSS collection returned 0 items; retaining previous cache if available.")
            except Exception as exc:
                logger.error("Failed to refresh RSS cache: %s", exc)
                # If we already have items in cache, keep them to prevent outage
                if not self._cache:
                    raise exc

    def get_news(
        self,
        category: Optional[str] = None,
        limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Retrieves news items, refreshing cache automatically if older than 15 minutes.
        Applies optional category filtering and item limit.
        """
        # Ensure fresh data if cache has expired
        self.refresh_cache(force=False)

        items = self._cache

        # Category filtering (case-insensitive)
        if category and category.strip().lower() != "all":
            target_cat = category.strip().lower()
            items = [item for item in items if item.get("category", "").lower() == target_cat]

        # Limit count if specified
        if limit is not None and limit > 0:
            items = items[:limit]

        last_updated_str = (
            self._last_updated.isoformat()
            if self._last_updated
            else datetime.now(timezone.utc).isoformat()
        )

        return {
            "status": "success",
            "count": len(items),
            "last_updated": last_updated_str,
            "refresh_interval_minutes": self._refresh_interval_minutes,
            "news": items
        }


# Singleton service instance
news_service = NewsService(refresh_interval_minutes=15)
