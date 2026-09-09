import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import ProvisionUserForm, { type ProjectOption } from "./ProvisionUserForm";

async function getProjects(): Promise<ProjectOption[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, procore_project_number")
      .order("id", { ascending: false });
    return (data ?? []) as ProjectOption[];
  } catch {
    return [];
  }
}

export default async function ProvisionUserPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>
          You need administrative access to provision external users. Sign in with an
          administrative account, or ask the Platform Owner.
        </p>
      </div>
    );
  }

  const projects = await getProjects();

  return (
    <div>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Provision external user</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.75rem", maxWidth: "60ch" }}>
        Creates the DIP user record, optionally links it to a project, and sends a magic-link
        invite email. WBS 5.2.1 — the manual provisioning workflow used until the Procore
        directory sync (5.2.2) is implemented.
      </p>
      <ProvisionUserForm projects={projects} />
    </div>
  );
}
