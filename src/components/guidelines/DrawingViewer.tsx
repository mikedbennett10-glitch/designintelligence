"use client";

import { useEffect, useState } from "react";

import SvgHotspotViewer from "@/components/guidelines/SvgHotspotViewer";
import { buildTaxonomyLookup } from "@/lib/svgLookup";
import type {
  AxonType,
  DrawingType,
  RoomDrawing,
  RoomEquipmentWithDetail,
  RoomFurnitureWithDetail,
} from "@/lib/types/rooms";

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
 * Which drawing types this room is expected to have.
 * A room's own `expected_drawing_types` wins when set -- for rooms whose
 * real documented view set doesn't fit one of the 3 axon_type buckets
 * (e.g. no north wall drawn, no axon). Otherwise falls back to axon_type:
 *   1 = Full: FP + RCP + 4 elevations + axon
 *   2 = Plan + elevations only (no axon)
 *   3 = Plan only
 */
function expectedDrawingTypes(
  axonType: AxonType | null,
  override: DrawingType[] | null
): DrawingType[] {
  if (override && override.length > 0) return override;
  if (axonType === 1) return ["fp", "rcp", "elev-n", "elev-s", "elev-e", "elev-w", "axon"];
  if (axonType === 2) return ["fp", "elev-n", "elev-s", "elev-e", "elev-w"];
  if (axonType === 3) return ["fp"];
  return [];
}

const statusColors: Record<RoomDrawing["status"], { bg: string; fg: string }> = {
  ready: { bg: "var(--brand-blue-lt)", fg: "var(--brand-blue-dk)" },
  pending: { bg: "var(--brand-charcoal-lt)", fg: "var(--muted)" },
  superseded: { bg: "var(--brand-pink-lt)", fg: "var(--brand-pink)" },
};

// Dev-schematic SVGs live as static files under /public/schematics and are
// referenced by file_name on a room_drawings row with is_schematic=TRUE —
// there's no storage bucket wired up for real drawing assets yet (unlike
// product-images), so this is the interim convention until one exists.
function findSchematicAsset(drawings: RoomDrawing[]): RoomDrawing | null {
  return (
    drawings.find((d) => d.is_schematic && d.file_name?.startsWith("/schematics/")) ?? null
  );
}

function findSchematicForType(drawings: RoomDrawing[], type: DrawingType): RoomDrawing | null {
  return (
    drawings.find(
      (d) => d.drawing_type === type && d.is_schematic && d.file_name?.startsWith("/schematics/")
    ) ?? null
  );
}

export default function DrawingViewer({
  drawings,
  axonType,
  expectedTypes = null,
  equipment = [],
  furniture = [],
}: {
  drawings: RoomDrawing[];
  axonType: AxonType | null;
  expectedTypes?: DrawingType[] | null;
  equipment?: RoomEquipmentWithDetail[];
  furniture?: RoomFurnitureWithDetail[];
}) {
  const expected = expectedDrawingTypes(axonType, expectedTypes);
  const byType = new Map<DrawingType, RoomDrawing[]>();
  for (const d of drawings) {
    const list = byType.get(d.drawing_type) ?? [];
    list.push(d);
    byType.set(d.drawing_type, list);
  }
  const types = expected.length > 0 ? expected : (Array.from(byType.keys()) as DrawingType[]);

  const schematic = findSchematicAsset(drawings);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [svgError, setSvgError] = useState<string | null>(null);

  useEffect(() => {
    if (!schematic?.file_name) {
      setSvgMarkup(null);
      setSvgError(null);
      return;
    }
    let cancelled = false;
    setSvgMarkup(null);
    setSvgError(null);
    fetch(schematic.file_name)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setSvgError("Couldn't load the schematic preview.");
      });
    return () => {
      cancelled = true;
    };
  }, [schematic?.file_name]);

  if (types.length === 0) {
    return (
      <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
        No drawing scope defined for this room (axon_type not set).
      </p>
    );
  }

  return (
    <div>
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
          const thumbnail = findSchematicForType(drawings, type);
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
                  background: "var(--brand-charcoal-lt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--hint)",
                  fontSize: "0.75rem",
                  overflow: "hidden",
                }}
              >
                {thumbnail?.file_name ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static /public schematic, not an optimizable remote image
                  <img
                    src={thumbnail.file_name}
                    alt={DRAWING_LABELS[type]}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : latest?.gcs_path ? (
                  "Asset on file"
                ) : (
                  "Not yet available"
                )}
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

      {schematic && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <h3 style={{ fontSize: "0.9rem", margin: 0 }}>
              Interactive preview — {DRAWING_LABELS[schematic.drawing_type]}
            </h3>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "0.1rem 0.5rem",
                borderRadius: "999px",
                background: "var(--brand-charcoal-lt)",
                color: "var(--muted)",
              }}
            >
              dev schematic, not production artwork
            </span>
          </div>
          {svgMarkup ? (
            <SvgHotspotViewer svgMarkup={svgMarkup} lookup={buildTaxonomyLookup(equipment, furniture)} />
          ) : svgError ? (
            <p style={{ color: "var(--hint)", fontSize: "0.82rem" }}>{svgError}</p>
          ) : (
            <p style={{ color: "var(--hint)", fontSize: "0.82rem" }}>Loading…</p>
          )}
        </div>
      )}
    </div>
  );
}
