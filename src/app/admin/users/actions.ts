"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface ToggleResult {
  ok: boolean;
  message: string;
}

/**
 * Flips is_content_editor for an existing user. Admin-only (not exposed to
 * content editors themselves) -- re-checks server-side regardless of what
 * the page already showed, same as the other admin actions in this app.
 */
export async function setContentEditor(email: string, next: boolean): Promise<ToggleResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Administrators only." };

  const supabase = createServiceRoleClient();
  const usersTable = supabase.from("users") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await usersTable.update({ is_content_editor: next }).eq("email", email);
  if (error) return { ok: false, message: `Couldn't update ${email}: ${error.message}` };

  revalidatePath("/admin/users");
  return { ok: true, message: "Updated." };
}
