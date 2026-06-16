"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallButton } from "@/components/contacts/call-button";
import type { ContactPerson, MatterContacts } from "@/lib/types";

function PersonRow({
  matterId,
  person,
  nested,
}: {
  matterId: string;
  person: ContactPerson;
  nested?: boolean;
}) {
  return (
    <div
      className={
        nested
          ? "flex items-center gap-2.5 border-b border-brand-surface-2 py-2 pl-6 last:border-0"
          : "flex items-center gap-2.5 border-b border-brand-surface-2 py-2 last:border-0"
      }
    >
      <Link
        href={`/matters/${matterId}/party/${person.partyId}`}
        className="min-w-0 flex-1 hover:underline"
      >
        <div className="truncate text-[13px] font-semibold">
          {person.name}{" "}
          <span className="font-normal text-brand-text-3">• {person.role}</span>
        </div>
        <div className="truncate text-[11px] text-brand-text-3">
          {person.phone ?? "No phone"}
          {person.email ? ` · ${person.email}` : ""}
        </div>
      </Link>
      <CallButton name={person.name} phone={person.phone} auditMatterId={matterId} />
    </div>
  );
}

export function MatterContactsCard({
  matterId,
  contacts,
}: {
  matterId: string;
  contacts: MatterContacts;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <Link
          href={`/clients/${contacts.trust.partyId}`}
          className="block border-b border-brand-surface-2 py-2 hover:underline"
        >
          <div className="text-[13px] font-semibold">{contacts.trust.name}</div>
          <div className="text-[11px] text-brand-text-3">
            {contacts.trust.abn ? `ABN ${contacts.trust.abn}` : "ABN not recorded"} · Trust
          </div>
        </Link>

        {contacts.individualTrustees.map((p) => (
          <PersonRow key={p.partyId} matterId={matterId} person={p} />
        ))}

        {contacts.corporateTrustees.map((company) => (
          <div key={company.partyId}>
            <div className="flex items-center gap-2.5 border-b border-brand-surface-2 py-2">
              <Link
                href={`/matters/${matterId}/party/${company.partyId}`}
                className="min-w-0 flex-1 hover:underline"
              >
                <div className="truncate text-[13px] font-semibold">
                  {company.name}{" "}
                  <span className="font-normal text-brand-text-3">• Trustee</span>
                </div>
                <div className="truncate text-[11px] text-brand-text-3">
                  {company.acn ? `ACN ${company.acn}` : "ACN not recorded"}
                </div>
              </Link>
            </div>
            {company.directors.map((d) => (
              <PersonRow key={d.partyId} matterId={matterId} person={d} nested />
            ))}
          </div>
        ))}

        {contacts.authorisedParties.map((p) => (
          <PersonRow key={p.partyId} matterId={matterId} person={p} />
        ))}

        {contacts.individualTrustees.length === 0 &&
          contacts.corporateTrustees.length === 0 &&
          contacts.authorisedParties.length === 0 && (
            <p className="py-2 text-[13px] text-brand-text-3">
              No trustees recorded for this client yet.
            </p>
          )}
      </CardContent>
    </Card>
  );
}
