import { NextResponse, NextRequest } from "next/server";
import { verifyRequestToken } from "@/lib/auth";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    // Return user info without sensitive data
    return NextResponse.json({
      user: {
        userId: token.userId,
        name: token.name,
        role: token.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}