"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { enqueueDeviationDecisionNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";
import type { DeviationStatus } from "@/lib/types/deviations";

const STATUS_LABELS: Record<DeviationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  approved_with_conditions: "Approved with conditions",
  denied: "Denied",
};

export interface DecideResult {
  ok: boolean;
  message: string;
}

/**
 * Records a Platform Owner decision on a deviation request (WBS 7.2.2).
 * Runs under the admin's own session — the admin_decide_deviation RLS
 * policy (is_admin(), FOR UPDATE) enforces who can call this; requireAdmin
 * here is a UI-level guard for a clear error message, not the actual
 * security boundary.
 */
export async function decideDeviation(
  deviationId: number,
  status: DeviationStatus,
  decisionText: string,
  conditions: string
): Promise<DecideResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }
  if (status === "pending") {
    return { ok: false, message: "Choose approved, approved with conditions, or denied." };
  }
  if (!decisionText.trim()) {
    return { ok: false, message: "A decision explanation is required." };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const deviationsTable = supabase.from("deviations") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await deviationsTable
    .update({
      status,
      decision_text: decisionText.trim(),
      conditions: status === "approved_with_conditions" ? conditions.trim() : null,
      decided_by: user?.email,
      decided_at: new Date().toISOString(),
    })
    .eq("id", deviationId);

  if (error) {
    return { ok: false, message: `Couldn't save the decision: ${error.message}` };
  }

  // Notify the requester of the outcome. Fetch the fields needed to
  // compose the message; if this lookup fails, the decision itself is
  // still saved — a missing notification isn't worth failing the whole
  // action over.
  try {
    const deviationTable = supabase.from("deviations") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          single: () => Promise<{
            data: {
              reference_number: string | null;
              submitted_by: string;
              standard_element: string;
              room_taxonomy_id: string;
            } | null;
          }>;
        };
      };
    };
    const { data: deviation } = await deviationTable
      .select("reference_number, submitted_by, standard_element, room_taxonomy_id")
      .eq("id", deviationId)
      .single();

    if (deviation) {
      const ref = deviation.reference_number ?? `#${deviationId}`;
      await enqueueDeviationDecisionNotification({
        deviationId,
        recipientEmail: deviation.submitted_by,
        subject: `Deviation ${ref} — ${STATUS_LABELS[status]}`,
        body: [
          `Your deviation request ${ref} regarding "${deviation.standard_element}" on ${deviation.room_taxonomy_id} has been decided.`,
          "",
          `Decision: ${STATUS_LABELS[status]}`,
          "",
          decisionText.trim(),
          status === "approved_with_conditions" && conditions.trim() ? `\nConditions: ${conditions.trim()}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }
  } catch {
    // Fail soft — see comment above.
  }

  revalidatePath("/admin/deviations");
  return { ok: true, message: "Decision recorded." };
}
