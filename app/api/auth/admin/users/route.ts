import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin, toObjectId } from "@/lib/apiAuth";
import { handleApiError, NotFoundError } from "@/lib/errors";

/* ─── GET: list all users with lockout status (Admin Only) ─── */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin(request);

    const users = await User.find({}, "name email role isAdmin isLocked loginAttempts")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}

/* ─── PATCH: unlock a specific user ─── */
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin(request);

    const { userId, action } = await request.json();

    if (action === "unlock") {
      const user = await User.findByIdAndUpdate(
        toObjectId(userId),
        { isLocked: false, loginAttempts: 0 },
        { new: true }
      );
      
      if (!user) throw new NotFoundError("Usuario no encontrado");
      
      return NextResponse.json({ message: "Usuario desbloqueado con éxito", user });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
