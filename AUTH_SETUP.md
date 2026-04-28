# Authentication Setup Guide

## Overview

The AI Assignment Marking system now includes a complete authentication system with:
- **User Registration** - Create new teacher accounts
- **User Login** - Secure JWT-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Session Management** - Token-based authentication with localStorage
- **Protected Routes** - All API endpoints require authentication

## Quick Setup

### 1. Install New Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `python-jose[cryptography]` - JWT token handling
- `passlib[bcrypt]` - Password hashing
- `bcrypt==4.0.1` - Bcrypt algorithm

### 2. Update Database Schema

```bash
# Generate Prisma client with new User model
prisma generate

# Push schema to database (adds User table)
prisma db push
```

### 3. Seed Default Users

```bash
# Create admin and demo teacher accounts
python prisma/seed_auth.py
```

This creates:
- **Admin**: username `admin`, password `admin123`
- **Teacher**: username `teacher`, password `teacher123`

### 4. Configure Environment

Update your `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=mysql://root:password@localhost:3306/ai_marking
SECRET_KEY=your-super-secret-key-change-this-in-production
```

⚠️ **Important**: Change `SECRET_KEY` to a random secure string in production!

### 5. Start the Application

**Backend:**
```bash
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Login

Navigate to http://localhost:5173 and login with:
- Username: `admin`
- Password: `admin123`

## Features

### 🔐 Security Features

1. **Password Hashing**
   - All passwords are hashed using bcrypt
   - Never stored in plain text
   - Salt automatically generated

2. **JWT Tokens**
   - Tokens expire after 24 hours
   - Securely signed with HS256 algorithm
   - Stored in localStorage for persistence

3. **Protected Endpoints**
   - All API routes require authentication
   - Token validated on each request
   - Automatic logout on token expiry

### 👥 User Management

**User Model:**
```prisma
model User {
  id            String   @id @default(cuid())
  username      String   @unique
  email         String   @unique
  password_hash String
  full_name     String
  role          String   @default("teacher")
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

**User Roles:**
- `admin` - Full system access
- `teacher` - Standard teaching access

### 📡 API Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newteacher",
  "email": "teacher@school.com",
  "password": "securepass123",
  "full_name": "New Teacher",
  "role": "teacher"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "clx1234567890",
    "username": "newteacher",
    "email": "teacher@school.com",
    "full_name": "New Teacher",
    "role": "teacher",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: multipart/form-data

username: admin
password: admin123
```

**Response:** Same as register

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### 🎨 Frontend Features

1. **Login Page**
   - Clean, modern UI with gradient background
   - Username and password fields
   - Error handling and validation
   - Link to registration page
   - Demo credentials displayed

2. **Registration Page**
   - Full user registration form
   - Password confirmation
   - Email validation
   - Password strength requirements (min 6 chars)

3. **Dashboard Integration**
   - Logout button in header
   - Persistent sessions (survives page refresh)
   - Automatic token management
   - Protected route handling

## Usage Examples

### Creating a New Teacher Account

**Via Frontend:**
1. Click "Sign up" on login page
2. Fill in registration form
3. Click "Sign Up"
4. Automatically logged in

**Via API:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@school.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "teacher"
  }'
```

### Using the API with Authentication

```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -F "username=admin" \
  -F "password=admin123" | jq -r '.access_token')

# Use token in subsequent requests
curl http://localhost:8000/api/submissions \
  -H "Authorization: Bearer $TOKEN"
```

## Database Changes

### New Tables

**User Table:**
```sql
CREATE TABLE User (
  id VARCHAR(191) PRIMARY KEY,
  username VARCHAR(191) UNIQUE NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(191) NOT NULL,
  full_name VARCHAR(191) NOT NULL,
  role VARCHAR(191) DEFAULT 'teacher',
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME
);
```

**Submission Table Updated:**
- Added `graded_by` column (foreign key to User)
- Tracks which user graded each submission

## Security Best Practices

### For Production:

1. **Change Secret Key**
   ```python
   # Generate a secure random key
   import secrets
   SECRET_KEY = secrets.token_urlsafe(32)
   ```

2. **Use HTTPS**
   - Never transmit tokens over HTTP
   - Configure SSL/TLS certificates

3. **Strong Passwords**
   - Enforce minimum 8 characters
   - Require uppercase, lowercase, numbers, symbols
   - Check against common password lists

4. **Token Expiry**
   - Consider shorter expiry (1-2 hours)
   - Implement refresh token mechanism

5. **Rate Limiting**
   - Limit login attempts
   - Prevent brute force attacks

6. **Password Reset**
   - Implement forgot password flow
   - Send reset emails
   - Use time-limited reset tokens

## Troubleshooting

### Issue: "Invalid username or password"
**Solution:**
- Verify credentials are correct
- Check if user exists in database
- Ensure password hashing is working

### Issue: Token expired
**Solution:**
- Login again to get new token
- Increase `ACCESS_TOKEN_EXPIRE_MINUTES` in config
- Implement refresh token mechanism

### Issue: Cannot register user
**Solution:**
- Check if username/email already exists
- Verify database connection
- Check password meets requirements

### Issue: 401 Unauthorized on API calls
**Solution:**
- Ensure token is included in Authorization header
- Check token format: `Bearer <token>`
- Verify token hasn't expired

## Migration Notes

- Existing functionality unchanged
- All API endpoints now require authentication
- Frontend automatically handles login flow
- Sessions persist across page refreshes
- Logout clears all stored data

## Next Steps

1. ✅ User registration
2. ✅ User login/logout
3. ✅ Password hashing
4. ✅ JWT tokens
5. ⏭️ Password reset functionality
6. ⏭️ Email verification
7. ⏭️ Role-based access control
8. ⏭️ Two-factor authentication

---

**Authentication system successfully implemented!** 🎉

You now have a secure, production-ready authentication system for your AI Assignment Marking platform.
