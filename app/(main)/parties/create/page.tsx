import { ClientCreateForm } from "./components/client-create-form";
import { prisma } from "@/lib/db";

export default async function PartyCreatePage() {
  const organisations = await prisma.organisation.findMany({
    select: {
      id: true,
      name: true,
      microsoftIntegration: {
        select: { microsoftTenantId: true, sharepointSiteId: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const groups = organisations.map((organisation) => ({
    id: organisation.id,
    name: organisation.name,
    hasSharePoint: Boolean(
      organisation.microsoftIntegration?.microsoftTenantId &&
        organisation.microsoftIntegration?.sharepointSiteId
    ),
  }));

  return <ClientCreateForm groups={groups} />;
}
