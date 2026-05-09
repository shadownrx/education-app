import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { code, studentName } = body;

    // Validate code
    if (!code || typeof code !== "string") {
      throw new ValidationError("Valid class code is required");
    }

    // Sanitize inputs
    const sanitizedCode = code.trim().toUpperCase();
    const sanitizedName = studentName ? studentName.trim() : null;

    // Find subject by code
    const subject = await Subject.findOne({ code: sanitizedCode });
    if (!subject) {
      throw new NotFoundError("Invalid class code");
    }

    // If only code validation (step 1)
    if (!sanitizedName) {
      return NextResponse.json({
        valid: true,
        subjectName: subject.name,
        subjectId: subject._id,
      });
    }

    // Step 2: Validate student name
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      throw new ValidationError("Student name must be between 2 and 100 characters");
    }

    // Generate unique email for student
    const slug =
      sanitizedName
        .toLowerCase()
        .replace(/\s+/g, ".")
        .substring(0, 30) +
      "." +
      subject._id.toString().slice(-4);
    const email = `${slug}@student.eduflow`;

    // Find or create student with User account
    let student = await Student.findOne({ email });

    if (!student) {
      // Generate temporary password
      const temporaryPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      // Create User account for student
      const user = await User.create({
        name: sanitizedName,
        email,
        password: hashedPassword,
        role: "student",
      });

      // Create Student record linked to User
      student = await Student.create({
        name: sanitizedName,
        email,
        userId: user._id,
        subjectId: subject._id,
        status: "pending",
      });
    }

    // Generate JWT token for the student
    const token = await generateToken({
      userId: (student.userId || student._id).toString(),
      role: "student",
      name: student.name,
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        subjectName: subject.name,
        subjectId: subject._id,
        studentId: student._id,
        studentName: student.name,
      },
      { status: 200 }
    );

    // Set secure cookies (Same logic as student-login/route.ts)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    };

    response.cookies.set("token", token, cookieOptions);
    response.cookies.set("student_access", "true", cookieOptions);
    response.cookies.set("active_subject_id", subject._id.toString(), cookieOptions);
    response.cookies.set("student_id", student._id.toString(), cookieOptions);
    response.cookies.set("student_name", student.name, { ...cookieOptions, httpOnly: false });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

