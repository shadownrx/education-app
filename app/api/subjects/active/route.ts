import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();
  const subjectId = (await cookies()).get("active_subject_id")?.value;

  if (!subjectId) {
    return NextResponse.json({ error: "No active subject" }, { status: 404 });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json({ _id: subject._id, name: subject.name, institution: subject.institution, code: subject.code });
  } catch {
    return NextResponse.json({ error: "Error fetching subject" }, { status: 500 });
  }
}
