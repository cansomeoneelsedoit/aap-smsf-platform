import { getMattersByStage } from "@/lib/queries/matters";
import { LodgementPageClient } from "@/components/queues/lodgement-page-client";

export default async function LodgementPage() {
  const matters = await getMattersByStage("Lodge");
  return <LodgementPageClient matters={matters} />;
}
