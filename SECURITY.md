# Security Implementation Guide

## Implemented Security Improvements

### 1. ✅ Environment Variables Management
- **File**: `lib/env.ts`
- **Changes**:
  - Centralized environment variable validation
  - Prevents app startup if critical variables are missing in production
  - Validates `JWT_SECRET` is not using default value in production
  - Prevents hardcoded secrets

### 2. ✅ Input Validation & Sanitization
- **File**: `lib/validation.ts`
- **Changes**:
  - Zod schemas for email, password, name, and MongoDB IDs
  - Password requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
  - Email validation and normalization
  - NoSQL injection prevention by filtering `$` and `.` in object keys
  - Centralized `validateInput()` function

### 3. ✅ Authentication & Authorization
- **File**: `lib/auth.ts`
- **Changes**:
  - Centralized token generation and verification
  - Token payload includes role-based information
  - Secure token verification with error handling
  - `requireRole()` function for authorization checks
  - Support for both Bearer token (header) and cookie authentication

### 4. ✅ Rate Limiting
- **File**: `lib/rateLimit.ts`
- **Changes**:
  - In-memory rate limiting (consider Redis for production)
  - Login: Max 5 attempts per minute per IP
  - Registration: Max 3 attempts per hour per IP
  - Prevents brute force attacks
  - Returns 429 (Too Many Requests) status code

### 5. ✅ Error Handling
- **File**: `lib/errors.ts`
- **Changes**:
  - Custom error classes (ValidationError, AuthenticationError, etc.)
  - Safe error handling that doesn't expose stack traces
  - Consistent error response format
  - Generic error messages for security

### 6. ✅ Authentication Routes Updated
- **File**: `app/api/auth/login/route.ts`
- **File**: `app/api/auth/register/route.ts`
- **Changes**:
  - Input validation for email and password
  - Rate limiting on login attempts
  - Secure JWT generation
  - SameSite="strict" cookie setting
  - No password exposure in responses

### 7. ✅ Protected API Endpoints
- **File**: `app/api/students/route.ts`
- **Changes**:
  - Authentication required (token verification)
  - Authorization required (teacher role check)
  - Input validation for all parameters
  - NoSQL injection prevention
  - Query parameter validation

### 8. ✅ Secure Middleware
- **File**: `middleware.ts`
- **Changes**:
  - Centralized token verification
  - Role-based access control
  - Protected routes for teacher and student
  - Automatic redirect for unauthorized access
  - Token expiration handling

### 9. ✅ Security Headers
- **File**: `next.config.ts`
- **Changes**:
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - X-Frame-Options: SAMEORIGIN (prevents clickjacking)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy (CSP)
  - Permissions-Policy (blocks camera, microphone, geolocation)

## Setup Instructions

### 1. Install Zod Validation Library
```bash
npm install zod
```

### 2. Configure Environment Variables
Create a `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

Update `.env.local`:
```
JWT_SECRET=<your-generated-secret>
MONGODB_URI=<your-mongodb-connection-string>
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Update Other API Routes
Apply the same security patterns to remaining endpoints:
- `app/api/assignments/route.ts`
- `app/api/lessons/route.ts`
- `app/api/subjects/route.ts`
- `app/api/auth/me/route.ts`
- etc.

**Pattern to follow**:
```typescript
import { verifyRequestToken, requireRole } from "@/lib/auth";
import { handleApiError, AuthenticationError, AuthorizationError } from "@/lib/errors";
import { validateInput, yourSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) throw new AuthenticationError();

    // 2. Check authorization
    if (!requireRole(token, "teacher")) throw new AuthorizationError();

    // 3. Validate inputs
    const subjectId = validateInput(mongoIdSchema, request.nextUrl.searchParams.get("subjectId"));

    // 4. Your business logic
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Production Checklist

- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Use Redis for rate limiting (instead of in-memory)
- [ ] Enable HTTPS only (secure cookies)
- [ ] Add database user/password authentication
- [ ] Enable MongoDB network access control
- [ ] Set `NODE_ENV=production`
- [ ] Review and update CSP headers
- [ ] Add request logging/monitoring
- [ ] Add API rate limiting with Redis
- [ ] Enable database backups
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Run security audit: `npm audit`
- [ ] Update all dependencies: `npm update`
- [ ] Review CORS configuration if needed

## Known Limitations

1. **Rate Limiting**: Currently in-memory. For production, implement Redis-based rate limiting
2. **Session Management**: Consider adding refresh tokens for better security
3. **2FA**: Not implemented. Consider adding for production
4. **API Logging**: Add logging middleware for audit trails
5. **CORS**: Currently not restricted. Configure if needed
6. **Database**: No connection pooling configured yet

## Next Steps

1. Apply security patterns to all remaining API routes
2. Set up Redis for rate limiting in production
3. Add request logging middleware
4. Implement 2FA for teachers
5. Set up monitoring and alerting
6. Configure database backups
7. Add API documentation with security requirements
