"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdviserGroupBadge } from "@/components/brand/adviser-group-badge";
import { StagePill } from "@/components/brand/stage-pill";
import { CardEditButton } from "./card-edit-button";
import { PartyTrusteesCard } from "./party-trustees-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockStore } from "@/hooks/use-mock-store";
import { updatePartyAction } from "@/lib/actions/client-actions";
import type { ClientPartyDetailUi } from "@/lib/mappers";
import type { ClientMatterSummary } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-[13px]">
      <span className="text-brand-text-2">{label}</span>
      <span className="text-right font-semibold text-brand-dark">{value}</span>
    </div>
  );
}

function MattersSection({
  title,
  matters,
  emptyMessage,
}: {
  title: string;
  matters: ClientMatterSummary[];
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader className="border-b-0 pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {matters.length === 0 ? (
          <p className="text-[13px] text-brand-text-3">{emptyMessage}</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
                <th className="pb-2.5">Matter</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">Stage</th>
              </tr>
            </thead>
            <tbody>
              {matters.map((m) => (
                <tr key={m.id} className="group">
                  <td className="py-2.5">
                    <Link
                      href={`/matters/${m.id}`}
                      className="font-semibold text-brand-dark group-hover:underline"
                    >
                      {m.name}
                    </Link>
                    <div className="text-[11px] text-brand-text-3">{m.id}</div>
                  </td>
                  <td className="py-2.5 text-[13px]">{m.type}</td>
                  <td className="py-2.5">
                    <StagePill stage={m.stage} pillClass={m.pillClass} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

function ClientDetailsCard({
  clientId,
  name,
  abn,
}: {
  clientId: string;
  name: string;
  abn: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAbn, setEditAbn] = useState(abn ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEditName(name);
      setEditAbn(abn ?? "");
    }
  }, [open, name, abn]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updatePartyAction(clientId, "", { name: editName, abn: editAbn });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Client details updated");
        setOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardTitle>Client details</CardTitle>
          <CardEditButton onClick={() => setOpen(true)} />
        </CardHeader>
        <CardContent className="pt-4">
          <DetailRow label="Fund name" value={name} />
          <DetailRow label="ABN" value={abn ?? "Not recorded"} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Edit client details</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div>
              <Label>Fund name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>ABN</Label>
              <Input
                value={editAbn}
                onChange={(e) => setEditAbn(e.target.value)}
                placeholder="e.g. 12 345 678 901"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PartyDetail({ client }: { client: ClientPartyDetailUi }) {
  const openModal = useMockStore((s) => s.openModal);
  const setPreselectedMatterClient = useMockStore((s) => s.setPreselectedMatterClient);

  const handleNewMatter = () => {
    setPreselectedMatterClient({
      partyId: client.id,
      type: "TRUST",
      name: client.name,
      detail: client.abn ? `ABN ${client.abn}` : null,
    });
    openModal("new-matter");
  };

  return (
    <>
      <Link href="/clients">
        <Button variant="outline" size="xs" className="mb-3.5">
          ← Back to clients
        </Button>
      </Link>

      <Card className="mb-4 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <AdviserGroupBadge name={client.adviserGroup} cbClass={client.cbClass} />
        </div>
        <h2 className="text-[22px] font-extrabold tracking-tight">{client.name}</h2>
        <p className="text-[13px] text-brand-text-2">
          {client.abn ? `ABN ${client.abn}` : "ABN not recorded"}
        </p>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ClientDetailsCard clientId={client.id} name={client.name} abn={client.abn} />
        <PartyTrusteesCard clientPartyId={client.id} contacts={client.contacts} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-dark">Matters</h3>
        <Button size="sm" onClick={handleNewMatter}>+ New matter</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <MattersSection
            title="Current matters"
            matters={client.currentMatters}
            emptyMessage="No matters in progress for this client."
          />
          <MattersSection
            title="Previous matters"
            matters={client.previousMatters}
            emptyMessage="No completed matters for this client yet."
          />
        </div>
      </div>
    </>
  );
}
