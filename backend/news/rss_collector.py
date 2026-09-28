"""
RSS News Collector

Collects live news from curated, free, public English RSS feeds.
Extracts only metadata and short excerpts (never full article bodies).
Cleans HTML tags, normalizes whitespace, and deduplicates stories.
"""

import re
import html
import hashlib
import logging
from datetime import datetime, timezone
import email.utils
from typing import List, Dict, Any, Optional

import requests
import feedparser

logger = logging.getLogger("newschatbot.rss_collector")

# Configurable list of reliable, free public English RSS feeds
DEFAULT_RSS_FEEDS = [
    # World News
    {
        "name": "BBC News",
        "url": "http://feeds.bbci.co.uk/news/world/rss.xml",
        "category": "world"
    },
    {
        "name": "NPR World",
        "url": "https://feeds.npr.org/1004/rss.xml",
        "category": "world"
    },
    # Technology News
    {
        "name": "BBC Tech",
        "url": "http://feeds.bbci.co.uk/news/technology/rss.xml",
        "category": "technology"
    },
    {
        "name": "TechCrunch",
        "url": "https://techcrunch.com/feed/",
        "category": "technology"
    },
    {
        "name": "Ars Technica",
        "url": "https://feeds.arstechnica.com/arstechnica/index",
        "category": "technology"
    },
    # Business News
    {
        "name": "BBC Business",
        "url": "http://feeds.bbci.co.uk/news/business/rss.xml",
        "category": "business"
    },
    {
        "name": "NPR Business",
        "url": "https://feeds.npr.org/1006/rss.xml",
        "category": "business"
    },
    # Science News
    {
        "name": "BBC Science",
        "url": "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
        "category": "science"
    },
    {
        "name": "NPR Science",
        "url": "https://feeds.npr.org/1007/rss.xml",
        "category": "science"
    },
    # Health News
    {
        "name": "BBC Health",
        "url": "http://feeds.bbci.co.uk/news/health/rss.xml",
        "category": "health"
    },
    {
        "name": "NPR Health",
        "url": "https://feeds.npr.org/1128/rss.xml",
        "category": "health"
    },
    # Entertainment News
    {
        "name": "BBC Entertainment",
        "url": "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
        "category": "entertainment"
    },
    # Sports News
    {
        "name": "Sky Sports",
        "url": "https://www.skysports.com/rss/12040",
        "category": "sports"
    },
    {
        "name": "BBC Sport",
        "url": "http://feeds.bbci.co.uk/sport/rss.xml",
        "category": "sports"
    }
]

REQUEST_TIMEOUT_SECONDS = 7
USER_AGENT = "NewsChatbot/1.0 (+https://github.com/newschatbot/rss-collector)"


UNICODE_REPLACEMENTS = {
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u2014": " - ",
    "\u2013": " - ",
    "\u2026": "...",
    "\u00a0": " ",
    "&apos;": "'",
}


def sanitize_text(text: str) -> str:
    """Replaces smart quotes and dashes with clean characters."""
    if not text:
        return ""
    for k, v in UNICODE_REPLACEMENTS.items():
        text = text.replace(k, v)
    return text


def clean_text_excerpt(raw_html: Optional[str], max_words: int = 60) -> str:
    """
    Cleans raw HTML descriptions into concise plain-text excerpts.
    - Strips HTML tags
    - Unescapes HTML entities
    - Normalizes whitespace
    - Normalizes smart punctuation
    - Limits to a short excerpt (approx 30-60 words)
    - Strictly avoids downloading or storing complete article content
    """
    if not raw_html:
        return ""

    # Remove script, style, and CDATA blocks if present
    text = re.sub(r"<(script|style).*?>.*?</\1>", "", raw_html, flags=re.DOTALL | re.IGNORECASE)
    
    # Strip all HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Unescape HTML entities (e.g., &amp; &quot; &#8217;)
    text = html.unescape(text)

    # Sanitize smart quotes/dashes
    text = sanitize_text(text)

    # Normalize whitespace (replace tabs, newlines, multiple spaces with a single space)
    text = " ".join(text.split()).strip()

    # Limit to max_words while preserving clean word boundaries
    words = text.split()
    if len(words) > max_words:
        text = " ".join(words[:max_words]).rstrip(",;:.-") + "..."

    return text


def parse_published_date(entry: Dict[str, Any]) -> str:
    """
    Extracts and standardizes the published date into a clean ISO 8601 string.
    Falls back to current UTC time if date is missing or unparseable.
    """
    # 1. Check if feedparser parsed a time tuple
    time_struct = entry.get("published_parsed") or entry.get("updated_parsed")
    if time_struct:
        try:
            dt = datetime(*time_struct[:6], tzinfo=timezone.utc)
            return dt.isoformat()
        except Exception:
            pass

    # 2. Check string date field
    date_str = entry.get("published") or entry.get("updated")
    if date_str:
        try:
            parsed_tuple = email.utils.parsedate_to_datetime(date_str)
            if parsed_tuple:
                return parsed_tuple.astimezone(timezone.utc).isoformat()
        except Exception:
            pass

    # Fallback to current UTC time
    return datetime.now(timezone.utc).isoformat()


def generate_item_id(url: str, title: str) -> str:
    """Generates a stable, compact unique ID from the story URL and title."""
    unique_string = f"{url.strip().lower()}:{title.strip().lower()}"
    return hashlib.sha256(unique_string.encode("utf-8")).hexdigest()[:16]


def normalize_title(title: str) -> str:
    """Normalizes title for duplicate detection."""
    cleaned = re.sub(r"[^\w\s]", "", title.lower())
    return " ".join(cleaned.split())


def fetch_single_feed(feed_info: Dict[str, str]) -> List[Dict[str, Any]]:
    """
    Fetches and parses a single RSS feed.
    Catches any network or parsing error gracefully so one failing feed
    never disrupts other feeds.
    """
    feed_name = feed_info.get("name", "Unknown Source")
    feed_url = feed_info.get("url", "")
    category = feed_info.get("category", "world").lower()

    if not feed_url:
        return []

    entries_collected: List[Dict[str, Any]] = []

    try:
        # Use requests with a custom User-Agent and timeout
        headers = {"User-Agent": USER_AGENT}
        response = requests.get(feed_url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
        
        if response.status_code != 200:
            logger.warning("Feed %s returned status %d", feed_name, response.status_code)
            return []

        # Parse XML content with feedparser
        parsed = feedparser.parse(response.content)

        if parsed.bozo and not parsed.entries:
            logger.warning("Feed %s encountered bozo error with no entries: %s", feed_name, parsed.bozo_exception)
            return []

        for entry in parsed.entries:
            title = sanitize_text(entry.get("title", "")).strip()
            link = entry.get("link", "").strip()

            # Skip items missing essential headline or link
            if not title or not link:
                continue

            # Extract and clean summary / description excerpt
            raw_summary = entry.get("summary") or entry.get("description") or ""
            cleaned_summary = clean_text_excerpt(raw_summary)

            # If summary is too short or empty, provide a clean fallback headline excerpt
            if not cleaned_summary or len(cleaned_summary.split()) < 5:
                cleaned_summary = f"{title}. Read the full report at {feed_name}."

            published_iso = parse_published_date(entry)
            item_id = generate_item_id(link, title)

            entries_collected.append({
                "id": item_id,
                "title": title,
                "summary": cleaned_summary,
                "source": feed_name,
                "published": published_iso,
                "category": category,
                "url": link,
            })

    except requests.RequestException as req_err:
        logger.warning("Network error fetching feed %s (%s): %s", feed_name, feed_url, req_err)
    except Exception as exc:
        logger.warning("Unexpected error parsing feed %s (%s): %s", feed_name, feed_url, exc)

    return entries_collected


def collect_all_rss_news(feeds: Optional[List[Dict[str, str]]] = None, max_workers: int = 8) -> List[Dict[str, Any]]:
    """
    Collects live news from all configured RSS feeds concurrently.
    Removes duplicate stories across feeds by URL and normalized title.
    Sorts by published date (most recent first).
    """
    import concurrent.futures

    active_feeds = feeds or DEFAULT_RSS_FEEDS
    all_news: List[Dict[str, Any]] = []
    seen_urls = set()
    seen_titles = set()

    # Fetch feeds concurrently using ThreadPoolExecutor
    feed_results: List[List[Dict[str, Any]]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_feed = {executor.submit(fetch_single_feed, f): f for f in active_feeds}
        for future in concurrent.futures.as_completed(future_to_feed):
            feed_info = future_to_feed[future]
            try:
                items = future.result()
                feed_results.append(items)
            except Exception as exc:
                logger.warning("Feed execution error for %s: %s", feed_info.get("name"), exc)

    # Flatten and deduplicate
    for items in feed_results:
        for item in items:
            url_key = item["url"].rstrip("/").lower()
            title_key = normalize_title(item["title"])

            # Deduplication check
            if url_key in seen_urls or title_key in seen_titles:
                continue

            seen_urls.add(url_key)
            seen_titles.add(title_key)
            all_news.append(item)

    # Sort stories by publication timestamp in descending order (newest first)
    all_news.sort(key=lambda x: x.get("published", ""), reverse=True)
    return all_news
