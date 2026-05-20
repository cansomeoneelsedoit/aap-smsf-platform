"use client";

import { useState } from "react";
import {
  FileText,
  IdCard,
  StickyNote,
  ScrollText,
  CircleHelp,
  Phone,
  Mail,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { DocumentCategory, KycStatus, CheckResult, FileNoteType, FileNoteSource, FileNoteDraftStatus, DocumentSignStatus, MatterStage, TaskStatus, AuditActionType, PackageTier, TrusteeStructure } from "@prisma/client";

type MatterDTO = {
  id: string;
  matterRef: string;
  fundName: string;
  abn: string | null;
  tfn: string | null;
  acn: string | null;
  stage: MatterStage;
  establishmentDate: string | null;
  packageTier: PackageTier;
  trusteeStructure: TrusteeStructure;
  referrerName: string | null;
  companyName: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  members: Array<{ id: string; firstName: string; lastName: string; email: string | null; isTrustee: boolean }>;
  documents: Array<{
    id: string;
    fileName: string;
    category: DocumentCategory;
    financialYear: string | null;
    signStatus: DocumentSignStatus;
    uploadedAt: string;
    uploadedByName: string | null;
    fileSize: number;
  }>;
  kycChecks: Array<{
    id: string;
    memberName: string;
    status: KycStatus;
    identityCheck: CheckResult | null;
    livenessCheck: CheckResult | null;
    adverseMedia: CheckResult | null;
    provider: string;
    completedAt: string | null;
  }>;
  fileNotes: Array<{
    id: string;
    type: FileNoteType;
    source: FileNoteSource;
    subject: string;
    body: string;
    tags: string[];
    pinned: boolean;
    draftStatus: FileNoteDraftStatus;
    authorName: string | null;
    createdAt: string;
    recordingUrl: string | null;
    callDurationSec: number | null;
  }>;
  tasks: Array<{ id: string; title: string; status: TaskStatus; dueDate: string | null; assignedTo: string | null }>;
  auditActions: Array<{ id: string; action: AuditActionType; details: string | null; userName: string | null; createdAt: string }>;
};

const TABS = [
  { id: "overview", label: "Overview", icon: CircleHelp },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "kyc", label: "KYC", icon: IdCard },
  { id: "file-notes", label: "File Notes", icon: StickyNote },
  { id: "audit", label: "Audit Log", icon: ScrollText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function MatterTabs({ defaultTab, matter }: { defaultTab: string; matter: MatterDTO }) {
  const initial = (TABS.find((t) => t.id === defaultTab)?.id ?? "overview") as TabId;
  const [active, setActive] = useState<TabId>(initial);

  return (
    <div>
      <div className="flex gap-0 border-b-2 border-[color:var(--color-aap-surface2)]">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "-mb-0.5 flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-[13px] font-semibold transition-colors whitespace-nowrap",
                active === t.id
                  ? "border-[color:var(--color-aap-orange)] text-[color:var(--color-aap-orange)]"
                  : "text-[color:var(--color-aap-text2)] hover:text-[color:var(--color-aap-dark)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {active === "overview" && <OverviewTab matter={matter} />}
        {active === "documents" && <DocumentsTab matter={matter} />}
        {active === "kyc" && <KycTab matter={matter} />}
        {active === "file-notes" && <FileNotesTab matter={matter} />}
        {active === "audit" && <AuditTab matter={matter} />}
      </div>
    </div>
  );
}

function OverviewTab({ matter }: { matter: MatterDTO }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {/* Fund details card */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3 text-[13px] font-bold">Fund details</div>
          <div className="px-4 py-2">
            <FieldRow label="Fund name" value={matter.fundName} />
            <FieldRow label="Matter reference" value={matter.matterRef} />
            <FieldRow label="ABN" value={matter.abn ?? "—"} />
            <FieldRow label="TFN" value={matter.tfn ?? "—"} />
            <FieldRow label="ACN" value={matter.acn ?? "—"} />
            <FieldRow
              label="Established"
              value={
                matter.establishmentDate
                  ? new Date(matter.establishmentDate).toLocaleDateString("en-AU")
                  : "—"
              }
            />
            <FieldRow label="Trustee structure" value={trusteeLabel(matter.trusteeStructure)} />
            <FieldRow label="Package" value={packageLabel(matter.packageTier)} />
            <FieldRow label="Company group" value={matter.companyName ?? "—"} />
            <FieldRow label="Referrer" value={matter.referrerName ?? "—"} />
          </div>
        </div>

        {/* Members */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-[13px] font-bold">Members &amp; trustees</div>
            <Users className="h-3.5 w-3.5 text-[color:var(--color-aap-text3)]" />
          </div>
          {matter.members.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-[color:var(--color-aap-text3)]">
              No members captured yet.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {["Name", "Email", "Role"].map((h) => (
                    <th
                      key={h}
                      className="border-b bg-[color:var(--color-aap-surface)] px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-aap-text3)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matter.members.map((m) => (
                  <tr key={m.id} className="border-b border-[color:var(--color-aap-surface2)] last:border-b-0">
                    <td className="px-4 py-2.5 text-[13px] font-semibold">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[color:var(--color-aap-text2)]">
                      {m.email ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[13px]">
                      {m.isTrustee ? "Trustee + Member" : "Member"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Primary contact */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3 text-[13px] font-bold">Primary contact</div>
          <div className="px-4 py-3">
            <div className="text-[14px] font-semibold">{matter.primaryContactName ?? "—"}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[color:var(--color-aap-text2)]">
              <Mail className="h-3 w-3" /> {matter.primaryContactEmail ?? "—"}
            </div>
            <button
              type="button"
              disabled
              className="mt-3 inline-flex items-center gap-1 rounded-full border-[1.5px] border-[color:var(--color-aap-green)] bg-[color:var(--color-aap-green-light)] px-3 py-1 text-[12px] font-bold text-[color:var(--color-aap-green)]"
            >
              <Phone className="h-3 w-3" /> Call
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3 text-[13px] font-bold">Open tasks</div>
          <div className="space-y-1.5 px-4 py-3">
            {matter.tasks.length === 0 ? (
              <div className="text-[12px] text-[color:var(--color-aap-text3)]">No tasks yet.</div>
            ) : (
              matter.tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-2"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-[2px]",
                      t.status === "DONE"
                        ? "border-[color:var(--color-aap-green)] bg-[color:var(--color-aap-green)] text-white"
                        : "border-[color:var(--color-aap-surface2)]",
                    )}
                  >
                    {t.status === "DONE" ? "✓" : ""}
                  </span>
                  <div className="flex-1 text-[12px]">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-[10px] text-[color:var(--color-aap-text3)]">
                      {t.assignedTo ?? "Unassigned"}
                      {t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString("en-AU")}` : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ matter }: { matter: MatterDTO }) {
  // Group by year, then by category
  const years = Array.from(
    new Set(matter.documents.map((d) => d.financialYear ?? "Other")),
  );
  if (years.length === 0) years.push("All");
  const [first, ...rest] = years;
  const initialYear = first;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[first, ...rest].map((y) => (
          <span
            key={y}
            className={cn(
              "rounded-full border-[1.5px] px-3 py-1 text-[12px] font-semibold",
              y === initialYear
                ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange)] text-white"
                : "border-[color:var(--color-aap-surface2)] text-[color:var(--color-aap-text2)]",
            )}
          >
            {y}
          </span>
        ))}
        <button
          type="button"
          disabled
          className="ml-auto rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-1 text-[12px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
        >
          + Upload
        </button>
      </div>

      {matter.documents.length === 0 ? (
        <div className="rounded-xl border-[2px] border-dashed border-[color:var(--color-aap-surface2)] bg-white p-10 text-center">
          <div className="text-2xl">📄</div>
          <div className="mt-2 text-[14px] font-semibold">No documents yet</div>
          <div className="mt-1 text-[12px] text-[color:var(--color-aap-text2)]">
            Drag and drop a file here, or use the upload button above.
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {matter.documents.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2.5 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-aap-surface2)] text-[16px]">
                📄
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium">{d.fileName}</div>
                <div className="text-[11px] text-[color:var(--color-aap-text3)]">
                  {docCategoryLabel(d.category)}
                  {d.financialYear ? ` · ${d.financialYear}` : ""}
                  {d.uploadedByName ? ` · ${d.uploadedByName}` : ""}
                  {" · "}
                  {humanFileSize(d.fileSize)}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  d.signStatus === "SIGNED"
                    ? "bg-[color:var(--color-aap-green-light)] text-[color:var(--color-aap-green)]"
                    : d.signStatus === "AWAITING_SIGNATURE"
                    ? "bg-[color:var(--color-aap-amber-light)] text-[color:var(--color-aap-amber)]"
                    : d.signStatus === "VERIFIED"
                    ? "bg-[color:var(--color-aap-blue-light)] text-[color:var(--color-aap-blue)]"
                    : "bg-[color:var(--color-aap-surface2)] text-[color:var(--color-aap-text2)]",
                )}
              >
                {signLabel(d.signStatus)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KycTab({ matter }: { matter: MatterDTO }) {
  return (
    <div className="space-y-3">
      {matter.kycChecks.length === 0 ? (
        <div className="rounded-xl border-[2px] border-dashed border-[color:var(--color-aap-surface2)] bg-white p-10 text-center">
          <IdCard className="mx-auto h-7 w-7 text-[color:var(--color-aap-text3)]" />
          <div className="mt-2 text-[14px] font-semibold">No KYC checks yet</div>
          <div className="mt-1 text-[12px] text-[color:var(--color-aap-text2)]">
            Send each member a KYC link to start identity verification.
          </div>
        </div>
      ) : (
        matter.kycChecks.map((k) => (
          <div key={k.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold">{k.memberName}</div>
                <div className="text-[11px] text-[color:var(--color-aap-text3)]">
                  Provider: {k.provider === "AAP_NATIVE" ? "AAP Native" : "External"}
                  {k.completedAt
                    ? ` · Completed ${new Date(k.completedAt).toLocaleDateString("en-AU")}`
                    : ""}
                </div>
              </div>
              <KycStatusBadge status={k.status} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <KycCheckCell label="Identity" result={k.identityCheck} />
              <KycCheckCell label="Liveness" result={k.livenessCheck} />
              <KycCheckCell label="Adverse media" result={k.adverseMedia} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function FileNotesTab({ matter }: { matter: MatterDTO }) {
  if (matter.fileNotes.length === 0) {
    return (
      <div className="rounded-xl border-[2px] border-dashed border-[color:var(--color-aap-surface2)] bg-white p-10 text-center">
        <StickyNote className="mx-auto h-7 w-7 text-[color:var(--color-aap-text3)]" />
        <div className="mt-2 text-[14px] font-semibold">No file notes yet</div>
        <div className="mt-1 text-[12px] text-[color:var(--color-aap-text2)]">
          File notes from 3CX calls and Echo Notes transcripts will appear here automatically.
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      {matter.fileNotes.map((n) => (
        <div
          key={n.id}
          className={cn(
            "rounded-xl border bg-white px-4 py-3.5",
            n.pinned && "border-[color:var(--color-aap-amber)] bg-[#fffbeb]",
          )}
        >
          <div className="mb-2 flex items-start gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                n.type === "CALL"
                  ? "bg-[color:var(--color-aap-green-light)]"
                  : n.type === "EMAIL"
                  ? "bg-[color:var(--color-aap-blue-light)]"
                  : "bg-[color:var(--color-aap-surface2)]",
              )}
            >
              {n.type === "CALL" ? "📞" : n.type === "EMAIL" ? "✉️" : "📝"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-semibold">{n.subject}</div>
                {n.draftStatus === "PENDING_APPROVAL" ? (
                  <span className="rounded-md bg-[color:var(--color-aap-amber-light)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--color-aap-amber)]">
                    Draft — pending approval
                  </span>
                ) : null}
              </div>
              <div className="text-[11px] text-[color:var(--color-aap-text3)]">
                {n.authorName ?? "System"} · {new Date(n.createdAt).toLocaleString("en-AU")}
                {n.source !== "MANUAL" ? ` · ${sourceLabel(n.source)}` : ""}
                {n.callDurationSec ? ` · ${formatDuration(n.callDurationSec)}` : ""}
              </div>
            </div>
          </div>
          <div className="pl-10 text-[13px] text-[color:var(--color-aap-text2)] leading-6 whitespace-pre-line">
            {n.body}
          </div>
          {n.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1 pl-10">
              {n.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[color:var(--color-aap-surface2)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-aap-text2)]"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AuditTab({ matter }: { matter: MatterDTO }) {
  if (matter.auditActions.length === 0) {
    return (
      <div className="rounded-xl border-[2px] border-dashed border-[color:var(--color-aap-surface2)] bg-white p-10 text-center">
        <ScrollText className="mx-auto h-7 w-7 text-[color:var(--color-aap-text3)]" />
        <div className="mt-2 text-[14px] font-semibold">No audit events yet</div>
        <div className="mt-1 text-[12px] text-[color:var(--color-aap-text2)]">
          Significant actions on this matter (stage advances, handoffs, document signs) appear here.
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="grid grid-cols-[180px_160px_1fr_120px] gap-2 border-b bg-[color:var(--color-aap-surface)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
        <div>Timestamp</div>
        <div>User</div>
        <div>Action / Detail</div>
        <div>Reference</div>
      </div>
      {matter.auditActions.map((a) => (
        <div
          key={a.id}
          className="grid grid-cols-[180px_160px_1fr_120px] items-center gap-2 border-b border-[color:var(--color-aap-surface2)] px-4 py-2.5 text-[12px] last:border-b-0"
        >
          <div className="font-mono text-[11px] text-[color:var(--color-aap-text2)]">
            {new Date(a.createdAt).toLocaleString("en-AU")}
          </div>
          <div className="text-[12px]">{a.userName ?? "System"}</div>
          <div>
            <span className="rounded-md bg-[color:var(--color-aap-surface2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-text2)]">
              {a.action.replace(/_/g, " ")}
            </span>
            {a.details ? (
              <span className="ml-2 text-[12px] text-[color:var(--color-aap-text2)]">{a.details}</span>
            ) : null}
          </div>
          <div className="text-[11px] text-[color:var(--color-aap-text3)]">—</div>
        </div>
      ))}
    </div>
  );
}

// -------------- helpers --------------

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[color:var(--color-aap-surface2)] py-2 text-[13px] last:border-b-0">
      <div className="text-[color:var(--color-aap-text2)]">{label}</div>
      <div className="font-semibold text-[color:var(--color-aap-dark)]">{value}</div>
    </div>
  );
}

function KycStatusBadge({ status }: { status: KycStatus }) {
  const map: Record<KycStatus, { label: string; cls: string }> = {
    NOT_STARTED: { label: "Not started", cls: "bg-[color:var(--color-aap-surface2)] text-[color:var(--color-aap-text2)]" },
    IN_PROGRESS: { label: "In progress", cls: "bg-[color:var(--color-aap-blue-light)] text-[color:var(--color-aap-blue)]" },
    PASSED: { label: "Passed", cls: "bg-[color:var(--color-aap-green-light)] text-[color:var(--color-aap-green)]" },
    REVIEW: { label: "Review", cls: "bg-[color:var(--color-aap-amber-light)] text-[color:var(--color-aap-amber)]" },
    FAILED: { label: "Failed", cls: "bg-[color:var(--color-aap-red-light)] text-[color:var(--color-aap-red)]" },
  };
  const { label, cls } = map[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{label}</span>;
}

function KycCheckCell({ label, result }: { label: string; result: CheckResult | null }) {
  const cls = result === "PASS" || result === "CLEAR"
    ? "border-[color:var(--color-aap-green)] bg-[color:var(--color-aap-green-light)] text-[color:var(--color-aap-green)]"
    : result === "FAIL" || result === "FLAG"
    ? "border-[color:var(--color-aap-red)] bg-[color:var(--color-aap-red-light)] text-[color:var(--color-aap-red)]"
    : result === "RUNNING"
    ? "border-[color:var(--color-aap-amber)] bg-[color:var(--color-aap-amber-light)] text-[color:var(--color-aap-amber)]"
    : "border-[color:var(--color-aap-surface2)] bg-white text-[color:var(--color-aap-text2)]";
  return (
    <div className={`rounded-lg border px-3 py-2 ${cls}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 text-[14px] font-bold">{result ?? "—"}</div>
    </div>
  );
}

function docCategoryLabel(c: DocumentCategory): string {
  switch (c) {
    case "TRUST_DEED_ESTABLISHMENT": return "Trust Deed & Establishment";
    case "KYC_IDENTITY": return "KYC / Identity";
    case "ATO_CORRESPONDENCE": return "ATO Correspondence";
    case "ASIC_CORRESPONDENCE": return "ASIC Correspondence";
    case "TAX_RETURN": return "Tax Return";
    case "FINANCIAL_STATEMENTS": return "Financial Statements";
    case "AUDIT_REPORT": return "Audit Report";
    case "SIGNED_AGREEMENT": return "Signed Agreement";
    case "OTHER": return "Other";
  }
}

function signLabel(s: DocumentSignStatus): string {
  switch (s) {
    case "AWAITING_SIGNATURE": return "Sign";
    case "SIGNED": return "Signed";
    case "VERIFIED": return "Verified";
    case "NOT_REQUIRED": return "—";
  }
}

function sourceLabel(s: FileNoteSource): string {
  switch (s) {
    case "THREE_CX": return "3CX";
    case "ECHO_NOTES": return "Echo Notes";
    case "BIZ_GPT": return "BizGPT";
    case "MANUAL": return "Manual";
  }
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} min ${s.toString().padStart(2, "0")} sec`;
}

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function packageLabel(p: PackageTier): string {
  switch (p) {
    case "DEFAULT_PLUS_ACCOUNTING": return "Default + Accounting";
    case "UNLISTED_ASSETS": return "Unlisted Assets";
    case "BYOA": return "BYOA";
  }
}

function trusteeLabel(t: TrusteeStructure): string {
  return t === "INDIVIDUAL" ? "Individual trustees" : "Corporate trustee";
}
