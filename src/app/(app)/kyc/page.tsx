import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckResult, KycStatus } from "@prisma/client";

const STATUS_TONE: Record<KycStatus, string> = {
  NOT_STARTED: "bg-[color:var(--color-aap-surface2)] text-[color:var(--color-aap-text2)]",
  IN_PROGRESS: "bg-[color:var(--color-aap-blue-light)] text-[color:var(--color-aap-blue)]",
  PASSED: "bg-[color:var(--color-aap-green-light)] text-[color:var(--color-aap-green)]",
  REVIEW: "bg-[color:var(--color-aap-amber-light)] text-[color:var(--color-aap-amber)]",
  FAILED: "bg-[color:var(--color-aap-red-light)] text-[color:var(--color-aap-red)]",
};

function resultDot(r: CheckResult | null): string {
  if (r === "PASS" || r === "CLEAR") return "bg-[color:var(--color-aap-green)]";
  if (r === "FAIL" || r === "FLAG") return "bg-[color:var(--color-aap-red)]";
  if (r === "RUNNING") return "bg-[color:var(--color-aap-amber)] animate-pulse";
  return "bg-[color:var(--color-aap-surface2)]";
}

export default async function KycPage() {
  const checks = await prisma.kycCheck.findMany({
    include: { matter: { include: { companyGroup: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">KYC checks</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">
          Identity, liveness, and adverse media checks across all matters. Powered by AAP Native KYC.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr>
              {["Member", "Matter", "Status", "Identity", "Liveness", "Adverse", "Provider"].map((h) => (
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
            {checks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-[color:var(--color-aap-text3)]">
                  No KYC checks yet.
                </td>
              </tr>
            ) : (
              checks.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-[color:var(--color-aap-surface2)] last:border-b-0 hover:bg-[#fafafa]"
                >
                  <td className="px-4 py-3 text-[13px] font-semibold">{k.memberName}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <Link href={`/matters/${k.matter.id}?tab=kyc`} className="hover:text-[color:var(--color-aap-orange)]">
                      {k.matter.fundName}
                    </Link>
                    <div className="text-[10px] text-[color:var(--color-aap-text3)]">{k.matter.matterRef}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_TONE[k.status]}`}
                    >
                      {k.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${resultDot(k.identityCheck)}`} />
                    <span className="ml-2 text-[12px]">{k.identityCheck ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${resultDot(k.livenessCheck)}`} />
                    <span className="ml-2 text-[12px]">{k.livenessCheck ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${resultDot(k.adverseMedia)}`} />
                    <span className="ml-2 text-[12px]">{k.adverseMedia ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[color:var(--color-aap-text2)]">
                    {k.provider === "AAP_NATIVE" ? "AAP Native" : "External"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
