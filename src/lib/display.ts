import type { StaffRole, MatterStage, CompanyGroup } from "@prisma/client";

export function initialsFromName(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Brand colors per staff role (matches v4 avatars: Sarah orange, Emma purple,
// Michael green, Rachel red).
export function staffColorForRole(role?: StaffRole | null): string {
  switch (role) {
    case "MASTER_OWNER":
      return "#e8591a"; // orange
    case "BOOKKEEPER":
      return "#7c3aed"; // purple
    case "COMPLIANCE_OFFICER":
      return "#059669"; // green
    case "TAX_AGENT":
      return "#dc2626"; // red
    case "ADMIN":
      return "#2563eb"; // blue
    default:
      return "#6b7280"; // gray
  }
}

export function staffRoleLabel(role?: StaffRole | null): string {
  switch (role) {
    case "MASTER_OWNER":
      return "Master Owner";
    case "BOOKKEEPER":
      return "Bookkeeper";
    case "COMPLIANCE_OFFICER":
      return "Compliance Officer";
    case "TAX_AGENT":
      return "Tax Agent";
    case "ADMIN":
      return "Admin";
    default:
      return "Staff";
  }
}

export function stagePillClass(stage: MatterStage): string {
  return `aap-stage-pill ${stage.toLowerCase()}`;
}

export function stageLabel(stage: MatterStage): string {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

export function companyBadgeClass(name?: string | null): string {
  if (!name) return "aap-company-badge other";
  const n = name.toLowerCase();
  if (n.includes("clime")) return "aap-company-badge clime";
  if (n.includes("liberty")) return "aap-company-badge liberty";
  if (n.includes("river")) return "aap-company-badge riverx";
  if (n.includes("aap") || n.includes("admin autopilot")) return "aap-company-badge aap";
  return "aap-company-badge other";
}

export function companyShortName(c?: Pick<CompanyGroup, "name"> | null): string {
  if (!c?.name) return "—";
  // Short display version (e.g. "Admin Autopilot" -> "AAP")
  if (c.name.toLowerCase().includes("admin autopilot")) return "AAP";
  return c.name;
}
