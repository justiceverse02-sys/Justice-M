"""JusticeVerse — premium Legal AI platform API."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
from datetime import datetime, timezone

import bcrypt
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

from db import db
from auth import auth_router, hash_password, verify_password
from routes_legal import legal_router
from routes_hub import hub_router
from routes_careers import careers_router
from routes_ai import ai_router
from routes_admin import admin_router
from routes_payments import payments_router
from seed import seed_content

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("justiceverse")

app = FastAPI(title="JusticeVerse API")

# Health/base router
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "JusticeVerse API", "status": "ok"}


app.include_router(api_router)
app.include_router(auth_router)
app.include_router(legal_router)
app.include_router(hub_router)
app.include_router(careers_router)
app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(payments_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@justiceverse.in")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        import uuid
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "name": "JusticeVerse Owner",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "plan": "lawfirm",
            "auth_provider": "email",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})
        logger.info("Admin password updated")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id")
    await db.user_sessions.create_index("session_token")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.legal_documents.create_index("category")
    await seed_admin()
    await seed_content()
    logger.info("JusticeVerse startup complete")


@app.on_event("shutdown")
async def shutdown():
    from db import client
    client.close()
