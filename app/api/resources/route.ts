import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { handleApiError, ValidationError } from "@/lib/errors";
import {
  requireAuthRole,
  requireTeacherSubject,
  getStudentForUser,
  toObjectId,
} from "@/lib/apiAuth";

/* ─── GET: list resources for a subject ─── */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await requireAuthRole(request, "teacher", "student");

    let subjectId: string;

    if (token.role === "teacher") {
      const subjectIdStr = request.nextUrl.searchParams.get("subjectId");
      if (!subjectIdStr) throw new ValidationError("subjectId is required");
      const subject = await requireTeacherSubject(token.userId, subjectIdStr);
      subjectId = subject._id.toString();
    } else {
      // student: derive subjectId from their record
      const student = await getStudentForUser(token.userId);
      subjectId = student.subjectId.toString();
    }

    const resources = await Resource.find({ subjectId: toObjectId(subjectId) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(resources);
  } catch (error) {
    return handleApiError(error);
  }
}

/* ─── POST: create a new resource (teacher only) ─── */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await requireAuthRole(request, "teacher");

    const body = await request.json();
    const { title, description, filename, url, type, size, subjectId } = body;

    if (!title || !filename || !url || !type || !size || !subjectId) {
      throw new ValidationError("Missing required fields");
    }

    const subject = await requireTeacherSubject(token.userId, subjectId);

    const resource = await Resource.create({
      title,
      description: description || "",
      filename,
      url,
      type,
      size,
      subjectId: subject._id,
      teacherId: toObjectId(token.userId),
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
