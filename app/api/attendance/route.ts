import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { handleApiError, ValidationError } from "@/lib/errors";
import { requireAuthRole, requireTeacherSubject } from "@/lib/apiAuth";

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher");
    await dbConnect();

    const body = await request.json();
    const { subjectId, date, records } = body;

    if (!subjectId || !records || !Array.isArray(records)) {
      throw new ValidationError("Missing required fields: subjectId and records array");
    }

    // Verify teacher owns the subject
    await requireTeacherSubject(token.userId, subjectId);

    // Create or Update attendance record for the specific day
    const targetDate = new Date(date || Date.now());
    targetDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { subjectId, date: targetDate },
      { 
        records, 
        teacherId: token.userId 
      },
      { upsert: true, new: true }
    );

    // Also update individual student history for redundancy and easier lookup in student view
    // This part is async but we don't necessarily need to wait for it all if performance is an issue,
    // but for consistency we'll do it.
    await Promise.all(records.map(async (rec: any) => {
      await Student.updateOne(
        { _id: rec.studentId },
        { 
          $set: { status: rec.status },
          $push: { 
            attendanceHistory: { 
              $each: [{ date: targetDate, status: rec.status }],
              $position: 0 
            } 
          }
        }
      );
      
      // Clean up duplicates in history (optional but good)
      // Actually, a better way would be to check if date exists in Student record too, 
      // but let's keep it simple for now as the main source of truth is the Attendance collection.
    }));

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher");
    await dbConnect();

    const subjectId = request.nextUrl.searchParams.get("subjectId");
    if (!subjectId) {
      throw new ValidationError("subjectId is required");
    }

    await requireTeacherSubject(token.userId, subjectId);

    const attendanceRecords = await Attendance.find({ subjectId })
      .sort({ date: -1 })
      .limit(30); // Last month

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    return handleApiError(error);
  }
}
