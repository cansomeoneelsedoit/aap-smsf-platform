import { getOrganisations } from "@/lib/queries/matters";
import { mapOrganisationToUi } from "@/lib/mappers";
import { CompaniesPageClient } from "./components/companies-page-client";

export default async function CompaniesPage() {
  const groups = await getOrganisations();
  return <CompaniesPageClient groups={groups.map(mapOrganisationToUi)} />;
}
