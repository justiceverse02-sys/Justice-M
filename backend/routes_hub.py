"""Knowledge Hub — Articles & Insights + Legal News (Module 6)."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from db import db

hub_router = APIRouter(prefix="/api", tags=["knowledge-hub"])


class Article(BaseModel):
    title: str
    category: str = "Legal Insight"
    excerpt: str
    content: Optional[str] = None
    author: str = "JusticeVerse Editorial"
    read_time: str = "5 MIN READ"
    status: str = "published"          # published | scheduled | draft
    published_at: Optional[str] = None


class NewsItem(BaseModel):
    title: str
    category: str = "Supreme Court"
    summary: str
    source: str = "JusticeVerse Legal Reporter"
    date: Optional[str] = None


@hub_router.get("/articles")
async def list_articles(category: Optional[str] = None, limit: int = 50):
    query = {"status": "published"}
    if category and category.lower() != "all":
        query["category"] = category
    return await db.articles.find(query, {"_id": 0}).sort("published_at", -1).to_list(limit)


@hub_router.get("/articles/{article_id}")
async def get_article(article_id: str):
    doc = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return doc


@hub_router.get("/news")
async def list_news(category: Optional[str] = None, limit: int = 50):
    query: dict = {}
    if category and category.lower() != "all":
        query["category"] = category
    return await db.news.find(query, {"_id": 0}).sort("date", -1).to_list(limit)


def build_article(body: Article) -> dict:
    data = body.model_dump()
    if not data.get("published_at"):
        data["published_at"] = datetime.now(timezone.utc).isoformat()
    return {"id": f"art_{uuid.uuid4().hex[:12]}", **data,
            "created_at": datetime.now(timezone.utc).isoformat()}


def build_news(body: NewsItem) -> dict:
    data = body.model_dump()
    if not data.get("date"):
        data["date"] = datetime.now(timezone.utc).date().isoformat()
    return {"id": f"news_{uuid.uuid4().hex[:12]}", **data,
            "created_at": datetime.now(timezone.utc).isoformat()}
