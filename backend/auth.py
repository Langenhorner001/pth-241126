"""
Authentication utilities for Punjab Transformer House admin panel.
JWT-based with bcrypt password hashing.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-only-secret")
JWT_REFRESH_SECRET = os.environ.get("JWT_REFRESH_SECRET", "dev-only-refresh")
JWT_ALGO = "HS256"
ACCESS_EXPIRE_MIN = int(os.environ.get("JWT_ACCESS_EXPIRE_MIN", "1440"))  # 24h
REFRESH_EXPIRE_DAYS = int(os.environ.get("JWT_REFRESH_EXPIRE_DAYS", "30"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/auth/login", auto_error=False)


class TokenData(BaseModel):
    sub: str
    role: str
    type: str = "access"


# ---------- password ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ---------- tokens ----------
def _create_token(payload: dict, secret: str, minutes: int) -> str:
    to_encode = payload.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    to_encode["iat"] = datetime.now(timezone.utc)
    return jwt.encode(to_encode, secret, algorithm=JWT_ALGO)


def create_access_token(user_id: str, role: str) -> str:
    return _create_token({"sub": user_id, "role": role, "type": "access"}, JWT_SECRET, ACCESS_EXPIRE_MIN)


def create_refresh_token(user_id: str, role: str) -> str:
    return _create_token({"sub": user_id, "role": role, "type": "refresh"}, JWT_REFRESH_SECRET, REFRESH_EXPIRE_DAYS * 24 * 60)


def decode_token(token: str, refresh: bool = False) -> TokenData:
    secret = JWT_REFRESH_SECRET if refresh else JWT_SECRET
    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGO])
        return TokenData(**payload)
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


# ---------- FastAPI deps ----------
async def get_current_admin(token: Optional[str] = Depends(oauth2_scheme)) -> TokenData:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    td = decode_token(token, refresh=False)
    if td.type != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")
    return td


async def require_super_admin(td: TokenData = Depends(get_current_admin)) -> TokenData:
    if td.role not in ("super_admin", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return td
