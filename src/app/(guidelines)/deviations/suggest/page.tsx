import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import DeviationRequestForm from "../../projects/[id]/deviations/new/DeviationRequestForm";

interface SuggestionFormContext {
  room: { taxonomy_id: string; name: string; guideline_type: string };
  editionId: number;
  editionName: string;
}

async function getSuggestionFormContext(roomTaxonomyId: string): Promise<SuggestionFormContext | null> {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("taxonomy_id, name, guideline_type")
    .eq("taxonomy_id", roomTaxonomyId)
    .single();

  if (!room) return null;
  const typedRoom = room as { taxonomy_id: string; name: string; guideline_type: string };

  const { data: edition } = await supabase
    .from("editions")
    .select("id, name")
    .eq("guideline_type", typedRoom.guideline_type)
    .eq("is_current", true)
    .single();

  if (!edition) return null;
  const typedEdition = edition as { id: number; name: string };

  return { room: typedRoom, editionId: typedEdition.id, editionName: typedEdition.name };
}

export default async function SuggestDeviationPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room: roomTaxonomyId } = await searchParams;
  if (!roomTaxonomyId) notFound();

  let context: SuggestionFormContext | null = null;
  let loadError: string | null = null;

  try {
    context = await getSuggestionFormContext(roomTaxonomyId);
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
        Couldn&apos;t load this form: {loadError}
      </div>
    );
  }

  if (!context) {
    return (
      <p style={{ color: "var(--muted)" }}>
        Couldn&apos;t find this room, or its guideline type has no current edition published yet.
      </p>
    );
  }

  const { room, editionId, editionName } = context;

  return (
    <div style={{ maxWidth: "560px" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Suggest a change to the standard</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.75rem" }}>
        This isn&apos;t tied to a specific project — it&apos;s a suggestion against the current
        published edition. An administrator will review it the same way as a project deviation
        request.
      </p>
      <DeviationRequestForm
        projectId={null}
        roomTaxonomyId={room.taxonomy_id}
        roomName={room.name}
        editionId={editionId}
        editionName={editionName}
        submitLabel="Submit suggestion"
      />
    </div>
  );
}
