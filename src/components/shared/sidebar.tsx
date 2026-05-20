"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, FileText, ShieldCheck, ScrollText, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SmsfRole } from "@/auth.config";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; roles?: SmsfRole[] };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matters", label: "Matters", icon: Briefcase },
  { href: "/clients", label: "Clients", icon: Users, roles: ["SUPERUSER", "STAFF"] },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/kyc", label: "KYC", icon: ShieldCheck, roles: ["SUPERUSER", "STAFF"] },
  { href: "/file-notes", label: "File Notes", icon: Phone, roles: ["SUPERUSER", "STAFF"] },
  { href: "/audit", label: "Audit Log", icon: ScrollText, roles: ["SUPERUSER"] },
];

export function Sidebar({ role }: { role: SmsfRole }) {
  const pathname = usePathname();
  const items = NAV.filter((n) => !n.roles || n.roles.includes(role));

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="border-b px-4 py-5">
        <p className="font-serif text-xl">SMSF Echo</p>
        <p className="text-xs text-muted-foreground">Admin Autopilot</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 text-[10px] uppercase tracking-wide text-muted-foreground">
        v0.1 · port 3001
      </div>
    </aside>
  );
}
