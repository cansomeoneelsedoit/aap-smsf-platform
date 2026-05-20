"use client";

import { useState, useTransition } from "react";
import { Pencil, X, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { alertLabel, alertLevel, alertTone, describeDays, daysUntil, formatDueDate, resolveReturnDueDate, targetCompletionDate } from "@/lib/dates";
import type { MatterStage } from "@prisma/client";
import { updateReturnDueDate } from "./actions";

export function DueDateCard({
  matterId,
  stage,
  returnDueDate,
}: {
  matterId: string;
  stage: MatterStage;
  /** ISO string or null — null means using the 1 May default. */
  returnDueDate: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(returnDueDate ? returnDueDate.slice(0, 10) : "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dueDate = returnDueDate ? new Date(returnDueDate) : null;
  const now = new Date();
  const resolvedDue = resolveReturnDueDate(dueDate, now);
  const target = targetCompletionDate(dueDate, now);
  const lvl = alertLevel(stage, dueDate, now);
  const tone = alertTone(lvl);
  const days = daysUntil(target, now);

  function save() {
    setError(null);
    const fd = new FormData();
    fd.set("matterId", matterId);
    fd.set("returnDueDate", draft); // empty string clears the explicit date
    startTransition(async () => {
      const res = await updateReturnDueDate(fd);
      if (res.ok) {
        setEditing(false);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: tone.border }}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-[13px] font-bold">Return due date</div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-[color:var(--color-aap-surface2)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
            aria-label="Edit return due date"
          >
            <Pencil className="inline h-3 w-3" /> Edit
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(returnDueDate ? returnDueDate.slice(0, 10) : "");
                setError(null);
              }}
              className="rounded-md border border-[color:var(--color-aap-surface2)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-red)] hover:text-[color:var(--color-aap-red)]"
              aria-label="Cancel"
            >
              <X className="inline h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="rounded-md bg-[color:var(--color-aap-orange)] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)] disabled:opacity-60"
            >
              <Check className="inline h-3 w-3" /> {pending ? "Saving" : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        {!editing ? (
          <>
            <div className="text-[22px] font-extrabold tracking-tight" style={{ color: tone.fg }}>
              {formatDueDate(resolvedDue)}
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--color-aap-text2)]">
              {returnDueDate ? "Explicit due date set" : "Defaulted to 1 May (15 May lodgement deadline)"}
            </div>
            <div className="mt-3 rounded-lg px-3 py-2" style={{ background: tone.bg }}>
              <div
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: tone.fg }}
              >
                {alertLabel(lvl)}
              </div>
              <div className="text-[12px]" style={{ color: tone.fg }}>
                Target completion <strong>{formatDueDate(target)}</strong>
                {lvl !== "COMPLETE" ? ` · ${describeDays(days)}` : ""}
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="text-[11px] font-semibold text-[color:var(--color-aap-text2)]">
              Return due date
            </label>
            <input
              type="date"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-1 w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
            />
            <p className="mt-2 text-[11px] text-[color:var(--color-aap-text3)]">
              Clear the date to revert to the 1 May default. Target completion is automatically 2 months prior.
            </p>
            {error ? (
              <p className="mt-2 text-[12px] text-[color:var(--color-aap-red)]">{error}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
