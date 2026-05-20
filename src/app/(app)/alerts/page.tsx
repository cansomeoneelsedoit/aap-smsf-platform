import Link from "next/link";
import { AlertTriangle, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import type { Matter, CompanyGroup, StageAssignment, Staff, User } from "@prisma/client";
import { HandoffStatus, KycStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  alertLevel,
  alertLabel,
  alertTone,
  daysUntil,
  describeDays,
  formatDueDate,
  resolveReturnDueDate,
  targetCompletionDate,
  type AlertLevel,
} from "@/lib/dates";
import {
  companyBadgeClass,
  companyShortName,
  stageLabel,
  stagePillClass,
} from "@/lib/display";

type MatterWithRelations = Matter & {
  companyGroup: CompanyGroup | null;
  stageAssignments: Array<StageAssignment & { staff: Staff & { user: User } }>;
};

const SECTION_ORDER: AlertLevel[] = ["OVERDUE", "DUE_SOON", "APPROACHING", "ON_TRACK", "COMPLETE"];

const SECTION_LABEL: Record<AlertLevel, string> = {
  OVERDUE: "Overdue",
  DUE_SOON: "Due within 2 weeks",
  APPROACHING: "Approaching target (15–60 days)",
  ON_TRACK: "On track",
  COMPLETE: "Complete (ACTIVE)",
};

const SECTION_BLURB: Record<AlertLevel, string> = {
  OVERDUE: "Target completion date has passed and the matter has not reached ACTIVE. Escalate now.",
  DUE_SOON: "Target completion date is within the next two weeks. Push for lodgement readiness.",
  APPROACHING: "Within two months of target. Documentation and KYC should already be in hand.",
  ON_TRACK: "More than two months from target. No action required yet.",
  COMPLETE: "Already in the ACTIVE stage — no return work outstanding.",
};

const SECTION_ICON: Record<AlertLevel, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  OVERDUE: AlertTriangle,
  DUE_SOON: Clock,
  APPROACHING: TrendingUp,
  ON_TRACK: CheckCircle2,
  COMPLETE: CheckCircle2,
};

export default async function AlertsPage() {
  const now = new Date();
  const [matters, pendingHandoffs, pendingKyc] = await Promise.all([
    prisma.matter.findMany({
      include: {
        companyGroup: true,
        stageAssignments: { include: { staff: { include: { user: true } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.stageAssignment.findMany({
      where: { handoffStatus: HandoffStatus.PENDING },
      include: { matter: true, staff: { include: { user: true } } },
    }),
    prisma.kycCheck.findMany({
      where: { status: { in: [KycStatus.NOT_STARTED, KycStatus.IN_PROGRESS, KycStatus.REVIEW] } },
      include: { matter: true },
    }),
  ]);

  // Bucket matters by alert level
  const buckets: Record<AlertLevel, MatterWithRelations[]> = {
    OVERDUE: [],
    DUE_SOON: [],
    APPROACHING: [],
    ON_TRACK: [],
    COMPLETE: [],
  };
  for (const m of matters) {
    buckets[alertLevel(m.stage, m.returnDueDate, now)].push(m);
  }

  // Sort each bucket by days-until-target (most urgent first)
  for (const k of SECTION_ORDER) {
    buckets[k].sort((a, b) => {
      const da = daysUntil(targetCompletionDate(a.returnDueDate, now), now);
      const db = daysUntil(targetCompletionDate(b.returnDueDate, now), now);
      return da - db;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Alerts &amp; outstanding work</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">
          Every matter has an ATO/ASIC return due date. We aim to complete the return{" "}
          <strong>two months prior</strong>. Matters left blank default to <strong>1 May</strong> (final lodgement deadline is 15 May).
        </p>
      </div>

      {/* SUMMARY ROW */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-5">
        {SECTION_ORDER.map((level) => {
          const tone = alertTone(level);
          const count = buckets[level].length;
          return (
            <a
              key={level}
              href={`#section-${level}`}
              className="rounded-xl border bg-white p-4 transition-all hover:shadow-md"
              style={{ borderColor: tone.border }}
            >
              <div
                className="mb-1 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: tone.fg }}
              >
                {SECTION_LABEL[level]}
              </div>
              <div className="text-[28px] font-extrabold tracking-tight">{count}</div>
            </a>
          );
        })}
      </div>

      {/* OPERATIONAL ALERTS (handoffs + KYC pending) */}
      {pendingHandoffs.length > 0 || pendingKyc.length > 0 ? (
        <div className="grid gap-3.5 md:grid-cols-2">
          {pendingHandoffs.length > 0 ? (
            <div className="rounded-xl border-[1.5px] border-[color:var(--color-aap-amber)] bg-[color:var(--color-aap-amber-light)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[color:var(--color-aap-amber)]" />
                <div className="text-[13px] font-bold text-[color:var(--color-aap-amber)]">
                  {pendingHandoffs.length} pending stage handoff
                  {pendingHandoffs.length === 1 ? "" : "s"}
                </div>
              </div>
              <ul className="space-y-1 text-[12px] text-[color:var(--color-aap-text2)]">
                {pendingHandoffs.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/matters/${h.matterId}`}
                      className="hover:text-[color:var(--color-aap-orange)]"
                    >
                      {h.matter.fundName}
                    </Link>{" "}
                    → {stageLabel(h.stage)} (waiting on {h.staff.user.name})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {pendingKyc.length > 0 ? (
            <div className="rounded-xl border-[1.5px] border-[color:var(--color-aap-red)] bg-[color:var(--color-aap-red-light)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[color:var(--color-aap-red)]" />
                <div className="text-[13px] font-bold text-[color:var(--color-aap-red)]">
                  {pendingKyc.length} KYC check{pendingKyc.length === 1 ? "" : "s"} pending
                </div>
              </div>
              <ul className="space-y-1 text-[12px] text-[color:var(--color-aap-text2)]">
                {pendingKyc.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/matters/${k.matterId}?tab=kyc`}
                      className="hover:text-[color:var(--color-aap-orange)]"
                    >
                      {k.matter.fundName}
                    </Link>{" "}
                    — {k.memberName} ({k.status.replace(/_/g, " ").toLowerCase()})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* PER-LEVEL SECTIONS */}
      {SECTION_ORDER.map((level) => {
        const list = buckets[level];
        if (list.length === 0) return null;
        const Icon = SECTION_ICON[level];
        const tone = alertTone(level);
        return (
          <section key={level} id={`section-${level}`} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color: tone.fg }} />
              <h3 className="text-[14px] font-bold" style={{ color: tone.fg }}>
                {SECTION_LABEL[level]} · {list.length}
              </h3>
            </div>
            <p className="text-[12px] text-[color:var(--color-aap-text2)]">
              {SECTION_BLURB[level]}
            </p>
            <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: tone.border }}>
              <table className="w-full">
                <thead>
                  <tr>
                    {["Matter", "Company", "Stage", "Return due", "Target", "Owner"].map((h) => (
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
                  {list.map((m) => {
                    const due = resolveReturnDueDate(m.returnDueDate, now);
                    const target = targetCompletionDate(m.returnDueDate, now);
                    const days = daysUntil(target, now);
                    const owner = m.stageAssignments.find((a) => a.stage === m.stage)?.staff;
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-[color:var(--color-aap-surface2)] last:border-b-0 hover:bg-[#fafafa]"
                      >
                        <td className="px-4 py-3">
                          <Link href={`/matters/${m.id}`} className="block">
                            <div className="text-[13px] font-semibold">{m.fundName}</div>
                            <div className="text-[11px] text-[color:var(--color-aap-text3)]">
                              {m.matterRef}
                              {m.returnDueDate ? "" : " · default 1 May"}
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
                        <td className="px-4 py-3 text-[12px]">{formatDueDate(due)}</td>
                        <td className="px-4 py-3 text-[12px]">
                          <div>{formatDueDate(target)}</div>
                          {level !== "COMPLETE" ? (
                            <div className="text-[10px]" style={{ color: tone.fg }}>
                              {describeDays(days)}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-[12px]">{owner?.user.name ?? "Unassigned"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
