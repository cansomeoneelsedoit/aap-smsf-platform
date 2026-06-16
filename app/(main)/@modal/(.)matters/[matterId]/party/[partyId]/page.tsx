import { notFound } from "next/navigation";
import { PartyEditDialog } from "@/app/(main)/parties/components/party-edit-dialog";
import { mapPartyToEditable } from "@/lib/mappers";
import { getPartyById } from "@/lib/queries/parties";

export default async function PartyEditModalPage({
  params,
}: {
  params: Promise<{ matterId: string; partyId: string }>;
}) {
  const { matterId, partyId } = await params;
  const party = await getPartyById(partyId);

  if (!party) {
    notFound();
  }

  return <PartyEditDialog party={mapPartyToEditable(party)} matterId={matterId} />;
}
