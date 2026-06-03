"use client";

import Link from "next/link";
import { CompanyBadge } from "@/components/brand/company-badge";
import { StagePill } from "@/components/brand/stage-pill";
import type { Client } from "@/lib/types";

export function ClientsTable({ clients }: { clients: Client[] }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-brand-surface text-left text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          <th className="border-b border-brand-border px-4 py-2.5">Client / Fund</th>
          <th className="border-b border-brand-border px-4 py-2.5">Company</th>
          <th className="border-b border-brand-border px-4 py-2.5">Type</th>
          <th className="border-b border-brand-border px-4 py-2.5">Stage</th>
          <th className="border-b border-brand-border px-4 py-2.5">Owner</th>
          <th className="border-b border-brand-border px-4 py-2.5">Due</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr key={c.id} className="cursor-pointer hover:bg-[#fafafa]">
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <Link href={`/clients/${c.id}`} className="block">
                <div className="font-semibold text-brand-dark">{c.name}</div>
                <div className="text-[11px] text-brand-text-3">{c.sub}</div>
              </Link>
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <CompanyBadge company={c.company} cbClass={c.cbClass} />
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5 text-[13px]">{c.type}</td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <StagePill stage={c.stage} pillClass={c.pillClass} />
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5 text-[13px]">{c.owner}</td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5 text-[13px]">{c.due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
