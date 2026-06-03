import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StagePill } from "@/components/brand/stage-pill";

const TEAM = [
  {
    initials: "EW",
    name: "Emma Wilson",
    role: "Bookkeeper",
    stage: "Prepare stage",
    border: "border-brand-orange",
    bg: "bg-brand-purple-light text-brand-purple",
    bio: "Emma has 10 years of experience in SMSF bookkeeping and administration.",
    facts: ["Hobbies: surfing and swimming", "Has 2 dogs — Rusty and Pablo"],
  },
  {
    initials: "MT",
    name: "Michael Torres",
    role: "Compliance Officer — currently managing your file",
    stage: "Check stage ● Current",
    border: "border-brand-green",
    bg: "bg-brand-green-light text-brand-green",
    bio: "Michael specialises in SMSF compliance and KYC verification with 12 years of experience.",
    facts: ["Hobbies: football, cycling", "Coffee enthusiast"],
    current: true,
  },
];

export default function PortalTeamPage() {
  return (
    <>
      <h2 className="mb-1 text-[15px] font-bold">Your Admin Autopilot team</h2>
      <p className="mb-5 text-[13px] text-brand-text-2">
        The people managing your SMSF. Click any card to send them a message.
      </p>
      <div className="space-y-2">
        {TEAM.map((m) => (
          <div
            key={m.initials}
            className={`flex gap-4 rounded-brand border-2 bg-white p-5 ${m.border}`}
          >
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[22px] font-extrabold ${m.bg}`}>
              {m.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{m.name}</span>
                {m.current ? (
                  <StagePill stage="Check" pillClass="pill-check" className="text-[10px]" />
                ) : (
                  <span className="rounded-full bg-[#fdf4ff] px-2 py-0.5 text-[10px] font-semibold text-[#7e22ce]">{m.stage}</span>
                )}
              </div>
              <div className={`text-[13px] font-semibold ${m.current ? "text-brand-green" : "text-brand-orange"}`}>
                {m.role}
              </div>
              <p className="mt-2 text-[13px] text-brand-text-2">{m.bio}</p>
              <ul className="mt-2 space-y-1 text-xs text-brand-text-2">
                {m.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/portal/messages">Message {m.name.split(" ")[0]}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
