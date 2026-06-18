import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuditLog } from "@/lib/queries/matters";
import { mapAuditEntryToUi } from "@/lib/mappers";

export default async function AuditLogPage() {
  const entries = await getAuditLog();
  const auditLog = entries.map(mapAuditEntryToUi);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <span className="text-xs text-brand-text-3">Immutable record</span>
      </CardHeader>
      <div className="grid grid-cols-[160px_160px_1fr_120px] gap-2 border-b border-brand-border bg-brand-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-brand-text-3">
        <span>Timestamp</span>
        <span>User</span>
        <span>Action & details</span>
        <span>Entity</span>
      </div>
      {auditLog.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[160px_160px_1fr_120px] gap-2 border-b border-brand-surface-2 px-4 py-2.5 text-xs items-center"
        >
          <span className="font-mono text-brand-text-2">{row.timestamp}</span>
          <span>{row.user}</span>
          <span>
            <strong>{row.action}</strong>
            {row.detail ? ` — ${row.detail}` : ""}
          </span>
          <span>{row.entity}</span>
        </div>
      ))}
    </Card>
  );
}
