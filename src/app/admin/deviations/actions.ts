"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DeviationStatus } from "@/lib/types/deviations";

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

  revalidatePath("/admin/deviations");
  return { ok: true, message: "Decision recorded." };
}
