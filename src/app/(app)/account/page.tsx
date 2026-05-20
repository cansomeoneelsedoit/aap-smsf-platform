import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initialsFromName, staffColorForRole, staffRoleLabel } from "@/lib/display";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { staff: { include: { companyGroup: true } }, client: true },
  });
  if (!user) redirect("/signin");

  const initials = initialsFromName(user.name);
  const color = user.staff ? staffColorForRole(user.staff.role) : "#6b7280";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Your account</h2>
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-start gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-white"
            style={{ background: color }}
          >
            {initials}
          </span>
          <div className="flex-1">
            <div className="text-[18px] font-bold">{user.name ?? user.email}</div>
            <div className="text-[13px] text-[color:var(--color-aap-text2)]">{user.email}</div>
            {user.staff ? (
              <div className="mt-1 text-[13px] font-semibold" style={{ color }}>
                {staffRoleLabel(user.staff.role)}
                {user.staff.companyGroup ? ` · ${user.staff.companyGroup.name}` : ""}
              </div>
            ) : (
              <div className="mt-1 text-[13px] font-semibold text-[color:var(--color-aap-text2)]">
                Client portal access
              </div>
            )}
          </div>
        </div>
        {user.staff?.bio ? (
          <div className="mt-4 rounded-lg bg-[color:var(--color-aap-surface)] p-3 text-[13px] text-[color:var(--color-aap-text2)]">
            {user.staff.bio}
          </div>
        ) : null}
      </div>
    </div>
  );
}
