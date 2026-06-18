import { notFound } from "next/navigation";
import { MatterDetail } from "../components/matter-detail";
import { getAppSession } from "@/lib/auth";
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
  const session = await getAppSession();
  const matter = await getMatterByDisplayId(matterId);

  if (!matter) {
    notFound();
  }

  const [tasks, fileNotes, documents] = await Promise.all([
    getMatterTasks(matter.id),
    getMatterFileNotes(matter.id),
    session?.user
      ? getMatterDocumentsFromSharePoint(matterId, session.user.id)
      : Promise.resolve([]),
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
