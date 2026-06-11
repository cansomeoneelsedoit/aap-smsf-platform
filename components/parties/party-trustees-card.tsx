"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CardEditButton } from "@/components/parties/card-edit-button";
import { PartySearchInput } from "@/components/parties/party-search-input";
import { CallButton } from "@/components/contacts/call-button";
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
import {
  addDirectorAction,
  addTrusteeAction,
  removeDirectorAction,
  removeTrusteeAction,
  updatePartyAction,
  type NewPersonInput,
  type PersonRef,
} from "@/lib/actions/client-actions";
import { cn } from "@/lib/utils";
import type {
  ContactPerson,
  CorporateTrusteeContact,
  MatterContacts,
  PartySearchResult,
} from "@/lib/types";

const MAX_TRUSTEES = 4;

type ActionResult = { error?: string; success?: boolean; partyId?: string };

function cloneContacts(contacts: MatterContacts): MatterContacts {
  return {
    ...contacts,
    individualTrustees: [...contacts.individualTrustees],
    corporateTrustees: contacts.corporateTrustees.map((c) => ({
      ...c,
      directors: [...c.directors],
    })),
    authorisedParties: [...contacts.authorisedParties],
  };
}

function replacePartyId(contacts: MatterContacts, tempId: string, realId: string): MatterContacts {
  const next = cloneContacts(contacts);
  next.individualTrustees = next.individualTrustees.map((p) =>
    p.partyId === tempId ? { ...p, partyId: realId } : p
  );
  next.corporateTrustees = next.corporateTrustees.map((c) => ({
    ...c,
    partyId: c.partyId === tempId ? realId : c.partyId,
    directors: c.directors.map((d) => (d.partyId === tempId ? { ...d, partyId: realId } : d)),
  }));
  return next;
}

function personFromSearch(r: PartySearchResult, role: ContactPerson["role"]): ContactPerson {
  const detail = r.detail ?? "";
  const isEmail = detail.includes("@");
  return {
    partyId: r.partyId,
    name: r.name,
    role,
    email: isEmail ? detail : null,
    phone: !isEmail && detail ? detail : null,
  };
}

function personFromNewInput(input: NewPersonInput, partyId: string, role: ContactPerson["role"]): ContactPerson {
  return {
    partyId,
    name: `${input.firstName} ${input.lastName}`.trim(),
    role,
    email: input.email || null,
    phone: input.phone || null,
  };
}

function NewPersonDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (person: NewPersonInput) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    onCreate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>New person</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div><Label>Last name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Phone number</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0412 345 678" /></div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add person</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewCompanyDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (company: { name: string; acn: string }) => void;
}) {
  const [name, setName] = useState("");
  const [acn, setAcn] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }
    onCreate({ name: name.trim(), acn: acn.trim() });
    setName("");
    setAcn("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>ACN</Label><Input value={acn} onChange={(e) => setAcn(e.target.value)} placeholder="e.g. 634 789 123" /></div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PersonReadRow({
  person,
  role,
  nested,
  auditEntity,
}: {
  person: ContactPerson;
  role: string;
  nested?: boolean;
  auditEntity: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 py-2", nested && "pl-4")}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">
          {person.name} <span className="font-normal text-brand-text-3">• {role}</span>
        </div>
        <div className="truncate text-[11px] text-brand-text-3">
          {person.phone ?? "No phone"}{person.email ? ` · ${person.email}` : ""}
        </div>
      </div>
      <CallButton name={person.name} phone={person.phone} auditEntity={auditEntity} />
    </div>
  );
}

function CompanyReadRow({
  company,
  auditEntity,
}: {
  company: CorporateTrusteeContact;
  auditEntity: string;
}) {
  return (
    <div>
      <div className="py-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold">
            {company.name} <span className="font-normal text-brand-text-3">• Trustee</span>
          </div>
          <div className="truncate text-[11px] text-brand-text-3">
            {company.acn ? `ACN ${company.acn}` : "ACN not recorded"}
          </div>
        </div>
      </div>
      {company.directors.map((d) => (
        <PersonReadRow key={d.partyId} person={d} role="Director" nested auditEntity={auditEntity} />
      ))}
    </div>
  );
}

type PersonFieldUpdate = { email: string; phone: string };
type CompanyFieldUpdate = { acn: string };

type DetailUpdate =
  | { type: "person"; partyId: string; email: string; phone: string }
  | { type: "company"; partyId: string; acn: string };

function collectDetailUpdates(current: MatterContacts, draft: MatterContacts): DetailUpdate[] {
  const updates: DetailUpdate[] = [];

  for (const draftPerson of draft.individualTrustees) {
    if (draftPerson.partyId.startsWith("pending-")) continue;
    const base = current.individualTrustees.find((p) => p.partyId === draftPerson.partyId);
    if (!base) continue;
    if (base.email !== draftPerson.email || base.phone !== draftPerson.phone) {
      updates.push({
        type: "person",
        partyId: draftPerson.partyId,
        email: draftPerson.email ?? "",
        phone: draftPerson.phone ?? "",
      });
    }
  }

  for (const draftCompany of draft.corporateTrustees) {
    const base = current.corporateTrustees.find((c) => c.partyId === draftCompany.partyId);
    if (base && !draftCompany.partyId.startsWith("pending-") && base.acn !== draftCompany.acn) {
      updates.push({
        type: "company",
        partyId: draftCompany.partyId,
        acn: draftCompany.acn ?? "",
      });
    }

    for (const draftDirector of draftCompany.directors) {
      if (draftDirector.partyId.startsWith("pending-")) continue;
      const baseDirector = base?.directors.find((d) => d.partyId === draftDirector.partyId);
      if (!baseDirector) continue;
      if (baseDirector.email !== draftDirector.email || baseDirector.phone !== draftDirector.phone) {
        updates.push({
          type: "person",
          partyId: draftDirector.partyId,
          email: draftDirector.email ?? "",
          phone: draftDirector.phone ?? "",
        });
      }
    }
  }

  return updates;
}

function PersonEditAccordionRow({
  person,
  role,
  nested,
  onRemove,
  onFieldsChange,
}: {
  person: ContactPerson;
  role: string;
  nested?: boolean;
  onRemove: () => void;
  onFieldsChange: (fields: PersonFieldUpdate) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPending = person.partyId.startsWith("pending-");

  return (
    <div className={cn("rounded-brand-sm bg-brand-surface", nested && "ml-3")}>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">
            {person.name} <span className="font-normal text-brand-text-3">• {role}</span>
          </div>
          <div className="truncate text-[11px] text-brand-text-3">
            {person.phone ?? "No phone"}{person.email ? ` · ${person.email}` : ""}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-brand-text-3 transition-transform mr-2",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="space-y-3 border-t border-brand-surface-2 px-3 pb-3">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={person.email ?? ""}
              onChange={(e) =>
                onFieldsChange({ email: e.target.value, phone: person.phone ?? "" })
              }
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Phone number</Label>
            <Input
              type="tel"
              value={person.phone ?? ""}
              onChange={(e) =>
                onFieldsChange({ email: person.email ?? "", phone: e.target.value })
              }
              placeholder="e.g. 0412 345 678"
              disabled={isPending}
            />
          </div>
          {isPending && (
            <p className="text-[11px] text-brand-text-3">Saving this person — details can be edited shortly.</p>
          )}
          <div>
            <Button variant="outline" size="xs" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyEditAccordionRow({
  company,
  onRemove,
  onFieldsChange,
  children,
}: {
  company: CorporateTrusteeContact;
  onRemove: () => void;
  onFieldsChange: (fields: CompanyFieldUpdate) => void;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPending = company.partyId.startsWith("pending-");

  return (
    <div className="space-y-2">
      <div className="rounded-brand-sm bg-brand-surface">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">
              {company.name} <span className="font-normal text-brand-text-3">• Trustee</span>
            </div>
            <div className="truncate text-[11px] text-brand-text-3">
              {company.acn ? `ACN ${company.acn}` : "ACN not recorded"}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-brand-text-3 transition-transform mr-2",
              expanded && "rotate-180"
            )}
          />
        </button>
        {expanded && (
          <div className="space-y-3 border-t border-brand-surface-2 px-3 pb-3">
            <div>
              <Label>ACN</Label>
              <Input
                value={company.acn ?? ""}
                onChange={(e) => onFieldsChange({ acn: e.target.value })}
                placeholder="e.g. 634 789 123"
                disabled={isPending}
              />
            </div>
            {isPending && (
              <p className="text-[11px] text-brand-text-3">Saving this company — details can be edited shortly.</p>
            )}
            <div>
              <Button variant="outline" size="xs" onClick={onRemove}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function TrusteesReadOnlyList({
  contacts,
  auditEntity,
}: {
  contacts: MatterContacts;
  auditEntity: string;
}) {
  const hasTrustees =
    contacts.individualTrustees.length > 0 ||
    contacts.corporateTrustees.length > 0;

  if (!hasTrustees) {
    return <p className="text-[13px] text-brand-text-3">No trustees recorded for this client yet.</p>;
  }

  return (
    <div className="divide-y divide-brand-surface-2">
      {contacts.individualTrustees.map((p) => (
        <PersonReadRow key={p.partyId} person={p} role="Trustee" auditEntity={auditEntity} />
      ))}
      {contacts.corporateTrustees.map((company) => (
        <CompanyReadRow key={company.partyId} company={company} auditEntity={auditEntity} />
      ))}
    </div>
  );
}

function TrusteesEditForm({
  contacts,
  onAddPersonTrustee,
  onAddCompanyTrustee,
  onRemoveTrustee,
  onAddDirector,
  onRemoveDirector,
  onEditPersonFields,
  onEditCompanyFields,
}: {
  contacts: MatterContacts;
  onAddPersonTrustee: (ref: PersonRef, optimistic: ContactPerson) => void;
  onAddCompanyTrustee: (
    partyId: string | undefined,
    newCompany: { name: string; acn: string } | undefined,
    optimistic: CorporateTrusteeContact
  ) => void;
  onRemoveTrustee: (partyId: string) => void;
  onAddDirector: (companyPartyId: string, ref: PersonRef, optimistic: ContactPerson) => void;
  onRemoveDirector: (companyPartyId: string, personPartyId: string) => void;
  onEditPersonFields: (partyId: string, fields: PersonFieldUpdate) => void;
  onEditCompanyFields: (partyId: string, fields: CompanyFieldUpdate) => void;
}) {
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [directorDialogOpen, setDirectorDialogOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const hasCorporate = contacts.corporateTrustees.length > 0;
  const trusteeCount = contacts.individualTrustees.length + contacts.corporateTrustees.length;

  return (
    <>
      <div className="space-y-4">
        {contacts.individualTrustees.map((p) => (
          <PersonEditAccordionRow
            key={p.partyId}
            person={p}
            role="Trustee"
            onRemove={() => onRemoveTrustee(p.partyId)}
            onFieldsChange={(fields) => onEditPersonFields(p.partyId, fields)}
          />
        ))}

        {contacts.corporateTrustees.map((company) => (
          <CompanyEditAccordionRow
            key={company.partyId}
            company={company}
            onRemove={() => onRemoveTrustee(company.partyId)}
            onFieldsChange={(fields) => onEditCompanyFields(company.partyId, fields)}
          >
            {company.directors.map((d) => (
              <PersonEditAccordionRow
                key={d.partyId}
                person={d}
                role="Director"
                nested
                onRemove={() => onRemoveDirector(company.partyId, d.partyId)}
                onFieldsChange={(fields) => onEditPersonFields(d.partyId, fields)}
              />
            ))}
            <div className="ml-3 flex items-start gap-2">
              <PartySearchInput
                type="PERSON"
                placeholder="Add director…"
                className="flex-1"
                excludeIds={company.directors.map((d) => d.partyId)}
                onSelect={(r) =>
                  onAddDirector(company.partyId, { partyId: r.partyId }, personFromSearch(r, "Director"))
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCompanyId(company.partyId);
                  setDirectorDialogOpen(true);
                }}
              >
                + New person
              </Button>
            </div>
          </CompanyEditAccordionRow>
        ))}

        {trusteeCount === 0 && (
          <p className="text-[13px] text-brand-text-3">No trustees recorded yet.</p>
        )}

        {!hasCorporate && trusteeCount < MAX_TRUSTEES && (
          <div className="space-y-2">
            <Label>Add individual trustee</Label>
            <div className="flex items-start gap-2">
              <PartySearchInput
                type="PERSON"
                placeholder="Search existing people…"
                className="flex-1"
                excludeIds={contacts.individualTrustees.map((p) => p.partyId)}
                onSelect={(r) =>
                  onAddPersonTrustee({ partyId: r.partyId }, personFromSearch(r, "Trustee"))
                }
              />
              <Button variant="outline" onClick={() => setPersonDialogOpen(true)}>
                + New person
              </Button>
            </div>
          </div>
        )}

        {!hasCorporate && contacts.individualTrustees.length === 0 && (
          <div className="space-y-2">
            <Label>Add corporate trustee</Label>
            <div className="flex items-start gap-2">
              <PartySearchInput
                type="COMPANY"
                placeholder="Search existing companies…"
                className="flex-1"
                onSelect={(r) =>
                  onAddCompanyTrustee(
                    r.partyId,
                    undefined,
                    {
                      partyId: r.partyId,
                      name: r.name,
                      acn: r.detail?.replace(/^ACN /, "") ?? null,
                      directors: [],
                    }
                  )
                }
              />
              <Button variant="outline" onClick={() => setCompanyDialogOpen(true)}>
                + New company
              </Button>
            </div>
          </div>
        )}
      </div>

      <NewPersonDialog
        open={personDialogOpen}
        onOpenChange={setPersonDialogOpen}
        onCreate={(person) => {
          const tempId = `pending-${crypto.randomUUID()}`;
          onAddPersonTrustee(
            { newPerson: person },
            personFromNewInput(person, tempId, "Trustee")
          );
        }}
      />
      <NewCompanyDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
        onCreate={(c) => {
          const tempId = `pending-${crypto.randomUUID()}`;
          onAddCompanyTrustee(undefined, c, {
            partyId: tempId,
            name: c.name,
            acn: c.acn || null,
            directors: [],
          });
        }}
      />
      <NewPersonDialog
        open={directorDialogOpen}
        onOpenChange={setDirectorDialogOpen}
        onCreate={(person) => {
          if (!activeCompanyId) return;
          const tempId = `pending-${crypto.randomUUID()}`;
          onAddDirector(
            activeCompanyId,
            { newPerson: person },
            personFromNewInput(person, tempId, "Director")
          );
        }}
      />
    </>
  );
}

export function PartyTrusteesCard({
  clientPartyId,
  contacts: serverContacts,
}: {
  clientPartyId: string;
  contacts: MatterContacts;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState(serverContacts);
  const [editContacts, setEditContacts] = useState(serverContacts);

  useEffect(() => {
    setContacts(serverContacts);
  }, [serverContacts]);

  const openDialog = () => {
    setEditContacts(cloneContacts(contacts));
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const syncEditContacts = useCallback((apply: (prev: MatterContacts) => MatterContacts) => {
    setEditContacts((prev) => apply(prev));
  }, []);

  const updateEditPersonFields = (partyId: string, fields: PersonFieldUpdate) => {
    syncEditContacts((prev) => {
      const next = cloneContacts(prev);
      const updatePerson = (p: ContactPerson) =>
        p.partyId === partyId
          ? { ...p, email: fields.email || null, phone: fields.phone || null }
          : p;
      next.individualTrustees = next.individualTrustees.map(updatePerson);
      next.corporateTrustees = next.corporateTrustees.map((c) => ({
        ...c,
        directors: c.directors.map(updatePerson),
      }));
      return next;
    });
  };

  const updateEditCompanyFields = (partyId: string, fields: CompanyFieldUpdate) => {
    syncEditContacts((prev) => ({
      ...cloneContacts(prev),
      corporateTrustees: prev.corporateTrustees.map((c) =>
        c.partyId === partyId ? { ...c, acn: fields.acn || null } : c
      ),
    }));
  };

  const runOptimistic = useCallback(
    async (
      apply: (prev: MatterContacts) => MatterContacts,
      action: () => Promise<ActionResult>,
      tempPartyId?: string
    ) => {
      let snapshot!: MatterContacts;
      setContacts((prev) => {
        snapshot = cloneContacts(prev);
        return apply(prev);
      });
      syncEditContacts(apply);

      try {
        const result = await action();
        if (result.error) {
          setContacts(snapshot);
          syncEditContacts(() => snapshot);
          toast.error(result.error);
          return;
        }
        if (tempPartyId && result.partyId) {
          const replace = (prev: MatterContacts) => replacePartyId(prev, tempPartyId, result.partyId!);
          setContacts(replace);
          syncEditContacts(replace);
        }
        void router.refresh();
      } catch {
        setContacts(snapshot);
        syncEditContacts(() => snapshot);
        toast.error("Something went wrong");
      }
    },
    [router, syncEditContacts]
  );

  const onAddPersonTrustee = (ref: PersonRef, optimistic: ContactPerson) => {
    const tempPartyId = ref.newPerson ? optimistic.partyId : undefined;
    void runOptimistic(
      (prev) => ({
        ...cloneContacts(prev),
        individualTrustees: [...prev.individualTrustees, optimistic],
      }),
      () => addTrusteeAction(clientPartyId, ref),
      tempPartyId
    );
  };

  const onAddCompanyTrustee = (
    partyId: string | undefined,
    newCompany: { name: string; acn: string } | undefined,
    optimistic: CorporateTrusteeContact
  ) => {
    const tempPartyId = newCompany ? optimistic.partyId : undefined;
    void runOptimistic(
      (prev) => ({
        ...cloneContacts(prev),
        corporateTrustees: [...prev.corporateTrustees, optimistic],
      }),
      () => addTrusteeAction(clientPartyId, undefined, { partyId, newCompany }),
      tempPartyId
    );
  };

  const onRemoveTrustee = (partyId: string) => {
    void runOptimistic(
      (prev) => {
        const next = cloneContacts(prev);
        next.individualTrustees = next.individualTrustees.filter((p) => p.partyId !== partyId);
        next.corporateTrustees = next.corporateTrustees.filter((c) => c.partyId !== partyId);
        return next;
      },
      () => removeTrusteeAction(clientPartyId, partyId)
    );
  };

  const onAddDirector = (companyPartyId: string, ref: PersonRef, optimistic: ContactPerson) => {
    const tempPartyId = ref.newPerson ? optimistic.partyId : undefined;
    void runOptimistic(
      (prev) => {
        const next = cloneContacts(prev);
        next.corporateTrustees = next.corporateTrustees.map((c) =>
          c.partyId === companyPartyId
            ? { ...c, directors: [...c.directors, optimistic] }
            : c
        );
        return next;
      },
      () => addDirectorAction(companyPartyId, ref),
      tempPartyId
    );
  };

  const onRemoveDirector = (companyPartyId: string, personPartyId: string) => {
    void runOptimistic(
      (prev) => {
        const next = cloneContacts(prev);
        next.corporateTrustees = next.corporateTrustees.map((c) =>
          c.partyId === companyPartyId
            ? { ...c, directors: c.directors.filter((d) => d.partyId !== personPartyId) }
            : c
        );
        return next;
      },
      () => removeDirectorAction(companyPartyId, personPartyId)
    );
  };

  const handleSave = async () => {
    const updates = collectDetailUpdates(contacts, editContacts);
    if (updates.length === 0) {
      closeDialog();
      return;
    }

    setSaving(true);
    try {
      for (const update of updates) {
        const result =
          update.type === "person"
            ? await updatePartyAction(update.partyId, null, {
                email: update.email,
                phone: update.phone,
              })
            : await updatePartyAction(update.partyId, null, { acn: update.acn });

        if (result.error) {
          toast.error(result.error);
          return;
        }
      }

      setContacts(editContacts);
      toast.success("Details updated");
      void router.refresh();
      closeDialog();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardTitle>Trustees & directors</CardTitle>
          <CardEditButton onClick={openDialog} />
        </CardHeader>
        <CardContent className="pt-4">
          <TrusteesReadOnlyList contacts={contacts} auditEntity={clientPartyId} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? openDialog() : closeDialog())}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Edit trustees & directors</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody>
            <TrusteesEditForm
              contacts={editContacts}
              onAddPersonTrustee={onAddPersonTrustee}
              onAddCompanyTrustee={onAddCompanyTrustee}
              onRemoveTrustee={onRemoveTrustee}
              onAddDirector={onAddDirector}
              onRemoveDirector={onRemoveDirector}
              onEditPersonFields={updateEditPersonFields}
              onEditCompanyFields={updateEditCompanyFields}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
