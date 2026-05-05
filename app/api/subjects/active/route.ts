import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { canAccessSubject, requireAuth } from "@/lib/apiAuth";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = await requireAuth(request);
    const subjectId = request.cookies.get("active_subject_id")?.value;

    if (!subjectId) {
      throw new ValidationError("No active subject");
    }

    await canAccessSubject(token, subjectId);

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    return NextResponse.json({
      _id: subject._id,
      name: subject.name,
      institution: subject.institution,
      code: subject.code,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
