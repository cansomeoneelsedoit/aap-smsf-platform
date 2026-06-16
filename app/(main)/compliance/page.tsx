import { QueueList } from "../components/queue-list";
import { getMattersByStage } from "@/lib/queries/matters";

export default async function CompliancePage() {
  const matters = await getMattersByStage("Check");

  return (
    <QueueList
      intro="Matters in compliance review."
      items={matters.map((m) => ({
        matterId: m.id,
        priority: "med" as const,
        title: `${m.name} — compliance review`,
        sub: `${m.type} · ${m.owner}`,
        meta: `Due ${m.due}`,
      }))}
    />
  );
}
