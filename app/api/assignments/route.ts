import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { handleApiError, ValidationError, NotFoundError, AuthorizationError } from "@/lib/errors";
import { requireAuthRole, requireTeacherSubject, toObjectId } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await requireAuthRole(request, "teacher", "student");

    const subjectIdStr = request.nextUrl.searchParams.get("subjectId");
    if (!subjectIdStr) throw new ValidationError("subjectId is required");

    const subjectId = toObjectId(subjectIdStr);
    
    // Authorization check
    const Student = (await import("@/models/Student")).default;
    if (token.role === "teacher") {
      await requireTeacherSubject(token.userId, subjectIdStr);
    } else {
      const student = await Student.findOne({ userId: toObjectId(token.userId) });
      if (!student || student.subjectId.toString() !== subjectIdStr) {
        throw new AuthorizationError("No tienes acceso a esta materia");
      }
    }

    const query: any = { subjectId };
    if (token.role === "student") {
      const student = await Student.findOne({ userId: toObjectId(token.userId) });
      if (student) query.student = student.name;
    }

    const assignments = await Assignment.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(assignments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher");

    await dbConnect();
    const body = await request.json();
    const { id, grade, status, broadcast, ...data } = body;

    if (id) {
      const assignmentId = toObjectId(id);
      const existingAssignment = await Assignment.findById(assignmentId);
      if (!existingAssignment) {
        throw new NotFoundError("Assignment not found");
      }

      await requireTeacherSubject(token.userId, existingAssignment.subjectId.toString());

      const assignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        { grade, status, submittedAt: body.submittedAt || new Date() },
        { new: true }
      );

      // Award XP if graded
      if (status === "graded" && grade) {
        const Student = (await import("@/models/Student")).default;
        const student = await Student.findOne({ 
          name: assignment.student, 
          subjectId: assignment.subjectId 
        });

        if (student) {
          const xpGained = Math.round(grade * 10);
          student.xp = (student.xp || 0) + xpGained;
          
          // Basic level up logic: level * 100 xp needed for next level
          const xpNeeded = student.level * 100;
          if (student.xp >= xpNeeded) {
            student.level += 1;
            // Add a badge for leveling up if you want
            if (!student.badges) student.badges = [];
            student.badges.push({
              name: `Nivel ${student.level}`,
              icon: "🚀",
              awardedAt: new Date()
            });
          }
          await student.save();
        }
      }

      return NextResponse.json(assignment);
    } 
    
    if (broadcast) {
      const Student = (await import("@/models/Student")).default;
      const subject = await requireTeacherSubject(token.userId, data.subjectId);
      const subjectId = subject._id;
      const students = await Student.find({ subjectId });

      const assignments = students.map((s) => ({
        student: s.name,
        title: data.title,
        description: data.description || "",
        status: "pending",
        subjectId,
        subject: subject.name,
        deadline: data.deadline,
      }));

      const result = await Assignment.insertMany(assignments);
      return NextResponse.json(result, { status: 201 });
    }

    const subject = await requireTeacherSubject(token.userId, data.subjectId);
    const result = await Assignment.create({
      ...data,
      subjectId: subject._id,
      subject: subject.name,
      status: "pending"
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher");

    const id = request.nextUrl.searchParams.get("id");
    if (!id) throw new ValidationError("Assignment ID is required");

    await dbConnect();
    const assignment = await Assignment.findById(toObjectId(id));
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    await requireTeacherSubject(token.userId, assignment.subjectId.toString());
    await Assignment.findByIdAndDelete(assignment._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
