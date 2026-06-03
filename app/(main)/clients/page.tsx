import { getMatters } from "@/lib/queries/matters";
import { ClientsPageClient } from "@/components/clients/clients-page-client";

export default async function ClientsPage() {
  const clients = await getMatters();
  return <ClientsPageClient clients={clients} />;
}
