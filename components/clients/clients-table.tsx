"use client";

import Link from "next/link";
import { AdviserGroupBadge } from "@/components/brand/adviser-group-badge";
import { StagePill } from "@/components/brand/stage-pill";
import type { MatterSummary } from "@/lib/types";

export function ClientsTable({ matters }: { matters: MatterSummary[] }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-brand-surface text-left text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          <th className="border-b border-brand-border px-4 py-2.5">Client / Fund</th>
          <th className="border-b border-brand-border px-4 py-2.5">Adviser group</th>
          <th className="border-b border-brand-border px-4 py-2.5">Type</th>
          <th className="border-b border-brand-border px-4 py-2.5">Stage</th>
          <th className="border-b border-brand-border px-4 py-2.5">Owner</th>
          <th className="border-b border-brand-border px-4 py-2.5">Due</th>
        </tr>
      </thead>
      <tbody>
        {matters.map((m) => (
          <tr key={m.id} className="cursor-pointer hover:bg-[#fafafa]">
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <Link href={`/matter/${m.id}`} className="block">
                <div className="font-semibold text-brand-dark">{m.name}</div>
                <div className="text-[11px] text-brand-text-3">{m.sub}</div>
              </Link>
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <AdviserGroupBadge name={m.adviserGroup} cbClass={m.cbClass} />
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5 text-[13px]">{m.type}</td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <StagePill stage={m.stage} pillClass={m.pillClass} />
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5 text-[13px]">{m.owner}</td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5 text-[13px]">{m.due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
