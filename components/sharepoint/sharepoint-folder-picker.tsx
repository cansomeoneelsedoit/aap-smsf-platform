"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderSearch,
  HardDrive,
  Library,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  checkMicrosoftGraphAccessAction,
  listSharePointDrivesAction,
  listSharePointFolderChildrenAction,
  resetMicrosoftGraphConnectionAction,
} from "@/lib/actions/sharepoint-actions";
import type { SharePointDestinationInput } from "@/lib/actions/client-actions";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface BrowseEntry {
  id: string;
  name: string;
  driveId: string;
  folderId: "root" | string;
}

interface ExplorerItem {
  id: string;
  name: string;
  kind: "library" | "folder";
  driveId: string;
  folderId: "root" | string;
}

function ExplorerSkeletonRows() {
  return (
    <div className="divide-y divide-brand-border">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-5 shrink-0 rounded-sm" />
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Skeleton className="h-4 w-2/5 max-w-[220px]" />
            <Skeleton className="hidden h-3 w-16 sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ExplorerEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FolderOpen;
  title: string;
  description: string;
}) {
  return (
    <Empty className="min-h-[220px] border-0 bg-transparent py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-5 text-brand-text-3" />
        </EmptyMedia>
        <EmptyTitle className="text-base">{title}</EmptyTitle>
        <EmptyDescription className="text-brand-text-3">{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function ExplorerBreadcrumb({
  siteName,
  trail,
  onNavigate,
}: {
  siteName: string | null;
  trail: BrowseEntry[];
  onNavigate: (index: number) => void;
}) {
  const segments = [
    ...(siteName ? [{ label: siteName, index: -1 }] : []),
    ...trail.map((entry, index) => ({ label: entry.name, index })),
  ];

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-brand-sm border border-brand-border bg-brand-surface px-3 py-2 text-[12px]">
      {segments.length === 0 ? (
        <span className="truncate text-brand-text-3">SharePoint</span>
      ) : (
        segments.map((segment, index) => (
          <span key={`${segment.label}-${index}`} className="flex shrink-0 items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5 text-brand-text-3" />}
            {segment.index >= 0 ? (
              <button
                type="button"
                className={cn(
                  "truncate font-medium transition-colors hover:text-brand-dark hover:underline",
                  index === segments.length - 1 ? "text-brand-dark" : "text-brand-text-2"
                )}
                onClick={() => onNavigate(segment.index)}
              >
                {segment.label}
              </button>
            ) : (
              <button
                type="button"
                className={cn(
                  "truncate font-medium transition-colors hover:text-brand-dark hover:underline",
                  trail.length === 0 ? "text-brand-dark" : "text-brand-text-2"
                )}
                onClick={() => onNavigate(-1)}
              >
                {segment.label}
              </button>
            )}
          </span>
        ))
      )}
    </div>
  );
}

function ExplorerFileList({
  items,
  loading,
  onOpen,
}: {
  items: ExplorerItem[];
  loading: boolean;
  onOpen: (item: ExplorerItem) => void;
}) {
  if (loading) {
    return <ExplorerSkeletonRows />;
  }

  if (items.length === 0) {
    return (
      <ExplorerEmptyState
        icon={FolderOpen}
        title="This folder is empty"
        description="There are no subfolders here. You can select this folder using the button below."
      />
    );
  }

  return (
    <div className="divide-y divide-brand-border">
      {items.map((item) => {
        const Icon = item.kind === "library" ? Library : Folder;
        const typeLabel = item.kind === "library" ? "Document library" : "Folder";

        return (
          <button
            key={item.id}
            type="button"
            className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-brand-surface-2 focus-visible:bg-brand-surface-2 focus-visible:outline-none"
            onClick={() => onOpen(item)}
            onDoubleClick={() => onOpen(item)}
          >
            <Icon className="size-5 shrink-0 text-amber-500 group-hover:text-amber-600" />
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_120px] items-center gap-3">
              <span className="truncate text-[13px] font-medium text-brand-dark">{item.name}</span>
              <span className="hidden truncate text-[12px] text-brand-text-3 sm:block">
                {typeLabel}
              </span>
            </div>
            <ChevronRight className="size-4 shrink-0 text-brand-text-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
}

export function SharePointFolderPicker({
  organisationId,
  value,
  onChange,
  disabled,
}: {
  organisationId: string;
  value: SharePointDestinationInput | null;
  onChange: (destination: SharePointDestinationInput | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [scopesOk, setScopesOk] = useState<boolean | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [drives, setDrives] = useState<{ id: string; name: string }[]>([]);
  const [entries, setEntries] = useState<BrowseEntry[]>([]);
  const [trail, setTrail] = useState<BrowseEntry[]>([]);
  const [activeDriveId, setActiveDriveId] = useState<string | null>(null);

  const currentFolder = trail.at(-1) ?? null;

  const loadAccess = useCallback(async () => {
    const result = await checkMicrosoftGraphAccessAction();
    setHasAccess(result.hasGraphAccess);
    setScopesOk(result.scopesOk);
    return result;
  }, []);

  const handleReconnectMicrosoft = async () => {
    setReconnecting(true);
    try {
      await resetMicrosoftGraphConnectionAction();
      const result = await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: window.location.pathname + window.location.search,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to reconnect Microsoft account");
      }
    } finally {
      setReconnecting(false);
    }
  };

  const loadDrives = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSharePointDrivesAction(organisationId);
      if ("error" in result) {
        toast.error(result.error);
        setSiteName(null);
        setDrives([]);
        return;
      }
      setSiteName(result.data.siteName);
      setDrives(result.data.drives.map((drive) => ({ id: drive.id, name: drive.name })));
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  const loadFolder = useCallback(async (driveId: string, folderId: "root" | string) => {
    setLoading(true);
    try {
      const result = await listSharePointFolderChildrenAction(driveId, folderId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEntries(
        result.data.map((item) => ({
          id: item.id,
          name: item.name,
          driveId,
          folderId: item.id,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  useEffect(() => {
    if (!open) return;

    void (async () => {
      const access = await loadAccess();
      if (access.hasGraphAccess && access.scopesOk) {
        await loadDrives();
      }
    })();
  }, [open, loadAccess, loadDrives]);

  const resetExplorer = () => {
    setTrail([]);
    setEntries([]);
    setActiveDriveId(null);
    setSiteName(null);
    setHasAccess(null);
    setScopesOk(null);
    setLoading(false);
  };

  const openDrive = async (driveId: string, driveName: string) => {
    setActiveDriveId(driveId);
    const rootEntry: BrowseEntry = { id: driveId, name: driveName, driveId, folderId: "root" };
    setTrail([rootEntry]);
    await loadFolder(driveId, "root");
  };

  const openFolder = async (entry: BrowseEntry) => {
    setTrail((current) => [...current, entry]);
    await loadFolder(entry.driveId, entry.folderId);
  };

  const goToTrailIndex = async (index: number) => {
    if (index < 0) {
      setActiveDriveId(null);
      setTrail([]);
      setEntries([]);
      return;
    }

    const nextTrail = trail.slice(0, index + 1);
    setTrail(nextTrail);
    const target = nextTrail.at(-1);
    if (!target) return;
    await loadFolder(target.driveId, target.folderId);
  };

  const buildFolderPath = () => {
    const folderPath = trail.map((entry) => entry.name).join(" / ");
    return siteName ? `${siteName} / ${folderPath}` : folderPath;
  };

  const selectCurrentFolder = () => {
    if (!currentFolder) return;

    onChange({
      driveId: currentFolder.driveId,
      folderId: currentFolder.folderId,
      folderPath: buildFolderPath(),
    });
    setOpen(false);
  };

  const handleSelectRootDrive = (driveId: string, driveName: string) => {
    onChange({
      driveId,
      folderId: "root",
      folderPath: siteName ? `${siteName} / ${driveName}` : driveName,
    });
    setOpen(false);
  };

  const libraryItems: ExplorerItem[] = drives.map((drive) => ({
    id: drive.id,
    name: drive.name,
    kind: "library",
    driveId: drive.id,
    folderId: "root",
  }));

  const folderItems: ExplorerItem[] = entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    kind: "folder",
    driveId: entry.driveId,
    folderId: entry.folderId,
  }));

  const handleOpenItem = (item: ExplorerItem) => {
    if (item.kind === "library") {
      void openDrive(item.driveId, item.name);
      return;
    }

    void openFolder({
      id: item.id,
      name: item.name,
      driveId: item.driveId,
      folderId: item.folderId,
    });
  };

  const showLibraryList = !activeDriveId;
  const listItems = showLibraryList ? libraryItems : folderItems;

  return (
    <div className="space-y-2">
      <Label>SharePoint destination folder</Label>
      {value ? (
        <div className="flex items-center gap-2.5 rounded-brand-sm border border-brand-border bg-white px-3 py-2">
          <Folder className="size-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1 truncate text-[13px]">{value.folderPath}</div>
          <Button
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            Clear
          </Button>
        </div>
      ) : (
        <p className="text-[12px] text-brand-text-3">
          Select the SharePoint folder where this client&apos;s documents will be stored.
        </p>
      )}
      {scopesOk === false && (
        <div className="rounded-brand-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
          <p className="mb-2">
            Your Microsoft connection is missing SharePoint write permissions. Document uploads
            will fail until you reconnect.
          </p>
          <Button
            variant="outline"
            size="xs"
            disabled={disabled || reconnecting}
            onClick={() => void handleReconnectMicrosoft()}
          >
            {reconnecting ? "Redirecting…" : "Reconnect Microsoft"}
          </Button>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => {
          resetExplorer();
          setOpen(true);
        }}
      >
        {value ? "Change folder" : "Select folder"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetExplorer();
          }
        }}
      >
        <DialogContent size="wide">
          <DialogHeader>
            <DialogTitle>Select SharePoint folder</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {hasAccess === false && (
              <div className="rounded-brand-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                Sign in with Microsoft to browse SharePoint.
              </div>
            )}

            {hasAccess && scopesOk === false && (
              <div className="rounded-brand-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                <p className="mb-2">
                  Your Microsoft token is missing SharePoint write permissions. Reconnect to
                  refresh permissions after they are granted in Azure.
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={reconnecting}
                  onClick={() => void handleReconnectMicrosoft()}
                >
                  {reconnecting ? "Redirecting…" : "Reconnect Microsoft"}
                </Button>
              </div>
            )}

            <ExplorerBreadcrumb
              siteName={siteName}
              trail={trail}
              onNavigate={(index) => void goToTrailIndex(index)}
            />

            <div className="overflow-hidden rounded-brand-sm border border-brand-border bg-white">
              <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3 border-b border-brand-border bg-brand-surface px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-brand-text-3">
                <span>Name</span>
                <span className="hidden sm:block">Type</span>
              </div>

              <div className="max-h-80 min-h-[220px] overflow-y-auto">
                {hasAccess === false ? (
                  <ExplorerEmptyState
                    icon={FolderSearch}
                    title="Microsoft sign-in required"
                    description="Sign in with Microsoft to browse folders on this SharePoint site."
                  />
                ) : scopesOk === false ? (
                  <ExplorerEmptyState
                    icon={FolderSearch}
                    title="SharePoint permissions required"
                    description="Reconnect your Microsoft account to grant SharePoint read and write access."
                  />
                ) : showLibraryList && !loading && listItems.length === 0 ? (
                  <ExplorerEmptyState
                    icon={HardDrive}
                    title="No document libraries found"
                    description="This SharePoint site has no document libraries available to browse."
                  />
                ) : (
                  <ExplorerFileList
                    items={listItems}
                    loading={loading || hasAccess === null}
                    onOpen={handleOpenItem}
                  />
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {activeDriveId && currentFolder && (
              <>
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    const driveEntry = trail[0];
                    if (driveEntry) {
                      handleSelectRootDrive(driveEntry.driveId, driveEntry.name);
                    }
                  }}
                >
                  Use library root
                </Button>
                <Button disabled={loading || currentFolder.folderId === "root"} onClick={selectCurrentFolder}>
                  Select this folder
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
