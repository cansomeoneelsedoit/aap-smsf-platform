"use client";

import Link from "next/link";
import { CompanyBadge } from "@/components/brand/company-badge";
import { StagePill } from "@/components/brand/stage-pill";
import { StatCard } from "@/components/brand/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockStore } from "@/hooks/use-mock-store";
import type { Client } from "@/lib/types";

export function DashboardPageClient({ clients }: { clients: Client[] }) {
  const openModal = useMockStore((s) => s.openModal);

  const stageCounts = clients.reduce(
    (acc, c) => {
      acc[c.stage] = (acc[c.stage] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total clients" value={String(clients.length)} tag="Live from database" tagVariant="orange" />
        <StatCard label="Pending handoffs" value="3" tag="Awaiting acceptance" tagVariant="amber" />
        <StatCard label="KYC pending" value="5" tag="2 overdue" tagVariant="red" />
        <StatCard label="Call notes to approve" value="2" tag="Draft ready" tagVariant="purple" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-5">
        {[
          { stage: "Start", color: "#3b82f6", href: "/clients" },
          { stage: "Prepare", color: "#a855f7", href: "/preparation" },
          { stage: "Check", color: "#e8591a", href: "/compliance" },
          { stage: "Lodge", color: "#d97706", href: "/lodgement" },
          { stage: "Active", color: "#16a34a", href: "/clients" },
        ].map((s) => (
          <Link
            key={s.stage}
            href={s.href}
            className="cursor-pointer rounded-brand border border-brand-border bg-white p-3.5 transition-all hover:border-brand-orange-border hover:shadow-[0_1px_3px_rgba(0,0,0,.08),0_4px_16px_rgba(0,0,0,.06)]"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">{stageCounts[s.stage] ?? 0}</div>
            <div className="text-xs font-semibold text-brand-text-2">{s.stage}</div>
          </Link>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-brand border border-brand-amber bg-brand-amber-light p-4">
        <span className="text-xl">🔔</span>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-brand-amber">3 pending stage handoffs</div>
          <div className="text-xs text-brand-text-2">
            Williams Corp Trustee waiting for Rachel Park · Smith Family SMSF waiting for Michael Torres
          </div>
        </div>
        <Button size="sm" onClick={() => openModal("handoffs")}>
          Review handoffs
        </Button>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent clients</CardTitle>
            <Button variant="outline" size="xs" asChild>
              <Link href="/clients">View all</Link>
            </Button>
          </CardHeader>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-brand-surface text-left text-[10px] font-bold uppercase text-brand-text-3">
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Stage</th>
                <th className="px-4 py-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 5).map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-[#fafafa]">
                  <td className="border-t border-brand-surface-2 px-4 py-2.5">
                    <Link href={`/clients/${c.id}`}>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[11px] text-brand-text-3">{c.sub}</div>
                    </Link>
                  </td>
                  <td className="border-t border-brand-surface-2 px-4 py-2.5">
                    <CompanyBadge company={c.company} cbClass={c.cbClass} />
                  </td>
                  <td className="border-t border-brand-surface-2 px-4 py-2.5">
                    <StagePill stage={c.stage} pillClass={c.pillClass} />
                  </td>
                  <td className="border-t border-brand-surface-2 px-4 py-2.5 text-[13px]">{c.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: "✓", bg: "#dcfce7", text: "KYC passed — John Smith · Smith Family SMSF", time: "10 min ago" },
              { icon: "📞", bg: "#fdf4ff", text: "Call note draft ready — Johnson Retirement Fund", time: "22 min ago" },
              { icon: "📄", bg: "#dbeafe", text: "Document uploaded — Trust Deed", time: "42 min ago" },
            ].map((a, i) => (
              <div key={i} className="flex gap-2.5 border-b border-brand-surface-2 pb-3 last:border-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm" style={{ background: a.bg }}>
                  {a.icon}
                </div>
                <div>
                  <div className="text-[13px]">{a.text}</div>
                  <div className="text-[11px] text-brand-text-3">{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
