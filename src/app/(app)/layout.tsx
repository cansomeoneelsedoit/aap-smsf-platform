import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { initialsFromName, staffColorForRole } from "@/lib/display";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const staff = session.user.id
    ? await prisma.staff.findUnique({ where: { userId: session.user.id } })
    : null;

  const name = session.user.name ?? session.user.email ?? "User";
  const email = session.user.email ?? "";
  const role = session.user.role ?? "STAFF";
  const initials = initialsFromName(name);
  const color = staffColorForRole(staff?.role);

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar role={role} name={name} initials={initials} color={color} />
      <div className="flex flex-1 flex-col">
        <Topbar title="Dashboard" name={name} email={email} role={role} />
        <main className="flex-1 overflow-auto bg-[color:var(--color-aap-surface)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
