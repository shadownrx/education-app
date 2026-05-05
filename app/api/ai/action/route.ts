import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import LessonPlan from "@/models/LessonPlan";
import { requireAuthRole, requireTeacherSubject } from "@/lib/apiAuth";
import { handleApiError, ValidationError } from "@/lib/errors";
import { aiActionSchema, validateInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher");
    const action = validateInput(aiActionSchema, await request.json());
    const activeSubjectId = request.cookies.get("active_subject_id")?.value;

    if (!activeSubjectId) {
      throw new ValidationError("No active subject selected");
    }

    await dbConnect();
    const subject = await requireTeacherSubject(token.userId, activeSubjectId);

    let result;

    switch (action.type) {
      case "CREATE_ASSIGNMENT":
        result = await Assignment.create({
          title: action.data.title,
          description: action.data.description,
          deadline: action.data.deadline,
          subjectId: subject._id,
          subject: subject.name,
          student: "Todos",
          status: "pending",
        });
        break;

      case "CREATE_LESSON_PLAN":
        result = await LessonPlan.create({
          title: action.data.title,
          week: action.data.week,
          topics: action.data.topics || [],
          date: action.data.date,
          subjectId: subject._id,
          status: "upcoming",
        });
        break;

      case "FEEDBACK":
        result = { success: true, message: "Feedback acknowledged" };
        break;
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return handleApiError(error);
  }
}
