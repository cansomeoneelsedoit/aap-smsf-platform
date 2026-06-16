"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { StagePill } from "@/components/brand/stage-pill";
import { signOut } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Matter, Party, User, StaffProfile } from "@/generated/prisma/client";

const portalNav = [
  { href: "/portal", label: "📊 My matter", exact: true },
  { href: "/portal/team", label: "👥 My team" },
  { href: "/portal/actions", label: "✅ Actions", badge: "2" },
  { href: "/portal/documents", label: "📁 Documents" },
  { href: "/portal/messages", label: "💬 Messages" },
];

type PortalMatter = Matter & {
  client: Party;
  owner: (User & { staffProfile: StaffProfile | null }) | null;
};

const STAGE_PILL_MAP: Record<string, string> = {
  Start: "pill-start",
  Prepare: "pill-prepare",
  Check: "pill-check",
  Lodge: "pill-lodge",
  Active: "pill-active",
};

export function PortalShell({
  session,
  matter,
  children,
}: {
  session: Session;
  matter: PortalMatter | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = session.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/portal/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-brand-border bg-white">
        <div className="border-b border-brand-border px-4 py-[18px]">
          <div className="flex items-center gap-2">
            <Logo size="sm" className="[&_span]:text-[15px]" />
          </div>
          <div className="mt-1 text-[15px] font-bold">My Portal</div>
        </div>
        <div className="border-b border-brand-border px-4 py-4">
          <div className="text-[13px] font-bold">{user.name}</div>
          <div className="text-[11px] text-brand-text-3">
            {matter?.client.name ?? "No matter linked"}
          </div>
        </div>
        <div className="px-4 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          My SMSF
        </div>
        <nav className="flex-1">
          {portalNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mx-2 flex items-center gap-2 rounded-brand-sm px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-brand-orange-light font-semibold text-brand-orange"
                    : "text-brand-text-2 hover:bg-brand-surface"
                )}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-auto rounded-full bg-brand-orange px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-brand-border p-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="block w-full text-left text-xs text-brand-text-3 hover:text-brand-dark"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden bg-brand-surface">
        <header className="flex h-14 shrink-0 items-center border-b border-brand-border bg-white px-6">
          <h1 className="text-base font-bold text-brand-dark">
            {matter?.client.name ?? "Client Portal"}
          </h1>
          <div className="ml-auto">
            {matter && (
              <StagePill
                stage={matter.stage}
                pillClass={STAGE_PILL_MAP[matter.stage] ?? "pill-check"}
              />
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
