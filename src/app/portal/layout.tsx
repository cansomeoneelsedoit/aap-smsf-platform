import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortalSidebar } from "./portal-sidebar";
import { PortalTopbar } from "./portal-topbar";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  // Staff users belong in /dashboard, not /portal.
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id! },
    include: {
      matters: {
        include: { companyGroup: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!client) {
    // Client user without a Client record — should not happen if onboarded
    // properly. Sign them out and back to onboarding.
    redirect("/onboarding");
  }

  const matter = client.matters[0];
  const actionCount = await countOpenActions(matter?.id);

  return (
    <div className="flex h-full min-h-screen">
      <PortalSidebar
        clientName={client.fullName}
        fundName={matter?.fundName ?? "Onboarding in progress"}
        actionCount={actionCount}
      />
      <div className="flex flex-1 flex-col">
        <PortalTopbar fundName={matter?.fundName ?? "My SMSF"} stage={matter?.stage ?? "START"} />
        <main className="flex-1 overflow-auto bg-[color:var(--color-aap-surface)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

async function countOpenActions(matterId?: string): Promise<number> {
  if (!matterId) return 0;
  const [pendingKyc, awaitingSig] = await Promise.all([
    prisma.kycCheck.count({
      where: { matterId, status: { in: ["NOT_STARTED", "IN_PROGRESS", "REVIEW"] } },
    }),
    prisma.document.count({ where: { matterId, signStatus: "AWAITING_SIGNATURE" } }),
  ]);
  return pendingKyc + awaitingSig;
}
