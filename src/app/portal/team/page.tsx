import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatterStage, StaffRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { initialsFromName, staffColorForRole, staffRoleLabel, stageLabel, stagePillClass } from "@/lib/display";

const STAGE_BY_ROLE: Partial<Record<StaffRole, MatterStage>> = {
  BOOKKEEPER: MatterStage.PREPARE,
  COMPLIANCE_OFFICER: MatterStage.CHECK,
  TAX_AGENT: MatterStage.LODGE,
};

export default async function PortalTeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: {
      matters: {
        include: {
          stageAssignments: {
            include: { staff: { include: { user: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  const matter = client?.matters[0];
  const currentStage = matter?.stage;

  // Build the team: all 4 staff (Bookkeeper, Compliance, Tax Agent, Master Owner)
  // — even if not yet assigned to this matter.
  const allStaff = await prisma.staff.findMany({
    where: { active: true, role: { in: [StaffRole.BOOKKEEPER, StaffRole.COMPLIANCE_OFFICER, StaffRole.TAX_AGENT, StaffRole.MASTER_OWNER] } },
    include: { user: true },
    orderBy: { role: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-bold">Your Admin Autopilot team</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">
          The people managing your SMSF. Click any card to send them a message.
        </p>
      </div>

      <div className="space-y-2">
        {allStaff.map((s) => {
          const initials = initialsFromName(s.user.name);
          const color = staffColorForRole(s.role);
          const ownsStage = STAGE_BY_ROLE[s.role];
          const isCurrent = ownsStage && ownsStage === currentStage;
          const isPast = ownsStage && matter && stageOrder(ownsStage) < stageOrder(currentStage ?? MatterStage.START);
          const isUpcoming = ownsStage && matter && stageOrder(ownsStage) > stageOrder(currentStage ?? MatterStage.START);
          return (
            <Link
              key={s.id}
              href="/portal/messages"
              className={cn(
                "flex items-start gap-4 rounded-xl border-[2px] bg-white p-5 transition-colors hover:shadow-md",
                isCurrent && "border-[color:var(--color-aap-green)]",
                isPast && "border-[color:var(--color-aap-orange)] opacity-90",
                isUpcoming && "opacity-70 border-[color:var(--color-aap-surface2)]",
                !ownsStage && "border-[color:var(--color-aap-surface2)]",
              )}
            >
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[22px] font-extrabold text-white"
                style={{ background: color }}
              >
                {initials}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[16px] font-bold">{s.user.name}</div>
                  {ownsStage ? (
                    <span
                      className={cn(
                        stagePillClass(ownsStage),
                        isCurrent && "ring-2 ring-[color:var(--color-aap-green)]",
                      )}
                      style={{ fontSize: 10 }}
                    >
                      {stageLabel(ownsStage)} stage{isCurrent ? " ● Current" : isPast ? " ✓ Done" : " — upcoming"}
                    </span>
                  ) : null}
                </div>
                <div
                  className="mt-0.5 text-[13px] font-semibold"
                  style={{ color: isCurrent ? "#16a34a" : color }}
                >
                  {staffRoleLabel(s.role)}
                  {isCurrent ? " — currently managing your file" : ""}
                </div>
                {s.bio ? (
                  <div className="mt-2 text-[13px] leading-6 text-[color:var(--color-aap-text2)]">
                    {s.bio}
                  </div>
                ) : null}
                {s.hobbies ? (
                  <div className="mt-2 rounded-lg bg-[color:var(--color-aap-surface)] px-3 py-2 text-[12px] text-[color:var(--color-aap-text2)]">
                    <span className="font-semibold">Outside work:</span> {s.hobbies}
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
                  >
                    💬 Message {s.user.name?.split(" ")[0]}
                  </button>
                  {isCurrent ? (
                    <button
                      type="button"
                      className="rounded-lg bg-[color:var(--color-aap-orange)] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)]"
                    >
                      📞 Request call
                    </button>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function stageOrder(s: MatterStage): number {
  return [MatterStage.START, MatterStage.PREPARE, MatterStage.CHECK, MatterStage.LODGE, MatterStage.ACTIVE].indexOf(s);
}
