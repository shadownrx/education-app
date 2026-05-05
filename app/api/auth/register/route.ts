import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { registerSchema, validateInput } from "@/lib/validation";
import { rateLimit, getIdentifier } from "@/lib/rateLimit";
import { handleApiError, ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate input FIRST — invalid attempts (e.g. short passwords) don't count against the rate limit
    const body = await request.json();
    const { name, email, password } = validateInput(registerSchema, body);

    // Rate limiting: max 5 registration attempts per hour per IP (only valid requests count)
    const identifier = getIdentifier(request);
    if (!rateLimit(`register:${identifier}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError("Email already registered");
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher", // Default role
    });

    // Return user data without password
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
