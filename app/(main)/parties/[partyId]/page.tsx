import { notFound } from "next/navigation";
import { PartyDetail } from "@/components/parties/party-detail";
import { getClientPartyDetail } from "@/lib/queries/parties";

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ partyId: string }>;
}) {
  const { partyId } = await params;
  const client = await getClientPartyDetail(partyId);

  if (!client) {
    notFound();
  }

  return <PartyDetail client={client} />;
}
