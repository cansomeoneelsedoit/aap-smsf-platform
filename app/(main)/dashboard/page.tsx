import { getMatters } from "@/lib/queries/matters";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export default async function DashboardPage() {
  const clients = await getMatters();
  return <DashboardPageClient clients={clients} />;
}
