import { ClientCreateForm } from "@/components/clients/client-create-form";
import { prisma } from "@/lib/db";

export default async function PartyCreatePage() {
  const groups = await prisma.adviserGroup.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ClientCreateForm groups={groups} />;
}
