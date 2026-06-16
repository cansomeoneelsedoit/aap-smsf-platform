"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartySearchInput } from "@/app/(main)/parties/components/party-search-input";
import { useMockStore, useMatterActions } from "@/hooks/use-mock-store";
import type { PartySearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

function ModalWrapper({
  id,
  title,
  size,
  children,
  footer,
}: {
  id: import("@/lib/types").ModalId;
  title: string;
  size?: "default" | "wide" | "sm";
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const activeModal = useMockStore((s) => s.activeModal);
  const closeModal = useMockStore((s) => s.closeModal);
  return (
    <Dialog open={activeModal === id} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SignModal() {
  const activeModal = useMockStore((s) => s.activeModal);
  const signDocName = useMockStore((s) => s.signDocName);
  const activeMatterId = useMockStore((s) => s.activeMatterId);
  const closeModal = useMockStore((s) => s.closeModal);
  const { submitSignature } = useMatterActions();
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (activeModal !== "sign" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    const pos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return [clientX - r.left, clientY - r.top];
    };
    const down = (e: MouseEvent | TouchEvent) => {
      drawing.current = true;
      const [x, y] = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      const [x, y] = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    const up = () => { drawing.current = false; };
    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", up);
    canvas.addEventListener("mouseleave", up);
    return () => {
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", up);
      canvas.removeEventListener("mouseleave", up);
    };
  }, [activeModal]);

  const clearSig = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
  };

  return (
    <Dialog open={activeModal === "sign"} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent size="wide">
        <DialogHeader>
          <DialogTitle>Sign: {signDocName || "document"}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>
          <p className="mb-4 text-[13px] text-brand-text-2">
            Draw your signature below or type your name. Your IP address and timestamp will be recorded.
          </p>
          <div className="mb-3.5 flex w-fit overflow-hidden rounded-brand-sm border-[1.5px] border-brand-border-2">
            <button
              type="button"
              className={cn("cursor-pointer px-4 py-1.5 text-[13px] font-semibold", mode === "draw" ? "bg-brand-orange text-white" : "bg-white text-brand-text-2")}
              onClick={() => setMode("draw")}
            >
              Draw
            </button>
            <button
              type="button"
              className={cn("cursor-pointer px-4 py-1.5 text-[13px] font-semibold", mode === "type" ? "bg-brand-orange text-white" : "bg-white text-brand-text-2")}
              onClick={() => setMode("type")}
            >
              Type name
            </button>
          </div>
          {mode === "draw" ? (
            <div>
              <div className="cursor-crosshair rounded-brand border-2 border-dashed border-brand-border-2 bg-[#fafafa] p-2">
                <canvas ref={canvasRef} width={480} height={160} className="block rounded-lg bg-white" />
              </div>
              <Button variant="outline" size="xs" className="mt-2" onClick={clearSig}>
                Clear
              </Button>
            </div>
          ) : (
            <div>
              <input
                className="w-full border-b-2 border-brand-border-2 bg-transparent py-2 font-signature text-[32px] text-brand-dark outline-none focus:border-brand-orange"
                placeholder="Type your full legal name…"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
              />
              <div className="mt-3 min-h-[60px] rounded-brand-sm border border-brand-border bg-[#fafafa] p-4 font-signature text-4xl text-brand-dark">
                {typedName}
              </div>
            </div>
          )}
          <div className="mt-3.5 rounded-brand-sm bg-brand-surface p-3 text-xs text-brand-text-2">
            <div>IP address: <strong>203.120.45.67</strong></div>
            <div>Timestamp: <strong>24 Mar 2026 · 10:42am AEST</strong></div>
            <div>Legally binding electronic signature</div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => submitSignature(activeMatterId, signDocName || "Document")}>
            Sign document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Modals() {
  const activeModal = useMockStore((s) => s.activeModal);
  const closeModal = useMockStore((s) => s.closeModal);
  const activeMatterId = useMockStore((s) => s.activeMatterId);
  const preselectedMatterClient = useMockStore((s) => s.preselectedMatterClient);
  const setPreselectedMatterClient = useMockStore((s) => s.setPreselectedMatterClient);
  const {
    acceptHandoff,
    saveProfile,
    saveFileNote,
    addAdviserGroup,
    approveCallNote,
    uploadDoc,
    sendClientMessage,
    sendKycLink,
    reassignMatter,
    createMatter,
    addTask,
  } = useMatterActions();

  const [fnSubject, setFnSubject] = useState("");
  const [fnBody, setFnBody] = useState("");
  const [fnType, setFnType] = useState("Internal note");
  const [fnTags, setFnTags] = useState("");
  const [groupName, setGroupName] = useState("");
  const [matterName, setMatterName] = useState("");
  const [matterClient, setMatterClient] = useState<PartySearchResult | null>(null);
  const [matterClientLocked, setMatterClientLocked] = useState(false);
  const [matterType, setMatterType] = useState("New SMSF Setup");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("Emma Wilson");
  const [taskDue, setTaskDue] = useState("");
  const [uploadFile, setUploadFile] = useState("uploaded_document.pdf");

  useEffect(() => {
    if (activeModal === "new-matter" && preselectedMatterClient) {
      setMatterClient(preselectedMatterClient);
      setMatterClientLocked(true);
      setPreselectedMatterClient(null);
    }
    if (activeModal !== "new-matter") {
      setMatterClient(null);
      setMatterName("");
      setMatterClientLocked(false);
    }
  }, [activeModal, preselectedMatterClient, setPreselectedMatterClient]);

  return (
    <>
      <SignModal />

      <ModalWrapper
        id="handoffs"
        title="Pending handoffs"
        footer={<Button variant="outline" onClick={closeModal}>Close</Button>}
      >
        {[
          { title: "Williams Corp Trustee → Lodge", sub: "Outgoing: Michael Torres · Incoming: Rachel Park", name: "Williams Corp" },
          { title: "Smith Family SMSF → Check", sub: "Outgoing: Emma Wilson · Incoming: Michael Torres", name: "Smith Family" },
        ].map((h) => (
          <div key={h.title} className="mb-2.5 rounded-brand-sm border-[1.5px] border-brand-amber p-3">
            <div className="text-[13px] font-semibold">{h.title}</div>
            <div className="text-xs text-brand-text-2">{h.sub}</div>
            <Button variant="green" size="xs" className="mt-2" onClick={() => acceptHandoff(h.name)}>
              Accept custody
            </Button>
          </div>
        ))}
      </ModalWrapper>

      <ModalWrapper
        id="staff-profile"
        title="Edit staff profile"
        size="wide"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => saveProfile("Emma Wilson")}>Save profile</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group"><Label>Full name</Label><Input defaultValue="Emma Wilson" /></div>
          <div className="form-group"><Label>Role</Label><Input defaultValue="Bookkeeper" /></div>
          <div className="col-span-2"><Label>Bio (visible to clients)</Label><Textarea defaultValue="Emma has 10 years of experience in SMSF bookkeeping and administration." rows={3} /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="new-filenote"
        title="Add file note"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => { saveFileNote(fnSubject, fnBody, fnType, fnTags); setFnSubject(""); setFnBody(""); }}>Save note</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div><Label>Type</Label>
            <Select value={fnType} onValueChange={setFnType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Internal note", "Call", "Email", "Meeting"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Subject</Label><Input value={fnSubject} onChange={(e) => setFnSubject(e.target.value)} placeholder="Brief subject…" /></div>
          <div><Label>Note</Label><Textarea value={fnBody} onChange={(e) => setFnBody(e.target.value)} rows={5} /></div>
          <div><Label>Tags</Label><Input value={fnTags} onChange={(e) => setFnTags(e.target.value)} placeholder="e.g. kyc, trust-deed" /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="new-company"
        title="Add adviser group"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => { if (groupName) addAdviserGroup(groupName); setGroupName(""); }}>Add adviser group</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div><Label>Adviser group name</Label><Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Clime ASX" /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="call-note"
        title="Call note — approve & publish"
        size="wide"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button variant="green" onClick={approveCallNote}>Approve & publish to file</Button>
          </>
        }
      >
        <div className="mb-3 rounded-brand-sm bg-brand-surface p-3 text-xs text-brand-text-2">
          3CX call ref: <strong>#CX-4421</strong> · Duration: <strong>8 min 14 sec</strong>
        </div>
        <div><Label>Subject</Label><Input defaultValue="Outbound call — Trust deed discussion" /></div>
        <div className="mt-3"><Label>Call note</Label><Textarea rows={6} defaultValue="Discussed trust deed requirements with John Smith." /></div>
      </ModalWrapper>

      <ModalWrapper
        id="upload-doc"
        title="Upload document"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => uploadDoc(activeMatterId, uploadFile)}>Upload</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div><Label>Financial year</Label>
            <Select defaultValue="FY2026"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="FY2026">FY2026</SelectItem><SelectItem value="FY2025">FY2025</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>File</Label><Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0]?.name ?? "document.pdf")} /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="message"
        title="Message client"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => { sendClientMessage(msgSubject); setMsgSubject(""); }}>Send message</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div><Label>To</Label><Input defaultValue="John Smith (john@smithfamily.com.au)" readOnly /></div>
          <div><Label>Subject</Label><Input value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} rows={4} /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="send-kyc"
        title="Send KYC verification link"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => sendKycLink("Mary Smith")}>Send KYC link</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div><Label>Member</Label>
            <Select defaultValue="mary"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="mary">Mary Smith</SelectItem><SelectItem value="john">John Smith</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="reassign"
        title="Reassign matter"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => reassignMatter(activeMatterId, "Check", "Michael Torres")}>Reassign & notify</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div><Label>Stage</Label><Input defaultValue="Check (current)" /></div>
          <div><Label>Assign to</Label><Input defaultValue="Michael Torres" /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        id="new-matter"
        title="New matter"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={() => {
                if (matterName && matterClient) {
                  createMatter(matterName, matterClient.partyId, matterType);
                  setMatterName("");
                  setMatterClient(null);
                }
              }}
            >
              Create & assign
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {matterClientLocked && matterClient ? (
            <>
              <div>
                <div className="text-[13px] font-semibold text-brand-dark">{matterClient.name}</div>
                {matterClient.detail && (
                  <div className="text-[11px] text-brand-text-3">{matterClient.detail}</div>
                )}
              </div>
              <div>
                <Label>Matter name</Label>
                <Input value={matterName} onChange={(e) => setMatterName(e.target.value)} placeholder="e.g. New SMSF Setup" />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Matter name</Label>
                <Input value={matterName} onChange={(e) => setMatterName(e.target.value)} placeholder="e.g. New SMSF Setup" />
              </div>
              <div>
                <Label>Client</Label>
                {matterClient ? (
                  <div className="flex items-center justify-between rounded-brand-sm border border-brand-border bg-brand-surface px-3 py-2">
                    <div>
                      <div className="text-[13px] font-medium">{matterClient.name}</div>
                      {matterClient.detail && (
                        <div className="text-[11px] text-brand-text-3">{matterClient.detail}</div>
                      )}
                    </div>
                    <Button variant="outline" size="xs" onClick={() => setMatterClient(null)}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <PartySearchInput
                    type="TRUST"
                    placeholder="Search existing clients…"
                    onSelect={setMatterClient}
                  />
                )}
              </div>
            </>
          )}
          <div><Label>Matter type</Label>
            <Select value={matterType} onValueChange={setMatterType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="New SMSF Setup">New SMSF Setup</SelectItem>
                <SelectItem value="Existing SMSF Onboarding">Existing SMSF Onboarding</SelectItem>
                <SelectItem value="Annual Compliance">Annual Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalWrapper>

      <Dialog open={activeModal === "add-task"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Add task</DialogTitle><DialogCloseButton /></DialogHeader>
          <DialogBody className="space-y-3">
            <div><Label>Task title</Label><Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} /></div>
            <div><Label>Assign to</Label>
              <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Emma Wilson", "Michael Torres", "Sarah Chen", "Rachel Park"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Due date</Label><Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} /></div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => { if (taskTitle) addTask(taskTitle, taskAssignee, taskDue); setTaskTitle(""); }}>Add task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "client-kyc"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>KYC Verification — Mary Smith</DialogTitle><DialogCloseButton /></DialogHeader>
          <DialogBody className="text-center py-5">
            <div className="text-4xl mb-3">🪪</div>
            <p className="text-[13px] text-brand-text-2 mb-4">We need to verify Mary Smith&apos;s identity.</p>
            <Button onClick={closeModal}>Start verification →</Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
