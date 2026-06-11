"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addAdviserGroupAction,
  addAuditEntryAction,
  addTaskAction,
  approveCallNoteAction,
  approveFileNoteAction,
  approveKycAction,
  approveMatterAction,
  createMatterAction,
  mockLodgeAction,
  reassignMatterAction,
  saveFileNoteAction,
  advanceStageAction,
  toggleTaskAction,
} from "@/lib/actions/matter-actions";
import type { ModalId, PartySearchResult } from "@/lib/types";

interface UiStore {
  activeModal: ModalId | null;
  activeMatterId: string;
  signDocName: string;
  notificationsRead: boolean;
  preselectedMatterClient: PartySearchResult | null;
  openModal: (
    id: ModalId,
    meta?: { signDocName?: string; matterId?: string; matterClient?: PartySearchResult }
  ) => void;
  closeModal: () => void;
  setPreselectedMatterClient: (client: PartySearchResult | null) => void;
  markAllRead: () => void;
}

export const useMockStore = create<UiStore>()((set, get) => ({
  activeModal: null,
  activeMatterId: "M001",
  signDocName: "",
  notificationsRead: false,
  preselectedMatterClient: null,

  openModal: (id, meta) =>
    set({
      activeModal: id,
      signDocName: meta?.signDocName ?? get().signDocName,
      activeMatterId: meta?.matterId ?? get().activeMatterId,
      preselectedMatterClient: meta?.matterClient ?? get().preselectedMatterClient,
    }),

  closeModal: () => set({ activeModal: null, preselectedMatterClient: null }),

  setPreselectedMatterClient: (client) => set({ preselectedMatterClient: client }),

  markAllRead: () => {
    set({ notificationsRead: true });
    toast.success("All notifications marked read");
  },
}));

export function useMatterActions() {
  const router = useRouter();
  const closeModal = useMockStore((s) => s.closeModal);
  const activeMatterId = useMockStore((s) => s.activeMatterId);

  const refresh = () => router.refresh();

  return {
    activeMatterId,
    closeModal,
    advanceStage: async (matterId: string) => {
      const result = await advanceStageAction(matterId);
      if (result.error) toast.error(result.error);
      else toast.success(`Advanced to ${result.stage}!`);
      refresh();
    },
    approveMatter: async (matterId: string) => {
      await approveMatterAction(matterId);
      toast.success("Matter approved");
      refresh();
    },
    toggleTask: async (taskId: string) => {
      const result = await toggleTaskAction(taskId);
      toast.success(result.done ? "Task completed" : "Task reopened");
      refresh();
    },
    approveFileNote: async (noteId: string, matterId: string) => {
      await approveFileNoteAction(noteId, matterId);
      toast.success("File note published");
      refresh();
    },
    mockLodge: async (matterId: string) => {
      await mockLodgeAction(matterId);
      toast.success("Lodgement submitted");
      refresh();
    },
    approveKyc: async (matterId: string) => {
      await approveKycAction(matterId);
      toast.success("KYC approved");
      refresh();
    },
    createMatter: async (name: string, clientPartyId: string, type: string) => {
      const result = await createMatterAction(name, clientPartyId, type);
      toast.success(`Matter created: ${name} (${result.displayId})`);
      closeModal();
      refresh();
    },
    addAdviserGroup: async (name: string) => {
      await addAdviserGroupAction(name);
      toast.success(`Adviser group added: ${name}`);
      closeModal();
      refresh();
    },
    addTask: async (title: string, assignee: string, due: string) => {
      await addTaskAction(activeMatterId, title, assignee, due);
      toast.success(`Task added: ${title}`);
      closeModal();
      refresh();
    },
    saveFileNote: async (subject: string, body: string, type: string, tags: string) => {
      await saveFileNoteAction(activeMatterId, subject, body, type, tags);
      toast.success("File note saved");
      closeModal();
      refresh();
    },
    uploadDoc: async (matterId: string, fileName: string) => {
      await addAuditEntryAction(matterId, "DOCUMENT_UPLOAD", fileName);
      toast.success(`Uploaded: ${fileName}`);
      closeModal();
      refresh();
    },
    sendClientMessage: async (subject: string) => {
      await addAuditEntryAction(activeMatterId, "MESSAGE_SENT_CLIENT", subject);
      toast.success(`Sent to client: ${subject}`);
      closeModal();
      refresh();
    },
    sendKycLink: async (member: string) => {
      await addAuditEntryAction(activeMatterId, "KYC_LINK_SENT", `Sent to ${member}`);
      toast.success(`KYC link sent to ${member}`);
      closeModal();
      refresh();
    },
    reassignMatter: async (matterId: string, stage: string, staff: string) => {
      await reassignMatterAction(matterId, stage, staff);
      toast.success(`Reassigned: ${stage} → ${staff}`);
      closeModal();
      refresh();
    },
    submitSignature: async (matterId: string, docName: string) => {
      await addAuditEntryAction(matterId, "DOCUMENT_SIGNED", docName);
      toast.success("Signed — IP & timestamp recorded");
      closeModal();
      refresh();
    },
    acceptHandoff: async (name: string) => {
      await addAuditEntryAction("", "HANDOFF_ACCEPTED", name);
      toast.success(`Handoff accepted for ${name}`);
      refresh();
    },
    approveCallNote: async () => {
      await approveCallNoteAction(activeMatterId);
      toast.success("Call note approved and published to file");
      closeModal();
      refresh();
    },
    saveProfile: (name?: string) => {
      toast.success(`Profile saved${name ? ` for ${name}` : ""}`);
      closeModal();
    },
    inviteUser: (email: string) => {
      if (email.includes("@")) toast.success(`Invite sent to ${email}`);
      else toast.error("Invalid email address");
    },
    saveDefaultAssignments: () => toast.success("Default stage assignments saved"),
    requestKycInfo: () => toast.success("KYC remediation request sent to client"),
  };
}
