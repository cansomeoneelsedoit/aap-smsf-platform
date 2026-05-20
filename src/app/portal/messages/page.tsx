import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initialsFromName, staffColorForRole } from "@/lib/display";

// Placeholder thread — wire up to a real Message model in a follow-up.
type Bubble = {
  fromStaff: boolean;
  authorName: string;
  initials: string;
  color: string;
  timestamp: string;
  body: string;
};

export default async function PortalMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: {
      matters: {
        include: {
          stageAssignments: { include: { staff: { include: { user: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  const matter = client?.matters[0];
  const owner = matter?.stageAssignments.find((a) => a.stage === matter.stage)?.staff;

  const previousOwners = matter?.stageAssignments
    .filter((a) => a.stage !== matter.stage)
    .map((a) => a.staff) ?? [];

  // Synthesised demo messages for v1 (until a Message model lands).
  const bubbles: Bubble[] = [];

  const prevStaff = previousOwners[0];
  if (prevStaff) {
    bubbles.push({
      fromStaff: true,
      authorName: prevStaff.user.name ?? "Team",
      initials: initialsFromName(prevStaff.user.name),
      color: staffColorForRole(prevStaff.role),
      timestamp: "Yesterday 2:14pm",
      body: "Hi! Your trust deed has been received. We've sent a KYC link to the remaining member — please complete it at your earliest convenience.",
    });
  }
  bubbles.push({
    fromStaff: false,
    authorName: client?.fullName ?? "You",
    initials: initialsFromName(client?.fullName),
    color: "#1d4ed8",
    timestamp: "Yesterday 4:01pm",
    body: "Thanks! Will follow up with them shortly.",
  });
  if (owner) {
    bubbles.push({
      fromStaff: true,
      authorName: owner.user.name ?? "Team",
      initials: initialsFromName(owner.user.name),
      color: staffColorForRole(owner.role),
      timestamp: "Today 9:05am",
      body: `Hi ${client?.fullName?.split(" ")[0] ?? "there"}, I've taken over the ${stageWord(matter?.stage ?? "CHECK")} for your file. We're on track — let me know if any questions about the process.`,
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-bold">Messages from your team</h2>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center gap-2.5 border-b bg-[color:var(--color-aap-surface)] px-4 py-3">
          {owner ? (
            <>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: staffColorForRole(owner.role) }}
              >
                {initialsFromName(owner.user.name)}
              </span>
              <div className="text-[13px] font-semibold">
                {owner.user.name} &amp; your team
              </div>
            </>
          ) : (
            <div className="text-[13px] font-semibold">Your team</div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          {bubbles.map((b, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${b.fromStaff ? "" : "justify-end"}`}
            >
              {b.fromStaff ? (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: b.color }}
                >
                  {b.initials}
                </span>
              ) : null}
              <div
                className={`max-w-[70%] rounded-lg px-3.5 py-2.5 ${
                  b.fromStaff
                    ? "rounded-tl-none bg-[color:var(--color-aap-surface)]"
                    : "rounded-tr-none bg-[color:var(--color-aap-orange)] text-white"
                }`}
              >
                <div
                  className={`mb-1 text-[11px] ${
                    b.fromStaff ? "text-[color:var(--color-aap-text3)]" : "text-white/80"
                  }`}
                >
                  {b.authorName} · {b.timestamp}
                </div>
                <div className="text-[13px]">{b.body}</div>
              </div>
              {!b.fromStaff ? (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: b.color }}
                >
                  {b.initials}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t px-4 py-3">
          <input
            type="text"
            placeholder="Reply to your team…"
            className="flex-1 rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
            disabled
          />
          <button
            type="button"
            disabled
            title="Message sending coming soon"
            className="rounded-lg bg-[color:var(--color-aap-orange)] px-4 py-2 text-[13px] font-semibold text-white opacity-60"
          >
            Send
          </button>
        </div>
      </div>
      <p className="text-[11px] text-[color:var(--color-aap-text3)]">
        Note: messaging is read-only in this preview. A Message model and live thread land in the next release.
      </p>
    </div>
  );
}

function stageWord(s: string): string {
  switch (s) {
    case "START": return "intake";
    case "PREPARE": return "preparation";
    case "CHECK": return "compliance review";
    case "LODGE": return "lodgement";
    case "ACTIVE": return "ongoing administration";
    default: return s;
  }
}
