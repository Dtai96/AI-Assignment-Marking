from enum import Enum
from typing import List
from fastapi import HTTPException, status
from prisma.models import User


class UserRole(str, Enum):
    """Define available user roles"""
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


# Permission matrix defining what each role can do
ROLE_PERMISSIONS = {
    UserRole.ADMIN: {
        "users": ["create", "read", "update", "delete"],
        "students": ["create", "read", "update", "delete"],
        "questions": ["create", "read", "update", "delete"],
        "submissions": ["read"],
        "grading": ["grade_single", "grade_all"],
        "upload": ["upload_submission"],
    },
    UserRole.TEACHER: {
        "users": ["read"],  # Can only read own profile
        "students": ["create", "read", "update", "delete"],
        "questions": ["create", "read", "update", "delete"],
        "submissions": ["read"],
        "grading": ["grade_single", "grade_all"],
        "upload": ["upload_submission"],
    },
    UserRole.STUDENT: {
        "users": ["read"],  # Can only read own profile
        "students": ["read"],
        "questions": ["read"],
        "submissions": ["read"],
        "grading": [],
        "upload": [],
    },
}


def check_role_permission(user_role: str, resource: str, action: str) -> bool:
    """
    Check if a user role has permission to perform an action on a resource
    
    Args:
        user_role: The user's role (admin, teacher, student)
        resource: The resource type (users, students, questions, etc.)
        action: The action to perform (create, read, update, delete, etc.)
    
    Returns:
        bool: True if permission is granted, False otherwise
    """
    try:
        role = UserRole(user_role)
        permissions = ROLE_PERMISSIONS.get(role, {})
        resource_permissions = permissions.get(resource, [])
        return action in resource_permissions
    except ValueError:
        return False


def require_role(required_roles: List[UserRole]):
    """
    Decorator/Dependency factory to require specific roles for an endpoint
    
    Args:
        required_roles: List of roles that are allowed to access the endpoint
    
    Returns:
        A dependency function that validates the user's role
    """
    async def role_checker(user: User):
        user_role = UserRole(user.role)
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {[r.value for r in required_roles]}"
            )
        return user
    return role_checker


async def require_admin(user: User):
    """Require admin role"""
    if user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user


async def require_teacher_or_admin(user: User):
    """Require teacher or admin role"""
    if user.role not in [UserRole.TEACHER.value, UserRole.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher or Admin privileges required"
        )
    return user


async def require_active_user(user: User):
    """Require user to be active (already checked in get_current_user, but explicit for clarity)"""
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    return user


def is_student_role(user: User) -> bool:
    """Check if user has student role"""
    return user.role == UserRole.STUDENT.value


def is_teacher_or_admin(user: User) -> bool:
    """Check if user has teacher or admin role"""
    return user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]
