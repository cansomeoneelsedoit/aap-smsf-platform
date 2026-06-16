import { getMatters } from "@/lib/queries/matters";
import { MattersPageClient } from "./components/matters-page-client";

export default async function MattersPage() {
  const matters = await getMatters();
  return <MattersPageClient matters={matters} />;
}
