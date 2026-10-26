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

  const [selected, setSelected] = useState<DrawingType | null>(types[0] ?? null);
  const activeType = selected && types.includes(selected) ? selected : (types[0] ?? null);

  const activeLatest = activeType ? (byType.get(activeType)?.[0] ?? null) : null;
  const activeSchematic = activeType ? findSchematicForType(drawings, activeType) : null;

  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [svgError, setSvgError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSchematic?.file_name) {
      setSvgMarkup(null);
      setSvgError(null);
      return;
    }
    let cancelled = false;
    setSvgMarkup(null);
    setSvgError(null);
    fetch(activeSchematic.file_name)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setSvgError("Couldn't load this drawing.");
      });
    return () => {
      cancelled = true;
    };
  }, [activeSchematic?.file_name]);

  if (types.length === 0) {
    return (
      <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
        No drawing scope defined for this room (axon_type not set).
      </p>
    );
  }

  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
      <div
        style={{
          flex: "0 0 220px",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        {types.map((type) => {
          const latest = byType.get(type)?.[0];
          const isActive = type === activeType;
          return (
            <button
              key={type}
              onClick={() => setSelected(type)}
              style={{
                textAlign: "left",
                border: "1px solid " + (isActive ? "var(--brand-blue)" : "var(--border)"),
                background: isActive ? "var(--brand-blue-lt)" : "var(--surface)",
                borderRadius: "8px",
                padding: "0.55rem 0.7rem",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{DRAWING_LABELS[type]}</div>
              {latest ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.68rem",
                    padding: "0.05rem 0.45rem",
                    borderRadius: "999px",
                    marginTop: "0.3rem",
                    background: statusColors[latest.status].bg,
                    color: statusColors[latest.status].fg,
                  }}
                >
                  {latest.status}
                  {latest.is_schematic ? " · schematic" : ""}
                  {latest.version ? ` · ${latest.version}` : ""}
                </div>
              ) : (
                <div style={{ fontSize: "0.68rem", color: "var(--hint)", marginTop: "0.3rem" }}>
                  not yet available
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: "1 1 0%", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
          <h3 style={{ fontSize: "0.95rem", margin: 0 }}>
            {activeType ? DRAWING_LABELS[activeType] : ""}
          </h3>
          {activeSchematic && (
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
          )}
        </div>

        {activeSchematic ? (
          svgMarkup ? (
            <SvgHotspotViewer svgMarkup={svgMarkup} lookup={buildTaxonomyLookup(equipment, furniture)} />
          ) : svgError ? (
            <p style={{ color: "var(--hint)", fontSize: "0.82rem" }}>{svgError}</p>
          ) : (
            <p style={{ color: "var(--hint)", fontSize: "0.82rem" }}>Loading…</p>
          )
        ) : (
          <div
            style={{
              aspectRatio: "4 / 3",
              background: "var(--brand-charcoal-lt)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--hint)",
              fontSize: "0.85rem",
            }}
          >
            {activeLatest?.gcs_path ? "Asset on file" : "Not yet available"}
          </div>
        )}
      </div>
    </div>
  );
}
