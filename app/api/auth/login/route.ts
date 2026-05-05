import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { loginSchema, validateInput } from "@/lib/validation";
import { rateLimit, getIdentifier } from "@/lib/rateLimit";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 login attempts per minute per IP
    const identifier = getIdentifier(request);
    if (!rateLimit(`login:${identifier}`, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    await dbConnect();

    // Validate input
    const body = await request.json();
    const { email, password } = validateInput(loginSchema, body);

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AuthenticationError();
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationError();
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
