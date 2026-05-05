import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { verifyRequestToken, requireRole } from "@/lib/auth";
import { mongoIdSchema, validateInput } from "@/lib/validation";
import { handleApiError, AuthenticationError, AuthorizationError, ValidationError } from "@/lib/errors";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await verifyRequestToken(request);
    if (!token || !requireRole(token, "teacher")) {
      throw new AuthenticationError();
    }

    const subjectIdStr = request.nextUrl.searchParams.get("subjectId");
    if (!subjectIdStr) throw new ValidationError("subjectId is required");

    const subjectId = new mongoose.Types.ObjectId(subjectIdStr);
    const assignments = await Assignment.find({ subjectId }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(assignments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyRequestToken(request);
    if (!token || !requireRole(token, "teacher")) {
      throw new AuthenticationError();
    }

    await dbConnect();
    const body = await request.json();
    const { id, grade, status, broadcast, ...data } = body;

    if (id) {
      const assignment = await Assignment.findByIdAndUpdate(
        id,
        { grade, status, submittedAt: body.submittedAt || new Date() },
        { new: true }
      );
      return NextResponse.json(assignment);
    } 
    
    if (broadcast) {
      const Student = (await import("@/models/Student")).default;
      const subjectId = new mongoose.Types.ObjectId(data.subjectId);
      const students = await Student.find({ subjectId });

      const assignments = students.map((s) => ({
        student: s.name,
        title: data.title,
        description: data.description || "",
        status: "pending",
        subjectId,
        subject: data.subject,
        deadline: data.deadline,
      }));

      const result = await Assignment.insertMany(assignments);
      return NextResponse.json(result, { status: 201 });
    }

    const result = await Assignment.create({
      ...data,
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      status: "pending"
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await verifyRequestToken(request);
    if (!token || !requireRole(token, "teacher")) {
      throw new AuthenticationError();
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) throw new ValidationError("Assignment ID is required");

    await dbConnect();
    await Assignment.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}