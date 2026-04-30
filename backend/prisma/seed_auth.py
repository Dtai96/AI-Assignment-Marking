"""
Authentication seeding script
Creates a default admin user for the system
"""
import asyncio
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from prisma import Prisma
from app.services.auth import get_password_hash


async def seed_auth():
    """Seed the database with default admin user"""
    db = Prisma()
    await db.connect()
    
    try:
        # Check if admin user already exists
        existing_admin = await db.user.find_unique(where={"username": "admin"})
        
        if existing_admin:
            print("✅ Admin user already exists")
        else:
            # Create admin user
            hashed_password = get_password_hash("admin123")
            
            admin = await db.user.create(data={
                "username": "admin",
                "email": "admin@aimarking.com",
                "password_hash": hashed_password,
                "full_name": "System Administrator",
                "role": "admin",
                "is_active": True
            })
            
            print("✅ Created admin user:")
            print(f"   Username: admin")
            print(f"   Password: admin123")
            print(f"   Email: admin@aimarking.com")
            print(f"   Role: admin")
        
        # Create a demo teacher user
        existing_teacher = await db.user.find_unique(where={"username": "teacher"})
        
        if existing_teacher:
            print("✅ Demo teacher user already exists")
        else:
            hashed_password = get_password_hash("teacher123")
            
            teacher = await db.user.create(data={
                "username": "teacher",
                "email": "teacher@aimarking.com",
                "password_hash": hashed_password,
                "full_name": "Demo Teacher",
                "role": "teacher",
                "is_active": True
            })
            
            print("✅ Created demo teacher user:")
            print(f"   Username: teacher")
            print(f"   Password: teacher123")
            print(f"   Email: teacher@aimarking.com")
            print(f"   Role: teacher")
        
        # Create demo student user accounts
        student_accounts = [
            {"username": "alice",   "email": "alice@aimarking.com",   "full_name": "Alice",   "password": "alice123"},
            {"username": "david",   "email": "david@aimarking.com",   "full_name": "David",   "password": "david123"},
            {"username": "bob",     "email": "bob@aimarking.com",     "full_name": "Bob",     "password": "bob123"},
            {"username": "charlie", "email": "charlie@aimarking.com", "full_name": "Charlie", "password": "charlie123"},
        ]

        for s in student_accounts:
            existing = await db.user.find_unique(where={"username": s["username"]})
            if existing:
                print(f"✅ Student user already exists: {s['username']}")
            else:
                hashed_password = get_password_hash(s["password"])
                await db.user.create(data={
                    "username": s["username"],
                    "email": s["email"],
                    "password_hash": hashed_password,
                    "full_name": s["full_name"],
                    "role": "student",
                    "is_active": True
                })
                print(f"✅ Created student user: {s['username']} / {s['password']}")
        
        print("\n✅ Authentication seeding completed successfully!")
        print("\n📝 You can now login with:")
        print("   - Admin: admin / admin123")
        print("   - Teacher: teacher / teacher123")
        print("   - Students: alice/alice123, david/david123, bob/bob123, charlie/charlie123")
        
    except Exception as e:
        print(f"\n❌ Error during auth seeding: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed_auth())
