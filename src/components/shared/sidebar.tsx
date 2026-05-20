"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  ArrowUpRight,
  IdCard,
  UserCog,
  Bell,
  ScrollText,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { SmsfRole } from "@/auth.config";
import { AapLogo } from "./aap-logo";

type Tone = "orange" | "amber" | "green" | "purple" | "red";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  tone?: Tone;
  roles?: SmsfRole[];
};

type NavSection = { label: string; items: NavItem[] };

export type SidebarCounts = {
  clients: number;
  preparation: number;
  compliance: number;
  lodgement: number;
  notifications: number;
  /** Overdue alerts — surfaces as a red badge next to "Alerts". */
  alertsOverdue: number;
  /** Total non-COMPLETE alerts (Overdue + Due soon + Approaching). */
  alertsActive: number;
};

function sections(counts: SidebarCounts): NavSection[] {
  return [
    {
      label: "Main",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/alerts",
          label: "Alerts",
          icon: AlertTriangle,
          count: counts.alertsOverdue || counts.alertsActive,
          tone: counts.alertsOverdue > 0 ? "red" : counts.alertsActive > 0 ? "amber" : undefined,
        },
        { href: "/matters", label: "Clients", icon: Users, count: counts.clients, tone: "orange" },
        { href: "/companies", label: "Companies", icon: Building2 },
      ],
    },
    {
      label: "Queues",
      items: [
        {
          href: "/queues/preparation",
          label: "Preparation",
          icon: ClipboardCheck,
          count: counts.preparation,
          tone: "purple",
        },
        {
          href: "/queues/compliance",
          label: "Compliance",
          icon: ShieldCheck,
          count: counts.compliance,
          tone: "amber",
        },
        {
          href: "/queues/lodgement",
          label: "Lodgement",
          icon: ArrowUpRight,
          count: counts.lodgement,
          tone: "green",
        },
      ],
    },
    {
      label: "Tools",
      items: [{ href: "/kyc", label: "KYC", icon: IdCard }],
    },
    {
      label: "Admin",
      items: [
        { href: "/staff", label: "Staff Profiles", icon: UserCog },
        {
          href: "/notifications",
          label: "Notifications",
          icon: Bell,
          count: counts.notifications,
          tone: "orange",
        },
        { href: "/audit", label: "Audit Log", icon: ScrollText, roles: ["SUPERUSER"] },
      ],
    },
  ];
}

const TONE_BG: Record<Tone, string> = {
  orange: "bg-[color:var(--color-aap-orange)]",
  amber: "bg-[color:var(--color-aap-amber)]",
  green: "bg-[color:var(--color-aap-green)]",
  purple: "bg-[color:var(--color-aap-purple)]",
  red: "bg-[color:var(--color-aap-red)]",
};

export function Sidebar({
  role,
  name,
  initials,
  color,
  counts,
}: {
  role: SmsfRole;
  name: string;
  initials: string;
  color: string;
  counts: SidebarCounts;
}) {
  const pathname = usePathname();
  const SECTIONS = sections(counts);
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r bg-white md:flex sticky top-0">
      <div className="flex items-center gap-2 border-b px-4 py-[18px]">
        <AapLogo size={28} />
        <span className="text-[15px] font-bold tracking-tight text-[color:var(--color-aap-dark)]">
          Admin Autopilot
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--color-aap-text3)]">
              {section.label}
            </div>
            {section.items
              .filter((it) => !it.roles || it.roles.includes(role))
              .map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                const showBadge = item.count && item.count > 0 && item.tone;
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
                    {showBadge ? (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white",
                          TONE_BG[item.tone!],
                        )}
                      >
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <Link
          href="/account"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-[color:var(--color-aap-surface)]"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: color }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-[color:var(--color-aap-dark)]">{name}</div>
            <div className="text-[11px] text-[color:var(--color-aap-text3)]">{roleLabel(role)}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function roleLabel(role: SmsfRole) {
  switch (role) {
    case "SUPERUSER":
      return "Master Owner";
    case "CLIENT":
      return "Client";
    default:
      return "Staff";
  }
}
