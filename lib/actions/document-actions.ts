"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MAX_UPLOAD_BYTES } from "@/lib/microsoft-graph/constants";
import {
  isMicrosoftGraphConfigError,
  isMicrosoftGraphError,
} from "@/lib/microsoft-graph/errors";
import { uploadMatterDocument } from "@/lib/microsoft-graph/sharepoint";
import { getMatterSharePointContext } from "@/lib/queries/documents";

async function requireStaffSession() {
  const { getAppSession } = await import("@/lib/auth");
  const session = await getAppSession();
  if (!session?.user || session.user.accountType !== "STAFF") {
    throw new Error("Unauthorised");
  }
  return session;
}

async function addAuditEntry(
  matterDisplayId: string,
  action: string,
  detail: string,
  userId: string
) {
  const matter = await prisma.matter.findUnique({ where: { displayId: matterDisplayId } });

  await prisma.auditEntry.create({
    data: {
      id: crypto.randomUUID(),
      action,
      detail,
      entity: matterDisplayId,
      userId,
      matterId: matter?.id,
    },
  });
}

export async function uploadDocumentAction(
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await requireStaffSession();

    const matterDisplayId = formData.get("matterDisplayId");
    const financialYear = formData.get("financialYear");
    const file = formData.get("file");

    if (typeof matterDisplayId !== "string" || !matterDisplayId.trim()) {
      return { error: "Matter is required" };
    }

    if (typeof financialYear !== "string" || !financialYear.trim()) {
      return { error: "Financial year is required" };
    }

    if (!(file instanceof File)) {
      return { error: "Please select a file to upload" };
    }

    if (file.size === 0) {
      return { error: "The selected file is empty" };
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "File must be 4 MB or smaller" };
    }

    const context = await getMatterSharePointContext(matterDisplayId);
    if (!context) {
      return {
        error: "SharePoint is not configured for this matter's organisation",
      };
    }

    const content = await file.arrayBuffer();

    await uploadMatterDocument(
      context.config,
      context.matterDisplayId,
      financialYear.trim(),
      file.name,
      content,
      file.type
    );

    await addAuditEntry(
      matterDisplayId,
      "DOCUMENT_UPLOAD",
      `${financialYear.trim()} · ${file.name}`,
      session.user.id
    );

    revalidatePath("/admin/audit-log");
    revalidatePath(`/matters/${matterDisplayId}`);

    return { success: true };
  } catch (error) {
    if (isMicrosoftGraphConfigError(error)) {
      return { error: error.message };
    }
    if (isMicrosoftGraphError(error)) {
      return { error: error.message };
    }
    throw error;
  }
}
