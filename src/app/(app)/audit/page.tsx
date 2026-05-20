import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AuditPage() {
  const events = await prisma.auditAction.findMany({
    include: { user: true, matter: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Audit log</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">
          Immutable record of every significant action across the platform.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="grid grid-cols-[180px_180px_160px_1fr] gap-2 border-b bg-[color:var(--color-aap-surface)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[color:var(--color-aap-text3)]">
          <div>Timestamp</div>
          <div>User</div>
          <div>Matter</div>
          <div>Action / Detail</div>
        </div>
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[color:var(--color-aap-text3)]">
            No audit events yet.
          </div>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[180px_180px_160px_1fr] items-start gap-2 border-b border-[color:var(--color-aap-surface2)] px-4 py-2.5 text-[12px] last:border-b-0"
            >
              <div className="font-mono text-[11px] text-[color:var(--color-aap-text2)]">
                {new Date(e.createdAt).toLocaleString("en-AU")}
              </div>
              <div className="text-[12px]">{e.user?.name ?? "System"}</div>
              <div className="text-[12px]">
                {e.matter ? (
                  <Link href={`/matters/${e.matter.id}`} className="hover:text-[color:var(--color-aap-orange)]">
                    {e.matter.matterRef}
                  </Link>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span className="rounded-md bg-[color:var(--color-aap-surface2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-text2)]">
                  {e.action.replace(/_/g, " ")}
                </span>
                {e.details ? (
                  <span className="ml-2 text-[12px] text-[color:var(--color-aap-text2)]">{e.details}</span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
