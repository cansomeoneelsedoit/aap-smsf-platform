"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePartyAction } from "@/lib/actions/client-actions";
import type { EditableParty } from "@/lib/mappers";

const TYPE_LABELS: Record<EditableParty["type"], string> = {
  PERSON: "Person",
  COMPANY: "Company",
  TRUST: "Trust",
};

export function partyEditTitle(party: EditableParty): string {
  return `Edit ${TYPE_LABELS[party.type].toLowerCase()} — ${party.name}`;
}

export function PartyEditForm({
  party,
  matterId,
  onDone,
  onCancel,
}: {
  party: EditableParty;
  matterId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(party.firstName ?? "");
  const [lastName, setLastName] = useState(party.lastName ?? "");
  const [email, setEmail] = useState(party.email ?? "");
  const [phone, setPhone] = useState(party.phone ?? "");
  const [name, setName] = useState(party.name);
  const [acn, setAcn] = useState(party.acn ?? "");
  const [abn, setAbn] = useState(party.abn ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updatePartyAction(
        party.id,
        matterId,
        party.type === "PERSON"
          ? { firstName, lastName, email, phone }
          : party.type === "COMPANY"
            ? { name, acn }
            : { name, abn }
      );

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Details updated");
        onDone();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {party.type === "PERSON" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div><Label>Last name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Phone number</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0412 345 678" /></div>
          </>
        ) : (
          <>
            <div>
              <Label>{party.type === "COMPANY" ? "Company name" : "Trust name"}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {party.type === "COMPANY" ? (
              <div><Label>ACN</Label><Input value={acn} onChange={(e) => setAcn(e.target.value)} placeholder="e.g. 634 789 123" /></div>
            ) : (
              <div><Label>ABN</Label><Input value={abn} onChange={(e) => setAbn(e.target.value)} placeholder="e.g. 12 345 678 901" /></div>
            )}
          </>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </>
  );
}
