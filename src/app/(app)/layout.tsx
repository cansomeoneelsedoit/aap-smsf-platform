import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MatterStage, HandoffStatus, KycStatus } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, type SidebarCounts } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { initialsFromName, staffColorForRole } from "@/lib/display";
import { alertLevel } from "@/lib/dates";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  // Client portal users shouldn't see the staff app — bounce them to /portal.
  if (session.user.role === "CLIENT") redirect("/portal");

  const staff = session.user.id
    ? await prisma.staff.findUnique({ where: { userId: session.user.id } })
    : null;

  const counts = await buildSidebarCounts();

  const name = session.user.name ?? session.user.email ?? "User";
  const email = session.user.email ?? "";
  const role = session.user.role ?? "STAFF";
  const initials = initialsFromName(name);
  const color = staffColorForRole(staff?.role);

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar role={role} name={name} initials={initials} color={color} counts={counts} />
      <div className="flex flex-1 flex-col">
        <Topbar title="Dashboard" name={name} email={email} role={role} />
        <main className="flex-1 overflow-auto bg-[color:var(--color-aap-surface)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

async function buildSidebarCounts(): Promise<SidebarCounts> {
  const now = new Date();
  const [matters, prepCount, complCount, lodgeCount, pendingHandoffs, pendingKyc] = await Promise.all([
    prisma.matter.findMany({ select: { stage: true, returnDueDate: true } }),
    prisma.matter.count({ where: { stage: MatterStage.PREPARE } }),
    prisma.matter.count({ where: { stage: MatterStage.CHECK } }),
    prisma.matter.count({ where: { stage: MatterStage.LODGE } }),
    prisma.stageAssignment.count({ where: { handoffStatus: HandoffStatus.PENDING } }),
    prisma.kycCheck.count({
      where: { status: { in: [KycStatus.NOT_STARTED, KycStatus.IN_PROGRESS, KycStatus.REVIEW] } },
    }),
  ]);

  let alertsOverdue = 0;
  let alertsActive = 0;
  for (const m of matters) {
    const lvl = alertLevel(m.stage, m.returnDueDate, now);
    if (lvl === "OVERDUE") {
      alertsOverdue++;
      alertsActive++;
    } else if (lvl === "DUE_SOON" || lvl === "APPROACHING") {
      alertsActive++;
    }
  }

  return {
    clients: matters.length,
    preparation: prepCount,
    compliance: complCount,
    lodgement: lodgeCount,
    notifications: pendingHandoffs + pendingKyc,
    alertsOverdue,
    alertsActive,
  };
}
