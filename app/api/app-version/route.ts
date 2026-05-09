import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";
import { requireAdmin } from "@/lib/apiAuth";
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
    // Strictly require admin for system updates
    const token = await requireAdmin(request);
    
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
