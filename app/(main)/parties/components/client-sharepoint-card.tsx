"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardEditButton } from "./card-edit-button";
import { SharePointFolderPicker } from "@/components/sharepoint/sharepoint-folder-picker";
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
import {
  updateClientSharePointDestinationAction,
  type SharePointDestinationInput,
} from "@/lib/actions/client-actions";

function toDestination(
  driveId: string | null,
  folderId: string | null,
  folderPath: string | null
): SharePointDestinationInput | null {
  if (!driveId || !folderId || !folderPath) {
    return null;
  }

  return { driveId, folderId, folderPath };
}

export function ClientSharePointCard({
  clientId,
  clientName,
  organisationId,
  sharepointConfigured,
  sharepointDriveId,
  sharepointFolderId,
  sharepointFolderPath,
}: {
  clientId: string;
  clientName: string;
  organisationId: string;
  sharepointConfigured: boolean;
  sharepointDriveId: string | null;
  sharepointFolderId: string | null;
  sharepointFolderPath: string | null;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [destination, setDestination] = useState<SharePointDestinationInput | null>(
    toDestination(sharepointDriveId, sharepointFolderId, sharepointFolderPath)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      setDestination(toDestination(sharepointDriveId, sharepointFolderId, sharepointFolderPath));
    }
  }, [dialogOpen, sharepointDriveId, sharepointFolderId, sharepointFolderPath]);

  const saveDestination = async (nextDestination: SharePointDestinationInput) => {
    setSaving(true);
    try {
      const result = await updateClientSharePointDestinationAction(clientId, nextDestination);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success(
        sharepointConfigured
          ? "SharePoint folder updated"
          : "SharePoint folder configured"
      );
      setDialogOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async () => {
    if (!destination) {
      toast.error("Select a SharePoint destination folder");
      return;
    }
    await saveDestination(destination);
  };

  const handleDialogSave = async () => {
    if (!destination) {
      toast.error("Select a SharePoint destination folder");
      return;
    }
    await saveDestination(destination);
  };

  if (sharepointConfigured) {
    return (
      <>
        <Card>
          <CardHeader className="border-b-0 pb-0">
            <CardTitle>SharePoint</CardTitle>
            <CardEditButton onClick={() => setDialogOpen(true)} />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between gap-4 py-2.5 text-[13px]">
              <span className="text-brand-text-2">Destination folder</span>
              <span className="max-w-[60%] truncate text-right font-semibold text-brand-dark">
                {sharepointFolderPath}
              </span>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent size="wide">
            <DialogHeader>
              <DialogTitle>Change SharePoint folder</DialogTitle>
              <DialogCloseButton />
            </DialogHeader>
            <DialogBody>
              <SharePointFolderPicker
                organisationId={organisationId}
                value={destination}
                onChange={setDestination}
                disabled={saving}
              />
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleDialogSave} disabled={saving || !destination}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle>SharePoint</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-[13px] text-brand-text-2">
          {clientName} does not have a SharePoint destination folder yet. Select one to enable
          document uploads for this client&apos;s matters.
        </p>
        <SharePointFolderPicker
          organisationId={organisationId}
          value={destination}
          onChange={setDestination}
          disabled={saving}
        />
        <div className="flex justify-end">
          <Button onClick={handleInlineSave} disabled={saving || !destination}>
            {saving ? "Saving…" : "Save folder"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
