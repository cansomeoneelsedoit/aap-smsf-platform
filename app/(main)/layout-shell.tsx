"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/hooks/use-mock-store";
import { signOut } from "@/lib/auth-client";
import { mapStaffRoleToLabel } from "@/lib/mappers";
import type { Session } from "@/lib/auth";
import type { NavBadgeCounts } from "@/lib/types";
import { cn } from "@/lib/utils";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/matters": "Matters",
  "/clients": "Clients",
  "/parties": "Clients",
  "/preparation": "Preparation Queue",
  "/compliance": "Compliance Queue",
  "/lodgement": "Lodgement Queue",
  "/kyc": "KYC Management",
  "/admin/users": "Staff Profiles & Assignments",
  "/notifications": "Notifications",
  "/admin/audit-log": "Audit Log",
  "/admin/organisations": "Organisations",
};

const mainNav: Array<{
  href: string;
  label: string;
  badgeKey?: keyof NavBadgeCounts;
}> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Notifications", badgeKey: "notifications" },
  { href: "/matters", label: "Matters" },
  { href: "/clients", label: "Clients" },
];

const queueNav: Array<{
  href: string;
  label: string;
  badgeKey: keyof NavBadgeCounts;
  badgeClass: string;
}> = [
  {
    href: "/preparation",
    label: "Preparation",
    badgeKey: "preparation",
    badgeClass: "bg-brand-purple",
  },
  {
    href: "/compliance",
    label: "Compliance",
    badgeKey: "compliance",
    badgeClass: "bg-brand-amber",
  },
  {
    href: "/lodgement",
    label: "Lodgement",
    badgeKey: "lodgement",
    badgeClass: "bg-brand-green",
  },
];

const toolsNav = [{ href: "/kyc", label: "KYC" }];

const adminNav = [
  { href: "/admin/users", label: "Staff Profiles" },
  { href: "/admin/audit-log", label: "Audit Log" },
  { href: "/admin/organisations", label: "Organisations", masterOwnerOnly: true },
] as const;

function formatBadge(count: number): string | undefined {
  return count > 0 ? String(count) : undefined;
}

function NavItem({
  href,
  label,
  badge,
  badgeClass,
}: {
  href: string;
  label: string;
  badge?: string;
  badgeClass?: string;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    (href === "/matters" && pathname.startsWith("/matters/")) ||
    (href === "/clients" &&
      (pathname.startsWith("/clients/") || pathname.startsWith("/parties/")));

  return (
    <Link
      href={href}
      className={cn(
        "mx-2 flex cursor-pointer items-center gap-2 rounded-brand-sm px-3 py-2 text-[13px] font-medium text-brand-text-2 transition-colors",
        active && "bg-brand-orange-light font-semibold text-brand-orange",
        !active && "hover:bg-brand-surface hover:text-brand-dark"
      )}
    >
      {label}
      {badge && (
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white",
            badgeClass ?? "bg-brand-orange"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function StaffSidebar({ session, navBadges }: { session: Session; navBadges: NavBadgeCounts }) {
  const router = useRouter();
  const user = session.user;
  const visibleAdminNav = adminNav.filter(
    (item) => !("masterOwnerOnly" in item && item.masterOwnerOnly) || user.staffRole === "MASTER_OWNER"
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-brand-border bg-white">
      <div className="border-b border-brand-border px-4 py-[18px]">
        <Logo size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          Main
        </div>
        {mainNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            badge={item.badgeKey ? formatBadge(navBadges[item.badgeKey]) : undefined}
          />
        ))}

        <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          Queues
        </div>
        {queueNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            badge={formatBadge(navBadges[item.badgeKey])}
            badgeClass={item.badgeClass}
          />
        ))}

        <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          Tools
        </div>
        {toolsNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          Admin
        </div>
        {visibleAdminNav.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} />
        ))}
      </div>

      <div className="border-t border-brand-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-brand-sm px-2.5 py-2 hover:bg-brand-surface"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: user.color ?? "#e8591a" }}
              >
                {user.initials ?? "SC"}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-brand-dark">
                  {user.name}
                </div>
                <div className="text-[11px] text-brand-text-3">
                  {user.staffRole ? mapStaffRoleToLabel(user.staffRole) : "Staff"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function StaffShell({
  session,
  navBadges,
  children,
}: {
  session: Session;
  navBadges: NavBadgeCounts;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const openModal = useMockStore((s) => s.openModal);

  let title = "Admin Autopilot";
  if (pathname.startsWith("/matters/")) {
    title = "Matter Detail";
  } else if (pathname.startsWith("/parties/") || pathname.startsWith("/clients/")) {
    if (pathname.endsWith("/create")) {
      title = "New Client";
    } else if (pathname.match(/\/(parties|clients)\/[^/]+$/)) {
      title = "Client Detail";
    }
  } else if (pathname.startsWith("/admin/organisations/")) {
    title = "Organisation Detail";
  } else {
    title = titleMap[pathname] ?? "Admin Autopilot";
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar session={session} navBadges={navBadges} />
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
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
