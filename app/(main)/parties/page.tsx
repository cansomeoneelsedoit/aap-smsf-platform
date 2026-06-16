import { getClientPartySummaries } from "@/lib/queries/parties";
import { PartiesPageClient } from "./components/parties-page-client";

export default async function PartiesPage() {
  const clients = await getClientPartySummaries();
  return <PartiesPageClient clients={clients} />;
}
