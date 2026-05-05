import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { verifyRequestToken, requireRole } from "@/lib/auth";
import { subjectSchema, validateInput } from "@/lib/validation";
import { handleApiError, AuthenticationError, AuthorizationError } from "@/lib/errors";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await verifyRequestToken(request);
    if (!token) throw new AuthenticationError();
    if (!requireRole(token, "teacher")) throw new AuthorizationError();

    const subjects = await Subject.find({ teacherId: token.userId }).sort({ name: 1 });
    return NextResponse.json(subjects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyRequestToken(request);
    if (!token) throw new AuthenticationError();
    if (!requireRole(token, "teacher")) throw new AuthorizationError();

    await dbConnect();
    const body = await request.json();
    const { name, code, institution } = validateInput(subjectSchema, body) as any;

    const uniqueCode = code || Math.random().toString(36).substring(2, 8).toUpperCase();

    const subject = await Subject.create({
      name,
      code: uniqueCode,
      institution: institution || "Institución",
      teacherId: new mongoose.Types.ObjectId(token.userId),
    });

    const response = NextResponse.json(subject, { status: 201 });
    response.cookies.set("active_subject_id", subject._id.toString(), {
      httpOnly: false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
