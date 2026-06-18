"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PartySearchInput } from "../../components/party-search-input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createClientAction,
  type NewPersonInput,
  type PersonRef,
  type SharePointDestinationInput,
} from "@/lib/actions/client-actions";
import { SharePointFolderPicker } from "@/components/sharepoint/sharepoint-folder-picker";

const MAX_PERSONS = 4;

interface SelectedPerson {
  key: string;
  partyId?: string;
  newPerson?: NewPersonInput;
  name: string;
  detail: string | null;
}

interface SelectedCompany {
  partyId?: string;
  name: string;
  acn: string | null;
}

function toPersonRef(p: SelectedPerson): PersonRef {
  return p.partyId ? { partyId: p.partyId } : { newPerson: p.newPerson };
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
    onCreate({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
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
          <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Brown Family Pty Ltd" /></div>
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

function PersonPicker({
  persons,
  onChange,
}: {
  persons: SelectedPerson[];
  onChange: (persons: SelectedPerson[]) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const full = persons.length >= MAX_PERSONS;

  const addNewPerson = (person: NewPersonInput) => {
    onChange([
      ...persons,
      {
        key: crypto.randomUUID(),
        newPerson: person,
        name: `${person.firstName} ${person.lastName}`,
        detail: [person.email, person.phone].filter(Boolean).join(" · ") || "New person",
      },
    ]);
  };

  return (
    <div className="space-y-2">
      {persons.map((p) => (
        <div
          key={p.key}
          className="flex items-center gap-2.5 rounded-brand-sm border border-brand-border bg-white px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{p.name}</div>
            {p.detail && <div className="truncate text-[11px] text-brand-text-3">{p.detail}</div>}
          </div>
          {!p.partyId && <Badge variant="green">New</Badge>}
          <Button
            variant="outline"
            size="xs"
            onClick={() => onChange(persons.filter((x) => x.key !== p.key))}
          >
            Remove
          </Button>
        </div>
      ))}
      {!full && (
        <div className="flex items-start gap-2">
          <PartySearchInput
            type="PERSON"
            placeholder="Search existing people…"
            className="flex-1"
            excludeIds={persons.flatMap((p) => (p.partyId ? [p.partyId] : []))}
            onSelect={(r) =>
              onChange([
                ...persons,
                { key: r.partyId, partyId: r.partyId, name: r.name, detail: r.detail },
              ])
            }
          />
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            + New person
          </Button>
        </div>
      )}
      {full && (
        <p className="text-[11px] text-brand-text-3">
          Maximum of {MAX_PERSONS} people reached.
        </p>
      )}
      <NewPersonDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={addNewPerson} />
    </div>
  );
}

export function ClientCreateForm({
  groups,
}: {
  groups: { id: string; name: string; hasSharePoint: boolean }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organisationId, setOrganisationId] = useState("");
  const [sharepointDestination, setSharepointDestination] =
    useState<SharePointDestinationInput | null>(null);
  const [corporate, setCorporate] = useState(false);
  const [trustees, setTrustees] = useState<SelectedPerson[]>([]);
  const [company, setCompany] = useState<SelectedCompany | null>(null);
  const [directors, setDirectors] = useState<SelectedPerson[]>([]);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrganisation = groups.find((group) => group.id === organisationId);
  const requiresSharePoint = selectedOrganisation?.hasSharePoint ?? false;

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Client name is required");
    if (!organisationId) return toast.error("Please select an organisation");
    if (requiresSharePoint && !sharepointDestination) {
      return toast.error("Select a SharePoint destination folder for this client");
    }
    if (!corporate && trustees.length === 0)
      return toast.error("Add at least one individual trustee");
    if (corporate && !company) return toast.error("Add a corporate trustee");
    if (corporate && directors.length === 0)
      return toast.error("Assign at least one director to the corporate trustee");

    setSubmitting(true);
    try {
      const result = await createClientAction({
        name,
        organisationId,
        trusteeType: corporate ? "corporate" : "individual",
        individualTrustees: corporate ? [] : trustees.map(toPersonRef),
        corporateTrustee: corporate
          ? {
              partyId: company!.partyId,
              newCompany: company!.partyId
                ? undefined
                : { name: company!.name, acn: company!.acn ?? "" },
              directors: directors.map(toPersonRef),
            }
          : undefined,
        sharepointDestination: sharepointDestination ?? undefined,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Client created: ${name}`);
        router.push("/clients");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/clients">
        <Button variant="outline" size="xs" className="mb-3.5">
          ← Back to clients
        </Button>
      </Link>

      <Card className="mb-4">
        <CardHeader><CardTitle>Client details</CardTitle></CardHeader>
        <CardContent className="space-y-3 pt-1">
          <div>
            <Label>Client name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brown Family Superannuation Fund"
            />
          </div>
          <div>
            <Label>Organisation</Label>
            <Select
              value={organisationId}
              onValueChange={(value) => {
                setOrganisationId(value);
                setSharepointDestination(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organisation…" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {requiresSharePoint && (
            <SharePointFolderPicker
              organisationId={organisationId}
              value={sharepointDestination}
              onChange={setSharepointDestination}
              disabled={submitting}
            />
          )}
        </CardContent>
      </Card>

      <Card className="mb-4 overflow-visible">
        <CardHeader><CardTitle>Trustees</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="text-[13px] font-semibold">
            Trustee type
          </div>
          <div className="flex items-center gap-3">
            <span className={!corporate ? "text-[13px] font-semibold" : "text-[13px] text-brand-text-3"}>
              Individual
            </span>
            <Switch checked={corporate} onCheckedChange={setCorporate} />
            <span className={corporate ? "text-[13px] font-semibold" : "text-[13px] text-brand-text-3"}>
              Corporate
            </span>
          </div>

          {!corporate ? (
            <PersonPicker
              persons={trustees}
              onChange={setTrustees}
            />
          ) : (
            <div className="space-y-4">
              {company ? (
                <div className="flex items-center gap-2.5 rounded-brand-sm border border-brand-border bg-white px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{company.name}</div>
                    <div className="truncate text-[11px] text-brand-text-3">
                      {company.acn ? `ACN ${company.acn}` : "ACN not recorded"}
                    </div>
                  </div>
                  {!company.partyId && <Badge variant="green">New</Badge>}
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setCompany(null);
                      setDirectors([]);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <PartySearchInput
                    type="COMPANY"
                    placeholder="Search existing companies…"
                    className="flex-1"
                    onSelect={(r) =>
                      setCompany({
                        partyId: r.partyId,
                        name: r.name,
                        acn: r.detail?.replace(/^ACN /, "") ?? null,
                      })
                    }
                  />
                  <Button variant="outline" onClick={() => setCompanyDialogOpen(true)}>
                    + New company
                  </Button>
                </div>
              )}

              {company && (
                <div>
                  <Label className="mb-2 block">Directors of {company.name}</Label>
                  <PersonPicker
                    persons={directors}
                    onChange={setDirectors}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/clients">Cancel</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Create client"}
        </Button>
      </div>

      <NewCompanyDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
        onCreate={(c) => setCompany({ name: c.name, acn: c.acn || null })}
      />
    </div>
  );
}
