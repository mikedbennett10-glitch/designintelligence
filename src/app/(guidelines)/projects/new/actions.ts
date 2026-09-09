"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface CreateProjectResult {
  ok: boolean;
  message: string;
}

/**
 * Registers a new DIP project record (WBS 6.1.2). Deliberately thin: only
 * the shared key with Procore, guideline scope, and room types in scope.
 * Everything else about the project lives in Procore and is read on
 * demand (per WBS 6.1.1) — never duplicated here. The edition lock itself
 * is a separate action (WBS 6.2, at Schematic Design), not set at
 * registration.
 */
export async function createProject(
  _prev: CreateProjectResult | null,
  formData: FormData
): Promise<CreateProjectResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }

  const procoreProjectNumber = String(formData.get("procoreProjectNumber") ?? "").trim();
  const guidelineTypes = formData.getAll("guidelineTypes").map(String);
  const roomTypesInScope = formData.getAll("roomTypesInScope").map(String);

  if (!procoreProjectNumber) {
    return { ok: false, message: "Procore project number is required." };
  }
  if (guidelineTypes.length === 0) {
    return { ok: false, message: "Choose at least one guideline type." };
  }

  const supabase = await createClient();
  const projectsTable = supabase.from("projects") as unknown as {
    insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };

  const { error } = await projectsTable.insert({
    procore_project_number: procoreProjectNumber,
    guideline_types: guidelineTypes,
    room_types_in_scope: roomTypesInScope,
  });

  if (error) {
    const message = error.message.includes("duplicate key")
      ? `A project with number ${procoreProjectNumber} already exists.`
      : `Couldn't create the project: ${error.message}`;
    return { ok: false, message };
  }

  return { ok: true, message: `Project ${procoreProjectNumber} registered.` };
}
