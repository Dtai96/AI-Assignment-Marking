from fastapi import APIRouter, HTTPException, status, Depends
from prisma import Prisma
from app.database import db
from app.models import UserCreate, UserResponse, Student
from app.services.auth import get_password_hash, get_current_user, oauth2_scheme
from app.services.rbac import require_admin
from typing import List
from pydantic import BaseModel

router = APIRouter()


class UserUpdate(BaseModel):
    """Model for updating user role and status"""
    role: str = "teacher"
    is_active: bool = True


class UserListResponse(BaseModel):
    """Response model for listing users"""
    users: List[UserResponse]
    total: int


@router.get("/admin/users", response_model=UserListResponse)
async def list_all_users(token: str = Depends(oauth2_scheme)):
    """Get all users - Admin only"""
    # Authenticate and authorize
    admin_user = await get_current_user(db, token)
    await require_admin(admin_user)
    
    users = await db.user.find_many(order={"created_at": "desc"})
    
    user_responses = [
        UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
        for user in users
    ]
    
    return UserListResponse(users=user_responses, total=len(user_responses))


@router.post("/admin/users", response_model=UserResponse)
async def create_new_user(
    user_data: UserCreate,
    token: str = Depends(oauth2_scheme)
):
    """Create a new user - Admin only"""
    # Authenticate and authorize
    admin_user = await get_current_user(db, token)
    await require_admin(admin_user)
    
    # Check if username already exists
    existing_user = await db.user.find_unique(where={"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    existing_email = await db.user.find_unique(where={"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    user = await db.user.create(data={
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "is_active": user_data.is_active if hasattr(user_data, 'is_active') else True
    })
    
    # Create corresponding student record for student users
    if user_data.role == "student":
        # Generate StudentID from username or use a default pattern
        # For now, use username as StudentID
        student_id = user_data.username
        # Check if student record already exists
        existing_student = await db.student.find_unique(where={"StudentID": student_id})
        if not existing_student:
            try:
                await db.student.create(data={
                    "StudentID": student_id,
                    "Name": user_data.full_name,
                    "UserID": user.id
                })
            except Exception as e:
                # Log the error but don't fail the user creation
                print(f"Warning: Failed to create student record for {user_data.username}: {e}")
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )


@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    token: str = Depends(oauth2_scheme)
):
    """Update user role and status - Admin only"""
    # Authenticate and authorize
    admin_user = await get_current_user(db, token)
    await require_admin(admin_user)
    
    # Check if user exists
    existing_user = await db.user.find_unique(where={"id": user_id})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate role
    valid_roles = ["admin", "teacher", "student"]
    if user_update.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Update user
    updated_user = await db.user.update(
        where={"id": user_id},
        data={
            "role": user_update.role,
            "is_active": user_update.is_active
        }
    )
    
    # Create corresponding student record if role is changed to student and no student record exists
    if user_update.role == "student":
        # Check if student record already exists
        existing_student = await db.student.find_unique(where={"UserID": user_id})
        if not existing_student:
            try:
                # Use username as StudentID
                student_id = updated_user.username
                await db.student.create(data={
                    "StudentID": student_id,
                    "Name": updated_user.full_name,
                    "UserID": updated_user.id
                })
            except Exception as e:
                # Log the error but don't fail the user update
                print(f"Warning: Failed to create student record for {updated_user.username}: {e}")
    
    return UserResponse(
        id=updated_user.id,
        username=updated_user.username,
        email=updated_user.email,
        full_name=updated_user.full_name,
        role=updated_user.role,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at
    )


@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    token: str = Depends(oauth2_scheme)
):
    """Delete a user - Admin only"""
    # Authenticate and authorize
    admin_user = await get_current_user(db, token)
    await require_admin(admin_user)
    
    # Check if user exists
    existing_user = await db.user.find_unique(where={"id": user_id})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if admin_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    await db.user.delete(where={"id": user_id})
    
    return {"message": "User deleted successfully"}
