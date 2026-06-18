import { ClientCreateForm } from "./components/client-create-form";
import { prisma } from "@/lib/db";

export default async function PartyCreatePage() {
  const groups = await prisma.organisation.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ClientCreateForm groups={groups} />;
}
