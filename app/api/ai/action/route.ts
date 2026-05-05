import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import LessonPlan from "@/models/LessonPlan";
import Subject from "@/models/Subject";

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();
    console.log("AI_ACTION_REQUEST:", { type, data });

    const cookieStore = await cookies();
    const activeSubjectId = cookieStore.get("active_subject_id")?.value;

    if (!activeSubjectId) {
      return NextResponse.json({ error: "No subject selected" }, { status: 400 });
    }

    await dbConnect();
    const subject = await Subject.findById(activeSubjectId);

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let result;

    switch (type) {
      case "CREATE_ASSIGNMENT":
        // Ensure data has all required fields
        const assignmentData = {
          title: data.title,
          description: data.description,
          deadline: data.deadline,
          subjectId: activeSubjectId,
          subject: subject.name,
          student: "Todos",
          status: "pending"
        };
        console.log("CREATING_ASSIGNMENT_WITH:", assignmentData);
        result = await Assignment.create(assignmentData);
        break;

      case "CREATE_LESSON_PLAN":
        result = await LessonPlan.create({
          ...data,
          subjectId: activeSubjectId,
          status: "upcoming"
        });
        break;

      case "FEEDBACK":
        result = { success: true, message: "Feedback acknowledged" };
        break;

      default:
        return NextResponse.json({ error: "Unknown action type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("AI_ACTION_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
