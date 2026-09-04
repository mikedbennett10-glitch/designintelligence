import type { AxonType } from "@/lib/types/rooms";
import type { DrawingType, RoomDrawing } from "@/lib/types/rooms";

const DRAWING_LABELS: Record<DrawingType, string> = {
  fp: "Floor Plan",
  rcp: "Reflected Ceiling Plan",
  "elev-n": "Elevation — North",
  "elev-s": "Elevation — South",
  "elev-e": "Elevation — East",
  "elev-w": "Elevation — West",
  axon: "Axonometric",
  det: "Detail",
};

/**
 * Which drawing types this room is expected to have, driven by axon_type:
 *   1 = Full: FP + RCP + 4 elevations + axon
 *   2 = Plan + elevations only (no axon)
 *   3 = Plan only
 */
function expectedDrawingTypes(axonType: AxonType | null): DrawingType[] {
  if (axonType === 1) return ["fp", "rcp", "elev-n", "elev-s", "elev-e", "elev-w", "axon"];
  if (axonType === 2) return ["fp", "elev-n", "elev-s", "elev-e", "elev-w"];
  if (axonType === 3) return ["fp"];
  return [];
}

const statusColors: Record<RoomDrawing["status"], { bg: string; fg: string }> = {
  ready: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  pending: { bg: "var(--csh-charcoal-lt)", fg: "var(--muted)" },
  superseded: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
};

export default function DrawingViewer({
  drawings,
  axonType,
}: {
  drawings: RoomDrawing[];
  axonType: AxonType | null;
}) {
  const expected = expectedDrawingTypes(axonType);
  const byType = new Map<DrawingType, RoomDrawing[]>();
  for (const d of drawings) {
    const list = byType.get(d.drawing_type) ?? [];
    list.push(d);
    byType.set(d.drawing_type, list);
  }
  const types = expected.length > 0 ? expected : (Array.from(byType.keys()) as DrawingType[]);

  if (types.length === 0) {
    return (
      <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
        No drawing scope defined for this room (axon_type not set).
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "1rem",
      }}
    >
      {types.map((type) => {
        const versions = byType.get(type) ?? [];
        const latest = versions[0];
        return (
          <div
            key={type}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--surface)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                aspectRatio: "4 / 3",
                background: "var(--csh-charcoal-lt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--hint)",
                fontSize: "0.75rem",
              }}
            >
              {latest?.gcs_path ? "Asset on file" : "Not yet available"}
            </div>
            <div style={{ padding: "0.6rem 0.75rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                {DRAWING_LABELS[type]}
              </div>
              {latest ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.72rem",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "999px",
                    background: statusColors[latest.status].bg,
                    color: statusColors[latest.status].fg,
                  }}
                >
                  {latest.status}
                  {latest.is_schematic ? " · schematic" : ""}
                  {latest.version ? ` · ${latest.version}` : ""}
                </div>
              ) : (
                <div style={{ fontSize: "0.72rem", color: "var(--hint)" }}>pending</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
