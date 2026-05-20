"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CheckSquare, FileText, MessageSquare } from "lucide-react";

import { AapLogo } from "@/components/shared/aap-logo";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dynamic?: boolean;
};

const NAV: NavItem[] = [
  { href: "/portal", label: "My matter", icon: LayoutDashboard },
  { href: "/portal/team", label: "My team", icon: Users },
  { href: "/portal/actions", label: "Actions", icon: CheckSquare, dynamic: true },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
];

export function PortalSidebar({
  clientName,
  fundName,
  actionCount,
}: {
  clientName: string;
  fundName: string;
  actionCount: number;
}) {
  const pathname = usePathname();
  return (
    <aside className="hidden h-screen w-56 shrink-0 flex-col border-r bg-white md:flex sticky top-0">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <AapLogo size={26} />
        <span className="text-[15px] font-bold tracking-tight text-[color:var(--color-aap-dark)]">
          My Portal
        </span>
      </div>
      <div className="border-b px-4 py-3">
        <div className="text-[13px] font-bold">{clientName}</div>
        <div className="text-[11px] text-[color:var(--color-aap-text3)]">{fundName}</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="px-4 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--color-aap-text3)]">
          My SMSF
        </div>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mx-2 my-[1px] flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-[color:var(--color-aap-orange-light)] text-[color:var(--color-aap-orange)] font-semibold"
                  : "text-[color:var(--color-aap-text2)] hover:bg-[color:var(--color-aap-surface)] hover:text-[color:var(--color-aap-dark)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.dynamic && actionCount > 0 ? (
                <span className="ml-auto rounded-full bg-[color:var(--color-aap-orange)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {actionCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/signin"
          className="block text-center text-[12px] text-[color:var(--color-aap-text3)] hover:text-[color:var(--color-aap-orange)]"
        >
          ← Staff login
        </Link>
      </div>
    </aside>
  );
}
