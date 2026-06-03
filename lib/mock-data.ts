import type { AuditEntry, Client, Company, FileNote, StaffSession, Task } from "@/lib/types";

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

export const INITIAL_CLIENTS: Client[] = [
  { id: "M001", name: "Smith Family SMSF", sub: "M001 · ABN 12 345 678 901", company: "Liberty", cbClass: "cb-liberty", type: "New SMSF", stage: "Check", pillClass: "pill-check", owner: "M. Torres", due: "22 Mar" },
  { id: "M002", name: "Johnson Retirement Fund", sub: "M002 · ABN 45 678 901 234", company: "Clime ASX", cbClass: "cb-clime", type: "Existing", stage: "Prepare", pillClass: "pill-prepare", owner: "E. Wilson", due: "25 Mar" },
  { id: "M003", name: "Williams Corp Trustee", sub: "M003 · ACN 098 765 432", company: "AAP", cbClass: "cb-aap", type: "Corp Trustee", stage: "Lodge", pillClass: "pill-lodge", owner: "R. Park", due: "28 Mar" },
  { id: "M004", name: "Brown Family Super", sub: "M004 · New client", company: "RiverX", cbClass: "cb-riverx", type: "New SMSF", stage: "Start", pillClass: "pill-start", owner: "E. Wilson", due: "30 Mar" },
  { id: "M005", name: "Chen Investment Fund", sub: "M005 · Annual compliance", company: "Clime ASX", cbClass: "cb-clime", type: "Compliance", stage: "Active", pillClass: "pill-active", owner: "S. Chen", due: "—" },
  { id: "M006", name: "Davis Investment Fund", sub: "M006 · ABN 78 901 234 567", company: "Liberty", cbClass: "cb-liberty", type: "New SMSF", stage: "Check", pillClass: "pill-check", owner: "S. Chen", due: "24 Mar" },
  { id: "M007", name: "Nguyen SMSF", sub: "M007 · New client", company: "RiverX", cbClass: "cb-riverx", type: "New SMSF", stage: "Prepare", pillClass: "pill-prepare", owner: "E. Wilson", due: "26 Mar" },
  { id: "M008", name: "Thompson SMSF", sub: "M008 · ATO ready", company: "Clime ASX", cbClass: "cb-clime", type: "New SMSF", stage: "Lodge", pillClass: "pill-lodge", owner: "R. Park", due: "28 Mar" },
];

export const DEMO_ACCOUNTS: StaffSession[] = [
  { email: "sarah@aap.com.au", name: "Sarah Chen", role: "Master Owner", initials: "SC", color: "#e8591a" },
  { email: "emma@aap.com.au", name: "Emma Wilson", role: "Bookkeeper", initials: "EW", color: "#7c3aed" },
  { email: "michael@aap.com.au", name: "Michael Torres", role: "Compliance Officer", initials: "MT", color: "#059669" },
];

export const INITIAL_COMPANIES: Company[] = [
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

export const COMPANY_CB_MAP: Record<string, string> = {
  "Clime ASX": "cb-clime",
  Liberty: "cb-liberty",
  RiverX: "cb-riverx",
  AAP: "cb-aap",
};
