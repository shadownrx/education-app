import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import LessonPlan from "@/models/LessonPlan";
import Subject from "@/models/Subject";
import { verifyRequestToken, requireRole } from "@/lib/auth";
import { mongoIdSchema, validateInput } from "@/lib/validation";
import { handleApiError, AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/errors";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    // Verify authorization (teacher only)
    if (!requireRole(token, "teacher")) {
      throw new AuthorizationError();
    }

    // Get subjectId from query params
    const subjectId = request.nextUrl.searchParams.get("subjectId");
    if (!subjectId) {
      throw new ValidationError("subjectId query parameter is required");
    }

    validateInput(mongoIdSchema, subjectId);

    // Verify subject ownership
    const subject = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(subjectId),
      teacherId: new mongoose.Types.ObjectId(token.userId),
    });

    if (!subject) {
      throw new AuthorizationError("You don't have access to this subject");
    }

    const lessons = await LessonPlan.find({ subjectId }).sort({ week: 1 });
    return NextResponse.json(lessons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await verifyRequestToken(request);
    if (!token) {
      throw new AuthenticationError();
    }

    // Verify authorization (teacher only)
    if (!requireRole(token, "teacher")) {
      throw new AuthorizationError();
    }

    await dbConnect();

    const body = await request.json();
    const { title, description, week, objectives } = body;

    // Validate inputs
    if (!title || !week) {
      throw new ValidationError("Title and week are required");
    }

    const subjectId = request.nextUrl.searchParams.get("subjectId");
    if (!subjectId) {
      throw new ValidationError("subjectId is required");
    }

    validateInput(mongoIdSchema, subjectId);

    // Verify subject ownership
    const subject = await Subject.findOne({
      _id: new mongoose.Types.ObjectId(subjectId),
      teacherId: new mongoose.Types.ObjectId(token.userId),
    });

    if (!subject) {
      throw new AuthorizationError("You don't have access to this subject");
    }

    const lesson = await LessonPlan.create({
      title,
      description,
      week,
      objectives,
      subjectId,
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}