import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/teacher/login");
  }

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "teacher") {
    redirect("/teacher/login");
  }

  return <>{children}</>;
}
