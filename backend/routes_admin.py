"""Owner / Admin dashboard — content management + analytics."""
from fastapi import APIRouter, Depends, HTTPException
from db import db
from auth import require_admin
from routes_legal import LegalDoc, build_legal_doc
from routes_hub import Article, NewsItem, build_article, build_news
from routes_careers import Vacancy, build_vacancy

admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


@admin_router.get("/stats")
async def stats(admin=Depends(require_admin)):
    return {
        "users": await db.users.count_documents({}),
        "articles": await db.articles.count_documents({}),
        "news": await db.news.count_documents({}),
        "judgments": await db.legal_documents.count_documents({}),
        "vacancies": await db.vacancies.count_documents({}),
        "applications": await db.applications.count_documents({}),
        "chat_messages": await db.chat_messages.count_documents({}),
        "payments": await db.payments.count_documents({"status": "paid"}),
        "revenue": sum([p.get("amount", 0) async for p in db.payments.find({"status": "paid"}, {"amount": 1})]) / 100,
    }


@admin_router.get("/users")
async def users(admin=Depends(require_admin)):
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)


# ---------- Articles ----------
@admin_router.post("/articles")
async def create_article(body: Article, admin=Depends(require_admin)):
    doc = build_article(body)
    await db.articles.insert_one(dict(doc))
    return doc


@admin_router.put("/articles/{article_id}")
async def update_article(article_id: str, body: Article, admin=Depends(require_admin)):
    res = await db.articles.update_one({"id": article_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.articles.find_one({"id": article_id}, {"_id": 0})


@admin_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, admin=Depends(require_admin)):
    await db.articles.delete_one({"id": article_id})
    return {"status": "deleted"}


# ---------- News ----------
@admin_router.post("/news")
async def create_news(body: NewsItem, admin=Depends(require_admin)):
    doc = build_news(body)
    await db.news.insert_one(dict(doc))
    return doc


@admin_router.delete("/news/{news_id}")
async def delete_news(news_id: str, admin=Depends(require_admin)):
    await db.news.delete_one({"id": news_id})
    return {"status": "deleted"}


# ---------- Legal documents (judgments / statutes) ----------
@admin_router.post("/legal")
async def create_legal(body: LegalDoc, admin=Depends(require_admin)):
    doc = build_legal_doc(body)
    await db.legal_documents.insert_one(dict(doc))
    return doc


@admin_router.delete("/legal/{doc_id}")
async def delete_legal(doc_id: str, admin=Depends(require_admin)):
    await db.legal_documents.delete_one({"id": doc_id})
    return {"status": "deleted"}


# ---------- Vacancies ----------
@admin_router.post("/vacancies")
async def create_vacancy(body: Vacancy, admin=Depends(require_admin)):
    doc = build_vacancy(body)
    await db.vacancies.insert_one(dict(doc))
    return doc


@admin_router.delete("/vacancies/{vacancy_id}")
async def delete_vacancy(vacancy_id: str, admin=Depends(require_admin)):
    await db.vacancies.delete_one({"id": vacancy_id})
    return {"status": "deleted"}


@admin_router.get("/applications")
async def applications(admin=Depends(require_admin)):
    return await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
