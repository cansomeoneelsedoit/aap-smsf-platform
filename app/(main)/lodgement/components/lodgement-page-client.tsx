"use client";

import { QueueList } from "../../components/queue-list";
import { useMatterActions } from "@/hooks/use-mock-store";
import type { MatterSummary } from "@/lib/types";

export function LodgementPageClient({ matters }: { matters: MatterSummary[] }) {
  const { mockLodge } = useMatterActions();

  return (
    <QueueList
      intro="Matters ready for lodgement."
      items={matters.map((m) => ({
        matterId: m.id,
        priority: "high" as const,
        title: `${m.name} — lodgement ready`,
        sub: `${m.type} · ${m.owner}`,
        meta: `Due ${m.due}`,
        action: "Lodge (mock)",
        onAction: () => mockLodge(m.id),
      }))}
    />
  );
}
