import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import type { ProjectWithEdition } from "@/lib/types/projects";

export const PROJECT_CONTEXT_COOKIE = "dip_active_project";

/**
 * The project the signed-in user has switched into (WBS 6.4.1's "Project
 * mode"), or null if they're browsing in Reference mode. Fails soft to
 * null on any error — an unreadable/stale cookie should never break the
 * guidelines shell, it should just fall back to Reference mode.
 */
export async function getActiveProject(): Promise<ProjectWithEdition | null> {
  try {
    const cookieStore = await cookies();
    const projectId = cookieStore.get(PROJECT_CONTEXT_COOKIE)?.value;
    if (!projectId) return null;

    const supabase = await createClient();
    const { data: project } = await supabase
      .from("projects")
      .select("*, locked_edition:editions(name, edition_date)")
      .eq("id", Number(projectId))
      .single();

    if (!project) return null;

    const row = project as unknown as Record<string, unknown> & {
      locked_edition: { name: string; edition_date: string } | null;
    };

    return {
      ...(row as unknown as ProjectWithEdition),
      locked_edition_name: row.locked_edition?.name ?? null,
      locked_edition_date: row.locked_edition?.edition_date ?? null,
    };
  } catch {
    return null;
  }
}
