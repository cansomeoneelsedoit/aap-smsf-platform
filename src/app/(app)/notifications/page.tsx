import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  // Reuse audit log as activity feed for v1; replace with dedicated table later.
  const events = await prisma.auditAction.findMany({
    include: { user: true, matter: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Notifications</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">
          Recent activity across your matters. Click an item to jump straight to its matter detail.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[color:var(--color-aap-text3)]">
            No recent activity.
          </div>
        ) : (
          <ul>
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-3 border-b border-[color:var(--color-aap-surface2)] px-4 py-3 last:border-b-0"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-aap-orange)]" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">
                    {e.matter ? <span>{e.matter.fundName} — </span> : null}
                    {e.action.replace(/_/g, " ").toLowerCase()}
                  </div>
                  {e.details ? (
                    <div className="text-[12px] text-[color:var(--color-aap-text2)]">{e.details}</div>
                  ) : null}
                  <div className="mt-0.5 text-[11px] text-[color:var(--color-aap-text3)]">
                    {new Date(e.createdAt).toLocaleString("en-AU")}
                    {e.user?.name ? ` · ${e.user.name}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
