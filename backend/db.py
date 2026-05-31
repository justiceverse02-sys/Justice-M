"""Shared MongoDB connection and helpers for JusticeVerse."""
import os
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


def clean(doc: dict) -> dict:
    """Strip MongoDB _id from a document if present."""
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc
