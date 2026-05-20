import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Document, DocumentCategory } from "@prisma/client";

const CATEGORY_ORDER: DocumentCategory[] = [
  "TRUST_DEED_ESTABLISHMENT",
  "KYC_IDENTITY",
  "SIGNED_AGREEMENT",
  "TAX_RETURN",
  "FINANCIAL_STATEMENTS",
  "AUDIT_REPORT",
  "ATO_CORRESPONDENCE",
  "ASIC_CORRESPONDENCE",
  "OTHER",
];

const CATEGORY_ICON: Record<DocumentCategory, string> = {
  TRUST_DEED_ESTABLISHMENT: "📋",
  KYC_IDENTITY: "🪪",
  SIGNED_AGREEMENT: "✍️",
  TAX_RETURN: "🧾",
  FINANCIAL_STATEMENTS: "💰",
  AUDIT_REPORT: "📊",
  ATO_CORRESPONDENCE: "📬",
  ASIC_CORRESPONDENCE: "🏛️",
  OTHER: "📄",
};

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  TRUST_DEED_ESTABLISHMENT: "Trust Deed & Establishment",
  KYC_IDENTITY: "KYC / Identity",
  SIGNED_AGREEMENT: "Signed Agreement",
  TAX_RETURN: "Tax Return",
  FINANCIAL_STATEMENTS: "Financial Statements",
  AUDIT_REPORT: "Audit Report",
  ATO_CORRESPONDENCE: "ATO Correspondence",
  ASIC_CORRESPONDENCE: "ASIC Correspondence",
  OTHER: "Other",
};

export default async function PortalDocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: {
      matters: {
        include: { documents: { orderBy: { uploadedAt: "desc" } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  const docs = client?.matters[0]?.documents ?? [];

  // Group by category
  const grouped: Record<DocumentCategory, Document[]> = {} as Record<DocumentCategory, Document[]>;
  for (const d of docs) {
    (grouped[d.category] ??= []).push(d);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold">Your documents</h2>

      <div className="cursor-pointer rounded-xl border-[2px] border-dashed border-[color:var(--color-aap-surface2)] bg-white p-8 text-center transition-colors hover:border-[color:var(--color-aap-orange)] hover:bg-[color:var(--color-aap-orange-light)]">
        <div className="text-2xl">📤</div>
        <div className="mt-2 text-[14px] font-semibold">Click or drag to upload documents</div>
        <p className="mt-1 text-[12px] text-[color:var(--color-aap-text2)]">PDF, JPG, PNG — max 20MB</p>
      </div>

      {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((c) => (
        <div key={c}>
          <div className="mb-1.5 flex items-center justify-between border-b py-2 text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
            <span>{CATEGORY_LABEL[c]}</span>
            <span>{grouped[c].length}</span>
          </div>
          <div className="space-y-1.5">
            {grouped[c].map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-aap-surface2)] text-base">
                  {CATEGORY_ICON[c]}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{d.fileName}</div>
                  <div className="text-[11px] text-[color:var(--color-aap-text3)]">
                    {humanFileSize(d.fileSize)} ·{" "}
                    {new Date(d.uploadedAt).toLocaleDateString("en-AU")}
                    {d.signStatus === "VERIFIED" ? (
                      <span className="ml-1 text-[color:var(--color-aap-green)]">· Verified ✓</span>
                    ) : d.signStatus === "SIGNED" ? (
                      <span className="ml-1 text-[color:var(--color-aap-blue)]">· Signed</span>
                    ) : null}
                  </div>
                </div>
                {d.signStatus === "AWAITING_SIGNATURE" ? (
                  <button
                    type="button"
                    className="rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
                  >
                    ✍️ Sign
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      {docs.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-[13px] text-[color:var(--color-aap-text3)]">
          No documents yet. Upload your first one above.
        </div>
      ) : null}
    </div>
  );
}

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
