"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PartiesTable } from "./parties-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ClientSummary } from "@/lib/types";

export function PartiesPageClient({ clients }: { clients: ClientSummary[] }) {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.abn?.toLowerCase().includes(q) ?? false) ||
        c.adviserGroup.toLowerCase().includes(q);
      const matchGroup = !groupFilter || c.adviserGroup === groupFilter;
      return matchSearch && matchGroup;
    });
  }, [clients, search, groupFilter]);

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
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">All adviser groups</option>
          {["Clime ASX", "Liberty", "RiverX", "AAP"].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <Button size="sm" asChild>
          <Link href="/clients/create">+ New client</Link>
        </Button>
      </div>
      <Card>
        <PartiesTable clients={filtered} />
      </Card>
    </>
  );
}
