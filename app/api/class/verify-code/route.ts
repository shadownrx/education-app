import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";
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
      const temporaryPassword = Math.random().toString(36).substring(2, 15) + 
                                Math.random().toString(36).substring(2, 15);
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

      // Return temporary password for first login
      const response = NextResponse.json(
        {
          message: "Access granted - First time login",
          subjectName: subject.name,
          subjectId: subject._id,
          studentId: student._id,
          studentName: student.name,
          isNewAccount: true,
          temporaryPassword,
          instructions: "Use your email and temporary password to login. You can change it after first login.",
        },
        { status: 200 }
      );
      return response;
    } else {
      // Student exists, return login prompt
      const response = NextResponse.json(
        {
          message: "Student found - Please login",
          subjectName: subject.name,
          subjectId: subject._id,
          studentId: student._id,
          studentName: student.name,
          isNewAccount: false,
          instructions: "Use your email and password to login.",
        },
        { status: 200 }
      );
      return response;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

