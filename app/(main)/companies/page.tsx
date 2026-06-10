import { getAdviserGroups } from "@/lib/queries/matters";
import { mapAdviserGroupToUi } from "@/lib/mappers";
import { CompaniesPageClient } from "@/components/companies/companies-page-client";

export default async function CompaniesPage() {
  const groups = await getAdviserGroups();
  return <CompaniesPageClient groups={groups.map(mapAdviserGroupToUi)} />;
}
