import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuthRole, getStudentForUser } from "@/lib/apiAuth";
import { handleApiError } from "@/lib/errors";

interface AttendanceEntry {
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = await requireAuthRole(request, "student");

    // Get current student record using userId from token
    const currentStudent = await getStudentForUser(token.userId);

    // Count absences for current subject
    const absences = currentStudent.attendanceHistory
      ? currentStudent.attendanceHistory.filter((h: AttendanceEntry) => h.status === "absent").length
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
