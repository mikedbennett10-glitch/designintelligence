"use client";

import { useMemo, useState } from "react";

import type { EquipmentWithUsage } from "@/lib/types/rooms";

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--muted)",
  padding: "0.6rem 0.85rem",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "0.65rem 0.85rem",
  borderBottom: "1px solid var(--border)",
  fontSize: "0.85rem",
  verticalAlign: "top",
};

const controlStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  fontSize: "0.85rem",
};

const respColors: Record<string, { bg: string; fg: string }> = {
  OFOI: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  OFCI: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
  "IT/OFOI": { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  "IT/OFCI": { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
};

function RespBadge({ responsibility }: { responsibility: string }) {
  const c = respColors[responsibility] ?? { bg: "var(--csh-charcoal-lt)", fg: "var(--muted)" };
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "0.1rem 0.5rem",
        borderRadius: "999px",
        background: c.bg,
        color: c.fg,
      }}
    >
      {responsibility}
    </span>
  );
}

export default function EquipmentRepository({
  equipment,
  initialQuery = "",
}: {
  equipment: EquipmentWithUsage[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [responsibility, setResponsibility] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.category).filter(Boolean))).sort() as string[],
    [equipment]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return equipment.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (responsibility !== "all" && e.responsibility !== responsibility) return false;
      if (!q) return true;
      return [e.taxonomy_id, e.name, e.manufacturer, e.model, e.category]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [equipment, query, category, responsibility]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <input
          type="search"
          placeholder="Search item, manufacturer, model…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...controlStyle, flex: "1 1 260px" }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={controlStyle}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={responsibility}
          onChange={(e) => setResponsibility(e.target.value)}
          style={controlStyle}
        >
          <option value="all">All responsibility</option>
          <option value="OFOI">OFOI</option>
          <option value="OFCI">OFCI</option>
          <option value="IT/OFOI">IT/OFOI</option>
          <option value="IT/OFCI">IT/OFCI</option>
        </select>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
        {filtered.length} of {equipment.length} items
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--surface)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Taxonomy ID</th>
              <th style={th}>Item</th>
              <th style={th}>Manufacturer / Model</th>
              <th style={th}>Category</th>
              <th style={th}>Responsibility</th>
              <th style={th}>Used in</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...td, color: "var(--hint)", fontStyle: "italic" }}>
                  No equipment matches this search.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: "0.78rem" }}>{e.taxonomy_id}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{e.name}</td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {[e.manufacturer, e.model].filter(Boolean).join(" — ") || "—"}
                  </td>
                  <td style={{ ...td, color: "var(--muted)" }}>{e.category ?? "—"}</td>
                  <td style={td}>
                    <RespBadge responsibility={e.responsibility} />
                  </td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {e.usedInRooms.length === 0
                      ? "Not yet assigned"
                      : e.usedInRooms.map((r) => r.name).join(", ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
