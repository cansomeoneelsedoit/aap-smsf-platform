"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockStore } from "@/hooks/use-mock-store";
import type { AdviserGroup } from "@/lib/types";

export function CompaniesPageClient({ groups }: { groups: AdviserGroup[] }) {
  const openModal = useMockStore((s) => s.openModal);

  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <Button size="sm" onClick={() => openModal("new-company")}>
          + Add adviser group
        </Button>
      </div>
      <div className="grid gap-3.5 md:grid-cols-3">
        {groups.map((co) => (
          <Card key={co.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <Link href={`/matters?group=${encodeURIComponent(co.name)}`} className="block p-5">
              <div className="mb-3.5 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-brand-sm text-lg font-extrabold"
                  style={{ background: co.bgColor, color: co.textColor }}
                >
                  {co.letter}
                </div>
                <div>
                  <div className="text-[15px] font-bold">{co.name}</div>
                  <div className="text-xs text-brand-text-2">{co.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="font-semibold text-brand-text-3">CLIENTS</div>
                  <div className="text-xl font-extrabold">{co.clients}</div>
                </div>
                <div>
                  <div className="font-semibold text-brand-text-3">ACTIVE</div>
                  <div className="text-xl font-extrabold text-brand-green">{co.active}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-brand-text-2">{co.contact}</div>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
