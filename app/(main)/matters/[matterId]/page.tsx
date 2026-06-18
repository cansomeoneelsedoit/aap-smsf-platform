import { notFound } from "next/navigation";
import { MatterDetail } from "../components/matter-detail";
import {
  getMatterByDisplayId,
  getMatterFileNotes,
  getMatterTasks,
} from "@/lib/queries/matters";
import { getMatterDocumentsFromSharePoint } from "@/lib/queries/documents";
import {
  mapFileNoteToUi,
  mapMatterContacts,
  mapMatterDocumentToUi,
  mapMatterToSummary,
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

  const [tasks, fileNotes, documents] = await Promise.all([
    getMatterTasks(matter.id),
    getMatterFileNotes(matter.id),
    getMatterDocumentsFromSharePoint(matterId),
  ]);

  return (
    <MatterDetail
      matterId={matterId}
      matter={mapMatterToSummary(matter)}
      contacts={mapMatterContacts(matter.client)}
      tasks={tasks.map(mapTaskToUi)}
      fileNotes={fileNotes.map(mapFileNoteToUi)}
      documents={documents.map(mapMatterDocumentToUi)}
    />
  );
}
