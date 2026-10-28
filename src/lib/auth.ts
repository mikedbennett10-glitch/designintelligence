import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  email: string;
  displayName: string;
  tier: "internal_standard" | "external_project" | "external_review" | "administrative";
  isContentEditor: boolean;
}

/** The signed-in user's `public.users` profile, or null if signed out / not yet provisioned. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser?.email) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("email, display_name, tier, is_content_editor")
      .eq("email", authUser.email)
      .single();

    if (!profile) return null;
    const row = profile as {
      email: string;
      display_name: string;
      tier: CurrentUser["tier"];
      is_content_editor: boolean;
    };
    return {
      email: row.email,
      displayName: row.display_name,
      tier: row.tier,
      isContentEditor: row.is_content_editor,
    };
  } catch {
    return null;
  }
}

/**
 * Temporary diagnostic for the login-redirect-loop investigation. Reports
 * exactly where the pipeline breaks (no Supabase session vs. a session with
 * no readable `public.users` row) instead of collapsing both into `null`.
 */
export async function getCurrentUserDebug(): Promise<{
  hasAuthUser: boolean;
  authEmail: string | null;
  profileFound: boolean;
  profileError: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return {
      hasAuthUser: false,
      authEmail: null,
      profileFound: false,
      profileError: authError?.message ?? null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("email")
    .eq("email", authUser.email)
    .maybeSingle();

  return {
    hasAuthUser: true,
    authEmail: authUser.email,
    profileFound: Boolean(profile),
    profileError: profileError?.message ?? null,
  };
}

export async function requireAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user?.tier === "administrative" ? user : null;
}

/** Admins can always edit content; a non-admin needs the is_content_editor flag. */
export async function requireContentEditor(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user && (user.tier === "administrative" || user.isContentEditor) ? user : null;
}
