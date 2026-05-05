import { NextResponse } from "next/server";

// Simple in-memory rate limiting (for production use Redis)
const requests = new Map<string, { count: number; resetTime: number }>();
let lastCleanup = 0;

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  if (now - lastCleanup > windowMs) {
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
    lastCleanup = now;
  }

  const existing = requests.get(identifier);

  if (!existing || now > existing.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (existing.count < limit) {
    existing.count++;
    return true;
  }

  return false;
}

export function createRateLimitResponse(
  retryAfter: number = 60
): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

// Get identifier from request (IP address or user ID)
export function getIdentifier(request: Request): string {
  const forwarded = (request.headers.get("x-forwarded-for") || "").split(",")[0];
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
