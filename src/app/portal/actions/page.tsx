import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KycStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export default async function PortalActionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: {
      matters: {
        include: {
          kycChecks: { orderBy: { createdAt: "asc" } },
          documents: { where: { signStatus: { in: ["AWAITING_SIGNATURE", "SIGNED", "VERIFIED"] } }, orderBy: { uploadedAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  const matter = client?.matters[0];

  const pendingKyc = matter?.kycChecks.filter(
    (k) => k.status === KycStatus.NOT_STARTED || k.status === KycStatus.IN_PROGRESS || k.status === KycStatus.REVIEW,
  ) ?? [];
  const completedKyc = matter?.kycChecks.filter((k) => k.status === KycStatus.PASSED) ?? [];
  const awaitingSig = matter?.documents.filter((d) => d.signStatus === "AWAITING_SIGNATURE") ?? [];
  const signedDocs = matter?.documents.filter((d) => d.signStatus === "SIGNED" || d.signStatus === "VERIFIED") ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold">Actions required from you</h2>

      <div className="space-y-3">
        {pendingKyc.map((k) => (
          <ActionRow
            key={k.id}
            tone="amber"
            icon="🪪"
            title={`Complete KYC — ${k.memberName}`}
            description="Identity verification required. Takes about 5 minutes on your phone."
            cta="Start KYC →"
          />
        ))}
        {awaitingSig.map((d) => (
          <ActionRow
            key={d.id}
            tone="neutral"
            icon="✍️"
            title={`Sign ${d.fileName}`}
            description="Review and sign the document."
            cta="Sign now →"
          />
        ))}
        {pendingKyc.length === 0 && awaitingSig.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center text-[13px] text-[color:var(--color-aap-text2)]">
            🎉 You&apos;re all caught up — no actions pending from your side.
          </div>
        ) : null}

        {completedKyc.map((k) => (
          <ActionRow
            key={k.id}
            tone="done"
            icon="✓"
            title={`${k.memberName} — KYC complete`}
            description={
              k.completedAt
                ? `Completed ${new Date(k.completedAt).toLocaleDateString("en-AU")}`
                : "Completed"
            }
          />
        ))}
        {signedDocs.map((d) => (
          <ActionRow
            key={d.id}
            tone="done"
            icon="✓"
            title={`${d.fileName} — signed`}
            description={d.signStatus === "VERIFIED" ? "Verified by compliance" : "Awaiting verification"}
          />
        ))}
      </div>
    </div>
  );
}

function ActionRow({
  tone,
  icon,
  title,
  description,
  cta,
}: {
  tone: "amber" | "neutral" | "done";
  icon: string;
  title: string;
  description: string;
  cta?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3.5",
        tone === "amber" && "border-[2px] border-[color:var(--color-aap-amber)] bg-[color:var(--color-aap-amber-light)]",
        tone === "neutral" && "border-[1.5px] border-[color:var(--color-aap-surface2)] bg-white",
        tone === "done" && "border-[1.5px] border-[color:var(--color-aap-surface2)] bg-white opacity-60",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl",
          tone === "amber" && "bg-white",
          tone === "neutral" && "bg-[color:var(--color-aap-surface)]",
          tone === "done" && "bg-[color:var(--color-aap-green-light)] text-[color:var(--color-aap-green)] text-base font-bold",
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold">{title}</div>
        <div
          className={cn(
            "mt-0.5 text-[12px]",
            tone === "done"
              ? "text-[color:var(--color-aap-green)]"
              : "text-[color:var(--color-aap-text2)]",
          )}
        >
          {description}
        </div>
      </div>
      {cta ? (
        <button
          type="button"
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-[12px] font-semibold",
            tone === "amber"
              ? "bg-[color:var(--color-aap-amber)] text-white hover:opacity-90"
              : "border border-[color:var(--color-aap-surface2)] bg-white text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]",
          )}
        >
          {cta}
        </button>
      ) : null}
    </div>
  );
}
