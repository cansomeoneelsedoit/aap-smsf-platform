"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

async function requireMasterOwnerSession() {
  const { getAppSession } = await import("@/lib/auth");
  const session = await getAppSession();
  if (!session?.user || session.user.accountType !== "STAFF") {
    throw new Error("Unauthorised");
  }
  if (session.user.staffRole !== "MASTER_OWNER") {
    throw new Error("Unauthorised");
  }
  return session;
}

const BRAND_COLORS = [
  { bg: "#dbeafe", text: "#1d4ed8", cbClass: "cb-clime" },
  { bg: "#dcfce7", text: "#15803d", cbClass: "cb-liberty" },
  { bg: "#fdf4ff", text: "#7e22ce", cbClass: "cb-riverx" },
  { bg: "#fff7ed", text: "#c2410c", cbClass: "cb-aap" },
  { bg: "#f3f4f6", text: "#374151", cbClass: "cb-other" },
];

export interface CreateOrganisationInput {
  name: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
}

export async function createOrganisationAction(input: CreateOrganisationInput) {
  await requireMasterOwnerSession();

  const name = input.name.trim();
  if (!name) {
    throw new Error("Organisation name is required");
  }

  const pick = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
  const id = `org-${Date.now()}`;
  const description = input.description?.trim() || "New organisation";
  const contactName = input.contactName?.trim() || "No contact";
  const contactEmail = input.contactEmail?.trim() || "contact@example.com";

  await prisma.organisation.create({
    data: {
      id,
      name,
      description,
      contactName,
      contactEmail,
      letter: name[0]?.toUpperCase() ?? "?",
      bgColor: pick.bg,
      textColor: pick.text,
      cbClass: pick.cbClass,
    },
  });

  revalidatePath("/admin/organisations");
  revalidatePath("/companies");
  return { success: true, id };
}
