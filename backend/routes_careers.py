"""Careers & Internships (Module 7)."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from db import db
from auth import get_current_user

careers_router = APIRouter(prefix="/api", tags=["careers"])


class Vacancy(BaseModel):
    title: str
    organization: str
    type: str = "internship"   # internship | clerkship | associate | government | judiciary | exam
    location: str = "Remote"
    stipend: Optional[str] = None
    description: str
    tags: List[str] = []


class ApplicationReq(BaseModel):
    vacancy_id: str
    name: str
    email: str
    resume_url: Optional[str] = None
    cover_note: Optional[str] = None


@careers_router.get("/vacancies")
async def list_vacancies(type: Optional[str] = None, limit: int = 50):
    query: dict = {}
    if type and type.lower() != "all":
        query["type"] = type
    return await db.vacancies.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)


@careers_router.get("/vacancies/{vacancy_id}")
async def get_vacancy(vacancy_id: str):
    doc = await db.vacancies.find_one({"id": vacancy_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return doc


@careers_router.post("/applications")
async def apply(body: ApplicationReq, user=Depends(get_current_user)):
    vacancy = await db.vacancies.find_one({"id": body.vacancy_id}, {"_id": 0})
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    doc = {
        "id": f"app_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "vacancy_title": vacancy["title"],
        **body.model_dump(),
        "status": "submitted",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.applications.insert_one(doc)
    doc.pop("_id", None)
    print(f"[APPLICATION] {user['email']} applied for {vacancy['title']}")
    return doc


@careers_router.get("/my/applications")
async def my_applications(user=Depends(get_current_user)):
    return await db.applications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


def build_vacancy(body: Vacancy) -> dict:
    return {"id": f"vac_{uuid.uuid4().hex[:12]}", **body.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat()}
