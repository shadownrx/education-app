import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import { verifyRequestToken } from "@/lib/auth";
import { handleApiError, AuthenticationError, NotFoundError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    // Get current student record using userId from token
    const currentStudent = await Student.findById(token.userId);
    if (!currentStudent) {
      throw new NotFoundError("Student not found");
    }

    // Count absences for current subject
    const absences = currentStudent.attendanceHistory
      ? currentStudent.attendanceHistory.filter((h: any) => h.status === "absent").length
      : 0;

    return NextResponse.json({
      id: currentStudent._id,
      name: currentStudent.name,
      email: currentStudent.email,
      status: currentStudent.status,
      subjectId: currentStudent.subjectId,
      absences,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
