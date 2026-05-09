import { put } from "@vercel/blob";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";
import { handleApiError, ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new ValidationError("No file uploaded");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new ValidationError("Only images are allowed");
    }

    // Upload to Vercel Blob
    const blob = await put(`avatars/${token.userId}-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: 'public',
    });

    // Update User model
    await User.findByIdAndUpdate(token.userId, { avatar: blob.url });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return handleApiError(error);
  }
}
