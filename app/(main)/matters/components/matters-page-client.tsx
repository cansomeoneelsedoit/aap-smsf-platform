"use client";

import { useMemo, useState } from "react";
import { MattersTable } from "./matters-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/hooks/use-mock-store";
import type { MatterSummary } from "@/lib/types";

export function MattersPageClient({ matters }: { matters: MatterSummary[] }) {
  const openModal = useMockStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = useMemo(() => {
    return matters.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.organisation.toLowerCase().includes(q);
      const matchStage = !stageFilter || m.stage === stageFilter;
      const matchGroup = !groupFilter || m.organisation === groupFilter;
      return matchSearch && matchStage && matchGroup;
    });
  }, [matters, search, stageFilter, groupFilter]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          className="min-w-[200px] flex-1"
          placeholder="Search matters, fund name, matter ID…"
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
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">All organisations</option>
          {["Clime ASX", "Liberty", "RiverX", "AAP"].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => openModal("new-matter")}>
          + New matter
        </Button>
      </div>
      <Card>
        <MattersTable matters={filtered} />
      </Card>
    </>
  );
}
