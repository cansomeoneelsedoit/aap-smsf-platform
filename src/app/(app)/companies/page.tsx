import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MatterStage } from "@prisma/client";

const BG: Record<string, { bg: string; fg: string }> = {
  clime: { bg: "#dbeafe", fg: "#1d4ed8" },
  liberty: { bg: "#dcfce7", fg: "#15803d" },
  riverx: { bg: "#fdf4ff", fg: "#7e22ce" },
  aap: { bg: "#fef3ee", fg: "#e8591a" },
  other: { bg: "#f3f4f6", fg: "#374151" },
};

function colorKey(name: string): keyof typeof BG {
  const n = name.toLowerCase();
  if (n.includes("clime")) return "clime";
  if (n.includes("liberty")) return "liberty";
  if (n.includes("river")) return "riverx";
  if (n.includes("aap") || n.includes("admin autopilot")) return "aap";
  return "other";
}

export default async function CompaniesPage() {
  const companies = await prisma.companyGroup.findMany({
    include: { _count: { select: { matters: true } }, matters: { select: { stage: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Company groups</h2>
        <button
          type="button"
          disabled
          className="rounded-lg bg-[color:var(--color-aap-orange)] px-3.5 py-2 text-[13px] font-semibold text-white opacity-60"
          title="Add company UI coming soon"
        >
          + Add company
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => {
          const colors = BG[colorKey(c.name)];
          const activeCount = c.matters.filter((m) => m.stage === MatterStage.ACTIVE).length;
          return (
            <Link
              key={c.id}
              href={`/matters?q=${encodeURIComponent(c.name)}`}
              className="block rounded-xl border bg-white p-5 hover:border-[color:var(--color-aap-orange-border)] hover:shadow-md"
            >
              <div className="mb-3.5 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-extrabold"
                  style={{ background: colors.bg, color: colors.fg }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="text-[15px] font-bold">{c.name}</div>
                  <div className="text-[12px] text-[color:var(--color-aap-text2)]">
                    {c.type === "INTERNAL" ? "Internal" : c.type === "PARTNER" ? "Partner" : "Referrer"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
                    Clients
                  </div>
                  <div className="text-2xl font-extrabold">{c._count.matters}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
                    Active
                  </div>
                  <div className="text-2xl font-extrabold text-[color:var(--color-aap-green)]">
                    {activeCount}
                  </div>
                </div>
              </div>
              {c.contactEmail ? (
                <div className="mt-3 text-[12px] text-[color:var(--color-aap-text2)]">
                  Contact: {c.contactName ?? "—"} · {c.contactEmail}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
