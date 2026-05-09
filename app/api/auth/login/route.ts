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
    const user = await User.findOne({ email }).select("+password +loginAttempts +isLocked");
    if (!user) {
      throw new AuthenticationError();
    }

    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json(
        { error: "Tu cuenta ha sido bloqueada por seguridad después de 5 intentos fallidos. Por favor, contacta a un administrador para desbloquearla." },
        { status: 403 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        await user.save();
        return NextResponse.json(
          { error: "Has alcanzado el límite de intentos. Tu cuenta ha sido bloqueada. Contacta a un administrador." },
          { status: 403 }
        );
      }
      
      await user.save();
      throw new AuthenticationError("Email o contraseña incorrectos");
    }

    // Reset attempts on successful login
    if (user.loginAttempts > 0 || user.isLocked) {
      user.loginAttempts = 0;
      user.isLocked = false;
      await user.save();
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      isAdmin: user.isAdmin || false,
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
