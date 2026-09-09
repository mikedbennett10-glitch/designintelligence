"use client";

import { useMemo, useState } from "react";

import type { FurnitureWithUsage } from "@/lib/types/rooms";

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

export default function FurnitureRepository({
  furniture,
  initialQuery = "",
}: {
  furniture: FurnitureWithUsage[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(furniture.map((f) => f.category).filter(Boolean))).sort() as string[],
    [furniture]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return furniture.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      return [f.taxonomy_id, f.name, f.manufacturer, f.model, f.category, f.subcategory]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [furniture, query, category]);

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
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
        {filtered.length} of {furniture.length} items
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
                  No furniture matches this search.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: "0.78rem" }}>{f.taxonomy_id}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{f.name}</td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {[f.manufacturer, f.model].filter(Boolean).join(" — ") || "—"}
                  </td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {[f.category, f.subcategory].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td style={{ ...td, color: "var(--muted)" }}>{f.responsibility}</td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {f.usedInRooms.length === 0
                      ? "Not yet assigned"
                      : f.usedInRooms.map((r) => r.name).join(", ")}
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
