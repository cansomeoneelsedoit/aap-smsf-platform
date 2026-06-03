import { getCompanies } from "@/lib/queries/matters";
import { mapCompanyToUi } from "@/lib/mappers";
import { CompaniesPageClient } from "@/components/companies/companies-page-client";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompaniesPageClient companies={companies.map(mapCompanyToUi)} />;
}
