"""
Punjab Transformer House - Backend API
FastAPI + MongoDB. Public landing page backend with admin-ready CRUD
for Products, Leads (contact form), and Testimonials.
"""

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Phase 2A: Admin + SEO routers
from admin_routes import admin_router, set_db as set_admin_db, ensure_seed_admin
from seo_routes import seo_router, set_seo_db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# -------------------------------------------------------------------
# Mongo connection
# -------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "punjab_transformer_db")
client = AsyncIOMotorClient(mongo_url)
db = client[DB_NAME]

# Collections
products_col = db["products"]
leads_col = db["leads"]
testimonials_col = db["testimonials"]

# -------------------------------------------------------------------
# Rate limiter
# -------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=[])

# -------------------------------------------------------------------
# App
# -------------------------------------------------------------------
app = FastAPI(
    title="Punjab Transformer House API",
    description="REST API for Punjab Transformer House landing page (Products, Leads, Testimonials).",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("pth")

# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize_doc(doc: dict) -> dict:
    """Strip Mongo _id and ensure JSON-serializable values."""
    if doc is None:
        return doc
    doc.pop("_id", None)
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


# Pakistani phone validation (accepts +92xxxxxxxxxx, 0xxxxxxxxxx, etc.)
PHONE_RE = re.compile(r"^(\+?92|0)?3\d{9}$")

# -------------------------------------------------------------------
# Models: Products
# -------------------------------------------------------------------
class ProductBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., min_length=2, max_length=80)
    description: str = Field(..., min_length=10, max_length=2000)
    features: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    badge: Optional[str] = None
    icon: Optional[str] = None
    in_stock: bool = True
    bulk_pricing_available: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    icon: Optional[str] = None
    in_stock: Optional[bool] = None
    bulk_pricing_available: Optional[bool] = None
    sort_order: Optional[int] = None


class Product(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


# -------------------------------------------------------------------
# Models: Leads
# -------------------------------------------------------------------
class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(..., min_length=3, max_length=120)
    phone: str = Field(..., min_length=7, max_length=20)
    email: Optional[EmailStr] = None
    product_interest: Optional[str] = Field(None, max_length=120)
    message: str = Field(..., min_length=10, max_length=2000)
    source: Optional[str] = Field(default="website_contact_form", max_length=80)
    # honeypot field - bots fill it, humans don't
    company: Optional[str] = Field(default=None, max_length=120)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-()]", "", v)
        if not PHONE_RE.match(cleaned):
            raise ValueError(
                "Invalid phone number. Use a valid Pakistani mobile (e.g. 03XXXXXXXXX or +923XXXXXXXXX)."
            )
        return cleaned


class Lead(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    product_interest: Optional[str] = None
    message: str
    source: str = "website_contact_form"
    status: str = "new"
    created_at: str


# -------------------------------------------------------------------
# Models: Testimonials
# -------------------------------------------------------------------
class TestimonialBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_name: str = Field(..., min_length=2, max_length=120)
    location: str = Field(..., min_length=2, max_length=120)
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=10, max_length=2000)
    customer_type: Optional[str] = Field(default=None, max_length=80)
    approved: bool = True
    sort_order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_name: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    review_text: Optional[str] = None
    customer_type: Optional[str] = None
    approved: Optional[bool] = None
    sort_order: Optional[int] = None


class Testimonial(TestimonialBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


# -------------------------------------------------------------------
# Notification service stub
# -------------------------------------------------------------------
class NotificationService:
    """Pluggable notification layer.

    Currently a no-op stub. Wire SMTP/SendGrid here in a future phase.
    """

    async def notify_new_lead(self, lead: dict) -> None:
        # TODO: email notification hook (SMTP / SendGrid / Resend)
        logger.info("New lead captured id=%s name=%s phone=%s", lead.get("id"), lead.get("name"), lead.get("phone"))


notifications = NotificationService()

# -------------------------------------------------------------------
# Routes: Health
# -------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"service": "Punjab Transformer House API", "status": "ok"}


@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        db_ok = True
    except Exception as e:  # pragma: no cover
        logger.error("DB ping failed: %s", e)
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "db": db_ok, "time": now_iso()}


# -------------------------------------------------------------------
# Routes: Products
# -------------------------------------------------------------------
@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = Query(default=None, description="Filter by category slug or name"),
    in_stock: Optional[bool] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    q: dict = {}
    if category:
        q["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
    if in_stock is not None:
        q["in_stock"] = in_stock
    cursor = products_col.find(q, {"_id": 0}).sort([("sort_order", 1), ("created_at", 1)]).limit(limit)
    items = [serialize_doc(d) async for d in cursor]
    return items


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    doc = await products_col.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(doc)


@api_router.post("/products", response_model=Product, status_code=201)
async def create_product(payload: ProductCreate):
    obj = Product(**payload.model_dump())
    await products_col.insert_one(obj.model_dump())
    return obj


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductUpdate):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = now_iso()
    result = await products_col.find_one_and_update(
        {"id": product_id}, {"$set": update}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(result)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    res = await products_col.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"deleted": True, "id": product_id}


# -------------------------------------------------------------------
# Routes: Leads (rate limited)
# -------------------------------------------------------------------
@api_router.post("/leads", response_model=Lead, status_code=201)
@limiter.limit("8/minute")
async def create_lead(payload: LeadCreate, request: Request):
    # Honeypot - silently reject
    if payload.company:
        logger.warning("Honeypot triggered ip=%s", get_remote_address(request))
        raise HTTPException(status_code=400, detail="Invalid submission.")

    lead_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "phone": payload.phone,
        "email": payload.email,
        "product_interest": payload.product_interest,
        "message": payload.message.strip(),
        "source": payload.source or "website_contact_form",
        "status": "new",
        "created_at": now_iso(),
        "ip": get_remote_address(request),
    }
    await leads_col.insert_one(lead_doc.copy())
    await notifications.notify_new_lead(lead_doc)

    # Don't leak IP back to client
    lead_doc.pop("ip", None)
    return Lead(**lead_doc)


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(
    status: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    q: dict = {}
    if status:
        q["status"] = status
    cursor = leads_col.find(q, {"_id": 0, "ip": 0}).sort([("created_at", -1)]).limit(limit)
    items = [serialize_doc(d) async for d in cursor]
    return items


# -------------------------------------------------------------------
# Routes: Testimonials
# -------------------------------------------------------------------
@api_router.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials(
    approved: Optional[bool] = Query(default=True),
    limit: int = Query(default=50, ge=1, le=200),
):
    q: dict = {}
    if approved is not None:
        q["approved"] = approved
    cursor = testimonials_col.find(q, {"_id": 0}).sort([("sort_order", 1), ("created_at", 1)]).limit(limit)
    items = [serialize_doc(d) async for d in cursor]
    return items


@api_router.post("/testimonials", response_model=Testimonial, status_code=201)
async def create_testimonial(payload: TestimonialCreate):
    obj = Testimonial(**payload.model_dump())
    await testimonials_col.insert_one(obj.model_dump())
    return obj


@api_router.put("/testimonials/{tid}", response_model=Testimonial)
async def update_testimonial(tid: str, payload: TestimonialUpdate):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await testimonials_col.find_one_and_update(
        {"id": tid}, {"$set": update}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return serialize_doc(result)


# -------------------------------------------------------------------
# Seeders
# -------------------------------------------------------------------
DEFAULT_PRODUCTS = [
    {
        "name": "Voltage Regulators",
        "category": "Voltage Regulators",
        "description": "Precision voltage control solutions delivering stable output for homes, shops, and industrial setups. Single-phase and three-phase models available with wide voltage range and auto cut-off protection.",
        "features": ["Single & Three Phase", "Auto Cut-off Protection", "Wide Voltage Range"],
        "badge": "Most Popular",
        "icon": "GaugeCircle",
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "sort_order": 1,
    },
    {
        "name": "Voltage Stabilizers",
        "category": "Voltage Stabilizers",
        "description": "Servo and static stabilizers that protect your valuable appliances from voltage fluctuations, surges, and power irregularities. Digital display and overload protection on every unit.",
        "features": ["Servo & Static Types", "Digital Display", "Overload Protection"],
        "badge": "Best Seller",
        "icon": "ShieldCheck",
        "image_url": "https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=1200&q=80&sat=-30",
        "sort_order": 2,
    },
    {
        "name": "UPS Systems",
        "category": "UPS Systems",
        "description": "Online, offline and line-interactive UPS systems ensuring uninterrupted power for offices, data centers, hospitals and homes. Pure sine wave output with extended backup options.",
        "features": ["Online & Offline", "Long Backup Time", "Pure Sine Wave Output"],
        "badge": "Premium",
        "icon": "BatteryCharging",
        "image_url": "https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=1200&q=80",
        "sort_order": 3,
    },
    {
        "name": "Solar Instruments",
        "category": "Solar Instruments",
        "description": "Complete range of solar accessories including MPPT charge controllers, hybrid inverters, monitoring devices and installation hardware for residential and commercial solar systems.",
        "features": ["MPPT Controllers", "Hybrid Inverters", "Monitoring Systems"],
        "badge": "Eco-Friendly",
        "icon": "Sun",
        "image_url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
        "sort_order": 4,
    },
]

DEFAULT_TESTIMONIALS = [
    {
        "customer_name": "Muhammad Asif",
        "location": "Mirpur City",
        "rating": 5,
        "review_text": "Excellent service and genuine products. Bought a voltage stabilizer for my home and it's working perfectly. Highly recommended!",
        "customer_type": "Home Owner",
        "sort_order": 1,
    },
    {
        "customer_name": "Tariq Mehmood",
        "location": "Dadyal",
        "rating": 5,
        "review_text": "I bought a UPS system for my shop. Great quality and best price in Mirpur. Their team guided me very professionally.",
        "customer_type": "Shop Owner",
        "sort_order": 2,
    },
    {
        "customer_name": "Engineer Khalid",
        "location": "Islamgarh",
        "rating": 5,
        "review_text": "Most reliable electrical supplier in the area. Quality products, fair pricing, and excellent after-sales support.",
        "customer_type": "Industrial Client",
        "sort_order": 3,
    },
    {
        "customer_name": "Sajid Hussain",
        "location": "Kotli",
        "rating": 5,
        "review_text": "Got a complete solar inverter and MPPT controller package. Installation guidance was top-notch and prices were unbeatable.",
        "customer_type": "Home Owner",
        "sort_order": 4,
    },
    {
        "customer_name": "Imran Akhtar",
        "location": "Chakswari",
        "rating": 5,
        "review_text": "Bought three-phase stabilizers for our factory. Performance has been flawless for over a year. Highly trusted local supplier.",
        "customer_type": "Factory Owner",
        "sort_order": 5,
    },
    {
        "customer_name": "Dr. Nadeem",
        "location": "Bhimber",
        "rating": 5,
        "review_text": "Reliable online UPS for our clinic. Setup was smooth and backup time is exactly as promised. Truly premium service.",
        "customer_type": "Clinic Owner",
        "sort_order": 6,
    },
]


async def seed_collections() -> None:
    """Seed default products + testimonials if collections are empty."""
    try:
        if await products_col.count_documents({}) == 0:
            docs = [Product(**p).model_dump() for p in DEFAULT_PRODUCTS]
            await products_col.insert_many(docs)
            logger.info("Seeded %d products", len(docs))
        if await testimonials_col.count_documents({}) == 0:
            docs = [Testimonial(**t).model_dump() for t in DEFAULT_TESTIMONIALS]
            await testimonials_col.insert_many(docs)
            logger.info("Seeded %d testimonials", len(docs))
    except Exception as e:  # pragma: no cover
        logger.error("Seeding failed: %s", e)


@app.on_event("startup")
async def on_startup():
    await seed_collections()
    # Phase 2A: wire admin/seo DB + seed default admin
    set_admin_db(db)
    set_seo_db(db)
    await ensure_seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# -------------------------------------------------------------------
# Register router + CORS
# -------------------------------------------------------------------
app.include_router(api_router)
app.include_router(admin_router)  # /api/v1/admin/*
# SEO endpoints are mounted under /api so the K8s ingress routes traffic correctly
# (the frontend `public/sitemap.xml` and `robots.txt` proxy/reference these endpoints).
api_seo_router = APIRouter(prefix="/api")
api_seo_router.include_router(seo_router)
app.include_router(api_seo_router)  # /api/sitemap.xml + /api/robots.txt

# Mount uploads as static files
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/backend/uploads")
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
