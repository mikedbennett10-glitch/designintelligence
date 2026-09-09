import { createClient } from "@/lib/supabase/server";

interface RoomCardData {
  taxonomy_id: string;
  name: string;
  zone: string;
  section: string;
}

async function getBuildingPerformanceRooms(): Promise<RoomCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("taxonomy_id, name, zone, section, sort_order")
    .eq("guideline_type", "BUILDING_PERFORMANCE")
    .order("section")
    .order("sort_order");

  if (error) throw error;

  type RoomRow = {
    taxonomy_id: string;
    name: string;
    zone: string;
    section: string;
  };
  return (data ?? []) as RoomRow[];
}

export default async function BuildingPerformanceOverviewPage() {
  let rooms: RoomCardData[] = [];
  let loadError: string | null = null;

  try {
    rooms = await getBuildingPerformanceRooms();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load content.";
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Building Performance Guidelines</h1>
        <p style={{ color: "var(--muted)", maxWidth: "60ch" }}>
          Envelope, systems, and sustainability standards for CommonSpirit Health facilities.
        </p>
      </div>

      {loadError && (
        <div
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            background: "var(--csh-pink-lt)",
            border: "1px solid var(--csh-pink)",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          Couldn&apos;t load content: {loadError}
        </div>
      )}

      {!loadError && rooms.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          Building Performance content has not been published yet. This guideline track has the
          same underlying structure as Ambulatory and Acute and is ready to receive content.
        </p>
      )}

      {rooms.length > 0 && (
        // Room data sheet detail pages (the equivalent of
        // /ambulatory/rooms/[taxonomyId]) don't exist for this guideline
        // type yet — cards are informational only until that's built.
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {rooms.map((room) => (
            <div
              key={room.taxonomy_id}
              style={{
                padding: "1rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  color: "var(--muted)",
                  marginBottom: "0.25rem",
                }}
              >
                {room.taxonomy_id}
              </div>
              <div style={{ fontWeight: 600 }}>{room.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
