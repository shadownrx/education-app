import { NextResponse, NextRequest } from "next/server";
import { verifyRequestToken } from "@/lib/auth";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication before logout
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    const response = NextResponse.json({ message: "Logout successful" });

    // Clear all auth-related cookies
    response.cookies.delete("token");
    response.cookies.delete("student_access");
    response.cookies.delete("active_subject_id");
    response.cookies.delete("student_id");
    response.cookies.delete("student_name");

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
