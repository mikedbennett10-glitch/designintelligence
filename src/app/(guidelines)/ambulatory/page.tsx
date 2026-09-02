import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

interface RoomCardData {
  taxonomy_id: string;
  name: string;
  zone: string;
  section: string;
  production_ready: number;
  total_drawings: number;
}

async function getAmbulatoryRooms(): Promise<RoomCardData[]> {
  const supabase = await createClient();

  const [{ data: rooms, error: roomsError }, { data: drawingStatus, error: statusError }] =
    await Promise.all([
      supabase
        .from("rooms")
        .select("taxonomy_id, name, zone, section, sort_order")
        .eq("guideline_type", "AMBULATORY")
        .order("section")
        .order("sort_order"),
      supabase
        .from("room_drawing_status")
        .select("taxonomy_id, production_ready, total_drawings"),
    ]);

  if (roomsError) throw roomsError;
  if (statusError) throw statusError;

  type DrawingStatusRow = {
    taxonomy_id: string;
    production_ready: number;
    total_drawings: number;
  };
  type RoomRow = {
    taxonomy_id: string;
    name: string;
    zone: string;
    section: string;
    sort_order: number | null;
  };

  const statusByRoom = new Map(
    ((drawingStatus ?? []) as DrawingStatusRow[]).map((s) => [s.taxonomy_id, s])
  );

  return ((rooms ?? []) as RoomRow[]).map((room) => {
    const status = statusByRoom.get(room.taxonomy_id);
    return {
      taxonomy_id: room.taxonomy_id,
      name: room.name,
      zone: room.zone,
      section: room.section,
      production_ready: status?.production_ready ?? 0,
      total_drawings: status?.total_drawings ?? 0,
    };
  });
}

function groupBySection(rooms: RoomCardData[]) {
  const bySection = new Map<string, RoomCardData[]>();
  for (const room of rooms) {
    const list = bySection.get(room.section) ?? [];
    list.push(room);
    bySection.set(room.section, list);
  }
  return Array.from(bySection.entries());
}

export default async function AmbulatoryOverviewPage() {
  let rooms: RoomCardData[] = [];
  let loadError: string | null = null;

  try {
    rooms = await getAmbulatoryRooms();
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Unable to load room data. Check Supabase configuration and sign-in state.";
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Ambulatory Design Guidelines</h1>
        <p style={{ color: "var(--muted)", maxWidth: "60ch" }}>
          Room data sheets, prototype plans, and standards for ambulatory
          facility design.
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
          Couldn&apos;t load room data: {loadError}
        </div>
      )}

      {!loadError && rooms.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          No published rooms are visible yet. Rooms are only readable by
          signed-in users, so this is expected until authentication and RLS
          are wired up.
        </p>
      )}

      {groupBySection(rooms).map(([section, sectionRooms]) => (
        <section key={section} style={{ marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {section}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {sectionRooms.map((room) => (
              <RoomCard key={room.taxonomy_id} room={room} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RoomCard({ room }: { room: RoomCardData }) {
  return (
    <Link
      href={`/ambulatory/rooms/${room.taxonomy_id}`}
      style={{
        display: "block",
        padding: "1rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        textDecoration: "none",
        color: "var(--text)",
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
      <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{room.name}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}
      >
        <span
          style={{
            padding: "0.15rem 0.5rem",
            borderRadius: "999px",
            background: "var(--csh-blue-lt)",
            color: "var(--csh-blue-dk)",
          }}
        >
          {room.zone}
        </span>
        <span>
          Drawings: {room.production_ready}/{room.total_drawings} ready
        </span>
      </div>
    </Link>
  );
}
