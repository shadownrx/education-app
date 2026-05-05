import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { emailSchema, validateInput } from "@/lib/validation";
import { rateLimit, getIdentifier } from "@/lib/rateLimit";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 login attempts per minute per IP
    const identifier = getIdentifier(request);
    if (!rateLimit(`student-login:${identifier}`, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    await dbConnect();

    // Validate input
    const body = await request.json();
    const { email, password } = body;

    // Validate email format
    validateInput(emailSchema, email);

    // Check password exists
    if (!password || typeof password !== "string" || password.length === 0) {
      throw new AuthenticationError("Password is required");
    }

    // Find student user
    const user = await User.findOne({ email, role: "student" }).select("+password");
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Get student record
    const student = await Student.findOne({ userId: user._id }).populate("subjectId");
    if (!student) {
      throw new AuthenticationError("Student record not found");
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user._id.toString(),
      role: "student",
      name: user.name,
    });

    // Update last login
    await Student.updateOne({ _id: student._id }, { lastLogin: new Date() });

    const response = NextResponse.json(
      { 
        message: "Login successful",
        token,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          subjectId: student.subjectId._id,
          subjectName: student.subjectId.name,
        }
      },
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

    // Also set student-specific cookies for backward compatibility
    response.cookies.set("student_access", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("active_subject_id", student.subjectId._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("student_id", student._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("student_name", student.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
