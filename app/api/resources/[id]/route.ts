import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";
import { requireAuthRole, toObjectId } from "@/lib/apiAuth";

// Local filesystem (dev only)
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/* ─── DELETE: remove a resource (teacher only, must own it) ─── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const token = await requireAuthRole(request, "teacher");

    const { id } = await params;
    if (!id) throw new ValidationError("Resource ID is required");

    const resource = await Resource.findById(toObjectId(id));
    if (!resource) throw new NotFoundError("Resource not found");

    if (resource.teacherId.toString() !== token.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Delete physical file ────────────────────────────────────────────────
    if (USE_BLOB && resource.url?.startsWith("https://")) {
      // Vercel Blob: delete by URL
      const { del } = await import("@vercel/blob");
      await del(resource.url).catch(() => {
        // Non-fatal: blob may already be gone
      });
    } else if (resource.url?.startsWith("/uploads/")) {
      // Local filesystem (dev)
      const filePath = path.join(process.cwd(), "public", resource.url);
      if (existsSync(filePath)) {
        await unlink(filePath).catch(() => {});
      }
    }

    await Resource.findByIdAndDelete(resource._id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
