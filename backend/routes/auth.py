from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
import random
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import User, UserCreate, UserLogin, UserResponse, Token
from auth import get_password_hash, verify_password, create_access_token, generate_otp, store_otp, get_stored_otp, clear_otp, verify_otp
from database import get_database
from dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str
    name: str
    role: str = "learner"

class PasswordReset(BaseModel):
    email: str
    new_password: str
    otp: str

@router.post("/register", response_model=Token)
async def register_user(user_data: UserCreate, db = Depends(get_database)):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if user_data.phone:
        existing_phone = await db.users.find_one({"phone": user_data.phone})
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password,
        role=user_data.role,
        language=user_data.language,
        state=user_data.state
    )
    
    # Insert user into database
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    user_response = UserResponse(**user.dict())
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=30 * 24 * 60 * 60,  # 30 days in seconds
        user=user_response
    )

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, db = Depends(get_database)):
    """Login user with email and password"""
    
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user = User(**user_doc)
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    user_response = UserResponse(**user.dict())
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=30 * 24 * 60 * 60,  # 30 days in seconds
        user=user_response
    )

@router.post("/send-otp")
async def send_otp(otp_request: OTPRequest):
    """Send OTP to phone number"""
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP temporarily
    store_otp(otp_request.phone, otp)
    
    # In production, integrate with SMS service like Twilio
    # For now, we'll return the OTP in response (only for development)
    print(f"OTP for {otp_request.phone}: {otp}")
    
    return {
        "message": "OTP sent successfully",
        "otp": otp  # Remove this in production
    }

@router.post("/verify-otp", response_model=Token)
async def verify_otp_login(otp_verify: OTPVerify, db = Depends(get_database)):
    """Verify OTP and login/register user"""
    
    # Get stored OTP
    stored_otp_data = get_stored_otp(otp_verify.phone)
    if not stored_otp_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )
    
    # Verify OTP
    if not verify_otp(stored_otp_data["otp"], otp_verify.otp, stored_otp_data["timestamp"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Clear OTP
    clear_otp(otp_verify.phone)
    
    # Check if user exists
    user_doc = await db.users.find_one({"phone": otp_verify.phone})
    
    if user_doc:
        # User exists, login
        user = User(**user_doc)
    else:
        # Create new user
        user = User(
            name=otp_verify.name,
            email=f"{otp_verify.phone}@temp.com",  # Temporary email
            phone=otp_verify.phone,
            password_hash=get_password_hash(generate_otp()),  # Random password
            role=otp_verify.role
        )
        await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    user_response = UserResponse(**user.dict())
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=30 * 24 * 60 * 60,  # 30 days in seconds
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**current_user.dict())

@router.put("/profile", response_model=UserResponse)
async def update_profile(profile_data: dict, current_user: User = Depends(get_current_user), db = Depends(get_database)):
    """Update user profile"""
    
    # Filter allowed fields
    allowed_fields = [
        "name", "target_role", "learning_goals", "skills", 
        "language", "state", "profile_picture"
    ]
    
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user in database
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user_doc = await db.users.find_one({"id": current_user.id})
    updated_user = User(**updated_user_doc)
    
    return UserResponse(**updated_user.dict())

@router.post("/logout")
async def logout():
    """Logout user (client should clear token)"""
    return {"message": "Logged out successfully"}