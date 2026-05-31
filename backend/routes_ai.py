"""JusticeBot AI chat + saved items (Module 1 + user library)."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from db import db
from auth import get_current_user, get_optional_user
from ai import justicebot_reply, draft_reply, DISCLAIMER

ai_router = APIRouter(prefix="/api", tags=["justicebot"])

FREE_LIMIT = 4  # AI questions for visitors per session lifetime (visitor uses temp session)


class ChatReq(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"


@ai_router.post("/chat")
async def chat(body: ChatReq, user=Depends(get_optional_user)):
    session_id = body.session_id or f"sess_{uuid.uuid4().hex[:12]}"

    # Visitor rate limit
    if not user:
        count = await db.chat_messages.count_documents({"session_id": session_id, "role": "user"})
        if count >= FREE_LIMIT:
            raise HTTPException(status_code=402,
                                detail="Free preview limit reached. Please sign in for unlimited JusticeBot access.")

    # Persist session metadata
    existing = await db.chat_sessions.find_one({"session_id": session_id})
    if not existing:
        await db.chat_sessions.insert_one({
            "session_id": session_id,
            "user_id": user["user_id"] if user else None,
            "title": body.message[:60],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    user_msg = {
        "id": f"msg_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "role": "user",
        "content": body.message,
        "language": body.language,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(dict(user_msg))

    try:
        reply = await justicebot_reply(session_id, body.message, body.language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    ai_msg = {
        "id": f"msg_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "role": "assistant",
        "content": reply,
        "language": body.language,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(dict(ai_msg))
    return {"session_id": session_id, "reply": reply, "disclaimer": DISCLAIMER}


@ai_router.get("/chat/sessions")
async def my_sessions(user=Depends(get_current_user)):
    return await db.chat_sessions.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@ai_router.get("/chat/{session_id}/messages")
async def session_messages(session_id: str):
    return await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)


# ---------- Counsel AI / VerseDraft drafting ----------
class DraftReq(BaseModel):
    draft_type: str
    details: str
    language: str = "en"


@ai_router.post("/draft")
async def generate_draft(body: DraftReq, user=Depends(get_optional_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in to use Counsel AI drafting.")
    try:
        text = await draft_reply(body.draft_type, body.details, body.language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    return {"draft": text, "disclaimer": DISCLAIMER}


# ---------- saved items / folders ----------
class SaveReq(BaseModel):
    item_type: str        # judgment | article
    item_id: str
    title: str
    folder: str = "General"


@ai_router.post("/saved")
async def save_item(body: SaveReq, user=Depends(get_current_user)):
    doc = {
        "id": f"sav_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        **body.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.saved_items.insert_one(dict(doc))
    return doc


@ai_router.get("/saved")
async def list_saved(user=Depends(get_current_user)):
    return await db.saved_items.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


@ai_router.delete("/saved/{item_id}")
async def delete_saved(item_id: str, user=Depends(get_current_user)):
    res = await db.saved_items.delete_one({"id": item_id, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "deleted"}
