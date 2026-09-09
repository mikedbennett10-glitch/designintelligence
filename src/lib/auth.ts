import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  email: string;
  displayName: string;
  tier: "internal_standard" | "external_project" | "external_review" | "administrative";
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
      .select("email, display_name, tier")
      .eq("email", authUser.email)
      .single();

    const row = profile as CurrentUser | null;
    return row ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user?.tier === "administrative" ? user : null;
}
