"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { signOut } from "@/lib/auth-client";
import { mapStaffRoleToLabel } from "@/lib/mappers";
import type { Session } from "@/lib/auth";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients", badge: "12" },
  { href: "/companies", label: "Companies" },
];

const queueNav = [
  { href: "/preparation", label: "Preparation", badge: "4", badgeClass: "bg-brand-purple" },
  { href: "/compliance", label: "Compliance", badge: "3", badgeClass: "bg-brand-amber" },
  { href: "/lodgement", label: "Lodgement", badge: "2", badgeClass: "bg-brand-green" },
];

const toolsNav = [{ href: "/kyc", label: "KYC" }];

const adminNav = [
  { href: "/users", label: "Staff Profiles" },
  { href: "/notifications", label: "Notifications", badge: "5" },
  { href: "/audit-log", label: "Audit Log" },
];

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
    (href === "/clients" &&
      (pathname.startsWith("/clients/") || pathname.startsWith("/matter/")));

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

export function StaffSidebar({ session }: { session: Session }) {
  const router = useRouter();
  const user = session.user;

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
          <NavItem key={item.href} {...item} />
        ))}

        <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          Queues
        </div>
        {queueNav.map((item) => (
          <NavItem key={item.href} {...item} />
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
        {adminNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      <div className="border-t border-brand-border p-2">
        <Link
          href="/users"
          className="flex cursor-pointer items-center gap-2 rounded-brand-sm px-2.5 py-2 hover:bg-brand-surface"
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
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 w-full cursor-pointer border-none bg-transparent py-1.5 text-center text-[11px] text-brand-text-3"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
