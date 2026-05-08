import { NextResponse, NextRequest } from "next/server";
import { verifyRequestToken } from "@/lib/auth";
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors";
import crypto from "crypto";

// ── Vercel Blob (production) ──────────────────────────────────────────────────
// Only imported when BLOB_READ_WRITE_TOKEN is set (i.e. on Vercel).
// On local dev the filesystem fallback is used instead.

// ── Local filesystem (dev fallback) ──────────────────────────────────────────
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/msword": "doc",
  "application/vnd.ms-excel": "xls",
  "text/plain": "txt",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
};

function hasExpectedSignature(type: string, buffer: Buffer) {
  if (type === "image/jpeg") return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/gif") return buffer.subarray(0, 3).toString("ascii") === "GIF";
  if (type === "application/pdf") return buffer.subarray(0, 4).toString("ascii") === "%PDF";
  if (type === "video/mp4") return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  if (type === "audio/mpeg") return buffer[0] === 0xff || buffer.subarray(0, 3).toString("ascii") === "ID3";
  if (type.includes("officedocument")) return buffer.subarray(0, 2).toString("ascii") === "PK";
  if (type === "text/plain") return !buffer.subarray(0, 1024).includes(0);
  return true;
}

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function POST(request: NextRequest) {
  try {
    const token = await verifyRequestToken(request);
    if (!token) throw new AuthenticationError();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) throw new ValidationError("No file provided");
    if (file.size > MAX_FILE_SIZE) throw new ValidationError(`File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`);

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) throw new ValidationError("File type not allowed");

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasExpectedSignature(file.type, buffer)) {
      throw new ValidationError("File content does not match the declared type");
    }

    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    let fileUrl: string;

    if (USE_BLOB) {
      // ── Vercel Blob Storage ─────────────────────────────────────────────────
      const { put } = await import("@vercel/blob");
      const blob = await put(`resources/${uniqueName}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      fileUrl = blob.url;
    } else {
      // ── Local filesystem (dev) ──────────────────────────────────────────────
      if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });
      const filepath = path.join(UPLOAD_DIR, uniqueName);
      await writeFile(filepath, buffer, { flag: "wx" });
      fileUrl = `/uploads/${uniqueName}`;
    }

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
