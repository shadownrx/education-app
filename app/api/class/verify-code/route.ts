import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Student from "@/models/Student";
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

    // Find or create student
    let student = await Student.findOne({ email });

    if (!student) {
      student = await Student.create({
        name: sanitizedName,
        email,
        subjectId: subject._id,
        status: "pending",
      });
    }

    const response = NextResponse.json(
      {
        message: "Access granted",
        subjectName: subject.name,
        subjectId: subject._id,
        studentId: student._id,
        studentName: student.name,
      },
      { status: 200 }
    );

    // Set secure cookies
    response.cookies.set("student_access", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set("active_subject_id", subject._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    response.cookies.set("student_id", student._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Not httpOnly so the frontend can read name for display
    response.cookies.set("student_name", student.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

