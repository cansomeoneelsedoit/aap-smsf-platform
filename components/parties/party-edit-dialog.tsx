"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartyEditForm, partyEditTitle } from "@/components/parties/party-edit-form";
import type { EditableParty } from "@/lib/mappers";

/** Intercepted-route dialog rendered in the (main) layout's @modal slot. */
export function PartyEditDialog({
  party,
  matterId,
}: {
  party: EditableParty;
  matterId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const close = () => {
    setOpen(false);
    router.back();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{partyEditTitle(party)}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>
          <PartyEditForm party={party} matterId={matterId} onDone={close} onCancel={close} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
