import { notFound } from "next/navigation";
import { PartyEditCard } from "@/components/parties/party-edit-card";
import { mapPartyToEditable } from "@/lib/mappers";
import { getPartyById } from "@/lib/queries/parties";

export default async function PartyEditPage({
  params,
}: {
  params: Promise<{ matterId: string; partyId: string }>;
}) {
  const { matterId, partyId } = await params;
  const party = await getPartyById(partyId);

  if (!party) {
    notFound();
  }

  return <PartyEditCard party={mapPartyToEditable(party)} matterId={matterId} />;
}
