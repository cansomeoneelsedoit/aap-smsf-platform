import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MatterStage, HandoffStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  companyBadgeClass,
  companyShortName,
  initialsFromName,
  stageLabel,
  stagePillClass,
  staffColorForRole,
  staffRoleLabel,
} from "@/lib/display";
import { MatterTabs } from "./matter-tabs";

const STAGE_ORDER: MatterStage[] = [
  MatterStage.START,
  MatterStage.PREPARE,
  MatterStage.CHECK,
  MatterStage.LODGE,
  MatterStage.ACTIVE,
];

export default async function MatterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const matter = await prisma.matter.findUnique({
    where: { id },
    include: {
      companyGroup: true,
      primaryContact: { include: { user: true } },
      members: true,
      stageAssignments: { include: { staff: { include: { user: true } } } },
      documents: { include: { uploadedBy: { include: { user: true } } }, orderBy: { uploadedAt: "desc" } },
      kycChecks: { orderBy: { createdAt: "desc" } },
      fileNotes: { include: { authorStaff: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
      tasks: { include: { assignedStaff: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
      auditActions: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!matter) notFound();

  const currentStageIdx = STAGE_ORDER.indexOf(matter.stage);
  const currentOwner = matter.stageAssignments.find((a) => a.stage === matter.stage)?.staff;

  return (
    <div className="space-y-4">
      <Link
        href="/matters"
        className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--color-aap-surface2)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
      >
        <ArrowLeft className="h-3 w-3" /> Back to clients
      </Link>

      {/* HEADER CARD */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className={stagePillClass(matter.stage)}>{stageLabel(matter.stage)}</span>
          <span className={companyBadgeClass(matter.companyGroup?.name)}>
            {companyShortName(matter.companyGroup)}
          </span>
          <span className="text-[12px] text-[color:var(--color-aap-text3)]">
            {matter.matterRef}
          </span>
        </div>
        <div className="text-[22px] font-extrabold tracking-tight">{matter.fundName}</div>
        <div className="mt-1 text-[13px] text-[color:var(--color-aap-text2)]">
          {matterTypeLabel(matter.matterType)}
          {matter.abn ? ` · ABN ${matter.abn}` : ""}
          {matter.primaryContact ? ` · Primary contact ${matter.primaryContact.fullName}` : ""}
        </div>

        {/* PROGRESS TRACK */}
        <div className="mt-5 flex items-center">
          {STAGE_ORDER.map((stage, i) => {
            const done = i < currentStageIdx;
            const current = i === currentStageIdx;
            const lineDone = i <= currentStageIdx;
            return (
              <div key={stage} className="relative flex flex-1 flex-col items-center">
                {i > 0 ? (
                  <span
                    className="absolute top-3.5 -left-1/2 right-1/2 h-0.5"
                    style={{
                      background: lineDone ? "#16a34a" : "#e5e7eb",
                      zIndex: 0,
                    }}
                  />
                ) : null}
                <span
                  className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    background: done ? "#16a34a" : current ? "#e8591a" : "white",
                    color: done || current ? "white" : "#9ca3af",
                    border: done
                      ? "2px solid #16a34a"
                      : current
                      ? "2px solid #e8591a"
                      : "2px solid #d1d5db",
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className="mt-1.5 text-[11px] font-semibold"
                  style={{
                    color: done ? "#16a34a" : current ? "#e8591a" : "#9ca3af",
                  }}
                >
                  {stageLabel(stage)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OWNERSHIP STRIP */}
      <div className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((stage) => {
          const assignment = matter.stageAssignments.find((a) => a.stage === stage);
          const staff = assignment?.staff;
          const isCurrent = stage === matter.stage;
          const isCompleted = STAGE_ORDER.indexOf(stage) < currentStageIdx;
          const initials = staff?.user.name ? initialsFromName(staff.user.name) : "??";
          const color = staffColorForRole(staff?.role);
          return (
            <div
              key={stage}
              className={`flex min-w-[160px] flex-1 items-center gap-2.5 rounded-lg border-[1.5px] p-3 transition-colors ${
                isCurrent
                  ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange-light)]"
                  : isCompleted
                  ? "border-[#86efac] bg-[#f0fdf4] opacity-75"
                  : "border-[color:var(--color-aap-surface2)] bg-white"
              }`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ background: staff ? color : "#9ca3af" }}
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
                  {stageLabel(stage)}
                </div>
                <div className="truncate text-[12px] font-semibold text-[color:var(--color-aap-dark)]">
                  {staff?.user.name ?? "Unassigned"}
                </div>
                <div className="text-[10px] text-[color:var(--color-aap-text3)]">
                  {assignment?.handoffStatus === HandoffStatus.PENDING
                    ? "Handoff pending"
                    : staffRoleLabel(staff?.role)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HANDOFF ALERT */}
      {currentOwner && matter.stageAssignments.find((a) => a.stage === matter.stage)?.handoffStatus === HandoffStatus.PENDING ? (
        <div className="aap-handoff-panel">
          <div className="text-2xl">🔔</div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-[color:var(--color-aap-orange)]">
              Handoff pending to {currentOwner.user.name}
            </div>
            <div className="text-xs text-[color:var(--color-aap-text2)]">
              {stageLabel(matter.stage)} stage owner needs to accept this matter.
            </div>
          </div>
          <button
            className="rounded-lg bg-[color:var(--color-aap-orange)] px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)]"
            disabled
            title="Accept-handoff action coming soon"
          >
            Accept handoff <ChevronRight className="inline h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* TABS */}
      <MatterTabs
        defaultTab={tab ?? "overview"}
        matter={{
          id: matter.id,
          matterRef: matter.matterRef,
          fundName: matter.fundName,
          abn: matter.abn,
          tfn: matter.tfn,
          acn: matter.acn,
          stage: matter.stage,
          establishmentDate: matter.establishmentDate?.toISOString() ?? null,
          packageTier: matter.packageTier,
          trusteeStructure: matter.trusteeStructure,
          referrerName: matter.referrerName,
          companyName: matter.companyGroup?.name ?? null,
          primaryContactName: matter.primaryContact?.fullName ?? null,
          primaryContactEmail: matter.primaryContact?.email ?? null,
          members: matter.members.map((m) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            isTrustee: m.isTrustee,
          })),
          documents: matter.documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            category: d.category,
            financialYear: d.financialYear,
            signStatus: d.signStatus,
            uploadedAt: d.uploadedAt.toISOString(),
            uploadedByName: d.uploadedBy?.user.name ?? null,
            fileSize: d.fileSize,
          })),
          kycChecks: matter.kycChecks.map((k) => ({
            id: k.id,
            memberName: k.memberName,
            status: k.status,
            identityCheck: k.identityCheck,
            livenessCheck: k.livenessCheck,
            adverseMedia: k.adverseMedia,
            provider: k.provider,
            completedAt: k.completedAt?.toISOString() ?? null,
          })),
          fileNotes: matter.fileNotes.map((n) => ({
            id: n.id,
            type: n.type,
            source: n.source,
            subject: n.subject,
            body: n.body,
            tags: n.tags,
            pinned: n.pinned,
            draftStatus: n.draftStatus,
            authorName: n.authorStaff?.user.name ?? null,
            createdAt: n.createdAt.toISOString(),
            recordingUrl: n.recordingUrl,
            callDurationSec: n.callDurationSec,
          })),
          tasks: matter.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            dueDate: t.dueDate?.toISOString() ?? null,
            assignedTo: t.assignedStaff?.user.name ?? null,
          })),
          auditActions: matter.auditActions.map((a) => ({
            id: a.id,
            action: a.action,
            details: a.details,
            userName: a.user?.name ?? null,
            createdAt: a.createdAt.toISOString(),
          })),
        }}
      />
    </div>
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
