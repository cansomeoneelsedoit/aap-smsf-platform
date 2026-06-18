import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { getOrganisations } from "@/lib/queries/matters";
import { mapOrganisationToUi } from "@/lib/mappers";
import { OrganisationsPageClient } from "./components/organisations-page-client";

export default async function OrganisationsPage() {
  const session = await getAppSession();

  if (!session?.user || session.user.staffRole !== "MASTER_OWNER") {
    redirect("/dashboard");
  }

  const organisations = await getOrganisations();

  return (
    <OrganisationsPageClient organisations={organisations.map(mapOrganisationToUi)} />
  );
}
