import Link from "next/link";
import { notFound } from "next/navigation";
import { MatterStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  companyBadgeClass,
  companyShortName,
  stageLabel,
  stagePillClass,
} from "@/lib/display";

const STAGE_FOR_SLUG: Record<string, MatterStage> = {
  preparation: MatterStage.PREPARE,
  compliance: MatterStage.CHECK,
  lodgement: MatterStage.LODGE,
};

const SLUG_TITLE: Record<string, string> = {
  preparation: "Preparation queue",
  compliance: "Compliance queue",
  lodgement: "Lodgement queue",
};

const SLUG_DESC: Record<string, string> = {
  preparation: "Matters in the Prepare stage — bookkeeper owns: collect documents, KYC outreach, file note drafts.",
  compliance: "Matters in the Check stage — compliance officer owns: verify KYC, sign-off documents, flag issues.",
  lodgement: "Matters in the Lodge stage — tax agent owns: ATO/ASIC lodgement, final sign-off.",
};

export default async function QueuePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  const matterStage = STAGE_FOR_SLUG[stage];
  if (!matterStage) notFound();

  const matters = await prisma.matter.findMany({
    where: { stage: matterStage },
    include: {
      companyGroup: true,
      stageAssignments: { include: { staff: { include: { user: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{SLUG_TITLE[stage]}</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">{SLUG_DESC[stage]}</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr>
              {["Client / Fund", "Company", "Stage", "Owner", "Last update"].map((h) => (
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
                <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[color:var(--color-aap-text3)]">
                  Queue empty.
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
                        <div className="text-[13px] font-semibold">{m.fundName}</div>
                        <div className="text-[11px] text-[color:var(--color-aap-text3)]">{m.matterRef}</div>
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
                    <td className="px-4 py-3 text-[13px]">{owner?.user.name ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-[12px] text-[color:var(--color-aap-text2)]">
                      {new Date(m.updatedAt).toLocaleString("en-AU")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
