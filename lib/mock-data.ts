import type { AdviserGroup, AuditEntry, FileNote, Stage, StaffSession, Task } from "@/lib/types";

export const STAGES = ["Start", "Prepare", "Check", "Lodge", "Active"] as const;

export const STAGE_OWNER_MAP: Record<string, string> = {
  Start: "Sarah Chen",
  Prepare: "Emma Wilson",
  Check: "Michael Torres",
  Lodge: "Rachel Park",
  Active: "Sarah Chen",
};

export const STAGE_INITIALS: Record<string, string> = {
  Start: "SC",
  Prepare: "EW",
  Check: "MT",
  Lodge: "RP",
  Active: "SC",
};

export const STAGE_COLORS: Record<string, string> = {
  Start: "#3b82f6",
  Prepare: "#7c3aed",
  Check: "#059669",
  Lodge: "#dc2626",
  Active: "#e8591a",
};

export interface SeedMatter {
  id: string;
  matterName: string;
  clientName: string;
  abn: string | null;
  adviserGroupId: string;
  type: string;
  stage: Stage;
  due: string;
}

export const SEED_MATTERS: SeedMatter[] = [
  { id: "M001", matterName: "New SMSF Setup", clientName: "Smith Family Superannuation Fund", abn: "12 345 678 901", adviserGroupId: "liberty", type: "New SMSF", stage: "Check", due: "22 Mar" },
  { id: "M002", matterName: "Existing SMSF Onboarding", clientName: "Johnson Retirement Fund", abn: "45 678 901 234", adviserGroupId: "clime", type: "Existing", stage: "Prepare", due: "25 Mar" },
  { id: "M003", matterName: "Corporate Trustee Conversion", clientName: "Williams Super Fund", abn: "23 456 789 012", adviserGroupId: "aap", type: "Corp Trustee", stage: "Lodge", due: "28 Mar" },
  { id: "M004", matterName: "New SMSF Setup", clientName: "Brown Family Super", abn: null, adviserGroupId: "riverx", type: "New SMSF", stage: "Start", due: "30 Mar" },
  { id: "M005", matterName: "Annual Compliance", clientName: "Chen Investment Fund", abn: "34 567 890 123", adviserGroupId: "clime", type: "Compliance", stage: "Active", due: "—" },
  { id: "M006", matterName: "New SMSF Setup", clientName: "Davis Investment Fund", abn: "78 901 234 567", adviserGroupId: "liberty", type: "New SMSF", stage: "Check", due: "24 Mar" },
  { id: "M007", matterName: "New SMSF Setup", clientName: "Nguyen SMSF", abn: null, adviserGroupId: "riverx", type: "New SMSF", stage: "Prepare", due: "26 Mar" },
  { id: "M008", matterName: "New SMSF Setup", clientName: "Thompson SMSF", abn: null, adviserGroupId: "clime", type: "New SMSF", stage: "Lodge", due: "28 Mar" },
];

export const DEMO_ACCOUNTS: StaffSession[] = [
  { email: "sarah@aap.com.au", name: "Sarah Chen", role: "Master Owner", initials: "SC", color: "#e8591a" },
  { email: "emma@aap.com.au", name: "Emma Wilson", role: "Bookkeeper", initials: "EW", color: "#7c3aed" },
  { email: "michael@aap.com.au", name: "Michael Torres", role: "Compliance Officer", initials: "MT", color: "#059669" },
];

export const INITIAL_ADVISER_GROUPS: AdviserGroup[] = [
  { id: "clime", name: "Clime ASX", description: "Referrer · Financial planning", clients: 8, active: 5, contact: "David Chen · david@clime.com.au", letter: "C", bgColor: "#dbeafe", textColor: "#1d4ed8" },
  { id: "liberty", name: "Liberty", description: "Referrer · Mortgage broker", clients: 5, active: 3, contact: "Sarah Lane · sarah@liberty.com.au", letter: "L", bgColor: "#dcfce7", textColor: "#15803d" },
  { id: "riverx", name: "RiverX", description: "Referrer · Wealth management", clients: 3, active: 1, contact: "Mark Rivers · mark@riverx.com.au", letter: "R", bgColor: "#fdf4ff", textColor: "#7e22ce" },
];

export const INITIAL_AUDIT_LOG: AuditEntry[] = [
  { id: "a1", timestamp: "2026-03-20 10:42", user: "michael@aap", action: "KYC_APPROVED", detail: "Result: Pass · Provider: AAP Native", entity: "John Smith" },
  { id: "a2", timestamp: "2026-03-20 09:15", user: "emma@aap", action: "CALL_INITIATED", detail: "3CX ref #CX-4421 · Duration 8:14", entity: "M001" },
  { id: "a3", timestamp: "2026-03-20 09:38", user: "echo.notes", action: "CALL_NOTE_RECEIVED", detail: "Echo Notes #EN-2847 · Draft created", entity: "M001" },
  { id: "a4", timestamp: "2026-03-19 16:22", user: "emma@aap", action: "STAGE_ADVANCE", detail: "Prepare → Check · Handoff to Michael Torres", entity: "M001" },
  { id: "a5", timestamp: "2026-03-19 14:22", user: "michael@aap", action: "HANDOFF_ACCEPTED", detail: "Check stage accepted", entity: "M001" },
  { id: "a6", timestamp: "2026-03-19 09:15", user: "emma@aap", action: "DOCUMENT_UPLOAD", detail: "Trust_Deed.pdf · Trust Deed category", entity: "M001" },
];

export const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Collect signed trust deed", done: true, meta: "Completed 18 Mar · Emma Wilson" },
  { id: "t2", title: "Verify member TFN declarations", done: true, meta: "Completed 19 Mar · Emma Wilson" },
  { id: "t3", title: "Complete KYC for Mary Smith", done: false, meta: "Due 22 Mar · Michael Torres · Overdue" },
  { id: "t4", title: "ATO registration preparation", done: false, meta: "Due 25 Mar · Michael Torres" },
];

export const INITIAL_FILE_NOTES: FileNote[] = [
  { id: "fn1", type: "Call", subject: "Outbound call — Trust deed discussion", body: "Discussed trust deed requirements with John Smith. Client confirmed they have a copy of original deed from 2018.", author: "Emma Wilson", time: "20 Mar 2026 · 09:23", tags: ["trust deed", "kyc delay"], draft: true },
  { id: "fn2", type: "Internal note", subject: "KYC reminder sent to Mary Smith", body: "Automated reminder sent. Client overseas until 24 March.", author: "Michael Torres", time: "19 Mar 2026 · 14:10", tags: ["kyc"], pinned: true },
];
