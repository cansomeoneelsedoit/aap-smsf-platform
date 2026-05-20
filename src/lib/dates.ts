/**
 * Return-due-date helpers.
 *
 * Business rule (per Boyd): every SMSF fund has an ATO/ASIC return due date.
 * The final lodgement deadline for compliance is 15 May, so by convention
 * we set the *internal* due date to **1 May** when none is supplied.
 *
 * We aim to have the return COMPLETED two months prior to the due date —
 * so `targetCompletionDate = returnDueDate − 2 months`. A matter is
 * considered:
 *   - OVERDUE   → target completion date has passed AND matter not ACTIVE
 *   - DUE_SOON  → target completion within the next 14 days
 *   - APPROACHING → target completion within 14–60 days
 *   - ON_TRACK  → more than 60 days out
 *   - COMPLETE  → matter is in ACTIVE stage
 */

import type { MatterStage } from "@prisma/client";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AlertLevel = "OVERDUE" | "DUE_SOON" | "APPROACHING" | "ON_TRACK" | "COMPLETE";

/**
 * Default return due date when none is set on a matter.
 * Picks 1 May of the next applicable year (current year if today is before
 * May 1, otherwise next year).
 */
export function defaultReturnDueDate(now: Date = new Date()): Date {
  const year = now.getMonth() >= 4 ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(Date.UTC(year, 4, 1)); // month is 0-indexed; 4 = May
}

/** Resolve a matter's effective due date — explicit value or 1 May default. */
export function resolveReturnDueDate(returnDueDate: Date | null | undefined, now: Date = new Date()): Date {
  return returnDueDate ?? defaultReturnDueDate(now);
}

/** Target completion date is 2 months prior to the return due date. */
export function targetCompletionDate(returnDueDate: Date | null | undefined, now: Date = new Date()): Date {
  const due = resolveReturnDueDate(returnDueDate, now);
  const d = new Date(due);
  d.setUTCMonth(d.getUTCMonth() - 2);
  return d;
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / MS_PER_DAY);
}

export function alertLevel(
  stage: MatterStage,
  returnDueDate: Date | null | undefined,
  now: Date = new Date(),
): AlertLevel {
  if (stage === "ACTIVE") return "COMPLETE";
  const target = targetCompletionDate(returnDueDate, now);
  const days = daysUntil(target, now);
  if (days < 0) return "OVERDUE";
  if (days <= 14) return "DUE_SOON";
  if (days <= 60) return "APPROACHING";
  return "ON_TRACK";
}

export function alertLabel(level: AlertLevel): string {
  switch (level) {
    case "OVERDUE":
      return "Overdue";
    case "DUE_SOON":
      return "Due within 2 weeks";
    case "APPROACHING":
      return "Approaching target";
    case "ON_TRACK":
      return "On track";
    case "COMPLETE":
      return "Complete";
  }
}

export function alertTone(level: AlertLevel): { bg: string; fg: string; border: string } {
  switch (level) {
    case "OVERDUE":
      return { bg: "#fee2e2", fg: "#dc2626", border: "#dc2626" };
    case "DUE_SOON":
      return { bg: "#fef3c7", fg: "#d97706", border: "#d97706" };
    case "APPROACHING":
      return { bg: "#fef3ee", fg: "#e8591a", border: "#fcd9c7" };
    case "ON_TRACK":
      return { bg: "#dcfce7", fg: "#15803d", border: "#86efac" };
    case "COMPLETE":
      return { bg: "#f3f4f6", fg: "#6b7280", border: "#e5e7eb" };
  }
}

export function formatDueDate(date: Date): string {
  return date.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

/** Human-friendly delta like "in 12 days" / "5 days overdue" / "today". */
export function describeDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `in ${days} days`;
}
