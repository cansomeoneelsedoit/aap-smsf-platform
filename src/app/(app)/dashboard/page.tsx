import Link from "next/link";
import { MatterStage, HandoffStatus, KycStatus } from "@prisma/client";
import { Bell, ArrowRight, FileText, Phone, UserPlus, CheckCircle2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  companyBadgeClass,
  companyShortName,
  initialsFromName,
  stageLabel,
  stagePillClass,
} from "@/lib/display";

const STAGE_ORDER: MatterStage[] = [
  MatterStage.START,
  MatterStage.PREPARE,
  MatterStage.CHECK,
  MatterStage.LODGE,
  MatterStage.ACTIVE,
];

const STAGE_NEXT: Record<MatterStage, string | null> = {
  START: "→ Prepare",
  PREPARE: "→ Check",
  CHECK: "→ Lodge",
  LODGE: "→ Active",
  ACTIVE: "Ongoing",
};

const STAGE_INDICATOR: Record<MatterStage, string> = {
  START: "#3b82f6",
  PREPARE: "#a855f7",
  CHECK: "#e8591a",
  LODGE: "#d97706",
  ACTIVE: "#16a34a",
};

export default async function DashboardPage() {
  const [matters, pendingHandoffs, pendingKyc, allMatters] = await Promise.all([
    prisma.matter.findMany({
      include: {
        companyGroup: true,
        stageAssignments: { include: { staff: { include: { user: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.stageAssignment.findMany({
      where: { handoffStatus: HandoffStatus.PENDING },
      include: { matter: true, staff: { include: { user: true } } },
      take: 5,
    }),
    prisma.kycCheck.count({
      where: { status: { in: [KycStatus.IN_PROGRESS, KycStatus.REVIEW, KycStatus.NOT_STARTED] } },
    }),
    prisma.matter.findMany({ select: { stage: true } }),
  ]);

  const totalClients = allMatters.length;
  const stageCounts: Record<MatterStage, number> = {
    START: 0,
    PREPARE: 0,
    CHECK: 0,
    LODGE: 0,
    ACTIVE: 0,
  };
  for (const m of allMatters) stageCounts[m.stage]++;

  return (
    <div className="space-y-5">
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label="Total clients" value={totalClients} tagText={`${totalClients} on file`} tagTone="orange" />
        <StatCard
          label="Pending handoffs"
          value={pendingHandoffs.length}
          tagText="Awaiting acceptance"
          tagTone="amber"
        />
        <StatCard label="KYC pending" value={pendingKyc} tagText="In review" tagTone="red" />
        <StatCard label="Call notes to approve" value={0} tagText="Draft ready" tagTone="purple" />
      </div>

      {/* STAGE TILES */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        {STAGE_ORDER.map((stage) => (
          <Link
            key={stage}
            href={`/matters?stage=${stage}`}
            className="group rounded-xl border bg-white p-4 transition-all hover:border-[color:var(--color-aap-orange-border)] hover:shadow-md"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: STAGE_INDICATOR[stage] }}
              />
              <span className="text-[10px] text-[color:var(--color-aap-text3)]">
                {STAGE_NEXT[stage]}
              </span>
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-[color:var(--color-aap-dark)]">
              {stageCounts[stage]}
            </div>
            <div className="text-xs font-semibold text-[color:var(--color-aap-text2)]">
              {stageLabel(stage)}
            </div>
          </Link>
        ))}
      </div>

      {/* HANDOFF ALERT */}
      {pendingHandoffs.length > 0 ? (
        <div className="aap-handoff-panel">
          <div className="text-2xl">🔔</div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-[color:var(--color-aap-orange)]">
              {pendingHandoffs.length} pending stage handoff
              {pendingHandoffs.length === 1 ? "" : "s"}
            </div>
            <div className="mt-0.5 text-xs text-[color:var(--color-aap-text2)]">
              {pendingHandoffs
                .map(
                  (h) =>
                    `${h.matter.fundName} waiting for ${h.staff.user.name ?? h.staff.user.email} (${stageLabel(
                      h.stage,
                    )})`,
                )
                .join(" · ")}
            </div>
          </div>
          <Link
            href="/matters?handoffs=pending"
            className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--color-aap-orange)] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[color:var(--color-aap-orange-2)]"
          >
            Review handoffs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}

      {/* TWO-COL: Recent clients + Recent activity */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Recent clients */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-[13px] font-bold">Recent clients</div>
            <Link
              href="/matters"
              className="rounded-md border border-[color:var(--color-aap-surface2)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
            >
              View all
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {["Client / Fund", "Company", "Stage", "Owner"].map((h) => (
                  <th
                    key={h}
                    className="border-b bg-[color:var(--color-aap-surface)] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-[color:var(--color-aap-text3)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[13px] text-[color:var(--color-aap-text3)]">
                    No matters yet. Run <code>npm run db:seed</code> to populate demo data.
                  </td>
                </tr>
              ) : (
                matters.map((m) => {
                  const owner = m.stageAssignments.find((a) => a.stage === m.stage)?.staff;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-[color:var(--color-aap-surface2)] last:border-b-0 hover:bg-[#fafafa]"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/matters/${m.id}`} className="block">
                          <div className="font-semibold text-[13px] text-[color:var(--color-aap-dark)]">
                            {m.fundName}
                          </div>
                          <div className="text-[11px] text-[color:var(--color-aap-text3)]">
                            {m.matterRef} · {matterTypeLabel(m.matterType)}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={companyBadgeClass(m.companyGroup?.name)}>
                          {companyShortName(m.companyGroup)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={stagePillClass(m.stage)}>{stageLabel(m.stage)}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px]">
                        {owner?.user.name ? shortName(owner.user.name) : "Unassigned"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Recent activity */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3 text-[13px] font-bold">Recent activity</div>
          <ul>
            <ActivityRow
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--color-aap-green)]" />}
              bg="#dcfce7"
              text="KYC passed — John Smith · Smith Family Super Fund"
              meta="10 min ago · Michael Torres"
            />
            <ActivityRow
              icon={<Phone className="h-3.5 w-3.5 text-[#7e22ce]" />}
              bg="#fdf4ff"
              text={<>
                <strong>Call note draft ready</strong> — Johnson Retirement · Echo Notes
              </>}
              meta="22 min ago · 3CX / BizGPT"
            />
            <ActivityRow
              icon={<FileText className="h-3.5 w-3.5 text-[#1d4ed8]" />}
              bg="#dbeafe"
              text="Document uploaded — Trust Deed · Johnson Retirement"
              meta="42 min ago · Emma Wilson"
            />
            <ActivityRow
              icon={<ArrowRight className="h-3.5 w-3.5 text-[color:var(--color-aap-orange)]" />}
              bg="#fef3ee"
              text={<>
                <strong>Handoff pending</strong> — Williams Corp → Lodge · Rachel Park notified
              </>}
              meta="1 hr ago · Sarah Chen"
            />
            <ActivityRow
              icon={<UserPlus className="h-3.5 w-3.5 text-[color:var(--color-aap-text2)]" />}
              bg="#f3f4f6"
              text="New client — Brown Family Super · RiverX referral"
              meta="Yesterday · Emma Wilson"
              last
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tagText,
  tagTone,
}: {
  label: string;
  value: number | string;
  tagText: string;
  tagTone: "orange" | "amber" | "red" | "purple" | "green" | "blue" | "gray";
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
        {label}
      </div>
      <div className="mt-1.5 text-[28px] font-extrabold tracking-tight text-[color:var(--color-aap-dark)]">
        {value}
      </div>
      <div className={`aap-stat-tag ${tagTone} mt-1.5`}>{tagText}</div>
    </div>
  );
}

function ActivityRow({
  icon,
  bg,
  text,
  meta,
  last = false,
}: {
  icon: React.ReactNode;
  bg: string;
  text: React.ReactNode;
  meta: string;
  last?: boolean;
}) {
  return (
    <li
      className={`flex gap-2.5 px-4 py-3 ${last ? "" : "border-b border-[color:var(--color-aap-surface2)]"}`}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: bg }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-[color:var(--color-aap-dark)]">{text}</div>
        <div className="mt-0.5 text-[11px] text-[color:var(--color-aap-text3)]">{meta}</div>
      </div>
    </li>
  );
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function matterTypeLabel(t: string): string {
  switch (t) {
    case "NEW_SMSF_SETUP":
      return "New SMSF Setup";
    case "EXISTING_ONBOARDING":
      return "Existing Onboarding";
    case "CORPORATE_TRUSTEE_SETUP":
      return "Corporate Trustee";
    default:
      return t;
  }
}
