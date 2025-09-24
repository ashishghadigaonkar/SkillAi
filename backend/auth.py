from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from fastapi import HTTPException, status
import secrets
import string

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Settings
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """Decode JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def verify_otp(stored_otp: str, provided_otp: str, timestamp: datetime, validity_minutes: int = 10) -> bool:
    """Verify OTP within validity period"""
    if stored_otp != provided_otp:
        return False
    
    # Check if OTP is still valid
    expiry_time = timestamp + timedelta(minutes=validity_minutes)
    return datetime.utcnow() <= expiry_time

# Mock OTP storage (in production, use Redis or database)
otp_storage = {}

def store_otp(phone: str, otp: str):
    """Store OTP temporarily"""
    otp_storage[phone] = {
        "otp": otp,
        "timestamp": datetime.utcnow()
    }

def get_stored_otp(phone: str) -> Optional[dict]:
    """Get stored OTP"""
    return otp_storage.get(phone)

def clear_otp(phone: str):
    """Clear OTP after verification"""
    if phone in otp_storage:
        del otp_storage[phone]