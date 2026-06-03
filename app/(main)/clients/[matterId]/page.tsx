import { notFound } from "next/navigation";
import { MatterDetail } from "@/components/matters/matter-detail";
import {
  getMatterByDisplayId,
  getMatterFileNotes,
  getMatterTasks,
} from "@/lib/queries/matters";
import {
  mapFileNoteToUi,
  mapMatterToClient,
  mapTaskToUi,
} from "@/lib/mappers";

export default async function MatterDetailPage({
  params,
}: {
  params: Promise<{ matterId: string }>;
}) {
  const { matterId } = await params;
  const matter = await getMatterByDisplayId(matterId);

  if (!matter) {
    notFound();
  }

  const [tasks, fileNotes] = await Promise.all([
    getMatterTasks(matter.id),
    getMatterFileNotes(matter.id),
  ]);

  return (
    <MatterDetail
      matterId={matterId}
      client={mapMatterToClient(matter)}
      tasks={tasks.map(mapTaskToUi)}
      fileNotes={fileNotes.map(mapFileNoteToUi)}
    />
  );
}
