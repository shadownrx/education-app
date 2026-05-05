import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import { validateInput, studentSchema } from "@/lib/validation";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";
import { requireAuthRole, requireTeacherSubject, toObjectId } from "@/lib/apiAuth";

interface AttendanceEntry {
  date: Date | string;
  status: "present" | "absent" | "late";
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = await requireAuthRole(request, "teacher");

    // Get subjectId from query params
    const subjectId = request.nextUrl.searchParams.get("subjectId");
    if (!subjectId) {
      throw new ValidationError("subjectId query parameter is required");
    }

    const subject = await requireTeacherSubject(token.userId, subjectId);

    const students = await Student.find({ subjectId: subject._id }).sort({ name: 1 });
    return NextResponse.json(students);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher");

    await dbConnect();

    const body = await request.json();
    const { id, status, date, grade, ...otherData } = body;

    if (id) {
      // Validate ID format
      const studentId = toObjectId(id);
      
      const student = await Student.findById(studentId);
      if (!student) {
        throw new NotFoundError("Student not found");
      }

      // Verify ownership: teacher must own the subject
      await requireTeacherSubject(token.userId, student.subjectId.toString());

      // Update grade if provided
      if (grade !== undefined) {
        if (typeof grade !== "number" || grade < 0 || grade > 100) {
          throw new ValidationError("Grade must be a number between 0 and 100");
        }
        student.grade = grade;
      }

      // Validate status if provided
      if (status && !["present", "absent", "late"].includes(status)) {
        throw new ValidationError("Invalid status value");
      }

      if (status) {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Initialize history if it doesn't exist
        if (!student.attendanceHistory) student.attendanceHistory = [];

        // Find if entry for date exists
        const historyIndex = student.attendanceHistory.findIndex((h: AttendanceEntry) => {
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

      // Verify subject ownership
      const subject = await requireTeacherSubject(token.userId, subjectId);
      
      const student = await Student.create({ 
        ...studentData, 
        subjectId: subject._id
      });
      return NextResponse.json(student, { status: 201 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
