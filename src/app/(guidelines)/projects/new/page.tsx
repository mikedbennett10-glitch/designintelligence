import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import ProjectRegistrationForm, { type RoomOption } from "./ProjectRegistrationForm";

async function getAmbulatoryRooms(): Promise<RoomOption[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("rooms")
      .select("taxonomy_id, name, section")
      .eq("guideline_type", "AMBULATORY")
      .order("section")
      .order("sort_order");
    return (data ?? []) as RoomOption[];
  } catch {
    return [];
  }
}

export default async function NewProjectPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>
          You need administrative access to register a project. Sign in with an administrative
          account, or ask the Platform Owner.
        </p>
      </div>
    );
  }

  const rooms = await getAmbulatoryRooms();

  return (
    <div>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Register project</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.75rem", maxWidth: "60ch" }}>
        DIP holds only what has no home in Procore (WBS 6.1.1) — everything else about the
        project is read from Procore once that integration exists. The edition lock happens
        separately at Schematic Design, not here.
      </p>
      <ProjectRegistrationForm rooms={rooms} />
    </div>
  );
}
