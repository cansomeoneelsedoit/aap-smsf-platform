"use client";

import { useMemo, useState } from "react";
import { ClientsTable } from "@/components/clients/clients-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/hooks/use-mock-store";
import type { Client } from "@/lib/types";

export function ClientsPageClient({ clients }: { clients: Client[] }) {
  const openModal = useMockStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);
      const matchStage = !stageFilter || c.stage === stageFilter;
      const matchCompany = !companyFilter || c.company === companyFilter;
      return matchSearch && matchStage && matchCompany;
    });
  }, [clients, search, stageFilter, companyFilter]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          className="min-w-[200px] flex-1"
          placeholder="Search clients, ABN, fund name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-brand-sm border-[1.5px] border-brand-border-2 bg-white px-2.5 text-[13px]"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All stages</option>
          {["Start", "Prepare", "Check", "Lodge", "Active"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-brand-sm border-[1.5px] border-brand-border-2 bg-white px-2.5 text-[13px]"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">All companies</option>
          {["Clime ASX", "Liberty", "RiverX", "AAP"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => openModal("new-matter")}>
          + New client
        </Button>
      </div>
      <Card>
        <ClientsTable clients={filtered} />
      </Card>
    </>
  );
}
