import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";
import { requireAuthRole } from "@/lib/apiAuth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    await dbConnect();
    
    // Get version from env
    const version = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local-dev";
    
    // Get message from DB (more professional than env vars)
    const config = await SystemConfig.findOne({ key: "system_message" });
    const message = config?.value || null;
    
    return NextResponse.json({ version, message });
  } catch (error) {
    return NextResponse.json({ version: "error", message: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    // For now, allow teachers to update it, but we should restrict it later
    const token = await requireAuthRole(request, "teacher");
    
    const { message } = await request.json();
    
    await SystemConfig.findOneAndUpdate(
      { key: "system_message" },
      { value: message, updatedBy: token.userId },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    return handleApiError(error);
  }
}
