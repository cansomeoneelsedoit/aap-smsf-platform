"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/hooks/use-mock-store";
import type { Session } from "@/lib/auth";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/companies": "Companies",
  "/preparation": "Preparation Queue",
  "/compliance": "Compliance Queue",
  "/lodgement": "Lodgement Queue",
  "/kyc": "KYC Management",
  "/users": "Staff Profiles & Assignments",
  "/notifications": "Notifications",
  "/audit-log": "Audit Log",
};

export function StaffShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const openModal = useMockStore((s) => s.openModal);

  let title = "Matter Detail";
  if (pathname.startsWith("/matter/")) {
    title = "Matter Detail";
  } else if (pathname === "/clients/create") {
    title = "New Client";
  } else {
    title = titleMap[pathname] ?? "Admin Autopilot";
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar session={session} />
      <div className="flex flex-1 flex-col overflow-hidden bg-brand-surface">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-brand-border bg-white px-6">
          <h1 className="text-base font-bold tracking-tight text-brand-dark">{title}</h1>
          <div className="mx-2 max-w-md flex-1">
            <Input placeholder="Search clients, ABN, fund name, company…" className="h-9 text-[13px]" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients/create">+ New client</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => openModal("new-matter")}>
              + New matter
            </Button>
            <Button size="sm" asChild>
              <Link href="/onboard">Onboarding ↗</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
