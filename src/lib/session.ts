import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentStaff() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.staff.findUnique({
    where: { userId: session.user.id },
    include: { user: true, companyGroup: true },
  });
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
