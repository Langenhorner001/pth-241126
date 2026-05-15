"""Admin API routes (/api/v1/admin/*) and supporting models."""
from __future__ import annotations

import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address

from auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_admin,
    hash_password,
    require_super_admin,
    verify_password,
)
from media import delete_image_files, save_image

limiter = Limiter(key_func=get_remote_address)
admin_router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize(doc: dict | None) -> dict | None:
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


# ===================================================================
# Auth models + routes
# ===================================================================
class LoginBody(BaseModel):
    # Email is optional and ignored for routing — single-admin password-only login.
    email: Optional[EmailStr] = None
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str = "Administrator"
    role: str = "super_admin"
    password_hash: str
    profile_picture: Optional[str] = None
    last_login: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UpdateProfileBody(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None


# To be injected at import time by server.py:
_DB = None  # type: ignore


def set_db(db):
    global _DB
    _DB = db


def db():
    if _DB is None:
        raise RuntimeError("DB not initialised")
    return _DB


async def ensure_seed_admin():
    """Create default admin from env on startup if collection empty.

    Also forces password re-sync if ADMIN_PASSWORD in env has changed (so
    rotating the password in `.env` + restart works without manual DB edits).
    """
    email = os.environ.get("ADMIN_EMAIL")
    pw = os.environ.get("ADMIN_PASSWORD")
    if not email or not pw:
        return

    existing = await db().admins.find_one({})
    if not existing:
        user = AdminUser(email=email, password_hash=hash_password(pw))
        await db().admins.insert_one(user.model_dump())
        return

    # Force-sync password + email from env on every startup
    updates = {}
    if not verify_password(pw, existing["password_hash"]):
        updates["password_hash"] = hash_password(pw)
    if existing.get("email") != email.lower():
        updates["email"] = email.lower()
    if updates:
        await db().admins.update_one({"id": existing["id"]}, {"$set": updates})


async def get_user_doc(td) -> dict:
    doc = await db().admins.find_one({"id": td.sub}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(401, "User not found")
    return doc


@admin_router.post("/auth/login", response_model=LoginResponse)
async def admin_login(request: Request, body: LoginBody):
    # Password-only login: there is a single admin account. We look it up
    # by env email (preferred) and fall back to the first admin in DB.
    env_email = (os.environ.get("ADMIN_EMAIL") or "").lower()
    user = None
    if env_email:
        user = await db().admins.find_one({"email": env_email})
    if not user:
        user = await db().admins.find_one({})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid password")
    await db().admins.update_one({"id": user["id"]}, {"$set": {"last_login": now_iso()}})
    access = create_access_token(user["id"], user["role"])
    refresh = create_refresh_token(user["id"], user["role"])
    return LoginResponse(
        access_token=access,
        refresh_token=refresh,
        expires_in=60 * int(os.environ.get("JWT_ACCESS_EXPIRE_MIN", "1440")),
        user={"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user["role"]},
    )


class RefreshBody(BaseModel):
    refresh_token: str


@admin_router.post("/auth/refresh")
async def admin_refresh(body: RefreshBody):
    td = decode_token(body.refresh_token, refresh=True)
    if td.type != "refresh":
        raise HTTPException(401, "Wrong token type")
    return {"access_token": create_access_token(td.sub, td.role), "token_type": "bearer"}


@admin_router.get("/auth/me")
async def admin_me(td=Depends(get_current_admin)):
    return await get_user_doc(td)


@admin_router.post("/auth/change-password")
async def admin_change_password(body: ChangePasswordBody, td=Depends(get_current_admin)):
    user = await db().admins.find_one({"id": td.sub})
    if not user or not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(400, "Current password is incorrect")
    await db().admins.update_one({"id": td.sub}, {"$set": {"password_hash": hash_password(body.new_password)}})
    return {"ok": True}


@admin_router.put("/auth/profile")
async def admin_update_profile(body: UpdateProfileBody, td=Depends(get_current_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db().admins.update_one({"id": td.sub}, {"$set": update})
    return await get_user_doc(td)


# ===================================================================
# Dashboard stats
# ===================================================================
@admin_router.get("/dashboard/stats")
async def dashboard_stats(_=Depends(require_super_admin)):
    now = datetime.now(timezone.utc)
    last_30 = (now - timedelta(days=30)).isoformat()
    last_60 = (now - timedelta(days=60)).isoformat()

    total_products = await db().products.count_documents({})
    total_in_stock = await db().products.count_documents({"in_stock": True})
    total_leads = await db().leads.count_documents({})
    new_leads = await db().leads.count_documents({"status": "new"})
    leads_30d = await db().leads.count_documents({"created_at": {"$gte": last_30}})
    leads_30_60d = await db().leads.count_documents({"created_at": {"$gte": last_60, "$lt": last_30}})
    total_test = await db().testimonials.count_documents({})
    pending_test = await db().testimonials.count_documents({"approved": False})

    # leads over last 30 days grouped by day
    pipeline = [
        {"$match": {"created_at": {"$gte": last_30}}},
        {"$project": {"day": {"$substr": ["$created_at", 0, 10]}}},
        {"$group": {"_id": "$day", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    daily = [{"date": d["_id"], "count": d["count"]} async for d in db().leads.aggregate(pipeline)]

    # product interest distribution
    interest_pipe = [
        {"$match": {"product_interest": {"$ne": None}}},
        {"$group": {"_id": "$product_interest", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6},
    ]
    interest = [{"label": d["_id"], "count": d["count"]} async for d in db().leads.aggregate(interest_pipe)]

    recent = [serialize(d) async for d in db().leads.find({}, {"_id": 0, "ip": 0}).sort([("created_at", -1)]).limit(5)]

    growth = 0.0
    if leads_30_60d > 0:
        growth = round((leads_30d - leads_30_60d) / leads_30_60d * 100, 1)
    elif leads_30d > 0:
        growth = 100.0

    return {
        "counts": {
            "products": total_products,
            "products_in_stock": total_in_stock,
            "leads_total": total_leads,
            "leads_new": new_leads,
            "leads_30d": leads_30d,
            "testimonials_total": total_test,
            "testimonials_pending": pending_test,
        },
        "growth_30d_percent": growth,
        "leads_daily_30d": daily,
        "product_interest_top": interest,
        "recent_leads": recent,
    }


# ===================================================================
# Products admin CRUD (extended fields)
# ===================================================================
class ProductAdminBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(..., min_length=2, max_length=120)
    slug: Optional[str] = None
    category: str = Field(..., min_length=2, max_length=80)
    short_description: Optional[str] = Field(default=None, max_length=300)
    description: str = Field(..., min_length=10)
    full_description_html: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    specifications: dict = Field(default_factory=dict)
    image_url: Optional[str] = None
    images: List[dict] = Field(default_factory=list)
    badge: Optional[str] = None
    icon: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    show_price: bool = False
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    bulk_pricing_available: bool = True
    featured: bool = True
    warranty_period: Optional[str] = None
    sort_order: int = 0
    seo_meta_title: Optional[str] = None
    seo_meta_description: Optional[str] = None
    seo_keywords: List[str] = Field(default_factory=list)
    whatsapp_inquiry_prefill: Optional[str] = None


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:120] or str(uuid.uuid4())[:8]


@admin_router.get("/products")
async def admin_list_products(
    _=Depends(require_super_admin),
    category: Optional[str] = None,
    search: Optional[str] = None,
    in_stock: Optional[bool] = None,
    featured: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    q: dict = {}
    if category:
        q["category"] = {"$regex": re.escape(category), "$options": "i"}
    if in_stock is not None:
        q["in_stock"] = in_stock
    if featured is not None:
        q["featured"] = featured
    if search:
        q["$or"] = [
            {"name": {"$regex": re.escape(search), "$options": "i"}},
            {"description": {"$regex": re.escape(search), "$options": "i"}},
            {"category": {"$regex": re.escape(search), "$options": "i"}},
        ]
    total = await db().products.count_documents(q)
    cursor = db().products.find(q, {"_id": 0}).sort([("sort_order", 1), ("created_at", -1)]).skip((page - 1) * page_size).limit(page_size)
    items = [serialize(d) async for d in cursor]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@admin_router.post("/products", status_code=201)
async def admin_create_product(body: ProductAdminBase, _=Depends(require_super_admin)):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["slug"] = data.get("slug") or slugify(data["name"])
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    # ensure slug unique
    if await db().products.find_one({"slug": data["slug"]}):
        data["slug"] = f"{data['slug']}-{data['id'][:6]}"
    await db().products.insert_one(data.copy())
    return serialize(data)


@admin_router.put("/products/{product_id}")
async def admin_update_product(product_id: str, body: ProductAdminBase, _=Depends(require_super_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    if "slug" not in update or not update["slug"]:
        update["slug"] = slugify(update.get("name", ""))
    res = await db().products.find_one_and_update({"id": product_id}, {"$set": update}, return_document=True)
    if not res:
        raise HTTPException(404, "Product not found")
    return serialize(res)


@admin_router.delete("/products/{product_id}")
async def admin_delete_product(product_id: str, _=Depends(require_super_admin)):
    res = await db().products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"deleted": True}


@admin_router.post("/products/{product_id}/duplicate")
async def admin_duplicate_product(product_id: str, _=Depends(require_super_admin)):
    orig = await db().products.find_one({"id": product_id}, {"_id": 0})
    if not orig:
        raise HTTPException(404, "Product not found")
    orig["id"] = str(uuid.uuid4())
    orig["name"] = orig["name"] + " (Copy)"
    orig["slug"] = slugify(orig["name"]) + "-" + orig["id"][:6]
    orig["featured"] = False
    orig["created_at"] = now_iso()
    orig["updated_at"] = now_iso()
    await db().products.insert_one(orig.copy())
    return serialize(orig)


class BulkIdsBody(BaseModel):
    ids: List[str]


class BulkUpdateBody(BaseModel):
    ids: List[str]
    update: dict


@admin_router.post("/products/bulk-update")
async def admin_bulk_update_products(body: BulkUpdateBody, _=Depends(require_super_admin)):
    allowed = {"in_stock", "featured", "badge", "category", "bulk_pricing_available", "sort_order"}
    update = {k: v for k, v in body.update.items() if k in allowed}
    if not update:
        raise HTTPException(400, "No valid update fields")
    update["updated_at"] = now_iso()
    res = await db().products.update_many({"id": {"$in": body.ids}}, {"$set": update})
    return {"modified": res.modified_count}


@admin_router.post("/products/bulk-delete")
async def admin_bulk_delete_products(body: BulkIdsBody, _=Depends(require_super_admin)):
    res = await db().products.delete_many({"id": {"$in": body.ids}})
    return {"deleted": res.deleted_count}


# ===================================================================
# Leads admin
# ===================================================================
class LeadStatusBody(BaseModel):
    status: str = Field(..., pattern="^(new|contacted|converted|closed)$")
    internal_notes: Optional[str] = None
    deal_value: Optional[float] = None


@admin_router.get("/leads")
async def admin_list_leads(
    _=Depends(require_super_admin),
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
):
    q: dict = {}
    if status:
        q["status"] = status
    if search:
        q["$or"] = [
            {"name": {"$regex": re.escape(search), "$options": "i"}},
            {"phone": {"$regex": re.escape(search), "$options": "i"}},
            {"email": {"$regex": re.escape(search), "$options": "i"}},
            {"message": {"$regex": re.escape(search), "$options": "i"}},
        ]
    total = await db().leads.count_documents(q)
    cursor = db().leads.find(q, {"_id": 0}).sort([("created_at", -1)]).skip((page - 1) * page_size).limit(page_size)
    items = [serialize(d) async for d in cursor]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@admin_router.put("/leads/{lead_id}")
async def admin_update_lead(lead_id: str, body: LeadStatusBody, _=Depends(require_super_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    res = await db().leads.find_one_and_update({"id": lead_id}, {"$set": update}, return_document=True)
    if not res:
        raise HTTPException(404, "Lead not found")
    return serialize(res)


@admin_router.delete("/leads/{lead_id}")
async def admin_delete_lead(lead_id: str, _=Depends(require_super_admin)):
    res = await db().leads.delete_one({"id": lead_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Lead not found")
    return {"deleted": True}


@admin_router.post("/leads/bulk-status")
async def admin_bulk_status_leads(body: dict, _=Depends(require_super_admin)):
    ids = body.get("ids", [])
    status = body.get("status")
    if not status or status not in ("new", "contacted", "converted", "closed"):
        raise HTTPException(400, "Invalid status")
    res = await db().leads.update_many({"id": {"$in": ids}}, {"$set": {"status": status, "updated_at": now_iso()}})
    return {"modified": res.modified_count}


# ===================================================================
# Testimonials admin
# ===================================================================
class TestimonialAdminBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_name: str = Field(..., min_length=2, max_length=120)
    location: str = Field(..., min_length=2, max_length=120)
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=10, max_length=2000)
    customer_type: Optional[str] = Field(default=None, max_length=80)
    customer_photo: Optional[str] = None
    approved: bool = True
    featured: bool = False
    sort_order: int = 0


@admin_router.get("/testimonials")
async def admin_list_testimonials(
    _=Depends(require_super_admin),
    approved: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    q: dict = {}
    if approved is not None:
        q["approved"] = approved
    total = await db().testimonials.count_documents(q)
    cursor = db().testimonials.find(q, {"_id": 0}).sort([("sort_order", 1), ("created_at", -1)]).skip((page - 1) * page_size).limit(page_size)
    items = [serialize(d) async for d in cursor]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@admin_router.post("/testimonials", status_code=201)
async def admin_create_testimonial(body: TestimonialAdminBody, _=Depends(require_super_admin)):
    data = body.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_at"] = now_iso()
    await db().testimonials.insert_one(data.copy())
    return serialize(data)


@admin_router.put("/testimonials/{tid}")
async def admin_update_testimonial(tid: str, body: TestimonialAdminBody, _=Depends(require_super_admin)):
    update = body.model_dump()
    res = await db().testimonials.find_one_and_update({"id": tid}, {"$set": update}, return_document=True)
    if not res:
        raise HTTPException(404, "Testimonial not found")
    return serialize(res)


@admin_router.delete("/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, _=Depends(require_super_admin)):
    res = await db().testimonials.delete_one({"id": tid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"deleted": True}


@admin_router.post("/testimonials/bulk-approve")
async def admin_bulk_approve_testimonials(body: BulkIdsBody, _=Depends(require_super_admin)):
    res = await db().testimonials.update_many({"id": {"$in": body.ids}}, {"$set": {"approved": True}})
    return {"modified": res.modified_count}


# ===================================================================
# Media library
# ===================================================================
@admin_router.get("/media")
async def admin_list_media(
    _=Depends(require_super_admin),
    folder: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(40, ge=1, le=200),
):
    q: dict = {}
    if folder:
        q["folder"] = folder
    if search:
        q["$or"] = [
            {"original_filename": {"$regex": re.escape(search), "$options": "i"}},
            {"alt_text": {"$regex": re.escape(search), "$options": "i"}},
            {"tags": {"$regex": re.escape(search), "$options": "i"}},
        ]
    total = await db().media.count_documents(q)
    cursor = db().media.find(q, {"_id": 0}).sort([("created_at", -1)]).skip((page - 1) * page_size).limit(page_size)
    items = [serialize(d) async for d in cursor]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@admin_router.post("/media/upload")
async def admin_upload_media(
    file: UploadFile = File(...),
    folder: str = Form("general"),
    alt_text: str = Form(""),
    _=Depends(require_super_admin),
):
    if not file.content_type:
        raise HTTPException(400, "Missing content type")
    raw = await file.read()
    try:
        record = save_image(raw, file.filename or "upload", file.content_type, folder=folder)
    except ValueError as e:
        raise HTTPException(400, str(e))
    record["alt_text"] = alt_text or (file.filename or "")
    record["tags"] = []
    await db().media.insert_one(record.copy())
    return serialize(record)


class MediaUpdateBody(BaseModel):
    alt_text: Optional[str] = None
    tags: Optional[List[str]] = None
    folder: Optional[str] = None


@admin_router.put("/media/{media_id}")
async def admin_update_media(media_id: str, body: MediaUpdateBody, _=Depends(require_super_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await db().media.find_one_and_update({"id": media_id}, {"$set": update}, return_document=True)
    if not res:
        raise HTTPException(404, "Not found")
    return serialize(res)


@admin_router.delete("/media/{media_id}")
async def admin_delete_media(media_id: str, _=Depends(require_super_admin)):
    rec = await db().media.find_one({"id": media_id}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Not found")
    delete_image_files(rec)
    await db().media.delete_one({"id": media_id})
    return {"deleted": True}
