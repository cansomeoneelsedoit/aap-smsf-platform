import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatterStage } from "@prisma/client";
import { initialsFromName, stageLabel, stagePillClass, staffColorForRole, staffRoleLabel } from "@/lib/display";

const STAGE_ORDER: MatterStage[] = [
  MatterStage.START,
  MatterStage.PREPARE,
  MatterStage.CHECK,
  MatterStage.LODGE,
  MatterStage.ACTIVE,
];

export default async function PortalOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: {
      matters: {
        include: {
          companyGroup: true,
          members: true,
          stageAssignments: {
            include: { staff: { include: { user: true } } },
          },
          kycChecks: true,
          documents: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  const matter = client?.matters[0];
  const owner = matter?.stageAssignments.find((a) => a.stage === matter.stage)?.staff;
  const currentStageIdx = matter ? STAGE_ORDER.indexOf(matter.stage) : 0;
  const pendingKyc = matter?.kycChecks.filter(
    (k) => k.status === "IN_PROGRESS" || k.status === "NOT_STARTED" || k.status === "REVIEW",
  );
  const awaitingSig = matter?.documents.filter((d) => d.signStatus === "AWAITING_SIGNATURE") ?? [];

  return (
    <div className="space-y-4">
      {/* HERO */}
      <div
        className="rounded-xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #e8591a 0%, #c44a0c 100%)",
        }}
      >
        <div className="text-[12px] opacity-80">Matter {matter?.matterRef ?? "—"}</div>
        <div className="mt-1 text-[22px] font-extrabold">{matter?.fundName ?? "—"}</div>
        <div className="mt-1 text-[13px] opacity-85">
          {matter ? matterTypeLabel(matter.matterType) : ""} ·{" "}
          {matter ? packageLabel(matter.packageTier) : ""}
        </div>
        <div className="mt-4 flex gap-1.5">
          {STAGE_ORDER.map((stage, i) => (
            <div
              key={stage}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  i < currentStageIdx
                    ? "rgba(255,255,255,0.9)"
                    : i === currentStageIdx
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] opacity-70">
          {STAGE_ORDER.map((stage, i) => (
            <span key={stage} className={i === currentStageIdx ? "font-bold opacity-100" : ""}>
              {stageLabel(stage)}
              {i === currentStageIdx ? " ◀" : ""}
            </span>
          ))}
        </div>
      </div>

      {/* ACTION ALERT */}
      {pendingKyc && pendingKyc.length > 0 ? (
        <div
          className="flex items-center gap-3 rounded-xl border-[1.5px] bg-[color:var(--color-aap-amber-light)] px-5 py-3.5"
          style={{ borderColor: "#d97706" }}
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-[color:var(--color-aap-amber)]">
              Action required: {pendingKyc[0].memberName} KYC pending
            </div>
            <div className="mt-0.5 text-[12px] text-[color:var(--color-aap-text2)]">
              Complete identity verification to avoid lodgement delays.
            </div>
          </div>
          <Link
            href="/portal/actions"
            className="rounded-lg bg-[color:var(--color-aap-amber)] px-3.5 py-1.5 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Complete now →
          </Link>
        </div>
      ) : awaitingSig.length > 0 ? (
        <div
          className="flex items-center gap-3 rounded-xl border-[1.5px] bg-[color:var(--color-aap-amber-light)] px-5 py-3.5"
          style={{ borderColor: "#d97706" }}
        >
          <span className="text-xl">✍️</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-[color:var(--color-aap-amber)]">
              {awaitingSig.length} document{awaitingSig.length === 1 ? "" : "s"} awaiting your signature
            </div>
          </div>
          <Link
            href="/portal/actions"
            className="rounded-lg bg-[color:var(--color-aap-amber)] px-3.5 py-1.5 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Review →
          </Link>
        </div>
      ) : null}

      {/* MATTER PROGRESS CARD */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-5 py-3 text-[13px] font-bold">Matter progress</div>
        <div className="px-5 py-3">
          <FieldRow label="ABN" value={matter?.abn ?? "—"} />
          <FieldRow
            label="Members"
            value={
              matter?.members.map((m) => `${m.firstName} ${m.lastName}`).join(", ") ?? "—"
            }
          />
          <FieldRow
            label="Current stage"
            valueNode={matter ? <span className={stagePillClass(matter.stage)}>{stageLabel(matter.stage)}</span> : <>—</>}
          />
          <FieldRow
            label="Current custodian"
            value={
              owner?.user.name
                ? `${owner.user.name} (${staffRoleLabel(owner.role)})`
                : "Unassigned"
            }
          />
          <FieldRow label="Established" value={matter?.establishmentDate ? new Date(matter.establishmentDate).toLocaleDateString("en-AU") : "—"} />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 md:grid-cols-3">
        <PortalQuickCard href="/portal/team" emoji="👥" title="Your team" body="Meet your bookkeeper, compliance officer, and tax agent." />
        <PortalQuickCard href="/portal/documents" emoji="📁" title="Documents" body="Upload identity, trust deed, and supporting documents." />
        <PortalQuickCard href="/portal/messages" emoji="💬" title="Messages" body="Chat with your team — they aim to respond within 24 hours." />
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between border-b border-[color:var(--color-aap-surface2)] py-2.5 text-[13px] last:border-b-0">
      <div className="text-[color:var(--color-aap-text2)]">{label}</div>
      <div className="font-semibold text-[color:var(--color-aap-dark)]">{valueNode ?? value}</div>
    </div>
  );
}

function PortalQuickCard({
  href,
  emoji,
  title,
  body,
}: {
  href: string;
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border bg-white p-4 transition-colors hover:border-[color:var(--color-aap-orange-border)] hover:shadow-md"
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-[14px] font-semibold">{title}</div>
      <div className="mt-1 text-[12px] text-[color:var(--color-aap-text2)]">{body}</div>
    </Link>
  );
}

function matterTypeLabel(t: string): string {
  switch (t) {
    case "NEW_SMSF_SETUP":
      return "New SMSF Setup";
    case "EXISTING_ONBOARDING":
      return "Existing Onboarding";
    case "CORPORATE_TRUSTEE_SETUP":
      return "Corporate Trustee Setup";
    default:
      return t;
  }
}

function packageLabel(p: string): string {
  switch (p) {
    case "DEFAULT_PLUS_ACCOUNTING":
      return "Default + Accounting · $999/yr";
    case "UNLISTED_ASSETS":
      return "Default + Unlisted · $1,149/yr";
    case "BYOA":
      return "BYOA Package · $1,399/yr";
    default:
      return p;
  }
}
