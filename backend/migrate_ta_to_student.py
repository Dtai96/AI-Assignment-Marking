"""
Migration Script: TA Role to Student Role

This script migrates all users with 'ta' role to 'student' role.
Run this script if you have existing TA users in your database.

Usage:
    python migrate_ta_to_student.py

Prerequisites:
    - Database must be running
    - Prisma client must be generated
"""

import asyncio
from prisma import Prisma


async def migrate_ta_to_student():
    """Migrate all TA users to Student role"""
    db = Prisma()
    await db.connect()
    
    try:
        # Check if there are any TA users
        ta_users = await db.user.find_many(
            where={"role": "ta"}
        )
        
        if not ta_users:
            print("✅ No TA users found. Migration not needed.")
            return
        
        print(f"📋 Found {len(ta_users)} user(s) with 'ta' role:")
        for user in ta_users:
            print(f"   - {user.username} ({user.email})")
        
        # Confirm migration
        confirm = input("\n⚠️  Do you want to migrate these users to 'student' role? (yes/no): ")
        
        if confirm.lower() != 'yes':
            print("❌ Migration cancelled.")
            return
        
        # Update all TA users to Student role
        result = await db.user.update_many(
            where={"role": "ta"},
            data={"role": "student"}
        )
        
        print(f"\n✅ Successfully migrated {result.count} user(s) from 'ta' to 'student' role.")
        
        # Verify migration
        remaining_ta = await db.user.find_many(
            where={"role": "ta"}
        )
        
        if len(remaining_ta) == 0:
            print("✅ Verification passed: No TA users remain in the database.")
        else:
            print(f"⚠️  Warning: {len(remaining_ta)} TA user(s) still exist.")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    print("=" * 60)
    print("🔄 TA to Student Role Migration Script")
    print("=" * 60)
    print()
    
    asyncio.run(migrate_ta_to_student())
    
    print()
    print("=" * 60)
    print("✅ Migration complete!")
    print("=" * 60)
