"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SharepointSettingsForm } from "../../components/sharepoint-settings-form";
import type { OrganisationMicrosoftIntegration } from "@/lib/types";

type OrganisationDetail = {
  id: string;
  name: string;
  description: string;
  contactName: string;
  contactEmail: string;
  letter: string;
  bgColor: string;
  textColor: string;
  clients: number;
  active: number;
  microsoftIntegration: OrganisationMicrosoftIntegration | null;
};

export function OrganisationDetailClient({ organisation }: { organisation: OrganisationDetail }) {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/organisations"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-2 hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to organisations
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-brand-sm text-xl font-extrabold"
              style={{ background: organisation.bgColor, color: organisation.textColor }}
            >
              {organisation.letter}
            </div>
            <div>
              <CardTitle>{organisation.name}</CardTitle>
              <p className="text-sm text-brand-text-2">{organisation.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
                Contact
              </div>
              <div className="mt-1 text-sm">
                {organisation.contactName} · {organisation.contactEmail}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
                  Clients
                </div>
                <div className="mt-1 text-2xl font-extrabold">{organisation.clients}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand-text-3">
                  Active matters
                </div>
                <div className="mt-1 text-2xl font-extrabold text-brand-green">
                  {organisation.active}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SharepointSettingsForm
        organisationId={organisation.id}
        microsoftIntegration={organisation.microsoftIntegration}
      />
    </div>
  );
}
