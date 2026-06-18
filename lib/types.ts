export type Stage = "Start" | "Prepare" | "Check" | "Lodge" | "Active";

export type UiPartyType = "PERSON" | "COMPANY" | "TRUST";

export interface MatterSummary {
  id: string;
  name: string;
  sub: string;
  organisation: string;
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

export interface MatterDocument {
  id: string;
  name: string;
  financialYear: string;
  sizeLabel: string;
  modifiedAt: string;
  webUrl: string;
}

export interface Organisation {
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

export interface OrganisationMicrosoftIntegration {
  organisationId: string;
  microsoftTenantId: string | null;
  sharepointSiteId: string | null;
  sharepointDriveId: string | null;
}

export type PartyRoleLabel = "Trustee" | "Director" | "Authorised party" | "Member";

export interface ContactPerson {
  partyId: string;
  name: string;
  role: PartyRoleLabel;
  email: string | null;
  phone: string | null;
}

export interface CorporateTrusteeContact {
  partyId: string;
  name: string;
  acn: string | null;
  directors: ContactPerson[];
}

export interface MatterContacts {
  trust: { partyId: string; name: string; abn: string | null };
  individualTrustees: ContactPerson[];
  corporateTrustees: CorporateTrusteeContact[];
  authorisedParties: ContactPerson[];
}

export interface PartySearchResult {
  partyId: string;
  type: UiPartyType;
  name: string;
  detail: string | null;
}

export interface ClientSummary {
  id: string;
  name: string;
  abn: string | null;
  organisation: string;
  cbClass: string;
  matterCount: number;
}

export interface ClientMatterSummary {
  id: string;
  name: string;
  type: string;
  stage: Stage;
  pillClass: string;
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
