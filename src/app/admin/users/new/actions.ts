"use server";

import { headers } from "next/headers";

import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface ProvisionResult {
  ok: boolean;
  message: string;
}

const VALID_TIERS = ["external_project", "external_review", "administrative"] as const;

/**
 * Provisions an external user (WBS 5.2.1): PM submits an access request,
 * the Platform Owner runs this to create the `users` row (and the
 * `project_members` link, if a project is given), then invites the
 * person via Supabase's admin API — which creates their auth identity and
 * sends the welcome email even though self-signup is disabled.
 *
 * Re-checks admin status server-side regardless of what the page already
 * showed: this action uses the service-role client, which bypasses RLS
 * entirely, so it cannot rely on the caller having gotten past a UI gate.
 */
export async function provisionExternalUser(
  _prev: ProvisionResult | null,
  formData: FormData
): Promise<ProvisionResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim() || null;
  const tier = String(formData.get("tier") ?? "");
  const projectId = String(formData.get("projectId") ?? "").trim();
  const procoreRole = String(formData.get("procoreRole") ?? "").trim() || null;
  const expiresInDays = Number(formData.get("expiresInDays") ?? 90);

  if (!email || !displayName) {
    return { ok: false, message: "Name and email are required." };
  }
  if (!VALID_TIERS.includes(tier as (typeof VALID_TIERS)[number])) {
    return { ok: false, message: "Choose a valid access tier." };
  }

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const supabase = createServiceRoleClient();

  // Cast away the generated Database type's empty Tables map — it's a
  // placeholder until `supabase gen types` is run against a real project.
  const usersTable = supabase.from("users") as unknown as {
    upsert: (
      values: Record<string, unknown>,
      opts: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };
  const projectMembersTable = supabase.from("project_members") as unknown as {
    upsert: (
      values: Record<string, unknown>,
      opts: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };

  const { error: userError } = await usersTable.upsert(
    {
      email,
      display_name: displayName,
      tier,
      organization,
      is_active: true,
      expires_at: expiresAt,
    },
    { onConflict: "email" }
  );

  if (userError) {
    return { ok: false, message: `Couldn't create the user record: ${userError.message}` };
  }

  if (projectId) {
    const { error: memberError } = await projectMembersTable.upsert(
      {
        project_id: Number(projectId),
        user_email: email,
        procore_role: procoreRole,
        dip_tier: tier,
        expires_at: expiresAt,
      },
      { onConflict: "project_id,user_email" }
    );
    if (memberError) {
      return {
        ok: false,
        message: `User record created, but couldn't link the project: ${memberError.message}`,
      };
    }
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const redirectTo = `${protocol}://${host}/auth/callback`;

  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { full_name: displayName },
  });

  if (inviteError) {
    return {
      ok: false,
      message: `User record created, but the invite email failed to send: ${inviteError.message}. They can still be provisioned manually in the Supabase dashboard.`,
    };
  }

  return { ok: true, message: `Invited ${displayName} (${email}) — welcome email sent.` };
}
