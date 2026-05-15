"""SEO helpers: dynamic sitemap.xml + robots.txt."""
from __future__ import annotations

import os
from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, Response

seo_router = APIRouter(tags=["seo"])

BASE = os.environ.get("PUBLIC_BASE_URL", "https://punjabtransformerhouse.com").rstrip("/")
# Force the canonical production domain in <loc> entries regardless of the
# environment where this is served (preview or prod), so search engines always
# get the public URL.
CANONICAL_BASE = "https://punjabtransformerhouse.com"

SITEMAP_CACHE_HEADERS = {"Cache-Control": "public, max-age=3600"}

_DB = None


def set_seo_db(db):
    global _DB
    _DB = db


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _iso_date(value) -> str:
    """Coerce a stored datetime/ISO-string into a YYYY-MM-DD string."""
    if not value:
        return _today()
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    s = str(value)
    return s[:10] if len(s) >= 10 else _today()


@seo_router.get("/sitemap.xml")
async def sitemap_xml():
    today = _today()

    # Section anchors (real ids on HomePage) — single-page app, so we expose
    # the in-page sections rather than non-existent /products/{slug} routes.
    static_pages = [
        ("/", "1.0", "weekly"),
        ("/#about", "0.8", "monthly"),
        ("/#products", "0.9", "weekly"),
        ("/#why-us", "0.7", "monthly"),
        ("/#testimonials", "0.7", "monthly"),
        ("/#contact", "0.8", "monthly"),
        ("/#faq", "0.6", "monthly"),
    ]

    # Use the most-recently-updated product as lastmod for /#products so the
    # crawler knows when new inventory was added, without inventing routes
    # that don't exist on the frontend.
    products_lastmod = today
    if _DB is not None:
        latest = await _DB.products.find_one(
            {}, {"_id": 0, "updated_at": 1}, sort=[("updated_at", -1)]
        )
        if latest and latest.get("updated_at"):
            products_lastmod = _iso_date(latest["updated_at"])

    lastmod_overrides = {"/#products": products_lastmod}

    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url, prio, freq in static_pages:
        lm = lastmod_overrides.get(url, today)
        parts.append(
            f"<url><loc>{CANONICAL_BASE}{url}</loc><lastmod>{lm}</lastmod>"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )
    parts.append("</urlset>")

    return Response(
        "\n".join(parts),
        media_type="application/xml",
        headers=SITEMAP_CACHE_HEADERS,
    )


@seo_router.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
    body = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin/\n"
        "Disallow: /api/\n"
        "Disallow: /uploads/private/\n"
        "\n"
        "User-agent: AhrefsBot\nDisallow: /\n"
        "User-agent: SemrushBot\nDisallow: /\n"
        "\n"
        f"Sitemap: {CANONICAL_BASE}/sitemap.xml\n"
        "Crawl-delay: 1\n"
    )
    return PlainTextResponse(body, headers=SITEMAP_CACHE_HEADERS)
