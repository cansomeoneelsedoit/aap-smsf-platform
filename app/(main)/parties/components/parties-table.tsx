"use client";

import { useRouter } from "next/navigation";
import { OrganisationBadge } from "@/components/brand/organisation-badge";
import type { ClientSummary } from "@/lib/types";

export function PartiesTable({ clients }: { clients: ClientSummary[] }) {
  const router = useRouter();

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-brand-surface text-left text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
          <th className="border-b border-brand-border px-4 py-2.5">Client / Fund</th>
          <th className="border-b border-brand-border px-4 py-2.5">Organisation</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr
            key={c.id}
            className="cursor-pointer hover:bg-[#fafafa]"
            onClick={() => router.push(`/clients/${c.id}`)}
          >
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <div className="font-semibold text-brand-dark">{c.name}</div>
              {c.abn && (
                <div className="text-[11px] text-brand-text-3">ABN {c.abn}</div>
              )}
            </td>
            <td className="border-b border-brand-surface-2 px-4 py-2.5">
              <OrganisationBadge name={c.organisation} cbClass={c.cbClass} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
