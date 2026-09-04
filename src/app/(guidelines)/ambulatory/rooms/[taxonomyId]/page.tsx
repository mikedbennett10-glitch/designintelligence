import RoomDataSheet from "@/components/guidelines/RoomDataSheet";
import type { VersionHistoryEntry } from "@/components/guidelines/VersionHistory";
import { createClient } from "@/lib/supabase/server";
import type {
  Room,
  RoomDecisionLogicItem,
  RoomDrawing,
  RoomEquipmentWithDetail,
  RoomFinishWithDetail,
  RoomFurnitureWithDetail,
  RoomIntentionalOmission,
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
}

async function getRoomPageData(taxonomyId: string): Promise<RoomPageData | null> {
  const supabase = await createClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("taxonomy_id", taxonomyId)
    .single();

  if (roomError || !room) return null;
  const typedRoom = room as Room;

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
      .eq("id", typedRoom.edition_id)
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
    room: typedRoom,
    editionName: edition?.name ?? "Unknown edition",
    decisionLogic: (decisionLogic ?? []) as RoomDecisionLogicItem[],
    omissions: (omissions ?? []) as RoomIntentionalOmission[],
    finishes: (finishes ?? []) as unknown as RoomFinishWithDetail[],
    equipment: (equipment ?? []) as unknown as RoomEquipmentWithDetail[],
    furniture: (furniture ?? []) as unknown as RoomFurnitureWithDetail[],
    drawings: (drawings ?? []) as RoomDrawing[],
    versionHistory,
  };
}

export default async function RoomDataSheetPage({
  params,
}: {
  params: Promise<{ taxonomyId: string }>;
}) {
  const { taxonomyId } = await params;

  let data: RoomPageData | null = null;
  let loadError: string | null = null;

  try {
    data = await getRoomPageData(taxonomyId);
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

  return <RoomDataSheet {...data} />;
}
