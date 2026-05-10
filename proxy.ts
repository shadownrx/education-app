import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 1. Protect teacher routes
  if (pathname.startsWith("/teacher")) {
    // Allow access to login and register without token
    if (
      pathname === "/teacher/login" ||
      pathname === "/teacher/register"
    ) {
      // Redirect to dashboard if user is already authenticated
      if (token && (await verifyToken(token))) {
        return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Require valid token for other teacher routes
    if (!token) {
      console.log(`[AUTH] No token found for ${pathname}. Redirecting to login.`);
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "teacher") {
      console.log(`[AUTH] Invalid token or wrong role for ${pathname}. Role: ${payload?.role}`);
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/teacher/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("active_subject_id");
      return response;
    }

    console.log(`[AUTH] Teacher access granted for ${pathname}`);
    
    // If logged in but no subject selected, redirect to subjects selection (except on subjects page itself)
    const activeSubject = request.cookies.get("active_subject_id")?.value;
    if (!activeSubject && pathname !== "/teacher/subjects" && pathname !== "/teacher/dashboard") {
       return NextResponse.redirect(new URL("/teacher/subjects", request.url));
    }

    return NextResponse.next();
  }

  // 2. Protect student routes
  if (pathname.startsWith("/student")) {
    const studentAccess = request.cookies.get("student_access")?.value;
    const activeSubjectId = request.cookies.get("active_subject_id")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!studentAccess || !activeSubjectId || !payload || payload.role !== "student") {
      console.log(`[AUTH] Student access denied for ${pathname}:`, { 
        hasAccessCookie: !!studentAccess, 
        hasSubjectId: !!activeSubjectId, 
        hasToken: !!payload, 
        role: payload?.role 
      });
      // Redirect to home if student session is missing
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      response.cookies.delete("student_access");
      response.cookies.delete("active_subject_id");
      response.cookies.delete("student_id");
      response.cookies.delete("student_name");
      return response;
    }
    
    console.log(`[AUTH] Student access granted for ${pathname}`);
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
