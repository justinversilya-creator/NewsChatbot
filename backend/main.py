from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from news.news_service import news_service
from chatbot.router import router as chatbot_router

app = FastAPI(
    title="NewsChatbot API",
    description="Backend API for the News Summarization Chatbot",
    version="0.1.0"
)

# Enable CORS for frontend consumption
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router)

@app.get("/")
def root():
    return {
        "message": "NewsChatbot API is running",
        "status": "Success"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.get("/api/news")
def get_news(
    category: Optional[str] = Query(
        default=None,
        description="Optional category filter (e.g., world, technology, business, science, health, entertainment, sports)"
    ),
    limit: Optional[int] = Query(
        default=None,
        description="Optional limit on number of news items returned"
    )
):
    """
    Get live aggregated news from curated English RSS feeds.
    Cached for 15 minutes to prevent redundant external requests.
    """
    return news_service.get_news(category=category, limit=limit)