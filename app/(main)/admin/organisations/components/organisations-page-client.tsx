"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { createOrganisationAction } from "@/lib/actions/organisation-actions";
import type { Organisation } from "@/lib/types";

export function OrganisationsPageClient({ organisations }: { organisations: Organisation[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setContactName("");
    setContactEmail("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Organisation name is required");
      return;
    }

    setSaving(true);
    try {
      const result = await createOrganisationAction({
        name,
        description,
        contactName,
        contactEmail,
      });
      toast.success("Organisation created");
      setDialogOpen(false);
      resetForm();
      router.push(`/admin/organisations/${result.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to create organisation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          + New organisation
        </Button>
      </div>

      <div className="grid gap-3.5 md:grid-cols-3">
        {organisations.map((org) => (
          <Card key={org.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <Link href={`/admin/organisations/${org.id}`} className="block p-5">
              <div className="mb-3.5 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-brand-sm text-lg font-extrabold"
                  style={{ background: org.bgColor, color: org.textColor }}
                >
                  {org.letter}
                </div>
                <div>
                  <div className="text-[15px] font-bold">{org.name}</div>
                  <div className="text-xs text-brand-text-2">{org.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="font-semibold text-brand-text-3">CLIENTS</div>
                  <div className="text-xl font-extrabold">{org.clients}</div>
                </div>
                <div>
                  <div className="font-semibold text-brand-text-3">ACTIVE</div>
                  <div className="text-xl font-extrabold text-brand-green">{org.active}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-brand-text-2">{org.contact}</div>
            </Link>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New organisation</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div>
              <Label htmlFor="org-name">Organisation name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clime ASX"
              />
            </div>
            <div>
              <Label htmlFor="org-description">Description</Label>
              <Input
                id="org-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Referrer · Financial planning"
              />
            </div>
            <div>
              <Label htmlFor="org-contact-name">Contact name</Label>
              <Input
                id="org-contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. David Chen"
              />
            </div>
            <div>
              <Label htmlFor="org-contact-email">Contact email</Label>
              <Input
                id="org-contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. david@clime.com.au"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create organisation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
