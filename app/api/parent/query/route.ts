import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Subject from "@/models/Subject";
import Assignment from "@/models/Assignment";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { subjectCode, studentEmail } = await request.json();

    if (!subjectCode || !studentEmail) {
      throw new ValidationError("Subject code and student email are required");
    }

    // 1. Find the subject by code
    const subject = await Subject.findOne({ code: subjectCode.toUpperCase() });
    if (!subject) {
      throw new NotFoundError("Código de materia inválido");
    }

    // 2. Find the student in that subject
    const student = await Student.findOne({ 
      subjectId: subject._id,
      email: studentEmail.toLowerCase()
    }).lean();

    if (!student) {
      throw new NotFoundError("No se encontró al alumno en esta materia");
    }

    // 3. Fetch recent assignments and grades
    const assignments = await Assignment.find({ 
      subjectId: subject._id,
      student: student.name // Assignments use student name
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // 4. Calculate attendance stats
    const totalClasses = student.attendanceHistory?.length || 0;
    const absences = student.attendanceHistory?.filter((h: any) => h.status === "absent").length || 0;
    const attendancePct = totalClasses > 0 ? Math.round(((totalClasses - absences) / totalClasses) * 100) : 100;

    // Return public-safe data
    return NextResponse.json({
      student: {
        name: student.name,
        level: student.xp ? Math.floor(student.xp / 100) + 1 : 1, // Fallback calculation if level field is not synced
        level_real: student.level || 1,
        xp: student.xp || 0,
        badges: student.badges || [],
        attendancePct,
        absences
      },
      subject: {
        name: subject.name,
        institution: subject.institution
      },
      assignments: assignments.map(a => ({
        title: a.title,
        status: a.status,
        grade: a.grade,
        deadline: a.deadline
      }))
    });

  } catch (error) {
    return handleApiError(error);
  }
}
