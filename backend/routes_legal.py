"""Indian Legal Database — case laws, statutes, journals (Module 2)."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from db import db
from auth import get_optional_user

legal_router = APIRouter(prefix="/api/legal", tags=["legal"])


class LegalDoc(BaseModel):
    doc_type: str = "case_law"        # case_law | statute | journal
    court: str = "Supreme Court"
    category: str = "Supreme Court"   # used for filter pills
    title: str
    citation: Optional[str] = None
    date: Optional[str] = None
    summary: str
    content: Optional[str] = None
    source: Optional[str] = None
    tags: List[str] = []


@legal_router.get("")
async def list_legal(q: Optional[str] = None, category: Optional[str] = None,
                     doc_type: Optional[str] = None, limit: int = 50,
                     user=Depends(get_optional_user)):
    query: dict = {}
    if category and category.lower() != "all":
        query["category"] = category
    if doc_type:
        query["doc_type"] = doc_type
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"summary": {"$regex": q, "$options": "i"}},
            {"citation": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.legal_documents.find(query, {"_id": 0}).sort("date", -1).to_list(limit)
    return docs


@legal_router.get("/{doc_id}")
async def get_legal(doc_id: str):
    doc = await db.legal_documents.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


def build_legal_doc(body: LegalDoc) -> dict:
    return {
        "id": f"leg_{uuid.uuid4().hex[:12]}",
        **body.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
