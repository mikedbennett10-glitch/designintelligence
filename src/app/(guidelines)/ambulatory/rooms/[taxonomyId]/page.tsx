import Link from "next/link";

import RoomDataSheet from "@/components/guidelines/RoomDataSheet";
import RoomLockContextBanner from "@/components/guidelines/RoomLockContextBanner";
import type { VersionHistoryEntry } from "@/components/guidelines/VersionHistory";
import { getActiveProject } from "@/lib/projectContext";
import { createClient } from "@/lib/supabase/server";
import type { ProjectWithEdition } from "@/lib/types/projects";
import type {
  Room,
  RoomDecisionLogicItem,
  RoomDrawing,
  RoomEquipmentWithDetail,
  RoomFinishWithDetail,
  RoomFurnitureWithDetail,
  RoomIntentionalOmission,
  RoomPendingChange,
} from "@/lib/types/rooms";

interface RoomPageData {
  room: Room;
  editionName: string;
  decisionLogic: RoomDecisionLogicItem[];
  omissions: RoomIntentionalOmission[];
  finishes: RoomFinishWithDetail[];
  equipment: RoomEquipmentWithDetail[];
  furniture: RoomFurnitureWithDetail[];
  drawings: RoomDrawing[];
  versionHistory: VersionHistoryEntry[];
  lockContext: {
    projectNumber: string;
    lockedEditionName: string;
    changes: RoomPendingChange[];
  } | null;
}

async function getRoomPageData(
  taxonomyId: string,
  compareLive: boolean,
  activeProject: ProjectWithEdition | null
): Promise<RoomPageData | null> {
  const supabase = await createClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("taxonomy_id", taxonomyId)
    .single();

  if (roomError || !room) return null;
  const liveRoom = room as Room;

  // WBS 6.4.1: while in Project mode with a locked edition, a room data
  // sheet shows that edition's content, not the live row — unless the
  // viewer explicitly asked to compare against the current guideline.
  if (compareLive) activeProject = null;
  let resolvedRoom = liveRoom;
  let lockContext: RoomPageData["lockContext"] = null;

  if (activeProject?.edition_lock_id) {
    // Cast away the generated Database type's empty Functions map — it's
    // a placeholder until `supabase gen types` is run against a real
    // project; room_as_of_edition is a real SQL function (see the
    // edition-locked-fidelity migration).
    const rpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: unknown }>;
    const { data: snapshot } = await rpc("room_as_of_edition", {
      p_room_taxonomy_id: taxonomyId,
      p_edition_id: activeProject.edition_lock_id,
    });
    if (snapshot) resolvedRoom = snapshot as unknown as Room;

    const { data: pending } = await supabase
      .from("room_pending_changes")
      .select("*")
      .eq("room_taxonomy_id", taxonomyId)
      .gt("changed_in_edition_date", activeProject.locked_edition_date ?? "1900-01-01");

    lockContext = {
      projectNumber: activeProject.procore_project_number,
      lockedEditionName: activeProject.locked_edition_name ?? "the locked edition",
      changes: (pending ?? []) as unknown as RoomPendingChange[],
    };
  }

  const [
    { data: edition },
    { data: decisionLogic },
    { data: omissions },
    { data: finishes },
    { data: equipment },
    { data: furniture },
    { data: drawings },
    { data: editionChanges },
  ] = await Promise.all([
    supabase
      .from("editions")
      .select("name")
      .eq("id", resolvedRoom.edition_id)
      .single() as unknown as Promise<{ data: { name: string } | null }>,
    supabase
      .from("room_decision_logic")
      .select("*")
      .eq("room_taxonomy_id", taxonomyId)
      .order("sort_order"),
    supabase
      .from("room_intentional_omissions")
      .select("*")
      .eq("room_taxonomy_id", taxonomyId)
      .order("sort_order"),
    supabase
      .from("room_finishes")
      .select("*, finish:finishes(code, product_type, description, manufacturer, product_name, color)")
      .eq("room_taxonomy_id", taxonomyId)
      .order("sort_order"),
    supabase
      .from("room_equipment")
      .select("*, equipment:equipment(taxonomy_id, name, category, responsibility, manufacturer, model)")
      .eq("room_taxonomy_id", taxonomyId)
      .order("sort_order"),
    supabase
      .from("room_furniture")
      .select("*, furniture:furniture(taxonomy_id, name, category, responsibility, manufacturer, model)")
      .eq("room_taxonomy_id", taxonomyId)
      .order("sort_order"),
    supabase
      .from("room_drawings")
      .select("*")
      .eq("room_taxonomy_id", taxonomyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("edition_changes")
      .select("*, edition:editions(name)")
      .eq("room_taxonomy_id", taxonomyId)
      .order("created_at", { ascending: false }),
  ]);

  const versionHistory: VersionHistoryEntry[] = (
    (editionChanges ?? []) as (Record<string, unknown> & { edition: { name: string } | null })[]
  ).map((c) => ({
    ...(c as unknown as VersionHistoryEntry),
    edition_name: c.edition?.name ?? "",
  }));

  return {
    room: resolvedRoom,
    editionName: edition?.name ?? "Unknown edition",
    decisionLogic: (decisionLogic ?? []) as RoomDecisionLogicItem[],
    omissions: (omissions ?? []) as RoomIntentionalOmission[],
    finishes: (finishes ?? []) as unknown as RoomFinishWithDetail[],
    equipment: (equipment ?? []) as unknown as RoomEquipmentWithDetail[],
    furniture: (furniture ?? []) as unknown as RoomFurnitureWithDetail[],
    drawings: (drawings ?? []) as RoomDrawing[],
    versionHistory,
    lockContext,
  };
}

export default async function RoomDataSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ taxonomyId: string }>;
  searchParams: Promise<{ compareLive?: string }>;
}) {
  const { taxonomyId } = await params;
  const { compareLive } = await searchParams;
  const activeProject = await getActiveProject();

  let data: RoomPageData | null = null;
  let loadError: string | null = null;

  try {
    data = await getRoomPageData(taxonomyId, compareLive === "1", activeProject);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this room.";
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
        Couldn&apos;t load room {taxonomyId}: {loadError}
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <p style={{ color: "var(--muted)" }}>
          Room <code style={{ fontFamily: "monospace" }}>{taxonomyId}</code> isn&apos;t available.
          It may not exist, may not be published yet, or you may need to sign in to view it.
        </p>
      </div>
    );
  }

  return (
    <div>
      {compareLive === "1" && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "0.6rem 1rem",
            background: "var(--csh-charcoal-lt)",
            border: "1px solid var(--border-strong)",
            borderRadius: "6px",
            fontSize: "0.82rem",
          }}
        >
          Viewing the current guideline, not your project&apos;s locked edition.{" "}
          <Link href={`/ambulatory/rooms/${taxonomyId}`} style={{ fontWeight: 600, color: "var(--csh-blue-dk)" }}>
            Back to locked view →
          </Link>
        </div>
      )}
      {data.lockContext && (
        <RoomLockContextBanner
          projectNumber={data.lockContext.projectNumber}
          lockedEditionName={data.lockContext.lockedEditionName}
          changes={data.lockContext.changes}
          taxonomyId={taxonomyId}
        />
      )}
      <RoomDataSheet
        {...data}
        actions={
          <>
            {activeProject && (
              <Link
                href={`/projects/${activeProject.id}/deviations/new?room=${taxonomyId}`}
                style={{
                  display: "inline-block",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid var(--csh-pink)",
                  color: "var(--csh-pink)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Submit a deviation request for this room
              </Link>
            )}
            <Link
              href={`/deviations/suggest?room=${taxonomyId}`}
              style={{
                display: "inline-block",
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                border: "1px solid var(--border-strong)",
                color: "var(--muted)",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Suggest a change to the current standard
            </Link>
          </>
        }
      />
    </div>
  );
}
