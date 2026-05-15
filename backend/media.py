"""Image upload + processing for the admin Media Library.
Converts uploads to WebP and generates responsive sizes.
"""
from __future__ import annotations

import io
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from PIL import Image

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/app/backend/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "products").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "testimonials").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "general").mkdir(parents=True, exist_ok=True)

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIMES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
    "image/svg+xml",
}

SIZES = {
    "thumb": 300,
    "medium": 800,
    "large": 1600,
}


def _safe_folder(folder: Optional[str]) -> str:
    if folder and folder.replace("-", "").replace("_", "").isalnum():
        return folder
    return "general"


def save_image(file_bytes: bytes, original_name: str, mime: str, folder: str = "general") -> dict:
    """Persist uploaded image; generate webp + responsive sizes if raster."""
    if len(file_bytes) > MAX_FILE_BYTES:
        raise ValueError("File exceeds 10 MB limit")
    if mime not in ALLOWED_MIMES:
        raise ValueError(f"Unsupported MIME type: {mime}")

    folder = _safe_folder(folder)
    base_id = str(uuid.uuid4())
    folder_path = UPLOAD_DIR / folder
    folder_path.mkdir(parents=True, exist_ok=True)

    # SVG: store as-is, no resizing
    if mime == "image/svg+xml":
        fname = f"{base_id}.svg"
        (folder_path / fname).write_bytes(file_bytes)
        rel = f"/uploads/{folder}/{fname}"
        return {
            "id": base_id,
            "folder": folder,
            "original_filename": original_name,
            "format": "svg",
            "file_size": len(file_bytes),
            "width": None,
            "height": None,
            "url": rel,
            "thumb_url": rel,
            "medium_url": rel,
            "large_url": rel,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    # Raster
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.load()
    except Exception as e:
        raise ValueError(f"Invalid image: {e}")

    if img.mode in ("RGBA", "LA", "P"):
        # Keep alpha for PNG; convert palette to RGBA
        if img.mode == "P":
            img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    w, h = img.size
    out = {"id": base_id, "folder": folder, "original_filename": original_name,
           "format": "webp", "file_size": len(file_bytes), "width": w, "height": h,
           "created_at": datetime.now(timezone.utc).isoformat()}

    # Original (compressed webp)
    orig_name = f"{base_id}.webp"
    img.save(folder_path / orig_name, "WEBP", quality=88, method=6)
    out["url"] = f"/uploads/{folder}/{orig_name}"

    # Responsive sizes
    for label, max_w in SIZES.items():
        if w <= max_w:
            out[f"{label}_url"] = out["url"]
            continue
        ratio = max_w / float(w)
        new_size = (max_w, max(1, int(h * ratio)))
        thumb = img.resize(new_size, Image.LANCZOS)
        tname = f"{base_id}-{label}.webp"
        thumb.save(folder_path / tname, "WEBP", quality=85, method=6)
        out[f"{label}_url"] = f"/uploads/{folder}/{tname}"

    return out


def delete_image_files(record: dict) -> None:
    """Best-effort delete of all variants on disk."""
    folder = record.get("folder", "general")
    base = record.get("id")
    if not base:
        return
    folder_path = UPLOAD_DIR / folder
    for variant in [f"{base}.webp", f"{base}.svg", f"{base}-thumb.webp", f"{base}-medium.webp", f"{base}-large.webp"]:
        p = folder_path / variant
        if p.exists():
            try:
                p.unlink()
            except Exception:
                pass
