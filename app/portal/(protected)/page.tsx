import Link from "next/link";
import { StagePill } from "@/components/brand/stage-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientPortalMatter } from "@/lib/queries/matters";
import { getAppSession } from "@/lib/auth";
import { mapMatterContacts } from "@/lib/mappers";
import { STAGES } from "@/lib/mock-data";

const STAGE_PILL_MAP: Record<string, string> = {
  Start: "pill-start",
  Prepare: "pill-prepare",
  Check: "pill-check",
  Lodge: "pill-lodge",
  Active: "pill-active",
};

export default async function PortalOverviewPage() {
  const session = await getAppSession();
  const matter = session?.user
    ? await getClientPortalMatter(session.user.id)
    : null;

  const contacts = matter ? mapMatterContacts(matter.client) : null;
  const memberNames = contacts
    ? [
        ...contacts.individualTrustees.map((t) => t.name),
        ...contacts.corporateTrustees.flatMap((c) => c.directors.map((d) => d.name)),
      ]
    : [];

  const stageIdx = matter ? STAGES.indexOf(matter.stage) : 2;
  const stageProgress = STAGES.map((_, i) => {
    if (i < stageIdx) return 1;
    if (i === stageIdx) return 0.5;
    return 0.25;
  });

  return (
    <>
      <div className="mb-4 rounded-brand bg-gradient-to-br from-brand-primary to-brand-orange-2 p-6 text-white">
        <div className="text-xs opacity-80">Matter {matter?.displayId ?? "—"}</div>
        <h2 className="text-[22px] font-extrabold">{matter?.client.name ?? "Your SMSF"}</h2>
        <p className="text-[13px] opacity-85">
          {matter?.name ?? "New SMSF Setup"} · Default + Accounting · $999/yr
        </p>
        <div className="mt-4 flex gap-1.5">
          {stageProgress.map((o, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-sm bg-white" style={{ opacity: o }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] opacity-70">
          {STAGES.map((s, i) => (
            <span key={s} className={i === stageIdx ? "font-bold" : ""}>
              {s}{i === stageIdx ? " ◀" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-brand border-[1.5px] border-brand-amber bg-brand-amber-light p-4">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-brand-amber">Action required: Mary Smith KYC pending</div>
          <div className="text-xs text-brand-text-2">Complete identity verification to avoid lodgement delays.</div>
        </div>
        <Button size="sm" className="bg-brand-amber text-white hover:bg-brand-amber" asChild>
          <Link href="/portal/actions">Complete now →</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Matter progress</CardTitle></CardHeader>
        <CardContent className="space-y-0 p-0">
          {[
            ["ABN", contacts?.trust.abn ?? "—"],
            ["Members", memberNames.length > 0 ? memberNames.join(", ") : "—"],
            ["Current stage", null],
            ["Current custodian", matter?.owner?.name ? `${matter.owner.name}` : "Michael Torres (Compliance)"],
            ["Target completion", matter?.dueDate ? matter.dueDate.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "28 March 2026"],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between border-b border-brand-surface-2 px-[18px] py-2 text-[13px] last:border-0">
              <span className="text-brand-text-2">{label}</span>
              <span className="font-semibold">
                {label === "Current stage" && matter ? (
                  <StagePill stage={matter.stage} pillClass={STAGE_PILL_MAP[matter.stage] ?? "pill-check"} />
                ) : (
                  value
                )}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
