from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from prisma import Prisma
from app.database import db
from app.models import UserCreate, UserLogin, UserResponse, Token, ChangePasswordRequest
from app.services.auth import (
    get_password_hash,
    create_access_token,
    authenticate_user,
    get_current_user,
    verify_password,
    oauth2_scheme
)
from datetime import datetime, timezone

router = APIRouter()


@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if username already exists
    existing_user = await db.user.find_unique(where={"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await db.user.find_unique(where={"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    user = await db.user.create(data={
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "is_active": True
    })
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "username": user.username}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )


@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    user = await authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "username": user.username}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user information"""
    user = await get_current_user(db, token)
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )


@router.post("/auth/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """Logout (client-side token invalidation)"""
    # Since JWT is stateless, we inform the client to remove the token
    # For true logout, you'd need a token blacklist in Redis/Database
    return {"message": "Successfully logged out. Please remove the token from client storage."}


@router.post("/auth/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    token: str = Depends(oauth2_scheme)
):
    """Change user password"""
    # Get current user
    user = await get_current_user(db, token)
    
    # Verify current password
    if not verify_password(password_data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Update password
    hashed_password = get_password_hash(password_data.new_password)
    await db.user.update(
        where={"id": user.id},
        data={"password_hash": hashed_password}
    )
    
    return {"message": "Password changed successfully"}
