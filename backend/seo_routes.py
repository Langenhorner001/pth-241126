"""SEO helpers: dynamic sitemap.xml + robots.txt."""
from __future__ import annotations

import os
from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, Response

seo_router = APIRouter(tags=["seo"])

BASE = os.environ.get("PUBLIC_BASE_URL", "https://punjabtransformerhouse.com").rstrip("/")

_DB = None


def set_seo_db(db):
    global _DB
    _DB = db


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


@seo_router.get("/sitemap.xml")
async def sitemap_xml():
    today = _today()
    static_pages = [
        ("/", "1.0", "weekly"),
        ("/#about", "0.8", "monthly"),
        ("/#products", "0.9", "weekly"),
        ("/#why-us", "0.7", "monthly"),
        ("/#testimonials", "0.7", "monthly"),
        ("/#contact", "0.8", "monthly"),
        ("/#faq", "0.6", "monthly"),
    ]
    products = []
    if _DB is not None:
        async for p in _DB.products.find({}, {"_id": 0, "slug": 1, "updated_at": 1}):
            slug = p.get("slug")
            if slug:
                products.append((f"/products/{slug}", "0.8", "weekly", p.get("updated_at", today)[:10]))

    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url, prio, freq in static_pages:
        parts.append(
            f"<url><loc>{BASE}{url}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )
    for url, prio, freq, lastmod in products:
        parts.append(
            f"<url><loc>{BASE}{url}</loc><lastmod>{lastmod}</lastmod>"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )
    parts.append("</urlset>")
    return Response("\n".join(parts), media_type="application/xml")


@seo_router.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
    return (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin/\n"
        "Disallow: /api/\n"
        "Disallow: /uploads/private/\n"
        "\n"
        "User-agent: AhrefsBot\nDisallow: /\n"
        "User-agent: SemrushBot\nDisallow: /\n"
        "\n"
        f"Sitemap: {BASE}/sitemap.xml\n"
        "Crawl-delay: 1\n"
    )
