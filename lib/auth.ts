import { jwtVerify, SignJWT } from "jose";
import { ENV } from "./env";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(ENV.JWT_SECRET);

export interface TokenPayload {
  userId: string;
  role: "teacher" | "student";
  name: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export async function generateToken(payload: Omit<TokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to cookie
  return request.cookies.get("token")?.value || null;
}

export async function verifyRequestToken(request: NextRequest): Promise<TokenPayload | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireRole(payload: TokenPayload, ...roles: string[]): boolean {
  return roles.includes(payload.role);
}
