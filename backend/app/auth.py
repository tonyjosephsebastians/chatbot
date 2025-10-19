from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # placeholder

USERS = {
    "admin": {"password": "admin", "role": "admin"},
    "frp":   {"password": "pass",  "role": "user"}
}

def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = USERS.get(username)
    if not user or user["password"] != password:
        return None
    return {"username": username, "role": user["role"]}

def create_access_token(data: dict, expires_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)
    return encoded_jwt

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
    except Exception:
        return None
