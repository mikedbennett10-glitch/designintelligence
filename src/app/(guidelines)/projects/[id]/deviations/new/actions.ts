"use server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface SubmitDeviationResult {
  ok: boolean;
  message: string;
  referenceNumber?: string;
}

/**
 * Submits a deviation request (WBS 7.1), or a general suggestion against
 * the current edition when projectId is null (no project context). Runs
 * under the caller's own session (not a service-role client) so the
 * member_submit_deviation RLS policy — (project_id IS NULL OR
 * is_project_member(project_id)) AND submitted_by = the caller's own
 * email — does the membership check for us; there's no separate
 * server-side membership check to keep in sync with that policy.
 *
 * reference_number is set by the deviation_reference_trigger AFTER
 * INSERT, so it isn't present on the row the INSERT itself returns —
 * this re-fetches by id to pick it up for the confirmation message
 * (WBS 7.1.3).
 */
export async function submitDeviation(
  _prev: SubmitDeviationResult | null,
  formData: FormData
): Promise<SubmitDeviationResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Sign in to submit a deviation request." };
  }

  const projectIdRaw = String(formData.get("projectId") ?? "").trim();
  const projectId = projectIdRaw ? Number(projectIdRaw) : null;
  const roomTaxonomyId = String(formData.get("roomTaxonomyId") ?? "").trim();
  const editionId = Number(formData.get("editionId"));
  const standardElement = String(formData.get("standardElement") ?? "").trim();
  const proposedAlternative = String(formData.get("proposedAlternative") ?? "").trim();
  const justification = String(formData.get("justification") ?? "").trim();

  if (!roomTaxonomyId || !standardElement || !proposedAlternative || !justification) {
    return { ok: false, message: "Fill in every field before submitting." };
  }

  const supabase = await createClient();
  const deviationsTable = supabase.from("deviations") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: number } | null; error: { message: string } | null }>;
      };
    };
  };

  const { data: inserted, error } = await deviationsTable
    .insert({
      project_id: projectId,
      room_taxonomy_id: roomTaxonomyId,
      edition_id: editionId,
      standard_element: standardElement,
      proposed_alternative: proposedAlternative,
      justification,
      submitted_by: user.email,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return {
      ok: false,
      message: `Couldn't submit the request: ${error?.message ?? "unknown error"}${
        projectId ? " You may need to be a member of this project." : ""
      }`,
    };
  }

  const { data: withReference } = await supabase
    .from("deviations")
    .select("reference_number")
    .eq("id", inserted.id)
    .single();
  const referenceNumber = (withReference as { reference_number: string } | null)?.reference_number;

  return {
    ok: true,
    message: referenceNumber
      ? `Submitted as ${referenceNumber}. The Platform Owner has been notified and will respond within 5 business days.`
      : "Submitted. The Platform Owner has been notified and will respond within 5 business days.",
    referenceNumber,
  };
}
