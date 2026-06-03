export type Stage = "Start" | "Prepare" | "Check" | "Lodge" | "Active";

export type CompanyGroup = "Clime ASX" | "Liberty" | "RiverX" | "AAP";

export interface Client {
  id: string;
  name: string;
  sub: string;
  company: CompanyGroup | string;
  cbClass: string;
  type: string;
  stage: Stage;
  pillClass: string;
  owner: string;
  due: string;
}

export interface StaffSession {
  email: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
  entity: string;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  meta: string;
}

export interface FileNote {
  id: string;
  type: string;
  subject: string;
  body: string;
  author: string;
  time: string;
  tags: string[];
  pinned?: boolean;
  draft?: boolean;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  clients: number;
  active: number;
  contact: string;
  letter: string;
  bgColor: string;
  textColor: string;
}

export type ModalId =
  | "sign"
  | "handoffs"
  | "staff-profile"
  | "new-filenote"
  | "new-company"
  | "call-note"
  | "upload-doc"
  | "message"
  | "send-kyc"
  | "reassign"
  | "new-matter"
  | "client-kyc"
  | "add-task";
