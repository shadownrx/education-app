import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import Subject from "@/models/Subject";
import Student from "@/models/Student";
import { verifyRequestToken, requireRole, type TokenPayload } from "@/lib/auth";
import { mongoIdSchema, validateInput } from "@/lib/validation";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/errors";

export async function requireAuth(request: NextRequest): Promise<TokenPayload> {
  const token = await verifyRequestToken(request);
  if (!token) {
    throw new AuthenticationError();
  }
  return token;
}

export async function requireAuthRole(
  request: NextRequest,
  ...roles: TokenPayload["role"][]
): Promise<TokenPayload> {
  const token = await requireAuth(request);
  if (!requireRole(token, ...roles)) {
    throw new AuthorizationError();
  }
  return token;
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  validateInput(mongoIdSchema, id);
  return new mongoose.Types.ObjectId(id);
}

export async function requireTeacherSubject(
  teacherId: string,
  subjectId: string
) {
  const subject = await Subject.findOne({
    _id: toObjectId(subjectId),
    teacherId: toObjectId(teacherId),
  });

  if (!subject) {
    throw new AuthorizationError("You don't have access to this subject");
  }

  return subject;
}

export async function getStudentForUser(userId: string) {
  const student = await Student.findOne({ userId: toObjectId(userId) });
  if (!student) {
    throw new NotFoundError("Student not found");
  }
  return student;
}

export async function canAccessSubject(token: TokenPayload, subjectId: string) {
  if (token.role === "teacher") {
    return Boolean(await requireTeacherSubject(token.userId, subjectId));
  }

  const student = await getStudentForUser(token.userId);
  return student.subjectId.toString() === subjectId;
}
