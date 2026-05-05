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
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "teacher") {
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/teacher/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("active_subject_id");
      return response;
    }

    // If logged in but no subject selected, redirect to subjects selection (except on subjects page itself)
    const activeSubject = request.cookies.get("active_subject_id")?.value;
    if (!activeSubject && pathname !== "/teacher/subjects" && pathname !== "/teacher/dashboard") {
       // Allow dashboard even without subject for first-time onboarding if needed, 
       // but typically we want them to pick a subject.
       // Let's keep it strict.
       return NextResponse.redirect(new URL("/teacher/subjects", request.url));
    }

    return NextResponse.next();
  }

  // 2. Protect student routes
  if (pathname.startsWith("/student")) {
    const studentAccess = request.cookies.get("student_access")?.value;
    const activeSubjectId = request.cookies.get("active_subject_id")?.value;

    if (!studentAccess || !activeSubjectId) {
      // Redirect to home if student session is missing
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("student_access");
      response.cookies.delete("active_subject_id");
      response.cookies.delete("student_name");
      return response;
    }
    
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*"],
};
