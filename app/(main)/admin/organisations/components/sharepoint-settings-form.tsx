"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveOrganisationMicrosoftIntegrationAction } from "@/lib/actions/organisation-integration-actions";
import type { OrganisationMicrosoftIntegration } from "@/lib/types";

export function SharepointSettingsForm({
  organisationId,
  microsoftIntegration,
}: {
  organisationId: string;
  microsoftIntegration: OrganisationMicrosoftIntegration | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<OrganisationMicrosoftIntegration>({
    organisationId,
    microsoftTenantId: microsoftIntegration?.microsoftTenantId ?? "",
    sharepointSiteId: microsoftIntegration?.sharepointSiteId ?? "",
    sharepointDriveId: microsoftIntegration?.sharepointDriveId ?? "",
  });

  const updateDraft = (
    field: keyof Omit<OrganisationMicrosoftIntegration, "organisationId">,
    value: string
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveOrganisationMicrosoftIntegrationAction({
        organisationId,
        microsoftTenantId: draft.microsoftTenantId ?? undefined,
        sharepointSiteId: draft.sharepointSiteId ?? undefined,
        sharepointDriveId: draft.sharepointDriveId ?? undefined,
      });
      toast.success("SharePoint settings saved");
      router.refresh();
    } catch {
      toast.error("Failed to save SharePoint settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SharePoint integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-brand-text-2">
          Configure Microsoft SharePoint integration for this organisation.
        </p>
        <div>
          <Label htmlFor={`${organisationId}-tenant`}>Microsoft tenant ID</Label>
          <Input
            id={`${organisationId}-tenant`}
            value={draft.microsoftTenantId ?? ""}
            onChange={(e) => updateDraft("microsoftTenantId", e.target.value)}
            placeholder="e.g. 00000000-0000-0000-0000-000000000000"
          />
        </div>
        <div>
          <Label htmlFor={`${organisationId}-site`}>SharePoint site ID</Label>
          <Input
            id={`${organisationId}-site`}
            value={draft.sharepointSiteId ?? ""}
            onChange={(e) => updateDraft("sharepointSiteId", e.target.value)}
            placeholder="Site ID"
          />
        </div>
        <div>
          <Label htmlFor={`${organisationId}-drive`}>SharePoint drive ID</Label>
          <Input
            id={`${organisationId}-drive`}
            value={draft.sharepointDriveId ?? ""}
            onChange={(e) => updateDraft("sharepointDriveId", e.target.value)}
            placeholder="Drive ID"
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
