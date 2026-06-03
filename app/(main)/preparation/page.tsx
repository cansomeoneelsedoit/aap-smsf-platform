import { QueueList } from "@/components/queues/queue-list";
import { getMattersByStage } from "@/lib/queries/matters";

export default async function PreparationPage() {
  const matters = await getMattersByStage("Prepare");

  return (
    <QueueList
      intro="Matters in preparation — bookkeeper work in progress."
      items={matters.map((m) => ({
        matterId: m.id,
        priority: m.stage === "Prepare" ? ("med" as const) : ("low" as const),
        title: `${m.name} — ${m.type}`,
        sub: `${m.type} · ${m.owner}`,
        meta: `Due ${m.due}`,
      }))}
    />
  );
}
