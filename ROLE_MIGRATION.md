# Role System Migration Guide

## 📋 Overview

This document describes the changes made to the role system and provides migration instructions for existing deployments.

## 🔄 Changes Made

### Role Updates
- **Removed**: `TA` (Teaching Assistant) role
- **Removed**: `Member` role  
- **Added**: `Student` role
- **Current Roles**: `Admin`, `Teacher`, `Student`

### Student Role Permissions

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| View Own Submissions | ✅ Yes | ✅ All | ✅ All |
| Upload Submissions | ❌ No | ✅ Yes | ✅ Yes |
| Grade Submissions | ❌ No | ✅ Yes | ✅ Yes |
| Manage Students | ❌ No | ✅ Yes | ✅ Yes |
| Manage Questions | ❌ No | ✅ Yes | ✅ Yes |
| View Students Tab | ❌ No | ✅ Yes | ✅ Yes |
| View Questions Tab | ❌ No | ✅ Yes | ✅ Yes |

## ⚠️ Breaking Changes

### 1. Database Migration Required

If you have existing users with the `ta` role, you **MUST** run the migration script before the application will work correctly.

#### Option 1: Using the Migration Script (Recommended)

```bash
# Windows
cd backend
migrate_roles.bat

# Linux/Mac
cd backend
python migrate_ta_to_student.py
```

#### Option 2: Manual SQL Migration

```sql
-- Update all TA users to Student role
UPDATE User SET role = 'student' WHERE role = 'ta';

-- Verify the migration
SELECT role, COUNT(*) as count FROM User GROUP BY role;
```

### 2. Student Username Convention

**IMPORTANT**: Student usernames MUST match their StudentID in the database.

**Example**:
- User.username: `S10485739`
- Student.StudentID: `S10485739`

If these don't match, the student will see an empty submissions list.

**How to verify**:
```sql
-- Check if student usernames match StudentIDs
SELECT u.username, s.StudentID 
FROM User u
LEFT JOIN Student s ON u.username = s.StudentID
WHERE u.role = 'student';
```

## 🧪 Testing Checklist

After migration, verify the following:

### Student Account Testing
- [ ] Login as a student user
- [ ] Verify only the "Submissions" tab is visible
- [ ] Verify only their own submissions appear (not all submissions)
- [ ] Verify no "Upload" button is visible
- [ ] Verify no "Grade" buttons are visible
- [ ] Verify no "Grade All" button is visible
- [ ] Try accessing `/api/grade/{id}` endpoint (should return 403)
- [ ] Try accessing `/api/upload` endpoint (should return 403)

### Teacher/Admin Account Testing
- [ ] Login as teacher or admin
- [ ] Verify all three tabs are visible (Submissions, Students, Questions)
- [ ] Verify all submissions are visible (not just their own)
- [ ] Verify "Upload" button is visible
- [ ] Verify "Grade" buttons are visible
- [ ] Verify "Grade All" button is visible
- [ ] Test grading a submission (should succeed)
- [ ] Test uploading a PDF (should succeed)

### Edge Cases
- [ ] Student with NO submissions sees empty state message
- [ ] Student with mismatched username sees empty list (check logs for warning)
- [ ] Creating a new user with "student" role works correctly
- [ ] Editing an existing user's role from teacher to student works correctly

## 🔧 Troubleshooting

### Issue: Student sees no submissions

**Possible causes**:
1. Username doesn't match StudentID
2. No submissions exist for that student
3. Submissions exist but with different StudentID format

**Solution**:
```sql
-- Check student's username
SELECT username, role FROM User WHERE role = 'student';

-- Check available StudentIDs
SELECT StudentID, Name FROM Student;

-- Check submissions
SELECT StudentID, QuestID FROM Submission;
```

### Issue: Old TA users can't login

**Cause**: Role 'ta' no longer exists in the codebase.

**Solution**: Run the migration script to update TA users to Student role.

### Issue: 403 Forbidden errors for students

**Expected behavior**: Students should get 403 errors when trying to:
- Access `/api/grade/*` endpoints
- Access `/api/upload` endpoint
- Access student management endpoints
- Access question management endpoints

This is **correct** behavior. Students only have read access to their own submissions.

## 📁 Modified Files

### Backend
- `backend/app/services/rbac.py` - Updated role permissions
- `backend/app/routers/submissions.py` - Added student filtering
- `backend/app/routers/grading.py` - Added student restrictions
- `backend/app/routers/upload.py` - Added student restrictions
- `backend/app/routers/users.py` - Updated valid roles list
- `backend/migrate_ta_to_student.py` - Migration script (NEW)
- `backend/migrate_roles.bat` - Windows migration helper (NEW)

### Frontend
- `frontend/src/context/AuthContext.tsx` - Updated permissions
- `frontend/src/components/Dashboard.tsx` - Added tab restrictions
- `frontend/src/components/GradeActions.tsx` - Hidden for students
- `frontend/src/components/SubmissionsTable.tsx` - Hidden grade buttons
- `frontend/src/components/CreateUserModal.tsx` - Updated role options
- `frontend/src/components/EditUserModal.tsx` - Updated role options
- `frontend/src/components/AdminDashboard.tsx` - Updated role badges

## 🚀 Deployment Steps

1. **Backup your database**
   ```bash
   mysqldump -u [user] -p [database_name] > backup_before_role_migration.sql
   ```

2. **Deploy new code**
   ```bash
   git pull origin main
   cd frontend && npm install && npm run build
   cd ../backend
   ```

3. **Run migration**
   ```bash
   python migrate_ta_to_student.py
   ```

4. **Restart application**
   ```bash
   # Backend
   python -m uvicorn app.main:app --reload
   
   # Frontend
   cd frontend && npm run dev
   ```

5. **Run testing checklist** (see above)

## 📞 Support

If you encounter issues during migration:
1. Check the troubleshooting section above
2. Review application logs for error messages
3. Verify database state with SQL queries provided
4. Ensure all files in the "Modified Files" section are updated

---

**Last Updated**: 2026-04-29  
**Version**: 2.0.0 (Role System Refactor)
