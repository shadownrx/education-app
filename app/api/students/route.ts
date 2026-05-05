import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import { verifyRequestToken, requireRole } from "@/lib/auth";
import { mongoIdSchema, validateInput, studentSchema } from "@/lib/validation";
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    // Verify authorization (teacher only)
    if (!requireRole(token, "teacher")) {
      throw new AuthorizationError();
    }

    // Get subjectId from query params
    const subjectId = request.nextUrl.searchParams.get("subjectId");
    if (!subjectId) {
      throw new ValidationError("subjectId query parameter is required");
    }

    // Validate subjectId format
    validateInput(mongoIdSchema, subjectId);

    const students = await Student.find({ subjectId }).sort({ name: 1 });
    return NextResponse.json(students);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    // Verify authorization (teacher only)
    if (!requireRole(token, "teacher")) {
      throw new AuthorizationError();
    }

    await dbConnect();

    const body = await request.json();
    const { id, status, date, ...otherData } = body;

    if (id) {
      // Validate ID format
      validateInput(mongoIdSchema, id);
      
      const student = await Student.findById(id);
      if (!student) {
        throw new NotFoundError("Student not found");
      }

      // Validate status if provided
      if (status && !["present", "absent", "late"].includes(status)) {
        throw new ValidationError("Invalid status value");
      }

      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      // Initialize history if it doesn't exist
      if (!student.attendanceHistory) student.attendanceHistory = [];

      // Find if entry for date exists
      const historyIndex = student.attendanceHistory.findIndex((h: any) => {
        const hDate = new Date(h.date);
        hDate.setHours(0, 0, 0, 0);
        return hDate.getTime() === targetDate.getTime();
      });

      if (historyIndex > -1) {
        student.attendanceHistory[historyIndex].status = status;
      } else {
        student.attendanceHistory.push({ date: targetDate, status });
      }

      // If it's today, update the main status for convenience
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate.getTime() === today.getTime()) {
        student.status = status;
      }

      await student.save();
      return NextResponse.json(student);
    } else {
      // Validate input before creating
      const studentData = validateInput(studentSchema, otherData);
      
      const subjectId = request.nextUrl.searchParams.get("subjectId");
      if (!subjectId) {
        throw new ValidationError("subjectId is required");
      }
      
      const student = await Student.create({ 
        ...studentData, 
        subjectId
      });
      return NextResponse.json(student, { status: 201 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
