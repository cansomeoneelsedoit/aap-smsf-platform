import { notFound, redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { getOrganisationById } from "@/lib/queries/matters";
import { mapOrganisationToUi } from "@/lib/mappers";
import { OrganisationDetailClient } from "./components/organisation-detail-client";

export default async function OrganisationDetailPage({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const session = await getAppSession();

  if (!session?.user || session.user.staffRole !== "MASTER_OWNER") {
    redirect("/dashboard");
  }

  const { organisationId } = await params;
  const organisation = await getOrganisationById(organisationId);

  if (!organisation) {
    notFound();
  }

  const ui = mapOrganisationToUi(organisation);

  return (
    <OrganisationDetailClient
      organisation={{
        id: ui.id,
        name: ui.name,
        description: ui.description,
        contactName: organisation.contactName,
        contactEmail: organisation.contactEmail,
        letter: ui.letter,
        bgColor: ui.bgColor,
        textColor: ui.textColor,
        clients: ui.clients,
        active: ui.active,
        microsoftIntegration: organisation.microsoftIntegration
          ? {
              organisationId: organisation.microsoftIntegration.organisationId,
              microsoftTenantId: organisation.microsoftIntegration.microsoftTenantId,
              sharepointSiteId: organisation.microsoftIntegration.sharepointSiteId,
              sharepointDriveId: organisation.microsoftIntegration.sharepointDriveId,
            }
          : null,
      }}
    />
  );
}
