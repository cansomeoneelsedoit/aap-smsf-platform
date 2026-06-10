"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdviserGroupBadge } from "@/components/brand/adviser-group-badge";
import { StagePill } from "@/components/brand/stage-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatterContactsCard } from "@/components/matters/matter-contacts";
import { useMockStore, useMatterActions } from "@/hooks/use-mock-store";
import { STAGE_COLORS, STAGE_INITIALS, STAGE_OWNER_MAP, STAGES } from "@/lib/mock-data";
import type { FileNote, MatterContacts, MatterSummary, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MatterDetail({
  matterId,
  matter,
  contacts,
  tasks,
  fileNotes,
}: {
  matterId: string;
  matter: MatterSummary;
  contacts: MatterContacts;
  tasks: Task[];
  fileNotes: FileNote[];
}) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "overview";

  const openModal = useMockStore((s) => s.openModal);
  const {
    advanceStage,
    approveMatter,
    toggleTask,
    approveFileNote,
    mockLodge,
    approveKyc,
  } = useMatterActions();

  useEffect(() => {
    useMockStore.setState({ activeMatterId: matterId });
  }, [matterId]);

  const stageIdx = STAGES.indexOf(matter.stage);

  return (
    <>
      <Link href="/clients">
        <Button variant="outline" size="xs" className="mb-3.5">
          ← Back to clients
        </Button>
      </Link>

      <Card className="mb-4 p-5">
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <StagePill stage={matter.stage} pillClass={matter.pillClass} />
          <span className="text-xs text-brand-text-3">
            Matter <strong>{matter.id}</strong>
          </span>
          <AdviserGroupBadge name={matter.adviserGroup} cbClass={matter.cbClass} />
          <Badge variant="amber" className="ml-auto">KYC review</Badge>
        </div>
        <h2 className="text-[22px] font-extrabold tracking-tight">{matter.name}</h2>
        <p className="text-[13px] text-brand-text-2">{matter.sub}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex max-w-[480px] flex-1 items-center">
            {STAGES.map((s, i) => {
              const done = i < stageIdx;
              const current = i === stageIdx;
              return (
                <div key={s} className="relative flex flex-1 flex-col items-center">
                  {i > 0 && (
                    <div
                      className={cn(
                        "absolute top-3.5 right-1/2 left-[-50%] h-0.5 z-0",
                        done || current ? "bg-brand-green" : "bg-brand-border"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                      done && "border-brand-green bg-brand-green text-white",
                      current && "border-brand-orange bg-brand-orange text-white",
                      !done && !current && "border-brand-border-2 bg-white text-brand-text-3"
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-[11px] font-semibold",
                      current ? "text-brand-orange" : done ? "text-brand-green" : "text-brand-text-3"
                    )}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => advanceStage(matterId)}>
              Advance →
            </Button>
            <Button size="sm" onClick={() => approveMatter(matterId)}>
              Approve
            </Button>
          </div>
        </div>
      </Card>

      <div className="mb-4">
        <MatterContactsCard matterId={matterId} contacts={contacts} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STAGES.map((s, i) => {
          const done = i < stageIdx;
          const active = i === stageIdx;
          return (
            <div
              key={s}
              className={cn(
                "flex min-w-[140px] flex-1 items-center gap-2.5 rounded-brand-sm border-[1.5px] border-brand-border bg-white p-3",
                active && "border-brand-orange bg-brand-orange-light",
                done && "border-brand-green bg-[#f0fdf4] opacity-70"
              )}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: STAGE_COLORS[s] }}
              >
                {STAGE_INITIALS[s]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase text-brand-text-3">{s}</div>
                <div className="truncate text-xs font-semibold">{STAGE_OWNER_MAP[s]}</div>
                <div className={cn("text-[10px]", active ? "text-brand-orange" : done ? "text-brand-green" : "text-brand-text-3")}>
                  {done ? "✓ Completed" : active ? "● Active" : "Pending handoff"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Tabs defaultValue={defaultTab} className="min-w-0">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="filenotes">File Notes</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="lodgement">Lodgement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader><CardTitle>Entity details</CardTitle></CardHeader>
              <CardContent className="space-y-0 p-0">
                {[
                  ["SMSF name", contacts.trust.name],
                  ["ABN", contacts.trust.abn ?? "—"],
                  ["Package", "Default + Accounting — $999/yr"],
                  ["Adviser group", matter.adviserGroup],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-brand-surface-2 px-[18px] py-2 text-[13px] last:border-0">
                    <span className="text-brand-text-2">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="mb-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => openModal("add-task", { matterId })}>
                + Add task
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-start gap-2.5 rounded-brand-sm border border-brand-border bg-white p-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border-2 border-brand-border-2",
                      t.done && "border-brand-green bg-brand-green text-[11px] font-extrabold text-white"
                    )}
                  >
                    {t.done && "✓"}
                  </button>
                  <div>
                    <div className={cn("text-[13px] font-medium", t.done && "line-through text-brand-text-3")}>{t.title}</div>
                    <div className="text-[11px] text-brand-text-3">{t.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="mb-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => openModal("upload-doc", { matterId })}>
                ↑ Upload
              </Button>
            </div>
            <Card>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center gap-2.5 rounded-brand-sm border border-brand-border p-3">
                  <span>📋</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">Smith_Family_SMSF_Trust_Deed.pdf</div>
                    <div className="text-[11px] text-brand-text-3">FY2026 · 2.1 MB · 18 Mar 2026</div>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => openModal("sign", { signDocName: "Trust Deed" })}>
                    Sign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filenotes">
            <div className="mb-3">
              <Button variant="outline" size="sm" onClick={() => openModal("new-filenote", { matterId })}>
                + Add note
              </Button>
            </div>
            <div className="space-y-2.5">
              {fileNotes.map((fn) => (
                <div
                  key={fn.id}
                  className={cn(
                    "rounded-brand border border-brand-border bg-white p-4",
                    fn.pinned && "border-brand-amber bg-[#fffbeb]"
                  )}
                >
                  <div className="mb-2 font-semibold">{fn.subject}</div>
                  <div className="text-[11px] text-brand-text-3 mb-2">{fn.time} · {fn.author} · {fn.type}</div>
                  <p className="text-[13px] text-brand-text-2">{fn.body}</p>
                  {fn.draft && (
                    <Button variant="outline" size="xs" className="mt-2" onClick={() => approveFileNote(fn.id, matterId)}>
                      Approve draft
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardContent className="pt-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase text-brand-text-3">
                      <th className="pb-2">Member</th><th>Result</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">John Smith</td>
                      <td><Badge variant="green">Pass</Badge></td>
                      <td><Button variant="outline" size="xs">View</Button></td>
                    </tr>
                    <tr>
                      <td className="py-2">Mary Smith</td>
                      <td><Badge variant="amber">In progress</Badge></td>
                      <td><Button variant="outline" size="xs" onClick={() => approveKyc(matterId)}>Approve</Button></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="pt-4">
                <p className="text-[13px] text-brand-text-2">Internal message thread with client team.</p>
                <div className="mt-3 flex gap-2">
                  <Input placeholder="Type a message…" className="flex-1" />
                  <Button size="sm">Send</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="space-y-3 pt-4 text-[13px]">
                <div><strong>20 Mar</strong> — Stage advanced to Check</div>
                <div><strong>19 Mar</strong> — Trust deed uploaded</div>
                <div><strong>18 Mar</strong> — Matter created</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lodgement">
            <Card>
              <CardContent className="pt-4">
                <p className="mb-3 text-[13px] text-brand-text-2">Ready for mock lodgement submission.</p>
                <Button onClick={() => mockLodge(matterId)}>Lodge (mock)</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="h-fit">
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-1.5 p-3">
            {[
              { label: "↑ Upload document", modal: "upload-doc" as const },
              { label: "🪪 Send KYC link", modal: "send-kyc" as const },
              { label: "✉ Message client", modal: "message" as const },
              { label: "📝 Add file note", modal: "new-filenote" as const },
              { label: "👤 Reassign", modal: "reassign" as const },
            ].map((a) => (
              <Button key={a.label} variant="outline" size="sm" className="w-full justify-start" onClick={() => openModal(a.modal, { matterId })}>
                {a.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="w-full justify-start text-brand-orange" onClick={() => advanceStage(matterId)}>
              → Advance stage
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
