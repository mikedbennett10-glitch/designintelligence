import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import DeviationRequestForm from "./DeviationRequestForm";

interface DeviationFormContext {
  project: { edition_lock_id: number | null; procore_project_number: string };
  room: { taxonomy_id: string; name: string; edition_id: number };
  editionName: string;
}

async function getDeviationFormContext(
  projectId: number,
  roomTaxonomyId: string
): Promise<DeviationFormContext | null> {
  const supabase = await createClient();

  const [{ data: project }, { data: room }] = await Promise.all([
    supabase.from("projects").select("edition_lock_id, procore_project_number").eq("id", projectId).single(),
    supabase.from("rooms").select("taxonomy_id, name, edition_id").eq("taxonomy_id", roomTaxonomyId).single(),
  ]);

  if (!project || !room) return null;

  const typedProject = project as { edition_lock_id: number | null; procore_project_number: string };
  const typedRoom = room as { taxonomy_id: string; name: string; edition_id: number };

  // WBS 7.1.1: edition at time of submission. If the project is locked,
  // that's the governing edition for the deviation record; otherwise fall
  // back to the room's own current edition.
  const editionId = typedProject.edition_lock_id ?? typedRoom.edition_id;
  const { data: edition } = await supabase.from("editions").select("name").eq("id", editionId).single();

  return {
    project: typedProject,
    room: typedRoom,
    editionName: (edition as { name: string } | null)?.name ?? "Unknown edition",
  };
}

export default async function NewDeviationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const { id } = await params;
  const { room: roomTaxonomyId } = await searchParams;
  const projectId = Number(id);
  if (!Number.isFinite(projectId) || !roomTaxonomyId) notFound();

  let context: DeviationFormContext | null = null;
  let loadError: string | null = null;

  try {
    context = await getDeviationFormContext(projectId, roomTaxonomyId);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this form.";
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--csh-pink-lt)",
          border: "1px solid var(--csh-pink)",
          borderRadius: "6px",
          fontSize: "0.875rem",
        }}
      >
        Couldn&apos;t load the deviation request form: {loadError}
      </div>
    );
  }

  if (!context) {
    return (
      <p style={{ color: "var(--muted)" }}>
        Couldn&apos;t find this project or room. It may not exist, or you may not have access to
        it.
      </p>
    );
  }

  const { project, room, editionName } = context;

  return (
    <div style={{ maxWidth: "560px" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Submit deviation request</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.75rem" }}>
        For project <strong style={{ fontFamily: "monospace" }}>{project.procore_project_number}</strong>.
      </p>
      <DeviationRequestForm
        projectId={projectId}
        roomTaxonomyId={room.taxonomy_id}
        roomName={room.name}
        editionId={project.edition_lock_id ?? room.edition_id}
        editionName={editionName}
      />
    </div>
  );
}
