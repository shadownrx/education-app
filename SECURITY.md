# Security Implementation Guide

## Implemented Security Improvements

### 1. ✅ Environment Variables Management
- **File**: `lib/env.ts`
- Centralized environment variable validation
- Prevents app startup if critical variables are missing in production
- Validates `JWT_SECRET` is not using default value in production

### 2. ✅ Input Validation & Sanitization
- **File**: `lib/validation.ts`
- Zod schemas for email, password, name, and MongoDB IDs
- Password requirements: minimum 8 chars, uppercase, lowercase, number
- NoSQL injection prevention by filtering `$` and `.` in object keys
- Centralized `validateInput()` function

### 3. ✅ Authentication & Authorization
- **File**: `lib/auth.ts`
- Centralized token generation and verification
- Role-based access: `teacher` / `student`
- Secure token verification with error handling
- Support for Bearer token (header) and cookie authentication

### 4. ✅ Rate Limiting
- **File**: `lib/rateLimit.ts`
- Login: max 5 attempts per minute per IP
- Registration: max 3 attempts per hour per IP
- Returns 429 (Too Many Requests) status code

### 5. ✅ Error Handling
- **File**: `lib/errors.ts`
- Custom error classes (ValidationError, AuthenticationError, etc.)
- Safe error handling — no stack traces in responses
- Consistent error response format

### 6. ✅ File Upload Security
- **File**: `app/api/upload/route.ts`
- MIME type allowlist (PDF, DOCX, images, etc.)
- **Magic byte validation** — file content must match declared MIME type
- 20 MB max file size enforced server-side
- Files stored in **Vercel Blob Storage** (cloud) — not in the app filesystem
- Authentication required (JWT) before any upload

### 7. ✅ Resource Access Control
- **File**: `app/api/resources/route.ts`
- Teachers can only view/create/delete resources in their own subjects
- Students can only view resources from their enrolled subject
- DELETE verifies `teacherId` ownership before deleting
- Physical file deletion from Blob Storage on record removal

### 8. ✅ Security Headers
- **File**: `next.config.ts`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — allowlist for Blob Storage, Groq API, Google Docs
- `Permissions-Policy` — blocks camera, microphone, geolocation

### 9. ✅ Secure Middleware
- **File**: `proxy.ts`
- Centralized JWT verification at the edge
- Role-based access control for all `/teacher/*` and `/student/*` routes
- Automatic redirect for unauthorized access

---

## Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication (use a strong random value in production)
JWT_SECRET=<min 32 chars, generated with: openssl rand -base64 32>

# AI
GROQ_API_KEY=...

# File Storage (Vercel Blob — auto-generated when connecting a Blob Store)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

## Production Checklist

- [x] `JWT_SECRET` set to a strong random value
- [x] HTTPS enforced (Vercel handles this)
- [x] Files stored in Vercel Blob (not ephemeral filesystem)
- [x] Magic byte validation on file uploads
- [x] CSP headers configured for Blob Storage URLs
- [x] Input validation on all API routes
- [x] Role-based access control via middleware
- [ ] Redis for rate limiting (currently in-memory)
- [ ] Refresh token rotation
- [ ] Error tracking (Sentry)
- [ ] 2FA for teacher accounts
- [ ] Database backup schedule

---

## Security Architecture

```
Client Request
     │
     ▼
proxy.ts (Edge Middleware)
  ├─ Verify JWT token
  ├─ Check role (teacher/student)
  └─ Redirect if unauthorized
     │
     ▼
API Route
  ├─ requireAuthRole()       — authentication + authorization
  ├─ validateInput()         — Zod schema validation
  ├─ requireTeacherSubject() — ownership check
  └─ handleApiError()        — safe error response
     │
     ▼
MongoDB Atlas / Vercel Blob Storage
```

---

## Known Limitations

1. **Rate Limiting**: Currently in-memory. Replace with Redis for multi-instance production.
2. **Session Management**: Consider refresh tokens for longer sessions.
3. **2FA**: Not implemented. Recommended for teacher accounts.
4. **Audit Logging**: No request logging middleware yet.
5. **File Retention**: Deleted resources remove the Blob file, but there's no expiry for orphaned files if the DB record is deleted directly.

---

*EduFlow Security Guide — last updated May 2026*
