"""Razorpay subscription payments (Monetization)."""
import os
import uuid
import hmac
import hashlib
from datetime import datetime, timezone
import razorpay
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import db
from auth import get_current_user

payments_router = APIRouter(prefix="/api", tags=["payments"])

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")
rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Server-side authoritative plan pricing (amount in paise / month)
PLANS = {
    "free": {"name": "Free", "amount": 0, "tagline": "For curious citizens & students exploring the law",
             "features": ["Read articles & legal news", "Search judgments", "Limited Verse AI (4 queries)", "View vacancies"]},
    "student": {"name": "Student", "amount": 29900, "tagline": "For law students & exam aspirants",
                "features": ["Unlimited searches", "Save judgments & articles", "AI legal research", "PrepMate exam prep", "Download reports"]},
    "advocate": {"name": "Advocate", "amount": 99900, "tagline": "For practising advocates & researchers",
                 "features": ["Everything in Student", "AI drafting (DraftGen)", "CaseBrief AI analysis", "Citation generator", "Priority JusticeBot"]},
    "lawfirm": {"name": "Law Firm", "amount": 499900, "tagline": "For chambers & legal teams",
                "features": ["Everything in Advocate", "Matter & client management", "Hearing tracker & calendar", "Team collaboration", "Billing dashboard"]},
}


class OrderReq(BaseModel):
    plan: str


class VerifyReq(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str


@payments_router.get("/plans")
async def get_plans():
    return {"plans": PLANS, "key_id": RAZORPAY_KEY_ID, "currency": "INR"}


@payments_router.post("/payments/create-order")
async def create_order(body: OrderReq, user=Depends(get_current_user)):
    plan = PLANS.get(body.plan)
    if not plan or plan["amount"] == 0:
        raise HTTPException(status_code=400, detail="Invalid plan")
    order = rzp_client.order.create({
        "amount": plan["amount"],
        "currency": "INR",
        "payment_capture": 1,
        "receipt": f"jv_{body.plan}_{uuid.uuid4().hex[:8]}",
    })
    await db.payments.insert_one({
        "id": f"pay_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "order_id": order["id"],
        "plan": body.plan,
        "amount": plan["amount"],
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"order_id": order["id"], "amount": plan["amount"], "currency": "INR",
            "key_id": RAZORPAY_KEY_ID, "plan_name": plan["name"]}


@payments_router.post("/payments/verify")
async def verify_payment(body: VerifyReq, user=Depends(get_current_user)):
    generated = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if generated != body.razorpay_signature:
        await db.payments.update_one({"order_id": body.razorpay_order_id}, {"$set": {"status": "failed"}})
        raise HTTPException(status_code=400, detail="Payment verification failed")

    await db.payments.update_one(
        {"order_id": body.razorpay_order_id},
        {"$set": {"status": "paid", "payment_id": body.razorpay_payment_id,
                  "paid_at": datetime.now(timezone.utc).isoformat()}},
    )
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"plan": body.plan}})
    return {"status": "success", "plan": body.plan}
