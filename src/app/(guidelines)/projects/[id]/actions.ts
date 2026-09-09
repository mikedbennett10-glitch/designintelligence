"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface LockResult {
  ok: boolean;
  message: string;
}

/**
 * Locks (WBS 6.2.1) or re-locks/"adopts" (WBS 6.2.4) a project to the
 * current edition of its guideline type. Both are the same underlying
 * update — set edition_lock_id + lock_date to the current edition — the
 * WBS only distinguishes them by when they happen (first lock at
 * Schematic Design vs. a later deliberate adoption) and by lock_event,
 * which is set once on first lock and left alone on every later
 * re-lock/adoption.
 *
 * Real email notification (WBS 6.2.2's "notify all project team
 * members") isn't wired up — this app has no email provider configured.
 * The lock still takes effect; only the notification is missing.
 */
export async function lockToCurrentEdition(
  projectId: number,
  guidelineType: "AMBULATORY" | "ACUTE"
): Promise<LockResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }

  const supabase = await createClient();

  const { data: currentEdition, error: editionError } = await supabase
    .from("editions")
    .select("id, name")
    .eq("guideline_type", guidelineType)
    .eq("is_current", true)
    .single();

  if (editionError || !currentEdition) {
    return { ok: false, message: `No current ${guidelineType} edition is published yet.` };
  }
  const edition = currentEdition as unknown as { id: number; name: string };

  const { data: project } = await supabase
    .from("projects")
    .select("edition_lock_id, lock_event")
    .eq("id", projectId)
    .single();
  const existing = project as unknown as { edition_lock_id: number | null; lock_event: string } | null;

  const projectsTable = supabase.from("projects") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await projectsTable
    .update({
      edition_lock_id: edition.id,
      lock_date: new Date().toISOString().slice(0, 10),
      // Only set on first lock — a later adoption keeps the original
      // triggering event per WBS 6.2.4.
      ...(existing?.edition_lock_id ? {} : { lock_event: "Schematic Design" }),
    })
    .eq("id", projectId);

  if (error) {
    return { ok: false, message: `Couldn't lock the edition: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return {
    ok: true,
    message: existing?.edition_lock_id
      ? `Adopted ${edition.name}. Team members will need to re-complete Edition Onboarding once that training exists.`
      : `Locked to ${edition.name} at Schematic Design.`,
  };
}
