"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyEditForm, partyEditTitle } from "./party-edit-form";
import type { EditableParty } from "@/lib/mappers";

/** Full-page fallback for direct loads of /matters/[matterId]/party/[partyId]. */
export function PartyEditCard({
  party,
  matterId,
}: {
  party: EditableParty;
  matterId: string;
}) {
  const router = useRouter();
  const done = () => router.push(`/matters/${matterId}`);

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>{partyEditTitle(party)}</CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <PartyEditForm party={party} matterId={matterId} onDone={done} onCancel={done} />
        </CardContent>
      </Card>
    </div>
  );
}
