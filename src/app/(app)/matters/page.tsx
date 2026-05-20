import Link from "next/link";
import { MatterStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  companyBadgeClass,
  companyShortName,
  stageLabel,
  stagePillClass,
} from "@/lib/display";

const STAGE_FILTERS: (MatterStage | "ALL")[] = [
  "ALL",
  MatterStage.START,
  MatterStage.PREPARE,
  MatterStage.CHECK,
  MatterStage.LODGE,
  MatterStage.ACTIVE,
];

export default async function MattersPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; q?: string }>;
}) {
  const { stage, q } = await searchParams;
  const where = stage && stage !== "ALL" ? { stage: stage as MatterStage } : {};
  const matters = await prisma.matter.findMany({
    where: {
      ...where,
      ...(q
        ? {
            OR: [
              { matterRef: { contains: q, mode: "insensitive" as const } },
              { fundName: { contains: q, mode: "insensitive" as const } },
              { abn: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      companyGroup: true,
      primaryContact: true,
      stageAssignments: { include: { staff: { include: { user: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form className="flex flex-1 items-center gap-2" action="/matters" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search clients, ABN, fund name…"
            className="min-w-[200px] flex-1 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-2 text-[13px] outline-none focus:border-[color:var(--color-aap-orange)]"
          />
          <select
            name="stage"
            defaultValue={stage ?? "ALL"}
            className="rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[color:var(--color-aap-orange)]"
          >
            {STAGE_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All stages" : stageLabel(s as MatterStage)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[color:var(--color-aap-orange)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)]"
          >
            Filter
          </button>
        </form>
        <Link
          href="/onboarding"
          className="rounded-lg bg-[color:var(--color-aap-orange)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)]"
        >
          + New client
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr>
              {["Client / Fund", "Company", "Type", "Stage", "Owner", "Due"].map((h) => (
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
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[13px] text-[color:var(--color-aap-text3)]"
                >
                  No matters match those filters.
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
                          {m.matterRef}
                          {m.abn ? ` · ABN ${m.abn}` : ""}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={companyBadgeClass(m.companyGroup?.name)}>
                        {companyShortName(m.companyGroup)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">{matterTypeShort(m.matterType)}</td>
                    <td className="px-4 py-3">
                      <span className={stagePillClass(m.stage)}>{stageLabel(m.stage)}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {owner?.user.name ? shortName(owner.user.name) : "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[color:var(--color-aap-text2)]">—</td>
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

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function matterTypeShort(t: string): string {
  switch (t) {
    case "NEW_SMSF_SETUP":
      return "New SMSF";
    case "EXISTING_ONBOARDING":
      return "Existing";
    case "CORPORATE_TRUSTEE_SETUP":
      return "Corp Trustee";
    default:
      return t;
  }
}
